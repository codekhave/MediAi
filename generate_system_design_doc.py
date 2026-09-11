import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_system_design_doc():
    doc = Document()

    # Page Margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Palette Constants: Medical Royal Purple & Crisp Slate
    PURPLE_PRIMARY = RGBColor(109, 40, 217)    # #6D28D9
    PURPLE_DARK = RGBColor(76, 29, 149)       # #4C1D95
    SLATE_DARK = RGBColor(15, 23, 42)         # #0F172A
    SLATE_MUTED = RGBColor(71, 85, 105)       # #475569
    HEX_PURPLE_LIGHT = "F5F3FF"
    HEX_PURPLE_BORDER = "DDD6FE"
    HEX_HEADER_BG = "4C1D95"
    HEX_ALT_ROW = "F8FAFC"

    def set_cell_background(cell, hex_color):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    # ----------------------------------------------------
    # COVER / HEADER TITLE
    # ----------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(18)
    title_p.paragraph_format.space_after = Pt(4)
    run_sub = title_p.add_run("MEDIAI TELEHEALTH PLATFORM • TECHNICAL SPECIFICATION & ARCHITECTURE\n")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    run_sub.font.color.rgb = PURPLE_PRIMARY

    run_title = title_p.add_run("System Design & Pre-Consultation Safety Engine")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(26)
    run_title.font.bold = True
    run_title.font.color.rgb = PURPLE_DARK

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_after = Pt(18)
    run_meta = meta_p.add_run("Department of Computer Science • MediAI Clinical Telehealth Architecture\nVersion: 2.5 (Safety Triage & Clinical Governance) • Date: September 2026")
    run_meta.font.name = "Arial"
    run_meta.font.size = Pt(9.5)
    run_meta.font.color.rgb = SLATE_MUTED

    # ----------------------------------------------------
    # CALLOUT BOX: EXECUTIVE SUMMARY & CORE AIM SHIFT
    # ----------------------------------------------------
    callout_table = doc.add_table(rows=1, cols=1)
    callout_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    callout_cell = callout_table.rows[0].cells[0]
    callout_cell.width = Inches(6.5)
    set_cell_background(callout_cell, HEX_PURPLE_LIGHT)
    set_cell_margins(callout_cell, top=140, bottom=140, left=180, right=180)

    cp = callout_cell.paragraphs[0]
    cp.paragraph_format.space_after = Pt(4)
    run_c_title = cp.add_run("EXECUTIVE ARCHITECTURE SUMMARY & PARADIGM SHIFT\n")
    run_c_title.font.name = "Arial"
    run_c_title.font.size = Pt(11)
    run_c_title.font.bold = True
    run_c_title.font.color.rgb = PURPLE_DARK

    run_c_body = cp.add_run(
        "MediAI is a high-availability, multi-tiered telehealth platform engineered to resolve the dangers of unguided self-medication and delayed clinical consultations. "
        "A foundational insight guides this architecture: AI must NOT function as an autonomous pharmaceutical prescriber or retail pharmacist. Uncontrolled drug dispensing "
        "by algorithms creates catastrophic medical hazards (e.g., dispensing NSAID painkillers to a patient with an undiagnosed gastric ulcer, triggering fatal internal hemorrhaging). "
        "Instead, MediAI operates as a Pre-Consultation Clinical Triage & Patient Safety Bridge—delivering immediate differential diagnostic reasoning, highlighting critical "
        "contraindications ('What to Do and What NOT to Do Right Now'), advising safe supportive care (plain Paracetamol, ergonomic posture relief), and bridging patients seamlessly "
        "into encrypted WhatsApp-style clinical consultations and WebRTC video rooms with board-certified physicians."
    )
    run_c_body.font.name = "Arial"
    run_c_body.font.size = Pt(9.5)
    run_c_body.font.color.rgb = SLATE_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ----------------------------------------------------
    # HELPER FUNCTIONS
    # ----------------------------------------------------
    def add_section_header(title):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        r = h.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = PURPLE_PRIMARY

    def add_sub_header(title):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        r = h.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(12.5)
        r.font.bold = True
        r.font.color.rgb = PURPLE_DARK

    def add_body_p(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(10)
        r.font.color.rgb = SLATE_DARK
        return p

    def add_bullet_p(title, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        r_title = p.add_run(title + ": ")
        r_title.font.name = "Arial"
        r_title.font.size = Pt(10)
        r_title.font.bold = True
        r_title.font.color.rgb = PURPLE_DARK
        r_text = p.add_run(text)
        r_text.font.name = "Arial"
        r_text.font.size = Pt(10)
        r_text.font.color.rgb = SLATE_DARK

    # ----------------------------------------------------
    # SECTION 1: ARCHITECTURAL FOUNDATION & TOPOLOGY
    # ----------------------------------------------------
    add_section_header("1. Architectural Foundation & Multi-Tier Topology")
    add_body_p(
        "MediAI is structured upon a decoupled, service-oriented multi-tier architectural topology. "
        "Separating the client interface, API gateway, asynchronous WebSockets, clinical reasoning engine, and relational persistence guarantees horizontal scalability, modular testability, and isolated failure domains."
    )

    add_bullet_p("Presentation Layer (Client SPA)", 
                 "Built with React 18 and bundled via Vite for sub-second hot-reloads and optimized tree-shaking. Uses Zustand for reactive global state management. "
                 "The UI employs a clinical white and royal purple (#6D28D9) palette, modern typography, responsive CSS grid/flex structures, and clean semantic markdown formatting without raw hashtag symbols.")
    
    add_bullet_p("Application Gateway & Business Logic Tier", 
                 "Powered by Django 6.1 and Django REST Framework (DRF) running atop Daphne ASGI. Implements strict Role-Based Access Control (RBAC) across Patients, Doctors, and Administrators. "
                 "Features automated throttling (UserRateThrottle: 120/min, AnonRateThrottle: 30/min, AIAssessmentThrottle: 30/hr) and JWT bearer authentication.")
    
    add_bullet_p("Real-Time Asynchronous Engine", 
                 "Orchestrated via Django Channels 4.3 over ASGI protocol routers. Manages bidirectional WebSocket connections for WhatsApp-style consultation messaging, "
                 "instant emergency dispatch alerts, and live clinician availability broadcasting.")

    add_bullet_p("Persistence Layer", 
                 "High-integrity relational database schema with foreign-key cascade protections, unique constraints, JSONField attributes for deep clinical reasoning payloads, and indexed query optimizations.")

    add_bullet_p("External Integration Gateway", 
                 "Abstracts third-party medical infrastructure including Google Gemini LLM API for advanced differential symptom triage, Jitsi Meet WebRTC for encrypted video rooms, "
                 "and secure file upload handlers for medical licenses and physician video demonstrations.")

    # ----------------------------------------------------
    # SECTION 2: THE REFINED MISSION & CLINICAL SAFETY PARADIGM
    # ----------------------------------------------------
    add_section_header("2. Refined Platform Aim: Pre-Consultation Safety Bridge vs. Autonomous Pharmacist")
    add_body_p(
        "A critical architectural refinement in MediAI is correcting the foundational aim of healthcare artificial intelligence. "
        "Early naive concepts assumed that AI should prescribe pharmaceuticals directly to patients before they see a doctor. Medical science, clinical ethics, and regulatory bodies (FDA, WHO, MDCN) prove that autonomous pharmaceutical prescribing is fundamentally flawed and dangerous."
    )

    add_sub_header("2.1 Why Autonomous Drug Prescribing by AI Fails")
    add_bullet_p("The Lethal Contraindication Trap", 
                 "Patients frequently misattribute symptoms. A patient experiencing back pain locking up after sitting may assume it is simple muscular fatigue or generic stomach acidity and request strong pain relievers. "
                 "If an autonomous AI pharmacist dispenses common NSAIDs (Ibuprofen, Diclofenac, Feldene, Aspirin), it inhibits COX-1 enzymes, eroding gastric mucosa and triggering catastrophic gastrointestinal bleeding or ulcer perforation.")
    
    add_bullet_p("Absence of Physical Examination", 
                 "Algorithms cannot palpate abdominal quadrants for rebound tenderness, auscultate lung fields with a stethoscope, or visualize endoscopic tissue. "
                 "Prescribing prescription pharmaceuticals without physical diagnostic verification constitutes clinical malpractice.")

    add_sub_header("2.2 The MediAI Triage & Safety Protocol")
    add_body_p(
        "MediAI redirects computational intelligence into a rigorous Pre-Consultation Clinical Triage & Patient Safety Bridge that performs three vital functions:"
    )
    add_bullet_p("1. Differential Diagnostic Reasoning", "Identifies the plausible physiological mechanisms driving the patient's complaints (e.g. why an ulcer refers pain to the thoracic spine).")
    add_bullet_p("2. Immediate Safety Rules ('What to Do and What NOT to Do')", "Provides strict contraindication warnings against dangerous OTC medications, advises the sole safe analgesic option (plain Paracetamol/Acetaminophen), and provides ergonomic posture relief.")
    add_bullet_p("3. Seamless Specialist Conversion", "Bridges the patient directly into a 1-click consultation booking and encrypted chat session with the exact verified medical specialist required.")

    # ----------------------------------------------------
    # SECTION 3: THE REAL-LIFE CASE STUDY & DUAL-TIER ENGINE
    # ----------------------------------------------------
    add_section_header("3. Clinical Case Study: The Ulcer-Spine Referral Diagnostic Architecture")
    add_body_p(
        "To validate the clinical efficacy of the MediAI engine, consider an actual real-life patient case presented to the platform: "
        "A female patient ('Baby ❤️') presented with acute mid-back pain that felt internally similar to previous ulcer episodes, with a distinct mechanical locking symptom: "
        "after sitting down for a period and attempting to stand, her back locked up in severe pain, making it impossible to stand upright for several minutes."
    )

    add_sub_header("3.1 Dual-Tier Clinical Reasoning Analysis")
    add_bullet_p("Mechanism 1: Posterior Gastric Ulcer Referral", 
                 "When a peptic ulcer or severe gastroduodenal mucosal lesion is situated along the posterior stomach wall, sensory visceral nerves refer sharp pain directly into the T5-T10 mid-back dermatomes. "
                 "Prolonged sitting hunches the torso, compressing the stomach; standing abruptly stretches the abdominal wall, triggering acute nerve flares that lock the posture.")
    
    add_bullet_p("Mechanism 2: Psoas Major Muscle Spasm", 
                 "The psoas muscle originates from the lumbar vertebrae and passes through the abdomen to the hip. In acute spasm, it mimics deep visceral organ pain. "
                 "Sitting shortens the psoas; standing suddenly forces an immediate stretch against contracted fibers, causing sharp locking pain that prevents straightening.")
    
    add_bullet_p("Mechanism 3: Biliary / Pancreatic Inflammation", 
                 "Gallbladder or pancreatic irritation manifests as a deep epigastric ache boring through into the posterior thoracic spine.")

    add_sub_header("3.2 Patient Safety Directives Enforced by the System")
    
    # Table of Directives
    t_dir = doc.add_table(rows=4, cols=3)
    t_dir.alignment = WD_TABLE_ALIGNMENT.CENTER
    dir_headers = ["Category", "Clinical Directive", "Biochemical & Medical Rationale"]
    for i, h in enumerate(dir_headers):
        cell = t_dir.rows[0].cells[i]
        set_cell_background(cell, HEX_HEADER_BG)
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    dir_data = [
        ("STRICTLY AVOID", "NO Ibuprofen, Diclofenac, Feldene, Aspirin (NSAIDs)", "NSAIDs inhibit protective prostaglandins in the gastric mucosal lining. In the presence of an ulcer, they cause acute mucosal erosion and trigger life-threatening internal bleeding."),
        ("SAFE OTC ANALGESIC", "Plain Paracetamol (Acetaminophen) Only", "Paracetamol acts centrally on the nervous system without irritating the gastric mucosal barrier, providing safe temporary pain relief prior to clinical examination."),
        ("ERGONOMIC SUPPORT", "Warm Water & Chair Transition Protocol", "Instructs patient to sip warm water slowly, avoid peppery/spicy irritants, and when rising from a chair, shift forward to the chair edge, brace hands on knees, and stand gradually to avoid psoas/gastric spasm.")
    ]

    for r_idx, (cat, direct, rat) in enumerate(dir_data, start=1):
        c1, c2, c3 = t_dir.rows[r_idx].cells
        for c, txt in [(c1, cat), (c2, direct), (c3, rat)]:
            bg = HEX_ALT_ROW if r_idx % 2 == 1 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            r = p.add_run(txt)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            r.font.color.rgb = SLATE_DARK
            if c == c1:
                r.font.bold = True
                if cat == "STRICTLY AVOID":
                    r.font.color.rgb = RGBColor(220, 38, 38)
                elif cat == "SAFE OTC ANALGESIC":
                    r.font.color.rgb = RGBColor(16, 185, 129)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ----------------------------------------------------
    # SECTION 4: WHATSAPP-GRADE ENCRYPTED CLINICAL MESSAGING
    # ----------------------------------------------------
    add_section_header("4. WhatsApp-Grade Secure Clinical Messaging Architecture")
    add_body_p(
        "Direct doctor-patient communication is the cornerstone of clinical follow-up. MediAI re-engineers clinical chat to deliver the familiarity, speed, and privacy of WhatsApp, reinforced with healthcare-grade HIPAA compliance."
    )
    add_bullet_p("256-Bit End-to-End Encryption Protocol", 
                 "Clinical consultation threads are secured with 256-bit encryption headers. A persistent security banner verifies to the patient and clinician that communications are private, tamper-proof, and compliant with international health privacy standards.")
    
    add_bullet_p("Double Blue Checkmarks (Read Receipts)", 
                 "Messages incorporate instant delivery and read indicators (CheckCheck status icon) providing immediate feedback on doctor engagement.")
    
    add_bullet_p("Specialist Header & Online Telemetry", 
                 "The chat header displays the attending physician's credentials, sub-specialty (e.g. Gastroenterologist & Internal Medicine Specialist), hospital affiliation, and live availability telemetry.")

    add_bullet_p("1-Click Clinical Triage Memo Sharing", 
                 "Patients can click 'Share AI Triage' directly in the chat interface. The system synthesizes their latest AI symptom assessment into a structured medical memo (symptoms, triage acuity, differentials, and contraindications) and transmits it instantly to the doctor for pre-consultation review.")

    add_bullet_p("Seamless WebRTC Teleconsultation Launch", 
                 "Integrated video launch controls embedded in the chat header allow the doctor or patient to transition from text messaging into a face-to-face video consultation room with a single click.")

    # ----------------------------------------------------
    # SECTION 5: VERIFIED MEDICAL CREATOR & VIDEO STREAMING
    # ----------------------------------------------------
    add_section_header("5. Verified Medical Creator Network & Video Streaming Hub")
    add_body_p(
        "To combat digital health misinformation, MediAI establishes a Flo-inspired health education portal where verified clinicians author multimedia lifestyle guides."
    )
    add_bullet_p("Direct Video Upload & Streaming Infrastructure", 
                 "Doctors can upload video demonstrations (MP4, WebM, QuickTime) demonstrating physical posture adjustments, blood pressure monitoring techniques, or nutritional meal preparation. "
                 "The platform supports both direct HTML5 video streaming from local/cloud storage and embedded links from accredited academic video repositories.")
    
    add_bullet_p("Clean Semantic Markdown Rendering Engine", 
                 "The custom frontend reader parses clinical markdown text, eliminating raw hashtag markers (#, ##, ###) and converting headings, bullet lists, clinical pearl callout boxes, and bold pharmaceutical concepts into a modern, magazine-grade layout.")

    add_bullet_p("Strict Creator Monetization & Verification Gate", 
                 "Publishing permissions and creator monetization studios are strictly gated. Only approved doctors with verified credentials or credentialed allied health specialists may publish. "
                 "The creator studio displays private engagement royalties ($0.02 per verified read view, $0.05 per helpful like) and payout routing.")

    # ----------------------------------------------------
    # SECTION 6: DOCTOR CREDENTIAL VERIFICATION & GOVERNANCE
    # ----------------------------------------------------
    add_section_header("6. Doctor Credential Verification & Governance Architecture")
    add_body_p(
        "Patient safety demands strict credential verification before any practitioner is permitted to offer teleconsultations or publish public health guides."
    )
    add_bullet_p("Medical Credential Upload Portal", 
                 "Doctors access a dedicated portal in DoctorDashboard to upload official verification documents: Medical Practicing Licences, Degree/Fellowship Certificates, and Government-Issued National IDs.")
    
    add_bullet_p("Administrative Audit Queue", 
                 "In the Admin Dashboard, platform administrators inspect submitted documents via an interactive preview modal, cross-reference medical register licence numbers, and execute one-click credential approval or revocation.")

    add_bullet_p("Dynamic Platform Access Gating", 
                 "Unverified doctors are restricted to 'In Review' status, preventing them from accepting patient consultations, joining video rooms, or publishing unverified articles until the Medical Board audit is approved.")

    # ----------------------------------------------------
    # SECTION 7: EMERGENCY SOS & SOAP DOCUMENTATION
    # ----------------------------------------------------
    add_section_header("7. Emergency SOS Dispatch & SOAP Clinical Documentation")
    add_body_p(
        "For acute life-threatening situations, MediAI features an autonomous SOS pipeline: "
        "Acuity categorization (Cardiac, Respiratory, Trauma) triggers real-time WebSocket alerts to duty physicians flagged as emergency-ready, displaying non-suppressible patient location and telephone telemetry."
    )
    add_body_p(
        "Following teleconsultations, physicians record formal SOAP documentation (Subjective, Objective, Assessment, Plan). "
        "Prescriptions and diagnostic summaries are cryptographically archived and selectively released into the patient's personal electronic health record."
    )

    doc.save("MediAI_System_Design_Engine_Architecture.docx")
    print("Saved: MediAI_System_Design_Engine_Architecture.docx")

if __name__ == "__main__":
    create_system_design_doc()
