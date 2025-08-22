import React from 'react';

export default function PieChart({ data, size = 120, strokeWidth = 8, showLabels = true, className = "" }) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="text-gray-400 text-sm text-center">No data</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="text-gray-400 text-sm text-center">No data</div>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
    
    accumulatedPercentage += percentage;
    
    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      index
    };
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          
          {/* Data segments */}
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 hover:brightness-110"
            />
          ))}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500 text-center">Total</div>
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="mt-4 w-full max-w-xs">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center text-xs">
                <div 
                  className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" 
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-gray-600 whitespace-nowrap">
                  {segment.label} ({segment.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}