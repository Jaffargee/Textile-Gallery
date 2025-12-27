import { AlbumRepo, ImageRepo, JournalRepo } from "./database";

export class UnitOFWork {

      constructor(
            public readonly albumRepo: AlbumRepo,
            public readonly imageRepo: ImageRepo,
            public readonly journalRepo: JournalRepo
      ) {}

}