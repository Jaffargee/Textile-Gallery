import { JournalRepo } from "@/lib/database";
import { AlbumProps } from "@/types";
import { Action } from "@/types/journal";

export class JournalCoordinator {

      constructor (private journalRepo: JournalRepo) {}
      
      startAlbumJournalEntry(album: AlbumProps, action: Action) {
            return this.journalRepo.insertAlbumJournal([
                  album.id!,
                  album.source.local_uri,
                  action,
                  'PENDING',
            ]);
      }

      async markFsCreated(id: number) {
            return this.journalRepo.updateAlbumJournalStatus(["FS_CREATED", "CREATE", id]);
      }

      async markDbInserted(id: number) {
            return this.journalRepo.updateAlbumJournalStatus(["DB_INSERTED", "INSERT", id]);
      }

      async commit(id: number) {
            return this.journalRepo.updateAlbumJournalStatus(["COMMITED", "UPDATE", id]);
      }

      async fail(id: number, err: unknown) {
            return this.journalRepo.updateAlbumJournalError([String(err), "FAILED", "DELETE", id]);
      }

}