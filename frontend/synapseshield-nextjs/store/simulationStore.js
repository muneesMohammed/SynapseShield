// store/simulationStore.js
'use client'

import React, { createContext, useContext, useReducer } from 'react';

const SimulationContext = createContext();

const initialState = {
  devices: [],
  simulations: [],
  currentSimulation: null,
  defenseActions: [],
  isLoading: false,
  error: null,
  realTimeData: {
    networkHealth: 95,
    activeThreats: 0,
    preventedAttacks: 0
  }
};

function simulationReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_DEVICES':
      return { ...state, devices: action.payload };
    
    case 'SET_SIMULATIONS':
      return { 
        ...state, 
        simulations: action.payload.simulations,
        currentSimulation: action.payload,
        realTimeData: {
          ...state.realTimeData,
          activeThreats: action.payload.summary?.highRisk || 0
        }
      };
    
    case 'ADD_DEFENSE_ACTION':
      return {
        ...state,
        defenseActions: [...state.defenseActions, action.payload],
        realTimeData: {
          ...state.realTimeData,
          preventedAttacks: state.realTimeData.preventedAttacks + 1
        }
      };
    
    case 'UPDATE_NETWORK_HEALTH':
      return {
        ...state,
        realTimeData: {
          ...state.realTimeData,
          networkHealth: action.payload
        }
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  return (
    <SimulationContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
}