// src/components/Map.tsx

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L, { LeafletEvent } from 'leaflet';
import { PolygonType, RuleType } from '../types/types';
import Legend from './Legend';

// This is a common fix for a known issue with Leaflet and bundlers like Vite
// It ensures that the default marker icons load correctly.
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A small helper component to enforce the zoom lock on the map
const MapController: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.setMinZoom(10);
    map.setMaxZoom(10);
  }, [map]);
  return null;
};

// Define the props that this component will receive
// UPDATED: The event types now match what App.tsx provides.
interface MapComponentProps {
  polygons: PolygonType[];
  polygonColors: Record<number, string>;
  rules: RuleType[];
  onCreated: (e: LeafletEvent & { layer: L.Polygon }) => void;
  onEdited: (e: LeafletEvent & { layers: L.LayerGroup }) => void;
  onDeleted: (e: LeafletEvent & { layers: L.LayerGroup }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  polygons,
  polygonColors,
  rules,
  onCreated,
  onEdited,
  onDeleted,
}) => {
  return (
    <main className="flex-grow h-full">
      <MapContainer
        center={[23.6850, 86.9649]} // Centered on Asansol
        zoom={10}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* FeatureGroup to hold the drawing controls */}
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={onCreated as (e: LeafletEvent) => void}
            onEdited={onEdited as (e: LeafletEvent) => void}
            onDeleted={onDeleted as (e: LeafletEvent) => void}
            draw={{
              polygon: {
                allowIntersection: false,
                showArea: true,
                minPoints: 3,
                maxPoints: 12,
              },
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>

        {/* Render all the polygons from the state */}
        {polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            positions={polygon.latlngs}
            pathOptions={{
              color: polygonColors[polygon.id] || '#808080',
              fillColor: polygonColors[polygon.id] || '#808080',
              fillOpacity: 0.5,
              weight: 2,
            }}
          />
        ))}

        <MapController />
        <Legend rules={rules} />
      </MapContainer>
    </main>
  );
};

export default MapComponent;
