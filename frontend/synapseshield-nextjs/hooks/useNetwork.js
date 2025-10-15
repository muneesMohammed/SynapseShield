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
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
      } else {
        setError(data.error);
      }
    } catch (err) {
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
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Set up real-time updates
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    devices,
    loading,
    error,
    fetchDevices,
    runSimulation
  };
}