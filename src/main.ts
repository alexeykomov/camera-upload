import { Storage } from './storage';
import { DocumentCategory } from './DocumentRecord';

let openingStorage: Promise<Storage> | null = null;

const onChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files || [];
  console.log('Files: ', files);

  if (!files.length) {
    return;
  }

  const firstFile = files[0];

  const preview = document.getElementById('preview') as HTMLImageElement;

  if (!preview) {
    return;
  }

  if (firstFile.type === 'application/pdf') {
    preview.alt = 'This is the pdf file';
    preview.src = '';
    return;
  }

  const storage = await openingStorage;

  const res = await storage?.store({
    category: DocumentCategory.DriverLicense,
    name: firstFile.name,
    file: firstFile,
    mimeType: firstFile.type,
  });
  const res2 = await storage?.store({
    category: DocumentCategory.W2,
    name: firstFile.name,
    file: firstFile,
    mimeType: firstFile.type,
  });
  console.log('res: ', res);

  storage?.iterate((key) => {
    console.log('Key: ', key);
  })
  const count = await storage?.count();
  console.log('count: ', count);
  await storage?.delete(DocumentCategory.W2);
  const countAfterDelete = await storage?.count();
  console.log('countAfterDelete: ', countAfterDelete);

  const record = await storage?.select(DocumentCategory.DriverLicense);
  console.log('record: ', record);

  if (!record) {
    console.log('There is no record with such category: ', DocumentCategory.DriverLicense);
    return;
  }

  const imageUrl = URL.createObjectURL(record.file);
  preview.src = imageUrl;
  preview.alt = `Uploaded image ${firstFile.name}`;
};

const onLoad = async () => {
  const input = document.getElementById('input');
  if (!input) {
    return;
  }
  input.addEventListener('change', onChange);
  openingStorage = Storage.open();
};

document.addEventListener('DOMContentLoaded', onLoad);
