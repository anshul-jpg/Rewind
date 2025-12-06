'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Rewind as RewindIcon } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dashboard } from '@/components/Dashboard';
import type { ProcessedData, TimeFilter } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Youtube } from 'lucide-react';

export default function Home() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('lastYear');
  const [uploadedFiles, setUploadedFiles] = useState<File[] | null>(null);
  const [minDuration, setMinDuration] = useState<number>(2);

  const workerRef = useRef<Worker | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/data.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'progress') {
        setProgress(payload.progress);
        setProgressMessage(payload.message);
      } else if (type === 'result') {
        setProcessedData(payload);
        setIsProcessing(false);
        setError(null);
        toast({
          title: "Analysis Complete!",
          description: "Your YouTube Rewind is ready.",
        });
      } else if (type === 'error') {
        console.error('Worker Error:', payload);
        setError(payload);
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: "An error occurred during processing",
          description: payload,
        });
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [toast]);

  const handleProcess = useCallback((files: File[] | null, filter: TimeFilter, duration: number) => {
    if (!workerRef.current || !files) return;

    setIsProcessing(true);
    setProcessedData(null);
    setError(null);
    setProgress(0);
    setProgressMessage('Starting analysis...');

    const fileDetails = files.map(file => ({
      name: file.name,
      content: file,
    }));

    workerRef.current.postMessage({ files: fileDetails, filter, minDuration: duration });
  }, []);

  const handleFileChange = useCallback((files: File[]) => {
    const fileArray = files.filter(file =>
      file.name.toLowerCase().endsWith('watch-history.json') ||
      file.name.toLowerCase().endsWith('subscriptions.csv') ||
      file.name.toLowerCase().endsWith('watch-history.html')
    );

    if (fileArray.length === 0 && files.length > 0) {
      toast({
        variant: "destructive",
        title: "No relevant files found",
        description: "We found files, but not 'watch-history.json'. Please ensure you selected the correct Google Takeout folder.",
      });
      return;
    }

    setUploadedFiles(fileArray);

    const initialTimeFilter: TimeFilter = 'lastYear';
    const initialMinDuration = 2;
    setTimeFilter(initialTimeFilter);
    setMinDuration(initialMinDuration);

    handleProcess(fileArray, initialTimeFilter, initialMinDuration);

  }, [handleProcess]);

  const handleTimeFilterChange = (newFilter: TimeFilter) => {
    setTimeFilter(newFilter);
    if (uploadedFiles) {
      handleProcess(uploadedFiles, newFilter, minDuration);
    }
  }

  const handleDurationFilterChange = (checked: boolean) => {
    const newMinDuration = checked ? 2 : 0;
    setMinDuration(newMinDuration);
    if (uploadedFiles) {
      handleProcess(uploadedFiles, timeFilter, newMinDuration);
    }
  }

  const handleReset = () => {
    setProcessedData(null);
    setIsProcessing(false);
    setProgress(0);
    setProgressMessage('');
    setError(null);
    setUploadedFiles(null);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex items-center justify-center sm:justify-between mb-8">
          <div className="flex items-center gap-3">
            <RewindIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Rewind
            </h1>
          </div>
          {(processedData || isProcessing || error) && (
            <Button onClick={handleReset} variant="outline">Start Over</Button>
          )}
        </header>

        <main>
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-border rounded-lg h-96">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
              <p className="text-lg font-semibold text-foreground mb-4">
                Analyzing your history...
              </p>
              <Progress value={progress} className="w-full max-w-md mb-2" />
              <p className="text-sm text-muted-foreground w-full max-w-md truncate">
                {progressMessage}
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <Youtube className="h-4 w-4" />
              <AlertTitle>Processing Error</AlertTitle>
              <AlertDescription>
                {error} Please ensure you've uploaded the correct file from Google Takeout.
              </AlertDescription>
            </Alert>
          ) : processedData ? (
            <Dashboard
              data={processedData}
              timeFilter={timeFilter}
              onTimeFilterChange={handleTimeFilterChange}
              onDurationChange={handleDurationFilterChange}
              minDuration={minDuration}
            />
          ) : (
            <FileUploader onProcess={handleFileChange} />
          )}
        </main>

        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>
            Find out just how deep the YouTube rabbit hole goes.
          </p>
        </footer>
      </div>
    </div>
  );
}
