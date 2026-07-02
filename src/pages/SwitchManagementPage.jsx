import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, ArrowUpDown } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import SwitchModal from '../components/SwitchModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { createSwitch, deleteSwitch, fetchSwitches, updateSwitch } from '../services/switchService'
import { normalizeText } from '../utils/formatters'

const PAGE_SIZE = 10
const emptySwitch = { model: '', physicalDevice: '', id: '', config: '', status: 'Inactive' }

export default function SwitchManagementPage() {
  useDocumentTitle('Switch Management')
  const toast = useToast()
  const [switches, setSwitches] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalState, setModalState] = useState({ open: false, record: null })
  const [confirm, setConfirm] = useState(null) // { id, message }
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try { setSwitches(await fetchSwitches()) }
    catch { toast.error('Load failed', 'Could not load switches.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const needle = normalizeText(search)
    let items = needle
      ? switches.filter(s => normalizeText(s.model).includes(needle) || normalizeText(s.id).includes(needle))
      : [...switches]
    if (sortField) {
      items.sort((a, b) => {
        const av = (a[sortField] ?? '').toLowerCase()
        const bv = (b[sortField] ?? '').toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return items
  }, [search, switches, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
    setPage(1)
  }

  const handleSearch = e => { setSearch(e.target.value); setPage(1) }

  const handleSave = useCallback(async form => {
    setSubmitting(true)
    try {
      if (modalState.record) await updateSwitch(modalState.record.id, form)
      else await createSwitch(form)
      await load()
      setModalState({ open: false, record: null })
      toast.success('Saved', modalState.record ? 'Switch updated successfully.' : 'Switch added successfully.')
    } catch (e) {
      toast.error('Save failed', e.response?.data?.message ?? 'Could not save the switch.')
    } finally { setSubmitting(false) }
  }, [load, modalState.record])

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirm) return
    setSubmitting(true)
    try {
      await deleteSwitch(confirm.id)
      await load()
      toast.success('Deleted', 'Switch record removed.')
    } catch (e) {
      toast.error('Delete failed', e.response?.data?.message ?? 'Could not delete the switch.')
    } finally { setSubmitting(false); setConfirm(null) }
  }, [confirm, load])

  const handleToggle = useCallback(async item => {
    setSubmitting(true)
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await updateSwitch(item.id, { ...item, status: nextStatus })
      await load()
      toast.success('Status updated', `${item.model} set to ${nextStatus}.`)
    } catch (e) {
      toast.error('Update failed', e.response?.data?.message ?? 'Could not update status.')
    } finally { setSubmitting(false) }
  }, [load])

  const SortBtn = ({ field }) => (
    <span
      onClick={() => handleSort(field)}
      style={{ cursor: 'pointer', marginLeft: 4, opacity: sortField === field ? 1 : 0.35 }}
      title={`Sort by ${field}`}
    >
      <ArrowUpDown size={13} />
    </span>
  )

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Switch Management</div>
          <h2>Inventory Control</h2>
          <p>Search, add, edit, delete, and update switch state using Redis-backed APIs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalState({ open: true, record: null })}>
          <Plus size={16} /> Add Switch
        </button>
      </div>

      {/* Table Card */}
      <div className="noc-card">
        <div className="noc-card__body" style={{ paddingBottom: 0 }}>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-wrap__icon" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input
                type="search"
                value={search}
                onChange={handleSearch}
                placeholder="Search by model or device ID..."
              />
            </div>
            <span className="toolbar__meta">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable">Model <SortBtn field="model" /></th>
                    <th>Physical Device</th>
                    <th>ID</th>
                    <th>Config</th>
                    <th className="sortable">Status <SortBtn field="status" /></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6"><div className="loading-state"><div className="spinner" /><span>Loading switches...</span></div></td></tr>
                  ) : paginated.length ? (
                    paginated.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.model}</td>
                        <td>{item.physicalDevice}</td>
                        <td><code style={{ fontSize: '0.8rem', background: 'var(--bg-soft)', padding: '2px 6px', borderRadius: 4 }}>{item.id}</code></td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.config}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(item)} disabled={submitting}>Toggle</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModalState({ open: true, record: item })} disabled={submitting}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ id: item.id, message: `Delete switch "${item.model}" (${item.id})?` })} disabled={submitting}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-state__icon"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg></div>
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
