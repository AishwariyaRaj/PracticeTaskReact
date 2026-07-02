import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Filler } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { fetchChartData } from '../services/chartService'
import { formatDateTime } from '../utils/formatters'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Filler)

export default function ChartDashboardPage() {
  useDocumentTitle('Chart Analytics')
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState([])
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    fetchChartData()
      .then(items => { if (mounted) { setChartData(items); setSelectedPoint(items.at(-1) ?? null) } })
      .catch(() => { if (mounted) setError('Unable to load chart data.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const datasets = useMemo(() => ({
    labels: chartData.map(d => d.timestamp),
    datasets: [
      { label: 'Min', data: chartData.map(d => ({ x: d.timestamp, y: d.min })), borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: '#fff', pointBorderWidth: 2 },
      { label: 'Median', data: chartData.map(d => ({ x: d.timestamp, y: d.median })), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.04)', tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: '#fff', pointBorderWidth: 2 },
      { label: 'Max', data: chartData.map(d => ({ x: d.timestamp, y: d.max })), borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.04)', tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: '#fff', pointBorderWidth: 2 },
    ],
  }), [chartData])

  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: '#475569', font: { family: "'Inter',sans-serif", size: 13, weight: '600' }, padding: 20, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { backgroundColor: '#fff', titleColor: '#0F172A', bodyColor: '#475569', borderColor: '#E2E8F0', borderWidth: 1, padding: 12, boxPadding: 6, usePointStyle: true, callbacks: { title: items => items.length ? formatDateTime(items[0].parsed.x) : '' } },
    },
    scales: {
      x: { type: 'time', time: { unit: 'hour', displayFormats: { hour: 'h a' } }, grid: { color: '#F1F5F9', drawTicks: false }, ticks: { color: '#94A3B8', font: { family: "'Inter',sans-serif", size: 11 }, padding: 8 } },
      y: { grid: { color: '#F1F5F9', drawTicks: false }, ticks: { color: '#94A3B8', font: { family: "'Inter',sans-serif", size: 11 }, padding: 8 } },
    },
  }), [])

  const handleDoubleClick = useCallback(event => {
    const chart = chartRef.current
    if (!chart) return
    const native = event.nativeEvent ?? event
    const elements = chart.getElementsAtEventForMode(native, 'nearest', { intersect: true }, true)
    if (elements.length) setSelectedPoint(chartData[elements[0].index] ?? null)
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
          <h2>Telemetry Over Time</h2>
          <p>Double-click any point to inspect timestamp and values in the detail panel.</p>
        </div>
      </div>

      {error && <div className="form-alert form-alert--error">{error}</div>}

      {/* Chart Card */}
      <div className="noc-card">
        <div className="chart-card-header">
          <div>
            <div className="noc-card__title">Network Telemetry</div>
            <div className="noc-card__sub">Min / Median / Max over last 24 hours</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleExport} disabled={!chartData.length}>
            <Download size={15} /> Export CSV
          </button>
        </div>
        <div className="noc-card__body">
          {loading ? (
            <div className="skeleton skeleton-chart" />
          ) : (
            <div className="chart-shell" onDoubleClick={handleDoubleClick}>
              <Line ref={chartRef} data={datasets} options={options} onDoubleClick={handleDoubleClick} />
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="noc-card">
        <div className="noc-card__header">
          <div>
            <div className="noc-card__title">Selected Sample</div>
            <div className="noc-card__sub">Double-click a point on the chart above</div>
          </div>
        </div>
        <div className="noc-card__body">
          {selectedPoint ? (
            <div className="table-wrap">
              <div className="table-scroll">
                <table className="data-table" style={{ minWidth: 'unset' }}>
                  <thead><tr><th>Timestamp</th><th>Min</th><th>Median</th><th>Max</th></tr></thead>
                  <tbody>
                    <tr>
                      <td>{formatDateTime(selectedPoint.timestamp)}</td>
                      <td><span style={{ color: '#2563EB', fontWeight: 600 }}>{selectedPoint.min}</span></td>
                      <td><span style={{ color: '#10B981', fontWeight: 600 }}>{selectedPoint.median}</span></td>
                      <td><span style={{ color: '#F59E0B', fontWeight: 600 }}>{selectedPoint.max}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">📊</div>
              <div className="empty-state__title">No point selected</div>
              <div className="empty-state__msg">Double-click a chart data point to display its values here.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
