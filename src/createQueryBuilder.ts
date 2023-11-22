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
      const query = {
        text: `SELECT ${this.columns.join(', ')} FROM $1 WHERE $2 LIMIT 1`,
        values: [this.table, this.conditions],
      }

      const result = await executeQuery<T>(query.text, query.values, client)

      if (!result || result.length === 0) {
        return null
      }

      return result[0]
    },

    async all(): Promise<T[] | null> {
      const query = {
        text: `SELECT ${this.columns.join(', ')} FROM $1 WHERE $2`,
        values: [this.table, this.conditions],
      }

      const result = await executeQuery<T>(query.text, query.values, client)

      return result ?? null
    },

    async delete(): Promise<void> {
      const query = {
        text: `DELETE FROM $1 WHERE $2`,
        values: [this.table, this.conditions],
      }

      await executeQuery(query.text, query.values, client)
    },

    async buildInsertQuery(data: Partial<T>): Promise<string> {
      const columns = Object.keys(data).join(', ')
      const values = buildValuesString(data)

      return `INSERT INTO ${this.table} (${columns}) VALUES (${values})`
    },

    async insert(data: Partial<T>): Promise<T | null> {
      const columns = Object.keys(data)
        .map((col) => `"${col}"`)
        .join(', ')
      const values = buildValuesString(data)
      const query = {
        text: `INSERT INTO $1 (${columns}) VALUES (${values}) RETURNING *`,
        values: [this.table],
      }

      return (
        (await executeQuery<T>(query.text, query.values, client))[0] ?? null
      )
    },

    async buildUpdateQuery(data: Partial<T>): Promise<string> {
      const updateValues = Object.entries(data)
        .map(([column, value]) => {
          if (typeof value === 'string') {
            return `"${column}" = $1`
          }

          return `"${String(column)}" = $1`
        })
        .join(', ')

      return `UPDATE ${this.table} SET ${updateValues} WHERE ${this.conditions} RETURNING *`
    },

    async update(data: Partial<T>): Promise<T | null> {
      const query = await this.buildUpdateQuery(data)
      const result = await executeQuery<T>(query, [], client)

      return result[0] ?? null
    },

    // TODO: сделать безопаснее
    async customQueryRun(sql: string): Promise<T[] | null> {
      const result = await executeQuery<T>(sql, [], client)

      return result ?? null
    },
  }
}

export default createQueryBuilder
