// Shared demo "submitted application" representing the result of /onboarding flow.
// Used across the agency portal (Dashboard, Tenants, Listings) and admin KPIs.
// Data source: seeded/demo only (no DB persistence on submit).

export const submittedApplicationDemo = {
  id: 9001,
  name: "Elena Navarro",
  email: "elena.navarro@bbva.com",
  phone: "+34 645 123 987",
  property: "Calle Gran Vía 42, 3B",
  propertyApplied: "Calle Gran Vía 42, 3B",
  rentApplied: 2200,
  incomeRatio: 1.95,
  appliedDate: new Date().toISOString().slice(0, 10),
  time: "Just submitted",
  score: 8.2,
  status: "qualified" as const,
  // Personal
  nationality: "Spanish",
  countryOfBirth: "Spain",
  ageRange: "30-35",
  idType: "DNI" as const,
  idNumber: "44556677X",
  idVerified: true,
  biometricPassed: true,
  // Employment
  income: "€4,300/mo",
  incomeMonthly: 4300,
  employer: "BBVA",
  jobTitle: "Product Manager",
  employmentYears: "5 years",
  contractType: "Indefinido",
  salaryPaymentDate: "1st of month",
  businessEmailMatch: true,
  // LinkedIn
  linkedinVerified: true,
  linkedIn: true,
  linkedinProfile: "linkedin.com/in/elenanavarro",
  linkedinHeadline: "Product Manager at BBVA | Digital Banking",
  // Credit
  dbCreditScore: 79,
  dbCreditRating: "Good",
  // Documents
  documents: [
    { name: "Payslips (3 months)", uploaded: true, verified: true },
    { name: "Work Contract", uploaded: true, verified: true },
    { name: "Tax Return 2025", uploaded: true, verified: true },
    { name: "DNI Scan", uploaded: true, verified: true },
  ],
  documentsComplete: true,
  residencyHistory: [{ country: "Spain", years: "All 5 years" }],
  livedAbroad: false,
  emailVerified: true,
  phoneVerified: true,
  scoreBreakdown: [
    { category: "D&B Credit", score: 24, max: 30, color: "bg-orange-500" },
    { category: "LinkedIn", score: 19, max: 20, color: "bg-blue-500" },
    { category: "Identity", score: 18, max: 20, color: "bg-emerald-500" },
    { category: "Residency", score: 12, max: 15, color: "bg-purple-500" },
    { category: "Verifications", score: 9, max: 15, color: "bg-amber-500" },
  ],
  fraudFlag: false,
  fraudReasons: [] as string[],
  // Onboarding extras
  submittedViaOnboarding: true,
  financingProvider: "Klarna" as "Klarna" | "Santander",
  financingMonths: 12,
  financingDeposit: 4400,
  financingMonthly: 367,
  qualifiedForFinancing: true,
};

// Aggregate quality-KPI stats derived from the demo submitted applications layer,
// used by the admin Dashboard + Approved Agencies cards.
export const submittedApplicationQualityKPIs = {
  avgTrustScore: 8.2,
  pctQualifiedForFinancing: 72, // percent
  fraudFlagRate: 8, // percent
  totalSubmitted: 1,
};
