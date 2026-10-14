"""Render an original ~2 minute mariachi-style ranchera (3/4 waltz) to WAV.

Instruments are synthesized: two trumpets (additive brass), a violin section (detuned
sawtooth-ish with vibrato), guitarrón (plucked bass), vihuela + guitar strums on beats 2 and 3.
Form: intro fanfare, A, A', B, violin interlude, A, B, A up a whole step, "tan-tan" ending.
"""
import sys
import numpy as np
from scipy.signal import fftconvolve, butter, lfilter

SR = 32000
BPM = 160
BEAT = 60 / BPM
BAR = 3 * BEAT
rng = np.random.default_rng(11)

NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
def midi(n):
    p = NOTE[n[0]]; i = 1
    while i < len(n) and n[i] in "#b":
        p += 1 if n[i] == "#" else -1; i += 1
    return p + 12 * (int(n[i:]) + 1)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# ---------- harmony ----------
D_MAJOR = [2, 4, 6, 7, 9, 11, 1]  # pitch classes D E F# G A B C#
def third_below(m, scale=D_MAJOR):
    """Diatonic third below in D major (works for the melody, which stays in key)."""
    pc = m % 12
    if pc not in scale:
        return m - 4  # chromatic notes (G# over E7) get a major third
    i = scale.index(pc)
    target = scale[(i - 2) % 7]
    d = (pc - target) % 12
    return m - d

CHORDS = {
    "D": [2, 6, 9], "A7": [9, 1, 4, 7], "G": [7, 11, 2], "D7": [2, 6, 9, 0],
    "E7": [4, 8, 11, 2], "Em": [4, 7, 11], "Bm": [11, 2, 6],
}
ROOT = {"D": 2, "A7": 9, "G": 7, "D7": 2, "E7": 4, "Em": 4, "Bm": 11}
FIFTH = {k: (v + 7) % 12 for k, v in ROOT.items()}

def voicing(chord, lo=57, hi=72, shift=0):
    pcs = [(p + shift) % 12 for p in CHORDS[chord]]
    return [m for m in range(lo, hi + 1) if m % 12 in pcs]

# ---------- buffer ----------
TOTAL = 140.0
L = np.zeros(int(SR * TOTAL)); R = np.zeros_like(L)
def add(sig, t, pan=0.0, gain=1.0):
    s = int(max(t, 0) * SR); e = min(s + len(sig), len(L))
    if e <= s: return
    g_l = gain * np.cos((pan + 1) * np.pi / 4); g_r = gain * np.sin((pan + 1) * np.pi / 4)
    L[s:e] += sig[: e - s] * g_l; R[s:e] += sig[: e - s] * g_r

def env_adsr(n, a, d, s, r, hold):
    t = np.arange(n) / SR
    e = np.ones(n) * s
    e[t < a] = t[t < a] / a
    m = (t >= a) & (t < a + d)
    e[m] = 1 - (1 - s) * (t[m] - a) / d
    rel = t >= hold
    e[rel] = s * np.exp(-(t[rel] - hold) / r)
    return e

# ---------- instruments ----------
def trumpet(m, dur, vel=1.0, detune=0.0):
    f = hz(m) * 2 ** (detune / 1200)
    n = int((dur + 0.12) * SR); t = np.arange(n) / SR
    vib = 1 + 0.0045 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - 0.15) / 0.2, 0, 1)
    phase = 2 * np.pi * f * np.cumsum(vib) / SR
    env = env_adsr(n, 0.025, 0.08, 0.82, 0.06, dur)
    out = np.zeros(n)
    for h in range(1, 16):
        if f * h > SR / 2.2: break
        amp = h ** -0.55
        out += amp * np.sin(h * phase) * env ** (1 + 0.22 * h)  # brighter as it blooms
    # blat on attack
    out += 0.25 * rng.standard_normal(n) * np.exp(-t / 0.012)
    return vel * out / 4.5

def violin(m, dur, vel=1.0):
    n = int((dur + 0.2) * SR); t = np.arange(n) / SR
    env = env_adsr(n, 0.05, 0.1, 0.85, 0.12, dur)
    out = np.zeros(n)
    for k, det in enumerate((-7, 0, 6)):  # a small section
        f = hz(m) * 2 ** (det / 1200)
        vib = 1 + 0.006 * np.sin(2 * np.pi * (5.8 + 0.4 * k) * t + k) * np.clip((t - 0.1) / 0.25, 0, 1)
        ph = 2 * np.pi * f * np.cumsum(vib) / SR + k
        for h in range(1, 22):
            if f * h > SR / 2.2: break
            out += ((-1) ** h) * np.sin(h * ph) / h * (0.9 ** h)
    b, a = butter(2, 5200 / (SR / 2))
    out = lfilter(b, a, out)
    return vel * out * env / 5.0

def pluck(m, dur, vel=1.0, bright=1.0, decay=1.6, hmax=14):
    f = hz(m)
    n = int((dur + 0.05) * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    pos = 0.18
    for h in range(1, hmax + 1):
        if f * h > SR / 2.2: break
        amp = abs(np.sin(h * np.pi * pos)) / h ** (1.15 / bright)
        out += amp * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28)) * np.exp(-t * decay * (1 + 0.35 * h))
    out *= np.minimum(1, t / 0.002)
    out[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
    return vel * out

def guitarron(m, dur, vel=1.0):
    s = pluck(m, dur, vel, bright=0.8, decay=1.2, hmax=10)
    t = np.arange(len(s)) / SR
    s += 0.6 * vel * np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * 1.5)  # body thump
    return s * 0.9

def strum(chord, t0, vel=0.6, shift=0, down=True, short=True):
    notes = voicing(chord, shift=shift)
    if not down: notes = notes[::-1]
    for i, m in enumerate(notes):
        dur = BEAT * (0.55 if short else 0.95)
        add(pluck(m, dur, vel, bright=1.4, decay=7 if short else 3.5), t0 + i * 0.009, pan=-0.25, gain=0.28)
        add(pluck(m + 12 if m < 62 else m, dur, vel * 0.7, bright=1.6, decay=9 if short else 4), t0 + i * 0.007 + 0.004, pan=0.3, gain=0.18)

# ---------- score ----------
def notes(spec):
    """'F#5:2 E5:1 | ...' -> [(midi or None, beats)]"""
    out = []
    for tok in spec.replace("|", " ").split():
        n, b = tok.split(":")
        out.append((None if n == "r" else midi(n), float(b)))
    return out

FANFARE = notes("A4:1 D5:1 F#5:1 | A5:2 F#5:1 | G5:1 E5:1 C#5:1 | D5:3")
FANFARE_CH = ["D", "D", "A7", "D"]
A_MEL = notes("""F#5:2 F#5:1 | E5:1 F#5:1 G5:1 | A5:2 G5:1 | E5:3 |
                 G5:2 G5:1 | F#5:1 G5:1 A5:1 | F#5:2 E5:1 | D5:3 |
                 A4:1 D5:1 F#5:1 | A5:2 F#5:1 | B5:2 A5:1 | G5:3 |
                 F#5:2 A5:1 | G5:2 E5:1 | D5:2 F#5:1 | D5:3""")
A_CH = ["D", "D", "A7", "A7", "A7", "A7", "D", "D", "D", "D7", "G", "G", "D", "A7", "D", "D"]
B_MEL = notes("""B5:1 B5:1 B5:1 | D6:2 B5:1 | A5:2 F#5:1 | A5:3 |
                 G5:1 G5:1 G5:1 | A5:2 E5:1 | F#5:2 G5:1 | A5:3 |
                 B5:1 D6:1 G6:1 | G6:2 D6:1 | F#6:2 D6:1 | A5:3 |
                 G#5:2 B5:1 | D6:2 B5:1 | C#6:2 A5:1 | E5:1 C#5:1 A4:1""")
B_CH = ["G", "G", "D", "D", "A7", "A7", "D", "D", "G", "G", "D", "D", "E7", "E7", "A7", "A7"]
INTER_CH = ["D", "A7", "A7", "D", "D", "G", "A7", "D"]

def rhythm(chords, t0, shift=0, vel=1.0):
    for i, ch in enumerate(chords):
        tb = t0 + i * BAR
        bass_pc = (ROOT[ch] if i % 2 == 0 else FIFTH[ch]) + shift
        bm = 38 + (bass_pc - 38) % 12  # D2..C#3
        add(guitarron(bm, BEAT * 0.9, 0.9 * vel), tb + rng.normal(0, 0.004), pan=0.05, gain=0.75)
        strum(ch, tb + BEAT + rng.normal(0, 0.004), 0.55 * vel, shift, down=True)
        strum(ch, tb + 2 * BEAT + rng.normal(0, 0.004), 0.45 * vel, shift, down=False)

def play(mel, t0, inst, shift=0, harm=True, octave=0, gain=1.0, pans=(-0.35, 0.35)):
    t = t0
    for m, b in mel:
        dur = b * BEAT
        if m is not None:
            mm = m + octave
            jitter = rng.normal(0, 0.006)
            if inst == "tp":
                add(trumpet(mm + shift, dur * 0.92, 0.95, detune=-3), t + jitter, pans[0], gain)
                if harm: add(trumpet(third_below(mm) + shift, dur * 0.92, 0.8, detune=4), t + jitter + 0.008, pans[1], gain * 0.85)
            else:
                add(violin(mm + shift, dur * 0.98, 0.9), t + jitter, pans[0] * 0.6, gain)
                if harm: add(violin(third_below(mm) + shift, dur * 0.98, 0.7), t + jitter, pans[1] * 0.6, gain * 0.7)
        t += dur
    return t

def stabs(chords, t0, every=4, shift=0):
    """Trumpets answer at the end of each phrase: two short chord hits on beats 2 and 3."""
    for i, ch in enumerate(chords):
        if (i + 1) % every: continue
        v = voicing(ch, 64, 79, shift)[-2:]
        for k in (1, 2):
            for j, m in enumerate(v):
                add(trumpet(m, BEAT * 0.45, 0.8, detune=(-3, 4)[j % 2]), t0 + i * BAR + k * BEAT, (-0.35, 0.35)[j % 2], 0.7)

def pads(chords, t0, shift=0, gain=0.35):
    for i, ch in enumerate(chords):
        for m in voicing(ch, 66, 78, shift)[:3]:
            add(violin(m, BAR * 0.97, 0.6), t0 + i * BAR, rng.uniform(-0.4, 0.4), gain)

def violin_runs(chords, t0, shift=0):
    for i, ch in enumerate(chords):
        tones = voicing(ch, 74, 90, shift)
        seq = (tones[:3] + tones[1:4][::-1]) if len(tones) >= 4 else (tones * 2)[:6]
        for k, m in enumerate(seq[:6]):
            add(violin(m, BEAT * 0.48, 0.85), t0 + i * BAR + k * BEAT / 2, -0.2, 0.9)

# ---------- arrangement ----------
t = 0.25
# Intro: fanfare in thirds, then a 4-bar vamp
play(FANFARE, t, "tp"); rhythm(FANFARE_CH, t); t += 4 * BAR
rhythm(["D", "A7", "A7", "D"], t); t += 4 * BAR
# A: trumpets lead, soft violin pads
play(A_MEL, t, "tp"); pads(A_CH, t); rhythm(A_CH, t); t += 16 * BAR
# A': violins take the tune, trumpets answer
play(A_MEL, t, "vn", gain=1.1); stabs(A_CH, t); rhythm(A_CH, t); t += 16 * BAR
# B: violins up high, trumpets an octave down
play(B_MEL, t, "vn", gain=1.0); play(B_MEL, t, "tp", octave=-12, gain=0.8); rhythm(B_CH, t); t += 16 * BAR
# violin interlude
violin_runs(INTER_CH, t); rhythm(INTER_CH, t); t += 8 * BAR
# A tutti
play(A_MEL, t, "tp"); play(A_MEL, t, "vn", octave=12, harm=False, gain=0.7); rhythm(A_CH, t); t += 16 * BAR
# B again
play(B_MEL, t, "vn", gain=1.0); play(B_MEL, t, "tp", octave=-12, gain=0.8); rhythm(B_CH, t); t += 16 * BAR
# pivot bar on A7 (with a trumpet pickup), then the last A up a whole step (E major)
rhythm(["E7"], t, vel=1.1)
play(notes("B4:1 C#5:1 D5:1"), t, "tp", shift=2, harm=True)
t += BAR
play(A_MEL, t, "tp", shift=2); play(A_MEL, t, "vn", shift=2, octave=12, harm=False, gain=0.75); rhythm(A_CH, t, shift=2, vel=1.1); t += 16 * BAR

# "tan-tan" ending: V7 hit, then I hit
def hit(ch, at, shift, length=0.35, gain=1.0):
    for j, m in enumerate(voicing(ch, 64, 81, shift)[-3:]):
        add(trumpet(m, length, 1.0, detune=(-3, 4, 0)[j]), at, (-0.4, 0.4, 0)[j], gain * 0.8)
    for m in voicing(ch, 74, 86, shift)[:2]:
        add(violin(m, length, 0.9), at, 0.0, gain * 0.6)
    strum(ch, at, 0.8, shift, short=True)
    b = 38 + (ROOT[ch] + shift - 38) % 12
    add(guitarron(b, length + 0.2, 1.0), at, 0, 0.9)
hit("A7", t, 2, 0.3); hit("A7", t + 2 * BEAT, 2, 0.3)
hit("D", t + BAR, 2, 0.9, 1.15)
end = t + BAR + 2.2

# ---------- mix ----------
n = int(end * SR)
L, R = L[:n], R[:n]
ir_n = int(1.3 * SR); tt = np.arange(ir_n) / SR
ir = rng.standard_normal(ir_n) * np.exp(-tt / 0.32); ir[: int(0.012 * SR)] = 0
ir /= np.sqrt(np.sum(ir ** 2))
wetL = fftconvolve(L, ir)[:n]; wetR = fftconvolve(R, np.roll(ir, 97))[:n]
L = L + 0.16 * wetL; R = R + 0.16 * wetR
mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6) * 0.92
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

from scipy.io import wavfile
wavfile.write(sys.argv[1], SR, (mix * 32767).astype(np.int16))
print(f"rendered {end:.1f}s")
