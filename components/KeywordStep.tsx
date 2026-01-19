import React, { useMemo, useState } from 'react';
import { Keyword, KeywordType } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { CheckSquare, Square, TrendingUp, AlertCircle, Loader2, Plus, Trash2, MapPin, Coins, RefreshCw, X, Check } from 'lucide-react';

interface KeywordStepProps {
  keywords: Keyword[];
  location: string;
  currencyCode: string;
  currencySymbol: string;
  toggleKeyword: (term: string) => void;
  addKeyword: (term: string, type: KeywordType) => void;
  removeKeyword: (term: string) => void;
  onRefine: (location: string, currency: string) => void;
  onNext: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export const KeywordStep: React.FC<KeywordStepProps> = ({ 
    keywords, location, currencyCode, currencySymbol, toggleKeyword, addKeyword, removeKeyword, onRefine, onNext, onBack, isProcessing 
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newType, setNewType] = useState<KeywordType>(KeywordType.Generic);
  
  // Targeting Edit State
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editLocation, setEditLocation] = useState(location);
  const [editCurrency, setEditCurrency] = useState(currencyCode);

  // Prepare data for chart
  const chartData = useMemo(() => {
    return keywords.map(k => ({
      x: k.competition,
      y: k.volume,
      z: k.cpc,
      name: k.term,
      type: k.type,
      selected: k.selected
    }));
  }, [keywords]);

  const selectedCount = keywords.filter(k => k.selected).length;

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (newKeyword.trim()) {
          addKeyword(newKeyword.trim(), newType);
          setNewKeyword('');
      }
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editLocation && editCurrency) {
          onRefine(editLocation, editCurrency);
          setIsEditingTarget(false);
      }
  };

  const handleCancelEdit = () => {
      setEditLocation(location);
      setEditCurrency(currencyCode);
      setIsEditingTarget(false);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Keyword Research</h2>
          <p className="text-gray-500 text-sm">Select keywords to build your ad groups. AI estimated metrics.</p>
        </div>
        <div className="flex space-x-3">
             <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
             <button 
                onClick={onNext} 
                disabled={selectedCount === 0 || isProcessing}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
            >
                {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
                Generate Ad Groups ({selectedCount})
            </button>
        </div>
      </div>

      {/* Targeting Settings Bar */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          {!isEditingTarget ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center">
                          <div className="bg-white p-2 rounded-full mr-3 text-indigo-600 shadow-sm">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wide">Target Location</span>
                            <span className="font-medium text-indigo-900">{location}</span>
                          </div>
                      </div>
                      <div className="h-8 w-px bg-indigo-200 hidden md:block"></div>
                      <div className="flex items-center">
                          <div className="bg-white p-2 rounded-full mr-3 text-indigo-600 shadow-sm">
                            <Coins size={18} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wide">Currency</span>
                            <span className="font-medium text-indigo-900">{currencyCode} ({currencySymbol})</span>
                          </div>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsEditingTarget(true)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                      Change Settings
                  </button>
              </div>
          ) : (
              <form onSubmit={handleRefineSubmit} className="flex flex-col md:flex-row items-end gap-4 animate-fade-in">
                  <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-indigo-500 mb-1">Target Location</label>
                      <input 
                        type="text" 
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. London, UK"
                        required
                      />
                  </div>
                  <div className="w-full md:w-48">
                      <label className="block text-xs font-bold text-indigo-500 mb-1">Currency (Code)</label>
                      <input 
                        type="text" 
                        value={editCurrency}
                        onChange={(e) => setEditCurrency(e.target.value)}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. USD, GBP"
                        required
                      />
                  </div>
                  <div className="flex items-center gap-2">
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                         {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                         Update & Refresh
                      </button>
                      <button 
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isProcessing}
                        className="p-2 bg-white text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                         <X size={18} />
                      </button>
                  </div>
              </form>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Table Column - Removed fixed height for infinite scroll effect */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible flex flex-col">
          
          {/* Add Keyword Form */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-[80px] z-30 shadow-sm">
              <form onSubmit={handleAdd} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add manual keyword..." 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as KeywordType)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                  >
                      <option value={KeywordType.Generic}>Generic</option>
                      <option value={KeywordType.Brand}>Brand</option>
                      <option value={KeywordType.Competitor}>Competitor</option>
                  </select>
                  <button 
                    type="submit"
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                      <Plus size={18} />
                  </button>
              </form>
          </div>

          <div className="flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-[145px] z-20 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vol</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CPC</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Comp</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keywords.map((k) => (
                  <tr 
                    key={k.term} 
                    className={`hover:bg-gray-50 transition-colors ${k.selected ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => toggleKeyword(k.term)}>
                      {k.selected ? <CheckSquare className="text-primary-600 h-5 w-5" /> : <Square className="text-gray-300 h-5 w-5" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{k.term}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${k.type === KeywordType.Brand ? 'bg-purple-100 text-purple-800' : 
                          k.type === KeywordType.Competitor ? 'bg-red-100 text-red-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {k.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{k.volume.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{currencySymbol}{k.cpc?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        <div className="flex items-center justify-end">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div className={`h-1.5 rounded-full ${k.competition > 60 ? 'bg-red-500' : k.competition > 30 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${k.competition}%` }}></div>
                            </div>
                            {k.competition}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => removeKeyword(k.term)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Column - Sticky position */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px] flex flex-col sticky top-24">
            <h3 className="text-lg font-bold mb-4 font-display">Competition vs Volume</h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="Competition" unit="">
                        <Label value="Competition" offset={0} position="insideBottom" />
                    </XAxis>
                    <YAxis type="number" dataKey="y" name="Volume" unit="">
                        <Label value="Volume" angle={-90} position="insideLeft" />
                    </YAxis>
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-white p-2 border border-gray-200 shadow-lg rounded text-sm">
                                    <p className="font-bold">{data.name}</p>
                                    <p>Vol: {data.y}</p>
                                    <p>Comp: {data.x}</p>
                                    <p>CPC: {currencySymbol}{data.z}</p>
                                </div>
                            );
                        }
                        return null;
                    }} />
                    <Scatter name="Keywords" data={chartData} fill="#6366f1" opacity={0.6} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <p className="text-sm text-blue-800">
                        <strong>Insight:</strong> Look for keywords in the top-left quadrant (High Volume, Low Competition) for quick wins.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};