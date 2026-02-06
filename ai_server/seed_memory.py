import chromadb
from google import genai
import os
from dotenv import load_dotenv

# 1. Setup
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

chroma_client = chromadb.PersistentClient(path="./ai_memory")
collection = chroma_client.get_or_create_collection(name="triage_pearls")

# 2. "SENIOR NEUROSURGEON" LOGIC RULES
doctor_rules = [
    "Red Flag: Bilateral Sciatica or Saddle Anesthesia -> Immediate MRI to rule out Cauda Equina.",
    "Red Flag: History of Cancer + New Back Pain -> Assume Metastasis. Urgent Contrast MRI.",
    "Red Flag: Severe Night Pain + Elevated CRP (even without Fever) -> Suspect Discitis/Epidural Abscess. Order MRI.",
    "Red Flag: Trauma in Elderly (>70) + Pain on turning in bed -> Suspect Compression Fracture even if X-ray normal.",
    "Red Flag: Painless Foot Drop (Power < 3/5) -> Surgical Emergency. Decompress ASAP for recovery chance.",
    "Safety Trap: Hyperreflexia (Brisk Knee Jerk) -> Sign of Upper Motor Neuron lesion. Mandatory WHOLE SPINE Screening (30% Double Crush).",
    "Safety Trap: 3/5 Positive Waddell’s Signs (Tenderness, Simulation, Distraction, Regional, Overreaction) -> Strong indicator of Non-Organic/Psychogenic pain.",
    "Safety Trap: Distraction Test Positive (SLR sitting vs lying mismatch) -> One of Waddell's signs; check for other 4 to confirm functional overlay.",
    "Diagnosis: Weakness in Big Toe Extension (EHL) -> Specific for L5 Nerve Root.",
    "Diagnosis: Weakness in Ankle Dorsiflexion -> Specific for L4 Nerve Root.",
    "Diagnosis: Inability to do Single-Leg Calf Raise -> Definitive test for S1 Weakness (Toe walking is just a screening).",
    "Diagnosis: Severe L4 Radiculopathy (Shin Pain) but Normal Central Canal -> Mandatory check for 'Far Lateral' Disc at L4-5 OR Central Disc at L3-4.",
    "Diagnosis: Positive Patrick’s (FABER) Test -> Leans towards Hip, but DOES NOT rule out Spine (Facet/Pars fracture can mimic).",
    "Diagnosis: Leg pain relieved INSTANTLY by standing still -> High suspicion of Vascular Claudication. Neurogenic usually requires sitting/flexion.",
    "Diagnosis: Patient prefers Standing over Sitting -> Reduces probability of Stenosis; points towards Discogenic pain.",
    "Diagnosis: Foot Drop with PRESERVED Inversion Strength -> Peroneal Nerve Palsy (at knee). Weak Inversion -> L5 Nerve Root.",
    "Diagnosis: Anterior Thigh/Groin Pain -> Suspect High Lumbar (L1-L3). Use Femoral Nerve Stretch Test (FNST) to confirm.",
    "Diagnosis: Heel pain worst with 'First Steps' in morning -> Plantar Fasciitis. Heel pain radiating from Glute -> S1 Radiculopathy.",
    "Diagnosis: Unilateral 'Band-like' Chest/Abdominal Pain -> Suspect Thoracic Disc Herniation (Diagnosis of exclusion after Cardiac/Visceral).",
    "Diagnosis: 100% relief with Oral Steroids -> Suggests Inflammatory/Discogenic cause (but not confirmatory).",
    "Diagnosis: Male <40 + Chronic Back Pain + Morning Stiffness >30min -> Suspect Ankylosing Spondylitis. Check HLA-B27.",
    "Imaging: Recurrent pain after Discectomy -> Order MRI WITH Contrast to differentiate Scar Tissue (Fibrosis) vs Recurrent Disc/Infection.",
    "Imaging: Suspect Spondylolisthesis/Instability -> Mandatory X-Ray Flexion/Extension views.",
    "Imaging: 'Polka-Dot' or 'Corduroy' sign on MRI -> Benign Hemangioma. Ill-defined margins/Hypointense T1 -> Suspect Metastasis.",
    "Imaging: Obliteration of Perineural Fat on MRI -> Best sign for Foraminal Stenosis (though not standalone diagnostic).",
    "Imaging: Modic Type 1 Changes (Edema) on MRI -> Correlates strongly with Active Pain source (vs Type 2 Fat).",
    "Imaging: Schizas Grade D Stenosis (No CSF visible) -> High likelihood of failure with conservative care; Surgery likely inevitable if symptomatic.",
    "Imaging: Pars Defect suspect but not seen on X-ray -> CT Lumbar Spine is mandatory (PET CT if impending).",
    "Imaging: Tarlov Cyst on MRI -> Usually incidental. Only treat if symptoms strictly correlate (2-5% cases).",
    "Imaging: Isolated Disc Height Loss on X-Ray -> Non-diagnostic for pain source (common in asymptomatic elderly).",
    "Reporting: If SLR is positive -> State 'Tension Sign Positive' suggesting uncontained disc.",
    "Reporting: If Aggravated by Cough/Sneeze -> State 'Valsalva Positive' suggesting active dural compression.",
    "Reporting: If pain > 6 weeks -> Label as 'Sub-acute', justifying MRI over X-ray."
]

print(f"🧠 Seeding {len(doctor_rules)} Senior Neurosurgeon rules...")

ids = []
documents = []
embeddings = []
metadatas = []

for i, rule in enumerate(doctor_rules):
    # Create Embedding
    result = client.models.embed_content(
        model="models/text-embedding-004",  # <--- CHANGED TO MATCH MAIN.PY
        contents=rule
    )
    vector = result.embeddings[0].values
    
    rule_id = f"senior_rule_{str(i+1).zfill(3)}"
    
    ids.append(rule_id)
    documents.append(rule)
    embeddings.append(vector)
    
    # Metadata for weighting
    metadatas.append({
        "type": "master_rule",
        "confidence": 1.0, 
        "priority": "standard",
        "usage_count": 0,
        "author": "Senior_Neurosurgeon_Protocol"
    })

# Add to DB
collection.add(
    ids=ids,
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas
)

print("✅ Success! Your Institutional Memory is active.")