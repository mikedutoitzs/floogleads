import React from 'react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface StepWizardProps {
  currentStep: number;
  steps: string[];
  onStepClick: (step: number) => void;
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="w-full py-6 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            const isClickable = stepNum < currentStep;

            return (
              <React.Fragment key={step}>
                <div 
                    className={`flex items-center space-x-2 ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    onClick={() => isClickable && onStepClick(stepNum)}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${
                      isActive
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : <span className="text-sm font-bold">{stepNum}</span>}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      isActive ? 'text-primary-800' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200 relative">
                    <div 
                        className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500" 
                        style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};