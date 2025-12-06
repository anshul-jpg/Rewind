'use client';

import type { ProcessedData, TimeFilter } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Film, BarChart2, Ghost, TrendingUp, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { AdvancedStats } from '@/components/AdvancedStats';
import { FilterBar } from '@/components/FilterBar';
import { Label } from '@/components/ui/label';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TopContentCard } from './TopContentCard';

const CustomLineChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-3 shadow-sm text-popover-foreground">
        <p className="text-sm font-medium">{format(new Date(label), "PP")}</p>
        <p className="text-base font-bold">
          {Math.round(payload[0].value).toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground"> minutes</span>
        </p>
      </div>
    );
  }
  return null;
};

export function Dashboard({ data, timeFilter, onTimeFilterChange, onDurationChange, minDuration }: { data: ProcessedData, timeFilter: TimeFilter, onTimeFilterChange: (filter: TimeFilter) => void, onDurationChange: (checked: boolean) => void, minDuration: number }) {
  const {
    totalMinutes,
    totalVideos,
    topChannels,
    topVideos,
    dailyWatchData,
    ghostChannels,
    advancedStats,
  } = data;
  const totalDays = (totalMinutes / (60 * 24)).toFixed(1);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    const checkboxes = document.querySelectorAll<HTMLButtonElement>('table [role="checkbox"]');
    checkboxes.forEach(cb => {
      const isChecked = cb.dataset.state === 'checked';
      if ((checked && !isChecked) || (!checked && isChecked)) {
        cb.click();
      }
    });
  }

  return (
    <div className="space-y-6">

      <FilterBar 
        currentFilter={timeFilter} 
        onFilterChange={onTimeFilterChange}
      />

      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-center text-2xl md:text-4xl">
            You watched <span className="font-extrabold">{totalDays}</span> days of YouTube.
          </CardTitle>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
              <div className="flex items-center gap-2">
                 <TooltipProvider>
                  <UiTooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">We estimate watch time by measuring the time between videos, capped at 60 minutes per gap.</p>
                    </TooltipContent>
                  </UiTooltip>
                </TooltipProvider>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMinutes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">minutes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos Watched</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVideos.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">videos from your history</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Clock className="h-5 w-5 text-red-500"/>
                    Watch Duration
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <Checkbox id="duration-filter" checked={minDuration > 0} onCheckedChange={(checked) => onDurationChange(!!checked)} />
                <Label htmlFor="duration-filter" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Only include videos watched for at least 2 minutes</Label>
              </div>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {advancedStats && (
            <AdvancedStats data={advancedStats} />
        )}
        
        <TopContentCard topChannels={topChannels} topVideos={topVideos} />

        {dailyWatchData && dailyWatchData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                Daily Watch Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyWatchData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    minTickGap={30}
                    tickFormatter={(value) => format(new Date(value), "MMM yy")}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomLineChartTooltip />} />
                  <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {ghostChannels && ghostChannels.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ghost className="h-5 w-5 text-muted-foreground" />
                The Purge List: Ghost Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">You're subscribed but haven't watched them.</p>
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[10px]">
                        <Checkbox 
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all rows"
                        />
                      </TableHead>
                      <TableHead>Channel Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ghostChannels.map((channel, index) => (
                      <TableRow key={index}>
                        <TableCell><Checkbox id={`purge-${index}`} aria-label={`Select ${channel.name}`} /></TableCell>
                        <TableCell className="font-medium">{channel.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
      
    </div>
  );
}
