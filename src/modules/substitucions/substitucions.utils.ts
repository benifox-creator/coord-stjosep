import type { Substitucio } from './types'

export const SHEET_SUBSTITUCIONS = 'Substitucions'
export const HEADERS_SUBSTITUCIONS = [
  'ID', 'Data', 'Etapa', 'Franja', 'Tipus',
  'ProfessorAbsent', 'ProfessorSubstitut', 'Grup', 'Materia',
  'Estat', 'Notes', 'Creat_el', 'Creat_per',
]

function pad(n: number) { return String(n).padStart(2, '0') }

export function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDateTimeISO(d: Date): string {
  return `${formatDateISO(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function generateSubstitucioId(existing: Substitucio[]): string {
  const nums = existing
    .map((s) => parseInt(s.ID.replace('SUB-', ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `SUB-${String(next).padStart(3, '0')}`
}

const DIES_CA_LLARG = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte']
const MESOS_CA_LLARG = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre']
const MESOS_CA_CURT = ['gen', 'feb', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'des']

export function formatDiaLlarg(d: Date): string {
  return `${DIES_CA_LLARG[d.getDay()]} ${d.getDate()} ${MESOS_CA_CURT[d.getMonth()]}.`
}

export function formatWeekRange(dates: Date[]): string {
  const first = dates[0]
  const last  = dates[4]
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${MESOS_CA_LLARG[last.getMonth()]} ${last.getFullYear()}`
  }
  return `${first.getDate()} ${MESOS_CA_CURT[first.getMonth()]}. – ${last.getDate()} ${MESOS_CA_CURT[last.getMonth()]}. ${last.getFullYear()}`
}

export function getWeekDates(weekOffset: number): Date[] {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function isThisWeek(date: Date, weekDates: Date[]): boolean {
  const iso = formatDateISO(date)
  return weekDates.some((d) => formatDateISO(d) === iso)
}

export function rowToSubstitucio(row: Record<string, string>, idx: number): Substitucio {
  return {
    ID: row['ID'] ?? '',
    Data: row['Data'] ?? '',
    Etapa: (row['Etapa'] as Substitucio['Etapa']) ?? 'ESO 1r-2n',
    Franja: row['Franja'] ?? '',
    Tipus: (row['Tipus'] as Substitucio['Tipus']) ?? 'Classe',
    ProfessorAbsent: row['ProfessorAbsent'] ?? '',
    ProfessorSubstitut: row['ProfessorSubstitut'] ?? '',
    Grup: row['Grup'] ?? '',
    Materia: row['Materia'] ?? '',
    Estat: (row['Estat'] as Substitucio['Estat']) ?? 'Pendent',
    Notes: row['Notes'] ?? '',
    Creat_el: row['Creat_el'] ?? '',
    Creat_per: row['Creat_per'] ?? '',
    _rowIndex: idx,
  }
}

export function substitucioToRow(s: Omit<Substitucio, '_rowIndex'>): Record<string, string> {
  return {
    ID: s.ID, Data: s.Data, Etapa: s.Etapa, Franja: s.Franja, Tipus: s.Tipus,
    ProfessorAbsent: s.ProfessorAbsent, ProfessorSubstitut: s.ProfessorSubstitut,
    Grup: s.Grup, Materia: s.Materia, Estat: s.Estat,
    Notes: s.Notes, Creat_el: s.Creat_el, Creat_per: s.Creat_per,
  }
}

export function buildEmailSubstitucio(
  s: Substitucio,
  nomSubstitut: string,
): { subject: string; body: string } {
  const d = new Date(s.Data + 'T00:00:00')
  const diaStr = `${DIES_CA_LLARG[d.getDay()]}, ${d.getDate()} de ${MESOS_CA_LLARG[d.getMonth()]} de ${d.getFullYear()}`
  const subject = `Substitució assignada — ${diaStr} · ${s.Franja}`
  const lines = [
    `Hola ${nomSubstitut},`,
    '',
    `Se t'ha assignat una substitució:`,
    '',
    `  Data:     ${diaStr}`,
    `  Franja:   ${s.Franja}`,
    `  Tipus:    ${s.Tipus}`,
    `  Etapa:    ${s.Etapa}`,
    ...(s.Tipus === 'Classe' ? [
      `  Grup:     ${s.Grup}`,
      `  Matèria:  ${s.Materia}`,
      `  Professor absent: ${s.ProfessorAbsent}`,
    ] : []),
    ...(s.Notes ? ['', `  Notes: ${s.Notes}`] : []),
    '',
    `Accedeix a la plataforma per veure els detalls i marcar-la com a realitzada quan acabis.`,
    '',
    '— Coordinació Digital · Col·legi Sant Josep Obrer',
  ]
  return { subject, body: lines.join('\n') }
}
