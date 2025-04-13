
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [markdown, setMarkdown] = useState('');

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card
        className={`p-8 border-2 border-dashed ${
          isDragging ? 'border-primary' : 'border-gray-300'
        } rounded-lg text-center`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">
          Drop your file here or click to upload
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Supports PDF, Word, PowerPoint, and Excel files
        </p>
        <input
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx"
          id="fileInput"
        />
        <Button
          onClick={() => document.getElementById('fileInput')?.click()}
          variant="outline"
        >
          Select File
        </Button>
      </Card>
      
      {markdown && (
        <Card className="mt-4 p-4">
          <h4 className="font-semibold mb-2">Converted Markdown:</h4>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {markdown}
          </pre>
        </Card>
      )}
    </div>
  );
}
