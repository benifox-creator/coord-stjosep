import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Manteniment, MantenimentFormData, TipusManteniment, EstatManteniment, PerioditatManteniment } from './types'

const TIPUS: TipusManteniment[] = ['Preventiu', 'Correctiu', 'Actualització', 'Neteja']
const ESTATS: EstatManteniment[] = ['Pendent', 'En curs', 'Completat', 'Cancel·lat']
const PERIODICITATS: PerioditatManteniment[] = ['Única vegada', 'Mensual', 'Trimestral', 'Semestral', 'Anual']

interface Props {
  manteniment?: Manteniment | null
  onClose: () => void
  onGuardar: (data: MantenimentFormData) => Promise<void>
}

export function MantenimentForm({ manteniment, onClose, onGuardar }: Props) {
  const [form, setForm] = useState<MantenimentFormData>({
    Titol: manteniment?.Titol ?? '',
    Tipus: manteniment?.Tipus ?? 'Preventiu',
    Dispositiu: manteniment?.Dispositiu ?? '',
    Descripcio: manteniment?.Descripcio ?? '',
    Responsable: manteniment?.Responsable ?? '',
    Data_prevista: manteniment?.Data_prevista ?? '',
    Data_realitzat: manteniment?.Data_realitzat ?? '',
    Estat: manteniment?.Estat ?? 'Pendent',
    Periodicitat: manteniment?.Periodicitat ?? 'Única vegada',
    Notes: manteniment?.Notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof MantenimentFormData>(key: K, value: MantenimentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.Titol.trim()) { setError('El títol és obligatori.'); return }
    setSaving(true)
    setError(null)
    try {
      await onGuardar(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en desar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-text-main">
            {manteniment ? 'Editar manteniment' : 'Nou manteniment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="label">Títol *</label>
            <input
              className="input"
              value={form.Titol}
              onChange={(e) => update('Titol', e.target.value)}
              placeholder="Descripció breu de la tasca..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipus</label>
              <select
                className="input"
                value={form.Tipus}
                onChange={(e) => update('Tipus', e.target.value as TipusManteniment)}
              >
                {TIPUS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estat</label>
              <select
                className="input"
                value={form.Estat}
                onChange={(e) => update('Estat', e.target.value as EstatManteniment)}
              >
                {ESTATS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Dispositiu / Àrea afectada</label>
            <input
              className="input"
              value={form.Dispositiu}
              onChange={(e) => update('Dispositiu', e.target.value)}
              placeholder="Ex: Projector Aula 3, Switch planta 2..."
            />
          </div>

          <div>
            <label className="label">Descripció</label>
            <textarea
              className="input resize-none"
              rows={2}
              value={form.Descripcio}
              onChange={(e) => update('Descripcio', e.target.value)}
              placeholder="Detalls de la tasca de manteniment..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Responsable</label>
              <input
                className="input"
                value={form.Responsable}
                onChange={(e) => update('Responsable', e.target.value)}
                placeholder="nom@stjosep.org"
              />
            </div>
            <div>
              <label className="label">Periodicitat</label>
              <select
                className="input"
                value={form.Periodicitat}
                onChange={(e) => update('Periodicitat', e.target.value as PerioditatManteniment)}
              >
                {PERIODICITATS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data prevista</label>
              <input
                type="date"
                className="input"
                value={form.Data_prevista}
                onChange={(e) => update('Data_prevista', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Data realitzat</label>
              <input
                type="date"
                className="input"
                value={form.Data_realitzat}
                onChange={(e) => update('Data_realitzat', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              value={form.Notes}
              onChange={(e) => update('Notes', e.target.value)}
              placeholder="Observacions addicionals..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#861414' }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {manteniment ? 'Desar canvis' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
