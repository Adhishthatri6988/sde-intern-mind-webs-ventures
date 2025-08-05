// src/components/Legend.tsx

import React from 'react';
import { RuleType } from '../types/types';

interface LegendProps {
  rules: RuleType[];
}

const Legend: React.FC<LegendProps> = ({ rules }) => {
  // This component doesn't render anything if there are no rules
  if (!rules || rules.length === 0) {
    return null;
  }

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar bg-white p-2 rounded-md shadow-lg">
        <h4 className="font-bold text-center mb-2 text-gray-700">Legend</h4>
        <div className="space-y-1">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center">
              <i
                className="w-4 h-4 rounded-sm mr-2"
                style={{ backgroundColor: rule.color }}
              ></i>
              <span className="text-sm text-gray-600">{`${rule.operator} ${rule.value}°C`}</span>
            </div>
          ))}
          {/* You can add default colors to the legend as well if you like */}
          <div className="flex items-center">
            <i
              className="w-4 h-4 rounded-sm mr-2"
              style={{ backgroundColor: '#00ff00' }} // Default green
            ></i>
            <span className="text-sm text-gray-600">Default</span>
          </div>
          <div className="flex items-center">
            <i
              className="w-4 h-4 rounded-sm mr-2"
              style={{ backgroundColor: '#808080' }} // No data grey
            ></i>
            <span className="text-sm text-gray-600">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;
