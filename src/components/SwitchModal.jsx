import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const emptyForm = { model: '', physicalDevice: '', id: '', config: '', status: 'Inactive' }

export default function SwitchModal({ open, title, initialValues, onClose, onSubmit, submitting, idLocked = false }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) setForm(initialValues ?? emptyForm)
  }, [initialValues, open])

  if (!open) return null

  const handleChange = e => {
    const { name, value } = e.target
    setForm(cur => ({ ...cur, [name]: value }))
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <div className="modal-subtitle">Switch Record</div>
            <div className="modal-title">{title}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSubmit(form) }}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Model</label>
                <input className="form-input" name="model" value={form.model} onChange={handleChange} placeholder="Cisco Catalyst 9300" required />
              </div>
              <div className="form-field">
                <label className="form-label">Physical Device</label>
                <input className="form-input" name="physicalDevice" value={form.physicalDevice} onChange={handleChange} placeholder="Rack B / Unit 08" required />
              </div>
              <div className="form-field">
                <label className="form-label">Device ID</label>
                <input className="form-input" name="id" value={form.id} onChange={handleChange} placeholder="SW-9001" required disabled={idLocked} />
              </div>
              <div className="form-field">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-field form-grid__full">
                <label className="form-label">Configuration Notes</label>
                <textarea className="form-textarea" name="config" value={form.config} onChange={handleChange} placeholder="Configuration notes and profiles" rows="4" required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Switch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
