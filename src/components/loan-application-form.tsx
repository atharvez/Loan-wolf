'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { handleApplicationSubmit } from '@/app/actions';
import type { AnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  income: z.coerce.number().positive({ message: 'Annual income must be a positive number.' }),
  debt: z.coerce.number().nonnegative({ message: 'Total monthly debt cannot be negative.' }),
  creditScore: z.coerce.number().min(300, { message: 'Credit score must be at least 300.' }).max(850, { message: 'Credit score cannot exceed 850.' }),
  document: z.any().optional(),
});

type LoanApplicationFormProps = {
  onAnalysisComplete: (results: AnalysisResult) => void;
  onAnalysisStart: () => void;
  onAnalysisError: () => void;
};

export function LoanApplicationForm({ onAnalysisComplete, onAnalysisStart, onAnalysisError }: LoanApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: 50000,
      debt: 500,
      creditScore: 650,
    },
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
    onAnalysisStart();

    try {
      let documentDataUri: string | undefined;
      if (values.document && values.document.length > 0) {
        const file = values.document[0];
        if (file.size > 4 * 1024 * 1024) { // 4MB limit for GenAI
          toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload a file smaller than 4MB.",
          });
          setIsLoading(false);
          onAnalysisError();
          return;
        }
        documentDataUri = await fileToBase64(file);
      }
      
      const results = await handleApplicationSubmit({
        income: values.income,
        debt: values.debt,
        creditScore: values.creditScore,
        document: documentDataUri,
      });

      onAnalysisComplete(results);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Could not process your application. Please try again.",
      });
      onAnalysisError();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Loan Application</CardTitle>
        <CardDescription>Enter your financial details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Income ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="debt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Monthly Debt ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="creditScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Score</FormLabel>
                  <FormControl>
                    <Input type="number" min="300" max="850" placeholder="300-850" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Upload Financial Document (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => onChange(e.target.files)} 
                      {...rest}
                    />
                  </FormControl>
                  <FormDescription>
                    Pay stub or bank statement (image or PDF, max 4MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Analyze Application
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
