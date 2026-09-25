// 迷雾纪元 - 昼夜循环

const CYCLE_DURATION = 480;

const PHASE_RANGES = {
    night: { start: 0.0, end: 0.2 },
    dawn:  { start: 0.2, end: 0.3 },
    day:   { start: 0.3, end: 0.7 },
    dusk:  { start: 0.7, end: 0.8 }
};

const PHASE_OVERLAYS = {
    night: 'rgba(10, 10, 40, 0.45)',
    dawn:  'rgba(255, 180, 100, 0.12)',
    day:   'rgba(255, 255, 200, 0.0)',
    dusk:  'rgba(200, 100, 50, 0.15)'
};

const PHASE_ICONS = {
    night: '☾',
    dawn:  '🌅',
    day:   '☀',
    dusk:  '🌇'
};

class DayNightCycle {
    constructor(eventBus) {
        this._eventBus = eventBus;
        this._normalizedTime = 0.0;
        this._currentPhase = 'night';
        this._speedMultiplier = 1.0;
    }

    update(realDt) {
        const delta = (realDt * this._speedMultiplier) / CYCLE_DURATION;
        const prevTime = this._normalizedTime;
        this._normalizedTime = (this._normalizedTime + delta) % 1.0;

        const prevPhase = this._currentPhase;
        this._currentPhase = this._getPhaseForTime(this._normalizedTime);

        if (prevPhase !== this._currentPhase) {
            this._eventBus.emit('daynight:phaseChanged', {
                phase: this._currentPhase,
                prevPhase: prevPhase
            });
        }
    }

    _getPhaseForTime(t) {
        if (t >= PHASE_RANGES.night.start && t < PHASE_RANGES.night.end) return 'night';
        if (t >= PHASE_RANGES.dawn.start && t < PHASE_RANGES.dawn.end) return 'dawn';
        if (t >= PHASE_RANGES.day.start && t < PHASE_RANGES.day.end) return 'day';
        if (t >= PHASE_RANGES.dusk.start && t < PHASE_RANGES.dusk.end) return 'dusk';
        return 'night';
    }

    getTimeOfDay() {
        return this._normalizedTime;
    }

    getPhase() {
        return this._currentPhase;
    }

    getOverlayColor() {
        return PHASE_OVERLAYS[this._currentPhase] || PHASE_OVERLAYS.night;
    }

    getAmbientTint() {
        const t = this._normalizedTime;
        if (t < 0.2) return 0.3 + 0.1 * Math.cos(t * Math.PI * 5);
        if (t < 0.3) return 0.4 + 0.6 * smoothstep(0.2, 0.3, t);
        if (t < 0.7) return 1.0;
        if (t < 0.8) return 1.0 - 0.6 * smoothstep(0.7, 0.8, t);
        return 0.3 + 0.1 * Math.cos((t - 0.8) * Math.PI * 5);
    }

    getPhaseIcon() {
        return PHASE_ICONS[this._currentPhase] || '☾';
    }

    setTime(normalized) {
        this._normalizedTime = Math.max(0, Math.min(1, normalized));
        this._currentPhase = this._getPhaseForTime(this._normalizedTime);
    }

    setSpeedMultiplier(multiplier) {
        this._speedMultiplier = multiplier;
    }

    getSpeedMultiplier() {
        return this._speedMultiplier;
    }

    export() {
        return {
            normalizedTime: this._normalizedTime,
            speedMultiplier: this._speedMultiplier
        };
    }

    import(data) {
        if (data.normalizedTime !== undefined) {
            this.setTime(data.normalizedTime);
        }
        if (data.speedMultiplier !== undefined) {
            this._speedMultiplier = data.speedMultiplier;
        }
    }
}
