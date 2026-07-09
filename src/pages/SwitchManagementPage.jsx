import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, ArrowUpDown } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import SwitchModal from '../components/SwitchModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import api from '../services/api'
import { normalizeText } from '../utils/formatters'

const PAGE_SIZE = 10
const emptySwitch = { model: '', physicalDevice: '', id: '', config: '', status: 'Inactive' }

export default function SwitchManagementPage() {
  useDocumentTitle('Switch Management')
  const toast = useToast()
  const { searchValue, setSearchValue } = useOutletContext()
  const [switches, setSwitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalState, setModalState] = useState({ open: false, record: null })
  const [confirm, setConfirm] = useState(null) // { ids, message }
  const [selectedIds, setSelectedIds] = useState([])
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/switches/list')
      setSwitches(response.data.items ?? [])
    }
    catch { toast.error('Load failed', 'Could not load switches.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const needle = normalizeText(searchValue)
    let items = needle
      ? switches.filter(s =>
        normalizeText(s.model ?? '').includes(needle) ||
        normalizeText(s.physicalDevice ?? '').includes(needle) ||
        normalizeText(s.id ?? '').includes(needle) ||
        normalizeText(s.config ?? '').includes(needle) ||
        normalizeText(s.status ?? '').includes(needle)
      )
      : [...switches]
    if (sortField) {
      items.sort((a, b) => {
        const av = (a[sortField] ?? '').toLowerCase()
        const bv = (b[sortField] ?? '').toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return items
  }, [searchValue, switches, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
    setPage(1)
  }

  const handleSearch = e => { setSearchValue(e.target.value); setPage(1) }

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const pageIds = paginated.map(item => item.id)
    const allSelected = pageIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)))
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])])
    }
  }

  const handleSave = useCallback(async form => {
    setSubmitting(true)
    try {
      if (modalState.record) await api.put(`/switches/update/${modalState.record.id}`, form)
      else await api.post('/switches/create', form)
      await load()
      setModalState({ open: false, record: null })
      toast.success('Saved', modalState.record ? 'Switch updated successfully.' : 'Switch added successfully.')
    } catch (e) {
      toast.error('Save failed', e.response?.data?.message ?? 'Could not save the switch.')
    } finally { setSubmitting(false) }
  }, [load, modalState.record])

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirm || !confirm.ids) return
    setSubmitting(true)
    try {
      await Promise.all(confirm.ids.map(id => api.delete(`/switches/delete/${id}`)))
      await load()
      setSelectedIds([])
      toast.success('Deleted', confirm.ids.length > 1 ? `${confirm.ids.length} switches removed.` : 'Switch record removed.')
    } catch (e) {
      toast.error('Delete failed', e.response?.data?.message ?? 'Could not delete one or more switches.')
    } finally { setSubmitting(false); setConfirm(null) }
  }, [confirm, load])

  const handleToggle = useCallback(async item => {
    setSubmitting(true)
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await api.put(`/switches/update/${item.id}`, { ...item, status: nextStatus })
      await load()
      toast.success('Status updated', `${item.model} set to ${nextStatus}.`)
    } catch (e) {
      toast.error('Update failed', e.response?.data?.message ?? 'Could not update status.')
    } finally { setSubmitting(false) }
  }, [load])

  const SortBtn = ({ field }) => (
    <span
      style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.35 }}
      title={`Sort by ${field}`}
    >
      <ArrowUpDown size={13} style={{ verticalAlign: 'middle' }} />
    </span>
  )

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Switch Management</div>
          <h2>Inventory Control</h2>
          <p>Search, add, edit and delete switch state</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalState({ open: true, record: null })}>
          <Plus size={16} /> Add Switch
        </button>
      </div>

      {/* Table Card */}
      <div className="noc-card">
        <div className="noc-card__body" style={{ paddingBottom: 0 }}>
          {/* Toolbar */}
          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div className="search-wrap" style={{ margin: 0 }}>
                <span className="search-wrap__icon" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                </span>
                <input
                  type="search"
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="Search switches..."
                />
              </div>
              {selectedIds.length > 0 && (
                <button
                  className="btn btn-danger"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => setConfirm({ ids: selectedIds, message: `Are you sure you want to delete the ${selectedIds.length} selected switches?` })}
                  disabled={submitting}
                >
                  Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={paginated.length > 0 && paginated.every(item => selectedIds.includes(item.id))}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th className="sortable" onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID <SortBtn field="id" /></th>
                    <th className="sortable" onClick={() => handleSort('model')} style={{ cursor: 'pointer' }}>Model <SortBtn field="model" /></th>
                    <th>Physical Device</th>
                    <th>Config</th>
                    <th className="sortable" onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status <SortBtn field="status" /></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7"><div className="loading-state"><div className="spinner" /><span>Loading switches...</span></div></td></tr>
                  ) : paginated.length ? (
                    paginated.map(item => (
                      <tr key={item.id} className={selectedIds.includes(item.id) ? 'row-selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => handleSelectRow(item.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td><code style={{ fontSize: '0.8rem', background: 'var(--bg-soft)', padding: '2px 6px', borderRadius: 4 }}>{item.id}</code></td>
                        <td style={{ fontWeight: 600 }}>{item.model}</td>
                        <td>{item.physicalDevice}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.config}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-ghost btn-sm" onClick={() => setModalState({ open: true, record: item })} disabled={submitting}>Edit</button>
                            <button className="btn btn-danger-soft btn-sm" onClick={() => setConfirm({ ids: [item.id], message: `Delete switch "${item.model}" (${item.id})?` })} disabled={submitting}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7">
                      <div className="empty-state">
                        <div className="empty-state__icon"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg></div>
                        <div className="empty-state__title">No switches found</div>
                        <div className="empty-state__msg">Try adjusting your search or add a new switch.</div>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div className="pagination">
                <span>Page {page} of {totalPages}</span>
                <div className="pagination__pages">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} className={`page-btn${n === page ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                  ))}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SwitchModal
        open={modalState.open}
        title={modalState.record ? 'Edit Switch' : 'Add Switch'}
        initialValues={modalState.record ?? emptySwitch}
        idLocked={Boolean(modalState.record)}
        onClose={() => setModalState({ open: false, record: null })}
        onSubmit={handleSave}
        submitting={submitting}
      />

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          confirmLabel="Delete"
          dangerous
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
