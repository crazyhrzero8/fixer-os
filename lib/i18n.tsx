"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Lang = "en" | "hi";

const dict = {
  en: {
    navHome: "Home",
    navPortal: "EPFO Member Portal",
    navFixer: "Audit Workspace",
    navDemo: "Demo Theater",
    navStory: "Story",
    navTerms: "Terms",
    headerTitle: "FIXER.OS — Public Service Accountability Layer",
    headerSub: "Independent Prototype · Build What Moves India",
    simOnly: "SIMULATION ONLY — independent hackathon prototype · not affiliated with any Government body · all data synthetic",
    heroEyebrow: "Everyone built compliance copilots for citizens.",
    heroTitle: "An independent ledger that checks the government's claims against its own rules.",
    heroDesc: "The state digitized forms, never accountability. Every public-service portal ends with “now track it yourself.” FIXER.OS is the missing counterparty: it verifies the government’s claims against an independent, tamper-evident case ledger, predicts rejections before they happen, proves rule deadlocks mathematically, and escalates with legally-cited teeth.",
    evalTitle: "Evaluate like a judge",
    evalDesc: "Login to the simulated portal (UAN 100000000000 · password demo1234) or go straight to the console.",
    termsTitle: "Terms & Conditions — Synthetic Demo (Latest 2026)",
    termsIntro: "These terms are written from live RBI, CPA, DPDP, GIGW sources as of Aug 2026. All data is synthetic; no real government system is touched.",
    storyTitle: "Why FIXER.OS? — A friend’s family waited 6 months for their own PF",
    storySub: "Motivation, novelty, and where AI actually helps (and where it doesn’t).",
    portalLogin: "Member Login — Universal Account Number (UAN)",
    portalCaptcha: "Enter Captcha Characters:",
    portalOtp: "OTP Verification — Registered Mobile (synthetic)",
    claimForm: "Form-31 : Advance from Provident Fund Account (Member Self-Service)",
    uanLabel: "UAN:",
    pwdLabel: "Password:",
    capLabel: "Enter Captcha:",
    capHint: "Case-insensitive, no spaces.",
    verifyBtn: "Verify & Proceed → OTP",
    verifying: "Verifying…",
    otpSentTo: "An OTP has been sent to your registered mobile ending",
    demoOtpLabel: "Demo OTP:",
    enterOtp: "Enter 6-digit OTP",
    verifyOtpBtn: "Verify OTP",
    resendOtp: "Resend OTP",
    otpHint: "6-digit crypto-random · 5-min expiry · 3-attempt lock",
    dashboardHead: "Member Dashboard",
    passbookCard: "Passbook",
    kycCard: "KYC Status",
    fileClaimCard: "File Claim",
    backToDash: "← Back to Dashboard",
    memberName: "Name of Member",
    serviceRecord: "Service (as per records)",
    purpose: "Purpose of Advance",
    bankIfsc: "Bank Account (IFSC)",
    amountReq: "Amount Required",
    declareAgree: "I declare the particulars are true and agree to the",
    termsLink: "Terms & Conditions",
    submitClaimBtn: "Submit Claim Form-31",
    submitting: "Submitting…",
    readTerms: "Read Terms",
    statusHead: "Online Claim Status — Tracking ID:",
    advanceDayBtn: "Check Again Tomorrow (advance simulated day)",
    loading: "Loading…",
    rejectedTitle: "Claim Rejected.",
    fileGrievanceBtn: "File Grievance Regarding This Rejection",
    gmisForm: "Grievance Management System (GMIS) — Register New Grievance",
    trackingPrompt: "Please enter the Claim Tracking ID exactly as supplied in your rejection notice:",
    trackingIdLabel: "Claim Tracking ID",
    submitGrievanceBtn: "Submit Grievance",
    invalidIdTitle: "Error: Invalid Tracking ID.",
    attemptAgainBtn: "Attempt Another Grievance",
    lockedTitle: "Grievance Unavailable.",
    escOptions: "Available Escalation Options",
    fixWithFixer: "Fix it with FIXER.OS:",
    openConsole: "Open Agent Console → Run next step → Download escalation letter",
    restartSession: "Restart simulated session",
    evalLogin: "Evaluation login",
    consoleRunStep: "Run next agent step",
    analyzing: "Analyzing…",
    consoleRestart: "Restart case",
    chainVerified: "Hash chain verified",
    timelineHead: "Court-ready evidence timeline",
    windTunnelEyebrow: "Rejection Wind-Tunnel / pre-flight simulation",
    windTunnelHead: "Would this claim survive the department's own checks?",
    ruleguardEyebrow: "RuleGuard / mechanically proven",
    tracerouteEyebrow: "Kaun Zimmedar? / File traceroute",
    slaClock: "SLA CLOCK",
    provEyebrow: "Provenance verifier / is this portal genuine?",
    realHead: "What is real in this prototype?",
    downloadLetter: "Download letter (.txt)",
    viewEscalation: "View pre-addressed escalation draft",
    viewBugReport: "View developer bug report",
    demoRun: "Run comparison",
    demoRestartPlayback: "Restart playback",
    demoPause: "Pause",
    citizenAlone: "Citizen alone",
    citizenFixed: "Citizen + FIXER.OS",
    footProduct: "Product",
    footEvidence: "Evidence",
    footLegal: "Legal Basis",
    footAbout: "About",
    fAgentConsole: "Agent Console", fPortal: "Simulated Portal", fDemo: "Demo Theater",
    fLedger: "Hash-Chained Ledger", fRuleGuard: "RuleGuard Proofs", fPreflight: "Pre-flight Checks",
    fRbi: "RBI TAT Circular 2019", fCpa: "CPA 2019 Precedents", fDpdp: "DPDP-Aware Design",
    fDossier: "Research Dossier", fCodexLog: "Codex Build Log", fHonesty: "Honesty Disclosures",
    fixEyebrow: "FIXER.OS / Accountability console — independent prototype",
    fixTitle: "Audit the decision, not the citizen.",
    fixSub: "Synthetic audit console. Verifies government portal claims against independent facts.",
    caseLbl: "Case",
    openMock: "Open mock portal",
    loadingLedger: "Loading case ledger…",
    problemTag: "Audit details: EPFO False Rejection Case",
    generalityTag: "Audit details: Payment TAT Breach Case",
    nameProofLine: "Name match confirmed on record.",
    tatProofLine: "Debit confirmed, service not delivered.",
    ledgerFail: "Ledger verification failed",
    errRejected: "Request rejected",
    errNet: "Network error",
    chips: ["Interpret", "Draft", "File", "SLA", "Escalate"],
    wtFoot: "Predicted against the same validation classes that silently reject ~1 in 4 PF claims. Synthetic rules; real pattern. Legal citations stay in English for precision.",
    tlDesc: "Append-only SHA-256 chain — each event commits to the previous hash. Auditability per GIGW 3.0; data-accuracy traceability per DPDP Act 2023.",
    rgLead: "No valid outcome exists for",
    routeAround: "Route around:",
    trSub: "CPGRAMS/EPFO 30-day SLA hierarchy",
    trHead: "The blocking node is visible.",
    brChip: "BREACHED",
    targetChip: "ESCALATION TARGET",
    heldWord: "held",
    deadlineWord: "deadline",
    slaIrctcNote: "RBI TAT — auto-reversal within T+5 calendar days, ₹100/day beyond, suo moto (para 5); Ombudsman route if denied (para 6)",
    slaEpfoNote: "synthetic demo calculator (para-matched rate)",
    provChecking: "Checking origin…",
    provHOfficial: "Official manifest match.",
    provHSandbox: "Registered sandbox origin.",
    provHUnknown: "Untrusted origin — no government service operates over plain HTTP.",
    tlsOk: "HTTPS — required for govt portals (CERT-In)",
    tlsBad: "INSECURE — HTTP",
    provMethod: "Verdict written to ledger as PROVENANCE_VERIFIED. Method: allow-list over simulated govt manifest (playbooks/trusted-domains.json).",
    provPhish: "Phishing clones are the top monetized attack: 28.15 lakh cybercrime cases in 2025 (+24% YoY), 38% via phishing per CERT-In. Verification belongs in-flow, before filing — DPDPA 2023 phased from Nov 2025.",
    honestySuffix: "(Honesty disclosure)",
    honestItems: [
      "SHA-256 hash-chain — verified per case, tamper evident",
      "LLM action-selection — strict zod schema, allow-list, deterministic fallback (AGENT_MODE)",
      "Server-owned portal sessions + zod validation + 30 req/min rate limit",
      "Interval-logic deadlock proof — EPS 1995/2026 10-year rule",
      "RBI TAT compensation calculator — DPSS.CO.PD No.629/2019-20, T+5 calendar days, ₹100/day suo moto",
      "Provenance allow-list — 5 official domains, TLS check, SANDBOX tier otherwise",
      "Synthetic: portal, facts, deadlines, outcomes; per-process store (demo sandbox); no live government system touched."
    ],
    diffHead: "How this differs from what already exists (audited 22 Aug 2026)",
    diffLead: "First citizen-facing UI that shows a machine-checked certificate of an eligibility-rule contradiction, anchored to a tamper-evident case-evidence chain, with a live statutory-compensation clock.",
    diffItems: [
      "**EPFO CITES 2.01 (Jul 2026)** validates deficiencies at submission inside their portal — ours runs validation classes against an independent ledger before you file, with fixes.",
      "**Delhi e-SLA (2011, 567 services)** auto-computes delay compensation for its own services — the RBI ₹100/day regime has no citizen-facing clock anywhere; we render it live.",
      "**Catala/CUTECat (France, in production)** machine-checks benefit-law conflicts for legislators and developers — no system hands the proof artifact to the affected citizen.",
      "NIC certificatechain.nic.in chains issued certificates — not a contested case record replayed against a rejection reason."
    ],
    regsFoot: "Regulations cited: RBI TAT 20 Sep 2019 · EPS 1995 §10 & EPS 2026 · CPA 2019 §2(11) + Jurisdiction Rules 2021 (₹50L/₹2Cr) · Kangra CC/297/2025 (20 Jul 2026) · DPDP Act 2023 + Rules (phased) · GIGW 3.0 Dec 2023 · WCAG 2.1 AA. Prior art cited above.",
    footBottom: "FIXER.OS · Independent prototype for the Build What Moves India hackathon · Not affiliated with EPFO, IRCTC or any Government body · No live systems touched · Synthetic data only",
    yesLbl: "yes", noLbl: "no", tatNoTicket: "no — service never delivered",
    fixPrefix: "Fix: ",
    botName: "FIXER.OS Navigator",
    botWelcome: "Hello! I am your visual guide. Do you need help exploring the platform?",
    botYes: "Yes, guide me!",
    botNo: "No, I'll explore alone",
    botSelectTour: "Select a guided walkthrough:",
    tourPortalName: "🏛️ Simulate PF Rejection (EPFO Portal)",
    tourFixerName: "🧾 Audit & Escalate (Agent Console)",
    tourDemoName: "🎬 Compare Outcomes (Demo Theater)",
    botMinimize: "Minimize Assistant",
    botClose: "End Tour",
    botPrev: "Back",
    botNext: "Next Step",
    botTourCompleted: "Walkthrough completed! Great job.",
    tourPortalSteps: [
      "Step 1: Enter trial credentials (UAN: 100000000000 / Password: demo1234) and type the Captcha, then click 'Verify'.",
      "Step 2: You're in! Now, click on 'PF Advance (Form-31)' to simulate filing a claim.",
      "Step 3: Check the box to accept the terms & conditions.",
      "Step 4: Click 'Submit Claim' to lodge the request.",
      "Step 5: The claim is under process. Click 'Simulate Next Day' to advance the process clock.",
      "Step 6: Oh no, the claim is rejected due to a false 'name mismatch'! Click 'File Grievance' to attempt an appeal.",
      "Step 7: Enter your tracking ID in the input box.",
      "Step 8: Click 'Submit Grievance' to send it.",
      "Step 9: You are locked out for 30 days! Now, click 'Open Agent Console' to let FIXER.OS resolve this deadlock."
    ],
    tourFixerSteps: [
      "Step 1: Select the 'PF advance false rejection' case from the dropdown to load the evidence ledger.",
      "Step 2: Review the facts. Then, click 'Audit Submission & Verify Claims' to let the AI agent execute the audit loop.",
      "Step 3: Click 'Audit Submission & Verify Claims' again to calculates TAT compensation penalties (₹100/day).",
      "Step 4: Click 'Audit Submission & Verify Claims' again to generate the tamper-proof ledger hash chain.",
      "Step 5: Click 'Audit Submission & Verify Claims' again to finalize the legally-cited escalation packet.",
      "Step 6: Audit completed! Click 'Download Legal Appeal Notice' to save the final PDF/Text package locally."
    ],
    tourDemoSteps: [
      "Step 1: Click 'Run comparison' to watch the split-screen simulation of both outcomes side by side."
    ],
    bannerPortal: "🔴 Simulated Portal: You are acting as a citizen inside a legacy government portal.",
    bannerConsole: "🟢 FIXER.OS Console: You are inside the accountability workspace.",
    adminLoginTitle: "🛡️ FIXER.OS Control Login",
    adminUsername: "Admin ID",
    adminPassword: "Password",
    adminLoginBtn: "Verify Credentials → Control Panel",
    adminError: "Error: Invalid admin credentials.",
    adminHint: "Demo credentials: ID: admin / Password: admin1234",
    choicePortalTitle: "🏛️ Simulated Portal",
    choicePortalDesc: "Enter the legacy member portal as a citizen to simulate filing a pension advance claim and hitting the rejection/appeal deadlock.",
    choiceConsoleTitle: "🛡️ FIXER.OS Control Console",
    choiceConsoleDesc: "Access the independent citizen audit workspace as an administrator to run logical proofs, trace statutory deadlines, and download escalations.",
    choicePortalBtn: "Enter Simulated Portal →",
    choiceConsoleBtn: "Open Agent Workspace →"
  },
  hi: {
    navHome: "मुखपृष्ठ",
    navPortal: "ईपीएफओ पोर्टल क्लाइंट",
    navFixer: "ऑडिट कार्यक्षेत्र",
    navDemo: "डेमो थिएटर",
    navStory: "कहानी",
    navTerms: "नियम",
    headerTitle: "FIXER.OS — जन सेवा जवाबदेही परत",
    headerSub: "स्वतंत्र प्रोटोटाइप · Build What Moves India",
    simOnly: "केवल सिमुलेशन — स्वतंत्र हैकाथॉन प्रोटोटाइप · किसी सरकारी निकाय से संबद्ध नहीं · सभी डेटा कृत्रिम",
    heroEyebrow: "सबने नागरिकों के लिए अनुपालन सहायक बनाए।",
    heroTitle: "एक स्वतंत्र बही जो सरकार के दावों की उसके अपने नियमों के खिलाफ जांच करती है।",
    heroDesc: "राज्य ने फॉर्म डिजिटल किए, जवाबदेही नहीं। हर सरकारी पोर्टल “अब खुद ट्रैक करो” पर खत्म होता है। FIXER.OS लापता प्रतिपक्ष है: यह सरकार के दावों को स्वतंत्र, छेड़छाड़-रहित केस लेजर से जाँचता है, अस्वीकृतियों की भविष्यवाणी करता है, नियम-गतिरोधों को गणितीय रूप से सिद्ध करता है और कानूनी हवाले से एस्केलेट करता है।",
    evalTitle: "जज की तरह मूल्यांकन करें",
    evalDesc: "नकली पोर्टल में लॉगिन करें (UAN 100000000000 · पासवर्ड demo1234) या सीधे कंसोल पर जाएं।",
    termsTitle: "नियम व शर्तें — कृत्रिम डेमो (नवीनतम 2026)",
    termsIntro: "ये शर्तें अगस्त 2026 तक के लाइव RBI, CPA, DPDP, GIGW स्रोतों से लिखी गई हैं। सभी डेटा कृत्रिम है; कोई वास्तविक सरकारी सिस्टम नहीं छुआ गया।",
    storyTitle: "FIXER.OS क्यों? — दोस्त के परिवार को 6 महीने अपना PF नहीं मिला",
    storySub: "प्रेरणा, नवीनता, और AI वास्तव में कहाँ मदद करता है (और कहाँ नहीं)।",
    portalLogin: "सदस्य लॉगिन — सार्वभौमिक खाता संख्या (UAN)",
    portalCaptcha: "कैप्चा अक्षर दर्ज करें:",
    portalOtp: "OTP सत्यापन — पंजीकृत मोबाइल (कृत्रिम)",
    claimForm: "फॉर्म-31 : भविष्य निधि खाते से अग्रिम (सदस्य स्व-सेवा)",
    uanLabel: "यूएएन:",
    pwdLabel: "पासवर्ड:",
    capLabel: "कैप्चा दर्ज करें:",
    capHint: "अक्षर छोटे-बड़े दोनों चलेंगे, बिना खाली स्थान।",
    verifyBtn: "सत्यापित करें → OTP",
    verifying: "सत्यापित हो रहा है…",
    otpSentTo: "आपके पंजीकृत मोबाइल पर OTP भेजा गया है, जो समाप्त होता है",
    demoOtpLabel: "डेमो OTP:",
    enterOtp: "6-अंकीय OTP दर्ज करें",
    verifyOtpBtn: "OTP सत्यापित करें",
    resendOtp: "OTP फिर भेजें",
    otpHint: "6-अंकीय क्रिप्टो-यादृच्छिक · 5-मिनट वैध · 3-प्रयास सीमा",
    dashboardHead: "सदस्य डैशबोर्ड",
    passbookCard: "पासबुक",
    kycCard: "केवाईसी स्थिति",
    fileClaimCard: "दावा दर्ज करें",
    backToDash: "← डैशबोर्ड पर वापस",
    memberName: "सदस्य का नाम",
    serviceRecord: "सेवा (अभिलेखानुसार)",
    purpose: "अग्रिम का उद्देश्य",
    bankIfsc: "बैंक खाता (IFSC)",
    amountReq: "आवश्यक राशि",
    declareAgree: "मेरी घोषणा: उपरोक्त विवरण सही हैं और मैंने पढ़ा/स्वीकार किया",
    termsLink: "नियम व शर्तें",
    submitClaimBtn: "फॉर्म-31 जमा करें",
    submitting: "जमा हो रहा है…",
    readTerms: "नियम पढ़ें",
    statusHead: "ऑनलाइन दावा स्थिति — ट्रैकिंग आईडी:",
    advanceDayBtn: "कल फिर देखें (अगला दिन)",
    loading: "लोड हो रहा है…",
    rejectedTitle: "दावा अस्वीकृत।",
    fileGrievanceBtn: "इस अस्वीकृति पर शिकायत दर्ज करें",
    gmisForm: "शिकायत प्रणाली (GMIS) — नई शिकायत दर्ज करें",
    trackingPrompt: "अस्वीकृति सूचना में दी गई ट्रैकिंग आईडी ठीक वैसे ही दर्ज करें:",
    trackingIdLabel: "ट्रैकिंग आईडी",
    submitGrievanceBtn: "शिकायत जमा करें",
    invalidIdTitle: "त्रुटि: अमान्य ट्रैकिंग आईडी।",
    attemptAgainBtn: "फिर प्रयास करें",
    lockedTitle: "शिकायत उपलब्ध नहीं।",
    escOptions: "उपलब्ध एस्केलेशन विकल्प",
    fixWithFixer: "FIXER.OS से हल करें:",
    openConsole: "एजेंट कंसोल खोलें → अगला कदम चलाएँ → एस्केलेशन पत्र डाउनलोड करें",
    restartSession: "सिम्युलेटेड सेशन रीस्टार्ट",
    evalLogin: "मूल्यांकन लॉगिन",
    consoleRunStep: "अगला एजेंट कदम चलाएँ",
    analyzing: "विश्लेषण हो रहा है…",
    consoleRestart: "केस रीस्टार्ट",
    chainVerified: "हैश शृंखला सत्यापित",
    timelineHead: "न्यायालय-योग्य साक्ष्य समयरेखा",
    windTunnelEyebrow: "अस्वीकृति वाइंड-टनल / पूर्व-जाँच",
    windTunnelHead: "क्या यह दावा विभाग की अपनी जाँचों में टिकेगा?",
    ruleguardEyebrow: "RuleGuard / गणितीय रूप से सिद्ध",
    tracerouteEyebrow: "कौन ज़िम्मेदार? / फ़ाइल ट्रेसरूट",
    slaClock: "SLA घड़ी",
    provEyebrow: "प्रोवेनेंस जाँच / क्या यह असली पोर्टल है?",
    realHead: "इस प्रोटोटाइप में क्या वास्तविक है?",
    downloadLetter: "पत्र डाउनलोड (.txt)",
    viewEscalation: "एस्केलेशन पत्र देखें",
    viewBugReport: "डेवलपर बग-रिपोर्ट देखें",
    demoRun: "तुलना चलाएँ",
    demoRestartPlayback: "प्लेबैक रीस्टार्ट",
    demoPause: "रोकें",
    citizenAlone: "नागरिक अकेले",
    citizenFixed: "नागरिक + FIXER.OS",
    footProduct: "उत्पाद",
    footEvidence: "साक्ष्य",
    footLegal: "कानूनी आधार",
    footAbout: "परिचय",
    fAgentConsole: "एजेंट कंसोल", fPortal: "नकली पोर्टल", fDemo: "डेमो थिएटर",
    fLedger: "हैश-शृंखलित बहीखाता", fRuleGuard: "RuleGuard प्रमाण", fPreflight: "पूर्व-जाँच",
    fRbi: "RBI TAT परिपत्र 2019", fCpa: "CPA 2019 मिसालें", fDpdp: "DPDP-सचेत डिज़ाइन",
    fDossier: "शोध-संग्रह", fCodexLog: "Codex निर्माण-लॉग", fHonesty: "ईमानदारी घोषणाएँ",
    fixEyebrow: "FIXER.OS / जवाबदेही कंसोल — स्वतंत्र प्रोटोटाइप",
    fixTitle: "निर्णय की जाँच करें, नागरिक की नहीं।",
    fixSub: "ऑडिट कंसोल। स्वतंत्र तथ्यों के विरुद्ध सरकारी पोर्टल के दावों को सत्यापित करता है।",
    caseLbl: "केस",
    openMock: "नकली पोर्टल खोलें",
    loadingLedger: "केस बहीखाता लोड हो रहा है…",
    problemTag: "ऑडिट विवरण: EPFO झूठी अस्वीकृति मामला",
    generalityTag: "ऑडिट विवरण: भुगतान TAT उल्लंघन मामला",
    nameProofLine: "अभिलेखानुसार नाम मिलान की पुष्टि।",
    tatProofLine: "डेबिट पुष्ट, सेवा प्रदान नहीं की गई।",
    ledgerFail: "बहीखाता सत्यापन असफल",
    errRejected: "अनुरोध अस्वीकृत",
    errNet: "नेटवर्क त्रुटि",
    chips: ["व्याख्या", "मसौदा", "दाख़िल", "SLA", "एस्केलेट"],
    wtFoot: "वही जाँच-वर्ग जो ~1 में से 4 PF दावों को चुपचाप अस्वीकृत करते हैं, उन्हीं पर भविष्यवाणी। नियम कृत्रिम; पैटर्न असली। कानूनी उद्धरण सटीकता हेतु अंग्रे़ज़ी में।",
    tlDesc: "केवल-जोड़ SHA-256 शृंखला — हर घटना पिछले हैश से जुड़ती है। GIGW 3.0 अंकेक्षणीयता; DPDP अधिनियम 2023 अनुसार डेटा-सटीकता।",
    rgLead: "के लिए कोई वैध परिणाम अस्तित्व में नहीं।",
    routeAround: "रास्ता:",
    trSub: "CPGRAMS/EPFO 30-दिवस SLA पदानुक्रम",
    trHead: "अवरोधक नोड साफ़ दिखता है।",
    brChip: "उल्लंघित",
    targetChip: "एस्केलेशन लक्ष्य",
    heldWord: "आयोजित",
    deadlineWord: "समय-सीमा",
    slaIrctcNote: "RBI TAT — T+5 कैलेंडर दिनों में स्वतः वापसी, उसके बाद ₹100/दिन स्वतः (पैरा 5); इनकार पर लोकपाल (पैरा 6)",
    slaEpfoNote: "कृत्रिम डेमो कैलकुलेटर (पैरा-मिलान दर)",
    provChecking: "मूल (origin) जाँचा जा रहा है…",
    provHOfficial: "आधिकारिक मैनिफेस्ट मेल।",
    provHSandbox: "पंजीकृत सैंडबॉक्स मूल।",
    provHUnknown: "अविश्वसनीय मूल — कोई सरकारी सेवा सादे HTTP पर नहीं चलती।",
    tlsOk: "HTTPS — सरकारी पोर्टल हेतु अनिवार्य (CERT-In)",
    tlsBad: "असुरक्षित — HTTP",
    provMethod: "निर्णय बहीखाते में PROVENANCE_VERIFIED रूप में अंकित। विधि: अनुकरित सरकारी मैनिफेस्ट पर अनुमति-सूची (playbooks/trusted-domains.json)।",
    provPhish: "फ़िशिंग क्लोन सबसे बड़ा हमला हैं: 2025 में 28.15 लाख साइबर-अपराध (+24% YoY), CERT-In अनुसार 38% फ़िशिंग से। जाँच दाख़िल से पहले, प्रवाह में हो — DPDPA 2023 नवंबर 2025 से चरणबद्ध।",
    honestySuffix: "(ईमानदारी घोषणा)",
    honestItems: [
      "SHA-256 हैश-शृंखला — प्रति-केस सत्यापित, छेड़छाड़-संसूचक",
      "LLM क्रिया-चयन — सख़्त zod स्कीमा, अनुमति-सूची, नियतिक फ़ॉलबैक (AGENT_MODE)",
      "सर्वर-स्वामित्व पोर्टल-सेशन + zod सत्यापन + 30/मिनट दर-सीमा",
      "अंतराल-तर्क गतिरोध-प्रमाण — EPS 1995/2026 10-वर्ष नियम",
      "RBI TAT मुआवज़ा कैलकुलेटर — DPSS.CO.PD No.629/2019-20, T+5 कैलेंडर दिन, ₹100/दिन स्वतः",
      "प्रोवेनेंस अनुमति-सूची — 5 आधिकारिक डोमेन, TLS जाँच, अन्यथा SANDBOX",
      "कृत्रिम: पोर्टल, तथ्य, समय-सीमाएँ, परिणाम; स्टोर प्रति-प्रक्रिया (डेमो सैंडबॉक्स); कोई जीवित सरकारी सिस्टम नहीं छुआ।"
    ],
    diffHead: "यह मौजूदा चीज़ों से किस तरह अलग है (ऑडिट 22 अगस्त 2026)",
    diffLead: "पहला नागरिक-मुखी UI जो पात्रता-नियम विरोधाभास का मशीन-सत्यापित प्रमाण-पत्र दिखाता है — छेड़छाड़-रहित केस-साक्ष्य शृंखला से बंधा, जीवंत वैधानिक-मुआवज़ा घड़ी सहित।",
    diffItems: [
      "**EPFO CITES 2.01 (जुलाई 2026)** जमा के समय अपने पोर्टल के भीतर कमियाँ जाँचता है — हमारा सिस्टम दाख़िल से पहले स्वतंत्र बहीखाते पर वही जाँच-वर्ग चलाता है, सुधार सहित।",
      "**Delhi e-SLA (2011, 567 सेवाएँ)** अपनी सेवाओं हेतु विलंब-मुआवज़ा स्वतः गणना करता है — RBI ₹100/दिन नियम की कोई नागरिक-मुखी घड़ी कहीं नहीं; हम उसे जीवंत दिखाते हैं।",
      "**Catala/CUTECat (फ़्रांस, उत्पादन में)** लाभ-कानून विरोधाभास मशीन-जाँचता है — कोई सिस्टम प्रमाण प्रभावित नागरिक को नहीं देता।",
      "NIC certificatechain.nic.in जारी प्रमाणपत्र शृंखलित करता है — अस्वीकृति-कारण के विरुद्ध विवादित केस-रिकॉर्ड का रीप्ले नहीं।"
    ],
    regsFoot: "उद्धृत विनियम: RBI TAT 20 सितं 2019 · EPS 1995 §10 और EPS 2026 · CPA 2019 §2(11) + क्षेत्राधिकार नियम 2021 (₹50L/₹2Cr) · कांगड़ा CC/297/2025 (20 जुलाई 2026) · DPDP अधिनियम 2023 + नियम (चरणबद्ध) · GIGW 3.0 दिसं 2023 · WCAG 2.1 AA। पूर्व-कला ऊपर उद्धृत।",
    footBottom: "FIXER.OS · Build What Moves India हैकाथॉन हेतु स्वतंत्र प्रोटोटाइप · EPFO, IRCTC या किसी सरकारी निकाय से संबद्ध नहीं · कोई जीवित सिस्टम नहीं छुआ · केवल कृत्रिम डेटा",
    yesLbl: "हाँ", noLbl: "नहीं", tatNoTicket: "नहीं — सेवा कभी सौंपी नहीं गई",
    fixPrefix: "सुधार: ",
    botName: "FIXER.OS नेविगेटर",
    botWelcome: "नमस्ते! मैं आपका विजुअल गाइड हूँ। क्या आपको प्लेटफॉर्म को समझने में मदद चाहिए?",
    botYes: "हाँ, मेरा मार्गदर्शन करें!",
    botNo: "नहीं, मैं खुद देखूँगा",
    botSelectTour: "एक गाइडेड वॉकथ्रू चुनें:",
    tourPortalName: "🏛️ पीएफ अस्वीकृति सिम्युलेटर (EPFO पोर्टल)",
    tourFixerName: "🧾 ऑडिट और एस्केलेशन (एजेंट कंसोल)",
    tourDemoName: "🎬 परिणामों की तुलना (डेमो थिएटर)",
    botMinimize: "असिस्टेंट छोटा करें",
    botClose: "दौरा समाप्त करें",
    botPrev: "पीछे",
    botNext: "अगला कदम",
    botTourCompleted: "वॉकथ्रू पूरा हुआ! बहुत बढ़िया काम किया।",
    tourPortalSteps: [
      "कदम 1: लॉग इन करने के लिए UAN: 100000000000 और पासवर्ड: demo1234 डालें, कैप्चा भरें, फिर 'सत्यापित करें' दबाएं।",
      "कदम 2: अंदर आने के बाद, क्लेम सिमुलेशन शुरू करने के लिए 'PF Advance (Form-31)' पर क्लिक करें।",
      "कदम 3: नियम व शर्तें स्वीकार करने के लिए चेकबॉक्स पर टिक करें।",
      "कदम 4: अनुरोध सबमिट करने के लिए 'Submit Claim' पर क्लिक करें।",
      "कदम 5: दावा प्रक्रिया में है। प्रक्रिया की घड़ी को आगे बढ़ाने के लिए 'Simulate Next Day' पर क्लिक करें।",
      "कदम 6: नाम गलत होने के झूठे कारण से दावा खारिज हो गया! शिकायत दर्ज करने के लिए 'File Grievance' पर क्लिक करें।",
      "कदम 7: इनपुट बॉक्स में अपनी ट्रैकिंग आईडी दर्ज करें।",
      "कदम 8: शिकायत भेजने के लिए 'Submit Grievance' पर क्लिक करें।",
      "कदम 9: आप 30 दिनों के लिए लॉक हो गए हैं! अब, इस गतिरोध को हल करने के लिए 'Open Agent Console' पर क्लिक करें।"
    ],
    tourFixerSteps: [
      "कदम 1: बहीखाता लोड करने के लिए ड्रॉपडाउन से 'PF advance false rejection' मामला चुनें।",
      "कदम 2: तथ्यों की समीक्षा करें। फिर एआई एजेंट से ऑडिट प्रक्रिया शुरू करने के लिए 'दस्तावेज़ों का ऑडिट करें' पर क्लिक करें।",
      "कदम 3: TAT मुआवज़े (₹100/दिन) की गणना करने के लिए फिर से क्लिक करें।",
      "कदम 4: छेड़छाड़-रहित बहीखाता हैश बनाने के लिए फिर से क्लिक करें।",
      "कदम 5: कानूनी रूप से पुष्ट एस्केलेशन पैकेट को अंतिम रूप देने के लिए फिर से क्लिक करें।",
      "कदम 6: ऑडिट पूरा हो गया! स्थानीय रूप से पत्र डाउनलोड करने के लिए 'कानूनी अपील पैकेज डाउनलोड करें' पर क्लिक करें।"
    ],
    tourDemoSteps: [
      "कदम 1: दोनों तरफ के लाइव परिणामों को देखने के लिए 'Run comparison' पर क्लिक करें।"
    ],
    bannerPortal: "🔴 कृत्रिम पोर्टल: आप एक पुराने सरकारी पोर्टल के भीतर नागरिक के रूप में काम कर रहे हैं।",
    bannerConsole: "🟢 FIXER.OS कंसोल: आप जवाबदेही कार्यक्षेत्र के भीतर हैं।",
    adminLoginTitle: "🛡️ FIXER.OS कंट्रोल लॉगिन",
    adminUsername: "प्रशासक आईडी",
    adminPassword: "पासवर्ड",
    adminLoginBtn: "क्रेडेंशियल सत्यापित करें → कंट्रोल पैनल",
    adminError: "त्रुटि: अमान्य एडमिन क्रेडेंशियल।",
    adminHint: "डेमो क्रेडेंशियल: आईडी: admin / पासवर्ड: admin1234",
    choicePortalTitle: "🏛️ कृत्रिम पोर्टल",
    choicePortalDesc: "एक नागरिक के रूप में दावे को खारिज होने और अपील के गतिरोध में फंसने का सिमुलेशन चलाने के लिए पुराने सदस्य पोर्टल में प्रवेश करें।",
    choiceConsoleTitle: "🛡️ FIXER.OS कंट्रोल कंसोल",
    choiceConsoleDesc: "तथ्य प्रमाणित करने, कानूनी प्रमाण चलाने, और वैधानिक शिकायत एस्केलेशन डाउनलोड करने के लिए नागरिक ऑडिट कार्यक्षेत्र खोलें।",
    choicePortalBtn: "कृत्रिम पोर्टल में प्रवेश करें →",
    choiceConsoleBtn: "एजेंट कार्यक्षेत्र खोलें →"
  },
} as const;

export const t = (lang: Lang, key: keyof typeof dict.en): string => (dict[lang][key] ?? dict.en[key]) as string;
export const DICT = dict;

export function translateEvent(lang: Lang, type: string, payload?: any): { title: string; desc: string } {
  const isHi = lang === "hi";

  const titles: Record<string, { en: string; hi: string }> = {
    FACTS_VERIFIED: { en: "FACTS VERIFIED", hi: "तथ्य सत्यापित" },
    CLAIM_REJECTED: { en: "CLAIM REJECTED", hi: "दावा अस्वीकृत" },
    GRIEVANCE_LOCKED_OUT: { en: "GRIEVANCE LOCKED OUT", hi: "शिकायत तालाबंदी" },
    PAYMENT_DEBITED_SERVICE_NOT_ISSUED: { en: "PAYMENT DEBITED SERVICE NOT ISSUED", hi: "भुगतान कटा सेवा जारी नहीं" },
    LLM_DECISION: { en: "LLM DECISION", hi: "एआई निर्णय" },
    FALSE_REJECTION_PROVEN: { en: "FALSE REJECTION PROVEN", hi: "झूठी अस्वीकृति सिद्ध हुई" },
    REBUTTAL_DRAFTED: { en: "EVIDENCE REBUTTAL DRAFTED", hi: "साक्ष्य-आधारित प्रत्युत्तर तैयार" },
    APPEAL_FILED: { en: "APPEAL ROUTE OPENED", hi: "अपील मार्ग खोला गया" },
    SLA_BREACH_CALCULATED: { en: "SLA BREACH CALCULATED", hi: "SLA उल्लंघन परिकलित" },
    ESCALATION_SENT: { en: "ESCALATION PACKET ROUTED", hi: "एस्केलेशन पैकेट भेजा गया" },
    CASE_RESOLVED: { en: "CASE RESOLVED", hi: "मामला हल हुआ" },
    PROVENANCE_VERIFIED: { en: "PROVENANCE VERIFIED", hi: "प्रोवेनेंस सत्यापित" }
  };

  const getDesc = () => {
    if (!payload) return "";
    switch (type) {
      case "FACTS_VERIFIED":
        return isHi 
          ? "स्वतंत्र बहीखाते में नागरिक के सत्यापित तथ्य अंकित किए गए।"
          : "Verified citizen identity and banking facts anchored in the ledger.";
      case "CLAIM_REJECTED":
        return isHi
          ? `पोर्टल द्वारा दावा अस्वीकृत। कारण: ${payload.reason || ""}`
          : `Claim rejected by portal. Reason: ${payload.reason || ""}`;
      case "GRIEVANCE_LOCKED_OUT":
        return isHi
          ? `शिकायत पोर्टल ताला लगा। कारण: ${payload.reason || ""}, अगली शिकायत: ${payload.nextGrievanceAllowedDays || 30} दिन बाद।`
          : `Grievance portal locked out. Reason: ${payload.reason || ""}, next grievance allowed in ${payload.nextGrievanceAllowedDays || 30} days.`;
      case "PAYMENT_DEBITED_SERVICE_NOT_ISSUED":
        return isHi
          ? `RRN ${payload.rrn || ""}: पैसा कट गया, लेकिन सेवा (टिकट) जारी नहीं हुई।`
          : `RRN ${payload.rrn || ""}: payment debited successfully but service was not issued.`;
      case "LLM_DECISION":
        return isHi
          ? `AI मॉडल ने अगला कदम चुना: ${payload.chosenAction || ""}. तर्क: ${payload.reasoning || ""}`
          : `AI model chose next action: ${payload.chosenAction || ""}. Reasoning: ${payload.reasoning || ""}`;
      case "FALSE_REJECTION_PROVEN":
        return isHi
          ? `पोर्टल नाम विसंगति का दावा करता है; जबकि सदस्य-आईडी और UAN नाम दोनों "${payload.right || payload.primaryUanName || ""}" हैं।`
          : `The portal claims a name mismatch; however, both the requested member name and primary UAN are identical.`;
      case "REBUTTAL_DRAFTED":
        return isHi
          ? "नाम मिलान के अकाट्य साक्ष्यों के साथ प्रत्युत्तर मसौदा तैयार किया गया।"
          : "Evidence-backed rebuttal drafted requesting immediate written disposition.";
      case "APPEAL_FILED":
        return isHi
          ? "पोर्टल की शिकायत सीमा उल्लंघन (अमान्य आईडी/30-दिन ताला) के बाद स्वतंत्र अपील दर्ज।"
          : "Parallel appeal filed noting portal's failure to accept its own tracking ID.";
      case "SLA_BREACH_CALCULATED":
        return isHi
          ? `समय-सीमा उल्लंघन: ${payload.daysOverdue || 0} दिन अतिरिक्त। ₹100/दिन की दर से ₹${(payload.daysOverdue || 0) * 100} मुआवज़ा संचित।`
          : `SLA breach: ${payload.daysOverdue || 0} day(s) overdue. ₹${(payload.daysOverdue || 0) * 100} compensation accrued at ₹100/day.`;
      case "ESCALATION_SENT":
        return isHi
          ? `एस्केलेशन पैकेट ${payload.addressee || ""} को भेजा गया। जवाबदेह अधिकारी को नामित किया गया।`
          : `Escalation packet routed to ${payload.addressee || ""}. The accountable blocking node is named.`;
      case "CASE_RESOLVED":
        return isHi
          ? "मामला हल। एस्केलेशन पैकेट सफलतापूर्वक तैयार कर प्रेषित किया गया।"
          : "Case resolved. Escalation packet prepared and routed.";
      case "PROVENANCE_VERIFIED":
        return isHi
          ? `मूल यूआरएल ${payload.origin || ""} सत्यापित। सुरक्षा: ${payload.secure ? "सुरक्षित (HTTPS)" : "असुरक्षित (HTTP)"}, श्रेणी: ${payload.tier || ""}`
          : `Origin ${payload.origin || ""} verified. Secure: ${payload.secure ? "Yes" : "No"}, Tier: ${payload.tier || ""}`;
      default:
        return JSON.stringify(payload);
    }
  };

  const title = titles[type]?.[lang] ?? type.replaceAll("_", " ");
  return { title, desc: getDesc() };
}

export function translateTitle(lang: Lang, title: string): string {
  if (lang !== "hi") return title;
  if (title === "PF advance false rejection") return "पीएफ अग्रिम झूठी अस्वीकृति";
  if (title === "Tatkal payment debited, no ticket") return "तत्काल भुगतान कटा, कोई टिकट नहीं";
  return title;
}

export function translateTraceNode(lang: Lang, text: string): string {
  if (lang !== "hi") return text;
  const map: Record<string, string> = {
    "Member Portal": "सदस्य पोर्टल",
    "Automated eligibility engine": "स्वतः पात्रता इंजन",
    "Claim intake and automated validation": "दावा प्रविष्टि और स्वतः सत्यापन",
    "Field Office": "क्षेत्रीय कार्यालय",
    "Accounts Officer": "खाता अधिकारी",
    "Claim verification queue": "दावा सत्यापन कतार",
    "Regional Office": "क्षेत्रीय कार्यालय",
    "Regional PF Commissioner": "क्षेत्रीय पीएफ आयुक्त",
    "Disposition and grievance supervision": "निपटान और शिकायत पर्यवेक्षण",
    "Central Processing Centre": "केंद्रीय प्रसंस्करण केंद्र",
    "Zonal Additional CPFC": "अंकीय अतिरिक्त सीपीएफसी",
    "Escalation destination": "एस्केलेशन गंतव्य",
    "Payment Gateway": "भुगतान गेटवे",
    "Settlement ops (simulated)": "निपटान संचालन (कृत्रिम)",
    "Bank Nodal Officer": "बैंक नोडल अधिकारी",
    "Principal Nodal Officer": "प्रधान नोडल अधिकारी",
    "IRCTC Refunds (CCM)": "IRCTC धन वापसी (CCM)",
    "Chief Commercial Manager (Refunds)": "मुख्य वाणिज्य प्रबंधक (धन वापसी)",
    "BREACHED": "उल्लंघित",
    "ESCALATION TARGET": "एस्केलेशन लक्ष्य"
  };
  return map[text] ?? text;
}

export function translateTraceNodeRule(lang: Lang, rule: string): string {
  if (lang !== "hi") return rule;
  if (rule.includes("RBI TAT (DPSS.CO.PD")) {
    return "RBI TAT (DPSS.CO.PD No.629/02.01.014/2019-20, 20 सितंबर 2019, एनेक्स 4b): T+5 कैलेंडर दिनों के भीतर विफल UPI मर्चेंट डेबिट का ऑटो-रिवर्सल (T = कैलेंडर तिथि, GI-4)";
  }
  if (rule.includes("Railway Refund Rules")) {
    return "रेलवे रिफंड नियम 2015 — विफल-लेनदेन उलट (RBI TAT के समानांतर)";
  }
  if (rule.includes("RBI Integrated Ombudsman")) {
    return "RBI एकीकृत लोकपाल योजना 2021 — यदि TAT मुआवजा स्वतः भुगतान नहीं किया जाता है (परिपत्र पैरा 6) तो एस्केलेशन";
  }
  if (rule.includes("Claim intake")) {
    return "दावा प्रविष्टि और स्वतः सत्यापन";
  }
  if (rule.includes("Claim verification")) {
    return "दावा सत्यापन कतार";
  }
  if (rule.includes("Disposition and grievance")) {
    return "निपटान और शिकायत पर्यवेक्षण";
  }
  if (rule.includes("Escalation destination")) {
    return "एस्केलेशन गंतव्य";
  }
  return rule;
}

export function translatePreflight(lang: Lang, text: string): string {
  if (lang !== "hi") return text;
  const map: Record<string, string> = {
    // Messages
    "Member-ID name differs from Primary-UAN name — the exact cause of most silent rejections.":
      "सदस्य-आईडी का नाम प्राथमिक-UAN नाम से भिन्न है — अधिकांश मूक अस्वीकृतियों का यही मुख्य कारण है।",
    "Bank IFSC failed post-merger liveness check — claims fail SILENTLY on dead IFSCs.":
      "बैंक IFSC विलय-पश्चात सक्रियता जाँच में विफल रहा — अमान्य IFSC पर दावे बिना किसी सूचना के मूक रूप से विफल हो जाते हैं।",
    "E-nomination missing — some claim classes are blocked until filed.":
      "ई-नॉमिनेशन अनुपलब्ध है — कुछ दावा श्रेणियाँ दर्ज होने तक अवरुद्ध रहती हैं।",
    "Service years fall inside the documented pension deadlock interval [9.5, 10) — the rule engine has no valid outcome here.":
      "सेवा वर्ष प्रलेखित पेंशन गतिरोध अंतराल [9.5, 10) के भीतर आते हैं — यहाँ विभाग के नियम इंजन में कोई वैध परिणाम उपलब्ध नहीं है।",
    "Debit recorded without ticket issuance — qualifies as a failed transaction under RBI TAT row 'debited but confirmation not received'.":
      "बिना टिकट जारी किए राशि काटी गई — यह RBI TAT के नियम 'खाता डेबिट हुआ पर पुष्टिकरण प्राप्त नहीं' के तहत एक विफल लेनदेन के रूप में योग्य है।",
    "Missing RRN makes reversal tracking impossible.":
      "RRN अनुपलब्ध होने से धन वापसी (reversal) की ट्रैकिंग असंभव हो जाती है।",
    
    // Fixes
    "Update KYC via employer or Aadhaar seeding before filing.":
      "दाखिल करने से पहले नियोक्ता या आधार सीडिंग के माध्यम से केवाईसी (KYC) अपडेट करें।",
    "Re-validate IFSC on the bank's site; update KYC.":
      "बैंक की साइट पर IFSC को पुनः सत्यापित करें; केवाईसी (KYC) अपडेट करें।",
    "File e-nomination on the member portal.":
      "सदस्य पोर्टल पर ई-नॉमिनेशन दर्ज करें।",
    "Expect rejection; use the RuleGuard route-around (manual application + annexure).":
      "अस्वीकृति की अपेक्षा करें; RuleGuard मार्ग (मैन्युअल आवेदन + एनेक्सचर) का उपयोग करें।",
    "No citizen action needed; entitlement accrues automatically.":
      "नागरिक द्वारा किसी कार्रवाई की आवश्यकता नहीं है; पात्रता स्वतः संचित हो जाती है।",
    "Retrieve RRN from bank statement before filing complaints.":
      "शिकायत दर्ज करने से पहले बैंक विवरण से RRN प्राप्त करें।"
  };
  return map[text] ?? text;
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = (localStorage.getItem("fixer-lang") as Lang) || "en";
      setLangState(saved);
      document.documentElement.lang = saved;
      const savedFont = localStorage.getItem("fixer-font") || "100";
      document.documentElement.style.fontSize = savedFont + "%";
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    try {
      localStorage.setItem("fixer-lang", l);
      setLangState(l);
      document.documentElement.lang = l;
    } catch {}
  };
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}
export const useLang = () => useContext(LangContext);
export const getLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  try { return (localStorage.getItem("fixer-lang") as Lang) || "en"; } catch { return "en"; }
};
