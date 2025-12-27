// lib/cache-db.ts
import { AlbumProps, ImageProps } from "@/types";
import Cache from "./cache";
import AlbumImageDatabaseRepository, { AlbumRepo, DatabaseConnector, ImageRepo, JournalRepo } from "./database";
import { Logger, uiLogger } from './logger';
import { UnitOFWork } from "./uow";

export default class DBWithCache {
      private connector: DatabaseConnector;
      private localMemCache: Cache;
      private dbRepo!: AlbumImageDatabaseRepository;
      private static instance: DBWithCache;
      private albumRepo!: AlbumRepo;
      private imageRepo!: ImageRepo;
      private journalRepo!: JournalRepo;
      private isReady: boolean = false;
      private logger: Logger;

      private constructor(logger?: Logger) {
            this.connector = DatabaseConnector.getInstance();
            this.localMemCache = Cache.getInstance();
            this.logger = logger || uiLogger;
      }
      
      static getInstance(logger?: Logger): DBWithCache {
            if (!DBWithCache.instance) {
                  const instance = new DBWithCache(logger);
                  DBWithCache.instance = instance;
            }
            return DBWithCache.instance;
      }
      
      async dbConnect() {
            const db = await this.connector.initAsync();
            this.dbRepo = new AlbumImageDatabaseRepository(db, this.logger);
            await this.dbRepo.initTablesAsync();
            this.albumRepo = new AlbumRepo(db, this.logger);
            this.imageRepo = new ImageRepo(db);
            this.journalRepo = new JournalRepo(db);
            this.isReady = true;
      }

      async runTransaction<T>(callback_fn: (albumRepo: AlbumRepo, imageRepo: ImageRepo) => Promise<T>): Promise<T> {
            if (!this.isReady) {
                  throw new Error("DB not initialized");
            }

            const db = this.dbRepo.getDb();
            
            await db.execAsync('BEGIN TRANSACTION');

            try {
                  const result = await callback_fn(this.albumRepo, this.imageRepo);
                  await db.execAsync('COMMIT');
                  return result;
            } catch (err) {
                  await db.execAsync('ROLLBACK');
                  throw err;
            }
            
      }
      
      async runUnitOfWork<T>(callback_fn: (uow: UnitOFWork) => Promise<T>): Promise<T> {
            if (!this.isReady) throw new Error("DB not initialized");

            const db = this.dbRepo.getDb();

            await db.execAsync("BEGIN TRANSACTION");

            const uow = new UnitOFWork(
                  new AlbumRepo(db),
                  new ImageRepo(db),
                  new JournalRepo(db)
            );

            try {
                  const result = await callback_fn(uow);
                  await db.execAsync("COMMIT");
                  return result;
            } catch (error) {
                  await db.execAsync("ROLLBACK");
                  throw error;
            }
            
      }

      async getAlbums(): Promise<AlbumProps[]> {
            if (!this.isReady) {
                  throw new Error("DB not initialized");
            }

            const cache_key = 'albums::all';
            
            if (this.localMemCache.exists(cache_key)) {
                  return this.localMemCache.getData<AlbumProps[]>(cache_key) || [];
            }
            
            const sql_albums = await this.albumRepo.getAlbumsWithFirstImage();
            if(sql_albums.length > 0){
                  this.localMemCache.addData<AlbumProps[]>(cache_key, sql_albums as AlbumProps[], 5 * 60 * 1000);
            }
            return sql_albums as AlbumProps[];
      }

      async getImages(album_id: number): Promise<ImageProps[]> {
            if (!this.isReady) {
                  throw new Error("DB not initialized");
            }

            const cache_key = `album::${album_id}::thumbnails`;
            
            if (this.localMemCache.exists(cache_key)) {
                  return this.localMemCache.getData<ImageProps[]>(cache_key) || [];
            }

            const sql_images = await this.imageRepo.getImages(album_id);
            
            if(sql_images.length > 0){
                  this.localMemCache.addData<ImageProps[]>(cache_key, sql_images as ImageProps[], 5 * 60 * 1000);
            }
            return sql_images as ImageProps[];
      }

      invalidateCache(type: 'albums' | 'images', albumId?: number): void {
            if (type === 'albums') {
                  this.localMemCache.deleteData('albums::all');
            } else if (type === 'images' && albumId) {
                  this.localMemCache.invalidatePattern(`album::${albumId}`);
            }
      }

      clearAllCache(): void {
            this.localMemCache.clear();
      }
}