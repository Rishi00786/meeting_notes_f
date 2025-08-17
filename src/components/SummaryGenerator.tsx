import React, { useState } from 'react';
import { Bot, Loader2, Wand2 } from 'lucide-react';
import { summaryAPI, type Summary, type Transcript } from '../services/api';
import toast from 'react-hot-toast';

interface SummaryGeneratorProps {
  transcripts: Transcript[];
  onSummaryGenerated: (summary: Summary) => void;
}

export const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ 
  transcripts, 
  onSummaryGenerated 
}) => {
  const [selectedTranscript, setSelectedTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const promptSuggestions = [
    'Summarize in bullet points for executives',
    'Extract all action items and deadlines',
    'Create meeting minutes with key decisions',
    'Highlight important discussion points',
    'List participants and their contributions',
  ];

  const handleGenerate = async () => {
    if (!selectedTranscript || !customPrompt.trim()) {
      toast.error('Please select a transcript and enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const summary = await summaryAPI.generate(selectedTranscript, customPrompt);
      onSummaryGenerated(summary);
      toast.success('Summary generated successfully!');
    } catch (error) {
      toast.error('Failed to generate summary');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Bot className="w-5 h-5 mr-2 text-blue-600" />
        Generate AI Summary
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Transcript
          </label>
          <select
            value={selectedTranscript}
            onChange={(e) => setSelectedTranscript(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a transcript...</option>
            {transcripts.map((transcript) => (
              <option key={transcript.id} value={transcript.id}>
                {transcript.content.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Instructions
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="How would you like the meeting to be summarized?"
            className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setCustomPrompt(suggestion)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedTranscript || !customPrompt.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Summary
            </>
          )}
        </button>
      </div>
    </div>
  );
};