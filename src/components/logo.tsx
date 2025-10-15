import { Landmark } from 'lucide-react';
import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex items-center justify-center gap-3">
      <Landmark className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-4xl font-bold text-foreground">
        LoanPilot
      </h1>
    </div>
  );
};
