// app/api/simulation/run/route.js
import { NextResponse } from 'next/server';
import { digitalTwinsService } from '../../../../lib/azure/digitalTwinsService';
import { neuralModel } from '../../../../lib/neural/predictiveModel';

export async function POST(request) {
  try {
    await digitalTwinsService.initialize();
    
    const devices = await digitalTwinsService.getNetworkDevices();
    const simulations = [];

    for (const device of devices) {
      const prediction = await neuralModel.predictAttack(device);
      
      const simulation = {
        deviceId: device.$dtId,
        deviceName: device.name || device.$dtId,
        ipAddress: device.ipAddress,
        prediction: prediction,
        timestamp: new Date().toISOString(),
        recommendedActions: generateDefenseActions(prediction, device)
      };

      simulations.push(simulation);

      // Update digital twin with prediction
      await digitalTwinsService.updateTwin(device.$dtId, [
        {
          op: 'replace',
          path: '/threatProbability',
          value: prediction.highestThreat
        },
        {
          op: 'replace',
          path: '/lastPrediction',
          value: prediction.predictedType
        }
      ]);
    }

    return NextResponse.json({
      success: true,
      simulations,
      summary: {
        totalDevices: devices.length,
        highRisk: simulations.filter(s => s.prediction.highestThreat > 0.7).length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Simulation failed', details: error.message },
      { status: 500 }
    );
  }
}

function generateDefenseActions(prediction, device) {
  const actions = [];
  const threatLevel = prediction.highestThreat;

  if (threatLevel > 0.8) {
    actions.push(
      `IMMEDIATE: Isolate device ${device.$dtId} from network`,
      `Apply emergency security patches`,
      `Enable enhanced monitoring`,
      `Notify security team`
    );
  } else if (threatLevel > 0.6) {
    actions.push(
      `URGENT: Update firewall rules for ${device.ipAddress}`,
      `Schedule security update within 24 hours`,
      `Increase logging level`
    );
  } else if (threatLevel > 0.4) {
    actions.push(
      `ROUTINE: Apply standard security updates`,
      `Review access controls`,
      `Monitor for suspicious activity`
    );
  } else {
    actions.push(`MONITOR: Continue normal surveillance`);
  }

  return actions;
}