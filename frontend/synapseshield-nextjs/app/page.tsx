// app/page.js
'use client'

import { SimulationProvider } from '../store/simulationStore'
import Dashboard from '../components/dashboard/Dashboard'

export default function Home() {
  return (
    <SimulationProvider>
      <main className="min-h-screen">
        <Dashboard />
      </main>
    </SimulationProvider>
  )
}