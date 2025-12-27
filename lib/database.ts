import { AlbumProps } from '@/types';
import { Action, JournalStatus } from '@/types/journal';
import * as SQLite from 'expo-sqlite';
import { Logger, uiLogger } from './logger';

export class DatabaseConnector{
      static dbConnectorInstance: DatabaseConnector;

      private constructor() {}

      static getInstance() {
            if(!DatabaseConnector.dbConnectorInstance){
                  DatabaseConnector.dbConnectorInstance = new DatabaseConnector();
            }
            return DatabaseConnector.dbConnectorInstance;
      }

      async initAsync(databaseName: string = 'tahir_general_db', options?: SQLite.SQLiteOpenOptions | undefined, directory?: string): Promise<SQLite.SQLiteDatabase> {
            try {
                  const db = await SQLite.openDatabaseAsync(databaseName, options, directory);
                  return db;
            } catch (error) {
                  throw error;
            }
      }
      

}

export default class AlbumImageDatabaseRepository {

      private db: SQLite.SQLiteDatabase;
      private logger: Logger;

      constructor(db: SQLite.SQLiteDatabase, logger?: Logger) {
            this.db = db;
            this.logger = logger || uiLogger;
      }

      getDb(): SQLite.SQLiteDatabase {
            return this.db;
      }

      async initTablesAsync() {
            try {
                  await this.db.execAsync(`
                        PRAGMA foreign_keys = ON;

                        CREATE TABLE IF NOT EXISTS tahir_gallery_albums (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              cloud_id TEXT NOT NULL UNIQUE,
                              name TEXT NOT NULL UNIQUE,
                              local_uri TEXT NOT NULL,
                              cloud_uri TEXT,
                              no_items INTEGER DEFAULT 0 NULL,
                              size INTEGER DEFAULT 0 NULL,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );

                        CREATE TABLE IF NOT EXISTS tahir_gallery_images (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              cloud_id TEXT NOT NULL UNIQUE,
                              album_id INTEGER NOT NULL,
                              name TEXT NOT NULL,
                              local_uri TEXT NOT NULL,
                              cloud_uri TEXT,
                              size INTEGER DEFAULT 0,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (album_id) REFERENCES tahir_gallery_albums(id)
                                    ON DELETE CASCADE ON UPDATE CASCADE
                        );

                  `);
            } catch (error) {
                  throw error;
            }
      }

      async initJournalsAsync() {
            try {
                  await this.db.execAsync(`
                        PRAGMA foreign_keys = ON;

                        CREATE TABLE IF NOT EXISTS tahir_gallery_album_journals (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              album_id INTEGER NOT NULL,
                              local_uri TEXT NOT NULL,
                              action TEXT NOT NULL,
                              status TEXT NOT NULL,
                              error TEXT,
                              FOREIGN KEY (album_id) REFERENCES tahir_general_albums(id) ON DELETE CASCADE
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );

                        CREATE TABLE IF NOT EXISTS tahir_gallery_image_journals (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              album_id INTEGER NOT NULL,
                              image_id INTEGER NOT NULL,
                              local_uri TEXT NOT NULL,
                              action TEXT NOT NULL,
                              status TEXT NOT NULL,
                              error TEXT,
                              FOREIGN KEY (album_id) REFERENCES tahir_general_albums(id) ON DELETE CASCADE
                              FOREIGN KEY (image_id) REFERENCES tahir_general_images(id) ON DELETE CASCADE
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                  `);
                  this.logger?.info?.('Journals table initialized successfully');
            } catch (error) {
                  this.logger?.error?.('Failed to initialize journals table:', error);
                  throw error;
            }
      }

}      

export class AlbumRepo {

      private db: SQLite.SQLiteDatabase;
      private logger: Logger;

      constructor (db: SQLite.SQLiteDatabase, logger?: Logger) {
            this.db = db;
            this.logger = logger || uiLogger;
      }

      /**
       * 
       * @param values cloud_id, name, local_uri, cloud_uri
       * @returns Promise<SQLite.SQLiteRunResult>
       */
      async insertAlbum(values: [string, string, string, string]) {
            const sql = `INSERT INTO tahir_gallery_albums (cloud_id, name, local_uri, cloud_uri) 
                  VALUES (?, ?, ?, ?)`;
            try {
                  return await this.db.runAsync(sql, values);
            } catch (error: any) {
                  if (error.message?.includes('UNIQUE constraint')) {
                        this.logger?.info?.('Album already exists!');
                        return null; // Or throw a custom error
                  }
                  throw error;
            }
      }

      async updateAlbum(values: [string, string, string, string], id: number) {
            const sql = `UPDATE tahir_gallery_albums SET cloud_id = ?, name = ?, local_uri = ?, cloud_uri = ? WHERE id = ?`
            return await this.db.runAsync(sql, [...values, id]);
      }

      async deleteAlbum(id: number) {
            return await this.db.runAsync('DELETE FROM tahir_gallery_albums WHERE id = ?', id);
      }

      async getAlbum(id: number) {
            return await this.db.getFirstAsync('SELECT *FROM tahir_gallery_albums WHERE id = ?', id);
      }

      async getAlbums() {
            return await this.db.getAllAsync('SELECT *FROM tahir_gallery_albums');
      }

      async getAlbumByName(name: string) {
            return await this.db.getFirstAsync('SELECT *FROM tahir_gallery_albums WHERE name = ?', name);
      }

      async updateNoItems(values: [number, string]) {
            return await this.db.runAsync('UPDATE tahir_gallery_albums SET no_items = ? WHERE name = ?', values);
      }

      async updateSize(values: [number, string]) {
            return await this.db.runAsync('UPDATE tahir_gallery_albums SET size = ? WHERE name = ?', values);
      }

      async getAlbumsWithFirstImage(): Promise<AlbumProps[]> {
            const query = `
                  SELECT 
                  a.*,
                  i.local_uri as thumbnail_uri,
                  i.name as thumbnail_name
                  FROM tahir_gallery_albums a
                  LEFT JOIN (
                  SELECT album_id, local_uri, name,
                  ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY id ASC) as rn
                  FROM tahir_gallery_images
                  ) i ON a.id = i.album_id AND i.rn = 1
                  ORDER BY a.name
            `;

            const result = await this.db.getAllAsync(query);

            return result as AlbumProps[];
      }

}

export class ImageRepo{

      private db: SQLite.SQLiteDatabase;

      constructor (db: SQLite.SQLiteDatabase) {
            this.db = db;
      }

      async insertImage(values: [string, number, string, string, string, number]) {
            const sql = `INSERT INTO tahir_gallery_images (cloud_id, album_id, name, local_uri, cloud_uri, size) VALUES (?, ?, ?, ?, ?, ?)`;
            return await this.db.runAsync(sql, values);
      }

      async updateImage(values: [number, string, string, string, number, number, number], id: number) {
            const sql = `UPDATE tahir_gallery_images SET album_id = ?, name = ?, local_uri = ?, cloud_uri = ?, height = ?, width = ?, size = ? WHERE id = ?`
            return await this.db.runAsync(sql, [...values, id]);
      }

      async deleteImage( id: number) {
            return await this.db.runAsync('DELETE FROM tahir_gallery_images WHERE id = ?', id);
      }

      async getImages(album_id: number) {
            return await this.db.getAllAsync('SELECT *FROM tahir_gallery_images WHERE album_id = ?', album_id);
      }

      async getAllImages() {
            return await this.db.getAllAsync('SELECT *FROM tahir_gallery_images');
      }

      async getImage(id: number) {
            return await this.db.getFirstAsync('SELECT *FROM tahir_gallery_images WHERE id = ?', id);
      }

}

export class JournalRepo {

      private db: SQLite.SQLiteDatabase;

      constructor (db: SQLite.SQLiteDatabase) {
            this.db = db;
      }

      async insertAlbumJournal(values: [number, string, Action, JournalStatus]) {
            const sql = `INSERT INTO tahir_gallery_album_journals (album_id, local_uri, action, status) VALUES (?, ?, ?)`;
            return await this.db.runAsync(sql, values);
      }

      async insertImageJournal(values: [number, number, string, JournalStatus, Action]) {
            const sql = `INSERT INTO tahir_gallery_image_journals (album_id, image_id, local_uri, action, status) VALUES (?, ?, ?, ?)`;
            return await this.db.runAsync(sql, values);
      }

      async updateAlbumJournalStatus(values: [JournalStatus, Action, number]) {
            const sql = `UPDATE tahir_gallery_album_journals SET status = ?, action = ? WHERE id = ?`
            return await this.db.runAsync(sql, values);
      }

      async updateImageJournalStatus(values: [JournalStatus, Action, number]) {
            const sql = `UPDATE tahir_gallery_image_journals SET status = ?, action = ? WHERE id = ?`
            return await this.db.runAsync(sql, values);
      }

      async updateAlbumJournalError(values: [string, JournalStatus, Action, number]) {
            const sql = `UPDATE tahir_gallery_album_journals SET error = ?, status = ?, action = ? WHERE id = ?`
            return await this.db.runAsync(sql, values);
      }

      async updateImageJournalError(values: [string, JournalStatus, Action, number]) {
            const sql = `UPDATE tahir_gallery_image_journals SET error = ?, status = ?, action = ? WHERE id = ?`
            return await this.db.runAsync(sql, values);
      }

      async getPendingAlbumJournals() {
            return await this.db.getAllAsync('SELECT *FROM tahir_gallery_album_journals WHERE status = ?', 'PENDING');
      }

      async getPendingImageJournals() {
            return await this.db.getAllAsync('SELECT *FROM tahir_gallery_image_journals WHERE status = ?', 'PENDING');
      }

      async deleteAlbumJournal(id: number) {
            return await this.db.runAsync('DELETE FROM tahir_gallery_album_journals WHERE id = ?', id);
      }

      async deleteImageJournal(id: number) {
            return await this.db.runAsync('DELETE FROM tahir_gallery_image_journals WHERE id = ?', id);
      }

      async getAlbumJournal(id: number) {
            return await this.db.getFirstAsync('SELECT *FROM tahir_gallery_album_journals WHERE id = ?', id);
      }

      async getImageJournal(id: number) {
            return await this.db.getFirstAsync('SELECT *FROM tahir_gallery_image_journals WHERE id = ?', id);
      }

}