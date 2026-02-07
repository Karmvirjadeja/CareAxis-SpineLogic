export interface MedicalAdviceOption {
  id: string;
  category: string;
  label: string;
  description: string;
}

export const MEDICAL_ADVICE_OPTIONS: MedicalAdviceOption[] = [
  {
    id: "dexa_scan",
    category: "Metabolic Workup",
    label: "DEXA SCAN",
    description: "DEXA SCAN - SPINE, B/L HIP, B/L WRIST"
  },
  {
    id: "full_bloods",
    category: "Metabolic Workup", 
    label: "Complete Blood Panel",
    description: "BLOODS: CBC/ESR/CRP/S.VIT B12/S.VIT D3/S.CALCIUM/S.CREATININE/S.URIC ACID/S.PTH/S.CPK TOTAL"
  },
  {
    id: "basic_bloods",
    category: "Basic Tests",
    label: "Basic Blood Tests",
    description: "BASIC BLOODS: CBC/ESR/CRP/S.VIT B12/S.VIT D3"
  },
  {
    id: "mri_ls_spine",
    category: "MRI Scans",
    label: "MRI LS Spine",
    description: "MRI - LS SPINE WITH WSS"
  },
  {
    id: "mri_cervical",
    category: "MRI Scans",
    label: "MRI Cervical Spine",
    description: "MRI - CERVICAL SPINE WITH WSS"
  },
  {
    id: "mri_cervical_lumbar",
    category: "MRI Scans",
    label: "MRI Cervical + Lumbar",
    description: "MRI - CERVICAL + LUMBAR SPINE WITH WSS"
  },
  {
    id: "mri_dl_spine",
    category: "MRI Scans",
    label: "MRI DL Spine",
    description: "MRI - DL SPINE WITH WSS"
  },
  {
    id: "mri_si_joint",
    category: "MRI Scans",
    label: "MRI SI Joint",
    description: "MRI - B/L SI JOINT SCREENING"
  },
  {
    id: "mri_hip_joint",
    category: "MRI Scans",
    label: "MRI Hip Joint",
    description: "MRI - B/L HIP JOINT SCREENING"
  },
  {
    id: "mri_shoulder",
    category: "MRI Scans",
    label: "MRI Shoulder",
    description: "MRI - B/L SHOULDER SCREENING"
  },
  {
    id: "mri_ls_ct",
    category: "MRI Scans",
    label: "MRI LS Spine + CT",
    description: "MRI LS SPINE WITH WSS + CT CUTS - CORONAL/AXIAL/SAGITTAL REFORMATS"
  },
  {
    id: "mri_cervical_ct",
    category: "MRI Scans",
    label: "MRI Cervical + CT",
    description: "MRI - CERVICAL SPINE WITH WSS WITH CT CUTS CORONAL/AXIAL/SAGITTAL REFORMATS"
  },
  {
    id: "xray_ls_spine",
    category: "X-Ray Studies",
    label: "X-Ray LS Spine",
    description: "XRAY - LS SPINE - AP/LAT - FEX/EXT"
  },
  {
    id: "xray_cervical",
    category: "X-Ray Studies",
    label: "X-Ray Cervical",
    description: "XRAY - CERVICAL SPINE - AP/LAT - FEX/EXT"
  },
  {
    id: "xray_dl_spine",
    category: "X-Ray Studies",
    label: "X-Ray DL Spine",
    description: "XRAY - DL SPINE - AP - STANDING/SUPINE & LAT - SITTING/SUPINE"
  },
  {
    id: "xray_coccyx",
    category: "X-Ray Studies",
    label: "X-Ray Coccyx",
    description: "XRAY - COCCYX SPINE - AP/LAT - SITTING/STANDING"
  },
  {
    id: "xray_cervical_ls",
    category: "X-Ray Studies",
    label: "X-Ray Cervical + LS",
    description: "XRAY - CERVICAL - AP/LAT - FEX/EXT & LS SPINE - AP/LAT - FEX/EXT"
  },
  {
    id: "bed_rest",
    category: "Rest & Activity",
    label: "Bed Rest Protocol",
    description: "COMPLETE BED REST FOR 2 DAYS FOLLOWED BY MOBILIZE WITHIN PAIN LIMITS"
  },
  {
    id: "endurance_training",
    category: "Rest & Activity",
    label: "Endurance Training",
    description: "ENDURANCE TRAINING: SWIMMING/STATIC CYCLING/WALKING"
  },
  {
    id: "rehab_low_back",
    category: "Rehabilitation",
    label: "Low Back Rehabilitation",
    description: "REHAB: LOW BACK - ISOMETRIC BACK EXERCISE, ABS/OBLIQUES/GLUTS/HIP FLEXOR STRENGTHENING EXERCISES, BASIC CORE STRENGTHENING EXERCISES"
  },
  {
    id: "rehab_neck",
    category: "Rehabilitation",
    label: "Neck Rehabilitation",
    description: "REHAB: NECK - ISOMETRIC NECK EXERCISE, TRAPEZIUS/SCAPULOTHORACIC/SHOULDER GIRDLE STRENGTHENING EXERCISES, THERA BAND EXERCISES"
  },
  {
    id: "rehab_functional",
    category: "Rehabilitation",
    label: "Functional Rehabilitation",
    description: "REHAB: FUNCTIONAL - FUNCTIONAL TRAINING EXERCISE, BALANCE TRAINING EXERCISES, GAIT TRAINING EXERCISES"
  },
  {
    id: "high_protein_diet",
    category: "Lifestyle & Diet",
    label: "High Protein Diet",
    description: "HIGH PROTEIN DIET"
  },
  {
    id: "avoid_general",
    category: "Lifestyle & Diet",
    label: "General Activity Restrictions",
    description: "AVOID: BENDING FORWARD/REACHING OUT/SLOUCHING/LOW SITTING/LONG SITTING (> 30 MINS)/LIFTING HEAVY WEIGHT"
  },
  {
    id: "avoid_neck",
    category: "Lifestyle & Diet",
    label: "Neck Activity Restrictions",
    description: "AVOID: WHIPLASH/REACHING OUT/EXTREME NECK ROM"
  },
  {
    id: "avoid_combined",
    category: "Lifestyle & Diet",
    label: "Combined Activity Restrictions",
    description: "AVOID: BENDING FORWARD/REACHING OUT/SLOUCHING/LOW SITTING/LONG SITTING (> 30 MINS)/LIFTING HEAVY WEIGHT/WHIPLASH/EXTREME NECK ROM"
  },
  {
    id: "immediate_consult",
    category: "Follow-up & Consultation",
    label: "Immediate Consultation",
    description: "IMMEDIATELY CONSULT A SPINE SURGEON"
  },
  {
    id: "fu_reports",
    category: "Follow-up & Consultation",
    label: "Follow-up with Reports",
    description: "F/U IN OPD WITH REPORTS"
  },
  {
    id: "fu_3months",
    category: "Follow-up & Consultation",
    label: "3-Month Follow-up",
    description: "F/U IN OPD AFTER 3 MONTHS"
  },
  {
    id: "dsa",
    category: "Follow-up & Consultation",
    label: "Digital Spine Analysis",
    description: "DSA - DIGITAL SPINE ANALYSIS"
  }
];

export const PAIN_AGGRAVATORS = [
  "Sitting for a long time",
  "Transition movements (getting up/down)",
  "Coughing or sneezing",
  "All the time",
  "More at night",
  "Twisting movements",
  "More at rest",
  "During intercourse",
  "Lifting something heavy",
  "Bending forward",
  "Walking up stairs/uphill",
  "Pushing a grocery cart",
  "Bending backwards",
  "Going down stairs/downhill",
  "Sudden jerk",
  "Walking for some distance",
  "When waking up in the morning",
  "Driving for long"
];

export const MOVEMENT_OPTIONS = [
  "Bending forward",
  "Bending backwards", 
  "Bending on the side",
  "Left twisting",
  "Right twisting"
];

export const NECK_MOVEMENT_OPTIONS = [
  "Extension",
  "Flexion",
  "Right lateral flexion",
  "Left lateral flexion", 
  "Right rotation",
  "Left rotation"
];
