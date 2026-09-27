/**
 * Legal Metrology Instrument Categories & Rule Configuration Registry
 *
 * Source of Truth:
 * - Legal Metrology Act, 2009 (Act No. 1 of 2010)
 * - Legal Metrology (General) Rules, 2011 and official amendments
 * - Legal Metrology (Government Approved Test Centre) Rules, 2013:
 *   - 2025 Amendment: G.S.R. 779(E), 23 October 2025 (Rule 3(1) either GATC or LMO)
 *   - 2026 Amendment: G.S.R. 346(E), 8 May 2026 (First Schedule substituted with 23 categories)
 */

const CENTRAL_GATC_NOTIFICATION = "G.S.R. 346(E) dated 08-05-2026";
const CENTRAL_GATC_SOURCE = "Legal Metrology (Government Approved Test Centre) Rules, 2013 - Rule 3(1) & First Schedule";
const GENERAL_RULES_SOURCE = "Legal Metrology (General) Rules, 2011 as amended";

const COMMON_DOCUMENTS = [
  { document_code: "DOC_IDENTITY", name: "Identity Proof of Applicant", mandatory: true },
  { document_code: "DOC_BUSINESS", name: "Proof of Business Establishment / GSTIN", mandatory: true },
  { document_code: "DOC_INVOICE", name: "Purchase Invoice / Bill of Sale", mandatory: true },
  { document_code: "DOC_NAMEPLATE", name: "Photograph of Metallic Nameplate & Serial No.", mandatory: true },
  { document_code: "DOC_PREVIOUS_CERT", name: "Previous Statutory Verification Certificate", mandatory: false },
  { document_code: "DOC_MODEL_APPROVAL", name: "Model Approval Certificate (Section 22)", mandatory: false },
];

const COMMON_CHECKLIST = [
  { check_code: "CHK_PHYSICAL_AVAILABILITY", check_name: "Instrument Physically Present & Accessible", mandatory: true },
  { check_code: "CHK_SERIAL_MATCH", check_name: "Serial Number Matches Application & Inscription Plate", mandatory: true },
  { check_code: "CHK_NAMEPLATE_LEGIBLE", check_name: "Statutory Nameplate Inscriptions Complete & Indelible", mandatory: true },
  { check_code: "CHK_LEVEL_STABILITY", check_name: "Instrument Levelled, Free from Environmental Distortion", mandatory: true },
  { check_code: "CHK_ZERO_INDICATION", check_name: "Zero-Load Indication Stable within Permissible Limit", mandatory: true },
  { check_code: "CHK_SEAL_INTEGRITY", check_name: "Statutory Security Seal / Tamper Proof Enclosure Intact", mandatory: true },
];

const CATEGORIES_DATA = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Water Meter (GATC First Schedule Item 1)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "WATER_METER",
    name: "Water Meter",
    description: "Cold and hot potable water meters for domestic, commercial and industrial measurement under Section 24.",
    parent_category: "FLOW_AND_VOLUMETRIC_MEASUREMENT",
    units: ["m³", "kL", "L"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 1",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "nominal_diameter", label: "Nominal Diameter (DN)", type: "select", options: ["DN15 (1/2\")", "DN20 (3/4\")", "DN25 (1\")", "DN40 (1.5\")", "DN50 (2\")", "DN80 (3\")", "DN100 (4\")"], required: true },
      { name: "meter_type", label: "Meter Operating Principle", type: "select", options: ["Single-Jet Mechanical", "Multi-Jet Mechanical", "Electromagnetic", "Ultrasonic", "Woltman Turbine"], required: true },
      { name: "temperature_class", label: "Temperature Class", type: "select", options: ["T30 (Cold Potable)", "T50", "T70/90 (Hot Water)"], required: true },
      { name: "permanent_flowrate_q3", label: "Permanent Flowrate Q3 (m³/h)", type: "text", required: true },
      { name: "measuring_range_ratio", label: "Measuring Range Ratio (Q3/Q1)", type: "select", options: ["R80", "R100", "R160", "R200", "R250"], required: true },
      { name: "installation_orientation", label: "Installation Orientation", type: "select", options: ["Horizontal (H)", "Vertical (V)", "Any Position (H/V)"], required: true },
    ],
    validity: {
      initial_verification_period: 60, // 5 years under 2025 General Rules Volumetric insertion
      subsequent_verification_period: 60,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Rule 27 read with 2025 volumetric meter insertion",
    },
    tests: [
      {
        test_code: "WM_PRESSURE_LEAKAGE",
        test_name: "Static Hydraulic Pressure Tightness Test",
        description: "Subject meter to 1.6 MPa (16 bar) for 15 minutes; examine for leakage or deformation.",
        formula: "pressure >= 1.6 && leakage === 'NONE' ? 'PASS' : 'FAIL'",
        calculation_method: "MPE_BOUNDS",
        max_permissible_error: 0.0,
        units: "MPa",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part I",
      },
      {
        test_code: "WM_FLOW_Q1_MIN",
        test_name: "Accuracy of Indication at Minimum Flowrate (Q1)",
        description: "Observed error between Q1 and Q2. Maximum Permissible Error is ±5.0%.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 5.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part I",
      },
      {
        test_code: "WM_FLOW_Q2_TRANS",
        test_name: "Accuracy of Indication at Transitional Flowrate (Q2)",
        description: "Observed error at Q2. Maximum Permissible Error is ±2.0%.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 2.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part I",
      },
      {
        test_code: "WM_FLOW_Q3_NOMINAL",
        test_name: "Accuracy of Indication at Permanent Flowrate (Q3)",
        description: "Observed error at nominal flowrate Q3. Maximum Permissible Error is ±2.0%.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 2.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part I",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Sphygmomanometer (GATC First Schedule Item 2)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "SPHYGMOMANOMETER",
    name: "Sphygmomanometer",
    description: "Non-invasive blood pressure measuring instruments (Mercurial, Aneroid, and Digital).",
    parent_category: "MEDICAL_MEASURING_INSTRUMENTS",
    units: ["mmHg"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 2",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "sphyg_type", label: "Sphygmomanometer Technology", type: "select", options: ["Electronic Digital Automated", "Aneroid Dial Type", "Mercurial Manometer"], required: true },
      { name: "pressure_range", label: "Pressure Range (mmHg)", type: "text", placeholder: "0 to 300 mmHg", required: true },
      { name: "scale_resolution", label: "Scale Division / Resolution (mmHg)", type: "select", options: ["1 mmHg", "2 mmHg"], required: true },
      { name: "clinical_context", label: "Hospital / Clinical Usage Context", type: "select", options: ["ICU / High Dependence Unit", "General Outpatient Clinic", "Diagnostic Centre", "Retail / Commercial"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part V",
    },
    tests: [
      {
        test_code: "SPHYG_PRESSURE_MPE",
        test_name: "Maximum Permissible Error in Pressure Indication",
        description: "Verification against standard calibrated reference manometer at 50, 100, 150, 200, 250 mmHg. MPE is ±3 mmHg (±0.4 kPa).",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 3.0,
        units: "mmHg",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part V, Clause 6",
      },
      {
        test_code: "SPHYG_AIR_LEAKAGE",
        test_name: "Pneumatic Air Leakage Test",
        description: "Pressure drop in cuff and pneumatic system must not exceed 4 mmHg/minute at 200 mmHg.",
        formula: "observed <= 4.0 ? 'PASS' : 'FAIL'",
        calculation_method: "MPE_BOUNDS",
        max_permissible_error: 4.0,
        units: "mmHg/min",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part V, Clause 7",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Clinical Thermometer (GATC First Schedule Item 3)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "CLINICAL_THERMOMETER",
    name: "Clinical Thermometer",
    description: "Liquid-in-glass and electrical/infrared clinical thermometers for human body temperature measurement.",
    parent_category: "MEDICAL_MEASURING_INSTRUMENTS",
    units: ["°C", "°F"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 3",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "thermometer_type", label: "Thermometer Type", type: "select", options: ["Digital Electronic (Direct Contact)", "Infrared Tympanic (Ear)", "Infrared Non-Contact Forehead", "Liquid-in-Glass (Gallium/Alloy)"], required: true },
      { name: "temperature_range", label: "Temperature Measurement Range", type: "text", placeholder: "35.0°C to 42.0°C", required: true },
      { name: "resolution", label: "Digital Resolution", type: "select", options: ["0.1°C", "0.01°C"], required: true },
      { name: "sensor_technology", label: "Sensing Technology", type: "select", options: ["Thermistor (NTC)", "Thermopile Infrared Detector", "Liquid Thermal Expansion"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part IV",
    },
    tests: [
      {
        test_code: "THERMO_ERROR_MPE",
        test_name: "Accuracy of Temperature Indication in Water Bath",
        description: "Tested in stirred water bath against Class A standard thermometer at 37.0°C and 41.0°C. MPE is ±0.1°C (±0.2°F).",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 0.1,
        units: "°C",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part IV, Clause 4",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Automatic Rail Weighbridge (GATC First Schedule Item 4)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "AUTOMATIC_RAIL_WEIGHBRIDGE",
    name: "Automatic Rail Weighbridge",
    description: "Automatic instruments for weighing railway vehicles in motion or static.",
    parent_category: "HEAVY_WEIGHING_INSTRUMENTS",
    units: ["t", "tonne", "kg"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 4",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "rail_accuracy_class", label: "Accuracy Class", type: "select", options: ["Class 0.2", "Class 0.5", "Class 1", "Class 2"], required: true },
      { name: "max_capacity", label: "Maximum Capacity (Max in tonnes)", type: "text", placeholder: "100 t / 120 t", required: true },
      { name: "weighing_mode", label: "Weighing Mode", type: "select", options: ["In-Motion Wagon-by-Wagon", "In-Motion Total Train", "Static Rail Weighing"], required: true },
      { name: "track_gauge", label: "Track Gauge & Siding Details", type: "select", options: ["Broad Gauge (1676 mm)", "Standard Gauge (1435 mm)", "Metre Gauge"], required: true },
      { name: "operating_speed_range", label: "Design Operating Speed (km/h)", type: "text", placeholder: "5 - 15 km/h", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part III",
    },
    tests: [
      {
        test_code: "RAIL_IN_MOTION_MPE",
        test_name: "In-Motion Train Weighing Accuracy Test",
        description: "Test train with reference wagons tested at operational speeds. MPE according to Class 0.5 (±0.25% for wagon, ±0.1% for total train).",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.25,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part III, Clause 3",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Tape Measure (GATC First Schedule Item 5)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "TAPE_MEASURE",
    name: "Tape Measure",
    description: "Material measures of length, winding and non-winding steel, fibreglass, and fabric tapes.",
    parent_category: "LENGTH_MEASURES",
    units: ["m", "cm", "mm"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 5",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "nominal_length", label: "Nominal Length", type: "select", options: ["1 m", "2 m", "3 m", "5 m", "10 m", "15 m", "20 m", "30 m", "50 m", "100 m"], required: true },
      { name: "accuracy_class", label: "Accuracy Class", type: "select", options: ["Class I (High Precision Steel)", "Class II (General Industrial)", "Class III (Fabric / Fibreglass)"], required: true },
      { name: "material", label: "Tape Material", type: "select", options: ["Carbon Steel Blade", "Stainless Steel", "Fibreglass Reinforced Plastic", "Synthetic Fabric"], required: true },
      { name: "tension_applied", label: "Standard Verification Tension (N)", type: "select", options: ["20 N (Steel)", "50 N (Heavy)", "No Tension (Rigid)"], required: true },
    ],
    validity: {
      initial_verification_period: 24,
      subsequent_verification_period: 24,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule II",
    },
    tests: [
      {
        test_code: "TAPE_TOTAL_LENGTH_MPE",
        test_name: "Total Length Permissible Error Test",
        description: "Compared on laser bench against standard baseline length at 20°C and standard tension. MPE = ±(a + bL) mm.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 1.0, // For 5m Class II tape = ±(0.3 + 0.2*5) = ±1.3 mm
        units: "mm",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule II, Part II",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. NAWI — Accuracy Class III up to 150 kg (GATC First Schedule Item 6)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "NAWI_CLASS_III_150KG",
    name: "Non-Automatic Weighing Instrument — Accuracy Class III up to 150 kg",
    description: "Counter machines, electronic retail balances, and platform scales up to 150 kg capacity.",
    parent_category: "WEIGHING_INSTRUMENTS",
    units: ["kg", "g"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 6",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "max_capacity", label: "Maximum Capacity (Max)", type: "select", options: ["5 kg", "15 kg", "30 kg", "50 kg", "100 kg", "150 kg"], required: true },
      { name: "min_capacity", label: "Minimum Capacity (Min)", type: "text", placeholder: "e.g. 100 g", required: true },
      { name: "scale_interval_e", label: "Verification Scale Interval (e)", type: "select", options: ["1 g", "2 g", "5 g", "10 g", "20 g", "50 g"], required: true },
      { name: "display_type", label: "Display / Indication", type: "select", options: ["Seven-Segment LED", "LCD with Backlight", "Mechanical Pointer / Steelyard"], required: true },
      { name: "weighing_mode", label: "Weighing Mode", type: "select", options: ["Single Range", "Dual Interval / Multi-Range"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part II",
    },
    tests: [
      {
        test_code: "NAWI_REPEATABILITY",
        test_name: "Repeatability Test at 50% and 100% Max",
        description: "Three successive weighings at half and full load; maximum difference must not exceed absolute value of MPE.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 1.0, // in 'e'
        units: "e",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II, Clause 3.6",
      },
      {
        test_code: "NAWI_ECCENTRICITY",
        test_name: "Eccentricity (Off-Centre Load) Test",
        description: "Apply 1/3 Max on 4 quadrants; error at each position must be within MPE.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 1.0,
        units: "e",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II, Clause 3.7",
      },
      {
        test_code: "NAWI_CAPACITY_ERROR",
        test_name: "Verification Error at Maximum Capacity",
        description: "Error of indication at full capacity verified with Class M1 weights.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.05,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II, Clause 3.5",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. NAWI — Accuracy Class IIII (GATC First Schedule Item 7)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "NAWI_CLASS_IIII",
    name: "Non-Automatic Weighing Instrument — Accuracy Class IIII",
    description: "Ordinary accuracy weighing instruments used for construction aggregate, mining, scrap metal and freight.",
    parent_category: "WEIGHING_INSTRUMENTS",
    units: ["kg", "t"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 7",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "max_capacity", label: "Maximum Capacity (Max)", type: "text", placeholder: "e.g. 500 kg, 2 t, 10 t", required: true },
      { name: "scale_interval_e", label: "Verification Scale Interval (e)", type: "text", placeholder: "e.g. 500 g, 1 kg, 5 kg", required: true },
      { name: "load_receptors", label: "Number of Load Receptors", type: "select", options: ["1 Receptor", "2 Receptors", "4 Load Cells Platform"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part II",
    },
    tests: [
      {
        test_code: "NAWI_CLASS_IIII_ERROR",
        test_name: "Class IIII Full Load MPE Test",
        description: "Maximum permissible error for Class IIII up to 50e is ±1e, 50e to 200e is ±2e.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.1,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Load Cell (GATC First Schedule Item 8)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "LOAD_CELL",
    name: "Load Cell",
    description: "Strain gauge, hydraulic and pneumatic force transducers used as weighing elements.",
    parent_category: "TRANSDUCERS_AND_SENSORS",
    units: ["kg", "t", "kN"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 8",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "rated_capacity", label: "Rated Capacity (Emax)", type: "text", placeholder: "e.g. 500 kg, 5 t, 20 t", required: true },
      { name: "accuracy_class", label: "Accuracy Class", type: "select", options: ["Class C1", "Class C2", "Class C3", "Class C4", "Class C6"], required: true },
      { name: "sensitivity_output", label: "Rated Output Sensitivity", type: "select", options: ["2.0 mV/V", "3.0 mV/V", "Digital (RS-485 / CAN)"], required: true },
      { name: "excitation_voltage", label: "Recommended Excitation Voltage", type: "text", placeholder: "10 V DC", required: true },
    ],
    validity: {
      initial_verification_period: 24,
      subsequent_verification_period: 24,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part XI",
    },
    tests: [
      {
        test_code: "LC_NON_LINEARITY",
        test_name: "Combined Non-Linearity & Hysteresis Test",
        description: "Verified on deadweight calibration machine. Error within Class C3 tolerance (±0.02% of full output).",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.02,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part XI",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Beam Scale (GATC First Schedule Item 9)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "BEAM_SCALE",
    name: "Beam Scale",
    description: "Equal-armed balance mechanisms with pan suspensions.",
    parent_category: "MECHANICAL_WEIGHING",
    units: ["kg", "g"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 9",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "beam_class", label: "Beam Scale Class", type: "select", options: ["Class A (Bullion & Jewellery)", "Class B (Chemist & Precision)", "Class C (Silk / High Retail)", "Class D (General Commercial)"], required: true },
      { name: "max_capacity", label: "Maximum Capacity", type: "select", options: ["50 g", "100 g", "500 g", "1 kg", "2 kg", "5 kg", "10 kg", "20 kg", "50 kg"], required: true },
      { name: "pan_material", label: "Pan Construction Material", type: "select", options: ["Brass Pans", "Stainless Steel Pans", "Aluminium Pans"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part II",
    },
    tests: [
      {
        test_code: "BEAM_SENSIBILITY_RECIPROCAL",
        test_name: "Sensibility Reciprocal (SR) Test at Capacity",
        description: "Rest point deflection tested by adding sensibility reciprocal weight.",
        formula: "observed <= reference ? 'PASS' : 'FAIL'",
        calculation_method: "MPE_BOUNDS",
        max_permissible_error: 0.05,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Counter Machine (GATC First Schedule Item 10)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "COUNTER_MACHINE",
    name: "Counter Machine",
    description: "Mechanical counter-top Roberval balances and pan mechanisms.",
    parent_category: "MECHANICAL_WEIGHING",
    units: ["kg", "g"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 10",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "max_capacity", label: "Capacity", type: "select", options: ["1 kg", "2 kg", "5 kg", "10 kg", "15 kg", "25 kg", "50 kg"], required: true },
      { name: "type_mechanism", label: "Roberval Mechanism Type", type: "select", options: ["Agate Bearings Roberval", "Steel Knife-Edge Lever"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part II",
    },
    tests: [
      {
        test_code: "COUNTER_ERROR_AT_MAX",
        test_name: "Maximum Load Permissible Error Test",
        description: "Error of indication verified at full load.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.08,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Weights — All Categories (GATC First Schedule Item 11)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "WEIGHTS_ALL",
    name: "Weights — All Categories",
    description: "Standard weights (Class E1, E2, F1, F2, M1, M2, M3) and bullion, iron, and brass commercial weights.",
    parent_category: "PHYSICAL_WEIGHTS",
    units: ["kg", "g", "mg"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 11",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "nominal_value", label: "Nominal Mass Value", type: "text", placeholder: "e.g. 50 kg, 20 kg, 5 kg, 500 g, 200 g, 100 g", required: true },
      { name: "accuracy_class", label: "OIML / National Accuracy Class", type: "select", options: ["Class M1 (General Commercial)", "Class M2 (Industrial)", "Class F2 (Fine Secondary)", "Class F1 (High Precision)", "Class E2 (Analytical Standard)"], required: true },
      { name: "material", label: "Material Construction", type: "select", options: ["Grey Cast Iron with Lead Cavity", "Forged Brass", "Non-Magnetic Stainless Steel", "Aluminium (Fractional Weights)"], required: true },
      { name: "set_type", label: "Single Weight or Weight Box Set", type: "select", options: ["Single Block Weight", "Full Boxed Weight Set (1 mg - 500 g)", "Bar Weight"], required: true },
    ],
    validity: {
      initial_verification_period: 24,
      subsequent_verification_period: 24,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule I & Schedule VII",
    },
    tests: [
      {
        test_code: "WEIGHT_TRUE_MASS_MPE",
        test_name: "Conventional Mass Verification against National Standards",
        description: "Compared on mass comparator against higher order working standard weight. MPE in mg according to Schedule I.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 100.0, // mg (example for 1kg Class M1 is ±160 mg)
        units: "mg",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule I",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Gas Meter (GATC First Schedule Item 12)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "GAS_METER",
    name: "Gas Meter",
    description: "Diaphragm, rotary displacement and turbine gas meters for measuring volume of fuel gas supplied.",
    parent_category: "FLOW_AND_VOLUMETRIC_MEASUREMENT",
    units: ["m³"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 12",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "meter_type", label: "Gas Meter Operating Principle", type: "select", options: ["Diaphragm Gas Meter", "Rotary Positive Displacement", "Turbine Meter", "Ultrasonic Gas Meter"], required: true },
      { name: "nominal_size", label: "Nominal Size G-Rating", type: "select", options: ["G1.6 (Domestic)", "G2.5 (Domestic)", "G4 (Domestic / Commercial)", "G6 (Commercial)", "G10 (Commercial / Industrial)", "G16", "G25", "G40+"], required: true },
      { name: "gas_type", label: "Gas Distribution Type", type: "select", options: ["Piped Natural Gas (PNG)", "Liquefied Petroleum Gas (LPG Vapor)", "Biogas", "Industrial Compressed Gas"], required: true },
      { name: "qmax", label: "Maximum Flowrate Qmax (m³/h)", type: "text", required: true },
      { name: "qmin", label: "Minimum Flowrate Qmin (m³/h)", type: "text", required: true },
    ],
    validity: {
      initial_verification_period: 60, // 5 years under 2025 General Rules Volumetric insertion
      subsequent_verification_period: 60,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Rule 27 read with 2025 volumetric meter insertion",
    },
    tests: [
      {
        test_code: "GAS_METER_MPE_QMAX",
        test_name: "Accuracy of Indication at Qmax",
        description: "Tested with bell prover or sonic nozzle standard. MPE is ±2.0% between 0.1 Qmax and Qmax.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 2.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VII",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Energy Meter (GATC First Schedule Item 13)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "ENERGY_METER",
    name: "Energy Meter",
    description: "Static electronic and mechanical alternating current watt-hour meters for active electrical energy measurement.",
    parent_category: "ELECTRICAL_MEASUREMENT",
    units: ["kWh", "kVAh"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 13",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "meter_type", label: "Meter Connection Phase", type: "select", options: ["Single Phase 2-Wire Static", "Three Phase 4-Wire Whole Current", "Three Phase 4-Wire CT/PT Operated"], required: true },
      { name: "accuracy_class", label: "Accuracy Class", type: "select", options: ["Class 1.0", "Class 0.5S", "Class 0.2S", "Class 2.0"], required: true },
      { name: "current_rating", label: "Rated Basic & Max Current (Ib / Imax)", type: "select", options: ["5-30 A", "10-60 A", "5-10 A (CT Operated)", "20-100 A"], required: true },
      { name: "rated_voltage", label: "Rated Voltage (V)", type: "select", options: ["240 V (1-Phase)", "415 V (3-Phase)"], required: true },
      { name: "meter_constant", label: "Meter Constant (imp/kWh)", type: "text", placeholder: "e.g. 3200 imp/kWh", required: true },
    ],
    validity: {
      initial_verification_period: 60,
      subsequent_verification_period: 60,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Legal Metrology (General) Rules, 2011",
    },
    tests: [
      {
        test_code: "EM_PERCENTAGE_ERROR_PF1",
        test_name: "Percentage Error at Unity Power Factor (UPF)",
        description: "Tested against electronic reference standard meter at rated current and UPF. MPE for Class 1.0 is ±1.0%.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 1.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Legal Metrology (General) Rules, 2011",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Moisture Meter (GATC First Schedule Item 14)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "MOISTURE_METER",
    name: "Moisture Meter",
    description: "Electronic instruments for determining moisture content in agricultural foodgrains, pulses, and oilseeds.",
    parent_category: "AGRI_COMMODITY_TESTING",
    units: ["%"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 14",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "measurement_principle", label: "Measurement Principle", type: "select", options: ["Capacitance Dielectric", "Electrical Resistance", "Near Infrared (NIR)"], required: true },
      { name: "commodity_scope", label: "Commodities Tested", type: "text", placeholder: "Wheat, Paddy, Rice, Maize, Mustard, Soyabean", required: true },
      { name: "moisture_range", label: "Moisture Measurement Range (%)", type: "text", placeholder: "8% to 25%", required: true },
      { name: "resolution", label: "Digital Resolution", type: "select", options: ["0.1%", "0.01%"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part VIII",
    },
    tests: [
      {
        test_code: "MOISTURE_OVEN_METHOD_MPE",
        test_name: "Verification Error vs Standard Air Oven Method",
        description: "Compared against standard reference air oven method (ISO 712). MPE is ±0.3% up to 15% moisture and ±0.5% above 15%.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 0.3,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VIII, Clause 5",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Vehicle Speed Meter (GATC First Schedule Item 15)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "VEHICLE_SPEED_METER",
    name: "Vehicle Speed Meter",
    description: "Doppler radar, laser LIDAR and automatic camera speed measuring devices used for enforcement of traffic laws.",
    parent_category: "SPEED_AND_MOTION_MEASUREMENT",
    units: ["km/h"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 15",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "technology", label: "Detection Technology", type: "select", options: ["Doppler Radar (24 GHz / 34 GHz)", "Laser LIDAR (Time-of-Flight)", "In-Pavement Piezoelectric Sensor", "Optical Average Speed Camera"], required: true },
      { name: "speed_range", label: "Speed Measuring Range", type: "text", placeholder: "10 km/h to 250 km/h", required: true },
      { name: "installation_type", label: "Mounting Type", type: "select", options: ["Fixed Overhead Gantry", "Tripod Mobile Enforcement", "In-Vehicle Dash Mount"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part X",
    },
    tests: [
      {
        test_code: "SPEED_METER_MPE",
        test_name: "Speed Measurement Accuracy Test",
        description: "Verified on tuning fork or radar simulator. MPE is ±1 km/h for speeds up to 100 km/h and ±1.0% for speeds exceeding 100 km/h.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 1.0,
        units: "km/h",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part X, Clause 4",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Breath Analyser (GATC First Schedule Item 16)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "BREATH_ANALYSER",
    name: "Breath Analyser",
    description: "Evidential breath alcohol measuring instruments for determining breath alcohol concentration (BAC).",
    parent_category: "MEDICAL_MEASURING_INSTRUMENTS",
    units: ["mg/100mL", "g/210L", "mg/L"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 16",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "sensor_type", label: "Sensor Technology", type: "select", options: ["Fuel Cell Electrochemical", "Dual Sensor (Fuel Cell + Infrared)", "Semiconductor"], required: true },
      { name: "measuring_range", label: "Measurement Range (BAC)", type: "text", placeholder: "0.00 to 400 mg/100mL", required: true },
      { name: "sample_volume_min", label: "Minimum Breath Sample Volume", type: "select", options: ["1.2 Litres", "1.5 Litres"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part IX",
    },
    tests: [
      {
        test_code: "BREATH_ALCOHOL_MPE",
        test_name: "Simulated Breath Standard Gas Test",
        description: "Verified with certified dry gas alcohol standard (Ethanol in Nitrogen). MPE is ±0.02 mg/L or ±5% whichever is greater.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 2.0, // mg/100mL
        units: "mg/100mL",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part IX, Clause 5",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Multi-Dimensional Measuring Instrument (GATC First Schedule Item 17)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "MULTI_DIMENSIONAL_MEASURING",
    name: "Multi-Dimensional Measuring Instrument",
    description: "Automated volumetric dimensioning scanners measuring length, width and height of freight packages.",
    parent_category: "LOGISTICS_MEASUREMENT",
    units: ["cm", "mm"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 17",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "measuring_technology", label: "Scanning Technology", type: "select", options: ["Laser Time-of-Flight", "3D Structured Light Camera", "Optical Light Curtain"], required: true },
      { name: "max_dimensions", label: "Maximum Box Dimension (L x W x H in cm)", type: "text", placeholder: "e.g. 120 x 80 x 80 cm", required: true },
      { name: "smallest_dimension", label: "Smallest Dimension Resolvable (cm)", type: "text", placeholder: "e.g. 5 cm", required: true },
      { name: "conveyor_speed", label: "Conveyor Belt Speed (m/s)", type: "text", placeholder: "Static / 1.5 m/s In-Motion", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Legal Metrology (General) Rules, 2011",
    },
    tests: [
      {
        test_code: "MDM_DIMENSION_ERROR",
        test_name: "Calibrated Standard Box Dimensioning Test",
        description: "Scanned with standard rectangular test prisms. MPE is ±1d (typically ±5 mm).",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 5.0,
        units: "mm",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Legal Metrology (General) Rules, 2011",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. Flow Meter (GATC First Schedule Item 18)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "FLOW_METER",
    name: "Flow Meter",
    description: "Liquid and gas flow meters (Coriolis, ultrasonic, turbine, positive displacement) for pipeline and commercial custody transfer.",
    parent_category: "FLOW_AND_VOLUMETRIC_MEASUREMENT",
    units: ["L/min", "m³/h", "kg/h"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 18",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "flow_medium", label: "Measured Fluid / Medium", type: "select", options: ["Petroleum & Hydrocarbons", "Water & Aqueous Solutions", "Industrial Chemical", "Compressed Gas"], required: true },
      { name: "measuring_principle", label: "Measuring Principle", type: "select", options: ["Coriolis Mass Flow Meter", "Electromagnetic Flow Meter", "Ultrasonic Transit Time", "Positive Displacement Oval Gear", "Turbine Flow Meter"], required: true },
      { name: "nominal_diameter", label: "Nominal Pipe Diameter (DN)", type: "select", options: ["DN25 (1\")", "DN50 (2\")", "DN80 (3\")", "DN100 (4\")", "DN150 (6\")", "DN200 (8\")", "DN300 (12\")"], required: true },
      { name: "max_flow_rate", label: "Maximum Flow Rate (Qmax)", type: "text", placeholder: "e.g. 100 m³/h or 1500 L/min", required: true },
      { name: "operating_pressure", label: "Operating Pressure (bar)", type: "text", placeholder: "e.g. 16 bar", required: true },
    ],
    validity: {
      initial_verification_period: 24,
      subsequent_verification_period: 24,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part XII",
    },
    tests: [
      {
        test_code: "FLOW_ACCURACY_MPE",
        test_name: "Prover Loop Calibration Accuracy Test",
        description: "Calibrated against volumetric or gravimetric prover loop standard. MPE is ±0.2% for Class 0.3 custody transfer.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.2,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part XII",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Petrol/Diesel Dispenser (GATC First Schedule Item 19)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "PETROL_DIESEL_DISPENSER",
    name: "Petrol/Diesel Dispenser",
    description: "Commercial multi-product and single-product fuel dispensing units at retail fuel outlets.",
    parent_category: "FUEL_DISPENSING_SYSTEMS",
    units: ["L", "mL"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 19",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "dispenser_type", label: "Dispenser Architecture", type: "select", options: ["Multi-Product Dispenser (MPD)", "Single Product Duo Nozzle", "High-Speed Diesel Dispenser (Heavy Vehicles)", "Submersible Pump Connected"], required: true },
      { name: "nozzle_count", label: "Number of Active Nozzles", type: "select", options: ["1 Nozzle", "2 Nozzles", "4 Nozzles", "6 Nozzles", "8 Nozzles"], required: true },
      { name: "fuel_types_dispensed", label: "Fuel Types Dispensed", type: "text", placeholder: "Motor Spirit (MS Petrol), High Speed Diesel (HSD), Premium Petrol", required: true },
      { name: "rated_flow_rate", label: "Rated Flow Rate (L/min)", type: "select", options: ["Standard (40 - 50 L/min)", "High-Flow Diesel (70 - 90 L/min)", "Ultra-High Heavy Duty (120 L/min)"], required: true },
      { name: "retail_outlet_name", label: "Retail Outlet / Station Name", type: "text", required: true },
      { name: "omc_company", label: "Oil Marketing Company (OMC)", type: "select", options: ["Indian Oil Corporation (IOCL)", "Bharat Petroleum (BPCL)", "Hindustan Petroleum (HPCL)", "Reliance / Nayara", "Shell", "Private Commercial"], required: true },
      { name: "nozzle_identifiers", label: "Nozzle Identification Numbers / Codes", type: "text", placeholder: "e.g. N1(MS), N2(MS), N3(HSD), N4(HSD)", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part VI",
    },
    tests: [
      {
        test_code: "FUEL_MAX_FLOW_MPE",
        test_name: "Accuracy of Delivery at Maximum Flow Rate (5L / 10L / 20L)",
        description: "Three consecutive deliveries into certified standard measure. MPE is ±0.05% (±10 mL on 20 L or ±25 mL on 50 L).",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.05,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VI, Clause 3",
      },
      {
        test_code: "FUEL_MIN_FLOW_MPE",
        test_name: "Accuracy of Delivery at Minimum Flow Rate",
        description: "Delivery at minimum operational flow rate. MPE is ±0.1% (±20 mL on 20 L measure).",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.1,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VI, Clause 3",
      },
      {
        test_code: "FUEL_TOTALIZER_SECURITY",
        test_name: "Electronic & Mechanical Totalizer Audit",
        description: "Parity verification between electronic transaction counter and non-resettable mechanical register.",
        formula: "observed === reference ? 'PASS' : 'FAIL'",
        calculation_method: "MPE_BOUNDS",
        max_permissible_error: 0.0,
        units: "L",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VI, Clause 5",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. CNG Dispenser (GATC First Schedule Item 20)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "CNG_DISPENSER",
    name: "CNG Dispenser",
    description: "Compressed natural gas mass flow meters and vehicle dispensers.",
    parent_category: "FUEL_DISPENSING_SYSTEMS",
    units: ["kg"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 20",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "dispenser_mode", label: "Dispensing Lines", type: "select", options: ["Single Hose CNG", "Dual Hose CNG", "Sequential 3-Bank Cascade"], required: true },
      { name: "filling_pressure", label: "Working Filling Pressure", type: "select", options: ["200 bar (2900 psi)", "250 bar (3600 psi)"], required: true },
      { name: "measuring_system", label: "Mass Flow Meter Principle", type: "text", placeholder: "Micro Motion Coriolis Mass Flow Meter", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part VI",
    },
    tests: [
      {
        test_code: "CNG_DELIVERY_MPE",
        test_name: "CNG Gravimetric Delivery Test with High-Pressure Cylinder",
        description: "Verified by mass comparison on calibrated high-precision platform balance. MPE is ±1.0% of delivered mass.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 1.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VI",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. LPG Dispenser (GATC First Schedule Item 21)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "LPG_DISPENSER",
    name: "LPG Dispenser",
    description: "Auto-LPG measuring systems and liquid fuel dispensers under pressure.",
    parent_category: "FUEL_DISPENSING_SYSTEMS",
    units: ["L", "kg"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 21",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "dispenser_type", label: "Dispenser Configuration", type: "select", options: ["Single Nozzle Auto-LPG", "Dual Nozzle Auto-LPG"], required: true },
      { name: "vapor_elimination", label: "Vapour Elimination & Return System", type: "text", placeholder: "Differential Pressure Differential Valve & Vapour Return", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part VI",
    },
    tests: [
      {
        test_code: "LPG_DELIVERY_MPE",
        test_name: "Auto-LPG Pressurised Prover Volumetric Test",
        description: "Delivery into closed pressurised piston prover with temperature & pressure compensation. MPE is ±0.5%.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.5,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VI",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. LNG Dispenser (GATC First Schedule Item 22)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "LNG_DISPENSER",
    name: "LNG Dispenser",
    description: "Cryogenic liquefied natural gas dispensers for heavy transport vehicles.",
    parent_category: "FUEL_DISPENSING_SYSTEMS",
    units: ["kg"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 22",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "cryogenic_temp", label: "Cryogenic Temperature Range", type: "text", placeholder: "-162°C to -130°C", required: true },
      { name: "measuring_system", label: "Cryogenic Coriolis Sensor", type: "text", placeholder: "Insulated Vacuum Jacketed Coriolis Mass Meter", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part VI",
    },
    tests: [
      {
        test_code: "LNG_CRYOGENIC_MPE",
        test_name: "LNG Gravimetric Scale Comparison Test",
        description: "Gravimetric delivery verification on calibrated weighbridge. MPE is ±1.5%.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 1.5,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VI",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Hydrogen Dispenser (GATC First Schedule Item 23)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "HYDROGEN_DISPENSER",
    name: "Hydrogen Dispenser",
    description: "Gaseous hydrogen fuel dispensers for fuel cell electric vehicles (FCEV) at 35 MPa and 70 MPa.",
    parent_category: "FUEL_DISPENSING_SYSTEMS",
    units: ["kg"],
    is_gatc_eligible: true,
    applicable_authorities: "LMO,GATC",
    source_document: CENTRAL_GATC_SOURCE,
    source_rule: "First Schedule, Item 23",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "pressure_class", label: "Dispenser Pressure Rating", type: "select", options: ["H35 (350 bar / 35 MPa)", "H70 (700 bar / 70 MPa)"], required: true },
      { name: "pre_cooling_temperature", label: "Pre-Cooling Category", type: "select", options: ["T40 (-40°C)", "T20 (-20°C)"], required: true },
      { name: "nozzle_type", label: "Breakaway & Nozzle Standard", type: "text", placeholder: "SAE J2601 / ISO 19880-1", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part VI",
    },
    tests: [
      {
        test_code: "H2_GRAVIMETRIC_MPE",
        test_name: "Hydrogen Gravimetric Prover Test",
        description: "Delivered into certified high-pressure hydrogen cylinder bank measured on high-precision comparator. MPE is ±2.0%.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 2.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part VI",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. NAWI — Accuracy Class I & II (Non-GATC Central Schedule -> LMO ONLY)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "NAWI_CLASS_I_II",
    name: "Non-Automatic Weighing Instrument — Accuracy Class I & II (High / Special Precision)",
    description: "Analytical balances, micro-balances, and precision gold/diamond balances. Not listed in GATC First Schedule; legally reserved for gazetted Legal Metrology Officers.",
    parent_category: "WEIGHING_INSTRUMENTS",
    units: ["g", "mg", "ct"],
    is_gatc_eligible: false,
    applicable_authorities: "LMO",
    source_document: "Legal Metrology (General) Rules, 2011",
    source_rule: "Schedule VII, Part II (Omitted from GATC First Schedule)",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "precision_class", label: "Accuracy Class", type: "select", options: ["Class I (Special Accuracy - Analytical)", "Class II (High Accuracy - Bullion / Gemstone)"], required: true },
      { name: "max_capacity", label: "Maximum Capacity (Max)", type: "text", placeholder: "e.g. 220 g, 500 g, 1 kg", required: true },
      { name: "scale_interval_d", label: "Actual Scale Interval (d)", type: "select", options: ["0.1 mg (0.0001 g)", "1 mg (0.001 g)", "10 mg (0.01 g)"], required: true },
      { name: "internal_calibration", label: "Internal Automated Calibration Mechanism", type: "select", options: ["Motorized Internal Weight Calibration", "External Calibration Only"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part II",
    },
    tests: [
      {
        test_code: "NAWI_CLASS_I_MPE",
        test_name: "Class I Precision Error of Indication Test",
        description: "Verified with certified Class E2 weights under climate-controlled conditions. MPE is ±0.5e for loads up to 50,000e.",
        formula: "Math.abs(observed - reference)",
        calculation_method: "DIFFERENCE",
        max_permissible_error: 0.5,
        units: "e",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. NAWI — Class III Over 150 kg (Platform / Weighbridges) (LMO ONLY)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "NAWI_CLASS_III_OVER_150KG",
    name: "Non-Automatic Weighing Instrument — Accuracy Class III above 150 kg",
    description: "Heavy platform scales, crane scales and road weighbridges over 150 kg capacity. Not covered by Item 6 of GATC First Schedule.",
    parent_category: "HEAVY_WEIGHING_INSTRUMENTS",
    units: ["kg", "t"],
    is_gatc_eligible: false,
    applicable_authorities: "LMO",
    source_document: "Legal Metrology (General) Rules, 2011",
    source_rule: "Schedule VII, Part II (Above 150kg threshold of GATC Schedule)",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "max_capacity", label: "Maximum Capacity (Max)", type: "select", options: ["300 kg", "500 kg", "1000 kg (1 t)", "2000 kg (2 t)", "5000 kg (5 t)", "20 t", "50 t", "100 t (Road Weighbridge)"], required: true },
      { name: "scale_interval_e", label: "Verification Scale Interval (e)", type: "select", options: ["50 g", "100 g", "200 g", "500 g", "1 kg", "2 kg", "5 kg", "10 kg", "20 kg"], required: true },
      { name: "platform_dimensions", label: "Platform Dimensions (L x W in metres)", type: "text", placeholder: "e.g. 1.5 x 1.5 m or 16 x 3 m (Pitless Weighbridge)", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part II",
    },
    tests: [
      {
        test_code: "HEAVY_NAWI_CAPACITY_MPE",
        test_name: "Heavy Capacity Multi-Point Verification Test",
        description: "Verified using mobile weight testing lorry with Class M1 calibrated test weights.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.05,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part II",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. Taximeter (LMO ONLY)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "TAXIMETER",
    name: "Digital Fare Taximeter",
    description: "Electronic distance and waiting-time fare calculating taximeters installed in commercial motor cabs and autorickshaws.",
    parent_category: "SPEED_AND_MOTION_MEASUREMENT",
    units: ["km", "min", "₹"],
    is_gatc_eligible: false,
    applicable_authorities: "LMO",
    source_document: "Legal Metrology (General) Rules, 2011",
    source_rule: "Schedule VII, Part XIII (Omitted from GATC Schedule)",
    source_notification: CENTRAL_GATC_NOTIFICATION,
    field_schema: [
      { name: "vehicle_registration", label: "Vehicle Commercial Registration No.", type: "text", placeholder: "DL-1RT-4521", required: true },
      { name: "k_constant", label: "Taximeter Constant (k imp/km)", type: "text", placeholder: "e.g. 4000 imp/km", required: true },
      { name: "vehicle_type", label: "Vehicle Type", type: "select", options: ["Autorickshaw (TSR)", "Motor Cab Taxi", "App-Based Commercial Fleet"], required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: GENERAL_RULES_SOURCE,
      source_rule: "Schedule VII, Part XIII",
    },
    tests: [
      {
        test_code: "TAXI_TRACK_RUN_MPE",
        test_name: "1000 Metre Road Track Run Distance Test",
        description: "Tested over calibrated 1 km straight roadway course. MPE is ±1.0% on distance.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 1.0,
        units: "%",
        mandatory: true,
        source_document: GENERAL_RULES_SOURCE,
        source_rule: "Schedule VII, Part XIII",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. State Prescribed Category (Maharashtra State GATC Framework Extension)
  // ──────────────────────────────────────────────────────────────────────────
  {
    code: "STATE_MILK_METER",
    name: "Bulk Milk Chiller & Flow Quantity Meter (State Prescribed)",
    description: "Prescribed under State Legal Metrology Enforcement Rules by Government of Maharashtra for cooperative dairy collection centres.",
    parent_category: "STATE_CUSTOM_SCHEDULE",
    units: ["L", "kg"],
    is_gatc_eligible: true, // Eligible in State of Maharashtra
    applicable_authorities: "LMO,GATC",
    source_document: "Maharashtra Legal Metrology (Enforcement) Rules read with GATC State Extension",
    source_rule: "Rule 14-A State Schedule",
    source_notification: "State Gazette Notif. LM/MH/2025/119",
    state_code: "MH",
    jurisdiction_type: "STATE",
    field_schema: [
      { name: "chiller_capacity", label: "Bulk Milk Cooler Tank Capacity (L)", type: "select", options: ["1000 L", "2000 L", "5000 L", "10000 L"], required: true },
      { name: "fat_measuring_integration", label: "Electronic Milk Analyzer / Fat Tester Integrated", type: "select", options: ["Yes (Integrated Dipstick & Sensor)", "Standalone Quantity Meter"], required: true },
      { name: "dairy_society_name", label: "Primary Dairy Cooperative Society", type: "text", required: true },
    ],
    validity: {
      initial_verification_period: 12,
      subsequent_verification_period: 12,
      period_unit: "MONTHS",
      source_document: "Maharashtra Legal Metrology Enforcement Rules",
      source_rule: "Rule 14-A",
    },
    tests: [
      {
        test_code: "MILK_TANK_DIPSTICK_MPE",
        test_name: "Volumetric Calibration of Dipstick & Sight Gauge",
        description: "Tested with 200L volumetric prover cans. MPE is ±0.25% of indicated volume.",
        formula: "((observed - reference) / reference) * 100",
        calculation_method: "ERROR_PERCENTAGE",
        max_permissible_error: 0.25,
        units: "%",
        mandatory: true,
        source_document: "Maharashtra Legal Metrology Enforcement Rules",
        source_rule: "Rule 14-A",
      },
    ],
  },
];

module.exports = {
  CENTRAL_GATC_NOTIFICATION,
  CENTRAL_GATC_SOURCE,
  GENERAL_RULES_SOURCE,
  COMMON_DOCUMENTS,
  COMMON_CHECKLIST,
  CATEGORIES_DATA,
};
