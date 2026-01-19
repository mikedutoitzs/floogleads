import React from 'react';
import { AdGroup } from '../types';
import { Edit2, Layers, Trash2 } from 'lucide-react';

interface AdGroupStepProps {
  adGroups: AdGroup[];
  setAdGroups: React.Dispatch<React.SetStateAction<AdGroup[]>>;
  onNext: () => void;
  onBack: () => void;
}

export const AdGroupStep: React.FC<AdGroupStepProps> = ({ adGroups, setAdGroups, onNext, onBack }) => {
  
  const handleNameChange = (id: string, newName: string) => {
    setAdGroups(prev => prev.map(g => g.id === id ? { ...g, name: newName } : g));
  };

  const removeGroup = (id: string) => {
      setAdGroups(prev => prev.filter(g => g.id !== id));
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Ad Group Structure</h2>
          <p className="text-gray-500 text-sm">Review how AI has grouped your keywords.</p>
        </div>
        <div className="flex space-x-3">
             <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
             <button onClick={onNext} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Review Assets</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group transition-all hover:shadow-md">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => removeGroup(group.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                </button>
            </div>
            
            <div className="flex items-center mb-4">
              <Layers className="text-primary-500 mr-2 h-5 w-5" />
              <input 
                value={group.name}
                onChange={(e) => handleNameChange(group.id, e.target.value)}
                className="font-bold text-lg text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none bg-transparent w-full"
              />
              <Edit2 className="h-4 w-4 text-gray-300 ml-2" />
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Target Keywords ({(group.keywords || []).length})</h4>
              <div className="flex flex-wrap gap-2">
                {(group.keywords || []).slice(0, 5).map(k => (
                  <span key={k} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                    {k}
                  </span>
                ))}
                {(group.keywords || []).length > 5 && (
                    <span className="px-2 py-1 text-xs text-gray-500">+{(group.keywords || []).length - 5} more</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Includes {(group.headlines || []).length} headlines & {(group.descriptions || []).length} descriptions.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};