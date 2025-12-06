'use client';

import type { TimeFilter } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    currentFilter: TimeFilter;
    onFilterChange: (filter: TimeFilter) => void;
}

const filters: { label: string, value: TimeFilter }[] = [
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'All Time', value: 'allTime' },
];

export function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
    return (
        <div className="flex items-center justify-center bg-card p-2 rounded-lg border shadow-sm mb-6">
            <div className="flex space-x-2 bg-muted p-1 rounded-md">
                {filters.map(filter => (
                    <Button
                        key={filter.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => onFilterChange(filter.value)}
                        className={cn(
                            "transition-all",
                            currentFilter === filter.value
                                ? 'bg-background text-foreground shadow'
                                : 'hover:bg-background/50'
                        )}
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
