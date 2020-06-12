export class Storage {
  public static VERSION = 2;
  public static STORE_NAME = 'images2';
  public static KEY_PATH = 'id';
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
        const objectStore = db.createObjectStore(Storage.STORE_NAME, {
          autoIncrement: true,
        });

        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.transaction.oncomplete = () => {};
      };
    });
  }

  store(imageRecord: UploadedImage): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction(Storage.STORE_NAME, 'readwrite');
      if (!transaction) {
        reject(new Error('Null transaction object'));
        return;
      }
      transaction.oncomplete = (event) => {
        const request = event.target as IDBRequest;
        resolve(request.result);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
      const store = transaction.objectStore(Storage.STORE_NAME);
      const request = store.add(imageRecord);
      request.onsuccess = () => {
        console.log('Request is success: ');
      };
    });
  }

  select(id: string): Promise<ImageRecord> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction(Storage.STORE_NAME, 'readonly');
      if (!transaction) {
        reject(new Error('Null transaction object'));
        return;
      }
      transaction.oncomplete = (event) => {
        const request = event.target as IDBRequest;
        resolve(request.result);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
      const store = transaction.objectStore(Storage.STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
        console.log('Request is success: ');
      };
    });
  }
}
