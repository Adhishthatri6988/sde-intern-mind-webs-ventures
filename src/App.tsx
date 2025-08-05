// src/App.tsx

import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import L, { LatLngExpression, LeafletEvent } from 'leaflet';

// Import our structured components and services
import Sidebar from './components/Sidebar';
import MapComponent from './components/Map';
import { fetchTemperatureData } from './services/weatherApi';
import { PolygonType, RuleType, WeatherData } from './types/types';

// Helper function to calculate the center of a polygon
const getPolygonCenter = (latlngs: LatLngExpression[]): [number, number] => {
  const coords = latlngs as [number, number][];
  const lats = coords.map(([lat]) => lat);
  const lngs = coords.map(([, lng]) => lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  // All the application's state is managed here in the top-level component.
  const [polygons, setPolygons] = useState<PolygonType[]>(() => {
  const saved = localStorage.getItem('polygons');
  return saved ? JSON.parse(saved) : [];
});
  
const [polygonNames, setPolygonNames] = useState<Record<number, string>>(() => {
  const saved = localStorage.getItem('polygonNames');
  return saved ? JSON.parse(saved) : {};
});
  const [weatherData, setWeatherData] = useState<Record<number, WeatherData>>({});
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]);
  const [rules, setRules] = useState<RuleType[]>(() => {
  const saved = localStorage.getItem('rules');
  return saved ? JSON.parse(saved) : [
    { operator: '<', value: 10, color: '#3b82f6' },
    { operator: '>=', value: 25, color: '#ef4444' },
  ];
});

// --- HOOKS FOR PERSISTENCE ---
  // This useEffect hook runs whenever polygons, names, or rules change, saving them to localStorage.
  useEffect(() => {
    localStorage.setItem('polygons', JSON.stringify(polygons));
    localStorage.setItem('polygonNames', JSON.stringify(polygonNames));
    localStorage.setItem('rules', JSON.stringify(rules));
  }, [polygons, polygonNames, rules]);

  // --- DATA FETCHING LOGIC ---
  const handleFetchData = useCallback(async (polygon: PolygonType) => {
    try {
      const center = getPolygonCenter(polygon.latlngs);
      const data = await fetchTemperatureData(center[0], center[1]);
      setWeatherData((prev) => ({ ...prev, [polygon.id]: data }));
    } catch (error) {
      console.error(`Failed to fetch data for polygon ${polygon.id}`, error);
    }
  }, []);

  // --- MAP EVENT HANDLERS ---
  const onCreated = (e: LeafletEvent & { layer: L.Polygon }) => {
    const layer = e.layer;
    const id = L.Util.stamp(layer);
    const newPolygon: PolygonType = {
      id,
      latlngs: layer.getLatLngs()[0] as LatLngExpression[],
    };
    setPolygons((prev) => [...prev, newPolygon]);
    setPolygonNames((prev) => ({ ...prev, [id]: `Polygon ${polygons.length + 1}` }));
    handleFetchData(newPolygon);
  };

  const onEdited = (e: LeafletEvent & { layers: L.LayerGroup }) => {
    e.layers.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        const id = L.Util.stamp(layer);
        const updatedPolygon: PolygonType = {
          id,
          latlngs: layer.getLatLngs()[0] as LatLngExpression[],
        };
        setPolygons((prev) => prev.map((p) => (p.id === id ? updatedPolygon : p)));
        handleFetchData(updatedPolygon);
      }
    });
  };

  const onDeleted = (e: LeafletEvent & { layers: L.LayerGroup }) => {
    e.layers.eachLayer((layer: any) => {
      const id = L.Util.stamp(layer);
      setPolygons((prev) => prev.filter((p) => p.id !== id));
      setWeatherData((prev) => {
        const newData = { ...prev };
        delete newData[id];
        return newData;
      });
      setPolygonNames((prev) => {
        const newNames = { ...prev };
        delete newNames[id];
        return newNames;
      });
    });
  };

  // --- COLOR LOGIC ---
  const getPolygonColor = useCallback((polygonId: number): string => {
    const data = weatherData[polygonId];
    if (!data?.hourly?.temperature_2m) return '#808080';

    const values = data.hourly.temperature_2m.slice(timeRange[0], timeRange[1]);
    if (values.length === 0) return '#808080';

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sortedRules = [...rules].sort((a, b) => a.value - b.value);
    let color = '#00ff00'; // Default green if no specific rule matches

    for (const rule of sortedRules) {
      if (rule.operator === '<' && avg < rule.value) return rule.color;
      if (rule.operator === '<=' && avg <= rule.value) return rule.color;
      if (rule.operator === '>' && avg > rule.value) color = rule.color;
      if (rule.operator === '>=' && avg >= rule.value) color = rule.color;
      if (rule.operator === '=' && Math.round(avg) === rule.value) return rule.color;
    }
    return color;
  }, [weatherData, timeRange, rules]);

  const polygonColors = React.useMemo(() =>
    polygons.reduce((acc, p) => {
      acc[p.id] = getPolygonColor(p.id);
      return acc;
    }, {} as Record<number, string>),
  [polygons, getPolygonColor]);


  // --- SIDEBAR HANDLERS ---
  const handleRuleChange = (index: number, field: keyof RuleType, value: string | number) => {
    const newRules = [...rules];
    (newRules[index] as any)[field] = value;
    setRules(newRules);
  };

  const addRule = () => setRules([...rules, { operator: '<', value: 0, color: '#ffff00' }]);
  const removeRule = (index: number) => setRules(rules.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans bg-gray-100">
      <Sidebar
        timeRange={timeRange}
        rules={rules}
        polygons={polygons}
        polygonNames={polygonNames}
        polygonColors={polygonColors}
        onTimeChange={(value) => setTimeRange(value as [number, number])}
        onRuleChange={handleRuleChange}
        onAddRule={addRule}
        onRemoveRule={removeRule}
        onNameChange={(id, name) => setPolygonNames(prev => ({ ...prev, [id]: name }))}
      />
      <MapComponent
        polygons={polygons}
        polygonColors={polygonColors}
         rules={rules}
        onCreated={onCreated}
        onEdited={onEdited}
        onDeleted={onDeleted}
      />
    </div>
  );
};

export default App;
