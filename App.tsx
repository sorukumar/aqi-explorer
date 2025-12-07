import React, { useState } from 'react';
import GlobeView from './components/GlobeView';
import Dashboard from './components/Dashboard';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GLOBAL_OVERVIEW);
  const [activeCityId, setActiveCityId] = useState<string>('delhi');
  const [compareCityId, setCompareCityId] = useState<string | undefined>(undefined);

  // Handle clicking a city on the globe
  const handleCityClick = (cityId: string) => {
    if (mode === AppMode.COMPARE_CITIES) {
      if (activeCityId && activeCityId !== cityId) {
        setCompareCityId(cityId);
      } else {
        setActiveCityId(cityId);
      }
    } else {
      setActiveCityId(cityId);
      setMode(AppMode.CITY_DEEP_DIVE);
    }
  };

  return (
    <div className="relative w-full h-screen bg-space-900 overflow-hidden">
      {/* 3D Layer */}
      <GlobeView 
        activeCityId={activeCityId} 
        compareCityId={compareCityId}
        onCityClick={handleCityClick}
      />

      {/* UI Layer */}
      <Dashboard 
        mode={mode} 
        setMode={setMode}
        activeCityId={activeCityId}
        setActiveCityId={setActiveCityId}
        compareCityId={compareCityId}
        setCompareCityId={setCompareCityId}
      />
    </div>
  );
};

export default App;
