class Storage {
  public static VERSION = 1;
  public static STORE_NAME = 'images';
  public static KEY_PATH = 'id';
  public static DB_NAME = 'documentsDb';
  private dbOpenRequest: IDBOpenDBRequest | null = null;
  private db: IDBDatabase | null = null;

  constructor() {}

  open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      this.dbOpenRequest = indexedDB.open(Storage.DB_NAME, Storage.VERSION);

      this.dbOpenRequest.onsuccess = (e) => {
        const request = e.target as IDBRequest;
        this.db = request.result as IDBDatabase;

        resolve(this.db);
      };

      this.dbOpenRequest.onerror = (e) => {
        const error = e.target;
        console.log('Error: : ', error);
        reject(e);
      };

      this.dbOpenRequest.onupgradeneeded = (e) => {
        const request = e.target as IDBRequest;
        const db = request.result;
        const objectStore = db.createObjectStore(Storage.STORE_NAME, {
          keyPath: 'id',
        });

        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.transaction.oncomplete = () => {

        }
      };
    })
  }

  store(imageRecord: ImageRecord): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db?.transaction(Storage.STORE_NAME, 'readwrite');

    })
  }

  select(id: string): Promise<ImageRecord> {
    return new Promise((resolve, reject) => {
      resolve({
        id: '',
        name: '',
        file: new Blob()
      })
    })
  }
}
const storage = new Storage();

export { storage };
