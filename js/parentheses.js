class Parentheses {
    mark(str) {
        const pairs = [
            { open: '(', close: ')', className: "paren" },
            { open: '[', close: ']', className: "bracket" },
            { open: '{', close: '}', className: "brace" },
            { open: '<', close: '>', className: "angle" }
        ];

        let result = '';
        let i = 0;

        while (i < str.length) {
            const matchingPair = pairs.find(pair => str[i] === pair.open);

            if (matchingPair) {
                const start = i;
                let depth = 1;

                for (let j = i + 1; j < str.length && depth > 0; j++) {
                    if (str[j] === matchingPair.open) depth++;
                    else if (str[j] === matchingPair.close) depth--;

                    if (depth === 0) {
                        result += `<i class="${matchingPair.className}">${this._escapeHtml(str.substring(start, j + 1))}</i>`;
                        i = j + 1;
                        break;
                    }
                }

                if (i === start) {
                    result += `<i class="plain">${this._escapeHtml(matchingPair.open)}</i>`;
                    i++;
                }
            } else {
                const start = i;

                let j = i;
                while (j < str.length && !pairs.some(pair => str[j] === pair.open)) {
                    j++;
                }

                result += `<i class="plain">${this._escapeHtml(str.substring(start, j))}</i>`;
                i = j;
            }
        }

        return result;
    }

    _escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
