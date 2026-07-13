class ImageBgGenerator {
    getBg(img) {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', 200);
        canvas.setAttribute('height', 200);

        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);

        let colors1 = [];
        let colors2 = [];
        let dir = '90deg';

        if (img.naturalHeight > img.naturalWidth) {
            for (let i = 10; i < canvas.height - 10; i++) {
                for (let j = 3; j < 10; j++) {
                    colors1.push(context.getImageData(j, i, 1, 1).data);
                    colors2.push(context.getImageData(canvas.width - 1 - j, i, 1, 1).data);
                }
            }
        } else {
            dir = '180deg';
            for (let i = 10; i < canvas.width - 10; i++) {
                for (let j = 3; j < 10; j++) {
                    colors1.push(context.getImageData(i, j, 1, 1).data);
                    colors2.push(context.getImageData(i, canvas.height - 1 - j, 1, 1).data);
                }
            }
        }

        const color1 = this._findMostFrequentColor(colors1, (a, b) => this._isCloserThan(a, b, 10));
        const color2 = this._findMostFrequentColor(colors2, (a, b) => this._isCloserThan(a, b, 10));

        return `linear-gradient(
            ${dir},
            rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, 1) 51%,
            rgba(${color2[0]}, ${color2[1]}, ${color2[2]}, 1) 50%
        )`;
    }

    _isCloserThan(arr1, arr2, N) {
        const threshold = Math.max(0, parseFloat(N));

        let distanceSq = 0;

        for (let i = 0; i < 3; i++) {
            const diff = arr1[i] - arr2[i];
            distanceSq += diff * diff;
        }

        return Math.sqrt(distanceSq) < threshold;
    }

    _findMostFrequentColor(colorsList, areEqualFn) {
        if (!colorsList || colorsList.length === 0) {
            return null;
        }

        const groups = [];

        for (const color of colorsList) {
            let foundGroupIndex = -1;

            for (let i = 0; i < groups.length && foundGroupIndex === -1; i++) {
                if (areEqualFn(groups[i].representative, color)) {
                    foundGroupIndex = i;
                    break;
                }
            }

            const key = Array.from(color).join(',');
            if (foundGroupIndex !== -1) {
                groups[foundGroupIndex].count++;
                groups[foundGroupIndex].colorFrequencies.set(
                    key,
                    groups[foundGroupIndex].colorFrequencies.get(key) + 1
                );
            } else {
                groups.push({
                    representative: color,
                    count: 1,
                    colorFrequencies: new Map([[key, 1]])
                });
            }
        }

        let mostFrequentGroup = groups[0];
        for (let i = 1; i < groups.length; i++) {
            if (groups[i].count > mostFrequentGroup.count) {
                mostFrequentGroup = groups[i];
            }
        }

        let mostFrequentColor = undefined;
        let maxCount = 0;
        for (const [key, count] of mostFrequentGroup.colorFrequencies.entries()) {
            if (count > maxCount) {
                mostFrequentColor = key;
                maxCount = count;
            }
        }

        return new Uint8ClampedArray(mostFrequentColor.split(',').map(Number));
    }
}
