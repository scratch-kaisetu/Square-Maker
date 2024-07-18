document.addEventListener('DOMContentLoaded', () => {
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const colorInput = document.getElementById('color');
    const preview = document.getElementById('preview');
    const formatSelect = document.getElementById('format');

    widthInput.addEventListener('input', generateImage);
    heightInput.addEventListener('input', generateImage);
    colorInput.addEventListener('input', generateImage);
    document.getElementById('randomButton').addEventListener('click', generateRandomImage);
    document.getElementById('downloadButton').addEventListener('click', downloadImage);
    document.getElementById('shareButton').addEventListener('click', generateShareURL);

    function generateImage() {
        const width = widthInput.value;
        const height = heightInput.value;
        const color = colorInput.value;

        const brightness = getBrightness(color);

        if (brightness > 0.8) {
            preview.style.backgroundColor = '#CCCCCC';
        } else {
            preview.style.backgroundColor = 'white';
        }

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                        <rect width="${width}" height="${height}" fill="${color}" />
                    </svg>`;

        preview.innerHTML = svg;
    }

    function getBrightness(color) {
        const rgb = parseInt(color.slice(1), 16); 
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >>  8) & 0xff;
        const b = (rgb >>  0) & 0xff;

        return (r*0.299 + g*0.587 + b*0.114) / 255;
    }

    function generateRandomImage() {
        widthInput.value = Math.floor(Math.random() * 200) + 1;
        heightInput.value = Math.floor(Math.random() * 200) + 1;
        colorInput.value = getRandomColor();
        generateImage();
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function downloadImage() {
        const svgElement = preview.querySelector('svg');
        if (!svgElement) return;

        const format = formatSelect.value;
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const DOMURL = self.URL || self.webkitURL || self;
        const img = new Image();

        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = DOMURL.createObjectURL(svg);

        img.onload = function() {
            canvas.width = svgElement.getAttribute('width');
            canvas.height = svgElement.getAttribute('height');
            context.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);

            let imgURI;
            switch(format) {
                case 'png':
                    imgURI = canvas.toDataURL('image/png');
                    break;
                case 'jpg':
                    imgURI = canvas.toDataURL('image/jpeg');
                    break;
                case 'gif':
                    imgURI = canvas.toDataURL('image/gif');
                    break;
                case 'svg':
                default:
                    imgURI = `data:image/svg+xml;base64,${btoa(svgString)}`;
                    break;
            }

            const a = document.createElement('a');
            a.href = imgURI;
            a.download = `image.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        img.src = url;
    }

    function generateShareURL() {
        const width = widthInput.value;
        const height = heightInput.value;
        const color = colorInput.value;
        const url = `${window.location.origin}${window.location.pathname}?width=${width}&height=${height}&color=${encodeURIComponent(color)}`;
        prompt('共有URL:', url);
    }

    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('width') && params.has('height') && params.has('color')) {
            widthInput.value = params.get('width');
            heightInput.value = params.get('height');
            colorInput.value = params.get('color');
            generateImage();
        }
    }

    loadFromURL();
});
