const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const fileForm = document.getElementById('file-form');
const fileSelect = document.getElementById('fileSelect');

fileSelect.addEventListener('click', () => fileElem.click());

fileElem.addEventListener('change', () => fileForm.submit());

['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    (e) => {
      e.preventDefault();
      dropArea.classList.add('highlight');
    },
    false,
  );
});

['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    (e) => {
      e.preventDefault();
      dropArea.classList.remove('highlight');
    },
    false,
  );
});

dropArea.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  fileElem.files = files;
  fileForm.submit();
});
