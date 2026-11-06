import React, { useEffect, useState } from 'react'
import {
  HelpCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react'
import { fetchMetricDefinitions, runSimulation } from '../services/api'
import type { MetricDefinitionsResponse, SimulationResult } from '../services/api'

export const ExplainabilityPage: React.FC = () => {
  const [metricDefs, setMetricDefs] = useState<MetricDefinitionsResponse | null>(null)
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>('surge_inflow')

  useEffect(() => {
    fetchMetricDefinitions().then(setMetricDefs).catch(console.error)
    runSimulation('surge_inflow').then(setSimResult).catch(console.error)
  }, [])

  const handleScenarioChange = (scen: string) => {
    setSelectedScenario(scen)
    runSimulation(scen).then(setSimResult).catch(console.error)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            <span>Explainability & Assessment Factors</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            LOCAL ATTRIBUTION, FEATURE IMPORTANCE & METHODOLOGICAL TRANSPARENCY
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
            SHAP-ALIGNED ATTRIBUTION
          </span>
        </div>
      </div>

      {/* Scientific Honesty Callout */}
      <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-5 space-y-2">
        <div className="flex items-center space-x-2 text-amber-300 font-mono text-xs font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>METHODOLOGICAL INTEGRITY: CORRELATION VS CAUSATION</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Feature importance and local impact scores indicate statistical correlation between spatiotemporal metrics and historically annotated crowd density patterns. They do <strong>not</strong> constitute causal proof or clinical guarantees of crowd behavior. Model confidence scores reflect posterior class probabilities under holdout test splits, not arbitrary certainty percentages.
        </p>
      </div>

      {/* Local Feature Attribution Explorer */}
      {simResult && (
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase">
                INTERACTIVE LOCAL EXPLANATION
              </span>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                Why was "{simResult.assessment.predicted_crowd_state}" assessed?
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Sample:</span>
              <select
                value={selectedScenario}
                onChange={(e) => handleScenarioChange(e.target.value)}
                className="bg-[#0a0c10] border border-[#2c3852] rounded p-1.5 text-xs font-mono text-cyan-400"
              >
                <option value="surge_inflow">Surge Inflow at Egress</option>
                <option value="counter_flow">Counter-Flow Collision</option>
                <option value="normal_baseline">Free-Flow Baseline</option>
              </select>
            </div>
          </div>

          {/* Primary driving indicator banner */}
          <div className="p-3.5 rounded-lg bg-[#0a0c10] border border-[#2c3852] font-mono text-xs flex items-center justify-between">
            <span className="text-slate-400">Primary Driving Anomaly:</span>
            <span className="text-cyan-400 font-bold uppercase">
              {simResult.assessment.primary_driving_factor.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Feature Shifts Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-slate-400 text-[11px]">
                  <th className="py-2">SPATIOTEMPORAL FEATURE</th>
                  <th className="py-2">MEASURED</th>
                  <th className="py-2">BASELINE</th>
                  <th className="py-2">DEVIATION (%)</th>
                  <th className="py-2">DIRECTIONAL IMPACT</th>
                  <th className="py-2">GLOBAL WEIGHT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-slate-300">
                {simResult.assessment.contributing_features.map((feat) => {
                  const isPositive = feat.percentage_shift > 0
                  return (
                    <tr key={feat.feature} className="hover:bg-[#171d2b]/50">
                      <td className="py-2.5 font-bold text-white">
                        {feat.feature.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5">{feat.measured_value}</td>
                      <td className="py-2.5 text-slate-500">{feat.baseline_value}</td>
                      <td className="py-2.5 font-semibold">
                        <span className={isPositive ? 'text-amber-400' : 'text-cyan-400'}>
                          {isPositive ? '+' : ''}
                          {feat.percentage_shift}%
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            feat.local_impact_direction === 'elevating_risk'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {feat.local_impact_direction === 'elevating_risk'
                            ? 'ELEVATING RISK'
                            : 'STABILIZING'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 font-mono">
                        {(feat.global_importance * 100).toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metric Definitions & Formulas Dictionary */}
      {metricDefs && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#1e2638] pb-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Comprehensive Metrics & Mathematical Formulas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(metricDefs.metrics).map(([key, item]) => (
              <div
                key={key}
                className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#1e2638] pb-2">
                  <span className="font-bold text-white text-sm">{item.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.type.includes('Directly')
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : item.type.includes('Risk')
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p className="text-slate-400 text-xs">{item.description}</p>
                  <div className="p-2.5 rounded bg-[#0a0c10] border border-[#2c3852] text-cyan-300 font-mono text-[11px]">
                    <span className="text-slate-500 block text-[10px]">FORMULA:</span>
                    {item.formula}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Inputs:</strong> {item.inputs}
                  </div>
                  <div className="text-[11px] text-amber-300/80">
                    <strong className="text-amber-400">Limitations:</strong> {item.limitations}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
