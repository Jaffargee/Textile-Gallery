import { ImageDirProps } from '@/types';
import { Directory, Paths, File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

// Represents a contract for file system operations (optional, but good for DIP)
export interface IFileManager {
      createDirectory(parent_dir: string, relativePath: string): Promise<Directory>;
      ensureDirectoryExists(relativePath: string): Promise<boolean>;
      listDir(relativePath?: string):Promise<(Directory | File)[]>;
      removeDir(relativePath: string): Promise<{deleted: boolean, error: any, relativePath?: string}>;
}

export class FileManager implements IFileManager{
      private appDirectoryName = 'Tahir Gallery';
      static instance: FileManager;

      static getInstance() {
            if (!FileManager.instance) {
                  FileManager.instance = new FileManager();
            }
            return FileManager.instance;
      }

      public getAppDirectory() {
            return this.appDirectoryName;
      }

      // Utility Functions
      private getFullRelativePath(relativePath?: string): string {
            if(relativePath === this.getAppDirectory()) {
                  return this.getAppDirectory();
            }
            // Ensure relativePath doesn't start with a separator, as you did before.
            const normalizedPath = relativePath ? relativePath.replace(/^[/\\]/, '') : '';            
            // This is the full path relative to Paths.document
            return normalizedPath 
            ? `${this.getAppDirectory()}/${normalizedPath}` 
            : this.getAppDirectory();
      }

      // Helper to construct the full URI for getInfoAsync (the file:///... path)
      private getFullUri(relativePath?: string): string {
            return new Directory(Paths.document, this.getFullRelativePath(relativePath)).uri;
      }

      // Implementation Functions
      public async createDirectory(relativePath: string): Promise<Directory> {
            const fullPath = this.getFullRelativePath(relativePath);

            const targetDir = new Directory(Paths.document, fullPath);
            if(!targetDir.exists){
                  try{
                        targetDir.create()
                        console.log(`✅ Created directory: ${fullPath}`);
                  } catch (error) {
                        console.error(`❌ Failed to create directory: ${fullPath}`, error);
                        throw error;
                  }
            } else {
                  console.log(`Directory already exists: ${fullPath}`);
            }

            return targetDir;
      }

      public async removeDir(relativePath?: string, parent_dir: string = this.appDirectoryName): Promise<{ deleted: boolean; error: any; relativePath?: string; }> {
            const fullUri = this.getFullUri(relativePath);
           
            try{
                  const fileInfo = await FileSystem.getInfoAsync(fullUri);
                  if (!fileInfo.exists) {
                        console.log(`Path not found: ${relativePath}. Returning empty list.`); 
                        return {deleted: false, error: `Path not found: ${relativePath}. Returning empty list.`, relativePath: relativePath}; 
                  }
      
                  if (!fileInfo.isDirectory) {
                        console.warn(`Path is a file, not a directory: ${relativePath}.`);
                        return {deleted: false, error: `Path is a file, not a directory: ${relativePath}. Cannot delete a file.`, relativePath: relativePath}; 
                  }

                  if(fullUri === this.appDirectoryName){
                        Alert.alert('You cant deleted the app directory')
                        return {deleted: false, error: `Path is an app directory: ${relativePath}. Cannot delete a app directory.`, relativePath: relativePath}; 
                  }

                  const delDir = new Directory(fullUri);
                  delDir.delete()

                  return {deleted: true, error: `${relativePath} Deleted Successfully.`, relativePath: relativePath}; 

            } catch (error){
                  console.error('Failed to delete directory! =========================>>>>>> ', error);
                  throw error
            }
      }

      public async deleteFile(relativePath?: string, parent_dir: string = this.appDirectoryName): Promise<{ deleted: boolean; error: any; relativePath?: string; }> {
            const fullUri = this.getFullUri(this.getFullRelativePath(relativePath));
            try{
                  const fileInfo = await FileSystem.getInfoAsync(fullUri);
                  if (!fileInfo.exists) {
                        console.log(`Path not found: ${relativePath}. Returning empty list.`); 
                        return {deleted: false, error: `Path not found: ${relativePath}. Returning empty list.`, relativePath: relativePath}; 
                  }
      
                  if (fileInfo.isDirectory) {
                        console.warn(`Path is a directory, not a file: ${relativePath}.`);
                        return {deleted: false, error: `Path is a file, not a directory: ${relativePath}. Cannot delete a file.`, relativePath: relativePath}; 
                  }

                  if(fullUri === this.appDirectoryName){
                        Alert.alert('You cant deleted the app directory')
                        return {deleted: false, error: `Path is an app directory: ${relativePath}. Cannot delete a app directory.`, relativePath: relativePath}; 
                  }

                  const delDir = new Directory(fullUri);
                  delDir.delete()

                  return {deleted: true, error: `${relativePath} Deleted Successfully.`, relativePath: relativePath}; 

            } catch (error){
                  console.error('Failed to delete directory! =========================>>>>>> ', error);
                  throw error
            }
      }
      
      public async createDirectories(dirs: ImageDirProps[]){
            for (const dir of dirs) {
                  await this.createDirectory(dir.name as string);
            }
      }

      public async removeDirs(dirs: ImageDirProps[]) {
            for(const dir of dirs){
                  await this.removeDir(dir.name)
            }
      }

      public async ensureDirectoryExists(relativePath: string): Promise<boolean> {
            return (await this.createDirectory(relativePath)).exists;
      }

      public async listDir(relativePath?: string): Promise<(Directory | File)[]> {
            const fullUri = this.getFullUri(relativePath);
            try {
                  const fileInfo = await FileSystem.getInfoAsync(fullUri as string);
                  if (!fileInfo.exists) {
                        console.log(`Path not found: ${relativePath}. Returning empty list.`); 
                        return []; 
                  }

                  if (!fileInfo.isDirectory) {
                        console.warn(`Path is a file, not a directory: ${relativePath}. Cannot list contents.`);
                        const file = new File(Paths.document, relativePath as string); 
                        return [file];
                  }

                  const parent_dir = new Directory(Paths.document, this.getFullRelativePath(relativePath));
                  console.log(`Directory List for: ${relativePath ? relativePath : this.getAppDirectory()}`);

                  const ls = parent_dir.list()
                  return ls;

            } catch (error) {
                  console.error("Failed to list directory!", error);
                  throw error; 
            }
      }

}