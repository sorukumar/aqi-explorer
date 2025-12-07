import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { CITIES } from '../constants';
import * as THREE from 'three';

interface GlobeViewProps {
  activeCityId: string;
  compareCityId?: string;
  onCityClick: (cityId: string) => void;
}

const GlobeView: React.FC<GlobeViewProps> = ({ activeCityId, compareCityId, onCityClick }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set initial point of view
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    }
  }, []);

  const getCityColor = (city: any) => {
    if (city.isReference) return '#A0C4FF'; // Ice Blue for Poles
    const aqi = city.aqi;
    if (aqi > 300) return '#FF0000'; // Extreme
    if (aqi > 200) return '#FF4D4D'; // Very Unhealthy
    if (aqi > 150) return '#FF804D'; // Unhealthy
    if (aqi > 100) return '#FFAC4D'; // Sensitive
    if (aqi > 50) return '#FFFF4D';  // Moderate
    return '#4DFFB8';                // Good
  };

  const pointsData = useMemo(() => {
    return CITIES.map(city => ({
      ...city,
      // Altitude proportional to pollution (Poles get small blip for visibility)
      altitude: city.isReference ? 0.05 : Math.max(0.05, city.aqi / 800), 
      radius: city.isReference ? 1.0 : (city.id === activeCityId || city.id === compareCityId ? 0.8 : 0.4),
      color: getCityColor(city),
    }));
  }, [activeCityId, compareCityId]);

  const ringsData = useMemo(() => {
    return CITIES.filter(c => c.id === activeCityId || c.id === compareCityId || c.isReference).map(c => ({
      lat: c.lat,
      lng: c.lng,
      color: getCityColor(c),
      maxRadius: c.isReference ? 8 : 5,
      propagationSpeed: c.isReference ? 0.5 : 2,
      repeatPeriod: c.isReference ? 2000 : 1000 
    }));
  }, [activeCityId, compareCityId]);

  // Rotate to active city on change
  useEffect(() => {
    if (globeEl.current && activeCityId) {
      const city = CITIES.find(c => c.id === activeCityId);
      if (city) {
        globeEl.current.pointOfView({ lat: city.lat, lng: city.lng, altitude: 2.2 }, 1500);
      }
    }
  }, [activeCityId]);

  // Idle rotation
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-space-900">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude="altitude" 
        pointRadius="radius"
        pointsMerge={true}
        onPointClick={(point: any) => onCityClick(point.id)}
        
        ringsData={ringsData}
        ringColor="color"
        ringMaxRadius="maxRadius"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-space-900 via-transparent to-transparent opacity-80" />
    </div>
  );
};

export default GlobeView;