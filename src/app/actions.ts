'use server';

import { z } from 'zod';
import { detectInconsistentFinancialClaims } from '@/ai/flows/inconsistent-financial-claims-detection';
import { detectFraudulentDocument } from '@/ai/flows/fraudulent-document-detection';
import { getPersonalizedCorrectiveSuggestions } from '@/ai/flows/personalized-corrective-suggestions';
import { analyzeLoanAgreement, type AnalyzeLoanAgreementOutput } from '@/ai/flows/loan-agreement-analysis';

import type { AnalysisResult } from '@/lib/types';

const ApplicationSchema = z.object({
  income: z.number(),
  debt: z.number(),
  creditScore: z.number(),
  document: z.string().optional(), // data URI
});

const AgreementSchema = z.object({
    document: z.string(), // data URI
});


export async function handleApplicationSubmit(
  formData: z.infer<typeof ApplicationSchema>
): Promise<AnalysisResult> {
  const validation = ApplicationSchema.safeParse(formData);
  if (!validation.success) {
    throw new Error('Invalid form data.');
  }

  const { income, debt, creditScore, document } = validation.data;
  const issues: string[] = [];
  
  const financialStatementsText = `Applicant reports annual income of $${income}, monthly debt of $${debt}, and a credit score of ${creditScore}.`;

  const [inconsistencyResult, fraudResult] = await Promise.all([
    detectInconsistentFinancialClaims({
      income: income,
      assets: 0, // Not in form, using 0
      debt: debt,
      creditScore: creditScore,
      financialStatements: financialStatementsText,
    }),
    document
      ? detectFraudulentDocument({
          documentDataUri: document,
          description: 'User-submitted financial document like a pay stub or bank statement.',
        })
      : Promise.resolve(null),
  ]);

  if (inconsistencyResult.isInconsistent) {
    issues.push(`Financial claims inconsistency: ${inconsistencyResult.explanation}`);
  }

  if (fraudResult?.isFraudulent) {
    issues.push(`Potential document fraud detected: ${fraudResult.fraudExplanation}`);
  }

  let suggestions: string[] = [];
  if (issues.length > 0) {
    try {
      const suggestionsResult = await getPersonalizedCorrectiveSuggestions({
        applicationData: { 
          annual_income: income, 
          monthly_debt: debt, 
          credit_score: creditScore 
        },
        detectedIssues: issues,
      });
      suggestions = suggestionsResult.suggestions;
    } catch (e) {
      console.error("Error getting suggestions:", e);
      // Fallback to just showing the raw issues if suggestion generation fails
      suggestions = issues;
    }
  }

  const annualDebt = debt * 12;
  const loanScore = Math.round(
    ((income - annualDebt) / income) * (creditScore / 850) * 100
  );
  
  const recommendedAmount = Math.max(0, (income * 2.5) - annualDebt);

  return {
    loanScore: Math.max(0, loanScore),
    recommendedAmount,
    inconsistency: inconsistencyResult,
    fraud: fraudResult,
    suggestions,
  };
}


export async function handleAgreementAnalysis(
    formData: z.infer<typeof AgreementSchema>
): Promise<AnalyzeLoanAgreementOutput> {
    const validation = AgreementSchema.safeParse(formData);
    if (!validation.success) {
        throw new Error('Invalid form data.');
    }

    const { document } = validation.data;

    // For now, we are passing the data URI directly to the GenAI flow.
    // In a real application, you would extract text from the PDF on the server.
    // This is a placeholder for that logic.
    // Let's pretend the data URI is the text for demo purposes.
    const fakeText = "This is a sample loan agreement text extracted from the uploaded PDF. It includes clauses about interest rates, late payment penalties, and other terms. The interest rate is 5% and there is a $50 late fee.";
    
    try {
        const analysis = await analyzeLoanAgreement({
        agreementText: fakeText, // Pass the extracted text here.
        });
        return analysis;
    } catch (error) {
        console.error('Error analyzing loan agreement:', error);
        throw new Error('Failed to analyze the loan agreement.');
    }
}
