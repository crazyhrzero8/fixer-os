"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLang, DICT, t } from "@/lib/i18n";
import { cardCls, btnPrimary, btnOutline } from "@/app/govshell";

type TourType = "portal" | "fixer" | "demo" | null;

const PORTAL_SELECTORS = [
  "#uan",
  "#file-claim-btn",
  "#terms-checkbox",
  "#submit-claim-btn",
  "#advance-day-btn",
  "#open-grievance-btn",
  'input[placeholder*="e.g."]',
  "#submit-grievance-btn",
  "#open-console-link"
];

const DEMO_SELECTORS = [
  "#run-comparison-btn"
];

export default function NavBot() {
  const { lang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const c = DICT[lang as "en" | "hi"];

  const [hasAsked, setHasAsked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<TourType>(null);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Initialize from sessionStorage to prevent popups on page reloads
  useEffect(() => {
    const closed = sessionStorage.getItem("fixer_bot_closed");
    const active = sessionStorage.getItem("fixer_bot_active") as TourType;
    const currentStep = sessionStorage.getItem("fixer_bot_step");

    if (closed === "true") {
      setHasAsked(true);
    } else {
      // Auto-popup after 1.5s on first entry
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAsked(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (active) {
      setActiveTour(active);
      setIsOpen(true);
      if (currentStep) setStep(parseInt(currentStep, 10));
    }
  }, []);

  // Save tour states
  const saveState = (tour: TourType, s: number) => {
    if (tour) {
      sessionStorage.setItem("fixer_bot_active", tour);
      sessionStorage.setItem("fixer_bot_step", String(s));
    } else {
      sessionStorage.removeItem("fixer_bot_active");
      sessionStorage.removeItem("fixer_bot_step");
    }
  };

  // Close welcome question
  const dismissBot = () => {
    setIsOpen(false);
    sessionStorage.setItem("fixer_bot_closed", "true");
  };

  // Start a specific tour
  const startTour = (tour: TourType) => {
    setActiveTour(tour);
    setStep(0);
    saveState(tour, 0);
    setIsOpen(true);

    if (tour === "portal") {
      router.push("/portal");
    } else if (tour === "fixer") {
      sessionStorage.setItem("allowed_to_login", "true");
      router.push("/fixer");
    } else if (tour === "demo") {
      router.push("/demo");
    }
  };

  // Reset/End the walkthrough
  const endTour = () => {
    setActiveTour(null);
    setStep(0);
    setTargetRect(null);
    saveState(null, 0);
  };

  // Dynamic selector array to handle admin login
  const getFixerSelectors = (): string[] => {
    if (typeof document !== "undefined" && document.getElementById("admin-username")) {
      const userInp = document.getElementById("admin-username") as HTMLInputElement | null;
      const isPinLogin = userInp?.getAttribute("type") === "hidden";
      if (isPinLogin) {
        return [
          "#admin-password",
          "#admin-login-btn",
          "#case-select",
          "#run-step-btn",
          "#run-step-btn",
          "#run-step-btn",
          "#run-step-btn",
          "#download-letter-btn"
        ];
      }
      return [
        "#admin-username",
        "#admin-password",
        "#admin-login-btn",
        "#case-select",
        "#run-step-btn",
        "#run-step-btn",
        "#run-step-btn",
        "#run-step-btn",
        "#download-letter-btn"
      ];
    }
    return [
      "#case-select",
      "#run-step-btn",
      "#run-step-btn",
      "#run-step-btn",
      "#run-step-btn",
      "#download-letter-btn"
    ];
  };

  // Get active step target selector
  const getActiveSelector = (): string | null => {
    if (!activeTour) return null;
    if (activeTour === "portal") return PORTAL_SELECTORS[step] || null;
    if (activeTour === "fixer") {
      const selList = getFixerSelectors();
      return selList[step] || null;
    }
    if (activeTour === "demo") return DEMO_SELECTORS[step] || null;
    return null;
  };

  const currentSelector = getActiveSelector();

  // Dynamic Element Position Tracker
  useEffect(() => {
    if (!activeTour || !currentSelector) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(currentSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 250);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [activeTour, currentSelector, pathname]);

  const getPortalStepFromDOM = (): number => {
    if (document.getElementById("open-console-link")) return 8;
    if (document.getElementById("submit-grievance-btn")) {
      const inp = document.querySelector('input[placeholder*="e.g."]') as HTMLInputElement | null;
      if (inp?.value && inp.value.trim().length > 3) return 7;
      return 6;
    }
    if (document.getElementById("open-grievance-btn")) return 5;
    if (document.getElementById("advance-day-btn")) return 4;
    if (document.getElementById("submit-claim-btn")) {
      const chk = document.getElementById("terms-checkbox") as HTMLInputElement | null;
      if (chk?.checked) return 3;
      return 2;
    }
    if (document.getElementById("file-claim-btn")) return 1;
    return 0;
  };

  const getFixerStepFromDOM = (): number => {
    // If admin username input is present, we are on the login form
    const userInp = document.getElementById("admin-username") as HTMLInputElement | null;
    if (userInp) {
      const passInp = document.getElementById("admin-password") as HTMLInputElement | null;
      const isPinLogin = userInp.getAttribute("type") === "hidden";
      if (isPinLogin) {
        if (!passInp || !passInp.value) return 0;
        return 1;
      }
      if (!userInp.value) return 0;
      if (!passInp || !passInp.value) return 1;
      return 2;
    }

    const sel = document.getElementById("case-select") as HTMLSelectElement | null;
    if (!sel || !sel.value.includes("epfo")) return 0;
    
    if (document.getElementById("download-letter-btn")) {
      return 5;
    }
    
    const events = document.querySelectorAll("[aria-label='Agent progress'] span");
    const completedCount = Array.from(events).filter(el => el.textContent?.includes("✓")).length;
    return Math.min(4, completedCount + 1);
  };

  // Intelligent state synchronization between DOM and Bot Step
  useEffect(() => {
    if (!activeTour) return;

    const timer = setInterval(() => {
      if (activeTour === "portal") {
        const computedStep = getPortalStepFromDOM();
        if (computedStep !== step) {
          setStep(computedStep);
          saveState("portal", computedStep);
        }
      } else if (activeTour === "fixer") {
        const computedStep = getFixerStepFromDOM();
        if (computedStep !== step) {
          setStep(computedStep);
          saveState("fixer", computedStep);
        }
      } else if (activeTour === "demo") {
        const hasPauseButton = document.querySelector("button:has-text('Pause'), button:has-text('रोकें')");
        const computedStep = hasPauseButton ? 1 : 0;
        if (computedStep !== step) {
          setStep(computedStep);
          saveState("demo", computedStep);
        }
      }
    }, 250);

    return () => clearInterval(timer);
  }, [activeTour, step, pathname]);

  // Dynamic step instructions text arrays to include admin login steps
  const getFixerStepsText = (): readonly string[] => {
    const rawSteps = c.tourFixerSteps;
    if (typeof document !== "undefined" && document.getElementById("admin-username")) {
      const userInp = document.getElementById("admin-username") as HTMLInputElement | null;
      const isPinLogin = userInp?.getAttribute("type") === "hidden";
      if (isPinLogin) {
        const pinSteps = lang === "hi" ? [
          "सुरक्षा एक्सेस पिन दर्ज करें: 1902",
          "कंट्रोल पैनल खोलने के लिए कार्यक्षेत्र खोलें पर क्लिक करें"
        ] : [
          "Enter the security access PIN: 1902",
          "Click verify to open the control panel"
        ];
        return [...pinSteps, ...rawSteps];
      }
      const loginSteps = lang === "hi" ? [
        "डेमो क्रेडेंशियल दर्ज करें (प्रशासक आईडी: admin)",
        "पासवर्ड दर्ज करें: admin1234",
        "कंट्रोल पैनल खोलने के लिए क्रेडेंशियल सत्यापित करें पर क्लिक करें"
      ] : [
        "Enter demo credentials (Admin ID: admin)",
        "Enter password: admin1234",
        "Click verify credentials to open the control panel"
      ];
      return [...loginSteps, ...rawSteps];
    }
    return rawSteps;
  };

  const stepsText = activeTour === "portal" 
    ? c.tourPortalSteps 
    : activeTour === "fixer" 
      ? getFixerStepsText() 
      : activeTour === "demo" 
        ? c.tourDemoSteps 
        : [];

  const completed = activeTour && step >= stepsText.length;

  return (
    <>
      {/* 1. Element Highlight Ring */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            zIndex: 99999,
            pointerEvents: "none",
            transition: "all 0.15s ease-out"
          }}
          className="rounded border-4 border-red-500 animate-pulse bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
        />
      )}

      {/* 2. Floating Bot Widget */}
      <div className="fixed bottom-6 right-6 z-[99998] flex flex-col items-end">
        {/* Toggle Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Navigation Assistant"
            className="flex h-10 items-center justify-center gap-2 rounded-none border border-[#1a4b8e] bg-white text-[#1a4b8e] font-bold text-xs uppercase px-4 shadow-md hover:bg-[#eef3f9] focus:outline-none focus:ring-1 focus:ring-[#1a4b8e]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.598.598 0 0 1-.655-.077.598.598 0 0 1-.165-.63l.774-2.87A8.100 8.100 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <span>{lang === "hi" ? "मार्गदर्शक" : "Guide"}</span>
          </button>
        )}

        {/* Chat Widget Panel */}
        {isOpen && (
          <div className={`${cardCls} w-80 max-w-[calc(100vw-2rem)] border-t-4 border-t-[#1a4b8e] p-4 shadow-2xl rounded-none`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#1a4b8e]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.598.598 0 0 1-.655-.077.598.598 0 0 1-.165-.63l.774-2.87A8.100 8.100 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                <b className="text-[13px] text-[#1a4b8e]">{c.botName}</b>
              </div>
              <button
                onClick={dismissBot}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="py-3 text-[12px] text-slate-700 leading-relaxed max-h-60 overflow-y-auto">
              {!activeTour ? (
                <>
                  <p>{c.botWelcome}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTour("portal")}
                      className={btnPrimary + " w-full py-1 text-[11px] rounded-none"}
                    >
                      {c.botYes}
                    </button>
                    <button
                      onClick={dismissBot}
                      className={btnOutline + " w-full py-1 text-[11px] rounded-none"}
                    >
                      {c.botNo}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {completed ? (
                    <div className="text-center py-2">
                      <p className="font-bold text-green-700">[PASS] {c.botTourCompleted}</p>
                      <button
                        onClick={endTour}
                        className={btnPrimary + " mt-3 w-full py-1 text-[11px] rounded-none"}
                      >
                        {c.botClose}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-slate-800">
                        {lang === "hi" ? "निर्देश:" : "Current Instruction:"}
                      </p>
                      <p className="mt-1 text-[#1a4b8e] bg-[#eef3f9] p-2 rounded-none border border-[#1a4b8e]/10 font-medium">
                        {stepsText[step]}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            const prev = Math.max(0, step - 1);
                            setStep(prev);
                            saveState(activeTour, prev);
                          }}
                          disabled={step === 0}
                          className={btnOutline + " py-0.5 px-2 text-[10px] disabled:opacity-40 rounded-none"}
                        >
                          {c.botPrev}
                        </button>
                        <button
                          onClick={endTour}
                          className="text-[10px] text-red-600 hover:underline"
                        >
                          {c.botClose}
                        </button>
                        <button
                          onClick={() => {
                            const next = Math.min(stepsText.length, step + 1);
                            setStep(next);
                            saveState(activeTour, next);
                          }}
                          className={btnPrimary + " py-0.5 px-2 text-[10px] rounded-none"}
                        >
                          {c.botNext}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Walkthrough list selection if guide requested but not yet selected */}
              {activeTour === null && hasAsked && (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="font-bold text-[#1a4b8e]">{c.botSelectTour}</p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    <button
                      onClick={() => startTour("portal")}
                      className="w-full rounded-none border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-left text-[11px] hover:border-[#1a4b8e] hover:bg-white"
                    >
                      {c.tourPortalName}
                    </button>
                    <button
                      onClick={() => startTour("fixer")}
                      className="w-full rounded-none border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-left text-[11px] hover:border-[#1a4b8e] hover:bg-white"
                    >
                      {c.tourFixerName}
                    </button>
                    <button
                      onClick={() => startTour("demo")}
                      className="w-full rounded-none border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-left text-[11px] hover:border-[#1a4b8e] hover:bg-white"
                    >
                      {c.tourDemoName}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-slate-500 hover:underline"
              >
                {c.botMinimize}
              </button>
              {activeTour && (
                <span className="text-[10px] font-semibold text-slate-500">
                  {step + 1} / {stepsText.length}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
