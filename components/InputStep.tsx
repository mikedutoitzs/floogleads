import React from 'react';
import { Globe, MapPin, Loader2 } from 'lucide-react';

interface InputStepProps {
  url: string;
  setUrl: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  onNext: () => void;
  isProcessing: boolean;
}

export const InputStep: React.FC<InputStepProps> = ({
  url,
  setUrl,
  location,
  setLocation,
  onNext,
  isProcessing,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && location) onNext();
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">Start Your Campaign</h2>
        <p className="text-gray-500">Enter your website details to automatically extract content and generate ads.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Location</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, NY or United States"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Analyzing Website...
            </>
          ) : (
            'Extract & Analyze'
          )}
        </button>
      </form>
    </div>
  );
};