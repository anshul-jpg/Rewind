'use client';

import { useRef, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

type FileUploaderProps = {
  onProcess: (files: FileList) => void;
};

export function FileUploader({ onProcess }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onProcess(event.target.files);
    }
  }, [onProcess]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onProcess(event.dataTransfer.files);
    }
  }, [onProcess]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full bg-card p-8 rounded-lg border shadow-sm text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Get Started</h2>
        <p className="text-muted-foreground">
          Upload your YouTube history file to begin.
        </p>
      </div>

      <div
        className="relative w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <UploadCloud className="w-12 h-12 mb-4" />
        <p className="font-semibold">Click to select your `Takeout` folder</p>
        <p className="text-sm">Or drag and drop the folder here</p>
        <input
          type="file"
          ref={fileInputRef}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          onChange={handleFileChange}
          // @ts-ignore
          webkitdirectory="true"
          mozdirectory="true"
          directory="true"
        />
      </div>

      <div className="text-left text-sm text-muted-foreground mt-6 space-y-2">
        <p className="font-semibold">How to get your YouTube data:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Visit <a href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Google Takeout</a></li>
          <li>Deselect all products, scroll down and select only "YouTube and YouTube Music"</li>
          <li>Click on "Multiple formats", scroll to "history", select "JSON" and click "OK"</li>
          <li>Click "Next step" and choose your export preferences</li>
          <li>Click "Create export" and wait for Google to prepare your data</li>
          <li>Download your data when ready and extract the ZIP file</li>
          <li>Upload the Takeout folder here</li>
        </ol>
      </div>

    </div>
  );
}
