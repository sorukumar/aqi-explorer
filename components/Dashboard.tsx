import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { AppMode, AIResponse, ScenarioIntervention, CityData } from '../types';
import { CITIES, MOCK_TIMESERIES, TOOLTIPS } from '../constants';
import { generateAnalysis } from '../services/geminiService';
import { Activity, Map, Loader2, Zap, Skull, Heart, Shield, Globe, Wind, Trophy, Info, Search, Shuffle, HelpCircle, X } from 'lucide-react';
import ScenarioControls from './ScenarioControls';

interface DashboardProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  activeCityId: string;
  setActiveCityId: (id: string) => void;
  compareCityId?: string;
  setCompareCityId: (id: string | undefined) => void;
}

// Reusable Components for clean structure

const StatCard = ({ label, value, unit, subtext, color = "text-white", tooltipKey }: { label: string, value: string | number, unit?: string, subtext?: string, color?: string, tooltipKey?: string }) => (
  <div className="bg-space-900/40 backdrop-blur-md border border-white/10 p-3 rounded-lg flex flex-col justify-between hover:border-white/20 transition-all group relative">
     {tooltipKey && (
       <div className="absolute top-2 right-2 text-gray-600 hover:text-clean-400 cursor-help group/icon">
          <Info size={12} />
          {/* Tooltip Popup */}
          <div className="absolute right-0 top-6 w-48 bg-space-800 border border-white/20 p-3 rounded-lg shadow-xl opacity-0 group-hover/icon:opacity-100 pointer-events-none transition-opacity z-50">
             <h4 className="text-[10px] font-bold text-clean-500 uppercase mb-1">{(TOOLTIPS as any)[tooltipKey].title}</h4>
             <p className="text-[10px] text-gray-300 leading-tight">{(TOOLTIPS as any)[tooltipKey].text}</p>
          </div>
       </div>
     )}
    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1 group-hover:text-gray-300">{label}</div>
    <div className="flex items-baseline">
      <span className={`text-2xl font-black ${color} tracking-tight`}>{value}</span>
      {unit && <span className="text-xs text-gray-500 ml-1 font-mono">{unit}</span>}
    </div>
    {subtext && <div className="text-[10px] text-gray-500 mt-1 font-mono">{subtext}</div>}
  </div>
);

const HealthBar = ({ hp, label }: { hp: number, label?: string }) => (
  <div className="w-full">
    {label && <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono uppercase"><span>{label}</span><span>{hp}% Integrity</span></div>}
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative group cursor-help">
      <div className="absolute top-0 bottom-0 left-[98%] w-0.5 bg-white z-10 shadow-[0_0_5px_white]"></div> {/* Pole Marker */}
      <div 
        className={`h-full transition-all duration-700 ease-out ${hp > 80 ? 'bg-clean-500 shadow-[0_0_10px_#4DFFB8]' : (hp > 40 ? 'bg-yellow-500' : 'bg-toxic-500 shadow-[0_0_10px_#FF4D4D]')}`}
        style={{ width: `${hp}%` }}
      />
      {/* Tooltip on hover */}
      <div className="absolute bottom-4 left-0 w-48 bg-space-800 border border-white/20 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
         <p className="text-[9px] text-gray-300">{TOOLTIPS.hp.text}</p>
      </div>
    </div>
  </div>
);

const ComparisonRow = ({ metric, val1, val2, unit, name1, name2 }: any) => {
  const diff = val1 - val2;
  const isBetter = diff < 0; // Assuming lower is better for pollution metrics usually
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded">
      <div className="col-span-4 text-xs text-gray-400 uppercase font-bold">{metric}</div>
      <div className="col-span-3 text-right font-mono text-sm font-bold text-white">{val1} <span className="text-[9px] text-gray-600">{unit}</span></div>
      <div className="col-span-2 flex justify-center">
        <div className={`text-[9px] px-1.5 py-0.5 rounded ${isBetter ? 'bg-clean-500/20 text-clean-400' : 'bg-toxic-500/20 text-toxic-400'}`}>
          {Math.abs(diff)}
        </div>
      </div>
      <div className="col-span-3 text-right font-mono text-sm font-bold text-gray-400">{val2} <span className="text-[9px] text-gray-600">{unit}</span></div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  mode, setMode, activeCityId, setActiveCityId, compareCityId, setCompareCityId 
}) => {
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState<AIResponse | null>(null);
  const [interventions, setInterventions] = useState<ScenarioIntervention[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  const activeCity = CITIES.find(c => c.id === activeCityId) || CITIES[0];
  const secondaryCity = compareCityId ? CITIES.find(c => c.id === compareCityId) : undefined;
  
  // Filter cities based on search
  const filteredCities = CITIES.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase()) || 
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const result = await generateAnalysis({
        mode,
        primaryCityId: activeCityId,
        secondaryCityId: compareCityId,
        interventions: mode === AppMode.SCENARIO_NARRATIVE ? interventions : undefined,
        customPrompt: customPrompt
      });
      setAiData(result);
      setLoading(false);
    };

    const timer = setTimeout(() => fetchAnalysis(), 600);
    return () => clearTimeout(timer);
  }, [mode, activeCityId, compareCityId, interventions, customPrompt]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === AppMode.COMPARE_CITIES && !compareCityId) {
       handleFindOpposite();
    }
  };

  const handleFindOpposite = () => {
    // Logic: Find city with smallest longitudinal distance to (lng + 180)
    // Normalize to -180 to 180
    const targetLng = (activeCity.lng + 180) > 180 ? activeCity.lng - 180 : activeCity.lng + 180;
    
    let bestCity = CITIES.find(c => c.id !== activeCityId);
    let minDiff = 360;

    CITIES.forEach(c => {
      if (c.id === activeCityId) return;
      // Simple absolute difference on longitude circle
      let diff = Math.abs(c.lng - targetLng);
      if (diff > 180) diff = 360 - diff;
      
      if (diff < minDiff) {
        minDiff = diff;
        bestCity = c;
      }
    });

    if (bestCity) {
      setCompareCityId(bestCity.id);
      setMode(AppMode.COMPARE_CITIES);
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi > 200) return 'text-toxic-500';
    if (aqi > 100) return 'text-yellow-400';
    return 'text-clean-400';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* --- WELCOME MODAL --- */}
      {showWelcome && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto p-4 animate-fade-in">
           <div className="bg-space-900 border border-clean-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button onClick={() => setShowWelcome(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
              <div className="flex items-center space-x-3 mb-4">
                 <div className="p-3 bg-clean-500/20 rounded-xl text-clean-400"><Globe size={24} /></div>
                 <h2 className="text-xl font-bold text-white">Welcome, Agent!</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Your mission is to analyze the Earth's atmosphere. 
                 <br/><br/>
                 1. <span className="text-clean-400 font-bold">AQI (Air Quality Index)</span> is your main score. <span className="text-toxic-400 font-bold">High (300+)</span> is dangerous smoke. <span className="text-clean-400 font-bold">Low (0-50)</span> is fresh air.
                 <br/>
                 2. Use <span className="text-white font-bold">Versus Mode</span> to find "Opposite Cities" and see how different life is on the other side of the planet.
              </p>
              <button 
                onClick={() => setShowWelcome(false)}
                className="w-full py-3 bg-clean-500 hover:bg-clean-400 text-space-900 font-bold rounded-lg transition-colors"
              >
                Start Mission
              </button>
           </div>
        </div>
      )}

      {/* --- LEFT SIDEBAR: NAVIGATION & CONTROLS --- */}
      <div className="pointer-events-auto w-full md:w-72 bg-space-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-full z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-br from-space-800 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Globe size={16} className="text-clean-500" />
                <span className="text-[10px] font-mono text-clean-500 tracking-[0.2em] uppercase">Atmosphere.OS</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                TWIN <span className="text-gray-500">SKIES</span>
              </h1>
            </div>
            <button onClick={() => setShowWelcome(true)} className="text-gray-500 hover:text-white transition-colors">
               <HelpCircle size={18} />
            </button>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: AppMode.GLOBAL_OVERVIEW, label: 'Global Intel', icon: Globe, desc: 'Planetary Status' },
            { id: AppMode.CITY_DEEP_DIVE, label: 'City Analytics', icon: Activity, desc: 'Deep Dive Metrics' },
            { id: AppMode.COMPARE_CITIES, label: 'Versus Mode', icon: Trophy, desc: 'Compare Locations' },
            { id: AppMode.SCENARIO_NARRATIVE, label: 'Future Sim', icon: Zap, desc: 'Run Simulations' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleModeChange(item.id)}
              className={`w-full group text-left px-4 py-3 rounded-lg border transition-all duration-300 relative overflow-hidden ${
                mode === item.id 
                  ? 'bg-white/5 border-clean-500/50 shadow-[0_0_15px_rgba(77,255,184,0.1)]' 
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start space-x-3 relative z-10">
                 <div className={`p-1.5 rounded-md ${mode === item.id ? 'bg-clean-500 text-space-900' : 'bg-space-800 text-gray-500 group-hover:text-white'}`}>
                    <item.icon size={16} />
                 </div>
                 <div>
                    <div className={`text-sm font-bold ${mode === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{item.label}</div>
                    <div className="text-[10px] text-gray-600 font-mono mt-0.5 uppercase tracking-wide">{item.desc}</div>
                 </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Dynamic Inputs */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          {mode === AppMode.SCENARIO_NARRATIVE ? (
             <ScenarioControls 
               selectedInterventions={interventions} 
               onToggleIntervention={(i) => setInterventions(prev => prev.some(x => x.type === i.type) ? prev.filter(x => x.type !== i.type) : [...prev, i])} 
             />
          ) : (
             <div className="space-y-4">
               {/* City Selector with Search */}
               <div>
                 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex justify-between">
                    <span>Primary Target</span>
                    <Search size={10} />
                 </label>
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search city..." 
                      className="w-full bg-space-950 border border-white/10 border-b-0 rounded-t-md px-3 py-2 text-xs text-white focus:outline-none focus:bg-space-900"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                    />
                    <select 
                      value={activeCityId}
                      onChange={(e) => setActiveCityId(e.target.value)}
                      className="w-full bg-space-950 border border-white/10 text-white text-xs rounded-b-md p-2.5 focus:border-clean-500 outline-none hover:border-white/30 transition-colors"
                      size={5} // Show multiple items to feel like a list
                    >
                      {filteredCities.map(city => <option key={city.id} value={city.id} className="py-1">{city.name} {city.isReference ? '(REF)' : ''}</option>)}
                    </select>
                 </div>
               </div>
               
               {/* Find Opposite Button */}
               <button 
                 onClick={handleFindOpposite}
                 className="w-full py-2.5 bg-gradient-to-r from-space-800 to-space-700 border border-white/10 hover:border-clean-500/50 rounded-lg flex items-center justify-center space-x-2 group transition-all"
               >
                 <Shuffle size={14} className="text-clean-500 group-hover:rotate-180 transition-transform duration-500" />
                 <span className="text-xs font-bold text-gray-300 group-hover:text-white">Find Opposite City</span>
               </button>

               {mode === AppMode.COMPARE_CITIES && (
                 <div className="animate-slide-in-up pt-2 border-t border-white/5">
                   <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Secondary Target</label>
                   <select 
                     value={compareCityId || ''}
                     onChange={(e) => setCompareCityId(e.target.value)}
                     className="w-full bg-space-950 border border-white/10 text-white text-xs rounded-md p-2.5 focus:border-clean-500 outline-none hover:border-white/30 transition-colors"
                   >
                     {CITIES.filter(c => c.id !== activeCityId).map(city => <option key={city.id} value={city.id}>{city.name} {city.isReference ? '(REF)' : ''}</option>)}
                   </select>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>

      {/* --- CENTER: HUD OVERLAYS --- */}
      <div className="flex-1 relative pointer-events-none flex flex-col">
        {/* Top Bar HUD */}
        <div className="w-full h-16 pointer-events-none flex justify-center items-start pt-6 z-20">
            {activeCity && (
              <div className="bg-space-900/80 backdrop-blur-md rounded-2xl border border-white/10 px-8 py-3 flex items-center space-x-8 shadow-2xl pointer-events-auto group cursor-help relative">
                 <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] bg-black/80 px-2 py-1 rounded text-white">Current Target Zone</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Selected Region</span>
                    <span className="text-xl font-black text-white tracking-tight">{activeCity.name}</span>
                 </div>
                 <div className="h-8 w-px bg-white/10"></div>
                 <div className="flex flex-col items-end group/aqi relative">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                       Air Quality Index <Info size={10} className="ml-1 text-gray-600" />
                    </span>
                    <div className="flex items-baseline space-x-2">
                       <span className={`text-2xl font-black ${getAQIColor(activeCity.aqi)}`}>{activeCity.aqi}</span>
                       <span className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded">{activeCity.level}</span>
                    </div>
                    {/* AQI Tooltip */}
                    <div className="absolute top-12 right-0 w-56 bg-space-800 border border-white/20 p-3 rounded-lg shadow-xl opacity-0 group-hover/aqi:opacity-100 pointer-events-none transition-opacity z-50">
                      <h4 className="text-[10px] font-bold text-clean-500 uppercase mb-1">{TOOLTIPS.aqi.title}</h4>
                      <p className="text-[10px] text-gray-300 leading-tight">{TOOLTIPS.aqi.text}</p>
                   </div>
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* --- RIGHT SIDEBAR: INTELLIGENCE FEED --- */}
      <div className="pointer-events-auto w-full md:w-[450px] bg-space-900/85 backdrop-blur-xl border-l border-white/10 flex flex-col h-full z-30 shadow-[-4px_0_24px_rgba(0,0,0,0.5)]">
        
        {/* Chart Area */}
        <div className="h-64 border-b border-white/10 p-5 bg-space-900/50">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-clean-500 uppercase tracking-widest flex items-center">
                <Wind size={12} className="mr-2" /> Live Telemetry
              </h3>
              <div className="text-[9px] text-gray-500 uppercase font-mono">12 Month Trend</div>
           </div>
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={MOCK_TIMESERIES} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
               <defs>
                 <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0}/>
                 </linearGradient>
                 <linearGradient id="gradRef" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#A0C4FF" stopOpacity={0.2}/>
                   <stop offset="95%" stopColor="#A0C4FF" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
               <XAxis dataKey="month" stroke="#4B5563" tick={{fontSize: 9}} tickLine={false} axisLine={false} />
               <Tooltip 
                 contentStyle={{backgroundColor: '#0B0D17', borderColor: '#2A2F4C', borderRadius: '4px', fontSize: '12px'}} 
                 itemStyle={{color: '#fff'}}
               />
               <Area type="monotone" dataKey="delhi" stroke="#FF4D4D" fill="url(#gradActive)" strokeWidth={2} name="Active" />
               <Area type="step" dataKey="ref" stroke="#A0C4FF" fill="url(#gradRef)" strokeWidth={1} strokeDasharray="4 4" name="Baseline (Pole)" />
               {(mode === AppMode.COMPARE_CITIES || compareCityId) && (
                  <Area type="monotone" dataKey={compareCityId === 'san_antonio' ? 'san_antonio' : 'antipode'} stroke="#4DFFB8" fillOpacity={0.1} strokeWidth={2} name="Compare" />
               )}
             </AreaChart>
           </ResponsiveContainer>
        </div>

        {/* Intelligence Scroll */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-space-900/50 backdrop-blur-sm z-20">
                <Loader2 className="animate-spin text-clean-500 mb-3" size={24} />
                <span className="text-[10px] font-mono text-clean-500 uppercase tracking-widest">Processing Data Stream...</span>
             </div>
          ) : aiData ? (
             <div className="space-y-6 animate-fade-in">
                
                {/* Comparison or Highlight Cards */}
                <div className="grid grid-cols-2 gap-3">
                   <StatCard label="Air Health" value={`${activeCity.health_hp}%`} color={activeCity.health_hp > 70 ? 'text-clean-400' : 'text-toxic-500'} subtext="System Integrity" tooltipKey="hp" />
                   <StatCard label="vs. Baseline" value={`${Math.floor(activeCity.aqi)}x`} unit="Worse" color="text-yellow-400" subtext="Compared to Pole" />
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Narrative Analysis</h4>
                  <h2 className="text-sm font-bold text-white mb-2">{aiData.ui_text.title}</h2>
                  <p className="text-xs text-gray-300 leading-relaxed">{aiData.ui_text.narrative}</p>
                </div>

                {/* Compare Mode Table */}
                {mode === AppMode.COMPARE_CITIES && secondaryCity && aiData.comparisons && (
                  <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex justify-between text-[10px] font-bold text-gray-400 uppercase group cursor-help relative">
                      <span>Metric</span>
                      <div className="space-x-8 mr-2">
                        <span>{activeCity.name.substring(0,3)}</span>
                        <span>{secondaryCity.name.substring(0,3)}</span>
                      </div>
                      {/* Comparison Tooltip */}
                      <div className="absolute bottom-8 right-0 w-48 bg-space-800 border border-white/20 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        <p className="text-[9px] text-gray-300">{TOOLTIPS.opposite.text}</p>
                      </div>
                    </div>
                    {aiData.comparisons.map((c, i) => (
                      <ComparisonRow 
                        key={i} 
                        metric={c.metric} 
                        val1={c.primaryValue} 
                        val2={c.secondaryValue} 
                        unit={c.unit} 
                      />
                    ))}
                  </div>
                )}

                {/* Drivers & Impacts */}
                <div className="space-y-3">
                  <div className="bg-space-950/50 rounded-lg p-3 border border-white/5">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center mb-2">
                       <Skull size={10} className="mr-1.5" /> Key Threats
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                       {aiData.analysis.key_drivers.map(d => (
                         <span key={d} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-300">{d}</span>
                       ))}
                    </div>
                  </div>
                  <div className="bg-space-950/50 rounded-lg p-3 border border-white/5">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center mb-2">
                       <Heart size={10} className="mr-1.5" /> Human Impact
                    </h5>
                    <p className="text-[11px] text-gray-400">{aiData.analysis.health_impact}</p>
                  </div>
                </div>

             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 text-gray-600 opacity-50">
               <Shield size={32} className="mb-2" />
               <span className="text-[10px] uppercase font-mono">System Idle</span>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-space-900">
           <div className="relative">
              <input 
                type="text"
                placeholder="Ask intelligence core..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-clean-500/50 font-mono transition-colors pl-8"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCustomPrompt(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <div className="absolute left-2.5 top-2.5 text-gray-600">
                 <Zap size={12} />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;