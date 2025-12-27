
export type JournalStatus = 'PENDING' | 'COMMITED' | 'FS_CREATED' | 'DB_INSERTED' | 'ROLLED_BACK' | 'FAILED' | 'DELETED';
export type Action = 'CREATE' | 'DELETE' | 'INSERT' | 'DELETE_DB' | 'UPDATE';

interface JournalEntry {
      id: number;
      action: Action;
      local_uri: string;
      status: JournalStatus;
      error?: string
}

export interface AlbumJournalEntry extends JournalEntry {
      album_id: number;
}

export interface ImageJournalEntry extends JournalEntry {
      image_id: number;
}
