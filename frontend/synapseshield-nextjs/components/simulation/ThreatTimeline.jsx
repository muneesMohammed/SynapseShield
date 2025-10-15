// components/simulation/ThreatTimeline.jsx
'use client'

import { useSimulation } from '../../store/simulationStore';
import { Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ThreatTimeline() {
  const { state } = useSimulation();

  if (!state.currentSimulation) {
    return null;
  }

  const timelineEvents = state.currentSimulation.simulations
    .filter(sim => sim.prediction.highestThreat > 0.3)
    .sort((a, b) => b.prediction.highestThreat - a.prediction.highestThreat)
    .slice(0, 5);

  const getThreatColor = (level) => {
    if (level > 0.8) return 'text-red-400';
    if (level > 0.6) return 'text-orange-400';
    return 'text-yellow-400';
  };

  const getThreatBarWidth = (level) => {
    return `${level * 100}%`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Threat Timeline</h2>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <AlertTriangle className={`w-4 h-4 ${getThreatColor(event.prediction.highestThreat)}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-semibold text-white truncate">
                  {event.deviceName}
                </h3>
                <span className={`text-xs font-bold ${getThreatColor(event.prediction.highestThreat)}`}>
                  {(event.prediction.highestThreat * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {event.prediction.predictedType} • {event.ipAddress}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    event.prediction.highestThreat > 0.8 
                      ? 'bg-red-500' 
                      : event.prediction.highestThreat > 0.6
                      ? 'bg-orange-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: getThreatBarWidth(event.prediction.highestThreat) }}
                />
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                {event.recommendedActions.slice(0, 2).map((action, actionIndex) => (
                  <div key={actionIndex} className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {timelineEvents.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No significant threats detected</p>
        </div>
      )}
    </div>
  );
}