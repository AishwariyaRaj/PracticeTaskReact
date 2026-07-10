import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Filler } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import { formatDateTime } from '../utils/formatters'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Filler)

export default function ChartDashboardPage() {
  useDocumentTitle('Chart Analytics')
  const { theme } = useTheme()
  const mainChartRef = useRef(null)
  const cpuChartRef = useRef(null)
  const activityChartRef = useRef(null)

  const [chartData, setChartData] = useState([])
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    api.get('/chart-data')
      .then(res => {
        const items = res.data.items ?? []
        if (mounted) {
          setChartData(items)
        }
      })
      .catch(() => { if (mounted) setError('Unable to load chart data.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  // Real-time automatic current timestamp updater every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        if (!prev.length) return prev
        const lastPoint = prev[prev.length - 1]
        const now = new Date()
        
        // Prevent duplication if the interval fires twice within the same millisecond
        if (new Date(lastPoint.timestamp).getTime() >= now.getTime()) {
          return prev
        }

        // Simulating 5 sensor values mathematically
        const base = 45 + Math.sin(now.getTime() / 600000) * 10
        const sensors = Array.from({ length: 5 }, (_, i) => base + Math.sin((now.getTime() + i) / 2) * 5 + (i * 2))
        const sortedSensors = [...sensors].sort((a, b) => a - b)
        
        const min = sortedSensors[0]
        const median = sortedSensors[2] // Middle element for length 5
        const max = sortedSensors[4]

        const newPoint = {
          timestamp: now.toISOString(),
          min: Number(min.toFixed(2)),
          median: Number(median.toFixed(2)),
          max: Number(max.toFixed(2)),
        }

        // Shift sliding window to keep exactly 24 elements
        return [...prev.slice(1), newPoint]
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // The displayed point defaults to the latest element if no point is selected manually
  const displayPoint = selectedPoint || chartData[chartData.length - 1]

  const mainDatasets = useMemo(() => {
    const isDark = theme === 'dark'
    return {
      labels: chartData.map(d => d.timestamp),
      datasets: [
        {
          label: 'Min',
          data: chartData.map(d => ({ x: d.timestamp, y: d.min })),
          borderColor: isDark ? '#3B82F6' : '#2563EB',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: isDark ? '#0E131F' : '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Median',
          data: chartData.map(d => ({ x: d.timestamp, y: d.median })),
          borderColor: '#10B981',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#10B981',
          pointBorderWidth: 2,
        },
        {
          label: 'Max',
          data: chartData.map(d => ({ x: d.timestamp, y: d.max })),
          borderColor: '#F59E0B',
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.04)',
          fill: '0', // Fill the area down to index 0 (Min)
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: isDark ? '#0E131F' : '#fff',
          pointBorderWidth: 2,
        },
      ],
    }
  }, [chartData, theme])

  const cpuDatasets = useMemo(() => {
    const isDark = theme === 'dark'
    return {
      labels: chartData.map(d => d.timestamp),
      datasets: [
        {
          label: 'CPU Load (%)',
          data: chartData.map(d => ({ x: d.timestamp, y: Number(((d.median / 100) * 85).toFixed(1)) })),
          borderColor: '#EC4899',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 2,
        },
        {
          label: 'Memory Load (%)',
          data: chartData.map(d => ({ x: d.timestamp, y: Number(((d.max / 100) * 75 + 10).toFixed(1)) })),
          borderColor: '#8B5CF6',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 2,
        }
      ]
    }
  }, [chartData, theme])

  const activityDatasets = useMemo(() => {
    return {
      labels: chartData.map(d => d.timestamp),
      datasets: [
        {
          label: 'Active Ports',
          data: chartData.map(d => ({ x: d.timestamp, y: Math.round((d.median / 100) * 40 + 8) })),
          borderColor: '#06B6D4',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 2,
        },
        {
          label: 'Throughput (Gbps)',
          data: chartData.map(d => ({ x: d.timestamp, y: Number(((d.max + d.min) / 20).toFixed(2)) })),
          borderColor: '#F97316',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 2,
        }
      ]
    }
  }, [chartData])

  const getOptions = useCallback((title, yMax = null) => {
    const isDark = theme === 'dark'
    const gridColor = isDark ? '#1E293B' : '#F1F5F9'
    const textColor = isDark ? '#94A3B8' : '#64748B'
    const tooltipBg = isDark ? '#0E131F' : '#fff'
    const tooltipTextColor = isDark ? '#F8FAFC' : '#0F172A'
    const tooltipBorderColor = isDark ? '#2D3748' : '#E2E8F0'

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDark ? '#CBD5E1' : '#475569',
            font: { family: "'Inter',sans-serif", size: 11, weight: '600' },
            padding: 10,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipTextColor,
          bodyColor: isDark ? '#CBD5E1' : '#475569',
          borderColor: tooltipBorderColor,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: { title: items => (items.length ? formatDateTime(items[0].parsed.x) : '') },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: { 
            unit: 'minute',
            displayFormats: { 
              minute: 'h:mm a',
              hour: 'h:mm a'
            } 
          },
          grid: { color: gridColor, drawTicks: false },
          ticks: { 
            color: textColor, 
            font: { family: "'Inter',sans-serif", size: 9 }, 
            padding: 8,
            source: 'data',
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          },
        },
        y: {
          max: yMax,
          grid: { color: gridColor, drawTicks: false },
          ticks: { color: textColor, font: { family: "'Inter',sans-serif", size: 10 }, padding: 8 },
        },
      },
    }
  }, [theme])

  const mainOptions = useMemo(() => getOptions('Network Telemetry', 100), [getOptions])
  const cpuOptions = useMemo(() => getOptions('CPU & Memory Load', 100), [getOptions])
  const activityOptions = useMemo(() => getOptions('Port Activity & Throughput'), [getOptions])

  const handleDoubleClick = useCallback((chartRef) => (event) => {
    const chart = chartRef.current
    if (!chart) return
    const native = event.nativeEvent ?? event
    const elements = chart.getElementsAtEventForMode(native, 'nearest', { intersect: true }, true)
    if (elements.length) {
      const idx = elements[0].index
      setSelectedPoint(chartData[idx] ?? null)
    }
  }, [chartData])

  const handleExport = () => {
    if (!chartData.length) return
    const rows = [['Timestamp', 'Min', 'Median', 'Max'], ...chartData.map(d => [d.timestamp, d.min, d.median, d.max])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'telemetry-data.csv'
    a.click()
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Chart Analytics</div>
          <h2>Telemetry Command Center</h2>
          <p>Double-click any data point in any chart to select and inspect details in the panel below.</p>
        </div>
      </div>

      {error && <div className="form-alert form-alert--error">{error}</div>}

      {/* Cluster of Charts Grid */}
      <div className="chart-grid">
        
        {/* Main Network Telemetry (Band Chart) */}
        <div className="noc-card chart-grid-span-2">
          <div className="chart-card-header">
            <div>
              <div className="noc-card__title">Network Telemetry (Band Chart)</div>
              <div className="noc-card__sub">Min / Median / Max shaded band telemetry (Mathematical Median)</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleExport} disabled={!chartData.length}>
              <Download size={15} /> Export CSV
            </button>
          </div>
          <div className="noc-card__body">
            {loading ? (
              <div className="skeleton skeleton-chart" />
            ) : (
              <div className="chart-shell" onDoubleClick={handleDoubleClick(mainChartRef)}>
                <Line ref={mainChartRef} data={mainDatasets} options={mainOptions} />
              </div>
            )}
          </div>
        </div>

        {/* CPU & Memory Load Chart */}
        <div className="noc-card">
          <div className="chart-card-header">
            <div>
              <div className="noc-card__title">CPU & Memory Utilization</div>
              <div className="noc-card__sub">Device capacity loads relative to node telemetry</div>
            </div>
          </div>
          <div className="noc-card__body">
            {loading ? (
              <div className="skeleton skeleton-chart" />
            ) : (
              <div className="chart-shell" onDoubleClick={handleDoubleClick(cpuChartRef)}>
                <Line ref={cpuChartRef} data={cpuDatasets} options={cpuOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Active Ports & Throughput Chart */}
        <div className="noc-card">
          <div className="chart-card-header">
            <div>
              <div className="noc-card__title">Port Activity & Throughput</div>
              <div className="noc-card__sub">Active connection density and total line rate</div>
            </div>
          </div>
          <div className="noc-card__body">
            {loading ? (
              <div className="skeleton skeleton-chart" />
            ) : (
              <div className="chart-shell" onDoubleClick={handleDoubleClick(activityChartRef)}>
                <Line ref={activityChartRef} data={activityDatasets} options={activityOptions} />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Selected Sample Table */}
      <div className="noc-card">
        <div className="noc-card__header">
          <div>
            <div className="noc-card__title">Selected Sample Information</div>
            <div className="noc-card__sub">Inspect real-time or double-clicked telemetry metrics</div>
          </div>
        </div>
        <div className="noc-card__body">
          {displayPoint ? (
            <div className="table-wrap" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <div className="table-scroll">
                <table className="data-table" style={{ minWidth: 'unset' }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Min Value</th>
                      <th>Median</th>
                      <th>Max Value</th>
                      <th>Simulated CPU Load</th>
                      <th>Simulated Memory Load</th>
                      <th>Active Ports</th>
                      <th>Line Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((point) => {
                      const isSelected = displayPoint && point.timestamp === displayPoint.timestamp
                      return (
                        <tr
                          key={point.timestamp}
                          className={isSelected ? 'row-selected' : ''}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : undefined,
                            fontWeight: isSelected ? '600' : 'normal',
                            transition: 'background-color 0.15s ease'
                          }}
                          onClick={() => setSelectedPoint(point)}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isSelected && (
                                <span 
                                  style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'var(--primary)', 
                                    boxShadow: '0 0 8px var(--primary)',
                                    display: 'inline-block'
                                  }} 
                                />
                              )}
                              {formatDateTime(point.timestamp)}
                            </div>
                          </td>
                          <td><span style={{ color: '#2563EB', fontWeight: isSelected ? 700 : 500 }}>{point.min}</span></td>
                          <td><span style={{ color: '#10B981', fontWeight: isSelected ? 700 : 500 }}>{point.median}</span></td>
                          <td><span style={{ color: '#F59E0B', fontWeight: isSelected ? 700 : 500 }}>{point.max}</span></td>
                          <td><code style={{ fontSize: '0.85rem' }}>{((point.median / 100) * 85).toFixed(1)}%</code></td>
                          <td><code style={{ fontSize: '0.85rem' }}>{((point.max / 100) * 75 + 10).toFixed(1)}%</code></td>
                          <td><span style={{ fontSize: '0.85rem' }}>{Math.round((point.median / 100) * 40 + 8)} ports</span></td>
                          <td><span style={{ fontSize: '0.85rem' }}>{((point.max + point.min) / 20).toFixed(2)} Gbps</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">📊</div>
              <div className="empty-state__title">No point selected</div>
              <div className="empty-state__msg">Double-click a data point on any chart above to display its details here.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
