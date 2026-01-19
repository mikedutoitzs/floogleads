import React, { useState, useEffect } from 'react';
import { CampaignState, Keyword, KeywordType } from './types';
import { extractContentAndAnalyze, generateAdGroupsStructure } from './services/geminiService';
import { StepWizard } from './components/StepWizard';
import { InputStep } from './components/InputStep';
import { KeywordStep } from './components/KeywordStep';
import { AdGroupStep } from './components/AdGroupStep';
import { AssetStep } from './components/AssetStep';
import { ExportStep } from './components/ExportStep';
import { ToastContainer, ToastMessage } from './components/Toast';

const STEPS = ['Setup', 'Keywords', 'Ad Groups', 'Assets', 'Export'];
const STORAGE_KEY = 'adcraft_state_v1';

const DEFAULT_STATE: CampaignState = {
  step: 1,
  url: '',
  location: '',
  description: '',
  extractedInfo: null,
  keywords: [],
  adGroups: [],
  isProcessing: false,
  processStatus: '',
};

export default function App() {
  // Initialize state from local storage or default
  const [state, setState] = useState<CampaignState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_STATE;
      
      const parsed = JSON.parse(saved);
      
      // Migration/Sanitization: Ensure new array fields exist on old saved data
      if (parsed.adGroups && Array.isArray(parsed.adGroups)) {
          parsed.adGroups = parsed.adGroups.map((g: any) => ({
              ...g,
              headlines: g.headlines || [],
              descriptions: g.descriptions || [],
              // Deprecated field safety
              longDescriptions: g.longDescriptions || [], 
              // New fields
              callouts: g.callouts || [],
              sitelinks: g.sitelinks || [],
              structuredSnippets: g.structuredSnippets || [],
              keywords: g.keywords || []
          }));
      }
      return parsed;
    } catch (e) {
      console.error("Failed to load state", e);
      return DEFAULT_STATE;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Smooth scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.step]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to start over? All current progress will be lost.")) {
        setState(DEFAULT_STATE);
        localStorage.removeItem(STORAGE_KEY);
        showToast('success', 'Started new campaign');
    }
  };

  const handleStepClick = (step: number) => {
      setState(s => ({ ...s, step }));
  };

  // Step 1 -> 2
  const handleAnalyzeSite = async () => {
    setState(s => ({ ...s, isProcessing: true, processStatus: 'Analyzing website & gathering currency data...' }));
    try {
      const data = await extractContentAndAnalyze(state.url, state.location);
      setState(s => ({
        ...s,
        step: 2,
        isProcessing: false,
        extractedInfo: { 
            title: data.title, 
            summary: data.summary,
            currency: data.currency,
            currencySymbol: data.currencySymbol
        },
        keywords: data.keywords?.map((k: any) => ({ ...k, selected: true })) || []
      }));
    } catch (error) {
      console.error(error);
      showToast('error', "Failed to analyze website. Please check URL or API key.");
      setState(s => ({ ...s, isProcessing: false }));
    }
  };

  const handleRefineTargeting = async (newLocation: string, newCurrency: string) => {
      setState(s => ({ ...s, isProcessing: true, processStatus: 'Refining targeting & updating metrics...' }));
      try {
          const data = await extractContentAndAnalyze(state.url, newLocation, newCurrency);
          setState(s => ({
              ...s,
              location: newLocation,
              isProcessing: false,
              extractedInfo: {
                  ...(s.extractedInfo!),
                  title: data.title, // Update title/summary as they might be locale specific
                  summary: data.summary,
                  currency: data.currency,
                  currencySymbol: data.currencySymbol
              },
              keywords: data.keywords?.map((k: any) => ({ ...k, selected: true })) || []
          }));
          showToast('success', 'Targeting updated successfully');
      } catch (e) {
          console.error(e);
          showToast('error', 'Failed to update targeting');
          setState(s => ({...s, isProcessing: false}));
      }
  };

  // Step 2 -> 3
  const handleGenerateGroups = async () => {
    setState(s => ({ ...s, isProcessing: true, processStatus: 'Structuring ad groups...' }));
    try {
      const groups = await generateAdGroupsStructure(state.keywords, state.extractedInfo?.summary || '');
      setState(s => ({
        ...s,
        step: 3,
        isProcessing: false,
        adGroups: groups
      }));
    } catch (error) {
        console.error(error);
        showToast('error', "Failed to generate groups. Please try again.");
        setState(s => ({ ...s, isProcessing: false }));
    }
  };

  const toggleKeyword = (term: string) => {
    setState(s => ({
      ...s,
      keywords: s.keywords.map(k => k.term === term ? { ...k, selected: !k.selected } : k)
    }));
  };

  const addKeyword = (term: string, type: KeywordType) => {
      const newKw: Keyword = {
          term,
          type,
          volume: 0,
          competition: 0,
          relevance: 100,
          cpc: 0,
          selected: true
      };
      setState(s => ({ ...s, keywords: [newKw, ...s.keywords] }));
      showToast('success', 'Keyword added');
  };

  const removeKeyword = (term: string) => {
      setState(s => ({ ...s, keywords: s.keywords.filter(k => k.term !== term) }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold">
                A
            </div>
            <h1 className="text-xl font-display font-bold text-gray-900">AdCraft AI</h1>
        </div>
        <div className="flex items-center space-x-4">
             {state.step > 1 && (
                 <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                     Start New
                 </button>
             )}
        </div>
      </header>

      <StepWizard currentStep={state.step} steps={STEPS} onStepClick={handleStepClick} />

      <main className="flex-1 relative">
         <ToastContainer toasts={toasts} removeToast={removeToast} />
         
         {state.isProcessing && (
             <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center fixed">
                 <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-lg font-medium text-gray-700">{state.processStatus}</p>
             </div>
         )}

         {state.step === 1 && (
            <InputStep 
                url={state.url} setUrl={u => setState(s => ({...s, url: u}))}
                location={state.location} setLocation={l => setState(s => ({...s, location: l}))}
                onNext={handleAnalyzeSite}
                isProcessing={state.isProcessing}
            />
         )}

         {state.step === 2 && (
            <KeywordStep 
                keywords={state.keywords}
                location={state.location}
                currencyCode={state.extractedInfo?.currency || 'GBP'}
                currencySymbol={state.extractedInfo?.currencySymbol || '£'}
                toggleKeyword={toggleKeyword}
                addKeyword={addKeyword}
                removeKeyword={removeKeyword}
                onRefine={handleRefineTargeting}
                onNext={handleGenerateGroups}
                onBack={() => setState(s => ({ ...s, step: 1 }))}
                isProcessing={state.isProcessing}
            />
         )}

         {state.step === 3 && (
            <AdGroupStep 
                adGroups={state.adGroups}
                setAdGroups={(fn) => setState(s => ({...s, adGroups: typeof fn === 'function' ? fn(s.adGroups) : fn }))}
                onNext={() => setState(s => ({ ...s, step: 4 }))}
                onBack={() => setState(s => ({ ...s, step: 2 }))}
            />
         )}

         {state.step === 4 && (
            <AssetStep 
                adGroups={state.adGroups}
                setAdGroups={(fn) => setState(s => ({...s, adGroups: typeof fn === 'function' ? fn(s.adGroups) : fn }))}
                businessSummary={state.extractedInfo?.summary || ''}
                onNext={() => setState(s => ({ ...s, step: 5 }))}
                onBack={() => setState(s => ({ ...s, step: 3 }))}
                showToast={showToast}
            />
         )}

         {state.step === 5 && (
            <ExportStep data={state} onReset={handleReset} showToast={showToast} />
         )}
      </main>
    </div>
  );
}