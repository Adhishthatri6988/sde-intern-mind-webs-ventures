// src/components/Sidebar.tsx

import React from 'react';
import Slider from 'rc-slider';
import { PolygonType, RuleType } from '../types/types';

// Define the props that this component will receive from its parent (App.tsx)
interface SidebarProps {
  timeRange: [number, number];
  rules: RuleType[];
  polygons: PolygonType[];
  polygonNames: Record<number, string>;
  polygonColors: Record<number, string>;
  onTimeChange: (value: number | number[]) => void;
  onRuleChange: (index: number, field: keyof RuleType, value: string | number) => void;
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
  onNameChange: (id: number, name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  timeRange,
  rules,
  polygons,
  polygonNames,
  polygonColors,
  onTimeChange,
  onRuleChange,
  onAddRule,
  onRemoveRule,
  onNameChange,
}) => {
  return (
    <aside className="w-full md:w-96 bg-white p-4 overflow-y-auto shadow-lg z-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Data Dashboard</h1>

      {/* Timeline Slider Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Time Window (Hourly)</h3>
        <Slider
          range
          min={0}
          max={30 * 24} // 30 days
          defaultValue={timeRange}
          onChange={onTimeChange}
          className="mb-2"
        />
        <p className="text-sm text-gray-500 text-center">
          Hour {timeRange[0]} to {timeRange[1]}
        </p>
      </div>

      {/* Color Rules Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Coloring Rules (Temperature °C)</h3>
          <button
            onClick={onAddRule}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <select
                value={rule.operator}
                onChange={(e) => onRuleChange(index, 'operator', e.target.value)}
                className="p-1 border rounded-md bg-white"
              >
                <option value="<">&lt;</option>
                <option value=">">&gt;</option>
                <option value="=">=</option>
                <option value="<=">&lt;=</option>
                <option value=">=">&gt;=</option>
              </select>
              <input
                type="number"
                value={rule.value}
                onChange={(e) => onRuleChange(index, 'value', Number(e.target.value))}
                className="w-20 p-1 border rounded-md"
              />
              <input
                type="color"
                value={rule.color}
                onChange={(e) => onRuleChange(index, 'color', e.target.value)}
                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer"
              />
              <button
                onClick={() => onRemoveRule(index)}
                className="ml-auto text-red-500 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Polygon List Section */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-700">Defined Regions</h3>
        <div className="space-y-2">
          {polygons.length > 0 ? (
            polygons.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                <div
                  className="w-5 h-5 rounded"
                  style={{ backgroundColor: polygonColors[p.id] || '#808080' }}
                ></div>
                <input
                  type="text"
                  value={polygonNames[p.id] || ''}
                  onChange={(e) => onNameChange(p.id, e.target.value)}
                  className="flex-grow p-1 border rounded-md"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Draw a polygon on the map to begin.</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
