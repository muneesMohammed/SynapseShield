// app/api/network/devices/route.js
import { NextResponse } from 'next/server';
import { digitalTwinsService } from '../../../../lib/azure/digitalTwinsService';

export async function GET() {
  try {
    await digitalTwinsService.initialize();
    const devices = await digitalTwinsService.getNetworkDevices();
    
    return NextResponse.json({
      success: true,
      devices: devices.map(device => ({
        id: device.$dtId,
        name: device.name || device.$dtId,
        ipAddress: device.ipAddress,
        type: device.deviceType || 'Unknown',
        os: device.operatingSystem || 'Unknown',
        vulnerabilityScore: device.vulnerabilityScore || 0.5,
        threatProbability: device.threatProbability || 0.3,
        status: device.status || 'active',
        lastSeen: device.lastSeen || new Date().toISOString()
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch devices', details: error.message },
      { status: 500 }
    );
  }
}