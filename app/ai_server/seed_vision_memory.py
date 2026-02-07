import chromadb
import os
from google import genai
from dotenv import load_dotenv

# 1. SETUP
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)
EMBEDDING_MODEL = "models/text-embedding-004"

# Connect to DB (Same path as your text bot to keep memory unified)
chroma_client = chromadb.PersistentClient(path="./ai_memory")
correction_collection = chroma_client.get_or_create_collection(name="visual_corrections")

# 2. THE GOLD STANDARD RULES (50 Expert Radiology Pearls)
rules = [
    # --- Subtle Findings & Anatomical Traps ---
    "WATCH-OUT: Conjoined nerve roots frequently exhibit an asymmetrical 'fat crescent' sign on axial images; do not misinterpret as disc fragments.",
    "VISUAL RULE: IF nerve roots are visualized in the ventral portion of the dural sac on axial T2 (positive nerve root sedimentation sign), THEN high specificity for severe stenosis.",
    "VISUAL RULE: IF L4-L5 far lateral disc herniation is identified, THEN inspect exiting L4 nerve root for compression (L5 traversing root usually unaffected).",
    "CRITICAL: Severe neural foraminal stenosis (Grade 3) must be diagnosed if ANY morphological change/collapse of the nerve root is present, regardless of remaining fat.",
    "WATCH-OUT: Redundant or tortuous nerve roots above a stenotic level indicate severe compression and are a critical surgical indicator.",
    "VISUAL RULE: IF anterior CSF space is obliterated and cauda equina roots are aggregated/inseparable, THEN grade as Grade 2 moderate central stenosis.",
    "WATCH-OUT: Perineural fat obliteration in all four directions (circumferential) without root collapse indicates Grade 2 foraminal stenosis.",
    "WATCH-OUT: In LSTV (Transitional Vertebra), the interspace immediately ABOVE the transition is 9x more likely to herniate or degenerate.",
    "VISUAL RULE: IF 'squaring' of the first presumed sacral segment is seen on sagittal views, THEN suspect a lumbarized S1 vertebral body.",
    "CRITICAL: Misidentifying LSTV levels is a major surgery risk. Always count down from C2 using a whole-spine scout if available.",
    "VISUAL RULE: IF the iliolumbar ligament (ILL) is visible, THEN its origin from the transverse process typically identifies the L5 level (95% accuracy).",
    "WATCH-OUT: Bertolotti Syndrome (L5 pseudoarticulation with sacrum) often shows subchondral edema at the contact area, indicating symptomatic mechanical overload.",
    "VISUAL RULE: IF L5 transverse process width > 19 mm, THEN categorize as Castellvi Type I LSTV.",
    "WATCH-OUT: Pars defects (spondylolysis) appear as a 'dark line' or gap in the bone between superior and inferior facets on sagittal images.",
    "WATCH-OUT: IF L5-S1 disc height is preserved but patient has L5 radiculopathy, check the Far Lateral zone for extraforaminal herniation.",
    "WATCH-OUT: Transitional S1 segments often have functional facet joints between S1-S2, whereas normal anatomy is fused.",
    "VISUAL RULE: IF a dermatome gap exists (e.g., L5 to S2), THEN suspect S1 lumbarization of the sacrum.",
    "VISUAL RULE: IF marrow edema is seen contralateral to a unilateral fused LSTV, THEN suspect mechanical facet arthrosis due to altered loading.",

    # --- Pathological Discriminators (Tumor vs Benign) ---
    "VISUAL RULE: IF lesion has high signal on T1 AND T2 with coarse vertical trabeculae, THEN it is a benign Hemangioma.",
    "WATCH-OUT: Metastatic lesions typically cause COMPLETE replacement of high T1 marrow signal (diffuse hypointensity).",
    "VISUAL RULE: IF lesion shows 'polka-dot' appearance on axial view (coarse trabeculae), THEN it is a Hemangioma.",
    "WATCH-OUT: 'Lipid-poor' hemangiomas can mimic metastasis (low T1); look for thickened trabeculae to differentiate.",
    "VISUAL RULE: IF lesion shows restricted diffusion (low ADC values), THEN suspect Malignancy over Hemangioma.",
    "WATCH-OUT: Malignant fractures often show a CONVEX, expanded posterior vertebral border.",
    "VISUAL RULE: IF retropulsion of bone fragments is seen, THEN fracture is likely Benign/Traumatic (Burst fracture), not malignant.",
    "WATCH-OUT: Bone marrow necrosis appears as irregular geographic areas of low T1/T2 signal; early sign of malignancy.",
    "VISUAL RULE: IF lesion is T1-hyperintense but shows T2 shortening, THEN consider Melanoma metastasis.",

    # --- Degenerative & Stability Indicators ---
    "VISUAL RULE: IF signal voids (dark gas) are visible in disc on T1/T2, THEN report 'Vacuum Phenomenon' (sign of instability, rules out infection).",
    "WATCH-OUT: Modic Type 1 changes (low T1, high T2) represent acute inflammation and can mimic Diskitis.",
    "CRITICAL: IF fluid signal in disc space is accompanied by ENDPLATE DESTRUCTION, THEN suspect Diskitis/Osteomyelitis (not just Modic changes).",
    "WATCH-OUT: High-Intensity Zones (HIZ) in outer annulus on T2 indicate Annular Fissures (painful tears).",
    "VISUAL RULE: IF round defects in endplate are seen, THEN they are Schmorl's Nodes (nucleus pulposus invagination).",
    "WATCH-OUT: Posterior wedging of L5 body WITHOUT endplate depression usually indicates Congenital Hypoplasia, not fracture.",
    "WATCH-OUT: Ligamentum Flavum Hypertrophy > 4mm is a major contributor to central stenosis; measure on axial views.",
    "VISUAL RULE: IF a Synovial Cyst is seen near a facet joint, THEN high risk for focal lateral recess stenosis.",
    "VISUAL RULE: IF a 'Traction Spur' (Macnab spur) projects horizontally 1mm from disc border, THEN it indicates early instability.",
    "VISUAL RULE: A 'Claw Sign' on STIR/T2 in the endplate is a reliable sign for EXCLUDING active infection/diskitis.",

    # --- Interpretation & Post-Surgical Pearls ---
    "WATCH-OUT: Do not evaluate foramina on midline sagittal images alone; verify with axial/parasagittal to avoid missing lateral stenosis.",
    "VISUAL RULE: IF patient has Foot Drop, THEN carefully inspect L4-L5 level for L5 root compression.",
    "VISUAL RULE: To differentiate Recurrent Disc vs Scar: Scar enhances immediately with Gadolinium; Disc material does not.",
    "WATCH-OUT: T2 hypointense flow voids in spinal canal may indicate Dural Fistula or AVM.",
    "VISUAL RULE: IF 'Rim and Flame' sign is seen on post-contrast MRI, THEN suspect Intramedullary Spinal Cord Metastasis.",
    "WATCH-OUT: Adhesive Arachnoiditis presents as 'Clumping' of nerve roots (Type 1) or 'Empty Sac' appearance (Type 2).",
    "VISUAL RULE: IF complete opacification of thecal sac spans >1 level, THEN suspect severe Stage III Arachnoiditis.",
    "WATCH-OUT: Limbus Vertebra (bony fragment at corner) mimics fracture but has well-defined sclerotic margins.",
    "WATCH-OUT: Motion artifacts cause 'ghosting'; confirm by checking if findings repeat in phase-encoding direction.",
    "VISUAL RULE: Asymmetric signal loss in CSF on T2 can be a normal flow artifact.",
    "CLINICAL CORRELATION: Bilateral wasting of Extensor Digitorum Brevis (EDB) muscle is a strong sign of underlying L5 radiculopathy/stenosis."
]

print(f"🧠 Seeding {len(rules)} Gold Standard Radiology Rules...")

# 3. EMBED & STORE
ids = []
documents = []
embeddings = []
metadatas = []

for i, rule in enumerate(rules):
    # Create Embedding
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=rule
    )
    vector = result.embeddings[0].values
    
    rule_id = f"gold_vision_rule_{str(i+1).zfill(3)}"
    
    ids.append(rule_id)
    documents.append(rule)
    embeddings.append(vector)
    metadatas.append({
        "type": "gold_standard", 
        "category": "radiology_pearls",
        "author": "Expert_Curated_Dataset"
    })

# Add to DB (Batch add is more efficient)
correction_collection.add(
    ids=ids,
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas
)

print(f"✅ Success! {len(rules)} rules injected into Visual Memory.")