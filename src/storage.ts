import {
  DocumentCategory,
  DocumentRecord,
  DocumentRecordForStorage,
} from './DocumentRecord';
import { blobToBuffer, bufferToBlob } from './BlobToTypedArrayConverter';

export class Storage {
  public static VERSION = 7;
  public static STORE_NAME = `images${Storage.VERSION}`;
  public static KEY_PATH = 'category';
  public static DB_NAME = 'documentsDb';
  private db: IDBDatabase | null = null;

  private constructor(db: IDBDatabase) {
    this.db = db;
  }

  public static open(): Promise<Storage> {
    return new Promise((resolve, reject) => {
      const dbOpenRequest: IDBOpenDBRequest = indexedDB.open(
        Storage.DB_NAME,
        Storage.VERSION
      );

      dbOpenRequest.onsuccess = (e) => {
        const request = e.target as IDBRequest;
        const db = request.result as IDBDatabase;

        resolve(new Storage(db));
      };

      dbOpenRequest.onerror = (e) => {
        const error = e.target;
        console.log('Error: : ', error);
        reject(e);
      };

      dbOpenRequest.onupgradeneeded = (e) => {
        const request = e.target as IDBRequest;
        const db = request.result;
        const objectStore = db.createObjectStore(Storage.STORE_NAME);

        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('category', 'category', { unique: true });
      };
    });
  }

  public store(documentRecord: DocumentRecord): Promise<number> {
    return blobToBuffer(documentRecord).then(
      (documentRecordForStorage) =>
        new Promise((resolve, reject) => {
          let generatedId: number | null = null;
          const transaction = this.db?.transaction(
            Storage.STORE_NAME,
            'readwrite'
          );
          if (!transaction) {
            reject(new Error('Null transaction object'));
            return;
          }
          transaction.oncomplete = (event) => {
            if (generatedId === null) {
              reject(new Error('Null generated category'));
              return;
            }
            resolve(generatedId);
          };
          transaction.onerror = (event) => {
            reject(event);
          };
          const store = transaction.objectStore(Storage.STORE_NAME);

          const request = store.put(
            documentRecordForStorage,
            documentRecordForStorage.category
          );
          request.onsuccess = (event) => {
            const request = event.target as IDBRequest;
            generatedId = request.result;
            console.log('Request is success: ', request.result);
          };
        })
    );
  }

  public delete(documentCategory: DocumentCategory): Promise<number> {
    return new Promise((resolve, reject) => {
      let deletionResult: number | undefined = -1;
      const transaction = this.db?.transaction(Storage.STORE_NAME, 'readwrite');
      if (!transaction) {
        reject(new Error('Null transaction object'));
        return;
      }
      transaction.oncomplete = (event) => {
        if (deletionResult === null) {
          reject(new Error('Null generated category'));
          return;
        }
        resolve(deletionResult);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
      const store = transaction.objectStore(Storage.STORE_NAME);

      const request = store.delete(documentCategory);
      request.onsuccess = (event) => {
        const request = event.target as IDBRequest;
        deletionResult = request.result;
        console.log('Request is success: ', request.result);
      };
    });
  }

  public select(id: DocumentCategory): Promise<DocumentRecord | null> {
    return new Promise<DocumentRecordForStorage | null>((resolve, reject) => {
      let imageRecord: DocumentRecordForStorage | null = null;
      const transaction = this.db?.transaction(Storage.STORE_NAME, 'readonly');
      if (!transaction) {
        reject(new Error('Null transaction object'));
        return;
      }
      transaction.oncomplete = (event) => {
        resolve(imageRecord);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
      const store = transaction.objectStore(Storage.STORE_NAME);
      const request = store.get(id);
      request.onsuccess = (event) => {
        const request = event.target as IDBRequest;
        imageRecord = request.result as DocumentRecordForStorage;
        console.log('Request is success: ');
      };
    }).then((r: DocumentRecordForStorage | null) => {
      if (!r) {
        return null;
      }
      return bufferToBlob(r);
    });
  }

  public count(): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      const transaction = this.db?.transaction(Storage.STORE_NAME, 'readonly');
      if (!transaction) {
        reject(new Error('Null transaction object'));
        return;
      }
      transaction.oncomplete = (event) => {
        resolve(count);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
      const store = transaction.objectStore(Storage.STORE_NAME);
      const request = store.count();
      request.onsuccess = (event) => {
        const request = event.target as IDBRequest;
        count = request.result as number;
        console.log('Request is success: ');
      };
    });
  }

  public iterate(
    cb: (id: DocumentCategory, index: number, array: DocumentCategory[]) => void
  ): void {
    const transaction = this.db?.transaction(Storage.STORE_NAME, 'readonly');
    const keys: DocumentCategory[] = [];
    if (!transaction) {
      console.log(new Error('Null transaction object'));
      return;
    }
    transaction.oncomplete = (event) => {
      keys.forEach(cb);
    };
    transaction.onerror = (event) => {
      console.log(event);
    };
    const store = transaction.objectStore(Storage.STORE_NAME);
    const request = store.openCursor();
    request.onsuccess = (event) => {
      const request = event.target as IDBRequest;
      const cursor = request.result as IDBCursor;
      if (cursor) {
        keys.push(cursor.key as DocumentCategory);
        cursor.continue();
      }
      console.log('Request is success: ');
    };
  }
}
