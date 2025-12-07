import { CityData, ScenarioIntervention } from './types';

// Helper to generate a rough HP score from AQI
const calcHP = (aqi: number) => Math.max(0, Math.min(100, 100 - (aqi / 3.5)));
const getLevel = (aqi: number) => {
  if (aqi <= 20) return "Pristine";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

// Base data for 50+ cities
const RAW_CITIES = [
  // REFERENCE POINTS
  { id: 'north_pole', name: 'North Pole', country: 'Arctic', lat: 90, lng: 0, pop: 0, aqi: 1, pm25: 0.1, desc: "Global Zero Point. The baseline for clean air.", isRef: true },
  { id: 'south_pole', name: 'South Pole', country: 'Antarctica', lat: -90, lng: 0, pop: 1000, aqi: 1, pm25: 0.1, desc: "The Frozen Sanctuary. Earth's cleanest atmosphere.", isRef: true },

  // ASIA
  { id: 'delhi', name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090, pop: 32000000, aqi: 350, pm25: 210, desc: "The Smog Titan. Severe seasonal spikes." },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, pop: 21500000, aqi: 145, pm25: 55, desc: "The Grey Giant. Historic battles with smog." },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, pop: 14000000, aqi: 35, pm25: 10, desc: "The Neon Clean. Efficient regulation." },
  { id: 'mumbai', name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, pop: 20000000, aqi: 160, pm25: 70, desc: "Coastal Haze. Construction dust meets sea breeze." },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, pop: 10500000, aqi: 120, pm25: 45, desc: "Traffic gridlock trap." },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, pop: 9700000, aqi: 90, pm25: 35, desc: "Transboundary dust issues." },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, pop: 10500000, aqi: 170, pm25: 85, desc: "Heavy vehicle emissions." },
  { id: 'hanoi', name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542, pop: 8000000, aqi: 180, pm25: 90, desc: "Dense motorbike fumes." },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, pop: 5700000, aqi: 45, pm25: 15, desc: "Green city planning." },
  { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, pop: 21000000, aqi: 280, pm25: 160, desc: "Brick kilns and dust." },
  { id: 'karachi', name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, pop: 16000000, aqi: 220, pm25: 110, desc: "Industrial pollution." },
  { id: 'shanghai', name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, pop: 26300000, aqi: 110, pm25: 40, desc: "Port and industry." },
  
  // AMERICAS
  { id: 'san_antonio', name: 'San Antonio', country: 'USA', lat: 29.4241, lng: -98.4936, pop: 1500000, aqi: 45, pm25: 12, desc: "The Northern Mirror. Clean plains." },
  { id: 'new_york', name: 'New York City', country: 'USA', lat: 40.7128, lng: -74.0060, pop: 8400000, aqi: 48, pm25: 12, desc: "Atlantic ventilation." },
  { id: 'los_angeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, pop: 3900000, aqi: 85, pm25: 25, desc: "The Smog Bowl." },
  { id: 'mexico_city', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, pop: 9200000, aqi: 130, pm25: 48, desc: "High altitude trap." },
  { id: 'sao_paulo', name: 'São Paulo', country: 'Brazil', lat: -23.5558, lng: -46.6396, pop: 12300000, aqi: 95, pm25: 33, desc: "Industrial giant." },
  { id: 'santiago', name: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, pop: 6000000, aqi: 110, pm25: 38, desc: "Valley inversion layer." },
  { id: 'lima', name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, pop: 10000000, aqi: 100, pm25: 35, desc: "Desert coast humidity." },
  { id: 'bogota', name: 'Bogota', country: 'Colombia', lat: 4.7110, lng: -74.0721, pop: 7400000, aqi: 65, pm25: 20, desc: "High Andean air." },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, pop: 675000, aqi: 25, pm25: 6, desc: "Pacific rainforest air." },
  { id: 'antipode', name: 'Easter Island', country: 'Chile', lat: -27.1127, lng: -109.3497, pop: 7750, aqi: 15, pm25: 4, desc: "The Pristine Void." },
  { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, pop: 2900000, aqi: 50, pm25: 14, desc: "River plate winds." },

  // EUROPE
  { id: 'london', name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, pop: 9000000, aqi: 55, pm25: 14, desc: "Congestion controlled." },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, pop: 2100000, aqi: 60, pm25: 16, desc: "Diesel reduction efforts." },
  { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, pop: 3600000, aqi: 50, pm25: 13, desc: "Green zones active." },
  { id: 'moscow', name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, pop: 12500000, aqi: 70, pm25: 20, desc: "Mega-city traffic." },
  { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, pop: 2800000, aqi: 65, pm25: 18, desc: "Historic congestion." },
  { id: 'oslo', name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522, pop: 634000, aqi: 20, pm25: 5, desc: "EV capital." },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426, pop: 130000, aqi: 10, pm25: 2, desc: "Geothermal purity." },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, pop: 15000000, aqi: 90, pm25: 30, desc: "Crossroads traffic." },

  // MIDDLE EAST & AFRICA
  { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, pop: 10000000, aqi: 180, pm25: 90, desc: "Desert dust mixed with exhaust." },
  { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, pop: 3100000, aqi: 140, pm25: 65, desc: "Sand and sun." },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, pop: 7000000, aqi: 155, pm25: 75, desc: "Arid particulate matter." },
  { id: 'tehran', name: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.3890, pop: 8700000, aqi: 160, pm25: 60, desc: "Mountain trapped smog." },
  { id: 'tel_aviv', name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818, pop: 435000, aqi: 60, pm25: 18, desc: "Mediterranean breeze." },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, pop: 14800000, aqi: 190, pm25: 100, desc: "Generator emissions." },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, pop: 5600000, aqi: 85, pm25: 28, desc: "Mining dust." },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, pop: 4400000, aqi: 75, pm25: 22, desc: "Traffic heavy." },

  // OCEANIA
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, pop: 5300000, aqi: 30, pm25: 8, desc: "Pacific winds." },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, pop: 5000000, aqi: 28, pm25: 7, desc: "Southern ocean air." },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, pop: 1600000, aqi: 20, pm25: 5, desc: "Windy isles." },
];

// Map raw data to CityData interface
export const CITIES: CityData[] = RAW_CITIES.map(c => ({
  id: c.id,
  name: c.name,
  country: c.country,
  lat: c.lat,
  lng: c.lng,
  population: c.pop,
  aqi: c.aqi,
  pm25: c.pm25,
  description: c.desc,
  health_hp: calcHP(c.aqi),
  level: getLevel(c.aqi),
  isReference: c.isRef
}));

export const MOCK_TIMESERIES = [
  { month: 'Jan', delhi: 380, antipode: 15, san_antonio: 45, ref: 1 },
  { month: 'Feb', delhi: 320, antipode: 15, san_antonio: 48, ref: 1 },
  { month: 'Mar', delhi: 250, antipode: 15, san_antonio: 55, ref: 1 },
  { month: 'Apr', delhi: 180, antipode: 15, san_antonio: 50, ref: 1 },
  { month: 'May', delhi: 150, antipode: 15, san_antonio: 52, ref: 1 },
  { month: 'Jun', delhi: 120, antipode: 15, san_antonio: 55, ref: 1 },
  { month: 'Jul', delhi: 90, antipode: 15, san_antonio: 45, ref: 1 },
  { month: 'Aug', delhi: 80, antipode: 15, san_antonio: 48, ref: 1 },
  { month: 'Sep', delhi: 110, antipode: 15, san_antonio: 42, ref: 1 },
  { month: 'Oct', delhi: 280, antipode: 15, san_antonio: 40, ref: 1 },
  { month: 'Nov', delhi: 450, antipode: 15, san_antonio: 38, ref: 1 },
  { month: 'Dec', delhi: 410, antipode: 15, san_antonio: 42, ref: 1 },
];

export const INTERVENTIONS: ScenarioIntervention[] = [
  { type: "vehicles", reduction_pct: 30, label: "Deploy EV Fleet" },
  { type: "industry", reduction_pct: 50, label: "Install Sky Scrubbers" },
  { type: "crop_burning", reduction_pct: 80, label: "Agri-Waste Converter" },
  { type: "green_cover", reduction_pct: 15, label: "Urban Reforestation" },
];

export const TOOLTIPS = {
  aqi: {
    title: "What is AQI?",
    text: "Think of AQI like a reverse video game score. Low numbers (0-50) are like a magical forest. High numbers (300+) are like standing in smoke. You want this number LOW!"
  },
  hp: {
    title: "Air Integrity",
    text: "This is the city's health bar. Pollution damages it. A full bar means the air is clean and safe to breathe."
  },
  opposite: {
    title: "The Opposite",
    text: "We find a city on the exact other side of the world map (opposite longitude) to see how different their sky is right now."
  }
};

export const SYSTEM_INSTRUCTION = `You are the AI Intelligence Core for "Twin Skies".

Your Role:
Analyze global air quality data with a high-tech, slightly gamified "Mission Control" persona.

Key Directive:
Always use the "North Pole" or "South Pole" as the gold standard for comparison (AQI ~1). 
When describing pollution in Delhi or Beijing, scale it against these pristine benchmarks.

Examples:
- "Delhi's PM2.5 load is currently 210x higher than the North Pole baseline."
- "San Antonio offers 45% cleaner air than Delhi, but is still 40x denser than the Antarctic standard."

Modes:
1. "global_overview": Summarize the planetary state. Highlight the gap between industrial zones and the Poles.
2. "city_deep_dive": Detailed breakdown of a specific city.
3. "compare_cities": Direct versus match.
4. "scenario_narrative": Future simulation.

Output JSON strictly.`;
