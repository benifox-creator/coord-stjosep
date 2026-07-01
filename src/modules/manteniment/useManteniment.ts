import { useCallback, useEffect, useState } from 'react'
import { getRows, appendRow, updateRow, deleteRow } from '../../services/sheets'
import {
  SHEET_MANTENIMENT, HEADERS_MANTENIMENT, ensureHeadersManteniment,
  generateMantenimentId, formatDateTimeISO,
} from './manteniment.utils'
import type { Manteniment, MantenimentFormData, EstatManteniment } from './types'

function rowToManteniment(row: Record<string, string>, index: number): Manteniment {
  return {
    ID: row['ID'] ?? '',
    Titol: row['Titol'] ?? '',
    Tipus: (row['Tipus'] as Manteniment['Tipus']) || 'Preventiu',
    Dispositiu: row['Dispositiu'] ?? '',
    Descripcio: row['Descripcio'] ?? '',
    Responsable: row['Responsable'] ?? '',
    Data_prevista: row['Data_prevista'] ?? '',
    Data_realitzat: row['Data_realitzat'] ?? '',
    Estat: (row['Estat'] as EstatManteniment) || 'Pendent',
    Periodicitat: (row['Periodicitat'] as Manteniment['Periodicitat']) || 'Única vegada',
    Notes: row['Notes'] ?? '',
    Creat_el: row['Creat_el'] ?? '',
    _rowIndex: index,
  }
}

function mantenimentToRow(m: Manteniment): Record<string, string> {
  return [...HEADERS_MANTENIMENT].reduce((acc, h) => {
    acc[h] = m[h as keyof Omit<Manteniment, '_rowIndex'>] ?? ''
    return acc
  }, {} as Record<string, string>)
}

export function useManteniment() {
  const [manteniments, setManteniments] = useState<Manteniment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await ensureHeadersManteniment()
      const rows = await getRows(SHEET_MANTENIMENT)
      setManteniments(rows.flatMap((r, i) => r['Eliminat'] === 'true' ? [] : [rowToManteniment(r, i)]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function crear(data: MantenimentFormData): Promise<void> {
    const nou: Manteniment = {
      ID: generateMantenimentId(manteniments.map((m) => m.ID)),
      ...data,
      Creat_el: formatDateTimeISO(new Date()),
      _rowIndex: -1,
    }
    await appendRow(SHEET_MANTENIMENT, mantenimentToRow(nou))
    await fetchData()
  }

  async function editar(m: Manteniment, data: MantenimentFormData): Promise<void> {
    await updateRow(SHEET_MANTENIMENT, m._rowIndex, mantenimentToRow({ ...m, ...data }))
    await fetchData()
  }

  async function canviarEstat(m: Manteniment, estat: EstatManteniment): Promise<void> {
    const updated = { ...m, Estat: estat }
    if (estat === 'Completat' && !m.Data_realitzat) {
      updated.Data_realitzat = new Date().toISOString().slice(0, 10)
    }
    await updateRow(SHEET_MANTENIMENT, m._rowIndex, mantenimentToRow(updated))
    await fetchData()
  }

  async function eliminar(m: Manteniment): Promise<void> {
    await deleteRow(SHEET_MANTENIMENT, m._rowIndex)
    await fetchData()
  }

  return { manteniments, loading, error, crear, editar, canviarEstat, eliminar, refetch: fetchData }
}
