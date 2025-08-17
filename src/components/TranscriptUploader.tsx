import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { transcriptAPI, type Transcript } from '../services/api';
import toast from 'react-hot-toast';

interface TranscriptUploaderProps {
  onTranscriptUploaded: (transcript: Transcript) => void;
}

export const TranscriptUploader: React.FC<TranscriptUploaderProps> = ({ onTranscriptUploaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  const handleTextUpload = async () => {
    if (!textContent.trim()) {
      toast.error('Please enter transcript content');
      return;
    }

    setIsLoading(true);
    try {
      const transcript = await transcriptAPI.uploadText(textContent);
      onTranscriptUploaded(transcript);
      setTextContent('');
      toast.success('Transcript uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload transcript');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('text')) {
      toast.error('Please upload a text file');
      return;
    }

    setIsLoading(true);
    try {
      const transcript = await transcriptAPI.uploadFile(file);
      onTranscriptUploaded(transcript);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Meeting Transcript</h2>
      
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'text'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Text Input
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'file'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          File Upload
        </button>
      </div>

      {activeTab === 'text' && (
        <div>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleTextUpload}
            disabled={isLoading || !textContent.trim()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Uploading...' : 'Upload Transcript'}
          </button>
        </div>
      )}

      {activeTab === 'file' && (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Choose a text file to upload</p>
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {isLoading && (
            <div className="mt-3 flex items-center text-blue-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading file...
            </div>
          )}
        </div>
      )}
    </div>
  );
};