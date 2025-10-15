import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DetectFraudulentDocumentOutput } from '@/ai/flows/fraudulent-document-detection';

type FraudDetectionResultProps = {
  result: DetectFraudulentDocumentOutput;
};

export function FraudDetectionResult({ result }: FraudDetectionResultProps) {
  if (result.isFraudulent) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Potential Document Issue Detected</AlertTitle>
        <AlertDescription>{result.fraudExplanation}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--chart-2))]" />
        <AlertTitle>Document Looks Good</AlertTitle>
        <AlertDescription>{result.fraudExplanation}</AlertDescription>
    </Alert>
  );
}
