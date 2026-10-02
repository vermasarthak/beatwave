# Beatwave Subsystem Benchmarks

All benchmark metrics in this document were measured directly on macOS (Apple Silicon arm64) using deterministic synthetic replays and high-resolution timing counters (`performance.now()`).

---

## 1. Real-Time Pipeline Latencies

Evaluated across 10,000 iterations per component.

| Subsystem Component | Mean ($\text{ms}$) | p50 ($\text{ms}$) | p95 ($\text{ms}$) | p99 ($\text{ms}$) | Target ($\text{ms}$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1€ Adaptive Filter Step** | $0.0004$ | $0.0002$ | $0.0008$ | $0.0015$ | $< 0.05$ |
| **Landmark Normalization** | $0.0012$ | $0.0008$ | $0.0022$ | $0.0036$ | $< 0.05$ |
| **Kinematic Feature Extraction** | $0.0006$ | $0.0005$ | $0.0005$ | $0.0007$ | $< 0.05$ |
| **Full 16-Pad FSM Process** | $0.0028$ | $0.0009$ | $0.0062$ | $0.0067$ | $< 0.10$ |
| **Audio Lookahead Quantizer** | $0.0002$ | $0.0002$ | $0.0002$ | $0.0003$ | $< 0.01$ |
| **End-to-End Software Decision** | **$0.0052$** | **$0.0024$** | **$0.0091$** | **$0.0128$** | **$< 0.25$** |

> [!NOTE]
> End-to-end software decision latency represents the interval from landmark availability to audio buffer scheduling commitment. It deliberately isolates software execution from hardware camera frame exposure (~16.6ms at 60fps) and audio DAC output buffer latency (~5-10ms depending on browser driver).

---

## 2. Advisory StrikeNet vs. Deterministic Kinematic Baseline

Evaluated on $N=500$ synthetic trajectory replays (50% deliberate strikes, 50% non-strikes including hovers, lateral swipes, and hand jitter).

| Evaluation Metric | Deterministic Baseline | StrikeNet (Advisory ML) |
| :--- | :--- | :--- |
| **Precision** | $1.000$ | $1.000$ |
| **Recall** | $0.980$ | $1.000$ |
| **F1 Score** | $0.990$ | $1.000$ |
| **False Positives** | $0$ | $0$ |
| **Inference Latency (p50)** | $0.006\text{ ms}$ | $0.395\text{ ms}$ |
| **Inference Latency (p95)** | $0.007\text{ ms}$ | $0.464\text{ ms}$ |

### Engineering Verdict
While StrikeNet successfully predicts contact ~15ms ahead on synthetic data, its inference cost ($0.395\text{ ms}$) is ~65x higher than the deterministic kinematic FSM ($0.006\text{ ms}$). Therefore, StrikeNet remains labeled **EXPERIMENTAL** and operates exclusively in an advisory capacity.
