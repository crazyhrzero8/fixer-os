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

  const [showNotification, setShowNotification] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [resolvedCaseDetails, setResolvedCaseDetails] = useState<{ id: string; title: string; compensation: number; amount: number } | null>(null);

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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-[#fff8e6] px-4 py-2 text-[12px] text-[#8a6d00]">
        <span>{t(lang,"evalLogin")} — UAN: <b>{SYNTHETIC_CITIZEN.evaluationUan}</b> · Password: <b>{SYNTHETIC_CITIZEN.evaluationPassword}</b> · OTP: <b>{demoOtp || pi.otpAfterCaptcha}</b></span>
        <button type="button" onClick={() => dispatch("RESET")} className="underline hover:text-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">{t(lang,"restartSession")}</button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm" aria-label="Simulated government portal marquee">
        <div className="border-b border-slate-200 bg-[#fdf6e3] py-1 text-[12px] text-[#8a6d00]" aria-hidden>
          <div className="whitespace-nowrap will-change-transform" style={{ animation: "govmarquee 28s linear infinite" }}>
            {pi.marquee.map((m) => <span key={m} className="mr-16">&nbsp;&nbsp;◆&nbsp;&nbsp;{m}</span>)}
          </div>
          <style jsx>{`@keyframes govmarquee { from { transform: translateX(100vw); } to { transform: translateX(-200vw); } } @media (prefers-reduced-motion: reduce) { div[style*="govmarquee"] { animation: none; } }`}</style>
        </div>

        <section className="p-5 sm:p-6">
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
              <div className={sectionHead}>{t(lang,"dashboardHead")} — {portalCitizen.displayName} · UAN {SYNTHETIC_CITIZEN.evaluationUan} (synthetic)</div>
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
                  <p className="rounded-sm bg-[#f8fafc] border border-slate-200 p-3"><b>{t(lang,"serviceRecord")}:</b> {portalCitizen.serviceYears} {pi.svcYears} · <b>{t(lang,"bankIfsc")}:</b> {portalCitizen.bankIfsc} {pi.ifscValid}</p>
                  <p className="rounded-sm bg-[#f8fafc] border border-slate-200 p-3"><b>{pi.nomDone}</b> · <b>{pi.trackLabel}</b> {SYNTHETIC_CITIZEN.claimTrackingId}</p>
                </div>

              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.CLAIM_FORM && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang, "claimForm")}</div>
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] text-slate-500">{pi.memberIs} <b>{portalCitizen.nameAsPerAadhaar}</b></p>
                  <button type="button" onClick={() => dispatch("VIEW_DASHBOARD")} disabled={busy} className={btnOutline + " text-[11px]"}>{t(lang,"backToDash")}</button>
                </div>
                <table className="w-full max-w-2xl text-[13px]"><tbody>
                  <tr><td className={`${th} w-64`}>{t(lang,"memberName")}</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.nameAsPerAadhaar}</td></tr>
                  <tr><td className={th}>{t(lang,"serviceRecord")}</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.serviceYears} {pi.svcYears}</td></tr>
                  <tr><td className={th}>{t(lang,"purpose")}</td><td className="border border-slate-300 px-2 py-1">{pi.purposeVal}</td></tr>
                  <tr><td className={th}>{t(lang,"bankIfsc")}</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.bankIfsc}</td></tr>
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
              <div className={sectionHead}>{t(lang,"statusHead")} {SYNTHETIC_CITIZEN.claimTrackingId}</div>
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
              <div className={sectionHead}>{t(lang,"statusHead")} {SYNTHETIC_CITIZEN.claimTrackingId}</div>
              <div className="p-5">
                <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3 text-[13px]"><b>{t(lang,"rejectedTitle")}</b><br />{pi.rejReason}</div>
                <table className="mt-4 w-full max-w-2xl text-[13px]"><thead><tr><th className={th}>{pi.particulars}</th><th className={th}>{pi.officeRecord}</th></tr></thead><tbody>
                  <tr><td className="border border-slate-300 px-2 py-1">{pi.nameEmployer}</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.nameAsPerEmployer}</td></tr>
                  <tr><td className="border border-slate-300 px-2 py-1">{pi.nameUan}</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.nameAsPerAadhaar}</td></tr>
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
                <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder={`e.g. ${SYNTHETIC_CITIZEN.claimTrackingId}`} className={`${inputCls} mt-2 max-w-xs`} aria-label={t(lang,"trackingIdLabel")} />
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
      </div>


    </GovShell>
  );
}
