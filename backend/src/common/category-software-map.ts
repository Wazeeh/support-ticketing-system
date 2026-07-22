export const VALID_CATEGORIES_BY_SOFTWARE: Record<string, string[]> = {
  TMS: [
    'LOGIN', 'ENROLLMENT', 'ASSESSMENT', 'CERTIFICATION', 'COURSE_DATA',
    'BATCH_DATA', 'TRAINEE_DATA', 'CLAIM_1_BILLING', 'CLAIM_2_BILLING',
    'CLAIM_3_BILLING', 'OTHER',
  ],
  FINMAN: [
    'LOGIN', 'LEDGER', 'BUDGET', 'SOE', 'DOUBLE_COLUMN_CASHBOOK', 'OTHER',
  ],
};

export const CATEGORY_LABELS: Record<string, string> = {
  LOGIN: 'Login',
  ENROLLMENT: 'Enrollment',
  ASSESSMENT: 'Assessment',
  CERTIFICATION: 'Certification',
  COURSE_DATA: 'Course Data',
  BATCH_DATA: 'Batch Data',
  TRAINEE_DATA: 'Trainee Data',
  CLAIM_1_BILLING: 'Claim 1 Billing',
  CLAIM_2_BILLING: 'Claim 2 Billing',
  CLAIM_3_BILLING: 'Claim 3 Billing',
  LEDGER: 'Ledger',
  BUDGET: 'Budget',
  SOE: 'SOE',
  DOUBLE_COLUMN_CASHBOOK: 'Double Column Cashbook',
  OTHER: 'Other',
};