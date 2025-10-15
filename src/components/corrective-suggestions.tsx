import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

type CorrectiveSuggestionsProps = {
  suggestions: string[];
};

export function CorrectiveSuggestions({ suggestions }: CorrectiveSuggestionsProps) {
  return (
    <Card className="border-accent bg-accent/10">
      <CardHeader>
        <CardTitle className="flex items-start gap-3 font-headline text-xl text-foreground">
          <Lightbulb className="h-6 w-6 shrink-0 text-accent mt-1" />
          <span>Suggestions for Improvement</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 list-disc pl-5 text-foreground">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
