// hooks/useDigitalTwins.js
import { useState, useEffect } from 'react';

export function useDigitalTwins() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/network/devices');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
      } else {
        setError(data.error || 'Failed to fetch devices');
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error running simulation:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const applyDefenseAction = async (deviceId, action) => {
    try {
      const response = await fetch('/api/defense/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error applying defense action:', err);
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    devices,
    loading,
    error,
    fetchDevices,
    runSimulation,
    applyDefenseAction,
    refetch: fetchDevices
  };
}