'use client';

import type { AdvancedStatsData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, Sun, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export function AdvancedStats({ data }: { data: AdvancedStatsData }) {

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  }
  
  return (
     <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-muted-foreground"/>
            Advanced Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mb-2 text-primary"/>
                <p className="text-2xl font-bold">{data.avgVideosPerDay.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg. Videos / Day</p>
            </div>
             <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-6 w-6 mb-2 text-primary"/>
                <p className="text-lg font-bold">{format(new Date(data.mostActiveDate.date), "MMM d")}</p>
                <p className="text-xs text-muted-foreground">Most Active Day ({data.mostActiveDate.views} videos)</p>
            </div>
             <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mb-2 text-primary"/>
                <p className="text-2xl font-bold">{formatHour(data.favoriteHour)}</p>
                <p className="text-xs text-muted-foreground">Favorite Watch Time</p>
            </div>
             <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Sun className="h-6 w-6 mb-2 text-primary"/>
                <p className="text-2xl font-bold">{data.favoriteDay}</p>
                <p className="text-xs text-muted-foreground">Favorite Day of Week</p>
            </div>
        </CardContent>
    </Card>
  );
}
