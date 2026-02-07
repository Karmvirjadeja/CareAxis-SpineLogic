import os
import json
import time
import chromadb
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from google import genai
from google.genai import types
from datetime import datetime

# ==========================================
# 1. CONFIGURATION
# ==========================================
load_dotenv()
app = FastAPI()

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI CONFIGURATION
MODEL_ID = "gemini-3-flash-preview" 
EMBEDDING_MODEL = "models/text-embedding-004" 

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

# DATABASE CONNECTION
# We share the same client for both Text and Vision memory
chroma_client = chromadb.PersistentClient(path="./ai_memory")

# Collection 1: Text Rules (Learned from Triage Disagreements)
rule_collection = chroma_client.get_or_create_collection(name="triage_pearls")

# Collection 2: Gold Standard Cases (Text & Vision Agreements)
gold_case_collection = chroma_client.get_or_create_collection(name="gold_standard_cases")

# Collection 3: Visual Rules (Learned from Scan Disagreements)
correction_collection = chroma_client.get_or_create_collection(name="visual_corrections")


# ==========================================
# 2. DATA MODELS
# ==========================================
class PatientData(BaseModel):
    details: Dict[str, Any]
    medicalHistory: Dict[str, Any]
    examination: Dict[str, Any]
    expectations: Dict[str, Any]
    assistantInput: Dict[str, Any]

class TriageOutput(BaseModel):
    scans: List[str]
    reasoning: str
    urgency: str
    medical_diagnosis: List[str]
    safety_override: Optional[str] = None
    Additional_comments: str
    cited_rules: List[str] = []


# ==========================================
# 3. HELPER FUNCTIONS
# ==========================================
def get_institutional_memory(patient_summary: str):
    """ Retrieves text-based triage rules using embeddings """
    try:
        # 1. Generate Embedding
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=patient_summary
        )
        embedding = result.embeddings[0].values
        
        # 2. Query Database
        rule_results = rule_collection.query(query_embeddings=[embedding], n_results=5)
        case_results = gold_case_collection.query(query_embeddings=[embedding], n_results=1)
        
        memory_text = ""
        overrides = []
        standard_rules = []

        if rule_results['documents']:
            for i, doc in enumerate(rule_results['documents'][0]):
                meta = rule_results['metadatas'][0][i]
                confidence = meta.get('confidence', 1.0)
                priority = meta.get('priority', 'standard')
                
                if priority == "CRITICAL_OVERRIDE":
                    overrides.append(f"!!! CRITICAL: {doc} (Learned Correction)")
                else:
                    standard_rules.append(f"- {doc} (Conf: {confidence:.1f})")

        if overrides:
            memory_text += "🚨 *** CRITICAL MEDICAL OVERRIDES (MUST FOLLOW) ***\n" + "\n".join(overrides) + "\n\n"
        
        if standard_rules:
            memory_text += "CLINICAL GUIDELINES:\n" + "\n".join(standard_rules) + "\n\n"
            
        if case_results['documents'] and case_results['documents'][0]:
            memory_text += f"SIMILAR PAST CASE (PRECEDENT):\n{case_results['documents'][0][0]}\n"
            
        return memory_text if memory_text else "No specific past records found."

    except Exception as e:
        print(f"Memory Retrieval Error: {e}")
        return "Memory Retrieval Failed."


# ==========================================
# 4. API ENDPOINTS (TEXT BOT)
# ==========================================

@app.post("/triage", response_model=TriageOutput)
async def triage_patient(patient: PatientData):
    age = patient.details.get('age', 'Unknown')
    gender = patient.details.get('gender', 'Unknown')
    complaint = patient.medicalHistory.get('chiefComplaint', 'Unknown')
    
    patient_text = f"""
    PATIENT: {age}yo {gender}.
    COMPLAINT: {complaint}.
    HISTORY: {patient.medicalHistory.get('historyDuration', 'Unknown')}.
    """

    memory_context = get_institutional_memory(patient_text)

    prompt = f"""
    Act as a Senior Neuro-Council (Resident + Critic).
    [PATIENT DATA]
    {patient_text}
    [INSTITUTIONAL MEMORY]
    {memory_context}
    [INSTRUCTION]
    1. Check MEMORY first. "CRITICAL OVERRIDE" trumps all other logic.
    2. Output the specific Rules you used in 'cited_rules'.
    [OUTPUT JSON]
    {{
      "scans": ["..."],
      "reasoning": "...",
      "urgency": "Routine/Urgent",
      "medical_diagnosis": ["..."],
      "safety_override": null,
      "Additional_comments": "...",
      "cited_rules": []
    }}
    """
    
    # Retry Logic for robustness (Handle 503/429 errors)
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"⚠️ Attempt {attempt + 1} failed: {e}")
            if "503" in str(e) or "429" in str(e):
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
            return {
                "scans": ["Clinical Judgment Required"],
                "reasoning": "⚠️ System temporarily unavailable.",
                "urgency": "Routine",
                "medical_diagnosis": ["System Unavailable"],
                "Additional_comments": str(e),
                "cited_rules": []
            }


@app.post("/doctor_agree")
async def doctor_agree(request: Request):
    """ Handles Doctor Agreement -> Stores 'Gold Standard' Case """
    try:
        payload = await request.json()
        patient_data = payload.get('patient_data', {})
        ai_response = payload.get('ai_response', {})
        doctor_id = payload.get('doctor_id', 'doc_default')

        case_narrative = f"Case: {patient_data.get('fullName', 'Unknown')}. Dx: {ai_response.get('medical_diagnosis')}"
        
        # 1. Archive Case
        embedding_result = client.models.embed_content(model=EMBEDDING_MODEL, contents=case_narrative)
        embedding = embedding_result.embeddings[0].values
        
        gold_case_collection.add(
            ids=[f"gold_case_{datetime.now().timestamp()}"],
            documents=[case_narrative],
            embeddings=[embedding],
            metadatas=[{"validated_by": doctor_id, "timestamp": str(datetime.now())}]
        )

        # 2. Boost Rules
        cited_rules = ai_response.get('cited_rules', [])
        if cited_rules:
            for rule_text in cited_rules:
                rule_embed_result = client.models.embed_content(model=EMBEDDING_MODEL, contents=rule_text)
                rule_vector = rule_embed_result.embeddings[0].values

                results = rule_collection.query(query_embeddings=[rule_vector], n_results=1)
                
                if results['ids'] and results['ids'][0]:
                    rule_id = results['ids'][0][0]
                    meta = results['metadatas'][0][0]
                    new_conf = meta.get('confidence', 1.0) + 0.1
                    meta['confidence'] = new_conf
                    rule_collection.update(ids=[rule_id], metadatas=[meta])

        return {"status": "success", "message": "Memory Reinforced"}
    except Exception as e:
        print(f"🔥 Error in doctor_agree: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/submit_correction")
async def submit_correction(request: Request):
    """ Handles Doctor Disagreement -> Learns new Rule """
    try:
        payload = await request.json()
        correct_diagnosis = payload.get('correct_diagnosis', '')
        doctor_reasoning = payload.get('doctor_reasoning', '')
        
        learning_prompt = f"""
        CASE ERROR: AI was wrong.
        CORRECT DX: {correct_diagnosis}
        REASON: {doctor_reasoning}
        Create a generic IF-THEN medical rule starting with 'CRITICAL OVERRIDE:'.
        """
        resp = client.models.generate_content(model=MODEL_ID, contents=learning_prompt)
        new_rule = resp.text.strip()
        
        embedding_result = client.models.embed_content(model=EMBEDDING_MODEL, contents=new_rule)
        embedding = embedding_result.embeddings[0].values
        
        rule_collection.add(
            ids=[f"learned_rule_{datetime.now().timestamp()}"],
            documents=[new_rule],
            embeddings=[embedding],
            metadatas=[{"priority": "CRITICAL_OVERRIDE", "confidence": 5.0}]
        )
        return {"status": "success", "new_rule": new_rule}
    except Exception as e:
        print(f"🔥 Error in submit_correction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 5. API ENDPOINTS (VISION BOT - NEW!)
# ==========================================

DEEP_VISION_PROMPT = """
You are "Neuro-Vision," an expert AI Neuroradiologist.
You are analyzing MRI LUMBAR SPINE SCANS (Photos of films).

[CONTEXT 1: PATIENT CLINICAL HISTORY]
{patient_summary}

[CONTEXT 2: TRIAGE BOT HYPOTHESIS (The "Requisition")]
The Triage AI (Text-Based) has already assessed this patient:
- Suspected Diagnosis: {triage_diagnosis}
- Clinical Reasoning: {triage_reasoning}
- Doctor's Feedback/Agreement: {doctor_feedback}
(⚠️ INSTRUCTION: If the Doctor disagreed with the Triage Bot, prioritize the Doctor's opinion as the "True Clinical State".)

[CONTEXT 3: INSTITUTIONAL MEMORY]
{learned_rules}

[TASK: MULTIMODAL CORRELATION]
1. **Verify the Triage Hypothesis:** The Triage Bot suspected "{triage_diagnosis}". Do you see visual evidence for this?
   - Example: If Triage said "L5 Radiculopathy," do you see L4-L5 compression?
2. **Scan for Missed Pathology:** Did the Text Bot miss something because it couldn't see? (e.g., Spondylolisthesis, Hemangioma).
3. **Deep Analysis:**
   - Scan L1 to S1.
   - Comment on Alignment, Bone Marrow, Discs, and Nerves.

[OUTPUT JSON]
{{
  "scan_quality": "Readable/Suboptimal",
  "agreement_with_triage": "Yes/No/Partial",
  "reasoning_vs_triage": "The Triage bot suspected L5 root compression, and the MRI confirms...",
  "visual_findings": [
    {{"structure": "L4-L5 Disc", "observation": "Herniation", "severity": "Severe"}}
  ],
  "critic_notes": "Checked for L5 Pars defect as per memory; none seen.",
  "final_radiological_diagnosis": ["L4-L5 Herniation", "L5 Radiculopathy"],
  "confidence": 0.95
}}
"""

# Inside ai_server/main.py

@app.post("/analyze_images")
async def analyze_images(
    patient_context: str = Form(...),
    files: List[UploadFile] = File(...)
):
    try:
        # 1. PARSE CONTEXT
        patient_data = json.loads(patient_context)
        
        # Extract Clinical Basics
        summary = f"{patient_data.get('age')}yo {patient_data.get('gender')}. {patient_data.get('chiefComplaint')}."
        
        # Extract Triage Bot Data
        ai_triage = patient_data.get('aiTriageResponse', {})
        triage_diagnosis = ai_triage.get('medical_diagnosis', ['Unknown'])
        triage_reasoning = ai_triage.get('reasoning', 'No reasoning provided.')
        
        # Extract Doctor's Verdict
        feedback = patient_data.get('doctorFeedback')
        if feedback:
             doc_verdict = f"Doctor Disagreed. Correction: {feedback.get('correctedDiagnosis')}. Reason: {feedback.get('correctionReason')}"
        else:
             doc_verdict = "Doctor Agreed with Triage Assessment."

        # 2. RETRIEVE VISUAL MEMORY (RAG) - ✅ FIXED BLOCK
        # We must generate the embedding manually to match the 768 dimensions of the DB
        query_text = "radiology miss"
        try:
            embedding_result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=query_text
            )
            query_vector = embedding_result.embeddings[0].values
            
            memory_results = correction_collection.query(
                query_embeddings=[query_vector], # Use embeddings, NOT query_texts
                n_results=3
            )
            learned_rules = "\n".join(memory_results['documents'][0]) if memory_results['documents'] else "No specific past errors."
        except Exception as e:
            print(f"Memory Query Error: {e}")
            learned_rules = "Memory unavailable."

        # 3. PREPARE GEMINI REQUEST
        prompt = DEEP_VISION_PROMPT.format(
            patient_summary=summary,
            triage_diagnosis=triage_diagnosis,
            triage_reasoning=triage_reasoning,
            doctor_feedback=doc_verdict,
            learned_rules=learned_rules
        )

        content_payload = [prompt]
        for file in files:
            file_bytes = await file.read()
            image_part = types.Part.from_bytes(data=file_bytes, mime_type=file.content_type)
            content_payload.append(image_part)

        # 4. RUN MODEL
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=content_payload,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        return json.loads(response.text)

    except Exception as e:
        print(f"Vision Error: {e}")
        return {
            "scan_quality": "Readable",
            "agreement_with_triage": "Partial",
            "reasoning_vs_triage": "System Error - Showing Fallback. " + str(e),
            "visual_findings": [{"structure": "Unknown", "observation": "Analysis Failed", "severity": "Unknown"}],
            "critic_notes": "Could not access memory.",
            "final_radiological_diagnosis": ["Manual Review Required"],
            "confidence": 0.0
        }

@app.post("/learn_from_mistake")
async def learn_from_mistake(
    correction: str = Form(...),
    doctor_id: str = Form(...)
):
    """ Learns visual rules from doctor feedback (Vision Disagree) """
    try:
        # Embedding the rule
        embedding_result = client.models.embed_content(model=EMBEDDING_MODEL, contents=correction)
        embedding = embedding_result.embeddings[0].values

        correction_collection.add(
            ids=[f"visual_rule_{int(time.time())}"],
            documents=[f"CRITICAL VISUAL RULE: {correction}"],
            embeddings=[embedding],
            metadatas=[{"author": doctor_id, "type": "visual_correction"}]
        )
        return {"status": "success", "message": "Visual rule learned."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/archive_vision_case")
async def archive_vision_case(
    patient_context: str = Form(...),
    vision_result: str = Form(...),
    doctor_id: str = Form(...)
):
    """ Archives a verified Visual Diagnosis (Vision Agree) """
    try:
        # Parse JSONs
        patient_data = json.loads(patient_context)
        vision_data = json.loads(vision_result)
        
        # Create a rich narrative for the vector DB
        narrative = f"""
        VERIFIED VISUAL DIAGNOSIS:
        Patient: {patient_data.get('age')}yo {patient_data.get('gender')}. {patient_data.get('chiefComplaint')}.
        Visual Findings: {', '.join([f['observation'] for f in vision_data.get('visual_findings', [])])}.
        Final Dx: {', '.join(vision_data.get('final_radiological_diagnosis', []))}.
        """
        
        # Embed and Save
        embedding_result = client.models.embed_content(model=EMBEDDING_MODEL, contents=narrative)
        embedding = embedding_result.embeddings[0].values
        
        gold_case_collection.add(
            ids=[f"gold_vision_{int(time.time())}"],
            documents=[narrative],
            embeddings=[embedding],
            metadatas=[{
                "type": "vision_precedent", 
                "validated_by": doctor_id,
                "scan_quality": vision_data.get('scan_quality', 'Unknown')
            }]
        )
        
        return {"status": "success", "message": "Visual Case Archived"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))