import { DocumentRecord, DocumentRecordForStorage } from './DocumentRecord';

export const bufferToBlob = (
  record: DocumentRecordForStorage
): DocumentRecord => {
  const blob = new Blob([record.buffer], { type: record.mimeType });

  return {
    name: record.name,
    mimeType: record.mimeType,
    category: record.category,
    file: blob,
  };
};

export const blobToBuffer = (
  record: DocumentRecord
): Promise<DocumentRecordForStorage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      const buffer = reader.result;
      resolve({
        name: record.name,
        mimeType: record.mimeType,
        category: record.category,
        buffer: buffer as ArrayBuffer,
      });
    });
    reader.addEventListener('error', reject);
    reader.readAsArrayBuffer(record.file);
  });
};
