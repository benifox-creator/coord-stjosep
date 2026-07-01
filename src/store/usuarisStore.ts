import { create } from 'zustand'
import { getRows, appendRow, updateRow, ensureSheetHeaders } from '../services/sheets'
import type { Rol, Usuari } from '../modules/usuaris/types'

const SHEET = 'Usuaris'
const HEADERS = ['Email', 'Nom', 'Rol', 'Data_alta']

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

const ROLS_VALIDS = new Set<string>(['coordinador', 'direccio', 'professorat', 'convidat'])

function parseRol(value: string | undefined): Rol {
  const v = value?.trim()
  if (v && ROLS_VALIDS.has(v)) return v as Rol
  return 'convidat'
}

function rowToUsuari(row: Record<string, string>, idx: number): Usuari {
  return {
    Email: row['Email'] ?? '',
    Nom: row['Nom'] ?? '',
    Rol: parseRol(row['Rol']),
    Data_alta: row['Data_alta'] ?? '',
    _rowIndex: idx,
  }
}

// ---------- Permisos ----------

export function potGestionar(rol: Rol | null): boolean {
  return rol === 'coordinador' || rol === 'direccio'
}

export function potEliminar(rol: Rol | null): boolean {
  return rol === 'coordinador'
}

export function potCrear(rol: Rol | null): boolean {
  return rol !== null && rol !== 'convidat'
}

// ---------- Store ----------

interface UsuarisState {
  rol: Rol | null
  accesNegat: boolean
  usuaris: Usuari[]
  loading: boolean
  error: string | null

  loadRol: (email: string, displayName?: string | null) => Promise<void>
  loadAll: () => Promise<void>
  updateRol: (usuari: Usuari, nouRol: Rol) => Promise<void>
  reset: () => void
}

export const useUsuarisStore = create<UsuarisState>((set) => ({
  rol: null,
  accesNegat: false,
  usuaris: [],
  loading: false,
  error: null,

  async loadRol(email, displayName) {
    set({ loading: true, error: null, accesNegat: false })
    try {
      let rows: Record<string, string>[]
      try {
        rows = await getRows(SHEET)
      } catch {
        try {
          await ensureSheetHeaders(SHEET, HEADERS)
          rows = await getRows(SHEET)
        } catch {
          set({ rol: 'convidat' })
          return
        }
      }

      const emailNorm = email.trim().toLowerCase()
      const idx = rows.findIndex((r) => r['Email']?.trim().toLowerCase() === emailNorm)

      if (idx !== -1) {
        const rol = parseRol(rows[idx]['Rol'])
        set({ rol, accesNegat: false })
      } else if (rows.length === 0) {
        try {
          await appendRow(SHEET, {
            Email: email,
            Nom: displayName ?? '',
            Rol: 'coordinador',
            Data_alta: formatDateISO(new Date()),
          })
          set({ rol: 'coordinador' })
        } catch {
          set({ accesNegat: true })
        }
      } else {
        set({ accesNegat: true })
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error carregant rol' })
      set({ accesNegat: true })
    } finally {
      set({ loading: false })
    }
  },

  async loadAll() {
    set({ loading: true, error: null })
    try {
      const rows = await getRows(SHEET)
      set({ usuaris: rows.map((r, i) => rowToUsuari(r, i)) })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error carregant usuaris' })
    } finally {
      set({ loading: false })
    }
  },

  async updateRol(usuari, nouRol) {
    const updated = { ...usuari, Rol: nouRol }
    const rowData: Record<string, string> = {
      Email: updated.Email,
      Nom: updated.Nom,
      Rol: updated.Rol,
      Data_alta: updated.Data_alta,
    }
    await updateRow(SHEET, usuari._rowIndex, rowData)
    set((s) => ({
      usuaris: s.usuaris.map((u) => u.Email === usuari.Email ? { ...u, Rol: nouRol } : u),
    }))
  },

  reset() {
    set({ rol: null, accesNegat: false, usuaris: [], loading: false, error: null })
  },
}))
