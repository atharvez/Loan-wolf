import type { DetectInconsistentFinancialClaimsOutput } from '@/ai/flows/inconsistent-financial-claims-detection';
import type { DetectFraudulentDocumentOutput } from '@/ai/flows/fraudulent-document-detection';
import type { AnalyzeLoanAgreementOutput } from '@/ai/flows/loan-agreement-analysis';

export type AnalysisResult = {
  loanScore: number;
  recommendedAmount: number;
  inconsistency: DetectInconsistentFinancialClaimsOutput;
  fraud: DetectFraudulentDocumentOutput | null;
  suggestions: string[];
};

export type AgreementAnalysisResult = AnalyzeLoanAgreementOutput;
