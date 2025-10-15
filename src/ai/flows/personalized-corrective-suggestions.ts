'use server';
/**
 * @fileOverview AI-powered flow that provides personalized suggestions to improve loan application accuracy.
 *
 * - getPersonalizedCorrectiveSuggestions - A function that generates personalized suggestions for improving loan applications.
 * - PersonalizedCorrectiveSuggestionsInput - The input type for the getPersonalizedCorrectiveSuggestions function.
 * - PersonalizedCorrectiveSuggestionsOutput - The return type for the getPersonalizedCorrectiveSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedCorrectiveSuggestionsInputSchema = z.object({
  applicationData: z.record(z.any()).describe('The loan application data as a key-value object.'),
  detectedIssues: z.array(z.string()).describe('A list of issues detected in the loan application.'),
});
export type PersonalizedCorrectiveSuggestionsInput = z.infer<
  typeof PersonalizedCorrectiveSuggestionsInputSchema
>;

const PersonalizedCorrectiveSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Personalized suggestions to correct the identified issues in the application.'),
});
export type PersonalizedCorrectiveSuggestionsOutput = z.infer<
  typeof PersonalizedCorrectiveSuggestionsOutputSchema
>;

export async function getPersonalizedCorrectiveSuggestions(
  input: PersonalizedCorrectiveSuggestionsInput
): Promise<PersonalizedCorrectiveSuggestionsOutput> {
  return personalizedCorrectiveSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedCorrectiveSuggestionsPrompt',
  input: {schema: PersonalizedCorrectiveSuggestionsInputSchema},
  output: {schema: PersonalizedCorrectiveSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides personalized suggestions to improve loan application accuracy.

  Based on the loan application data and detected issues, provide specific and actionable suggestions to the user.

  Application Data:
  {{#each applicationData}}
  {{@key}}: {{{this}}}
  {{/each}}

  Detected Issues:
  {{#each detectedIssues}}
  - {{{this}}}
  {{/each}}

  Suggestions:
`,
});

const personalizedCorrectiveSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedCorrectiveSuggestionsFlow',
    inputSchema: PersonalizedCorrectiveSuggestionsInputSchema,
    outputSchema: PersonalizedCorrectiveSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
