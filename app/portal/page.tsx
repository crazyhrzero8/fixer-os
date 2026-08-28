"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { initialPortalSnapshot, portalCitizen, PORTAL_STATES, PROCESSING_DAYS, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";
import { SYNTHETIC_CITIZEN } from "@/data/seed";
import { GovShell, btnOutline, btnPrimary, cardCls } from "../govshell";
import { useLang, t } from "@/lib/i18n";

/* marquee text now served from PI[lang].marquee */

const inputCls = "mt-1 w-full rounded-sm border border-slate-300 bg-white px-2 py-1.5 text-[13px] text-slate-900 outline-none focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]";
const sectionHead = "border-b border-slate-300 bg-[#eef3f9] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]";
const th = "border border-slate-300 bg-[#eef3f9] px-3 py-1.5 text-left text-[12px] font-bold uppercase tracking-wide";


const PI = {
  en: {
    marquee: [
      "Attention Members: OTP-based authentication is mandatory for availing online services.",
      "Kindly keep your UAN, password and captcha characters ready before beginning.",
      "This demonstration portal replays documented real-world failure sequences."
    ],
    breadcrumb: ["Home", "Members", "Online Claim Status"],
    session: "Session:",
    otpIntro: "An OTP has been sent to your registered mobile ending",
    otpDbNote: "OTP is 6-digit crypto-random, 5-min expiry, 3-attempt lock — stored only in server session (httpOnly cookie), never in client.",
    capNote: "Server validates UAN, password and captcha together — wrong any → new captcha, no OTP.",
    dashNote: "This dashboard is the \u201cwhat better looks like\u201d contrast: real EPFO hides the balance behind passbook downloads; here it is one click. All data synthetic.",
    svcYears: "years",
    kycSub: "Aadhaar · PAN · Bank (synthetic)",
    passSub: "EPF balance (synthetic) · interest 8.25%",
    claimSub: "PF Advance (Para 68-J medical)",
    memberIs: "Member:",
    ifscValid: "(valid)",
    nomDone: "E-nomination: Done ✓",
    trackLabel: "Tracking ID:",
    purposeVal: "Medical Treatment — Illness of family member (Para 68-J)",
    amountVal: "₹ 50,000/-",
    synthetic: "All data synthetic.",
    claimDb: "Database: claim stored in hash-chained ledger (SHA-256 append-only, per-process), not in browser. No real money moved.",
    day1: "Day 1", evReceived: "Claim Received", evRemark: "Under Process at Field Office",
    evCheck: "Status Check", evPending: "Your request is under process. Please do not submit another claim.",
    simDay: "Simulated day",
    of: "of",
    noExpl: "No further explanation is available on the portal. For grievances, kindly approach the concerned office.",
    rejReason: "Reason: Name on requested Member ID and Primary UAN does not match. Kindly contact your employer for KYC updation.",
    particulars: "Particulars", officeRecord: "As per Office Record",
    nameEmployer: "Requested Member ID Name", nameUan: "Primary UAN Name",
    identical: "IDENTICAL — the stated rejection reason is contradicted by the portal's own displayed record.",
    simNote: "(This comparison table is rendered by the simulation to expose the contradiction. The real portal displays nothing.)",
    enterTrack: "Please enter the Claim Tracking ID exactly as supplied in your rejection notice:",
    trackCase: "Note: Tracking ID is case-sensitive and must match departmental records. Improper entries will invalidate the grievance attempt.",
    noReg: "No grievance has been registered. One grievance attempt has been recorded against this claim.",
    idErr1: "The tracking ID cannot be verified against departmental records. Please try again later.",
    lockBody: "Next grievance allowed in 30 days. A grievance attempt has already been recorded for this claim.",
    escNone: "None displayed. Citizen may approach the Regional Office in person during working hours (Mon–Fri, 09:45–17:30).",
    otpAttemptsLeft: "{left} of {max} OTP attempts remaining",
    otpLockTitle: "OTP temporarily blocked — too many failed attempts",
    otpLockBody: "A new OTP will be available after the 2-minute cooldown. This mirrors UIDAI/EPFO-style daily-attempt lockouts.",
    retryIn: "Resend available in {t}",
    cooldownOver: "Cooldown over. Press \"Resend OTP\" for a fresh code.",
    otpAfterCaptcha: "— (shown here after the captcha step)",
    otpExpires: "(expires in 5 min · 3 attempts max)",
    capCryptoNote: "Captcha rotates crypto-randomly on every refresh click and every failed attempt.",
    needNew: "Need a new one?",
    serverValidateNote: "Server validates UAN (12 digits), password and captcha together — wrong any → new captcha, no OTP.",
    errPortal: "Portal unavailable. Kindly retry.",
    errCaptchaSvc: "Captcha service unavailable. Kindly refresh the page.",
    errCaptchaRefresh: "Could not refresh captcha.",
    thDate: "Date", thEvent: "Event", thRemarks: "Remarks",
    dayPrefix: "Day",
    cmpLabel: "Comparison",
    gmisHead: "Grievance Management System (GMIS)",
    safetyHead: "Database & safety (submission-safe):",
    safetyBody: "No real database, no real IDs. Portal sessions live in httpOnly cookies (30-min TTL, server-owned FSM); OTP lives server-side only (5-min, 3-attempt, crypto-random); the ledger is SHA-256 append-only per process (synthetic seed only). Rate limit 30/min, zod on every input, CSP headers. Follows RBI TAT, CPA 2019, DPDP 2023 (phased), GIGW 3.0.",
    acceptTermsNote: "Please accept the Terms & Conditions to submit — required for hackathon honesty + DPDP consent."
  },
  hi: {
    marquee: [
      "सदस्यों का ध्यान दें: ऑनलाइन सेवाओं हेतु OTP-आधारित प्रमाणीकरण अनिवार्य है।",
      "कृपया शुरू करने से पहले अपना UAN, पासवर्ड और कैप्चा अक्षर तैयार रखें।",
      "यह प्रदर्शी पोर्टल दर्ज वास्तविक विफलता-क्रम दोहराता है।"
    ],
    breadcrumb: ["मुखपृष्ठ", "सदस्य", "ऑनलाइन दावा स्थिति"],
    session: "सेशन:",
    otpIntro: "आपके पंजीकृत मोबाइल पर OTP भेजा गया है, जो समाप्त होता है",
    otpDbNote: "OTP 6-अंकीय क्रिप्टो-यादृच्छिक है, 5-मिनट वैध, 3-प्रयास ताला — केवल सर्वर-सेशन (httpOnly कुकी) में सुरक्षित, क्लाइंट में कभी नहीं।",
    capNote: "सर्वर UAN, पासवर्ड और कैप्चा तीनों एक साथ जाँचता है — कोई भी ग़लत → नया कैप्चा, OTP नहीं।",
    dashNote: "यह डैशबोर्ड “बेहतर कैसा दिखता है” का विरोधाभास है: असली EPFO बैलेंस पासबुक-डाउनलोड के नीचे छुपाता है; यहाँ एक क्लिक है। सारा डेटा कृत्रिम।",
    svcYears: "वर्ष",
    kycSub: "आधार · पैन · बैंक (कृत्रिम)",
    passSub: "EPF शेष (कृत्रिम) · ब्याज 8.25%",
    claimSub: "पीएफ अग्रिम (पैरा 68-J चिकित्सा)",
    memberIs: "सदस्य:",
    ifscValid: "(वैध)",
    nomDone: "ई-नॉमिनेशन: हो गया ✓",
    trackLabel: "ट्रैकिंग आईडी:",
    purposeVal: "चिकित्सा उपचार — परिवार के सदस्य की बीमारी (पैरा 68-J)",
    amountVal: "₹ 50,000/-",
    synthetic: "सारा डेटा कृत्रिम।",
    claimDb: "डेटाबेस: दावा हैश-शृंखलित बहीखाते (SHA-256, केवल-जोड़, प्रक्रिया-आधारित) में सुरक्षित, ब्राउज़र में नहीं। असली पैसा संलग्न नहीं।",
    day1: "दिन 1", evReceived: "दावा प्राप्त", evRemark: "फील्ड कार्यालय में प्रक्रियाधीन",
    evCheck: "स्थिति जाँच", evPending: "आपका अनुरोध प्रक्रियाधीन है। कृपया दूसरा दावा जमा न करें।",
    simDay: "अनुकरित दिन",
    of: "/",
    noExpl: "पोर्टल पर आगे कोई स्पष्टीकरण उपलब्ध नहीं। शिकायत हेतु कृपया संबंधित कार्यालय के पास जाएँ।",
    rejReason: "कारण: अनुरोधित सदस्य-आईडी और प्राथमिक UAN का नाम मेल नहीं खाता। KYC अद्यतन हेतु नियोक्ता से संपर्क करें।",
    particulars: "विवरण", officeRecord: "कार्यालय-अभिलेखानुसार",
    nameEmployer: "अनुरोधित सदस्य-आईडी नाम", nameUan: "प्राथमिक UAN नाम",
    identical: "समरूप — बताया गया अस्वीकरण-कारण पोर्टल के अपने प्रदर्शित अभिलेख से विरोधाभासी है।",
    simNote: "(यह तुलना-तालिका सिमुलेशन द्वारा विरोधाभास उजागर करने हेतु है। असली पोर्टल कुछ नहीं दिखाता।)",
    enterTrack: "कृपया अस्वीकृति-सूचना में दी गई दावा-ट्रैकिंग आईडी ठीक वैसे ही दर्ज करें:",
    trackCase: "ध्यान दें: ट्रैकिंग आईडी अक्षर-संवेदनशील है और विभागीय अभिलेख से मेल खानी चाहिए। ग़लत प्रविष्टि शिकायत-प्रयास अवैध कर देगी।",
    noReg: "कोई शिकायत दर्ज नहीं हुई। इस दावे के विरुद्ध एक शिकायत-प्रयास अभिलिखित हुआ है।",
    idErr1: "ट्रैकिंग आईडी विभागीय अभिलेखों से सत्यापित नहीं हो पा रही। कृपया बाद में पुनः प्रयास करें।",
    lockBody: "अगली शिकायत 30 दिनों में संभव। इस दावे हेतु शिकायत-प्रयास पहले ही अभिलिखित हो चुका है।",
    escNone: "कोई विकल्प प्रदर्शित नहीं। नागरिक कार्य-समय में क्षेत्रीय कार्यालय जा सकते हैं (सोम–शुक्र, 09:45–17:30)।",
    otpAttemptsLeft: "OTP के {max} में से {left} प्रयास शेष",
    otpLockTitle: "OTP अस्थायी रूप से अवरुद्ध — अधिक असफल प्रयास",
    otpLockBody: "2-मिनट की देरी के बाद नया OTP उपलब्ध होगा। यह UIDAI/EPFO-शैली प्रयास-ताला जैसा है।",
    retryIn: "रिसेंड उपलब्ध: {t} बाद",
    cooldownOver: "देरी समाप्त। नए OTP हेतु “OTP फिर भेजें” दबाएँ।",
    otpAfterCaptcha: "— (कैप्चा चरण के बाद यहीं दिखेगा)",
    otpExpires: "(5 मिनट में समाप्त · अधिकतम 3 प्रयास)",
    capCryptoNote: "कैप्चा हर रिफ्रेश-क्लिक और हर असफल प्रयास पर क्रिप्टो-यादृच्छिक बदलता है।",
    needNew: "नया चाहिए?",
    serverValidateNote: "सर्वर UAN (12 अंक), पासवर्ड और कैप्चा तीनों एक साथ जाँचता है — कोई भी ग़लत → नया कैप्चा, OTP नहीं।",
    errPortal: "पोर्टल उपलब्ध नहीं। कृपया पुनः प्रयास करें।",
    errCaptchaSvc: "कैप्चा सेवा उपलब्ध नहीं। कृपया पेज रिफ्रेश करें।",
    errCaptchaRefresh: "कैप्चा रिफ्रेश नहीं हो सका।",
    thDate: "दिनांक", thEvent: "घटना", thRemarks: "टिप्पणी",
    dayPrefix: "दिन",
    cmpLabel: "तुलना",
    gmisHead: "शिकायत प्रबंधन प्रणाली (GMIS)",
    safetyHead: "डेटाबेस व सुरक्षा:",
    safetyBody: "कोई असली डेटाबेस नहीं, कोई असली ID नहीं। पोर्टल-सेशन httpOnly कुकी में (30-मिनट TTL, सर्वर-स्वामित्व FSM); OTP केवल सर्वर-सेशन में (5-मिनट, 3-प्रयास, क्रिप्टो-यादृच्छिक); बहीखाता SHA-256 केवल-जोड़ प्रति-प्रक्रिया (कृत्रिम सीड)। दर-सीमा 30/मिनट, हर इनपुट पर zod, CSP हेडर। RBI TAT, CPA 2019, DPDP 2023 (चरणबद्ध), GIGW 3.0 के अनुसार।",
    acceptTermsNote: "जमा करने हेतु नियम व शर्तें स्वीकार करें — हैकाथॉन ईमानदारी + DPDP सहमति हेतु अनिवार्य।"
  }
} as const;

const ASSISTANT_DIALECTS = {
  hi: {
    welcome: "नमस्ते! ईपीएफओ डिजिटल सहायता केंद्र में आपका स्वागत है।",
    selectLang: "कृपया संवाद की भाषा चुनें:",
    askUan: "सत्यापन के लिए कृपया अपना 12 अंकों का UAN दर्ज करें या नीचे से चुनें:",
    otpSent: "सत्यापन सफल! आपके पंजीकृत मोबाइल (XXXX-XXXX-1234) पर ओटीपी (OTP) भेजा गया है। कृपया दर्ज करें:",
    loginSuccess: "लॉगिन सफल! आप क्या सहायता चाहते हैं? आपका पीएफ बैलेंस ₹4,36,000 है।",
    submitMedicalClaim: "बीमारी/मेडिकल हेतु पीएफ निकासी दावा (₹50,000) दर्ज करें",
    submittingClaim: "दावा जमा किया जा रहा है...",
    claimSuccess: "बधाई हो! आपका ₹50,000 का चिकित्सा अग्रिम दावा सफलतापूर्वक जमा कर दिया गया है। दावा संख्या PF/2026/A/0091847 है।",
    closeBtn: "सहायता केंद्र बंद करें",
    invalidOtp: "अमान्य ओटीपी। कृपया सही ओटीपी दर्ज करें।",
    ivrWelcome: "नमस्कार! ईपीएफओ आवाज सहायक में आपका स्वागत है। हिंदी के लिए फोन की-पैड पर 1 दबाएं, अंग्रेजी के लिए 2 दबाएं।",
    ivrLangSelected: "हिंदी भाषा चुनी गई है। कृपया अपना 12 अंकों का UAN दर्ज करें और फिर हैश (#) दबाएं।",
    ivrOtpSent: "यूएएन सत्यापित। आपके मोबाइल पर ओटीपी भेजा गया है। ओटीपी दर्ज कर हैश (#) दबाएं।",
    ivrClaimSuccess: "ओटीपी सत्यापित। आपका चिकित्सा अग्रिम दावा सफलतापूर्वक दर्ज कर लिया गया है। धन्यवाद।",
    ivrError: "त्रुटि। कृपया सही मूल्य दर्ज करें और हैश दबाएं।"
  },
  en: {
    welcome: "Hello! Welcome to the EPFO Digital Claim Assistant.",
    selectLang: "Please select your conversation language:",
    askUan: "For identity verification, please enter your 12-digit UAN or select one below:",
    otpSent: "Verification successful! An OTP has been sent to your registered mobile (XXXX-XXXX-1234). Please enter it below:",
    loginSuccess: "Login successful! How can I assist you? Your current PF balance is ₹4,36,000.",
    submitMedicalClaim: "File Medical PF Advance Claim (₹50,000)",
    submittingClaim: "Submitting claim form...",
    claimSuccess: "Congratulations! Your medical advance claim for ₹50,000 has been successfully filed. Claim ID is PF/2026/A/0091847.",
    closeBtn: "Close Assistant",
    invalidOtp: "Invalid OTP. Please enter a valid one.",
    ivrWelcome: "Welcome to EPFO Voice Assistant. Press 1 for Hindi, press 2 for English on your keypad.",
    ivrLangSelected: "English language selected. Please enter your 12-digit UAN followed by the hash (#) key.",
    ivrOtpSent: "UAN verified. OTP sent to mobile. Enter the OTP followed by the hash (#) key.",
    ivrClaimSuccess: "OTP verified. Your medical claim has been successfully filed. Thank you.",
    ivrError: "Error. Please enter correct value and press hash."
  },
  ta: {
    welcome: "வணக்கம்! EPFO டிஜிட்டல் உதவி மையத்திற்கு உங்களை வரவேற்கிறோம்.",
    selectLang: "உரையாடல் மொழியைத் தேர்ந்தெடுக்கவும்:",
    askUan: "அடையாள சரிபார்ப்புக்கு, தயவுசெய்து உங்கள் 12-இலக்க UAN-ஐ உள்ளிடவும் அல்லது கீழே தேர்ந்தெடுக்கவும்:",
    otpSent: "சரிபார்ப்பு வெற்றிகரமாக முடிந்தது! உங்கள் மொபைல் எண்ணுக்கு (XXXX-XXXX-1234) OTP அனுப்பப்பட்டுள்ளது. அதை உள்ளிடவும்:",
    loginSuccess: "உள்நுழைவு வெற்றிகரமாக முடிந்தது! நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? உங்கள் இருப்பு ₹4,36,000 ஆகும்.",
    submitMedicalClaim: "மருத்துவ முன்பணக் கோரிக்கை (₹50,000) சமர்ப்பிக்கவும்",
    submittingClaim: "கோரிக்கை சமர்ப்பிக்கப்படுகிறது...",
    claimSuccess: "வாழ்த்துகள்! உங்கள் மருத்துவ முன்பணக் கோரிக்கை வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது. கோரிக்கை எண் PF/2026/A/0091847 ஆகும்.",
    closeBtn: "உதவி மையத்தை மூடவும்",
    invalidOtp: "தவறான OTP. தயவுசெய்து சரியான OTP-ஐ உள்ளிடவும்.",
    ivrWelcome: "EPFO குரல் உதவிக்கு உங்களை வரவேற்கிறோம். இந்திக்கு 1-ஐ அழுத்தவும், ஆங்கிலத்திற்கு 2-ஐ அழுத்தவும்.",
    ivrLangSelected: "ஆங்கில மொழி தேர்ந்தெடுக்கப்பட்டது. உங்கள் UAN-ஐ உள்ளிட்டு பின்னர் ஹேஷ் (#) அழுத்தவும்.",
    ivrOtpSent: "UAN சரிபார்க்கப்பட்டது. OTP அனுப்பப்பட்டது. OTP-ஐ உள்ளிட்டு பின்னர் ஹேஷ் (#) அழுத்தவும்.",
    ivrClaimSuccess: "OTP சரிபார்க்கப்பட்டது. உங்கள் கோரிக்கை சமர்ப்பிக்கப்பட்டது. நன்றி.",
    ivrError: "பிழை. மீண்டும் முயல்க."
  },
  bn: {
    welcome: "হ্যালো! ইপিএফও ডিজিটাল দাবি সহকারীতে আপনাকে স্বাগত।",
    selectLang: "দয়া করে আপনার কথোপকথনের ভাষা নির্বাচন করুন:",
    askUan: "পরিচয় যাচাইকরণের জন্য, দয়া করে আপনার ১২-সংখ্যার UAN লিখুন বা নিচে থেকে নির্বাচন করুন:",
    otpSent: "যাচাইকরণ সফল! আপনার নিবন্ধিত মোবাইলে (XXXX-XXXX-1234) একটি ওটিপি পাঠানো হয়েছে। নিচে ওটিপি লিখুন:",
    loginSuccess: "লগইন সফল! আমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনার বর্তমান পিএফ ব্যালেন্স ₹৪,৩৬,০০০।",
    submitMedicalClaim: "চিকিৎসার জন্য পিএফ অগ্রিম দাবি (₹৫০,০০০) জমা দিন",
    submittingClaim: "দাবি ফর্ম জমা দেওয়া হচ্ছে...",
    claimSuccess: "অভিনন্দন! আপনার ₹৫০,০০০ টাকার চিকিৎসা অগ্রিম দাবি সফলভাবে জমা দেওয়া হয়েছে। দাবি আইডি PF/2026/A/0091847।",
    closeBtn: "সহকারী বন্ধ করুন",
    invalidOtp: "অমান্য ওটিপি। দয়া করে সঠিক ওটিপি লিখুন।",
    ivrWelcome: "ইপিএফও ভয়েস সহকারীতে আপনাকে স্বাগত। আপনার কিপ্যাডে হিন্দির জন্য ১, ইংরেজির জন্য ২ টিপুন।",
    ivrLangSelected: "ভাষা নির্বাচন করা হয়েছে। আপনার ১২-সংখ্যার UAN টাইপ করে হ্যাশ (#) টিপুন।",
    ivrOtpSent: "UAN যাচাই করা হয়েছে। মোবাইলে ওটিপি পাঠানো হয়েছে। ওটিপি টাইপ করে হ্যাশ (#) টিপুন।",
    ivrClaimSuccess: "ওটিপি যাচাই করা হয়েছে। আপনার চিকিৎসা দাবি সফলভাবে জমা দেওয়া হয়েছে। ধন্যবাদ।",
    ivrError: "ত্রুটি। সঠিক মান লিখুন এবং হ্যাশ টিপুন।"
  },
  kn: {
    welcome: "ನಮಸ್ಕಾರ! EPFO ಡಿಜಿಟಲ್ ಕ್ಲೈಮ್ ಅಸಿಸ್ಟೆಂಟ್‌ಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.",
    selectLang: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಭಾಷಣೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    askUan: "ಗುರುತು ಪರಿಶೀಲನೆಗಾಗಿ, ದಯವಿಟ್ಟು ನಿಮ್ಮ 12-ಅಂಕಿಯ UAN ಅನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ:",
    otpSent: "ಪರಿಶೀಲನೆ ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್‌ಗೆ (XXXX-XXXX-1234) OTP ಕಳುಹಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಳಗೆ ನಮೂದಿಸಿ:",
    loginSuccess: "ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ನಿಮ್ಮ ಪ್ರಸ್ತುತ PF ಬ್ಯಾಲೆನ್ಸ್ ₹4,36,000 ಆಗಿದೆ.",
    submitMedicalClaim: "ವೈದ್ಯಕೀಯ PF ಮುಂಗಡ ಕ್ಲೈಮ್ (₹50,000) ಸಲ್ಲಿಸಿ",
    submittingClaim: "ಕ್ಲೈಮ್ ಫಾರ್ಮ್ ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    claimSuccess: "ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ₹50,000 ವೈದ್ಯಕೀಯ ಮುಂಗಡ ಕ್ಲೈಮ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ಕ್ಲೈಮ್ ಐಡಿ PF/2026/A/0091847 ಆಗಿದೆ.",
    closeBtn: "ಸಹಾಯಕರನ್ನು ಮುಚ್ಚಿ",
    invalidOtp: "ಅಮಾನ್ಯ OTP. ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ OTP ನಮೂದಿಸಿ.",
    ivrWelcome: "EPFO ಧ್ವನಿ ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ. ಹಿಂದಿಗಾಗಿ 1 ಒತ್ತಿ, ಇಂಗ್ಲಿಷ್‌ಗಾಗಿ 2 ಒತ್ತಿ.",
    ivrLangSelected: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ. ನಿಮ್ಮ 12-ಅಂಕಿಯ UAN ನಮೂದಿಸಿ ನಂತರ ಹ್ಯಾಶ್ (#) ಒತ್ತಿ.",
    ivrOtpSent: "UAN ಪರಿಶೀಲಿಸಲಾಗಿದೆ. OTP ಕಳುಹಿಸಲಾಗಿದೆ. OTP ನಮೂದಿಸಿ ನಂತರ ಹ್ಯಾಶ್ (#) ಒತ್ತಿ.",
    ivrClaimSuccess: "OTP ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಕ್ಲೈಮ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ಧನ್ಯವಾದಗಳು.",
    ivrError: "ದೋಷ. ಸರಿಯಾದ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ನಂತರ ಹ್ಯಾಶ್ ಒತ್ತಿ."
  },
  te: {
    welcome: "నమస్కారం! EPFO డిజిటల్ క్లెయిమ్ అసిస్టెంట్‌కు స్వాగతం.",
    selectLang: "దయచేసి మీ సంభాషణ భాషను ఎంచుకోండి:",
    askUan: "గుర్తింపు ధృవీకరణ కోసం, దయచేసి మీ 12-అంకెల UAN నమోదు చేయండి లేదా క్రింద ఎంచుకోండి:",
    otpSent: "ధృవీకరణ విజయవంతమైంది! మీ నమోదిత మొబైల్‌కు (XXXX-XXXX-1234) OTP పంపబడింది. దయచేసి క్రింద నమోదు చేయండి:",
    loginSuccess: "లాగిన్ విజయవంతమైంది! నేను మీకు ఎలా సహాయం చేయగలను? మీ ప్రస్తుత PF బ్యాలెన్స్ ₹4,36,000.",
    submitMedicalClaim: "వైద్య PF అడ్వాన్స్ క్లెయిమ్ (₹50,000) దాఖలు చేయండి",
    submittingClaim: "క్లెయిమ్ ఫారమ్ సమర్పించబడుతోంది...",
    claimSuccess: "అభినందనలు! ₹50,000 వైద్య అడ్వాన్స్ క్లెయిమ్ విజయవంతంగా దాఖలు చేయబడింది. క్లెయిమ్ ఐడి PF/2026/A/0091847.",
    closeBtn: "సహాయకుడిని మూసివేయండి",
    invalidOtp: "అమాన్యమైన OTP. దయచేసి సరైన OTP నమోదు చేయండి.",
    ivrWelcome: "EPFO వాయిస్ అసిస్టెంట్‌కు స్వాగతం. హిందీ కోసం 1, ఇంగ్లీష్ కోసం 2 నొక్కండి.",
    ivrLangSelected: "భాష ఎంచుకోబడింది. దయచేసి మీ UAN నమోదు చేసి, ఆపై హ్యాష్ (#) నొక్కండి.",
    ivrOtpSent: "UAN ధృవీకరించబడింది. OTP పంపబడింది. OTP నమోదు చేసి ఆపై హ్యాష్ (#) నొక్కండి.",
    ivrClaimSuccess: "OTP ధృవీకరించబడింది. మీ వైద్య క్లెయిమ్ విజయవంతంగా దాఖలు చేయబడింది. ధన్యవాదాలు.",
    ivrError: "లోపం. సరైన విలువను నమోదు చేసి హ్యాష్ నొక్కండి."
  },
  gu: {
    welcome: "નમસ્તે! EPFO ડિજિટલ ક્લેમ આસિસ્ટન્ટમાં આપનું સ્વાગત છે.",
    selectLang: "કૃપા કરીને આપની વાતચીતની ભાષા પસંદ કરો:",
    askUan: "ઓળખ ચકાસણી માટે, કૃપા કરીને આપનો 12-આંકડાનો UAN દાખલ કરો અથવા નીચેથી પસંદ કરો:",
    otpSent: "ચકાસણી સફળ! આપના રજિસ્ટર્ડ મોબાઈલ (XXXX-XXXX-1234) પર OTP મોકલવામાં આવ્યો છે. કૃપા કરીને નીચે દાખલ કરો:",
    loginSuccess: "લોગિન સફળ! હું આપને કઈ રીતે મદદ કરી શકું? આપનું ચાલુ PF બેલેન્સ ₹4,36,000 છે.",
    submitMedicalClaim: "મેડિકલ PF એડવાન્સ ક્લેમ (₹50,000) ફાઇલ કરો",
    submittingClaim: "ક્લેમ ફોર્મ સબમિટ થઈ રહ્યું છે...",
    claimSuccess: "અભિનંદન! આપનો ₹50,000 નો મેડિકલ એડવાન્સ ક્લેમ સફળતાપૂર્વક સબમિટ થઈ ગયો છે. ક્લેમ આઈડી PF/2026/A/0091847 છે.",
    closeBtn: "આસિસ્ટન્ટ બંધ કરો",
    invalidOtp: "અમાન્ય OTP. કૃપા કરીને સાચો OTP દાખલ કરો.",
    ivrWelcome: "EPFO વોઇસ આસિસ્ટન્ટમાં આપનું સ્વાગત છે. હિન્દી માટે 1, અંગ્રેજી માટે 2 દબાવો.",
    ivrLangSelected: "ભાષા પસંદ કરવામાં આવી છે. આપનો 12-આંકડાનો UAN દાખલ કરી હેશ (#) દબાવો.",
    ivrOtpSent: "UAN ચકાસાયેલ છે. OTP મોકલાયો છે. OTP દાખલ કરી હેશ (#) દબાવો.",
    ivrClaimSuccess: "OTP ચકાસાયેલ છે. આપનો મેડિકલ ક્લેમ સફળતાપૂર્વક ફાઇલ થઈ ગયો છે. આભાર.",
    ivrError: "ભૂલ. કૃપા કરીને સાચો નંબર લખી હેશ દબાવો."
  },
  mr: {
    welcome: "नमस्कार! EPFO डिजिटल दावा सहाय्यकामध्ये आपले स्वागत आहे.",
    selectLang: "कृपया तुमच्या संभाषणाची भाषा निवडा:",
    askUan: "ओळख पडताळणीसाठी, कृपया तुमचा १२-अंकी UAN प्रविष्ट करा किंवा खालीलपैकी निवडा:",
    otpSent: "पडताळणी यशस्वी! तुमच्या नोंदणीकृत मोबाईलवर (XXXX-XXXX-1234) OTP पाठवला आहे. कृपया खाली प्रविष्ट करा:",
    loginSuccess: "लॉगिन यशस्वी! मी तुम्हाला कशी मदत करू शकतो? तुमचे चालू PF शिल्लक ₹४,३६,००० आहे.",
    submitMedicalClaim: "वैद्यकीय PF आगाऊ दावा (₹५०,०००) दाखल करा",
    submittingClaim: "दावा अर्ज सबमिट केला जात आहे...",
    claimSuccess: "अभिनंदन! तुमचा ₹५०,००० चा वैद्यकीय आगाऊ दावा यशस्वीरित्या दाखल झाला आहे. दावा आयडी PF/2026/A/0091847 आहे.",
    closeBtn: "सहाय्यक बंद करा",
    invalidOtp: "अवैध OTP. कृपया वैध OTP प्रविष्ट करा.",
    ivrWelcome: "EPFO व्हॉइस असिस्टंटमध्ये आपले स्वागत आहे. हिंदीसाठी 1, इंग्रजीसाठी 2 दाबा.",
    ivrLangSelected: "भाषा निवडली आहे. कृपया तुमचा १२-अंकी UAN प्रविष्ट करून हॅश (#) दाबा.",
    ivrOtpSent: "UAN पडताळले आहे. OTP पाठवला आहे. OTP प्रविष्ट करून हॅश (#) दाबा.",
    ivrClaimSuccess: "OTP पडताळले आहे. तुमचा वैद्यकीय दावा यशस्वीरित्या दाखल झाला आहे. धन्यवाद.",
    ivrError: "त्रुटी. कृपया योग्य संख्या लिहून हॅश दाबा."
  },
  pa: {
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! EPFO ਡਿਜੀਟਲ ਕਲੇਮ ਅਸਿਸਟੈਂਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।",
    selectLang: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਗੱਲਬਾਤ ਦੀ ਭਾਸ਼ਾ ਚੁਣੋ:",
    askUan: "ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ 12-ਅੰਕਾਂ ਦਾ UAN ਦਰਜ ਕਰੋ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪਾਂ ਵਿੱਚੋਂ ਚੁਣੋ:",
    otpSent: "ਪੁਸ਼ਟੀਕਰਨ ਸਫਲ ਰਿਹਾ! ਤੁਹਾਡੇ ਰਜਿਸਟਰਡ ਮੋਬਾਈਲ (XXXX-XXXX-1234) 'ਤੇ OTP ਭੇਜਿਆ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਰਜ ਕਰੋ:",
    loginSuccess: "ਲੌਗਇਨ ਸਫਲ ਰਿਹਾ! ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਤੁਹਾਡਾ ਮੌਜੂਦਾ PF ਬੈਲੰਸ ₹4,36,000 ਹੈ।",
    submitMedicalClaim: "ਮੈਡੀਕਲ PF ਐਡਵਾਂਸ ਕਲੇਮ (₹50,000) ਦਾਇਰ ਕਰੋ",
    submittingClaim: "ਕਲੇਮ ਫਾਰਮ ਜਮ੍ਹਾਂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    claimSuccess: "ਵਧਾਈਆਂ! ਤੁਹਾਡਾ ₹50,000 ਦਾ ਮੈਡੀਕਲ ਐਡਵਾਂਸ ਕਲੇਮ ਸਫਲਤਾਪੂਰਵਕ ਦਾਇਰ ਹੋ ਗਿਆ ਹੈ। ਕਲੇਮ ਆਈਡੀ PF/2026/A/0091847 ਹੈ।",
    closeBtn: "ਸਹਾਇਕ ਬੰਦ ਕਰੋ",
    invalidOtp: "ਅਵੈਧ OTP। ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ OTP ਦਰਜ ਕਰੋ।",
    ivrWelcome: "EPFO ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਹਿੰਦੀ ਲਈ 1, ਅੰਗਰੇਜ਼ੀ ਲਈ 2 ਦਬਾਓ।",
    ivrLangSelected: "ਭਾਸ਼ਾ ਚੁਣੀ ਗਈ ਹੈ। ਆਪਣਾ 12-ਅੰਕਾਂ ਦਾ UAN ਦਰਜ ਕਰੋ ਅਤੇ ਫਿਰ ਹੈਸ਼ (#) ਦਬਾਓ।",
    ivrOtpSent: "UAN ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ ਹੈ। OTP ਭੇਜਿਆ ਗਿਆ ਹੈ। OTP ਦਰਜ ਕਰਕੇ ਹੈਸ਼ (#) ਦਬਾਓ।",
    ivrClaimSuccess: "OTP ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ ਹੈ। ਤੁਹਾਡਾ ਮੈਡੀਕਲ ਕਲੇਮ ਸਫਲਤਾਪੂਰਵਕ ਦਾਇਰ ਹੋ ਗਿਆ ਹੈ। ਧੰਨਵਾਦ।",
    ivrError: "ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਨੰਬਰ ਦਰਜ ਕਰਕੇ ਹੈਸ਼ ਦਬਾਓ।"
  },
  as: {
    welcome: "নমস্কাৰ! EPFO ডিজিটেল ক্লেম এচিষ্টেণ্টলৈ আপোনাক আদৰণি জনাইছোঁ।",
    selectLang: "অনুগ্ৰহ কৰি আপোনাৰ কথোপকথনৰ ভাষা বাছনি কৰক:",
    askUan: "পৰিচয় পৰীক্ষণৰ বাবে, অনুগ্ৰহ কৰি আপোনাৰ ১২-অংকৰ UAN লিখক বা তলৰ পৰা বাছনি কৰক:",
    otpSent: "পৰীক্ষণ সফল! আপোনাৰ পঞ্জীভুক্ত ম'বাইললৈ (XXXX-XXXX-1234) এটা OTP প্ৰেৰণ কৰা হৈছে। অনুগ্ৰহ কৰি তলত লিখক:",
    loginSuccess: "লগইন সফল! মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ? আপোনাৰ বৰ্তমানৰ PF বেলেঞ্চ ₹৪,৩৬,০০০।",
    submitMedicalClaim: "চিকিৎসাৰ বাবে PF অগ্ৰিম দাবী (₹৫০,০০০) দাখিল কৰক",
    submittingClaim: "দাবী ফৰ্ম জমা দি থকা হৈছে...",
    claimSuccess: "অভিনন্দন! আপোনাৰ ₹৫০,০০০ টকাৰ চিকিৎসা অগ্ৰিম দাবী সফলভাৱে দাখিল কৰা হৈছে। দাবী আইডি PF/2026/A/0091847।",
    closeBtn: "এচিষ্টেণ্ট বন্ধ কৰক",
    invalidOtp: "অবৈধ OTP। অনুগ্ৰহ কৰি সঠিক OTP লিখক।",
    ivrWelcome: "EPFO ভইচ এচিষ্টেণ্টলৈ আদৰণি জনাইছোঁ। হিন্দীৰ বাবে ১, ইংৰাজীৰ বাবে ২ টিপক।",
    ivrLangSelected: "ভাষা বাছনি কৰা হৈছে। আপোনাৰ ১২-অংকৰ UAN টাইপ কৰি হেচ (#) টিপক।",
    ivrOtpSent: "UAN পৰীক্ষা কৰা হৈছে। OTP প্ৰেৰণ কৰা হৈছে। OTP টাইপ কৰি হেচ (#) টিপক।",
    ivrClaimSuccess: "OTP পৰীক্ষা কৰা হৈছে। আপোনাৰ চিকিৎসা দাবী সফলভাৱে দাখিল কৰা হৈছে। ধন্যবাদ।",
    ivrError: "ত্ৰুটি। অনুগ্ৰহ কৰি সঠিক মান লিখি হেচ টিপক।"
  }
} as const;

export default function Portal() {
  const { lang } = useLang();
  const pi = PI[lang === "hi" ? "hi" : "en"];
  const [snapshot, setSnapshot] = useState<PortalSnapshot>(initialPortalSnapshot);
  const [captchaText, setCaptchaText] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [uan, setUan] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [terms, setTerms] = useState(false);
  const [otpInfo, setOtpInfo] = useState<{ attemptsLeft: number; lockedSeconds: number } | null>(null);
  const [lockSeen, setLockSeen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const getCitizenData = () => {
    const currentUan = uan || (typeof window !== "undefined" ? sessionStorage.getItem("portal_uan") : "") || "100000000000";
    if (currentUan === "100000000002") {
      return {
        displayName: "R. Prasad (synthetic)",
        aadhaarMasked: "XXXX-XXXX-5678",
        uan: "100000000002",
        nameAsPerAadhaar: "Ramu Prasad",
        nameAsPerEmployer: "Ramu Prasad",
        bankIfsc: "BARB0MUMBAI",
        bankIfscValid: true,
        serviceYears: 5.2,
        enominationDone: true,
        claimTrackingId: "PF/2026/R/0022341",
        evaluationUan: "100000000002",
        evaluationPassword: "demo1234"
      };
    } else if (currentUan === "100000000003") {
      return {
        displayName: "R. Sharma (synthetic)",
        aadhaarMasked: "XXXX-XXXX-9988",
        uan: "100000000003",
        nameAsPerAadhaar: "Radhika Sharma",
        nameAsPerEmployer: "Radhika Sharma",
        bankIfsc: "SBIN0000001",
        bankIfscValid: true,
        serviceYears: 3.4,
        enominationDone: true,
        claimTrackingId: "PF/2026/D/0099881",
        evaluationUan: "100000000003",
        evaluationPassword: "demo1234"
      };
    }
    return SYNTHETIC_CITIZEN;
  };

  const citizenData = getCitizenData();

  const [showNotification, setShowNotification] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [resolvedCaseDetails, setResolvedCaseDetails] = useState<{ id: string; title: string; compensation: number; amount: number } | null>(null);

  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMode, setAssistantMode] = useState<"whatsapp" | "ivr">("whatsapp");
  const [assistantLang, setAssistantLang] = useState<string>("hi");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "bot" | "user"; text: string; options?: Array<{ label: string; action: () => void }> }>>([]);
  const [chatStep, setChatStep] = useState(0);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [ivrStep, setIvrStep] = useState(0);
  const [ivrDisplay, setIvrDisplay] = useState("");
  const [ivrMessage, setIvrMessage] = useState("");

  // Poll active case status periodically
  useEffect(() => {
    if (snapshot.state === PORTAL_STATES.LOGIN_FRICTION || snapshot.state === PORTAL_STATES.OTP_REQUIRED) {
      setShowNotification(false);
      return;
    }

    const checkResolution = async () => {
      try {
        const currentUan = uan || sessionStorage.getItem("portal_uan") || "100000000000";
        const caseId = currentUan === "100000000002" ? "ramu-epfo-001" : currentUan === "100000000003" ? "radhika-irctc-001" : "synthetic-epfo-001";
        
        const r = await fetch(`/api/case/${caseId}`);
        if (r.ok) {
          const payload = await r.json();
          if (payload.case && payload.case.status === "RESOLVED") {
            const s = await fetch(`/api/traceroute?case=${caseId}`);
            const sData = await s.json();
            
            setResolvedCaseDetails({
              id: caseId,
              title: payload.case.title,
              compensation: sData.tatCompensationAccrued || 2600,
              amount: caseId.includes("irctc") ? 2850 : 50000
            });
            setShowNotification(true);
          }
        }
      } catch (err) {
        console.error("Resolution check error:", err);
      }
    };

    void checkResolution();
    const interval = setInterval(checkResolution, 5000);
    return () => clearInterval(interval);
  }, [snapshot.state, uan]);

  useEffect(() => {
    const id = setInterval(() => setOtpInfo((s) => (s && s.lockedSeconds > 0 ? { ...s, lockedSeconds: s.lockedSeconds - 1 } : s)), 1000);
    return () => clearInterval(id);
  }, []);

  const speakText = (text: string, voiceLang: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const codes: Record<string, string> = {
      hi: "hi-IN", ta: "ta-IN", bn: "bn-IN", kn: "kn-IN",
      te: "te-IN", gu: "gu-IN", mr: "mr-IN", pa: "pa-IN", as: "as-IN"
    };
    utterance.lang = codes[voiceLang] || "en-US";
    utterance.onstart = () => setVoicePlaying(true);
    utterance.onend = () => setVoicePlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const openAssistant = () => {
    setShowAssistant(true);
    setChatStep(0);
    setIvrStep(0);
    setIvrDisplay("");
    setIvrMessage(ASSISTANT_DIALECTS.hi.ivrWelcome);
    speakText(ASSISTANT_DIALECTS.hi.ivrWelcome, "hi");
    setChatMessages([
      {
        sender: "bot",
        text: "Namaskar! Welcome to EPFO Regional Claim Assistant / ईपीएफओ डिजिटल सहायता केंद्र में आपका स्वागत है।",
        options: [
          { label: "हिंदी (Hindi)", action: () => selectLanguage("hi") },
          { label: "English", action: () => selectLanguage("en") },
          { label: "தமிழ் (Tamil)", action: () => selectLanguage("ta") },
          { label: "বাংলা (Bengali)", action: () => selectLanguage("bn") },
          { label: "ಕನ್ನಡ (Kannada)", action: () => selectLanguage("kn") },
          { label: "తెలుగు (Telugu)", action: () => selectLanguage("te") },
          { label: "ગુજરાતી (Gujarati)", action: () => selectLanguage("gu") },
          { label: "मराठी (Marathi)", action: () => selectLanguage("mr") },
          { label: "ਪੰਜਾਬੀ (Punjabi)", action: () => selectLanguage("pa") },
          { label: "অসমীয়া (Assamese)", action: () => selectLanguage("as") }
        ]
      }
    ]);
  };

  const selectLanguage = (selected: string) => {
    setAssistantLang(selected);
    setChatStep(1);
    const d = (ASSISTANT_DIALECTS as any)[selected];
    const labels: Record<string, string> = {
      hi: "हिंदी", en: "English", ta: "தமிழ்", bn: "বাংলা",
      kn: "ಕನ್ನಡ", te: "తెలుగు", gu: "ગુજરાતી", mr: "मराठी",
      pa: "ਪੰਜਾਬੀ", as: "অসমীয়া"
    };
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: labels[selected] || selected },
      {
        sender: "bot",
        text: d.askUan,
        options: [
          { label: "Ramu Prasad (UAN: 100000000002)", action: () => selectUser("100000000002", "Ramu Prasad", selected) },
          { label: "Radhika Sharma (UAN: 100000000003)", action: () => selectUser("100000000003", "Radhika Sharma", selected) },
          { label: "Arjun Kumar (UAN: 100000000000)", action: () => selectUser("100000000000", "Arjun Kumar", selected) }
        ]
      }
    ]);
  };

  const selectUser = async (selectedUan: string, userName: string, currentLang: string) => {
    setUan(selectedUan);
    setPassword("demo1234");
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: `${userName} (UAN: ${selectedUan})` }
    ]);
    
    const cleanCapText = captchaText.replace(/\s+/g, "");
    setCaptcha(cleanCapText);
    
    setBusy(true);
    try {
      const response = await fetch("/api/portal/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_CAPTCHA",
          uan: selectedUan,
          password: "demo1234",
          captcha: cleanCapText
        })
      });
      const result = await response.json();
      if (result.snapshot) {
        setSnapshot(result.snapshot);
        if (result.demoOtp) {
          setDemoOtp(result.demoOtp);
        }
        if (result.otp) {
          setOtpInfo(result.otp);
        }
        
        const d = (ASSISTANT_DIALECTS as any)[currentLang];
        setChatStep(2);
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: d.otpSent,
            options: [
              { label: `Enter Demo OTP (${result.demoOtp || "123456"})`, action: () => submitOtpFromBot(result.demoOtp || "123456", currentLang) }
            ]
          }
        ]);
      }
    } catch {
      setError(pi.errPortal);
    } finally {
      setBusy(false);
    }
  };

  const submitOtpFromBot = async (enteredOtp: string, currentLang: string) => {
    setOtp(enteredOtp);
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: `OTP: ${enteredOtp}` }
    ]);
    
    setBusy(true);
    try {
      const response = await fetch("/api/portal/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_OTP",
          otp: enteredOtp
        })
      });
      const result = await response.json();
      if (result.snapshot) {
        setSnapshot(result.snapshot);
        sessionStorage.setItem("portal_uan", uan.trim());
        
        const d = (ASSISTANT_DIALECTS as any)[currentLang];
        setChatStep(3);
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: d.loginSuccess,
            options: [
              { label: d.submitMedicalClaim, action: () => submitClaimFromBot(currentLang) }
            ]
          }
        ]);
      } else {
        const d = (ASSISTANT_DIALECTS as any)[currentLang];
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: d.invalidOtp }
        ]);
      }
    } catch {
      setError(pi.errPortal);
    } finally {
      setBusy(false);
    }
  };

  const submitClaimFromBot = async (currentLang: string) => {
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: (ASSISTANT_DIALECTS as any)[currentLang].submitMedicalClaim }
    ]);
    
    setBusy(true);
    try {
      let response = await fetch("/api/portal/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "OPEN_CLAIM_FORM" })
      });
      let result = await response.json();
      if (result.snapshot) {
        setSnapshot(result.snapshot);
        
        response = await fetch("/api/portal/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "SUBMIT_ADVANCE_CLAIM" })
        });
        result = await response.json();
        if (result.snapshot) {
          setSnapshot(result.snapshot);
          setChatStep(4);
          setChatMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: (ASSISTANT_DIALECTS as any)[currentLang].claimSuccess,
              options: [
                { label: (ASSISTANT_DIALECTS as any)[currentLang].closeBtn, action: () => setShowAssistant(false) }
              ]
            }
          ]);
        }
      }
    } catch {
      setError(pi.errPortal);
    } finally {
      setBusy(false);
    }
  };

  const playDtmf = (key: string) => {
    if (typeof window === "undefined" || !window.AudioContext) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const freqs: Record<string, [number, number]> = {
        "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
        "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
        "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
        "*": [941, 1209], "0": [941, 1336], "#": [941, 1477]
      };
      
      const f = freqs[key];
      if (!f) return;
      
      osc1.frequency.value = f[0];
      osc2.frequency.value = f[1];
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("DTMF play error", e);
    }
  };

  const handleIvrKeyPress = async (key: string) => {
    playDtmf(key);
    if (ivrStep === 0) {
      if (key === "1") {
        setAssistantLang("hi");
        setIvrStep(1);
        setIvrDisplay("");
        setIvrMessage(ASSISTANT_DIALECTS.hi.ivrLangSelected);
        speakText(ASSISTANT_DIALECTS.hi.ivrLangSelected, "hi");
      } else if (key === "2") {
        setAssistantLang("en");
        setIvrStep(1);
        setIvrDisplay("");
        setIvrMessage(ASSISTANT_DIALECTS.en.ivrLangSelected);
        speakText(ASSISTANT_DIALECTS.en.ivrLangSelected, "en");
      } else {
        setIvrDisplay(key);
      }
    } else if (ivrStep === 1) {
      if (key === "#") {
        const inputUan = ivrDisplay.trim();
        const allowedUans = ["100000000000", "100000000002", "100000000003"];
        if (allowedUans.includes(inputUan)) {
          setUan(inputUan);
          setPassword("demo1234");
          const cleanCapText = captchaText.replace(/\s+/g, "");
          setCaptcha(cleanCapText);
          setBusy(true);
          try {
            const response = await fetch("/api/portal/action", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "VERIFY_CAPTCHA",
                uan: inputUan,
                password: "demo1234",
                captcha: cleanCapText
              })
            });
            const result = await response.json();
            if (result.snapshot) {
              setSnapshot(result.snapshot);
              if (result.demoOtp) setDemoOtp(result.demoOtp);
              setIvrStep(2);
              setIvrDisplay("");
              const msg = (ASSISTANT_DIALECTS as any)[assistantLang].ivrOtpSent.replace("ओटीपी", `ओटीपी ${result.demoOtp || "123456"}`).replace("OTP", `OTP ${result.demoOtp || "123456"}`);
              setIvrMessage(msg);
              speakText(msg, assistantLang);
            }
          } catch {
            speakText((ASSISTANT_DIALECTS as any)[assistantLang].ivrError, assistantLang);
          } finally {
            setBusy(false);
          }
        } else {
          setIvrDisplay("");
          speakText((ASSISTANT_DIALECTS as any)[assistantLang].ivrError, assistantLang);
        }
      } else if (key === "*") {
        setIvrDisplay("");
      } else {
        if (ivrDisplay.length < 12) {
          setIvrDisplay((prev) => prev + key);
        }
      }
    } else if (ivrStep === 2) {
      if (key === "#") {
        const inputOtp = ivrDisplay.trim();
        setOtp(inputOtp);
        setBusy(true);
        try {
          const response = await fetch("/api/portal/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "VERIFY_OTP",
              otp: inputOtp
            })
          });
          const result = await response.json();
          if (result.snapshot) {
            setSnapshot(result.snapshot);
            sessionStorage.setItem("portal_uan", uan.trim());
            
            let claimResp = await fetch("/api/portal/action", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "OPEN_CLAIM_FORM" })
            });
            let claimRes = await claimResp.json();
            if (claimRes.snapshot) {
              setSnapshot(claimRes.snapshot);
              claimResp = await fetch("/api/portal/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "SUBMIT_ADVANCE_CLAIM" })
              });
              claimRes = await claimResp.json();
              if (claimRes.snapshot) {
                setSnapshot(claimRes.snapshot);
                setIvrStep(3);
                setIvrDisplay("");
                setIvrMessage((ASSISTANT_DIALECTS as any)[assistantLang].ivrClaimSuccess);
                speakText((ASSISTANT_DIALECTS as any)[assistantLang].ivrClaimSuccess, assistantLang);
              }
            }
          } else {
            setIvrDisplay("");
            speakText((ASSISTANT_DIALECTS as any)[assistantLang].ivrError, assistantLang);
          }
        } catch {
          speakText((ASSISTANT_DIALECTS as any)[assistantLang].ivrError, assistantLang);
        } finally {
          setBusy(false);
        }
      } else if (key === "*") {
        setIvrDisplay("");
      } else {
        if (ivrDisplay.length < 6) {
          setIvrDisplay((prev) => prev + key);
        }
      }
    }
  };

  const otpFmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  async function loadCaptcha() {
    try {
      const r = await fetch("/api/portal/action");
      const p = await r.json();
      if (p.spaced) setCaptchaText(p.spaced as string);
      if (p.captcha) setCaptchaText(p.captcha.split("").join(" "));
    } catch { setError(pi.errCaptchaSvc); }
  }

  useEffect(() => { void loadCaptcha(); }, []);

  async function dispatch(action: PortalAction, extra?: Record<string, string>) {
    setBusy(true); setError("");
    try {
      const body: Record<string, string> = { action, ...(extra ?? {}) };
      // For VERIFY_CAPTCHA, send uan/password/captcha for server validation (ponytail: server owns truth, not client)
      if (action === "VERIFY_CAPTCHA") {
        body.uan = uan.trim();
        body.password = password;
        body.captcha = captcha;
      }
      if (action === "VERIFY_OTP") body.otp = otp.trim();
      const response = await fetch("/api/portal/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json()) as { snapshot?: PortalSnapshot; error?: string; demoOtp?: string; captcha?: string; spaced?: string; otp?: { attemptsLeft: number; lockedSeconds: number } };
      if (!response.ok || !result.snapshot) {
        // Handle REFRESH_CAPTCHA which returns captcha directly
        if (result.captcha || result.spaced) {
          if (result.spaced) setCaptchaText(result.spaced as string);
          else if (result.captcha) setCaptchaText((result.captcha as string).split("").join(" "));
          setCaptcha("");
          if (result.error) setError(result.error);
          return;
        }
        throw new Error(result.error ?? pi.errPortal);
      }
      setSnapshot(result.snapshot);
      if (action === "VERIFY_OTP" && result.snapshot.state === "DASHBOARD") {
        sessionStorage.setItem("portal_uan", uan.trim());
      }
      if (action === "RESET") {
        sessionStorage.removeItem("portal_uan");
        setShowNotification(false);
        setShowStatusModal(false);
        setResolvedCaseDetails(null);
      }
      if (result.error) setError(result.error);
      else setError("");
      if (result.otp) {
        setOtpInfo(result.otp);
        if (result.otp.lockedSeconds > 0) { setLockSeen(true); setDemoOtp(""); }
        else if (result.demoOtp) setDemoOtp(result.demoOtp as string);
      } else if (result.demoOtp) setDemoOtp(result.demoOtp as string);
      // Refresh captcha text after any state that stays in LOGIN_FRICTION
      if (action === "VERIFY_CAPTCHA" || action === "REFRESH_CAPTCHA" || action === "VERIFY_OTP") {
        // Always fetch fresh spaced captcha for next attempt — native random per click
        const refreshed = await fetch("/api/portal/action");
        const p = await refreshed.json();
        if (p.spaced) setCaptchaText(p.spaced as string);
        if (action === "VERIFY_CAPTCHA") setCaptcha("");
        if (action === "VERIFY_OTP" && result.error) setOtp("");
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : pi.errPortal); }
    finally { setBusy(false); }
  }

  async function refreshCaptcha() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/portal/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "REFRESH_CAPTCHA" }) });
      const p = await r.json();
      if (p.spaced) setCaptchaText(p.spaced as string);
      else if (p.captcha) setCaptchaText((p.captcha as string).split("").join(" "));
      setCaptcha("");
    } catch { setError(pi.errCaptchaRefresh); }
    finally { setBusy(false); }
  }

  return (
    <GovShell active="/portal">
      <div className="mb-4 text-center text-[12px] font-bold text-red-700 bg-red-50 border border-red-300 rounded-md p-3 shadow-sm">
        {t(lang, "bannerPortal")}
      </div>

      {/* Rural claim assistant banner */}
      <div className="mb-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-md p-4 shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h4 className="text-[14px] font-bold">
            {lang === "hi" ? "📞 ग्रामीण व कम आय वाले सदस्यों हेतु संवादात्मक दावा सहायक" : "📞 Voice-Guided Rural Claim Assistant"}
          </h4>
          <p className="text-[11px] text-blue-100 leading-relaxed">
            {lang === "hi" 
              ? "यदि आप कंप्यूटर/वेब फॉर्म के उपयोग में असहज हैं, तो इस व्हाट्सऐप एवं वॉयस असिस्टेंट द्वारा आसानी से दावा दर्ज करें।"
              : "Unfamiliar with web forms? Use our voice-guided IVR or conversational WhatsApp Assistant."}
          </p>
        </div>
        <button
          type="button"
          onClick={openAssistant}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition shadow-sm select-none shrink-0"
        >
          {lang === "hi" ? "दावा सहायक खोलें" : "Launch Assistant"}
        </button>
      </div>

      {showNotification && resolvedCaseDetails && (
        <div className="mb-4 bg-emerald-50 border border-emerald-300 rounded-md p-4 shadow flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div className="text-[13px] text-emerald-800 font-medium">
              <b>{lang === "hi" ? "दावा कार्रवाई सूचना:" : "Claim Resolution Notification:"}</b>{" "}
              {lang === "hi" 
                ? "आपके दावे पर कार्रवाई कर दी गई है! विवरण देखने के लिए यहाँ क्लिक करें।"
                : "Action on your claim has been taken! Click here to view updated status & details."}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition"
          >
            {lang === "hi" ? "विवरण देखें" : "View Details"}
          </button>
        </div>
      )}

      {showStatusModal && resolvedCaseDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`${cardCls} max-w-md w-full p-6 space-y-4 shadow-2xl border-t-4 border-t-emerald-600`}>
            <div className="text-center border-b border-slate-100 pb-3">
              <span className="text-3xl">✅</span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">
                {lang === "hi" ? "दावा निपटान सूचना" : "Claim Settlement Notice"}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{resolvedCaseDetails.id}</p>
            </div>

            <div className="space-y-3 text-[13px] text-slate-600">
              <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">{lang === "hi" ? "मामला:" : "Case Title:"}</span>
                <span className="text-slate-800 font-medium text-right">{resolvedCaseDetails.title}</span>
              </div>
              <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">{lang === "hi" ? "स्थिति:" : "Status:"}</span>
                <span className="text-emerald-700 font-bold uppercase">{lang === "hi" ? "स्वीकृत" : "APPROVED"}</span>
              </div>
              <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">{lang === "hi" ? "दावा राशि:" : "Claim Disbursed:"}</span>
                <span className="text-slate-800 font-bold">₹ {resolvedCaseDetails.id.includes("irctc") ? "2,850" : "50,000"}</span>
              </div>
              <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">{lang === "hi" ? "विलंब मुआवजा संवितरण:" : "Delay Compensation Settled:"}</span>
                <span className="text-emerald-600 font-bold">₹ {resolvedCaseDetails.compensation.toLocaleString("en-IN")}</span>
              </div>

              <div className="pt-2">
                <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                  {lang === "hi" ? "अगले कदम (Next Steps):" : "Next Steps for Member:"}
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[12px] leading-relaxed text-slate-700">
                  {resolvedCaseDetails.id.includes("irctc") ? (
                    lang === "hi" 
                      ? "लगेगा कि विफल बुकिंग राशि का पुनर्भुगतान किया गया है। निपटान आदेश के तहत आपके बैंक खाते में ₹2,850 की रिफंड और ₹100 प्रति दिन का हर्जाना क्रेडिट कर दिया गया है। पुष्टि के लिए अपना पासबुक जांचें।"
                      : "The failed booking refund has been approved. Under the RBI TAT settlement order, the refund of ₹2,850 along with the daily delay penalty has been credited to your source bank account. Please verify your bank passbook/statement."
                  ) : (
                    lang === "hi" 
                      ? "आपका ₹50,000 का पीएफ अग्रिम दावा स्वीकृत हो गया है और धन सीधे आपके बैंक खाते (IFSC: SBIN0000001) में हस्तांतरित कर दिया गया है। भुगतान की पुष्टि हेतु 24-48 घंटे प्रतीक्षा करें और बैंक से प्राप्त एसएमएस देखें।"
                      : "Your PF Advance claim for ₹50,000 has been approved and processed. The funds have been successfully transferred to your registered bank account (IFSC: SBIN0000001). Please check your bank transaction records within 24-48 hours."
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className={`${btnPrimary} w-full py-2 text-[13px] font-bold`}
              >
                {lang === "hi" ? "ठीक है / बंद करें" : "Close Notification"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-[#fff8e6] px-4 py-2.5 text-[12px] text-[#8a6d00]">
        <div className="space-y-1">
          <p className="font-bold">{t(lang,"evalLogin")} (Password: <b>demo1234</b> · OTP: <b>{demoOtp || pi.otpAfterCaptcha}</b>):</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            <span>👤 Arjun Kumar UAN: <b>100000000000</b></span>
            <span>👤 Ramu Prasad UAN: <b>100000000002</b></span>
            <span>👤 Radhika Sharma UAN: <b>100000000003</b></span>
          </div>
        </div>
        <button type="button" onClick={() => dispatch("RESET")} className="underline hover:text-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">{t(lang,"restartSession")}</button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm" aria-label="Simulated government portal marquee">
        <div className="border-b border-slate-200 bg-[#fdf6e3] py-1 text-[12px] text-[#8a6d00]" aria-hidden>
          <div className="whitespace-nowrap will-change-transform" style={{ animation: "govmarquee 28s linear infinite" }}>
            {pi.marquee.map((m) => <span key={m} className="mr-16">&nbsp;&nbsp;◆&nbsp;&nbsp;{m}</span>)}
          </div>
          <style jsx>{`@keyframes govmarquee { from { transform: translateX(100vw); } to { transform: translateX(-200vw); } } @media (prefers-reduced-motion: reduce) { div[style*="govmarquee"] { animation: none; } }`}</style>
        </div>

        <div className={showAssistant ? "grid md:grid-cols-[1fr_420px] divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/25" : ""}>
          <section className="p-5 sm:p-6 bg-white">
            <p className="text-[12px] text-slate-500">{pi.breadcrumb[0]} » {pi.breadcrumb[1]} » <u>{pi.breadcrumb[2]}</u> · {pi.session}: {snapshot.state.replaceAll("_", " ")}</p>
          {error && <p role="alert" className="mb-4 mt-3 rounded-sm border-l-4 border-red-700 bg-red-50 p-3 text-[13px] text-red-900">{error}</p>}

          {snapshot.state === PORTAL_STATES.LOGIN_FRICTION && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang, "portalLogin")}</div>
              <div className="p-5">
                <table className="w-full max-w-xl text-[13px]"><tbody>
                  <tr><td className="w-56 py-1.5 pr-4"><label htmlFor="uan">{t(lang,"uanLabel")}</label></td><td className="py-1.5"><input id="uan" value={uan} onChange={(e) => setUan(e.target.value)} aria-label="UAN — 12 digits, e.g. 100000000000" placeholder="e.g. 100000000000" className="w-52 rounded-sm border border-slate-300 px-2 py-1 text-[13px] placeholder:text-slate-400 focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" autoComplete="username" /></td></tr>
                  <tr><td className="py-1.5 pr-4"><label htmlFor="pwd">{t(lang,"pwdLabel")}</label></td><td className="py-1.5"><input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password, e.g. demo1234" placeholder="e.g. demo1234" className="w-52 rounded-sm border border-slate-300 px-2 py-1 text-[13px] placeholder:text-slate-400 focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" autoComplete="current-password" /></td></tr>
                  <tr><td className="py-1.5 pr-4 align-top"><label htmlFor="cap">{t(lang,"capLabel")}</label></td><td className="py-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={refreshCaptcha} aria-label="Refresh captcha — click to get new characters" title="Click to refresh captcha" className="select-none rounded-sm border border-slate-400 bg-[#2f2f2f] px-4 py-1.5 font-mono text-lg italic tracking-[0.35em] text-lime-300 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">{captchaText || "·····"}</button>
                      <button type="button" onClick={refreshCaptcha} aria-label="Generate new captcha" className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[12px] hover:border-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">↻ Refresh</button>
                      <input id="cap" value={captcha} onChange={(e) => setCaptcha(e.target.value)} aria-label="Captcha characters — case insensitive" placeholder="Enter above" className="w-36 rounded-sm border border-slate-300 px-2 py-1 text-[13px] focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" autoComplete="off" />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{pi.capCryptoNote} {t(lang,"capHint")} <button type="button" onClick={refreshCaptcha} className="underline hover:text-[#1a4b8e]">{pi.needNew}</button></p>
                  </td></tr>
                  <tr><td colSpan={2} className="pt-3">
                    <button type="button" id="verify-login-btn" onClick={() => dispatch("VERIFY_CAPTCHA")} disabled={busy || !uan.trim() || password.length < 4 || !captcha.trim()} className={btnPrimary} aria-busy={busy}>{busy ? t(lang,"verifying") : t(lang,"verifyBtn")}</button>
                    <p className="mt-2 text-[11px] text-slate-500">{pi.serverValidateNote}</p>
                  </td></tr>
                </tbody></table>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.OTP_REQUIRED && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang, "portalOtp")}</div>
              <div className="p-5">
                <p className="text-[13px] text-slate-700">{pi.otpIntro} <b>XXXX-XXXX-1234</b>. {t(lang,"otpHint")}</p>
                {demoOtp && <p className="mt-2 rounded-sm border border-amber-300 bg-[#fff8e6] px-3 py-2 text-[13px] text-[#8a6d00]">{t(lang,"demoOtpLabel")} <span className="font-mono text-lg tracking-widest">{demoOtp}</span> <span className="text-[11px]">{pi.otpExpires}</span></p>}
                {otpInfo && <p className="mt-2 text-[11px] text-slate-600">{pi.otpAttemptsLeft.replace("{left}", String(otpInfo.attemptsLeft)).replace("{max}", "3")}</p>}
                {otpInfo && otpInfo.lockedSeconds > 0 && (
                  <div role="alert" className="mt-3 rounded-sm border-l-4 border-red-700 bg-red-50 p-3 text-[13px] text-red-900">
                    <b>{pi.otpLockTitle}</b><br />{pi.otpLockBody}
                    <span className="mt-1 inline-block font-mono text-[14px] font-bold">{pi.retryIn.replace("{t}", otpFmt(otpInfo.lockedSeconds))}</span>
                  </div>
                )}
                {lockSeen && otpInfo && otpInfo.lockedSeconds <= 0 && (
                  <p role="status" className="mt-3 rounded-sm border-l-4 border-green-700 bg-green-50 p-2.5 text-[13px] text-green-900">{pi.cooldownOver}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} aria-label="6-digit OTP" placeholder={t(lang,"enterOtp")} className="w-40 rounded-sm border border-slate-300 px-2 py-1.5 text-[13px] focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" maxLength={6} autoComplete="one-time-code" disabled={(otpInfo?.lockedSeconds ?? 0) > 0} />
                  <button type="button" onClick={() => dispatch("VERIFY_OTP")} disabled={busy || otp.trim().length !== 6 || (otpInfo?.lockedSeconds ?? 0) > 0} className={btnPrimary} aria-busy={busy}>{busy ? t(lang,"verifying") : t(lang,"verifyOtpBtn")}</button>
                  <button type="button" onClick={() => dispatch("RESEND_OTP")} disabled={busy || (otpInfo?.lockedSeconds ?? 0) > 0} className={btnOutline}>{t(lang,"resendOtp")}</button>
                </div>

              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.DASHBOARD && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang,"dashboardHead")} — {citizenData.displayName} · UAN {citizenData.uan} (synthetic)</div>
              <div className="p-5">
                {snapshot.message && <p role="status" className="mb-4 rounded-sm border-l-4 border-green-700 bg-green-50 p-3 text-[13px] text-green-900">{snapshot.message}</p>}
                <div className="grid gap-3 sm:grid-cols-3">
                  <button type="button" onClick={() => dispatch("VIEW_PASSBOOK")} disabled={busy} className={`${cardCls} p-4 text-left hover:border-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]`} aria-label="View passbook">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t(lang,"passbookCard")}</p>
                    <p className="mt-1 text-lg font-bold text-[#1a4b8e]">₹4,36,000</p>
                    <p className="mt-1 text-[11px] text-slate-500">{pi.passSub}</p>
                  </button>
                  <button type="button" onClick={() => dispatch("VIEW_KYC")} disabled={busy} className={`${cardCls} p-4 text-left hover:border-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]`} aria-label="View KYC status">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t(lang,"kycCard")}</p>
                    <p className="mt-1 text-lg font-bold text-green-700">Verified ✓</p>
                    <p className="mt-1 text-[11px] text-slate-500">{pi.kycSub}</p>
                  </button>
                  <button type="button" id="file-claim-btn" onClick={() => dispatch("OPEN_CLAIM_FORM")} disabled={busy} className={`${cardCls} p-4 text-left hover:border-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]`} aria-label="File a PF advance claim — Form 31">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t(lang,"fileClaimCard")}</p>
                    <p className="mt-1 text-lg font-bold text-[#FF9933]">Form-31</p>
                    <p className="mt-1 text-[11px] text-slate-500">{pi.claimSub}</p>
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-[12px] text-slate-600">
                  <p className="rounded-sm bg-[#f8fafc] border border-slate-200 p-3"><b>{t(lang,"serviceRecord")}:</b> {citizenData.serviceYears} {pi.svcYears} · <b>{t(lang,"bankIfsc")}:</b> {citizenData.bankIfsc} {pi.ifscValid}</p>
                  <p className="rounded-sm bg-[#f8fafc] border border-slate-200 p-3"><b>{pi.nomDone}</b> · <b>{pi.trackLabel}</b> {citizenData.claimTrackingId}</p>
                </div>

              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.CLAIM_FORM && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang, "claimForm")}</div>
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] text-slate-500">{pi.memberIs} <b>{citizenData.nameAsPerAadhaar}</b></p>
                  <button type="button" onClick={() => dispatch("VIEW_DASHBOARD")} disabled={busy} className={btnOutline + " text-[11px]"}>{t(lang,"backToDash")}</button>
                </div>
                <table className="w-full max-w-2xl text-[13px]"><tbody>
                  <tr><td className={`${th} w-64`}>{t(lang,"memberName")}</td><td className="border border-slate-300 px-2 py-1">{citizenData.nameAsPerAadhaar}</td></tr>
                  <tr><td className={th}>{t(lang,"serviceRecord")}</td><td className="border border-slate-300 px-2 py-1">{citizenData.serviceYears} {pi.svcYears}</td></tr>
                  <tr><td className={th}>{t(lang,"purpose")}</td><td className="border border-slate-300 px-2 py-1">{pi.purposeVal}</td></tr>
                  <tr><td className={th}>{t(lang,"bankIfsc")}</td><td className="border border-slate-300 px-2 py-1">{citizenData.bankIfsc}</td></tr>
                  <tr><td className={th}>{t(lang,"amountReq")}</td><td className="border border-slate-300 px-2 py-1">{pi.amountVal}</td></tr>
                </tbody></table>
                <label className="mt-4 flex max-w-xl items-start gap-2 text-[12px] leading-snug"><input type="checkbox" id="terms-checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1a4b8e] focus:ring-[#1a4b8e]" /> <span>{t(lang,"declareAgree")} <Link href="/terms" target="_blank" className="underline text-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">{t(lang,"termsLink")} (RBI TAT 2019, CPA 2019, DPDP 2023, GIGW 3.0 — latest 22 Aug 2026)</Link>. {pi.synthetic}</span></label>
                {!terms && <p className="mt-2 text-[11px] text-amber-700">{pi.acceptTermsNote}</p>}
                <div className="mt-4"><button type="button" id="submit-claim-btn" onClick={() => dispatch("SUBMIT_ADVANCE_CLAIM")} disabled={busy || !terms} className={btnPrimary} aria-disabled={busy || !terms}>{busy ? t(lang,"submitting") : t(lang,"submitClaimBtn")}</button> <Link href="/terms" target="_blank" className={btnOutline + " ml-2"}>{t(lang, "readTerms")}</Link></div>

              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.UNDER_PROCESS && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang,"statusHead")} {citizenData.claimTrackingId}</div>
              {snapshot.message && <p role="status" className="mx-5 mt-4 rounded-sm border-l-4 border-green-700 bg-green-50 p-3 text-[13px] text-green-900">{snapshot.message}</p>}
              <div className="p-5">
                <table className="w-full max-w-2xl text-[13px]"><thead><tr><th className={th}>{pi.thDate}</th><th className={th}>{pi.thEvent}</th><th className={th}>{pi.thRemarks}</th></tr></thead><tbody>
                  <tr><td className="border border-slate-300 px-2 py-1">{pi.day1}</td><td className="border border-slate-300 px-2 py-1">{pi.evReceived}</td><td className="border border-slate-300 px-2 py-1">{pi.evRemark}</td></tr>
                  <tr><td className="border border-slate-300 px-2 py-1">{pi.dayPrefix} {snapshot.simulatedDays}</td><td className="border border-slate-300 px-2 py-1">{pi.evCheck}</td><td className="border border-slate-300 px-2 py-1">{pi.evPending}</td></tr>
                </tbody></table>
                <p className="mt-3 text-[12px] text-slate-500">{pi.simDay} {snapshot.simulatedDays} {pi.of} {PROCESSING_DAYS}. {pi.noExpl}</p>
                <div className="mt-4"><button type="button" id="advance-day-btn" onClick={() => dispatch("ADVANCE_DAY")} disabled={busy} className={btnOutline}>{busy ? t(lang,"loading") : t(lang,"advanceDayBtn")}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.REJECTED && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang,"statusHead")} {citizenData.claimTrackingId}</div>
              <div className="p-5">
                <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3 text-[13px]"><b>{t(lang,"rejectedTitle")}</b><br />{pi.rejReason}</div>
                <table className="mt-4 w-full max-w-2xl text-[13px]"><thead><tr><th className={th}>{pi.particulars}</th><th className={th}>{pi.officeRecord}</th></tr></thead><tbody>
                  <tr><td className="border border-slate-300 px-2 py-1">{pi.nameEmployer}</td><td className="border border-slate-300 px-2 py-1">{citizenData.nameAsPerEmployer}</td></tr>
                  <tr><td className="border border-slate-300 px-2 py-1">{pi.nameUan}</td><td className="border border-slate-300 px-2 py-1">{citizenData.nameAsPerAadhaar}</td></tr>
                  <tr><td className="border border-slate-300 px-2 py-1">{pi.cmpLabel}</td><td className="border border-slate-300 px-2 py-1 font-bold text-green-800">{pi.identical}</td></tr>
                </tbody></table>
                <p className="mt-2 text-[11px] text-slate-500">{pi.simNote}</p>
                <div className="mt-4"><button type="button" id="open-grievance-btn" onClick={() => dispatch("OPEN_GRIEVANCE")} disabled={busy} className={btnPrimary}>{busy ? t(lang,"loading") : t(lang,"fileGrievanceBtn")}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.GRIEVANCE_FORM && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang,"gmisForm")}</div>
              <div className="p-5 text-[13px]">
                <p>{t(lang,"trackingPrompt")}</p>
                <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder={`e.g. ${citizenData.claimTrackingId}`} className={`${inputCls} mt-2 max-w-xs`} aria-label={t(lang,"trackingIdLabel")} />
                <p className="mt-2 text-[11px] text-slate-500">{pi.trackCase}</p>
                <div className="mt-4"><button type="button" id="submit-grievance-btn" onClick={() => dispatch("SUBMIT_GRIEVANCE")} disabled={busy || !trackingId.trim()} className={btnPrimary}>{busy ? t(lang,"submitting") : t(lang,"submitGrievanceBtn")}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.GRIEVANCE_INVALID_TRACKING && (
            <section className={cardCls}>
              <div className={sectionHead}>{pi.gmisHead}</div>
              <div className="p-5 text-[13px]">
                <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3"><b>{t(lang,"invalidIdTitle")}</b><br />{pi.idErr1}</div>
                <p className="mt-3 text-[12px] text-slate-500">{pi.noReg}</p>
                <div className="mt-4"><button type="button" onClick={() => dispatch("OPEN_GRIEVANCE")} disabled={busy} className={btnOutline}>{busy ? t(lang,"loading") : t(lang,"attemptAgainBtn")}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.GRIEVANCE_LOCKED_OUT && (
            <section className={cardCls}>
              <div className={sectionHead}>{pi.gmisHead}</div>
              <div className="p-5 text-[13px]">
                <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3"><b>{t(lang,"lockedTitle")}</b><br />{pi.lockBody}</div>
                <table className="mt-4 w-full max-w-2xl text-[13px]"><tbody>
                  <tr><td className={`${th} w-72`}>{t(lang,"escOptions")}</td><td className="border border-slate-300 px-2 py-1">{pi.escNone}</td></tr>
                </tbody></table>
                <p className="mt-3 text-[11px] text-slate-500">{t(lang,"fixWithFixer")} <Link href="/fixer" id="open-console-link" onClick={() => sessionStorage.setItem("allowed_to_login", "true")} className="underline text-[#1a4b8e]">{t(lang,"openConsole")} (CPA 2019 §2(11))</Link></p>
              </div>
            </section>
          )}
        </section>

        {/* Right Column: Phone Assistant (Visible only if showAssistant is true) */}
        {showAssistant && (
          <div className="p-4 bg-slate-50 flex justify-center items-start border-l border-slate-200 shrink-0">
            <div className="bg-white rounded-[32px] shadow-2xl border-8 border-slate-800 w-full max-w-[350px] h-[600px] overflow-hidden flex flex-col relative">
              {/* Phone Speaker & Notch */}
              <div className="bg-slate-800 h-5 flex justify-center items-center relative shrink-0">
                <div className="w-14 h-1.5 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700 absolute right-5"></div>
              </div>

              {/* Header (epfo whatsapp) */}
              <div className="bg-[#075e54] text-white p-3 flex justify-between items-center shadow-md shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h3 className="text-[12px] font-bold">
                      {lang === "hi" ? "EPFO ग्रामीण दावा सहायक" : "EPFO Rural Assistant"}
                    </h3>
                    <span className="text-[9px] text-emerald-100 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {lang === "hi" ? "सक्रिय सहायता मार्गदर्शन" : "Active guidance chat"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined" && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                    setShowAssistant(false);
                  }}
                  className="text-white hover:text-slate-200 text-[10px] font-bold px-2 py-1 bg-teal-900 rounded select-none"
                >
                  ✕ Close
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-100 text-[10px] shrink-0">
                <button
                  type="button"
                  onClick={() => setAssistantMode("whatsapp")}
                  className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
                    assistantMode === "whatsapp" 
                      ? "border-[#075e54] text-[#075e54] bg-white" 
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  💬 WhatsApp Chat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssistantMode("ivr");
                    setIvrStep(0);
                    setIvrDisplay("");
                    setIvrMessage(ASSISTANT_DIALECTS.hi.ivrWelcome);
                    speakText(ASSISTANT_DIALECTS.hi.ivrWelcome, "hi");
                  }}
                  className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
                    assistantMode === "ivr" 
                      ? "border-[#075e54] text-[#075e54] bg-white" 
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  📞 Phone Voice (IVR)
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-3 bg-[#efeae2] text-slate-800">
                {assistantMode === "whatsapp" ? (
                  <div className="space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[90%] rounded-lg p-2.5 text-[12px] shadow-xs relative ${
                          msg.sender === "user" 
                            ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none" 
                            : "bg-white text-slate-800 rounded-tl-none"
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        
                        {msg.options && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[90%]">
                            {msg.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={opt.action}
                                disabled={busy}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-[11px] font-semibold shadow-xs transition-all select-none"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full items-center justify-between py-1 space-y-3">
                    {/* Voice Display Panel */}
                    <div className="w-full bg-slate-955 text-slate-100 rounded-lg p-3 font-mono shadow-inner border border-slate-850 relative overflow-hidden">
                      <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1.5 mb-1.5">
                        <span>EPFO Call Assistant</span>
                        <span className="animate-pulse text-red-500">● live</span>
                      </div>
                      
                      <div className="flex justify-center items-center gap-0.5 h-3 mb-1.5">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <span
                            key={i}
                            className={`w-0.5 rounded-full bg-emerald-400 transition-all ${
                              voicePlaying ? "animate-bounce" : "h-0.5"
                            }`}
                            style={{
                              animationDuration: `${0.35 + i * 0.12}s`,
                              height: voicePlaying ? `${Math.floor(Math.random() * 12) + 2}px` : "2px"
                            }}
                          ></span>
                        ))}
                      </div>

                      <div className="text-[11px] leading-relaxed text-slate-300 min-h-[45px] mb-2 italic">
                        "{ivrMessage}"
                      </div>

                      <div className="text-right border-t border-slate-900 pt-1.5 min-h-[24px]">
                        <span className="text-[9px] text-slate-600 uppercase mr-1.5 font-sans font-bold">Input:</span>
                        <span className="text-sm font-bold text-emerald-400 tracking-widest">{ivrDisplay || "—"}</span>
                      </div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-1.5 w-44 shrink-0">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleIvrKeyPress(num)}
                          disabled={busy}
                          className="h-9 w-13 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs font-semibold text-slate-700 text-sm active:scale-95 transition-all select-none"
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(ivrMessage, assistantLang)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-semibold flex items-center gap-1 select-none"
                    >
                      <span>🔊</span> Repeat voice
                    </button>

                    {/* Simulation Helper Box */}
                    <div className="bg-[#fff8e6] border border-amber-200 rounded p-2 text-[10px] text-[#8a6d00] leading-relaxed w-full">
                      <b>📞 Keypad Guide:</b>
                      <ul className="list-disc pl-3.5 mt-0.5 space-y-0.5 font-mono text-[9px]">
                        <li>Select Language: Press 1 or 2</li>
                        <li>Enter UAN: 100000000002 then press #</li>
                        <li>Enter OTP: 123456 then press #</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-2 text-center text-[9px] text-slate-500 shrink-0">
                💡 Connected directly to EPFO database
              </div>

              {/* Home Button Bar */}
              <div className="bg-slate-800 h-6 flex justify-center items-center shrink-0 w-full">
                <div className="w-6 h-6 rounded-full border border-slate-700 hover:bg-slate-700/50 cursor-pointer active:scale-95 transition-all"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </GovShell>
  );
}
