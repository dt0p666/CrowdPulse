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
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#253144] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-teal-400" />
            <span>Model Explainability & Attribution</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Local attribution, feature importance, and methodological transparency
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-[#176B65]/20 text-teal-300 border border-[#176B65]/40 text-xs font-medium">
            SHAP-Aligned Attribution
          </span>
        </div>
      </div>

      {/* Scientific Honesty Callout */}
      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 space-y-2">
        <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Methodological Integrity: Statistical Correlation vs Causation</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Feature importance and local impact scores indicate statistical correlation between spatiotemporal metrics and historically annotated crowd patterns. They do <strong>not</strong> constitute causal proof or clinical guarantees of human behavior. Confidence scores reflect posterior class probabilities under holdout test splits, not arbitrary certainty.
        </p>
      </div>

      {/* Local Feature Attribution Explorer */}
      {simResult && (
        <div className="rounded-2xl border border-[#253144] bg-[#161D29] p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#253144] pb-4">
            <div>
              <span className="text-[11px] text-teal-400 font-semibold uppercase tracking-wider">
                Interactive Local Explanation
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Factors contributing to "{simResult.assessment.predicted_crowd_state}"
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Sample Scenario:</span>
              <select
                value={selectedScenario}
                onChange={(e) => handleScenarioChange(e.target.value)}
                className="bg-[#101520] border border-[#253144] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#176B65]"
              >
                <option value="surge_inflow">Surge Inflow at Egress</option>
                <option value="counter_flow">Counter-Flow Collision</option>
                <option value="normal_baseline">Free-Flow Baseline</option>
              </select>
            </div>
          </div>

          {/* Primary driving indicator banner */}
          <div className="p-4 rounded-xl bg-[#101520] border border-[#253144] text-xs flex items-center justify-between">
            <span className="text-slate-400">Primary Driving Anomaly:</span>
            <span className="text-teal-300 font-semibold">
              {simResult.assessment.primary_driving_factor.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Feature Shifts Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#253144] text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Spatiotemporal Metric</th>
                  <th className="py-3 px-3">Measured Value</th>
                  <th className="py-3 px-3">Baseline</th>
                  <th className="py-3 px-3">Deviation (%)</th>
                  <th className="py-3 px-3">Directional Impact</th>
                  <th className="py-3 px-3">Global Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253144] text-slate-300">
                {simResult.assessment.contributing_features.map((feat) => {
                  const isPositive = feat.percentage_shift > 0
                  return (
                    <tr key={feat.feature} className="hover:bg-[#1a2332] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {feat.feature.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3">{feat.measured_value}</td>
                      <td className="py-3 px-3 text-slate-400">{feat.baseline_value}</td>
                      <td className="py-3 px-3 font-semibold">
                        <span className={isPositive ? 'text-amber-400' : 'text-teal-400'}>
                          {isPositive ? '+' : ''}
                          {feat.percentage_shift}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            feat.local_impact_direction === 'elevating_risk'
                              ? 'bg-[#C94C4C]/15 text-rose-300 border border-[#C94C4C]/30'
                              : 'bg-[#38845B]/15 text-emerald-300 border border-[#38845B]/30'
                          }`}
                        >
                          {feat.local_impact_direction === 'elevating_risk'
                            ? 'Elevating Risk'
                            : 'Stabilizing'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
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
          <div className="flex items-center space-x-2 border-b border-[#253144] pb-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              Spatiotemporal Metrics & Mathematical Definitions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {Object.entries(metricDefs.metrics).map(([key, item]) => (
              <div
                key={key}
                className="rounded-2xl border border-[#253144] bg-[#161D29] p-5 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-[#253144] pb-2">
                  <span className="font-semibold text-white text-sm">{item.name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      item.type.includes('Directly')
                        ? 'bg-[#176B65]/15 text-teal-300 border-[#176B65]/30'
                        : item.type.includes('Risk')
                        ? 'bg-[#C94C4C]/15 text-rose-300 border-[#C94C4C]/30'
                        : 'bg-[#38845B]/15 text-emerald-300 border-[#38845B]/30'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p className="text-slate-400 text-xs">{item.description}</p>
                  <div className="p-3 rounded-xl bg-[#101520] border border-[#253144] text-teal-300 font-mono text-[11px]">
                    <span className="text-slate-500 block text-[10px] mb-0.5">FORMULA:</span>
                    {item.formula}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Inputs:</strong> {item.inputs}
                  </div>
                  <div className="text-[11px] text-amber-300/90">
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
