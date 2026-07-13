class VUMeter {
    constructor(plugin, isEnabled, color) {
        this.isEnabled = isEnabled;
        if (!this.isEnabled) {
            return;
        }

        this.plugin = plugin;
        this.color = color;

        this.channelLabels = ["FL", "FR", "FC", "LFE", "BL", "BR", "FCL", "FCR", "BC", "SL", "SR", "TC", "TFL", "TFC", "TFR", "TBL", "TBC", "TBR"];

        this.vuMeters = {};
        this.channelLabels.forEach(l => {
            this.vuMeters[l] = document.querySelectorAll(`.vu-${l.toLowerCase()}`);
        })

        this.sharedBuffer = null;
        this.samples = null;
        this.sampleRate = null;
        this.channelCount = 0;

        this.updateIntervalMs = 50;
        this.interval = setInterval(this.onTimer.bind(this), this.updateIntervalMs);

        this.previousDb = {};
    }

    onSharedBufferReceived(e) {
        if (this.sharedBuffer) {
            window.chrome.webview.releaseBuffer(this.sharedBuffer);
        }

        if (!e.additionalData) return;

        this.previousDb = {};
        this.sharedBuffer = e.getBuffer();
        this.samples = new Float64Array(this.sharedBuffer);
        this.sampleRate = e.additionalData.SampleRate;
        this.channelCount = e.additionalData.ChannelCount;

        let channelConfig = e.additionalData.ChannelConfig;
        this.channelNames =  this.channelLabels.filter(x => {
            const b = (channelConfig & 1);
            channelConfig >>= 1;
            return b;
        });

        this.channelLabels.forEach(ch => this.vuMeters[ch].forEach(m => m.style.display='none'));
        this.channelNames.forEach(ch => this.vuMeters[ch].forEach(m => m.style.display='block'));

        if (this.inteval) {
            clearInterval(this.interval);
        }
        const windowSizeMs = Math.ceil(this.samples.length/this.channelCount/this.sampleRate*1000);
        this.interval = setInterval(this.onTimer.bind(this), windowSizeMs);
    }

    onTimer() {
        if (this.plugin.isPaused || !this.plugin.isPlaying || !this.samples) return;

        let channelSquaresSum = [];

        const sampleSize = this.samples.length / this.channelCount;
        for (let i = 0; i < this.samples.length; i += this.channelCount) {
            for (let channel = 0; channel < this.channelCount; channel++) {
                const val = this.samples[i+channel];
                channelSquaresSum[channel] = (channelSquaresSum[channel] || 0) + val*val;
            }
        }

        let currentDb = {}
        for (let channel = 0; channel < this.channelCount; channel++) {
            const channelName = this.channelNames[channel];
            const previousValue = this.previousDb[channelName] || -1;
            let currentValue = 20 * Math.log10(
                Math.sqrt(channelSquaresSum[channel] / sampleSize) || 0.00001
            );

            if (currentValue >= previousValue) {
                currentDb[channelName] = currentValue;
            } else {
                currentDb[channelName] = previousValue + (currentValue - previousValue) * 0.2;
            }

            const limitedValue = currentDb[channelName] < -60 ? -60 : currentDb[channelName];
            const meterValue = (60+limitedValue) * 10 / 6;

            this.vuMeters[channelName][0].style.background = this._fill(meterValue, 100, this.color, 'rgb(0,0,0,0)');
            this.vuMeters[channelName][1].style.background = this._fill(100-meterValue, 100, 'rgb(0,0,0,0)', this.color);
        }

        this.previousDb = currentDb;
    }

    onStop() {
        this.previousDb = {};
        this.channelLabels.forEach(ch => this.vuMeters[ch].forEach(m => m.style.background = 'rgb(0,0,0,0)'));
    }

    _fill(current, total, startColor, endColor) {
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
