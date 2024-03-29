import { Client } from 'pg'
import { QueryBuilder } from './types'
import { buildValuesString, executeQuery } from './utils'

/**
 * Создает объект для построения и выполнения SQL-запросов.
 * @param client - Клиент базы данных.
 * @returns ответ из базы данных
 */

const createQueryBuilder = <T>(client: Client): QueryBuilder<T> => {
  return {
    table: '',
    columns: ['*'],
    conditions: '',

    from(table) {
      this.table = table
      return this
    },

    select(...columns) {
      this.columns = columns
      return this
    },

    where(conditions) {
      this.conditions = conditions
      return this
    },

    async first(): Promise<T | null> {
      const query = `SELECT ${this.columns.join(', ')} FROM "${
        this.table
      }" WHERE ${this.conditions} LIMIT 1`

      const result = await executeQuery<T>(query, client)

      return result[0] ?? null
    },

    async all(): Promise<T[] | null> {
      const query = `SELECT ${this.columns.join(', ')} FROM "${
        this.table
      }" WHERE ${this.conditions}`

      const result = await executeQuery<T>(query, client)

      return result ?? null
    },

    async delete(): Promise<void> {
      const query = `DELETE FROM "${this.table}" WHERE ${this.conditions}`

      await executeQuery(query, client)
    },

    async buildInsertQuery(data: Partial<T>): Promise<string> {
      const columns = Object.keys(data).join(', ')
      const values = buildValuesString(data)

      return `INSERT INTO ${this.table} (${columns}) VALUES (${values})`
    },

    async insert(data: Partial<T>): Promise<T[] | null> {
      const columns = `"${Object.keys(data).join('", "')}"`
      const values = buildValuesString(data)
      const query = `INSERT INTO "${this.table}" (${columns}) VALUES (${values}) RETURNING *`

      const result = await executeQuery<T>(query, client)
      return result ?? null
    },

    async buildUpdateQuery(data: Partial<T>): Promise<string> {
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

    async update(data: Partial<T>): Promise<T[]> {
      const result = await executeQuery<T>(
        await this.buildUpdateQuery(data),
        client,
      )

      return result ?? null
    },

    async customQueryRun(sql: string): Promise<T[] | null> {
      const result = await executeQuery<T>(sql, client)

      return result ?? null
    },
  }
}

export default createQueryBuilder
