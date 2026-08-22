import { SYNTHETIC_CITIZEN } from "@/data/seed";
import { APP_CONFIG } from "./config";

/** Public states for the mock-portal replay. Kept exported for the agent module in Phase 3. */
export const PORTAL_STATES = {
  LOGIN_FRICTION: "LOGIN_FRICTION",
  OTP_REQUIRED: "OTP_REQUIRED",
  DASHBOARD: "DASHBOARD",
  CLAIM_FORM: "CLAIM_FORM",
  UNDER_PROCESS: "UNDER_PROCESS",
  REJECTED: "REJECTED",
  GRIEVANCE_FORM: "GRIEVANCE_FORM",
  GRIEVANCE_INVALID_TRACKING: "GRIEVANCE_INVALID_TRACKING",
  GRIEVANCE_LOCKED_OUT: "GRIEVANCE_LOCKED_OUT"
} as const;

export type PortalState = (typeof PORTAL_STATES)[keyof typeof PORTAL_STATES];
export type PortalAction = "VERIFY_CAPTCHA" | "VERIFY_OTP" | "RESEND_OTP" | "REFRESH_CAPTCHA" | "OPEN_CLAIM_FORM" | "VIEW_DASHBOARD" | "VIEW_PASSBOOK" | "VIEW_KYC" | "SUBMIT_ADVANCE_CLAIM" | "ADVANCE_DAY" | "OPEN_GRIEVANCE" | "SUBMIT_GRIEVANCE" | "RESET";
export interface PortalSnapshot { state: PortalState; simulatedDays: number; message?: string; }
export const PROCESSING_DAYS = APP_CONFIG.portal.processingDays;
export const initialPortalSnapshot = (): PortalSnapshot => ({ state: PORTAL_STATES.LOGIN_FRICTION, simulatedDays: 0 });

export function transitionPortal(snapshot: PortalSnapshot, action: PortalAction): PortalSnapshot {
  if (action === "RESET") return initialPortalSnapshot();
  switch (snapshot.state) {
    case PORTAL_STATES.LOGIN_FRICTION:
      if (action === "VERIFY_CAPTCHA") return { state: PORTAL_STATES.OTP_REQUIRED, simulatedDays: 0, message: "OTP sent to registered mobile (synthetic)." };
      if (action === "REFRESH_CAPTCHA") return snapshot;
      break;
    case PORTAL_STATES.OTP_REQUIRED:
      if (action === "VERIFY_OTP") return { state: PORTAL_STATES.DASHBOARD, simulatedDays: 0, message: "Login successful — welcome to Member Dashboard (synthetic)." };
      if (action === "RESEND_OTP") return { state: PORTAL_STATES.OTP_REQUIRED, simulatedDays: 0, message: "OTP resent (synthetic)." };
      if (action === "REFRESH_CAPTCHA") return snapshot;
      break;
    case PORTAL_STATES.DASHBOARD:
      if (action === "OPEN_CLAIM_FORM") return { state: PORTAL_STATES.CLAIM_FORM, simulatedDays: 0 };
      if (action === "VIEW_PASSBOOK") return { state: PORTAL_STATES.DASHBOARD, simulatedDays: 0, message: "Passbook: EPF Balance ₹4,36,000 (synthetic) — not real money." };
      if (action === "VIEW_KYC") return { state: PORTAL_STATES.DASHBOARD, simulatedDays: 0, message: "KYC: Aadhaar, PAN, Bank — all verified (synthetic)." };
      break;
    case PORTAL_STATES.CLAIM_FORM:
      if (action === "SUBMIT_ADVANCE_CLAIM") return { state: PORTAL_STATES.UNDER_PROCESS, simulatedDays: 0, message: "Your PF advance claim has been submitted." };
      if (action === "VIEW_DASHBOARD") return { state: PORTAL_STATES.DASHBOARD, simulatedDays: 0 };
      break;
    case PORTAL_STATES.UNDER_PROCESS: {
      if (action === "ADVANCE_DAY") {
        const simulatedDays = Math.min(snapshot.simulatedDays + 1, PROCESSING_DAYS);
        return simulatedDays === PROCESSING_DAYS
          ? { state: PORTAL_STATES.REJECTED, simulatedDays, message: "Claim rejected after processing review." }
          : { ...snapshot, simulatedDays };
      }
      break;
    }
    case PORTAL_STATES.REJECTED:
      if (action === "OPEN_GRIEVANCE") return { state: PORTAL_STATES.GRIEVANCE_FORM, simulatedDays: snapshot.simulatedDays };
      break;
    case PORTAL_STATES.GRIEVANCE_FORM:
      if (action === "SUBMIT_GRIEVANCE") return { state: PORTAL_STATES.GRIEVANCE_INVALID_TRACKING, simulatedDays: snapshot.simulatedDays, message: "Invalid tracking ID" };
      break;
    case PORTAL_STATES.GRIEVANCE_INVALID_TRACKING:
      if (action === "OPEN_GRIEVANCE") return { state: PORTAL_STATES.GRIEVANCE_LOCKED_OUT, simulatedDays: snapshot.simulatedDays, message: "Next grievance allowed in 30 days" };
      break;
  }
  return snapshot;
}

export const portalCitizen = SYNTHETIC_CITIZEN;
