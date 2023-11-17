import { type Headers } from 'node-fetch'

/**
 * Интерфейс для построения и выполнения SQL-запросов.
 * @typeparam T - Тип ожидаемого результата запроса.
 */
export interface QueryBuilder<T> {
  table: string
  columns: string[]
  conditions: string

  from: (table: string) => QueryBuilder<T>

  select: (...columns: string[]) => QueryBuilder<T>

  where: (conditions: string) => QueryBuilder<T>

  /**
   * Выполняет запрос и возвращает первый результат.
   * @returns
   */
  first: () => Promise<T | null>

  /**
   * Выполняет запрос и возвращает все результаты.
   * @returns
   */
  all: () => Promise<T[] | null>

  /**
   * Удаляет записи, соответствующие условиям запроса.
   * @returns
   */
  delete: () => Promise<void>

  /**
   * Вставляет новую запись с предоставленными данными.
   * @param data - Данные для вставки.
   * @returns
   */
  insert: (data: Partial<T>) => Promise<T | null>

  /**
   * Обновляет записи, соответствующие условиям запроса, с предоставленными данными.
   * @param data - Данные для обновления.
   * @returns
   */
  update: (data: Partial<T>) => Promise<T | null>

  /**
   * Строит SQL-запрос для вставки данных.
   * @param data - Данные для вставки.
   * @returns
   */
  buildInsertQuery: (data: Partial<T>) => Promise<string>

  /**
   * Строит SQL-запрос для обновления данных.
   * @param data - Данные для обновления.
   * @returns
   */
  buildUpdateQuery: (data: Partial<T>) => Promise<string>

  /**
   * Выполняет пользовательский SQL-запрос.
   * @param sql - SQL-запрос.
   * @returns
   */
  customQueryRun: (sql: string) => Promise<T | null>
}

export type HTTPMethods = 'GET' | 'POST'

export interface ApiResponse<T> {
  data: T
  headers: Headers
  status: number
}
