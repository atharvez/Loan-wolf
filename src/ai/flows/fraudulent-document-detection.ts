'use server';

/**
 * @fileOverview Detects fraudulent documents submitted with loan applications.
 *
 * - detectFraudulentDocument - A function that detects fraudulent documents.
 * - DetectFraudulentDocumentInput - The input type for the detectFraudulentDocument function.
 * - DetectFraudulentDocumentOutput - The return type for the detectFraudulentDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFraudulentDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document to analyze for fraud, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the document.'),
});
export type DetectFraudulentDocumentInput = z.infer<
  typeof DetectFraudulentDocumentInputSchema
>;

const DetectFraudulentDocumentOutputSchema = z.object({
  isFraudulent: z
    .boolean()
    .describe('Whether or not the document is likely fraudulent.'),
  fraudExplanation: z
    .string()
    .describe('Explanation of why the document is likely fraudulent.'),
});
export type DetectFraudulentDocumentOutput = z.infer<
  typeof DetectFraudulentDocumentOutputSchema
>;

export async function detectFraudulentDocument(
  input: DetectFraudulentDocumentInput
): Promise<DetectFraudulentDocumentOutput> {
  return detectFraudulentDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFraudulentDocumentPrompt',
  input: {schema: DetectFraudulentDocumentInputSchema},
  output: {schema: DetectFraudulentDocumentOutputSchema},
  prompt: `You are an expert in detecting fraudulent documents.

You will analyze the provided document and its description to determine if it is fraudulent.

Description: {{{description}}}
Document: {{media url=documentDataUri}}

Based on the document and description, determine if the document is fraudulent and explain why or why not.

Output your decision using the schema provided.`,
});

const detectFraudulentDocumentFlow = ai.defineFlow(
  {
    name: 'detectFraudulentDocumentFlow',
    inputSchema: DetectFraudulentDocumentInputSchema,
    outputSchema: DetectFraudulentDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
