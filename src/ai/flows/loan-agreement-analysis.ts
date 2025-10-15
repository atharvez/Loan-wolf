'use server';
/**
 * @fileOverview Analyzes a loan agreement for high-risk clauses.
 *
 * - analyzeLoanAgreement - A function that analyzes a loan agreement.
 * - AnalyzeLoanAgreementInput - The input type for the analyzeLoanAgreement function.
 * - AnalyzeLoanAgreementOutput - The return type for the analyzeLoanAgreement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLoanAgreementInputSchema = z.object({
  agreementText: z.string().describe('The full text of the loan agreement.'),
});
export type AnalyzeLoanAgreementInput = z.infer<typeof AnalyzeLoanAgreementInputSchema>;

const AnalyzeLoanAgreementOutputSchema = z.object({
  riskLevel: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The overall risk level of the loan agreement.'),
  flaggedSections: z
    .array(z.string())
    .describe('Specific clauses or sections that are considered high-risk.'),
  suggestedActions: z
    .array(z.string())
    .describe('Actionable suggestions to mitigate the identified risks.'),
});
export type AnalyzeLoanAgreementOutput = z.infer<typeof AnalyzeLoanAgreementOutputSchema>;

export async function analyzeLoanAgreement(
  input: AnalyzeLoanAgreementInput
): Promise<AnalyzeLoanAgreementOutput> {
  return analyzeLoanAgreementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLoanAgreementPrompt',
  input: {schema: AnalyzeLoanAgreementInputSchema},
  output: {schema: AnalyzeLoanAgreementOutputSchema},
  prompt: `You are an expert financial analyst specializing in loan agreements. Your task is to analyze the provided loan agreement text for any high-risk clauses, ambiguities, or terms that could be unfavorable to the borrower.

  Based on your analysis, you will determine an overall risk level (Low, Medium, or High).
  You will identify and list the specific sections or clauses that are flagged as risky.
  Finally, you will provide clear, actionable suggestions for the borrower to address these risks, such as requesting clarification or negotiating terms.

  Examples of risky clauses include:
  - Unclear or ambiguous language regarding interest rates, fees, or payment schedules.
  - Clauses that allow the lender to change terms unilaterally.
  - High penalties for late payments or prepayment.
  - Vague definitions of default.

  Loan Agreement Text:
  {{{agreementText}}}

  Please provide your analysis in the specified JSON format.
`,
});

const analyzeLoanAgreementFlow = ai.defineFlow(
  {
    name: 'analyzeLoanAgreementFlow',
    inputSchema: AnalyzeLoanAgreementInputSchema,
    outputSchema: AnalyzeLoanAgreementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
