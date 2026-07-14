class NowPlayingScreen {
    constructor(
        plugin,
        coverStretchThreshold,
        coverGenertorStrLen,
        artworkGeneratorCharScaleFactor,
        defaultTimeDisplay,
        formatCountry,
    ) {
        this.plugin = plugin
        this.coverStretchThreshold = coverStretchThreshold;
        this.coverGenertorStrLen = coverGenertorStrLen;
        this.formatCountry = formatCountry;

        this.parens = new Parentheses();
        this.bgGenerator = new ImageBgGenerator();
        this.artworkGenerator = new ArtworkGenerator(artworkGeneratorCharScaleFactor);

        this.bodyEl = document.querySelector('body');
        this.timeEls = document.querySelectorAll('.time');
        this.flagEls = document.querySelectorAll('img.country');
        this.formatEls = document.querySelectorAll('[data-format]');
        this.artworkEls = document.querySelectorAll('img.artwork');
        this.cdEls = document.querySelectorAll('img.cd');
        this.statusEls = document.querySelectorAll('.status');
        this.statusValueEls = document.querySelectorAll('.status .status-value');

        this.artworkEls[0].addEventListener('load', this.setArtworkBg.bind(this));
        this.statusEls.forEach(e => e.addEventListener('click', () => this.plugin.togglePause()));

        this.timeFormats = {
            elapsed: '[%playback_time%]',
            remaining: '[$if(%playback_time_remaining%,-%playback_time_remaining%,%playback_time%)]',
        };
        this.currentTimeFormat = defaultTimeDisplay;
        document.querySelectorAll('.time-container').forEach(
            e => e.addEventListener('click', () => this.toggleTimeFormat())
        )

        if ("toggleFullScreen" in this.plugin) {
            this.bodyEl.addEventListener('doubleclick', () => this.plugin.toggleFullScreen());
        }

        this.refresh();
        this.setTime();
        this.status();
        this.setArtwork();
    }

    refresh() {
        this.formatEls.forEach(e => {
            const value = this._format(e.dataset.format);
            this._setOrHide(e, value, 'innerHTML', value, t => this.parens.mark(t));
        });
        this.setFlag();
    }

    setFlag() {
        const country = countries[this._format(this.formatCountry).toLowerCase()] || '';

        this.flagEls.forEach(e => this._setOrHide(e, `flags/${country}.svg`, 'src', country))
    }

    setArtwork() {
        const img = this._artwork('front');

        if (this.artworkEls[0].src !== img) {
            this.artworkEls.forEach(e => {
                e.src = img;
                e.classList.remove('stretched');
            });
        };

        const cd = this._artwork('disc', img);

        if (this.cdEls[0].src !== cd) {
            this.cdEls.forEach(e => e.src = cd);
        }

    }

    setArtworkBg(e) {
        const img = e.currentTarget;

        // stretch if difference is reasonably small
        const proportions = img.naturalWidth / img.naturalHeight;
        if (proportions > 1-this.coverStretchThreshold && proportions < 1+this.coverStretchThreshold) {
            this.artworkEls.forEach(e => e.classList.add('stretched'));
            return;
        }

        // generate matching background
        const gradient = this.bgGenerator.getBg(img);
        this.artworkEls.forEach(e => e.style.background = gradient);
    }

    setTime() {
        const time = this._format(this.timeFormats[this.currentTimeFormat]);
        this.timeEls.forEach(e => this._setOrHide(e, time));

        const progress = this._progressBar(
            this._format('%playback_time_seconds%'),
            this._format('%length_seconds%') || 0,
            'rgba(0, 255, 0, var(--color-mute-factor))',
            'rgb(from ButtonBorder r g b / var(--color-mute-factor))'
        )
        this.statusEls.forEach(e => e.style.background = progress);
    }

    toggleTimeFormat() {
        if (this.currentTimeFormat === 'elapsed') {
            this.currentTimeFormat = 'remaining';
        } else {
            this.currentTimeFormat = 'elapsed';
        }
    }

    status(status) {
        status = status || this._getCurrentStatus()

        this.statusValueEls.forEach(e => e.textContent = status);
        this.statusEls.forEach(e => e.classList.remove(...e.classList));
        this.statusEls.forEach(e => e.classList.add('status', ...status.split(' ')));

        let currentElements = [...this.bodyEl.classList];
        currentElements = currentElements.filter(x => !x.startsWith('alignment-'));
        this.bodyEl.classList.remove(...currentElements);
        this.bodyEl.classList.add(...status.split(' '));
        if (status === 'paused') {
            this.bodyEl.classList.add('playing');
        }
    }

    _getCurrentStatus() {
        if (this.plugin.isPlaying && this.plugin.isPaused) {
            return 'paused';
        }

        if (this.plugin.isPlaying) {
            return 'playing';
        }

        return 'stopped';
    }

    _setOrHide(e, value, prop, testValue, preprocess) {
        preprocess = preprocess || ((t) => t);
        testValue = testValue === undefined ? value : testValue;
        prop = prop || 'textContent'

        if (testValue === '') {
            e.classList.add('hide');
        } else {
            e[prop] = preprocess(value);
            e.classList.remove('hide');
        }
    }

    _format(t) {
        const text = this.plugin.getFormattedText(t);

        return text === 'NEIN' ? '' : text;
    }

    _artwork(type, defaultCover) {
        const artwork = this.plugin.getArtwork(type);
        if (artwork.length > 0) {
            return artwork;
        }

        if (defaultCover) {
            return defaultCover;
        }

        const rawInputString = (
            this._format('[%album artist%]')
            || this._format('[%title%]')
            || this._format('[%filename%]')
        );

        return this.artworkGenerator.generate(rawInputString, this.coverGenertorStrLen);
    }

    _progressBar(current, total, startColor, endColor) {
        total = parseFloat(total);
        if (!total) {
            return startColor;
        }

        const ratio = current / total;
        return `linear-gradient(to right,
            ${startColor} calc(${100 * ratio}% + 1px),
            ${endColor} calc(${100 * ratio}%)
        )`;
    }
}
