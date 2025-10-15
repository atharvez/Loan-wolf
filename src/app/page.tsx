'use client';

import { useState } from 'react';
import { LoanApplicationForm } from '@/components/loan-application-form';
import type { AnalysisResult, AgreementAnalysisResult } from '@/lib/types';
import { LoanScoreDisplay } from '@/components/loan-score-display';
import { FraudDetectionResult } from '@/components/fraud-detection-result';
import { CorrectiveSuggestions } from '@/components/corrective-suggestions';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';
import { Map, FileScan } from 'lucide-react';
import { BankMap } from '@/components/bank-map';
import Image from 'next/image';
import { LoanAgreementAnalyzer } from '@/components/loan-agreement-analyzer';

function ResultsSkeleton() {
  return (
    <div className="w-full max-w-4xl space-y-6 mt-8">
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
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
      <header className="w-full bg-card border-b p-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <Logo />
      </header>

      <section className="w-full bg-secondary/50 py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-headline font-bold text-foreground">
            Smarter Loan Applications, Instantly
          </h1>
          <p className="mt-4 text-xl text-muted-foreground font-body max-w-2xl mx-auto">
            Calculate your loan eligibility, detect issues, and get guided feedback to improve your application before you even apply.
          </p>
        </div>
      </section>

      <div className="flex flex-col items-center gap-16 w-full p-4 sm:p-8 md:p-12">
        <div id="application-form" className="w-full max-w-4xl">
           <LoanApplicationForm 
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
          />
        </div>
        
        {showResults && (
           <div className="w-full max-w-4xl">
            {isLoading && <ResultsSkeleton />}
            
            {!isLoading && analysisResult && (
              <div className="w-full space-y-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
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

        <section id="agreement-analyzer-section" className="w-full max-w-4xl space-y-8 text-center">
          <FileScan className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-4xl font-headline font-bold mt-4">Analyze Your Loan Agreement</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Already have a loan offer? Upload the agreement PDF to let our AI scan for high-risk clauses and ambiguous terms before you sign.
          </p>
          <LoanAgreementAnalyzer />
        </section>
        
        <section id="map-section" className="w-full max-w-6xl space-y-8">
            <div className="text-center">
                <Map className="h-12 w-12 mx-auto text-primary" />
                <h2 className="text-4xl font-headline font-bold mt-4">Find a Branch Near You</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Explore our partner bank locations. While our application process is fully digital, we have physical branches for your convenience.
                </p>
            </div>
            <BankMap />
        </section>

      </div>
      
      <footer className="w-full bg-card border-t p-8 mt-16 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LoanPilot. All rights reserved.</p>
          <p className="text-sm mt-2">Your partner in financial clarity.</p>
      </footer>
    </main>
  );
}
