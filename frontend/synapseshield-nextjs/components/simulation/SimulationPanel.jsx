// components/simulation/SimulationPanel.jsx
'use client'

import { useSimulation } from '../../store/simulationStore';
import { Play, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SimulationPanel() {
  const { state } = useSimulation();

  const getThreatLevelColor = (level) => {
    if (level > 0.8) return 'text-red-400';
    if (level > 0.6) return 'text-orange-400';
    if (level > 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getThreatLevelText = (level) => {
    if (level > 0.8) return 'Critical';
    if (level > 0.6) return 'High';
    if (level > 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Attack Simulations</h2>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      {state.currentSimulation ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-300">Last Simulation</p>
              <p className="text-xs text-gray-400">
                {new Date(state.currentSimulation.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-400">Completed</p>
              <p className="text-xs text-gray-400">
                {state.currentSimulation.summary.totalDevices} devices
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Top Threats Detected
            </h3>
            {state.currentSimulation.simulations
              .filter(sim => sim.prediction.highestThreat > 0.5)
              .slice(0, 3)
              .map((simulation, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-700/30 rounded-lg border-l-4 border-red-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm text-white">
                      {simulation.deviceName}
                    </span>
                    <span className={`text-xs font-bold ${getThreatLevelColor(simulation.prediction.highestThreat)}`}>
                      {getThreatLevelText(simulation.prediction.highestThreat)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    {simulation.prediction.predictedType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(simulation.prediction.highestThreat * 100).toFixed(1)}% probability
                  </p>
                </div>
              ))}
          </div>

          {state.currentSimulation.simulations.filter(sim => sim.prediction.highestThreat > 0.5).length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No high threats detected</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm mb-4">
            No simulation data available
          </p>
          <p className="text-gray-500 text-xs">
            Run a predictive analysis to see threat simulations
          </p>
        </div>
      )}
    </div>
  );
}