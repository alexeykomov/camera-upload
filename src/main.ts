import { storage } from './storage';

const onLoad = () => {
  const input = document.getElementById('input');

  if (!input) {
    return;
  }

  input.addEventListener('change', (event: Event) => {
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

    const imageUrl = URL.createObjectURL(blob);
    preview.src = imageUrl;
    preview.alt = `Uploaded image ${firstFile.name}`;
  });
};

document.addEventListener('DOMContentLoaded', onLoad);
