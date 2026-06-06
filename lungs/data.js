const PULMO_DATA = {
  pathogens: [
    {
      id: "s_pneumoniae",
      name: "Streptococcus pneumoniae",
      scientificName: "Streptococcus pneumoniae",
      type: "Bacteria",
      gramStain: "Gram-positive, lancet-shaped diplococci",
      transmission: "Inhalation of respiratory droplets",
      studentSummary: "The most common cause of community-acquired bacterial pneumonia. Often called Pneumococcus. Classically causes sudden-onset shaking chills, high fever, and cough producing rust-colored sputum.",
      medSummary: "Encapsulated Gram-positive cocci in pairs. Key cause of lobar pneumonia. Demonstrates alpha-hemolysis (greenish zone) on blood agar, optochin sensitivity, and bile solubility.",
      typicalLobe: "lobar",
      typicalLobeName: "Lobar consolidation (any lobe, often lower lobes)",
      virulenceFactors: [
        { name: "Polysaccharide Capsule", desc: "Prevents phagocytosis by immune cells; essential for virulence." },
        { name: "IgA Protease", desc: "Cleaves secretory IgA, allowing bacterial attachment to mucosal membranes." },
        { name: "Pneumolysin", desc: "Cytotoxin that binds cholesterol in host cell membranes, forming pores and damaging ciliated cells." }
      ],
      symptoms: ["Sudden high fever", "Shaking chills", "Rust-colored sputum", "Pleuritic chest pain", "Dyspnea"],
      auscultation: "Coarse crackles, bronchial breath sounds, increased tactile fremitus, and dullness to percussion over the consolidated area."
    },
    {
      id: "m_pneumoniae",
      name: "Mycoplasma pneumoniae",
      scientificName: "Mycoplasma pneumoniae",
      type: "Atypical Bacteria",
      gramStain: "Gram-invisible (lacks a peptidoglycan cell wall; membrane contains sterols)",
      transmission: "Respiratory droplets, close contact in crowded environments",
      studentSummary: "The classic cause of 'walking' or atypical pneumonia. Usually affects young people in dorms, schools, or military barracks. Symptoms are mild, starting with a headache and sore throat, followed by a persistent dry cough.",
      medSummary: "Lacks a cell wall, making it naturally resistant to beta-lactam antibiotics. Stains poorly. Diagnosis confirmed by PCR or cold agglutinins (IgM antibodies). Associated with Erythema Multiforme.",
      typicalLobe: "patchy",
      typicalLobeName: "Patchy, diffuse interstitial infiltrates (bilateral)",
      virulenceFactors: [
        { name: "P1 Adhesin", desc: "Binds to sialic acid receptors on ciliated respiratory epithelial cells, causing ciliostasis." },
        { name: "CARDS Toxin", desc: "Community-Acquired Respiratory Distress Syndrome toxin, induces cell vacuolation, inflammation, and epithelial desquamation." }
      ],
      symptoms: ["Persistent dry, hacking cough", "Low-grade fever", "Headache", "Sore throat", "Malaise"],
      auscultation: "Often surprisingly clear, or reveals scattered mild wheezes and rhonchi, inconsistent with the severity seen on X-ray."
    },
    {
      id: "k_pneumoniae",
      name: "Klebsiella pneumoniae",
      scientificName: "Klebsiella pneumoniae",
      type: "Bacteria",
      gramStain: "Gram-negative, encapsulated, plump rods (bacilli)",
      transmission: "Aspiration of oral secretions, common in hospitalized or weakened patients",
      studentSummary: "A severe bacterial pneumonia that typically strikes chronic alcoholics, diabetics, and compromised hosts. It causes tissue death in the lungs, leading to a characteristically thick, red 'currant-jelly' sputum.",
      medSummary: "Lactose-fermenting, urease-positive Gram-negative bacillus. Possesses a massive mucoid capsule. Frequently causes necrotizing pneumonia with early lung abscesses and cavitation.",
      typicalLobe: "upper-bulging",
      typicalLobeName: "Upper lobe consolidation with bulging fissure sign",
      virulenceFactors: [
        { name: "Large Polysaccharide Capsule", desc: "Gives colonies a mucoid appearance; provides high resistance to phagocytosis and complement lysis." },
        { name: "LPS (Endotoxin)", desc: "Triggers intense inflammatory response, leading to tissue damage, necrosis, and potentially septic shock." }
      ],
      symptoms: ["High fever", "Thick, dark-red 'currant-jelly' sputum", "Severe shortness of breath", "Cough with chest tissue necrosis", "Pleuritic pain"],
      auscultation: "Decreased breath sounds over cavitary lesions, coarse rales, and signs of pleural effusion (dullness, decreased fremitus)."
    },
    {
      id: "l_pneumophila",
      name: "Legionella pneumophila",
      scientificName: "Legionella pneumophila",
      type: "Atypical Bacteria",
      gramStain: "Gram-negative rod, but stains poorly (silver stain preferred)",
      transmission: "Inhalation of aerosols from contaminated water systems (air conditioning, mists, showers)",
      studentSummary: "Causes Legionnaires' disease. It does not spread person-to-person but is inhaled from water sources like air conditioning towers. In addition to pneumonia, it uniquely causes watery diarrhea, high fever, and confusion.",
      medSummary: "Aerobic intracellular Gram-negative rod. Cultured on Buffered Charcoal Yeast Extract (BCYE) agar with iron and cysteine. Diagnosed via urine antigen test. Classically causes hyponatremia (SIADH).",
      typicalLobe: "lower-consolidation",
      typicalLobeName: "Unilateral or bilateral patchy lower lobe consolidations",
      virulenceFactors: [
        { name: "Mip (Macrophage Infectivity Promoter)", desc: "Facilitates entry into alveolar macrophages, where the bacteria live and replicate intracellularly." },
        { name: "Dot/Icm Type IV Secretion", desc: "Injects effector proteins into the host cell to prevent phagosome-lysosome fusion, enabling intracellular survival." }
      ],
      symptoms: ["High fever & bradycardia", "Watery diarrhea & abdominal pain", "Confusion & headache", "Dry or slightly productive cough", "Low blood sodium (Hyponatremia)"],
      auscultation: "Diffuse crackles and rales, often progressing to signs of consolidation in the lower lobes."
    },
    {
      id: "m_tuberculosis",
      name: "Mycobacterium tuberculosis",
      scientificName: "Mycobacterium tuberculosis",
      type: "Acid-Fast Bacteria",
      gramStain: "Acid-fast bacillus (highly lipid-rich mycolic acid cell wall)",
      transmission: "Inhalation of droplet nuclei (airborne transmission)",
      studentSummary: "The agent of Tuberculosis (TB). It is a slow-growing bacterium that causes chronic symptoms like night sweats, weight loss, and coughing up blood. Can lie dormant in the body for years before reactivating.",
      medSummary: "Obligate aerobe. Survives in macrophages. Characterized histologically by caseating granulomas with Langhans giant cells. Reactivation typically occurs in the upper lobes due to high oxygen tension.",
      typicalLobe: "cavitary-upper",
      typicalLobeName: "Upper lobes cavitary lesions (reactivation) or Ghon complex (primary)",
      virulenceFactors: [
        { name: "Mycolic Acid Wall", desc: "Provides resistance to dehydration, chemical disinfectants, Gram staining, and phagocytic destruction." },
        { name: "Cord Factor (Trehalose Dimycolate)", desc: "Inhibits neutrophil migration and damages mitochondria; induces granuloma formation." },
        { name: "Sulfatides", desc: "Glycolipids that directly inhibit phagosome-lysosome fusion, allowing intracellular survival in macrophages." }
      ],
      symptoms: ["Chronic cough > 3 weeks", "Hemoptysis (coughing blood)", "Drenching night sweats", "Unintentional weight loss", "Low-grade afternoon fever"],
      auscultation: "Post-tussive apical crackles (crackles heard in the upper lobes after coughing), bronchial breath sounds over cavities."
    },
    {
      id: "p_jirovecii",
      name: "Pneumocystis jirovecii",
      scientificName: "Pneumocystis jirovecii",
      type: "Fungi",
      gramStain: "Gram-invisible yeast-like fungus (silver stain shows cup/crescent-shaped cysts)",
      transmission: "Inhalation of airborne cysts, opportunistic pathogen",
      studentSummary: "An opportunistic lung infection that only strikes people with weakened immune systems, particularly HIV patients with very low CD4 cell counts. It causes slowly progressive shortness of breath and a dry cough.",
      medSummary: "Atypical fungus (lacks ergosterol, cell wall has beta-glucan). Classically affects HIV patients with CD4 < 200. Stained with Gomori methenamine silver (GMS). Diagnosed by bronchoalveolar lavage.",
      typicalLobe: "bat-wing",
      typicalLobeName: "Bilateral ground-glass opacities (bat-wing distribution)",
      virulenceFactors: [
        { name: "Major Surface Glycoprotein (MSG)", desc: "Undergoes antigenic variation to evade host humoral immune response and mediates attachment to alveolar type I pneumocytes." }
      ],
      symptoms: ["Progressive dyspnea on exertion", "Dry, non-productive cough", "Fever", "Severe hypoxia (low oxygen) during exercise", "Chest tightness"],
      auscultation: "Lungs are often completely clear to auscultation, or show minimal bilateral dry crackles, despite severe shortness of breath."
    }
  ],

  drugs: [
    {
      id: "ceftriaxone",
      name: "Ceftriaxone",
      class: "Beta-Lactam Antibiotic (3rd Gen Cephalosporin)",
      mechanism: "Inhibits cell wall synthesis by binding to Penicillin-Binding Proteins (PBPs), preventing peptidoglycan cross-linking.",
      studentDesc: "A powerful injectable antibiotic used to treat standard bacterial infections. It works by attacking and breaking down the bacterial cell wall, causing the bacteria to burst.",
      medDesc: "Binds transpeptidase enzymes (PBPs) in the cell membrane. Bactericidal. Resistant to many beta-lactamases. First-line empiric treatment for Community-Acquired Pneumonia, usually combined with Azithromycin to cover atypicals.",
      targets: ["s_pneumoniae"]
    },
    {
      id: "azithromycin",
      name: "Azithromycin",
      class: "Macrolide Antibiotic",
      mechanism: "Reversibly binds to the 50S ribosomal subunit, blocking bacterial protein synthesis.",
      studentDesc: "Commonly known as a 'Z-Pak'. It halts the growth of bacteria by stopping them from producing essential proteins. Highly effective against 'atypical' bacteria that lack cell walls.",
      medDesc: "Blocks translocation and peptide bond formation by binding 23S rRNA of the 50S subunit. Bacteriostatic. Concentrates heavily in macrophages and lung tissues. Active against Mycoplasma, Chlamydia, and Legionella.",
      targets: ["m_pneumoniae", "l_pneumophila"]
    },
    {
      id: "levofloxacin",
      name: "Levofloxacin",
      class: "Fluoroquinolone (Respiratory Quinolone)",
      mechanism: "Inhibits DNA gyrase (Topoisomerase II) and Topoisomerase IV, preventing bacterial DNA replication and causing double-strand breaks.",
      studentDesc: "A broad-spectrum antibiotic that directly prevents bacteria from replicating their DNA. Used for severe respiratory tract infections because it penetrates lung tissue very well.",
      medDesc: "Bactericidal. Targets Topo II in Gram-negatives and Topo IV in Gram-positives. Excellent oral bioavailability and lung concentration. Active against both typical (S. pneumoniae) and atypical pathogens (Legionella, Mycoplasma). Carry risk of tendon rupture.",
      targets: ["s_pneumoniae", "m_pneumoniae", "l_pneumophila"]
    },
    {
      id: "ripe_therapy",
      name: "RIPE Regimen (Rifampin, Isoniazid, Pyrazinamide, Ethambutol)",
      class: "Combination Anti-Mycobacterial Therapy",
      mechanism: "Multiple targets: Rifampin inhibits RNA polymerase; Isoniazid inhibits mycolic acid synthesis; Pyrazinamide acidifies the cell; Ethambutol blocks cell wall arabinogalactan.",
      studentDesc: "A four-drug combination taken daily for 6+ months to treat active Tuberculosis. Using four drugs simultaneously prevents the bacteria from developing drug resistance.",
      medDesc: "Multi-drug regimen targeting different metabolic pathways of M. tuberculosis. Isoniazid requires KatG activation. Ethambutol causes optic neuritis (red-green blindness). Pyrazinamide causes gout. Rifampin is a CYP450 inducer.",
      targets: ["m_tuberculosis"]
    },
    {
      id: "tmp_smx",
      name: "TMP-SMX (Trimethoprim-Sulfamethoxazole)",
      class: "Sulfonamide Combination",
      mechanism: "Sequential block of bacterial folate synthesis: Sulfamethoxazole inhibits dihydropteroate synthase; Trimethoprim inhibits dihydrofolate reductase.",
      studentDesc: "Also known as Bactrim. It works by blocking the pathway bacteria and certain fungi use to produce folic acid, which is needed to make DNA. Used for Pneumocystis pneumonia.",
      medDesc: "Bactericidal in combination. Blocks tetrahydrofolate synthesis, preventing purine synthesis. Used both for prophylaxis (CD4 < 200) and high-dose treatment of Pneumocystis jirovecii pneumonia.",
      targets: ["p_jirovecii"]
    },
    {
      id: "albuterol_fluticasone",
      name: "Albuterol & Fluticasone",
      class: "Bronchodilator (SABA) & Inhaled Corticosteroid (ICS)",
      mechanism: "Albuterol activates Beta-2 adrenergic receptors to relax airway smooth muscle. Fluticasone inhibits NF-kB to suppress inflammatory cytokines.",
      studentDesc: "Rescue inhaler (Albuterol) to open closed airways during breathing attacks, plus a steroid controller (Fluticasone) to decrease swelling and mucus inside the breathing tubes.",
      medDesc: "Albuterol: Gs-protein agonist -> increases cAMP -> relaxes bronchial smooth muscle. Fluticasone: Glucocorticoid receptor agonist -> reduces transcription of inflammatory cytokines. Used for symptomatic bronchospasm relief, but does not treat the underlying infectious agent.",
      targets: []
    }
  ],

  cases: [
    {
      id: "case_1",
      title: "The Shaking Chills",
      vitals: { temp: "39.4°C (102.9°F)", hr: "112 bpm", rr: "26 bpm", bp: "118/74 mmHg", spo2: "91% on room air" },
      history: "A 68-year-old female presents to the emergency department with sudden onset of shaking chills, high fever, and a productive cough with thick, rust-colored sputum. She reports sharp, stabbing chest pain on the right side when taking deep breaths (pleuritic chest pain). She has a history of mild hypertension but is otherwise active.",
      physicalExam: "Auscultation of the right lower lung field reveals bronchial breath sounds and distinct coarse crackles (rales). Percussion reveals dullness in the same area. Tactile fremitus is increased over the right lower lobe.",
      auscultationSound: "crackles",
      gramStainDesc: "Sputum Gram stain reveals numerous neutrophils and Gram-positive, lancet-shaped diplococci.",
      gramStainPattern: "gpos_diplococci",
      xrayDesc: "Chest X-ray shows a dense, homogenous consolidation localized in the right lower lobe, confirming lobar pneumonia.",
      xrayPattern: "right_lower_lobar",
      correctPathogenId: "s_pneumoniae",
      correctDrugId: "ceftriaxone",
      explanation: "This patient is presenting with classic Community-Acquired Pneumonia caused by Streptococcus pneumoniae. The key indicators are the sudden onset of shaking chills, rust-colored sputum, right-sided lobar consolidation on X-ray, and Gram-positive lancet-shaped diplococci on sputum stain. The correct treatment is Ceftriaxone, a 3rd generation cephalosporin targeting the peptidoglycan cell wall."
    },
    {
      id: "case_2",
      title: "The Dorm Outbreak",
      vitals: { temp: "38.1°C (100.6°F)", hr: "88 bpm", rr: "18 bpm", bp: "120/80 mmHg", spo2: "97% on room air" },
      history: "A 19-year-old male college student presents to the student health center complaining of a dry, hacking, non-productive cough that has persisted for two weeks. It was preceded by a headache, sore throat, and a runny nose. Several of his dorm-mates have had similar lingering coughs. He feels fatigued but is still able to walk around and attend classes.",
      physicalExam: "Chest auscultation is notable for scattered, mild wheezes and rhonchi throughout both lungs, but is otherwise surprisingly clear. There are no signs of consolidation (normal percussion, normal fremitus).",
      auscultationSound: "wheeze",
      gramStainDesc: "Sputum Gram stain reveals abundant white blood cells (neutrophils) but no visible organisms.",
      gramStainPattern: "no_organisms",
      xrayDesc: "Chest X-ray shows diffuse, bilateral, patchy interstitial infiltrates radiating from the hilum, appearing far worse than the patient's mild clinical presentation.",
      xrayPattern: "diffuse_patchy",
      correctPathogenId: "m_pneumoniae",
      correctDrugId: "azithromycin",
      explanation: "This case is classic for 'walking' or atypical pneumonia caused by Mycoplasma pneumoniae. It typically occurs in young adults in close contact (dorms) and presents with a subacute dry cough. The pathogen lacks a cell wall, explaining why it is invisible on Gram stain and resistant to cell-wall inhibitors like Ceftriaxone. Azithromycin (a macrolide) is the correct therapy because it targets the 50S ribosome and acts intracellularly."
    },
    {
      id: "case_3",
      title: "The Bulging Fissure",
      vitals: { temp: "39.1°C (102.4°F)", hr: "118 bpm", rr: "28 bpm", bp: "105/60 mmHg", spo2: "89% on room air" },
      history: "A 52-year-old male is brought to the clinic by a social worker. He has a history of chronic alcohol use disorder and was found sleeping in a park. He presents with severe shortness of breath, high fever, and a cough producing thick, gelatinous, dark red sputum resembling 'currant jelly'. He appears malnourished and in respiratory distress.",
      physicalExam: "Auscultation of the right upper lung field shows significantly decreased breath sounds and coarse gurgling rales. The patient is using accessory muscles to breathe.",
      auscultationSound: "decreased",
      gramStainDesc: "Sputum Gram stain shows numerous Gram-negative bacilli (rods) with a thick, clear, unstained halo surrounding each rod (mucoid capsule).",
      gramStainPattern: "gneg_encapsulated",
      xrayDesc: "Chest X-ray shows a dense consolidation in the right upper lobe with a noticeable downward bulging of the minor fissure (bulging fissure sign), and early signs of cavity formation.",
      xrayPattern: "right_upper_bulging",
      correctPathogenId: "k_pneumoniae",
      correctDrugId: "levofloxacin",
      explanation: "This patient is suffering from necrotizing pneumonia caused by Klebsiella pneumoniae, a pathogen classically associated with chronic alcoholics, diabetics, and aspiration risk. The mucoid capsule is visible as a halo on Gram stain. The 'currant-jelly' sputum is due to tissue necrosis, which also explains the upper lobe bulging fissure sign and cavity. Levofloxacin (a respiratory fluoroquinolone) provides strong bactericidal coverage against Gram-negative bacilli like Klebsiella by inhibiting DNA gyrase."
    },
    {
      id: "case_4",
      title: "The Cruise Ship Illness",
      vitals: { temp: "39.9°C (103.8°F)", hr: "76 bpm (inappropriate relative bradycardia)", rr: "24 bpm", bp: "110/65 mmHg", spo2: "92% on room air" },
      history: "A 62-year-old male presents with high fever, confusion, a mild dry cough, and watery diarrhea. He returned 5 days ago from a 10-day cruise ship vacation. He is a former smoker with a history of COPD. Lab values are notable for a serum sodium of 128 mEq/L (normal: 135-145 mEq/L).",
      physicalExam: "Auscultation reveals crackles in both lower lung fields. The patient is confused and disoriented to time and place. Abdomen is soft but diffuse mild tenderness is noted.",
      auscultationSound: "crackles",
      gramStainDesc: "Sputum Gram stain shows many neutrophils but fails to show bacteria. Sputum cultured on Buffered Charcoal Yeast Extract (BCYE) agar yields growth.",
      gramStainPattern: "no_organisms_bcye",
      xrayDesc: "Chest X-ray shows patchy, multi-lobar consolidations mostly in the lower lobes.",
      xrayPattern: "lower_patchy",
      correctPathogenId: "l_pneumophila",
      correctDrugId: "levofloxacin",
      explanation: "This presentation represents Legionnaires' disease caused by Legionella pneumophila. It is linked to environmental water systems (cruise ship). The diagnostic clues are severe pneumonia, gastrointestinal symptoms (diarrhea), CNS symptoms (confusion), relative bradycardia (fever with normal heart rate), and hyponatremia (low sodium). Legionella is an atypical Gram-negative rod that stains poorly but grows on BCYE agar. Levofloxacin is highly effective because it concentrates inside macrophages where Legionella replicates."
    },
    {
      id: "case_5",
      title: "The Night Sweats",
      vitals: { temp: "37.9°C (100.2°F)", hr: "82 bpm", rr: "16 bpm", bp: "115/70 mmHg", spo2: "96% on room air" },
      history: "A 34-year-old male immigrant from Southeast Asia presents with a chronic cough that has lasted for over a month. He reports that the cough has recently become productive of blood-streaked sputum. He also reports a 12-lb unintentional weight loss, loss of appetite, and severe, drenching night sweats that force him to change his clothes.",
      physicalExam: "Auscultation reveals bronchial breath sounds and crackles localized in the upper apices of both lungs, particularly after the patient coughs (post-tussive apical crackles).",
      auscultationSound: "crackles",
      gramStainDesc: "Sputum Gram stain is non-diagnostic. However, acid-fast staining (Ziehl-Neelsen) reveals red, rod-like bacilli against a blue background.",
      gramStainPattern: "acid_fast",
      xrayDesc: "Chest X-ray shows cavitary lesions in the bilateral upper lobes of the lungs, consistent with reactivation disease.",
      xrayPattern: "upper_cavitary",
      correctPathogenId: "m_tuberculosis",
      correctDrugId: "ripe_therapy",
      explanation: "This clinical picture represents reactivation Tuberculosis (TB) caused by Mycobacterium tuberculosis. The classic triad of hemoptysis, weight loss, and night sweats in an immigrant from an endemic area points directly to TB. Reactivation TB typically localizes to the oxygen-rich upper lobes, resulting in cavitary lesions. The acid-fast stain is the definitive rapid diagnostic tool, and the correct treatment is the RIPE regimen."
    },
    {
      id: "case_6",
      title: "The Shortness of Breath",
      vitals: { temp: "38.5°C (101.3°F)", hr: "105 bpm", rr: "30 bpm", bp: "110/70 mmHg", spo2: "85% on room air (drops to 74% upon walking)" },
      history: "A 28-year-old male presents with severe, progressive shortness of breath over the past week and a dry, non-productive cough. He reports feeling feverish. On further history, he confesses to high-risk behaviors and has not seen a doctor in years. Pulse oximetry reveals severe hypoxia that worsens dramatically with mild exertion.",
      physicalExam: "Despite the patient's severe dyspnea and rapid breathing, chest auscultation is remarkably clear, showing only minimal, faint end-expiratory crackles bilaterally.",
      auscultationSound: "normal", // auscultation is nearly normal/faint
      gramStainDesc: "Gram stain is negative. Silver staining (GMS) of a bronchoalveolar lavage specimen shows cup-shaped or crushed ping-pong ball-shaped cysts.",
      gramStainPattern: "silver_cysts",
      xrayDesc: "Chest X-ray shows diffuse, symmetrical ground-glass opacities radiating from the hilum (classic 'bat-wing' or butterfly appearance).",
      xrayPattern: "bilateral_ground_glass",
      correctPathogenId: "p_jirovecii",
      correctDrugId: "tmp_smx",
      explanation: "This patient is suffering from Pneumocystis pneumonia (PJP) caused by Pneumocystis jirovecii, a classic opportunistic infection in patients with undiagnosed or untreated HIV (CD4 < 200). The key features are progressive shortness of breath, severe hypoxemia out of proportion to a relatively normal chest exam, ground-glass opacities, and silver-staining cysts. TMP-SMX is the treatment of choice, acting by blocking folic acid synthesis."
    }
  ]
};
