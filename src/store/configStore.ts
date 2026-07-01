import { create } from 'zustand'
import { getRows, appendRow, updateRow, ensureSheetHeaders } from '../services/sheets'

const SHEET = 'Config'
const HEADERS = ['Clau', 'Valors']

export const MODULS_VISIBILITAT = [
  { key: 'incidencies',  label: 'Incidències' },
  { key: 'inventari',    label: 'Inventari' },
  { key: 'material',     label: 'Material i Stock' },
  { key: 'prestecs',     label: 'Préstecs' },
  { key: 'reserves',     label: 'Reserves' },
  { key: 'panells',      label: 'Panells de Xarxa' },
  { key: 'coneixement',  label: 'Base de Coneixement' },
  { key: 'pla-accio',    label: "Pla d'Acció" },
  { key: 'manteniment',  label: 'Manteniment' },
] as const

export const ROLS_VISIBILITAT = ['direccio', 'professorat', 'convidat'] as const
export const ROL_VIS_LABELS: Record<string, string> = {
  direccio: 'Direcció',
  professorat: 'Professorat',
  convidat: 'Convidat',
}

// Helper reactiu: cal passar config (selector de zustand) per garantir re-renders
export function canAccessModul(
  config: Record<string, string[]>,
  visKey: string,
  rol: string | null,
): boolean {
  if (rol === 'coordinador') return true
  if (!rol) return false
  const key = `visibilitat.${visKey}`
  const saved = config[key]
  const vals = saved && saved.length > 0 ? saved : (CONFIG_DEFAULTS[key] ?? [])
  return vals.includes(rol)
}

export const CONFIG_DEFAULTS: Record<string, string[]> = {
  'reserves.espais': [
    "Aula d'informàtica", 'Sala de reunions', 'Sala de projecció',
    'Laboratori de ciències', 'Biblioteca', 'Aula polivalent',
    "Sala d'actes", 'Gimnàs', 'Pati exterior', 'Altres',
  ],
  'material.categories': [
    'Cable', 'Adaptador', 'Àudio/Vídeo', 'Perifèric',
    'Emmagatzematge', 'Bateria/Carregador', 'Projecció', 'Altre',
  ],
  'inventari.categories': [
    'Portàtil', 'Ordinador', 'Tauleta', 'Projector',
    'Impressora', 'Switch/Router', 'Monitor', 'Servidor', 'Altre',
  ],
  'incidencies.tipus': [
    'Maquinari', 'Programari', 'Xarxa', 'Projector/Pantalla', 'Impressora', 'Altre',
  ],
  'incidencies.localitzacions': [
    'Aula informàtica', 'Sala de professors', 'Secretaria',
    'Biblioteca', 'Laboratori', "Sala d'actes", 'Altra',
  ],
  'coneixement.categories': [
    'Procediments', 'Infraestructura', 'Dispositius', 'Incidències freqüents', 'Administratiu',
  ],
  'pla-accio.categories': [
    'Xarxa', 'Equipament', 'Programari', 'Seguretat', 'Formació', 'Infraestructura',
  ],
  'manteniment.email': [],
  'reserves.espais-colors': [],
  // Visibilitat per defecte: tots els rols veuen tots els mòduls
  'visibilitat.incidencies':  ['direccio', 'professorat', 'convidat'],
  'visibilitat.inventari':    ['direccio', 'professorat', 'convidat'],
  'visibilitat.material':     ['direccio', 'professorat', 'convidat'],
  'visibilitat.prestecs':     ['direccio', 'professorat', 'convidat'],
  'visibilitat.reserves':     ['direccio', 'professorat', 'convidat'],
  'visibilitat.panells':      ['direccio', 'professorat', 'convidat'],
  'visibilitat.coneixement':  ['direccio', 'professorat', 'convidat'],
  'visibilitat.pla-accio':    ['direccio', 'professorat', 'convidat'],
  'visibilitat.manteniment':  ['direccio', 'professorat', 'convidat'],
}

interface ConfigState {
  config: Record<string, string[]>
  loaded: boolean
  loading: boolean
  error: string | null
  getValues: (clau: string) => string[]
  load: () => Promise<void>
  update: (clau: string, valors: string[]) => Promise<void>
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: {},
  loaded: false,
  loading: false,
  error: null,

  getValues(clau) {
    const saved = get().config[clau]
    return saved && saved.length > 0 ? saved : (CONFIG_DEFAULTS[clau] ?? [])
  },

  async load() {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const rows = await getRows(SHEET)
      const config: Record<string, string[]> = {}
      for (const row of rows) {
        if (row['Clau'] && row['Valors']) {
          config[row['Clau']] = row['Valors'].split(';').filter(Boolean)
        }
      }
      set({ config, loaded: true })
    } catch {
      // Full no existeix o sense accés — usem defaults silenciosament
      set({ loaded: true })
    } finally {
      set({ loading: false })
    }
  },

  async update(clau, valors) {
    set((s) => ({ config: { ...s.config, [clau]: valors } }))
    await ensureSheetHeaders(SHEET, HEADERS)
    const rows = await getRows(SHEET)
    const idx = rows.findIndex((r) => r['Clau'] === clau)
    const rowData = { Clau: clau, Valors: valors.join(';') }
    if (idx !== -1) {
      await updateRow(SHEET, idx, rowData)
    } else {
      await appendRow(SHEET, rowData)
    }
  },
}))
