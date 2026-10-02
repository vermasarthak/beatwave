export interface StrikeNetAdvisoryPrediction {
  readonly probability: number;
  readonly etaMs: number;
  readonly predictedPadIndex: number;
  readonly confidence: number;
}

export interface IStrikeNetPredictor {
  isReady(): boolean;
  predict(trajectoryBuffer: Float32Array): Promise<StrikeNetAdvisoryPrediction | null>;
}

export class StrikeNetAdvisoryAdapter {
  private predictor: IStrikeNetPredictor | null = null;
  private lastPrediction: StrikeNetAdvisoryPrediction | null = null;

  public setPredictor(predictor: IStrikeNetPredictor): void {
    this.predictor = predictor;
  }

  public async evaluateTrajectory(
    trajectoryBuffer: Float32Array
  ): Promise<StrikeNetAdvisoryPrediction | null> {
    if (!this.predictor || !this.predictor.isReady()) {
      return null;
    }

    try {
      this.lastPrediction = await this.predictor.predict(trajectoryBuffer);
      return this.lastPrediction;
    } catch (err) {
      console.warn('[StrikeNetAdvisoryAdapter] Inference failed, falling back to heuristic:', err);
      return null;
    }
  }

  public getLastPrediction(): StrikeNetAdvisoryPrediction | null {
    return this.lastPrediction;
  }
}
