export type EstatManteniment = 'Pendent' | 'En curs' | 'Completat' | 'Cancel·lat'
export type TipusManteniment = 'Preventiu' | 'Correctiu' | 'Actualització' | 'Neteja'
export type PerioditatManteniment = 'Única vegada' | 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual'

export interface Manteniment {
  ID: string
  Titol: string
  Tipus: TipusManteniment
  Dispositiu: string
  Descripcio: string
  Responsable: string
  Data_prevista: string
  Data_realitzat: string
  Estat: EstatManteniment
  Periodicitat: PerioditatManteniment
  Notes: string
  Creat_el: string
  _rowIndex: number
}

export interface MantenimentFormData {
  Titol: string
  Tipus: TipusManteniment
  Dispositiu: string
  Descripcio: string
  Responsable: string
  Data_prevista: string
  Data_realitzat: string
  Estat: EstatManteniment
  Periodicitat: PerioditatManteniment
  Notes: string
}
