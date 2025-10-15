'use client';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export function BankMap() {
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0">
        <div className="relative w-full h-[400px] md:h-[500px]">
          <Image
            src="https://picsum.photos/seed/map/1200/500"
            alt="Map of nearby banks"
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint="map city"
            className="filter grayscale-[50%] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4 bg-black/50 rounded-lg">
              <h3 className="text-2xl font-bold text-white">Interactive Map Coming Soon</h3>
              <p className="text-white/90">For now, enjoy this placeholder view.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
