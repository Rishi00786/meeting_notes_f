// src/App.tsx
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { FileText, Bot, Mail } from 'lucide-react';
import { TranscriptUploader } from './components/TranscriptUploader';
import { SummaryGenerator } from './components/SummaryGenerator';
import { SummaryEditor } from './components/SummaryEditor';
import { transcriptAPI, summaryAPI, type Transcript, type Summary } from './services/api';

function App() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'generate' | 'edit'>('upload');
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [transcriptData, summaryData] = await Promise.all([
          transcriptAPI.getAll(),
          summaryAPI.getAll(),
        ]);
        setTranscripts(transcriptData);
        setSummaries(summaryData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTranscriptUploaded = (transcript: Transcript) => {
    setTranscripts(prev => [transcript, ...prev]);
    setActiveTab('generate');
  };

  const handleSummaryGenerated = (summary: Summary) => {
    setSummaries(prev => [summary, ...prev]);
    setActiveTab('edit');
  };

  const handleSummaryUpdated = (updatedSummary: Summary) => {
    setSummaries(prev =>
      prev.map(summary =>
        summary.id === updatedSummary.id ? updatedSummary : summary
      )
    );
  };

  const handleSummaryDeleted = (summaryId: string) => {
    setSummaries(prev => prev.filter(summary => summary.id !== summaryId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: FileText, count: transcripts.length },
    { id: 'generate' as const, label: 'Generate', icon: Bot, count: null },
    { id: 'edit' as const, label: 'Summaries', icon: Mail, count: summaries.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              AI Meeting Notes Summarizer
            </h1>
            <p className="mt-2 text-gray-600">
              Upload transcripts, generate AI summaries, and share them via email
            </p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'upload' && (
              <TranscriptUploader onTranscriptUploaded={handleTranscriptUploaded} />
            )}

            {activeTab === 'generate' && (
              <SummaryGenerator
                transcripts={transcripts}
                onSummaryGenerated={handleSummaryGenerated}
              />
            )}

            {activeTab === 'edit' && (
              <SummaryEditor
                summaries={summaries}
                onSummaryUpdated={handleSummaryUpdated}
                onSummaryDeleted={handleSummaryDeleted}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transcripts</span>
                  <span className="font-semibold text-blue-600">{transcripts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Summaries</span>
                  <span className="font-semibold text-green-600">{summaries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-purple-600">
                    {transcripts.length > 0 ? Math.round((summaries.length / transcripts.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Transcripts */}
            {transcripts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transcripts</h3>
                <div className="space-y-3">
                  {transcripts.slice(0, 3).map((transcript) => (
                    <div
                      key={transcript.id}
                      className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setActiveTab('generate')}
                    >
                      <p className="text-sm text-gray-900 truncate">
                        {transcript.content.substring(0, 80)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transcript.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  📄 Upload new transcript
                </button>
                {transcripts.length > 0 && (
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    🤖 Generate summary
                  </button>
                )}
                {summaries.length > 0 && (
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    ✏️ Edit summaries
                  </button>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Upload your meeting transcript</li>
                <li>2. Choose a summarization style</li>
                <li>3. Generate AI summary</li>
                <li>4. Edit and refine the summary</li>
                <li>5. Share via email</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>AI Meeting Notes Summarizer - Built with React, NestJS & Groq</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;