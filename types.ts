export enum AppMode {
  GLOBAL_OVERVIEW = "global_overview",
  CITY_DEEP_DIVE = "city_deep_dive",
  COMPARE_CITIES = "compare_cities",
  SCENARIO_NARRATIVE = "scenario_narrative"
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  population: number;
  aqi: number; // Current AQI
  pm25: number;
  description: string;
  health_hp: number; // 0-100 score (100 is best air)
  level: string; // e.g., "Hazardous", "Good"
  isReference?: boolean; // True for North/South Pole
}

export interface ComparisonData {
  metric: string;
  primaryValue: number;
  secondaryValue: number;
  unit: string;
}

export interface ScenarioIntervention {
  type: string;
  reduction_pct: number;
  label: string;
}

export interface AIResponse {
  ui_text: {
    title: string;
    narrative: string;
    highlight?: string;
  };
  analysis: {
    key_drivers: string[];
    health_impact: string;
  };
  comparisons?: ComparisonData[];
  warnings?: string[];
}