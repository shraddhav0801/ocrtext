document.getElementById('convertBtn').addEventListener('click', function () {
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('previewContainer');
    const ocrTextContainer = document.getElementById('ocrTextContainer');
    const progressBar = document.getElementById('progressBar');
    const progressBarContainer = document.getElementById('progressBarContainer');

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';

            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;
                    data[i + 1] = avg;
                    data[i + 2] = avg;
                }

                ctx.putImageData(imageData, 0, 0);

                const processedImage = canvas.toDataURL();

                progressBarContainer.style.display = 'block';
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';

                Tesseract.recognize(
                    processedImage,
                    'eng+hin',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                const progress = Math.floor(m.progress * 100);
                                progressBar.style.width = `${progress}%`;
                                progressBar.textContent = `${progress}%`;
                            }
                        }
                    }
                ).then(({ data: { text } }) => {
                    const textBlock = document.createElement('div');
                    textBlock.classList.add('converted-text');
                    textBlock.textContent = text;

                    setTimeout(() => {
                        textBlock.classList.add('show');
                    }, 10);

                    const actionsDiv = document.createElement('div');
                    actionsDiv.classList.add('actions');

                    const copyBtn = document.createElement('button');
                    copyBtn.textContent = 'Copy';
                    copyBtn.onclick = function () {
                        navigator.clipboard.writeText(text)
                            .then(() => alert('Text copied to clipboard!'))
                            .catch(err => console.error('Error copying text: ', err));
                    };

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.onclick = function () {
                        textBlock.classList.remove('show');
                        setTimeout(() => {
                            ocrTextContainer.removeChild(textBlock);
                            ocrTextContainer.removeChild(actionsDiv);
                        }, 500);
                    };

                    actionsDiv.appendChild(copyBtn);
                    actionsDiv.appendChild(removeBtn);
                    ocrTextContainer.appendChild(textBlock);
                    ocrTextContainer.appendChild(actionsDiv);

                    progressBarContainer.style.display = 'none';
                    previewContainer.style.display = 'none';
                }).catch((err) => {
                    console.error(err);
                    alert("Error recognizing text.");
                });
            };
        };

        reader.readAsDataURL(imageInput.files[0]);
    } else {
        alert('Please select an image first!');
    }
});