export const SEED_VERSION = "0.2.0";

export const SYNTHETIC_CITIZEN = {
  displayName: "A. Kumar (synthetic)",
  aadhaarMasked: "XXXX-XXXX-1234",
  uan: "100000000000",
  nameAsPerAadhaar: "Arjun Kumar",
  nameAsPerEmployer: "Arjun Kumar",
  bankIfsc: "SBIN0000001",
  bankIfscValid: true,
  serviceYears: 9.67,
  enominationDone: true,
  claimTrackingId: "PF/2026/A/0091847",
  evaluationUan: "100000000000",
  evaluationPassword: "demo1234"
} as const;

export const SYNTHETIC_TXN = {
  rrn: "RRN202608001234",
  amountPaise: 148500,
  merchant: "IRCTC (simulated)",
  debitedAt: "2026-08-10T10:04:00+05:30",
  ticketIssued: false,
  bankReverseDeadlineDays: 5,
  tatCompensationPerDayPaise: 10000
} as const;
