import React from 'react';
import { INTERVENTIONS } from '../constants';
import { ScenarioIntervention } from '../types';

interface ScenarioControlsProps {
  selectedInterventions: ScenarioIntervention[];
  onToggleIntervention: (intervention: ScenarioIntervention) => void;
}

const ScenarioControls: React.FC<ScenarioControlsProps> = ({ selectedInterventions, onToggleIntervention }) => {
  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Apply Interventions</h3>
      <div className="grid grid-cols-1 gap-2">
        {INTERVENTIONS.map((item) => {
          const isActive = selectedInterventions.some(i => i.type === item.type);
          return (
            <button
              key={item.type}
              onClick={() => onToggleIntervention(item)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                isActive 
                  ? 'bg-clean-500/20 border-clean-500 text-clean-400' 
                  : 'bg-space-800 border-space-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span className="text-sm font-medium">{item.label}</span>
              <div className={`w-4 h-4 rounded-full border ${isActive ? 'bg-clean-500 border-clean-500' : 'border-gray-500'}`} />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        *Select factors to simulate future air quality scenarios.
      </p>
    </div>
  );
};

export default ScenarioControls;
