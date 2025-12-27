
FILESYSTEM MODULE OVERVIEW
      The filesystem module provides a comprehensive API for interacting with the file system. 
      It offers CRUD operations for directories and files, along with utility functions for path management, 
      validation, and metadata retrieval. This module abstracts the underlying Node.js fs operations into a clean, 
      structured interface for easier file system manipulation.

FILESYSTEM
      DIRECTORY
      - CREATE - CREATE A DIRECTORY
      - READ - LIST DIR
      - UPDATE - ADD/DELETE FILE 
      - DELETE - DELETE A DIRECTORY

      FILE
      - CREATE - CREATE A FILE
      - READ - READ FILE CONTENT
      - UPDATE - WRITE/APPEND TO FILE
      - DELETE - DELETE A FILE

      OTHER UTILITY FUNCTIONS/METHODS
      - PATH
      - IS_VALID_PATH
      - EXISTS - CHECK IF PATH EXISTS
      - GET_FILE_SIZE - GET SIZE OF FILE
      - GET_FILE_TYPE - GET TYPE OF FILE
      - RENAME - RENAME FILE OR DIRECTORY
      - MOVE - MOVE FILE OR DIRECTORY
      - GET_DIR_SIZE - GET THE SIZE OF DIR
      - GET_NO_FILES - GET THE NUMBER OF FILES IN A DIR

      DATABASE INTEGRATION FEATURES
      - SYNC_TO_DB - UPLOAD FILESYSTEM STATE TO SQLITE DB
      - SYNC_FROM_DB - DOWNLOAD AND APPLY DB STATE TO FILESYSTEM
      - COMPARE_STATES - CHECK DIFFERENCES BETWEEN FS AND DB
      - RESOLVE_CONFLICTS - HANDLE SYNC CONFLICTS (E.G., LAST MODIFIED TIME)
      - QUERY_DB - PERFORM QUERIES ON FILE METADATA IN DB
      - BACKUP_TO_DB - STORE BACKUPS IN DB
      - RESTORE_FROM_DB - RESTORE FILESYSTEM FROM DB BACKUP

      DATABASE SCHEMA
      - FILES TABLE: id, path, content_hash, size, type, last_modified, created_at
      - DIRECTORIES TABLE: id, path, last_modified, created_at
      - METADATA TABLE: key, value (for global settings)

      CLASSES/INTERFACES
      - FileSystem (main class)
      - Directory (class or interface)
      - File (class or interface)
      - Path (utility class)
      - DatabaseSync (class for DB operations)

      ERROR HANDLING
      - INVALID_PATH_ERROR
      - PERMISSION_DENIED_ERROR
      - FILE_NOT_FOUND_ERROR
      - DIRECTORY_NOT_EMPTY_ERROR
      - DB_CONNECTION_ERROR
      - SYNC_CONFLICT_ERROR

      DEPENDENCIES
      - Node.js fs module
      - path module
      - sqlite3 module