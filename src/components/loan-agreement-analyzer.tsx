'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, Shield, FileScan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAgreementAnalysis } from '@/app/actions';
import type { AgreementAnalysisResult } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { CorrectiveSuggestions } from './corrective-suggestions';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  agreement: z.any().refine(files => files?.length > 0, 'Loan agreement document is required.'),
});

const getRiskLevelVariant = (riskLevel: 'Low' | 'Medium' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'default';
    case 'Medium':
      return 'secondary';
    case 'High':
      return 'destructive';
    default:
      return 'default';
  }
};

function ResultsSkeleton() {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

export function LoanAgreementAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AgreementAnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
      const file = values.agreement[0];
      if (file.type !== 'application/pdf') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF document.',
        });
        setIsLoading(false);
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 4MB.",
        });
        setIsLoading(false);
        return;
      }

      const documentDataUri = await fileToBase64(file);
      const analysisResult = await handleAgreementAnalysis({ document: documentDataUri });
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze the document.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg text-left">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Loan Agreement Risk Analysis</CardTitle>
        <CardDescription>Upload your loan agreement PDF to have our AI check for risky clauses.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="agreement"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Loan Agreement Document</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="application/pdf"
                      onChange={(e) => onChange(e.target.files)} 
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileScan className="mr-2 h-5 w-5" />}
              Scan Agreement
            </Button>
          </form>
        </Form>

        {isLoading && <ResultsSkeleton />}

        {result && (
            <div className="mt-8 space-y-6 animate-in fade-in-0 duration-500">
                <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle className="flex items-center gap-4">
                        <span>Analysis Complete</span>
                        <Badge variant={getRiskLevelVariant(result.riskLevel)}>
                            Risk Level: {result.riskLevel}
                        </Badge>
                    </AlertTitle>
                    <AlertDescription>
                        Our AI has analyzed your document. See the flagged sections and suggestions below.
                    </AlertDescription>
                </Alert>

                {result.flaggedSections.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Flagged Sections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 list-disc pl-5">
                                {result.flaggedSections.map((section, index) => (
                                    <li key={index}>{section}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {result.suggestedActions.length > 0 && (
                    <CorrectiveSuggestions suggestions={result.suggestedActions} />
                )}

                {result.flaggedSections.length === 0 && (
                    <Alert>
                        <CheckCircle className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                        <AlertTitle>No Major Risks Found</AlertTitle>
                        <AlertDescription>
                            Our analysis did not identify any high-risk clauses. We still recommend reading the agreement carefully yourself.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
