import { create } from 'zustand'
import { getRows, appendRow, updateRow, deleteRow, ensureSheetHeaders } from '../../services/sheets'
import { sendEmail } from '../../services/gmail'
import { useAuthStore } from '../../store/authStore'
import { useUsuarisStore } from '../../store/usuarisStore'
import type { Substitucio, SubstitucioFormData, EstatSubstitucio } from './types'
import {
  SHEET_SUBSTITUCIONS, HEADERS_SUBSTITUCIONS,
  generateSubstitucioId, formatDateTimeISO,
  rowToSubstitucio, substitucioToRow, buildEmailSubstitucio,
} from './substitucions.utils'

interface SubstitucionsState {
  substitucions: Substitucio[]
  loading: boolean
  error: string | null
  load: () => Promise<void>
  crear: (data: SubstitucioFormData) => Promise<void>
  canviarEstat: (s: Substitucio, estat: EstatSubstitucio) => Promise<void>
  eliminar: (s: Substitucio) => Promise<void>
}

export const useSubstitucions = create<SubstitucionsState>((set, get) => ({
  substitucions: [],
  loading: false,
  error: null,

  async load() {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      await ensureSheetHeaders(SHEET_SUBSTITUCIONS, HEADERS_SUBSTITUCIONS)
      const rows = await getRows(SHEET_SUBSTITUCIONS)
      set({ substitucions: rows.map((r, i) => rowToSubstitucio(r, i)) })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error carregant substitucions' })
    } finally {
      set({ loading: false })
    }
  },

  async crear(data) {
    const current = get().substitucions
    const emailCreador = useAuthStore.getState().user?.email ?? ''
    const id = generateSubstitucioId(current)
    const ara = formatDateTimeISO(new Date())

    const nova: Omit<Substitucio, '_rowIndex'> = {
      ID: id,
      Data: data.Data,
      Etapa: data.Etapa,
      Franja: data.Franja,
      Tipus: data.Tipus,
      ProfessorAbsent: data.ProfessorAbsent,
      ProfessorSubstitut: data.ProfessorSubstitut,
      Grup: data.Grup,
      Materia: data.Materia,
      Estat: 'Pendent',
      Notes: data.Notes,
      Creat_el: ara,
      Creat_per: emailCreador,
    }

    await ensureSheetHeaders(SHEET_SUBSTITUCIONS, HEADERS_SUBSTITUCIONS)
    await appendRow(SHEET_SUBSTITUCIONS, substitucioToRow(nova))
    const rows = await getRows(SHEET_SUBSTITUCIONS)
    set({ substitucions: rows.map((r, i) => rowToSubstitucio(r, i)) })

    try {
      const usuaris = useUsuarisStore.getState().usuaris
      const substitut = usuaris.find((u) => u.Email === data.ProfessorSubstitut)
      if (substitut) {
        const { subject, body } = buildEmailSubstitucio({ ...nova, _rowIndex: -1 }, substitut.Nom || substitut.Email)
        await sendEmail({ to: substitut.Email, subject, body })
      }
    } catch {
      // error d'email és no bloquejant
    }
  },

  async canviarEstat(s, estat) {
    const updated: Substitucio = { ...s, Estat: estat }
    await updateRow(SHEET_SUBSTITUCIONS, s._rowIndex, substitucioToRow(updated))
    set((st) => ({
      substitucions: st.substitucions.map((x) => (x.ID === s.ID ? updated : x)),
    }))
  },

  async eliminar(s) {
    await deleteRow(SHEET_SUBSTITUCIONS, s._rowIndex)
    const rows = await getRows(SHEET_SUBSTITUCIONS)
    set({ substitucions: rows.map((r, i) => rowToSubstitucio(r, i)) })
  },
}))
