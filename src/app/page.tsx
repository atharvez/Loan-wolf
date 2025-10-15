'use client';

import { useState } from 'react';
import { LoanApplicationForm } from '@/components/loan-application-form';
import type { AnalysisResult } from '@/lib/types';
import { LoanScoreDisplay } from '@/components/loan-score-display';
import { FraudDetectionResult } from '@/components/fraud-detection-result';
import { CorrectiveSuggestions } from '@/components/corrective-suggestions';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';

function ResultsSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-6 mt-8">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setShowResults(true);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (results: AnalysisResult) => {
    setAnalysisResult(results);
    setIsLoading(false);
  };
  
  const handleAnalysisError = () => {
    setIsLoading(false);
    // Do not hide results on error, just stop loading so user can see toast
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background">
      <div className="flex flex-col items-center gap-8 w-full">
        <header className="text-center space-y-2">
          <Logo />
          <p className="max-w-xl text-muted-foreground font-body">
            Calculate loan eligibility, detect issues, and get guided feedback to improve your application.
          </p>
        </header>

        <LoanApplicationForm 
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisError={handleAnalysisError}
        />
        
        {showResults && (
           <div className="w-full max-w-2xl">
            {isLoading && <ResultsSkeleton />}
            
            {!isLoading && analysisResult && (
              <div className="w-full max-w-2xl space-y-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-500 mt-8">
                <LoanScoreDisplay score={analysisResult.loanScore} recommendedAmount={analysisResult.recommendedAmount} />
                
                {analysisResult.fraud && <FraudDetectionResult result={analysisResult.fraud} />}
                
                {analysisResult.inconsistency.isInconsistent && !analysisResult.suggestions.some(s => s.toLowerCase().includes('financial claims')) && (
                  <CorrectiveSuggestions suggestions={[`Inconsistency Detected: ${analysisResult.inconsistency.explanation}`]} />
                )}

                {analysisResult.suggestions.length > 0 && (
                  <CorrectiveSuggestions suggestions={analysisResult.suggestions} />
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
