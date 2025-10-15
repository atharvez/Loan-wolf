'use server';
/**
 * @fileOverview Detects inconsistent financial claims in loan applications.
 *
 * - detectInconsistentFinancialClaims - A function that detects inconsistent financial claims.
 * - DetectInconsistentFinancialClaimsInput - The input type for the detectInconsistentFinancialClaims function.
 * - DetectInconsistentFinancialClaimsOutput - The return type for the detectInconsistentFinancialClaims function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectInconsistentFinancialClaimsInputSchema = z.object({
  income: z.number().describe('The applicant\'s reported income.'),
  assets: z.number().describe('The applicant\'s reported assets.'),
  debt: z.number().describe('The applicant\'s reported debt.'),
  creditScore: z.number().describe('The applicant\'s credit score.'),
  financialStatements: z.string().describe('The applicant\'s financial statements as text.'),
});
export type DetectInconsistentFinancialClaimsInput = z.infer<typeof DetectInconsistentFinancialClaimsInputSchema>;

const DetectInconsistentFinancialClaimsOutputSchema = z.object({
  isInconsistent: z.boolean().describe('Whether or not the financial claims are inconsistent.'),
  explanation: z.string().describe('The explanation of why the financial claims are inconsistent.'),
});
export type DetectInconsistentFinancialClaimsOutput = z.infer<typeof DetectInconsistentFinancialClaimsOutputSchema>;

export async function detectInconsistentFinancialClaims(
  input: DetectInconsistentFinancialClaimsInput
): Promise<DetectInconsistentFinancialClaimsOutput> {
  return detectInconsistentFinancialClaimsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectInconsistentFinancialClaimsPrompt',
  input: {schema: DetectInconsistentFinancialClaimsInputSchema},
  output: {schema: DetectInconsistentFinancialClaimsOutputSchema},
  prompt: `You are an AI assistant that analyzes financial information to detect inconsistencies.

  You will receive the applicant's income, assets, debt, credit score, and financial statements.
  Your task is to determine if there are any inconsistencies in the provided information.
  If there are inconsistencies, set the isInconsistent field to true and provide an explanation.
  Otherwise, set the isInconsistent field to false and provide a message that no inconsistencies were found.

  Income: {{{income}}}
  Assets: {{{assets}}}
  Debt: {{{debt}}}
  Credit Score: {{{creditScore}}}
  Financial Statements: {{{financialStatements}}}
  \nConsider if their financial statements align with their claimed income, assets, and debt.
  Pay special attention to any discrepancies between their claimed income and their financial statements, or if their debt seems too high or too low given their claimed income and assets.
`,
});

const detectInconsistentFinancialClaimsFlow = ai.defineFlow(
  {
    name: 'detectInconsistentFinancialClaimsFlow',
    inputSchema: DetectInconsistentFinancialClaimsInputSchema,
    outputSchema: DetectInconsistentFinancialClaimsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
