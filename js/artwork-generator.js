class ArtworkGenerator {
    constructor(scaleFactorPerChar) {
        this.scaleFactorPerChar = scaleFactorPerChar
    }

    generate(rawInputString, maxChars) {
        const inputString = rawInputString.replace(' ', '').substring(0, maxChars);

        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;

        const ctx = canvas.getContext('2d');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const bgHue = this._stringToHue(rawInputString);

        ctx.fillStyle = `hsl(${bgHue}deg 80% 20%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const characters = inputString.split('');

        if (characters.length === 0) {
            return canvas.toDataURL('image/png');
        }

        const fontFamily = 'Verdana';
        const baseFontSize = 1300;
        let fontSize = baseFontSize;

        const coin = () => Math.sign(Math.random() - 0.5);

        characters.forEach((char, index) => {
            if (index > 0) {
                fontSize = Math.floor(fontSize * this.scaleFactorPerChar);
            }

            const opacity = 1 - 0.5 * (inputString.length - index) / (inputString.length);

            ctx.fillStyle = `hsl(${(bgHue + 180) % 360}deg 100% 60% / ${100 * opacity}%)`;
            ctx.font = `bold ${fontSize}px ${fontFamily}`;

            const m = ctx.measureText(char);
            const h = m.fontBoundingBoxAscent - m.fontBoundingBoxDescent;

            const x = 500 + 250 * ((index - 1) % 2 ? -1 : 1) + Math.round(Math.random() * coin() * 170);
            const y = 500 + 250 * ((index - 1) % 3 ? 1 : -1) + Math.round(Math.random() * coin() * 170);
            ctx.fillText(char, index === 0 ? 500 : x, index === 0 ? 600 : y);
        });

        return canvas.toDataURL('image/png');
    }

    _stringToHue(str) {
        let hash = 0x811c9dc6;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        return ((hash >>> 0) % 360);
    }
}
