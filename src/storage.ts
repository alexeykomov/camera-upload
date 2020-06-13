import {
  DocumentCategory,
  DocumentRecord,
  DocumentRecordForStorage,
} from './DocumentRecord';
import { blobToBuffer, bufferToBlob } from './BlobToTypedArrayConverter';

export class Storage {
  public static VERSION = 6;
  public static STORE_NAME = `images${Storage.VERSION}`;
  public static KEY_PATH = 'category';
  public static DB_NAME = 'documentsDb';
  private db: IDBDatabase | null = null;

  constructor(db: IDBDatabase) {
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
        objectStore.createIndex('category', 'category', { unique: false });
      };
    });
  }

  store(documentRecord: DocumentRecord): Promise<number> {
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

  select(id: DocumentCategory): Promise<DocumentRecord | null> {
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
}
