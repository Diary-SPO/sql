import crypto from './src/crypto'

async function executeQuery<T> (query: string, client: any): Promise<T[]> {
  try {
    console.log(query)
    const result = await client.query(query)
    return result.rows
  } catch (e) {
    console.error('Error executing query: ', e);
    throw e;
  }
}

// TODO: ADD ENCRYPT_KEY
export const decryptData = (data: string | null, ENCRYPT_KEY: string): string => {
  return crypto.decrypt(data ?? '', ENCRYPT_KEY)
}

interface QueryBuilder<T> {
  table: string
  columns: string[]
  conditions: string

  from: (table: string) => QueryBuilder<T>

  select: (...columns: string[]) => QueryBuilder<T>

  where: (conditions: string) => QueryBuilder<T>

  first: () => Promise<T | null>

  all: () => Promise<T[] | null>

  delete: () => Promise<void>

  insert: (data: Partial<T>) => Promise<T | null>

  update: (data: Partial<T>) => Promise<T | null>

  buildInsertQuery: (data: Partial<T>) => Promise<string>

  buildUpdateQuery: (data: Partial<T>) => Promise<string>

  customQueryRun: (sql: string) => Promise<T | null>
}

export function createQueryBuilder<T> (client: any): QueryBuilder<T> {
  return {
    table: '',
    columns: ['*'],
    conditions: '',

    from (table) {
      this.table = table
      return this
    },

    select (...columns) {
      this.columns = columns
      return this
    },

    where (conditions) {
      this.conditions = conditions
      return this
    },

    async first (): Promise<T | null> {
      const result = await this.all()

      if (result === null || result.length === 0) {
        return null
      }

      return result[0]
    },

    async all (): Promise<T[] | null> {
      const query = `SELECT ${this.columns.join(', ')} FROM "${this.table}" WHERE ${this.conditions} LIMIT 1`
      const result = await executeQuery<T>(query, client)
      return result || null
    },

    async delete (): Promise<void> {
      const query = `DELETE FROM "${this.table}" WHERE ${this.conditions}`
      await executeQuery(query, client)
    },

    async buildInsertQuery (data: Partial<T>): Promise<string> {
      const columns = Object.keys(data).join(', ')
      const values = Object.values(data).map((value) => typeof value === 'string' ? `'${value}'` : value).join(', ')
      return `INSERT INTO ${this.table} (${columns}) VALUES (${values})`
    },

    async insert (data: Partial<T>): Promise<T | null> {
      const columns = `"${Object.keys(data).join('", "')}"`
      const values = Object.values(data).map((value) => typeof value === 'string' ? `'${value}'` : value).join(', ')
      const query = `INSERT INTO "${this.table}" (${columns}) VALUES (${values}) RETURNING *`
      return (await executeQuery<T>(query, client))[0] || null
    },

    async buildUpdateQuery (data: Partial<T>): Promise<string> {
      const updateValues = Object.entries(data)
        .map(([column, value]) => {
          if (typeof value === 'string') {
            return `"${column}" = '${value}'`
          }
          return `"${String(column)}" = ${String(value)}`
        })
        .join(', ')

      return `UPDATE "${this.table}" SET ${updateValues} WHERE ${this.conditions} RETURNING *`
    },

    async update (data: Partial<T>): Promise<T | null> {
      return (await executeQuery<T>(await this.buildUpdateQuery(data), client))[0] || null
    },

    async customQueryRun (sql: string): Promise<T | null> {
      return (await executeQuery<T>(sql, client))[0] || null
    }
  }
}
