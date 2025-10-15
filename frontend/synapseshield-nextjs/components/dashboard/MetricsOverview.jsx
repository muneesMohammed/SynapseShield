// components/dashboard/MetricsOverview.jsx
'use client'

import { useSimulation } from '../../store/simulationStore';
import { Shield, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

export default function MetricsOverview() {
  const { state } = useSimulation();

  const metrics = [
    {
      title: 'Network Health',
      value: `${state.realTimeData.networkHealth}%`,
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      trend: 'stable'
    },
    {
      title: 'Active Devices',
      value: state.devices.length.toString(),
      icon: Cpu,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      trend: 'up'
    },
    {
      title: 'Active Threats',
      value: state.realTimeData.activeThreats.toString(),
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      trend: 'down'
    },
    {
      title: 'Prevented Attacks',
      value: state.realTimeData.preventedAttacks.toString(),
      icon: CheckCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">
                  {metric.title}
                </p>
                <p className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metric.title === 'Network Health' 
                      ? 'bg-green-500' 
                      : metric.title === 'Active Threats'
                      ? 'bg-red-500'
                      : metric.title === 'Prevented Attacks'
                      ? 'bg-purple-500'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: metric.title === 'Network Health' 
                      ? `${state.realTimeData.networkHealth}%`
                      : '100%'
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}