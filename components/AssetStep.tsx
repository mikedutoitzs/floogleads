import React, { useState } from 'react';
import { AdGroup, HEADLINE_LIMIT, DESCRIPTION_LIMIT, ASSET_LIMIT, MAX_HEADLINES, MAX_DESCRIPTIONS } from '../types';
import { generateAdImage } from '../services/geminiService';
import { Loader2, Image as ImageIcon, RefreshCw, Smartphone, Copy, Check } from 'lucide-react';

interface AssetStepProps {
  adGroups: AdGroup[];
  setAdGroups: React.Dispatch<React.SetStateAction<AdGroup[]>>;
  businessSummary: string;
  onNext: () => void;
  onBack: () => void;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

export const AssetStep: React.FC<AssetStepProps> = ({ adGroups, setAdGroups, businessSummary, onNext, onBack, showToast }) => {
  const [activeGroupId, setActiveGroupId] = useState(adGroups[0]?.id);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);

  const activeGroup = adGroups.find(g => g.id === activeGroupId);

  const updateAsset = (type: 'headlines' | 'descriptions' | 'callouts' | 'sitelinks' | 'structuredSnippets', index: number, value: string) => {
    if (!activeGroup) return;
    const newAssets = [...(activeGroup[type] || [])];
    newAssets[index] = value;
    setAdGroups(prev => prev.map(g => g.id === activeGroup.id ? { ...g, [type]: newAssets } : g));
  };

  const copyToClipboard = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      showToast('success', `${label} copied to clipboard`);
  };

  const handleGenerateImage = async () => {
    if (!activeGroup) return;
    setGeneratingImage(activeGroup.id);
    try {
        const image = await generateAdImage(activeGroup, businessSummary);
        if (image) {
            setAdGroups(prev => prev.map(g => g.id === activeGroup.id ? { ...g, generatedImage: image } : g));
        }
    } catch (e) {
        console.error("Image generation failed", e);
        showToast('error', "Failed to generate image.");
    } finally {
        setGeneratingImage(null);
    }
  };

  if (!activeGroup) return <div>No Ad Groups</div>;

  const renderInputSection = (
      title: string, 
      type: 'headlines' | 'descriptions' | 'callouts' | 'sitelinks' | 'structuredSnippets', 
      limit: number,
      maxItems: number
    ) => {
    
    // Ensure array has enough slots for editing if fewer are generated
    const currentItems = activeGroup[type] || [];
    const items = [...currentItems];
    if (items.length < maxItems) {
        for(let i=items.length; i<maxItems; i++) items.push("");
    }

    return (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
             <h4 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                {title} 
                <span className="text-xs font-normal normal-case text-gray-400">Max {limit} chars</span>
            </h4>
            <button 
                onClick={() => copyToClipboard(items.filter(i=>i).join('\n'), title)}
                className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                title="Copy all values"
            >
                <Copy size={14} />
            </button>
        </div>
        
        <div className="space-y-3">
            {items.map((val, idx) => (
                <div key={idx} className="relative group/input">
                    <input
                        value={val}
                        onChange={(e) => updateAsset(type, idx, e.target.value)}
                        placeholder={`${type === 'headlines' ? 'Headline' : type.slice(0, -1)} ${idx + 1}`}
                        className={`w-full p-2 pr-12 border rounded-md text-sm focus:ring-2 focus:outline-none ${val.length > limit ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-primary-200'}`}
                    />
                    <span className={`absolute right-3 top-2.5 text-xs ${val.length > limit ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {val.length}/{limit}
                    </span>
                    {val && (
                        <button 
                            onClick={() => copyToClipboard(val, 'Value')}
                            className="absolute right-14 top-2.5 text-gray-300 hover:text-primary-500 opacity-0 group-hover/input:opacity-100 transition-opacity"
                        >
                            <Copy size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    </div>
  )};

  const headlines = activeGroup.headlines || [];
  const descriptions = activeGroup.descriptions || [];
  const callouts = activeGroup.callouts || [];
  const structuredSnippets = activeGroup.structuredSnippets || [];
  const sitelinks = activeGroup.sitelinks || [];

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 h-[calc(100vh-180px)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Ad Assets</h2>
          <p className="text-gray-500 text-sm">Refine your ad copy and generate visuals.</p>
        </div>
        <div className="flex space-x-3">
             <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
             <button onClick={onNext} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Finalize & Export</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full">
        
        {/* Left: Ad Group List */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Ad Groups</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {adGroups.map(g => (
                    <button 
                        key={g.id}
                        onClick={() => setActiveGroupId(g.id)}
                        className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${activeGroupId === g.id ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        {g.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Center: Editor */}
        <div className="col-span-5 bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">Edit Assets: {activeGroup.name}</h3>
            </div>
            <div className="overflow-y-auto p-6">
                
                {renderInputSection('Headlines (15)', 'headlines', HEADLINE_LIMIT, MAX_HEADLINES)}
                {renderInputSection('Descriptions (4)', 'descriptions', DESCRIPTION_LIMIT, MAX_DESCRIPTIONS)}
                
                <div className="border-t border-gray-100 my-6 pt-6">
                    <h3 className="font-bold text-gray-800 mb-4">Extensions</h3>
                    {renderInputSection('Sitelinks', 'sitelinks', ASSET_LIMIT, 4)}
                    {renderInputSection('Callouts', 'callouts', ASSET_LIMIT, 4)}
                    {renderInputSection('Structured Snippets', 'structuredSnippets', ASSET_LIMIT, 4)}
                </div>

                {/* Image Generation */}
                <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Creative Asset</h4>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleGenerateImage}
                            disabled={generatingImage === activeGroup.id}
                            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
                        >
                            {generatingImage === activeGroup.id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                            {activeGroup.generatedImage ? 'Regenerate Image' : 'Generate AI Image'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Preview */}
        <div className="col-span-4 bg-gray-50 border border-gray-200 rounded-xl p-6 h-full flex flex-col">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-gray-500" />
                Ad Preview
             </h3>
             
             {/* Mock Google Ad */}
             <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                 <div className="flex items-center text-xs text-black mb-1">
                    <span className="font-bold">Ad</span>
                    <span className="mx-1">·</span>
                    <span className="text-gray-600">example.com/products</span>
                 </div>
                 
                 {/* Headlines - Rotate them or show first few */}
                 <div className="text-[#1a0dab] text-xl font-medium leading-tight hover:underline cursor-pointer mb-1 break-words">
                     {headlines[0] || "Headline 1"} {headlines[1] ? `| ${headlines[1]}` : ""} {headlines[2] ? `| ${headlines[2]}` : ""}
                 </div>
                 
                 {/* Descriptions + Callouts */}
                 <div className="text-sm text-gray-600 break-words leading-snug">
                     {descriptions[0] || "Description line..."}
                     {callouts.length > 0 && (
                         <span className="text-gray-500"> {callouts.slice(0, 4).join(" · ")}</span>
                     )}
                 </div>

                 {/* Structured Snippets */}
                 {structuredSnippets.length > 0 && (
                     <div className="text-sm text-gray-600 mt-1">
                         <span className="text-gray-800">Services: </span>
                         {structuredSnippets.slice(0, 4).join(", ")}
                     </div>
                 )}

                 {/* Sitelinks Mock */}
                 {sitelinks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[#1a0dab] text-sm font-medium">
                        {sitelinks.slice(0, 4).map((sl, i) => (
                            <span key={i} className="hover:underline cursor-pointer">{sl}</span>
                        ))}
                    </div>
                 )}
             </div>

             {/* Mock Display/Image Ad */}
             {activeGroup.generatedImage ? (
                 <div className="mt-4">
                     <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Display Asset</h4>
                     <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md group">
                         <img src={activeGroup.generatedImage} alt="Ad Creative" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                     </div>
                 </div>
             ) : (
                <div className="mt-4 flex-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 flex-col min-h-[150px]">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50"/>
                    <span className="text-sm">No Image Generated</span>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};