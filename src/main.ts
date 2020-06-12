import { Storage } from './storage';

let openedStorage: Promise<Storage> | null = null;

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

  const blob = new Blob([firstFile], { type: firstFile.type });

  const storage = await openedStorage;

  const res = await storage?.store({
    name: firstFile.name,
    file: firstFile,
  });
  console.log('res: ', res);

  const record = await storage?.select(1);
  console.log('record: ', record);

  const imageUrl = URL.createObjectURL(blob);
  preview.src = imageUrl;
  preview.alt = `Uploaded image ${firstFile.name}`;
};

const onLoad = async () => {
  const input = document.getElementById('input');
  if (!input) {
    return;
  }
  input.addEventListener('change', onChange);
  openedStorage = Storage.open();
};

document.addEventListener('DOMContentLoaded', onLoad);
