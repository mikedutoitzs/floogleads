import React from 'react';
import { CampaignState } from '../types';
import { Download, FileText, CheckCircle, RotateCcw } from 'lucide-react';
import { exportToCSV } from '../services/csvService';

interface ExportStepProps {
  data: CampaignState;
  onReset: () => void;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

export const ExportStep: React.FC<ExportStepProps> = ({ data, onReset, showToast }) => {
  
  const handleExportCSV = () => {
    exportToCSV(data);
    showToast('success', 'CSV exported successfully');
  };

  const handleExportPDF = () => {
    // Mock PDF export - in a real app would use jspdf
    alert("In a production build, this would download a designed PDF using jspdf or a backend service.");
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4 text-center animate-fade-in">
      <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Campaign Ready!</h2>
      <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
        Your Google Ads campaign for <strong>{data.url}</strong> has been structured with {data.adGroups.length} ad groups and {data.keywords.filter(k => k.selected).length} targeted keywords.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
        <button 
            onClick={handleExportCSV}
            className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary-300 group"
        >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Google Ads Editor (CSV)</h3>
            <p className="text-gray-500 text-sm">Download a CSV file formatted for direct import into Google Ads Editor.</p>
        </button>

        <button 
            onClick={handleExportPDF}
            className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-red-300 group"
        >
            <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Download size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Client Approval (PDF)</h3>
            <p className="text-gray-500 text-sm">Export a beautifully formatted PDF report containing all assets for review.</p>
        </button>
      </div>

      <div className="border-t border-gray-200 pt-10">
          <button 
            onClick={onReset}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
              <RotateCcw className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
              Start New Campaign
          </button>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200 text-left">
          <h4 className="font-bold text-gray-700 mb-4">Campaign Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                  <span className="block text-xs text-gray-500 uppercase">Target URL</span>
                  <span className="font-medium text-gray-900 truncate block">{data.url}</span>
              </div>
              <div>
                  <span className="block text-xs text-gray-500 uppercase">Location</span>
                  <span className="font-medium text-gray-900">{data.location}</span>
              </div>
              <div>
                  <span className="block text-xs text-gray-500 uppercase">Keywords</span>
                  <span className="font-medium text-gray-900">{data.keywords.filter(k=>k.selected).length} Selected</span>
              </div>
              <div>
                  <span className="block text-xs text-gray-500 uppercase">Ad Groups</span>
                  <span className="font-medium text-gray-900">{data.adGroups.length} Created</span>
              </div>
          </div>
      </div>
    </div>
  );
};