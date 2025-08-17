import React, { useState } from 'react';
import { Edit3, Save, Mail, X } from 'lucide-react';
import { summaryAPI, emailAPI, type Summary } from '../services/api';
import toast from 'react-hot-toast';

interface SummaryEditorProps {
  summaries: Summary[];
  onSummaryUpdated: (summary: Summary) => void;
  onSummaryDeleted: (summaryId: string) => void;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summaries,
  onSummaryUpdated,
  onSummaryDeleted,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmailForm, setShowEmailForm] = useState<string | null>(null);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (summary: Summary) => {
    setEditingId(summary.id);
    setEditContent(summary.content);
  };

  const handleSave = async () => {
    if (!editingId) return;

    setIsLoading(true);
    try {
      const updated = await summaryAPI.update(editingId, editContent);
      onSummaryUpdated(updated);
      setEditingId(null);
      toast.success('Summary updated successfully!');
    } catch (error) {
      toast.error('Failed to update summary');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (summaryId: string) => {
    if (!confirm('Are you sure you want to delete this summary?')) return;

    try {
      await summaryAPI.delete(summaryId);
      onSummaryDeleted(summaryId);
      toast.success('Summary deleted');
    } catch (error) {
      toast.error('Failed to delete summary');
      console.error(error);
    }
  };

  const handleSendEmail = async (summaryId: string) => {
    const recipients = emailRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    if (!recipients.length || !emailSubject.trim()) {
      toast.error('Please enter recipients and subject');
      return;
    }

    setIsLoading(true);
    try {
      await emailAPI.sendSummary(summaryId, recipients, emailSubject);
      setShowEmailForm(null);
      setEmailRecipients('');
      setEmailSubject('');
      toast.success('Summary sent successfully!');
    } catch (error) {
      toast.error('Failed to send email');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
        No summaries generated yet. Upload a transcript and generate a summary to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary) => (
        <div key={summary.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-gray-900">AI Summary</h3>
              <p className="text-sm text-gray-500 mt-1">
                Prompt: "{summary.originalPrompt}"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Generated: {new Date(summary.generatedAt).toLocaleString()}
                {summary.lastEditedAt && (
                  <span className="ml-2">
                    • Edited: {new Date(summary.lastEditedAt).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              {editingId === summary.id ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(summary)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowEmailForm(summary.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(summary.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {editingId === summary.id ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {summary.content}
              </div>
            </div>
          )}

          {showEmailForm === summary.id && (
            <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h4 className="font-medium mb-3">Share via Email</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Recipients (comma-separated emails)"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSendEmail(summary.id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Email'}
                  </button>
                  <button
                    onClick={() => setShowEmailForm(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};