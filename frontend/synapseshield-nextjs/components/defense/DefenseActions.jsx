// components/defense/DefenseActions.jsx
'use client'

import { useSimulation } from '../../store/simulationStore';
import { Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function DefenseActions() {
  const { state, dispatch } = useSimulation();

  const mockDefenseActions = [
    {
      id: 1,
      device: 'Web-Server-01',
      action: 'Block suspicious IP range',
      status: 'completed',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'firewall'
    },
    {
      id: 2,
      device: 'Database-01',
      action: 'Apply security patches',
      status: 'pending',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      type: 'patch'
    },
    {
      id: 3,
      device: 'User-Workstation-15',
      action: 'Isolate from network',
      status: 'completed',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: 'isolation'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'firewall':
        return 'bg-blue-500/20 text-blue-400';
      case 'patch':
        return 'bg-green-500/20 text-green-400';
      case 'isolation':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Defense Actions</h2>
        <Shield className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {mockDefenseActions.map((action) => (
          <div
            key={action.id}
            className="p-3 bg-gray-700/30 rounded-lg border border-gray-600"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(action.status)}
                <span className="font-medium text-sm text-white">
                  {action.device}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(action.type)}`}>
                {action.type}
              </span>
            </div>
            <p className="text-xs text-gray-300 mb-2">{action.action}</p>
            <p className="text-xs text-gray-500">
              {new Date(action.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {state.defenseActions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Recent Actions
          </h3>
          <div className="space-y-2">
            {state.defenseActions.slice(-3).map((action, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-xs text-gray-400"
              >
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>{action.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mockDefenseActions.length === 0 && state.defenseActions.length === 0 && (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            No defense actions taken yet
          </p>
        </div>
      )}
    </div>
  );
}