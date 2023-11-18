import { Client } from 'pg'

/**
 * Выполняет SQL-запрос с использованием предоставленного клиента.
 * @param query - SQL-запрос для выполнения.
 * @param values - Массив значений для подстановки в параметризованный запрос.
 * @param client - Клиент базы данных.
 * @returns Промис, разрешающийся к строкам результата.
 */

export const executeQuery = async <T>(
  query: string,
  values: unknown[] = [],
  client: Client,
): Promise<T[]> => {
  try {
    console.log(query, values)
    const result = await client.query<T>(query, values)
    return result.rows
  } catch (e) {
    console.error('Ошибка выполнения запроса: ', e)
    throw e
  }
}
