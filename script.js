document.getElementById('convertBtn').addEventListener('click', function () {
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const ocrText = document.getElementById('ocrText');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const removeTextBtn = document.getElementById('removeTextBtn');

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block'; // Show preview image

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

                Tesseract.recognize(
                    processedImage,
                    'eng+hin',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                console.log(`Progress: ${Math.floor(m.progress * 100)}%`);
                            }
                        }
                    }
                ).then(({ data: { text } }) => {
                    const textItem = document.createElement('div');
                    textItem.className = 'history-item';
                    textItem.innerText = text.trim();
                    ocrText.appendChild(textItem);
                    ocrText.appendChild(document.createElement('br')); // Add line break

                    copyTextBtn.style.display = 'inline'; // Show copy button
                    removeTextBtn.style.display = 'inline'; // Show remove button

                    // Clear the input and hide preview
                    imageInput.value = '';
                    previewImage.style.display = 'none';
                }).catch((err) => {
                    console.error(err);
                    ocrText.textContent = "Error recognizing text.";
                });
            };
        };

        reader.readAsDataURL(imageInput.files[0]);
    } else {
        alert('Please select an image first!');
    }
});

document.getElementById('copyTextBtn').addEventListener('click', function () {
    const text = document.getElementById('ocrText').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('Text copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

document.getElementById('removeTextBtn').addEventListener('click', function () {
    const ocrTextContainer = document.getElementById('ocrText');
    while (ocrTextContainer.firstChild) {
        ocrTextContainer.removeChild(ocrTextContainer.firstChild);
    }
    this.style.display = 'none'; // Hide remove button
    document.getElementById('copyTextBtn').style.display = 'none'; // Hide copy button
});
