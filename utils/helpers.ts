import { AlbumProps, ImageProps } from "@/types";

export default class Helpers {

      static constructAlbumObject(sql_object: any): any {
            return {
                  id: sql_object.id,
                  cloud_id: sql_object.cloud_id,
                  name: sql_object.name,
                  exists: true,
                  no_items: sql_object.no_items,
                  size: sql_object.size,
                  thumbnail_name: sql_object.thumbnail_name,
                  source: {
                        cloud_uri: sql_object.cloud_uri,
                        local_uri: sql_object.local_uri,
                        thumbnail_uri: sql_object.thumbnail_uri
                  },
                  created_at: sql_object.created_at
            } as AlbumProps;
      }

      static constructAlbumsArray(sql_array: any[]): AlbumProps[] {
            return sql_array.map(sql_object => Helpers.constructAlbumObject(sql_object));
      }

      static constructImageObject(sql_object: any): any {
            return {
                  id: sql_object.id,
                  cloud_id: sql_object.cloud_id,
                  name: sql_object.name,
                  size: sql_object.size,
                  album_id: sql_object.album_id,
                  uri: sql_object.local_uri,
                  source: {
                        cloud_uri: sql_object.cloud_uri,
                        local_uri: sql_object.local_uri,
                        thumbnail_uri: sql_object.local_uri
                  },
                  created_at: sql_object.created_at
            } as ImageProps;
      }

      static constructImagesArray(sql_array: any[]): ImageProps[] {
            return sql_array.map(sql_object => Helpers.constructImageObject(sql_object));
      }
}
