// 迷雾纪元 - 区域环境粒子特效

const REGION_PARTICLE_SPECS = {
    forest: [
        { type: 'fog', count: 10, color: '200, 220, 200', size: [40, 70], alpha: 0.06, speed: 6, dir: 'drift' },
        { type: 'spark', count: 14, color: '255, 215, 0', size: [1, 2], alpha: 0.7, speed: 12, dir: 'wander' }
    ],
    coast: [
        { type: 'fog', count: 8, color: '220, 235, 245', size: [35, 60], alpha: 0.07, speed: 14, dir: 'horizontal' },
        { type: 'spark', count: 12, color: '255, 255, 255', size: [1, 2], alpha: 0.6, speed: 4, dir: 'twinkle' }
    ],
    cave: [
        { type: 'spark', count: 12, color: '255, 140, 0', size: [1, 3], alpha: 0.65, speed: 3, dir: 'twinkle' },
        { type: 'mote', count: 10, color: '160, 140, 200', size: [1, 2], alpha: 0.3, speed: 8, dir: 'fall' }
    ],
    ruins: [
        { type: 'mote', count: 14, color: '255, 191, 0', size: [1, 2], alpha: 0.4, speed: 6, dir: 'fall' },
        { type: 'fog', count: 5, color: '212, 165, 116', size: [30, 50], alpha: 0.05, speed: 4, dir: 'drift' }
    ],
    camp: [
        { type: 'ember', count: 10, color: '255, 153, 68', size: [1, 2], alpha: 0.7, speed: 18, dir: 'rise' },
        { type: 'leaf', count: 6, color: '106, 170, 106', size: [2, 3], alpha: 0.5, speed: 10, dir: 'sway' }
    ],
    default: [
        { type: 'mote', count: 8, color: '255, 215, 0', size: [1, 2], alpha: 0.25, speed: 5, dir: 'drift' }
    ]
};

const PARTICLE_SPAWN_MARGIN = 80;

class VisualEffects {
    constructor() {
        this._particles = [];
        this._terrain = null;
        this._time = 0;
    }

    update(dt, player, terrainType) {
        this._time += dt;

        if (terrainType !== this._terrain) {
            this._terrain = terrainType;
            this._particles.length = 0;
            const specs = REGION_PARTICLE_SPECS[terrainType] || REGION_PARTICLE_SPECS.default;
            for (const spec of specs) {
                for (let i = 0; i < spec.count; i++) {
                    this._particles.push(this._spawnParticle(spec, player, true));
                }
            }
        }

        for (let i = 0; i < this._particles.length; i++) {
            const p = this._particles[i];
            p.life += dt;
            if (p.life >= p.maxLife) {
                this._particles[i] = this._spawnParticle(p.spec, player, false);
                continue;
            }
            this._moveParticle(p, dt);
        }
    }

    _spawnParticle(spec, player, randomAge) {
        const halfW = CANVAS_W / 2 + PARTICLE_SPAWN_MARGIN;
        const halfH = CANVAS_H / 2 + PARTICLE_SPAWN_MARGIN;
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height / 2;
        const maxLife = randFloat(4, 9);
        const p = {
            spec,
            x: cx + randFloat(-halfW, halfW),
            y: cy + randFloat(-halfH, halfH),
            vx: 0,
            vy: 0,
            life: randomAge ? randFloat(0, maxLife) : 0,
            maxLife,
            size: randFloat(spec.size[0], spec.size[1]),
            phase: randFloat(0, Math.PI * 2)
        };
        this._initVelocity(p);
        return p;
    }

    _initVelocity(p) {
        const s = p.spec.speed;
        switch (p.spec.dir) {
            case 'horizontal':
                p.vx = s;
                p.vy = randFloat(-2, 2);
                break;
            case 'fall':
                p.vx = randFloat(-2, 2);
                p.vy = s;
                break;
            case 'rise':
                p.vx = randFloat(-3, 3);
                p.vy = -s;
                break;
            case 'sway':
                p.vx = 0;
                p.vy = s * 0.6;
                break;
            case 'wander':
            case 'twinkle':
                p.vx = randFloat(-s * 0.3, s * 0.3);
                p.vy = randFloat(-s * 0.3, s * 0.3);
                break;
            default:
                p.vx = randFloat(-s, s);
                p.vy = randFloat(-s * 0.5, s * 0.5);
                break;
        }
    }

    _moveParticle(p, dt) {
        switch (p.spec.dir) {
            case 'sway':
                p.x += Math.sin(this._time * 2 + p.phase) * p.spec.speed * dt;
                p.y += p.vy * dt;
                break;
            case 'rise':
                p.x += (p.vx + Math.sin(this._time * 3 + p.phase) * 4) * dt;
                p.y += p.vy * dt;
                break;
            case 'wander':
                p.vx += randFloat(-8, 8) * dt;
                p.vy += randFloat(-8, 8) * dt;
                p.vx = clamp(p.vx, -p.spec.speed, p.spec.speed);
                p.vy = clamp(p.vy, -p.spec.speed, p.spec.speed);
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                break;
            default:
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                break;
        }
    }

    _envelope(p) {
        const t = p.life / p.maxLife;
        if (t < 0.15) return t / 0.15;
        if (t > 0.75) return (1 - t) / 0.25;
        return 1;
    }

    render(ctx, camera) {
        if (this._particles.length === 0) return;

        for (const p of this._particles) {
            const sp = camera.worldToScreen(p.x, p.y);
            if (sp.x < -PARTICLE_SPAWN_MARGIN || sp.x > CANVAS_W + PARTICLE_SPAWN_MARGIN ||
                sp.y < -PARTICLE_SPAWN_MARGIN || sp.y > CANVAS_H + PARTICLE_SPAWN_MARGIN) continue;

            let alpha = p.spec.alpha * this._envelope(p);
            if (alpha <= 0.003) continue;

            if (p.spec.type === 'spark' && p.spec.dir === 'twinkle') {
                alpha *= 0.55 + 0.45 * Math.sin(this._time * 3 + p.phase);
                if (alpha <= 0.003) continue;
            }

            if (p.spec.type === 'fog') {
                const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, p.size);
                g.addColorStop(0, `rgba(${p.spec.color}, ${alpha.toFixed(3)})`);
                g.addColorStop(1, `rgba(${p.spec.color}, 0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.spec.type === 'spark' || p.spec.type === 'ember') {
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = `rgb(${p.spec.color})`;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, p.size * 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            } else {
                ctx.globalAlpha = alpha;
                ctx.fillStyle = `rgb(${p.spec.color})`;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }

    clear() {
        this._particles.length = 0;
        this._terrain = null;
    }
}
