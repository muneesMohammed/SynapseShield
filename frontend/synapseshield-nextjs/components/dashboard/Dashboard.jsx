// components/dashboard/Dashboard.jsx
'use client'

import { useSimulation } from '../../store/simulationStore';
import { useDigitalTwins } from '../../hooks/useDigitalTwins';
import NetworkTopology from '../visualization/NetworkTopology';
import SimulationPanel from '../simulation/SimulationPanel';
import DefenseActions from '../defense/DefenseActions';
import MetricsOverview from '../dashboard/MetricsOverview';
import ThreatTimeline from '../simulation/ThreatTimeline';

export default function Dashboard() {
  const { state, dispatch } = useSimulation();
  const { devices, runSimulation } = useDigitalTwins();

  const handleRunSimulation = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await runSimulation();
      if (result) {
        dispatch({ type: 'SET_SIMULATIONS', payload: result });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                🛡️ SynapseShield
              </h1>
              <p className="text-gray-400 mt-1">
                Neural Digital Twin for Predictive Cyber Defense
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Network Health</div>
                <div className="text-green-400 font-semibold">
                  {state.realTimeData.networkHealth}%
                </div>
              </div>
              <button
                onClick={handleRunSimulation}
                disabled={state.isLoading}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {state.isLoading ? 'Running Simulation...' : '🚀 Run Predictive Analysis'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Metrics Overview */}
        <MetricsOverview />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <SimulationPanel />
            <DefenseActions />
          </div>

          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            <NetworkTopology devices={devices} />
            {state.currentSimulation && <ThreatTimeline />}
          </div>
        </div>
      </div>
    </div>
  );
}