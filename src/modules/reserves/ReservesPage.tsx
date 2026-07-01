import { useState, useMemo } from 'react'
import { Plus, Search, RefreshCw, CalendarDays, Clock } from 'lucide-react'
import type { Reserva, EstatReserva } from './types'
import { formatDate, formatTime, formatDateISO, isDiaAvui } from './reserves.utils'

const AVUI = formatDateISO(new Date())
const MOCK: Reserva[] = [
  {
    ID: 'RES-001', Espai: "Aula d'informàtica",
    Usuari: 'Pere Fonts', Email: 'pere.fonts@stjosep.org',
    Data: AVUI, Hora_inici: '10:00', Hora_fi: '12:00',
    Motiu: 'Classe de programació amb 4t ESO',
    Estat: 'Confirmada', Creat_el: '2026-06-20 09:15', _rowIndex: 0,
  },
  {
    ID: 'RES-002', Espai: 'Sala de reunions',
    Usuari: 'Maria López', Email: 'maria.lopez@stjosep.org',
    Data: AVUI, Hora_inici: '14:00', Hora_fi: '15:30',
    Motiu: 'Reunió de cicle amb equip docent',
    Estat: 'Pendent', Creat_el: '2026-06-22 11:00', _rowIndex: 1,
  },
  {
    ID: 'RES-003', Espai: "Sala d'actes",
    Usuari: 'Anna Puig', Email: 'anna.puig@stjosep.org',
    Data: '2026-06-25', Hora_inici: '09:00', Hora_fi: '13:00',
    Motiu: 'Acte final de curs',
    Estat: 'Confirmada', Creat_el: '2026-06-15 10:30', _rowIndex: 2,
  },
  {
    ID: 'RES-004', Espai: 'Biblioteca',
    Usuari: 'Jordi Mas', Email: 'jordi.mas@stjosep.org',
    Data: '2026-06-24', Hora_inici: '11:00', Hora_fi: '12:00',
    Motiu: 'Sessió de lectura amb 1r ESO',
    Estat: 'Pendent', Creat_el: '2026-06-22 16:00', _rowIndex: 3,
  },
  {
    ID: 'RES-005', Espai: 'Laboratori de ciències',
    Usuari: 'Carla Vidal', Email: 'carla.vidal@stjosep.org',
    Data: '2026-06-21', Hora_inici: '10:00', Hora_fi: '11:00',
    Motiu: 'Pràctiques de química',
    Estat: 'Cancel·lada', Creat_el: '2026-06-18 09:00', _rowIndex: 4,
  },
  {
    ID: 'RES-006', Espai: 'Sala de projecció',
    Usuari: 'Marc Torrent', Email: 'marc.torrent@stjosep.org',
    Data: '2026-06-26', Hora_inici: '16:00', Hora_fi: '18:00',
    Motiu: 'Projecció documental per a l\'alumnat',
    Estat: 'Confirmada', Creat_el: '2026-06-22 08:30', _rowIndex: 5,
  },
]

const ESTATS: Array<EstatReserva | ''> = ['', 'Pendent', 'Confirmada', 'Cancel·lada']

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${45 + (i * 17) % 50}%` }} />
        </td>
      ))}
    </tr>
  )
}

function EstatBadge({ estat }: { estat: EstatReserva }) {
  const map: Record<EstatReserva, string> = {
    Pendent: 'bg-amber-100 text-amber-700 border-amber-200',
    Confirmada: 'bg-green-100 text-green-700 border-green-200',
    'Cancel·lada': 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[estat]}`}>
      {estat}
    </span>
  )
}

interface Props {
  onNova: () => void
  onVeureDetall: (reserva: Reserva) => void
  loading?: boolean
  reserves?: Reserva[]
  error?: string | null
  onRefresh?: () => void
}

export function ReservesPage({
  onNova,
  onVeureDetall,
  loading = false,
  reserves = MOCK,
  error = null,
  onRefresh,
}: Props) {
  const [cerca, setCerca] = useState('')
  const [filtreEstat, setFiltreEstat] = useState<EstatReserva | ''>('')
  const [filtreData, setFiltreData] = useState('')

  const filtrades = useMemo(() => {
    const q = cerca.toLowerCase()
    return [...reserves]
      .sort((a, b) => {
        const cmp = a.Data.localeCompare(b.Data)
        if (cmp !== 0) return cmp
        return a.Hora_inici.localeCompare(b.Hora_inici)
      })
      .filter((r) => {
        if (filtreEstat && r.Estat !== filtreEstat) return false
        if (filtreData && r.Data !== filtreData) return false
        if (q) {
          const h = `${r.ID} ${r.Espai} ${r.Usuari} ${r.Email} ${r.Motiu}`.toLowerCase()
          if (!h.includes(q)) return false
        }
        return true
      })
  }, [reserves, filtreEstat, filtreData, cerca])

  const comptadors = useMemo(() => ({
    avui: reserves.filter((r) => isDiaAvui(r.Data) && r.Estat !== 'Cancel·lada').length,
    pendents: reserves.filter((r) => r.Estat === 'Pendent').length,
    confirmades: reserves.filter((r) => r.Estat === 'Confirmada').length,
  }), [reserves])

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Capçalera */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-primary" />
            <div>
              <h1 className="text-lg font-semibold text-text-main">Reserves d'espais</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? 'Carregant...' : `${filtrades.length} de ${reserves.length} reserves`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Actualitzar"
                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
            <button
              onClick={onNova}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#861414' }}
            >
              <Plus size={16} />
              Nova reserva
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-5 mb-4">
          {[
            { label: 'Avui', val: comptadors.avui, color: '#861414' },
            { label: 'Pendents', val: comptadors.pendents, color: '#d97706' },
            { label: 'Confirmades', val: comptadors.confirmades, color: '#15803d' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-xl font-bold" style={{ color }}>{val}</span>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
              placeholder="Cercar per espai, usuari, motiu..."
              className="input pl-8 text-sm w-full"
            />
          </div>
          <input
            type="date"
            value={filtreData}
            onChange={(e) => setFiltreData(e.target.value)}
            className="input text-sm w-44"
            title="Filtrar per data"
          />
          <select
            value={filtreEstat}
            onChange={(e) => setFiltreEstat(e.target.value as EstatReserva | '')}
            className="input text-sm w-40"
          >
            <option value="">Tots els estats</option>
            {ESTATS.slice(1).map((e) => <option key={e}>{e}</option>)}
          </select>
          {(filtreData || filtreEstat || cerca) && (
            <button
              onClick={() => { setCerca(''); setFiltreData(''); setFiltreEstat('') }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2"
            >
              Netejar filtres
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Taula */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Espai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Data i hora</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Usuari</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

            {!loading && filtrades.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-gray-400 text-sm">
                  {reserves.length === 0
                    ? 'Encara no hi ha reserves registrades.'
                    : 'Cap reserva coincideix amb els filtres.'}
                </td>
              </tr>
            )}

            {!loading && filtrades.map((r) => {
              const esAvui = isDiaAvui(r.Data)
              return (
                <tr
                  key={r.ID}
                  onClick={() => onVeureDetall(r)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors group ${esAvui && r.Estat === 'Confirmada' ? 'bg-green-50/40' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-primary group-hover:underline">{r.ID}</span>
                    {esAvui && r.Estat !== 'Cancel·lada' && (
                      <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Avui</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text-main">{r.Espai}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-48">{r.Motiu}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-700">{formatDate(r.Data)}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {formatTime(r.Hora_inici)} – {formatTime(r.Hora_fi)}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-gray-700">{r.Usuari}</p>
                    <p className="text-xs text-gray-400">{r.Email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <EstatBadge estat={r.Estat} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
