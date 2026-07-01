import { useMemo, useState } from 'react'
import { Plus, RefreshCw, AlertTriangle, Wrench } from 'lucide-react'
import type { Manteniment, EstatManteniment, TipusManteniment } from './types'
import { formatDate, isOverdue } from './manteniment.utils'

const ESTAT_COLORS: Record<EstatManteniment, string> = {
  'Pendent':    'text-gray-600 bg-gray-100',
  'En curs':   'text-blue-600 bg-blue-100',
  'Completat': 'text-green-700 bg-green-100',
  'Cancel·lat':'text-amber-600 bg-amber-100',
}

const TIPUS_COLORS: Record<TipusManteniment, string> = {
  'Preventiu':    'text-blue-600 bg-blue-50 border border-blue-200',
  'Correctiu':    'text-red-600 bg-red-50 border border-red-200',
  'Actualització':'text-purple-600 bg-purple-50 border border-purple-200',
  'Neteja':       'text-green-600 bg-green-50 border border-green-200',
}

const ESTATS_FILTRE: Array<EstatManteniment | 'Tots'> = ['Tots', 'Pendent', 'En curs', 'Completat', 'Cancel·lat']
const TIPUS_FILTRE: Array<TipusManteniment | 'Tots'> = ['Tots', 'Preventiu', 'Correctiu', 'Actualització', 'Neteja']

interface Props {
  manteniments: Manteniment[]
  loading: boolean
  error: string | null
  canGestionar: boolean
  onRefresh: () => void
  onNou: () => void
  onVeure: (m: Manteniment) => void
}

export function MantenimentPage({ manteniments, loading, error, canGestionar, onRefresh, onNou, onVeure }: Props) {
  const [filtreEstat, setFiltreEstat] = useState<EstatManteniment | 'Tots'>('Tots')
  const [filtreTipus, setFiltreTipus] = useState<TipusManteniment | 'Tots'>('Tots')

  const stats = useMemo(() => ({
    pendents:    manteniments.filter((m) => m.Estat === 'Pendent').length,
    enCurs:      manteniments.filter((m) => m.Estat === 'En curs').length,
    completats:  manteniments.filter((m) => m.Estat === 'Completat').length,
    vencuts:     manteniments.filter((m) => isOverdue(m.Data_prevista, m.Estat)).length,
  }), [manteniments])

  const filtrats = useMemo(() => manteniments.filter((m) => {
    if (filtreEstat !== 'Tots' && m.Estat !== filtreEstat) return false
    if (filtreTipus !== 'Tots' && m.Tipus !== filtreTipus) return false
    return true
  }), [manteniments, filtreEstat, filtreTipus])

  return (
    <div className="flex flex-col gap-6 p-6 bg-surface min-h-full">

      {/* Capçalera */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-main">Manteniment</h1>
          <p className="text-sm text-gray-400 mt-0.5">{manteniments.length} registres</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          {canGestionar && (
            <button
              onClick={onNou}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#861414' }}
            >
              <Plus size={14} /> Nou
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pendents',   value: stats.pendents,   color: '#6b7280' },
          { label: 'En curs',    value: stats.enCurs,     color: '#2563eb' },
          { label: 'Completats', value: stats.completats, color: '#15803d' },
          { label: 'Vençuts',    value: stats.vencuts,    color: '#dc2626' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            {loading ? (
              <div className="space-y-2">
                <div className="h-7 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {ESTATS_FILTRE.map((e) => (
            <button
              key={e}
              onClick={() => setFiltreEstat(e)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filtreEstat === e ? 'bg-gray-100 text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {TIPUS_FILTRE.map((t) => (
            <button
              key={t}
              onClick={() => setFiltreTipus(t)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filtreTipus === t ? 'bg-gray-100 text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Llista */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="ml-auto h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtrats.length === 0 ? (
        <div className="text-center py-12">
          <Wrench size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {manteniments.length === 0
              ? canGestionar
                ? <>Cap registre de manteniment. <button onClick={onNou} className="text-primary hover:underline">Crea el primer.</button></>
                : 'Cap registre de manteniment.'
              : 'Cap resultat amb els filtres actuals.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrats.map((m) => {
            const vencuda = isOverdue(m.Data_prevista, m.Estat)
            return (
              <button
                key={m.ID}
                onClick={() => onVeure(m)}
                className="w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-primary/70 font-semibold">{m.ID}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIPUS_COLORS[m.Tipus]}`}>
                        {m.Tipus}
                      </span>
                      {vencuda && (
                        <span className="flex items-center gap-0.5 text-xs text-red-500 font-medium">
                          <AlertTriangle size={11} /> Vençuda
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-main truncate">{m.Titol}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      {m.Dispositiu && <span>{m.Dispositiu}</span>}
                      {m.Responsable && <span>{m.Responsable}</span>}
                      {m.Data_prevista && (
                        <span className={vencuda ? 'text-red-400' : ''}>
                          {formatDate(m.Data_prevista)}
                        </span>
                      )}
                      {m.Periodicitat && m.Periodicitat !== 'Única vegada' && (
                        <span className="text-gray-300">· {m.Periodicitat}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ESTAT_COLORS[m.Estat]}`}>
                    {m.Estat}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
