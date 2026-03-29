export type AppwriteColumnKind =
  | 'varchar'
  | 'text'
  | 'integer'
  | 'boolean'
  | 'datetime'
  | 'enum'

export type AppwriteIndexType = 'key' | 'unique' | 'fulltext' | 'spatial'

export interface AppwriteColumnSchema {
  key: string
  kind: AppwriteColumnKind
  required: boolean
  array?: boolean
  size?: number
  elements?: readonly string[]
  description?: string
}

export interface AppwriteIndexSchema {
  key: string
  type: AppwriteIndexType
  columns: readonly string[]
  orders?: readonly ('asc' | 'desc')[]
  description?: string
}

export interface AppwriteTableSchema {
  id: string
  name: string
  status: 'live' | 'planned'
  description?: string
  columns: readonly AppwriteColumnSchema[]
  indexes?: readonly AppwriteIndexSchema[]
}
