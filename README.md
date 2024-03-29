# Deprecated. Own SQL Query builder

# @diary-spo/sql

# Установка

```bash
npm install @diary-spo/sql
```

```bash
yarn add @diary-spo/sql
```

```bash
bun add @diary-spo/sql
```

# Использование

### SQL builder

```ts
import { createQueryBuilder, executeQuery } from '@diary-spo/sql'
import { Client } from 'pg'

/* инициализация вашего клиента базы данных */
const client = new Client({})
await client.connect()

const queryBuilder = createQueryBuilder(client)

// Пример использования
const result = await queryBuilder
  .from('имя_вашей_таблицы')
  .select('колонка1', 'колонка2')
  .where('ваше_условие')
  .all()

console.log(result)
```

### Шифрование

```ts
import { encrypt, decrypt, buildValuesString } from '@diary-spo/sql'

// Пример использования
const ENCRYPT_KEY = 'ваш_ключ_шифрования'
const originalString = 'ваша_исходная_строка'

const encryptedValue = encrypt(originalString, ENCRYPT_KEY)
console.log('Зашифрованное Значение:', encryptedValue)

const decryptedValue = decrypt(encryptedValue, ENCRYPT_KEY)
console.log('Расшифрованное Значение:', decryptedValue)
```
