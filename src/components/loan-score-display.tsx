import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type LoanScoreDisplayProps = {
  score: number;
  recommendedAmount: number;
};

const getScoreColor = (score: number) => {
    if (score > 70) return 'text-[hsl(var(--chart-2))]'; // green
    if (score > 40) return 'text-[hsl(var(--chart-4))]'; // yellow
    return 'text-destructive'; // red
};

export function LoanScoreDisplay({ score, recommendedAmount }: LoanScoreDisplayProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Loan Profile</CardTitle>
        <CardDescription>Based on the information you provided.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-lg font-semibold font-body">Eligibility Score</h3>
            <span className={`text-3xl font-bold font-headline ${getScoreColor(score)}`}>{score} / 100</span>
          </div>
          <Progress value={score} />
          <p className="text-sm text-muted-foreground mt-2">
            This score estimates your eligibility based on your income, debt, and credit history.
          </p>
        </div>
        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-lg font-semibold font-body">Recommended Loan Amount</h3>
          <p className="text-4xl font-bold text-primary font-headline">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(recommendedAmount)}
          </p>
          <p className="text-sm text-muted-foreground">
            An estimated amount you could comfortably borrow. This is not a loan offer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
