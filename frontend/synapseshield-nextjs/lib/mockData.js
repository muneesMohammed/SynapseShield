// lib/mockData.js
export const mockDevices = [
  {
    id: 'server-01',
    name: 'Web-Server-01',
    ipAddress: '192.168.1.10',
    type: 'Server',
    os: 'Ubuntu 20.04',
    vulnerabilityScore: 0.7,
    threatProbability: 0.3,
    status: 'active',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'db-01',
    name: 'Database-01',
    ipAddress: '192.168.1.20',
    type: 'Database',
    os: 'Windows Server 2019',
    vulnerabilityScore: 0.9,
    threatProbability: 0.6,
    status: 'active',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'workstation-15',
    name: 'User-Workstation-15',
    ipAddress: '192.168.1.50',
    type: 'Workstation',
    os: 'Windows 10',
    vulnerabilityScore: 0.5,
    threatProbability: 0.2,
    status: 'active',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'router-01',
    name: 'Core-Router-01',
    ipAddress: '192.168.1.1',
    type: 'Network',
    os: 'Cisco IOS',
    vulnerabilityScore: 0.3,
    threatProbability: 0.1,
    status: 'active',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'switch-01',
    name: 'Access-Switch-01',
    ipAddress: '192.168.1.2',
    type: 'Network',
    os: 'Cisco IOS',
    vulnerabilityScore: 0.4,
    threatProbability: 0.15,
    status: 'active',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'fileserver-01',
    name: 'File-Server-01',
    ipAddress: '192.168.1.30',
    type: 'Server',
    os: 'Windows Server 2019',
    vulnerabilityScore: 0.8,
    threatProbability: 0.45,
    status: 'active',
    lastSeen: new Date().toISOString()
  }
];

export const mockSimulation = {
  success: true,
  simulations: [
    {
      deviceId: 'db-01',
      deviceName: 'Database-01',
      ipAddress: '192.168.1.20',
      prediction: {
        ransomware: 0.8,
        ddos: 0.3,
        dataTheft: 0.9,
        highestThreat: 0.9,
        predictedType: 'Data Theft'
      },
      timestamp: new Date().toISOString(),
      recommendedActions: [
        'IMMEDIATE: Isolate device Database-01 from network',
        'Apply emergency security patches',
        'Enable enhanced monitoring',
        'Notify security team'
      ]
    },
    {
      deviceId: 'server-01',
      deviceName: 'Web-Server-01',
      ipAddress: '192.168.1.10',
      prediction: {
        ransomware: 0.6,
        ddos: 0.7,
        dataTheft: 0.4,
        highestThreat: 0.7,
        predictedType: 'DDoS'
      },
      timestamp: new Date().toISOString(),
      recommendedActions: [
        'URGENT: Update firewall rules for 192.168.1.10',
        'Schedule security update within 24 hours',
        'Increase logging level'
      ]
    },
    {
      deviceId: 'fileserver-01',
      deviceName: 'File-Server-01',
      ipAddress: '192.168.1.30',
      prediction: {
        ransomware: 0.85,
        ddos: 0.2,
        dataTheft: 0.6,
        highestThreat: 0.85,
        predictedType: 'Ransomware'
      },
      timestamp: new Date().toISOString(),
      recommendedActions: [
        'IMMEDIATE: Backup critical data',
        'Isolate from network during investigation',
        'Scan for malware',
        'Update antivirus definitions'
      ]
    }
  ],
  summary: {
    totalDevices: 6,
    highRisk: 3,
    timestamp: new Date().toISOString()
  }
};