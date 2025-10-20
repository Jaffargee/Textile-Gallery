import * as SQLite from 'expo-sqlite';

const DB_NAME = 'download_cache.db';
const TABLE_NAME = 'downloaded_files'

export class CacheService {
      private db: SQLite.SQLiteDatabase;

      constructor() {
            // Initialize and open the database connection
            this.db = SQLite.openDatabaseSync(DB_NAME);
            this.ensureTableExists();
      }

      private ensureTableExists() {
            // This query runs synchronously when the service is instantiated
            this.db.execSync(`
                  CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                        remote_url TEXT PRIMARY KEY NOT NULL,
                        local_uri TEXT NOT NULL,
                        downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
                  );
            `);
      }

      // --- Public Cache Methods ---

      /**
       * Looks up a file by its remote URL.
       * @returns The local URI string if found, otherwise null.
      */
      public async lookup(remoteUrl: string): Promise<string | null> {
            try {
                  const result = await this.db.getFirstAsync<{ local_uri: string }>(
                        `SELECT local_uri FROM ${TABLE_NAME} WHERE remote_url = ?;`, 
                        [remoteUrl]
                  );
                  return result ? result.local_uri : null;
            } catch (e) {
                  console.error("Cache lookup failed:", e);
                  return null;
            }
      }

      /**
      * Stores a new successful download entry.
      */
      public async store(remoteUrl: string, localUri: string): Promise<void> {
            try {
                  await this.db.runAsync(
                        `INSERT OR REPLACE INTO ${TABLE_NAME} (remote_url, local_uri) VALUES (?, ?);`, 
                        [remoteUrl, localUri]
                  );
            } catch (e) {
                  console.error("Cache store failed:", e);
            }
      }

}