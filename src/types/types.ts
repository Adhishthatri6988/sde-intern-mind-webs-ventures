import { LatLngExpression } from 'leaflet';

export interface PolygonType {
  id: number;
  latlngs: LatLngExpression[];
}

export interface RuleType {
  operator: '<' | '>' | '=' | '<=' | '>=';
  value: number;
  color: string;
}

export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}
