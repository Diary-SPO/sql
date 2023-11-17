/**
 * Создает строку значений, разделенных запятыми для SQL-запросов.
 * @param data - Данные, которые нужно отформатировать.
 * @returns Строка значений, разделенных запятыми.
 */

export const buildValuesString = (data: Record<string, any>): string => {
  return Object.values(data)
    .map((value) => (typeof value === 'string' ? `'${value}'` : value))
    .join(', ')
}
