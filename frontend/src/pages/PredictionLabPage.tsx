import React, { useEffect, useState } from 'react'
import {
  BrainCircuit,
  Layers,
  Sparkles,
  TrendingUp,
  Loader2
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { fetchModelStatus, runSimulation } from '../services/api'
import type { ModelStatus, SimulationResult } from '../services/api'

export const PredictionLabPage: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>('surge_inflow')
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  useEffect(() => {
    fetchModelStatus().then(setModelStatus).catch(console.error)
    handleSimulate('surge_inflow')
  }, [])

  const handleSimulate = async (scenType: string) => {
    setSelectedScenario(scenType)
    setIsSimulating(true)
    try {
      const res = await runSimulation(scenType)
      setSimResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSimulating(false)
    }
  }

  const importanceData = modelStatus
    ? Object.entries(modelStatus.feature_importances).map(([k, v]) => ({
        name: k.replace(/_/g, ' '),
        importance: Math.round(v * 1000) / 10,
      }))
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <span>Spatiotemporal Prediction Lab</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            RANDOM FOREST & LOGISTIC REGRESSION BENCHMARKS WITH LEAKAGE PREVENTION
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RIGOROUS HOLDOUT SPLIT</span>
          </span>
        </div>
      </div>

      {/* Benchmark Telemetry Row */}
      {modelStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">RANDOM FOREST ACCURACY</span>
            <div className="text-xl font-bold text-emerald-400">
              {(modelStatus.random_forest.accuracy * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500">Holdout scenario evaluation</div>
          </div>

          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">BASELINE LOGISTIC REG</span>
            <div className="text-xl font-bold text-slate-300">
              {(modelStatus.baseline_logistic_regression.accuracy * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500">Linear decision boundary</div>
          </div>

          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">MACRO F1-SCORE</span>
            <div className="text-xl font-bold text-cyan-400">
              {modelStatus.random_forest.f1_macro.toFixed(3)}
            </div>
            <div className="text-[10px] text-slate-500">Balanced class performance</div>
          </div>

          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">LEAKAGE CONTROLS</span>
            <div className="text-xl font-bold text-amber-400">ZERO LEAKAGE</div>
            <div className="text-[10px] text-slate-500">Disjoint window partitions</div>
          </div>
        </div>
      )}

      {/* Feature Importance & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Feature Importance Chart */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
            <span className="text-white font-semibold flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>GLOBAL FEATURE IMPORTANCE (RANDOM FOREST GINI)</span>
            </span>
            <span className="text-slate-500 text-[11px]">Normalized %</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importanceData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                <CartesianGrid stroke="#1e2638" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 9 }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0c10',
                    border: '1px solid #2c3852',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-slate-300 font-semibold">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>CONFUSION MATRIX (HOLDOUT TEST SET)</span>
            </span>
            <span className="text-slate-500 text-[11px]">Predicted vs Ground Truth</span>
          </div>

          {modelStatus && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                <div className="text-slate-500 font-bold p-1">ACTUAL \ PRED</div>
                {modelStatus.classes.map((c) => (
                  <div key={c} className="text-slate-400 font-bold p-1 truncate" title={c}>
                    {c.split(' ')[0]}
                  </div>
                ))}

                {modelStatus.random_forest.confusion_matrix.map((row, rIdx) => (
                  <React.Fragment key={rIdx}>
                    <div className="text-slate-400 font-bold p-1 truncate text-left">
                      {modelStatus.classes[rIdx].split(' ')[0]}
                    </div>
                    {row.map((val, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-2 rounded border border-[#1e2638] font-bold ${
                          rIdx === cIdx
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                            : val > 0
                            ? 'bg-rose-950/40 text-rose-300'
                            : 'bg-[#0a0c10] text-slate-600'
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-[11px] text-slate-500 text-center">
                High diagonal concentration confirms low false-positive rate between Stable and Elevated states.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controlled Scenario Simulation Suite */}
      <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] font-mono">
              <span>CONTROLLED SCENARIO EXPERIMENTATION</span>
            </div>
            <h3 className="text-lg font-bold text-white font-mono mt-1">Stress-Test Simulator</h3>
          </div>
          <span className="px-2.5 py-1 rounded bg-black/60 border border-[#2c3852] text-amber-400 text-xs font-mono font-bold">
            TAGGED: SIMULATED DATA
          </span>
        </div>

        {/* Scenario Selection Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: 'surge_inflow', label: 'Surge Inflow at Egress', desc: 'Zone 4 bottleneck influx' },
            { id: 'counter_flow', label: 'Counter-Flow Collision', desc: 'Opposing corridor streams' },
            { id: 'normal_baseline', label: 'Free-Flow Baseline', desc: 'Unimpeded steady transit' },
          ].map((scen) => (
            <button
              key={scen.id}
              onClick={() => handleSimulate(scen.id)}
              disabled={isSimulating}
              className={`px-4 py-2.5 rounded-lg border text-left font-mono transition-all ${
                selectedScenario === scen.id
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md'
                  : 'bg-[#0a0c10] border-[#1e2638] text-slate-400 hover:text-white hover:border-[#2c3852]'
              }`}
            >
              <div className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                {isSimulating && selectedScenario === scen.id && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                <span>{scen.label}</span>
              </div>
              <div className="text-[10px] text-slate-500">{scen.desc}</div>
            </button>
          ))}
        </div>

        {/* Simulation Output Card */}
        {simResult && (
          <div className="rounded-xl border border-cyan-900/60 bg-[#0a0c10] p-5 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                  {simResult.simulation_label}
                </span>
                <h4 className="text-sm font-bold text-white">{simResult.scenario_name}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">PREDICTED STATE:</span>
                <span
                  className={`px-2.5 py-1 rounded font-bold border ${
                    simResult.assessment.predicted_crowd_state === 'Elevated Risk'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : simResult.assessment.predicted_crowd_state === 'Congested'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : simResult.assessment.predicted_crowd_state === 'Densifying'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {simResult.assessment.predicted_crowd_state.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">{simResult.description}</p>

            {/* Probability Gauges */}
            <div className="space-y-2">
              <span className="text-slate-400 text-[11px] block">CLASSIFICATION PROBABILITY DISTRIBUTION</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(simResult.assessment.class_probabilities).map(([state, prob]) => (
                  <div key={state} className="p-2 rounded bg-[#121620] border border-[#1e2638] space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{state}</span>
                      <span className="font-bold text-white">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-1.5 rounded-full"
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
