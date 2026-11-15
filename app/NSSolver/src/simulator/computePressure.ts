import { PingPongBuffers } from "../pingPongBuffers";
import { ComputeRightHandSide } from "./computePressure/computeRightHandSide";
import { TransformInX } from "./computePressure/transformInX";
import { TransformInY } from "./computePressure/transformInY";
import { SolvePoissonEquation } from "./computePressure/solvePoissonEquation";

export class ComputePressure {
  private computeRightHandSide: ComputeRightHandSide;
  private transformInX: TransformInX;
  private transformInY: TransformInY;
  private solvePoissonEquation: SolvePoissonEquation;

  public constructor({
    gl,
    lx,
    ly,
    width,
    height,
  }: {
    gl: WebGL2RenderingContext;
    lx: number;
    ly: number;
    width: number;
    height: number;
  }) {
    this.computeRightHandSide = new ComputeRightHandSide({
      gl,
      lx,
      ly,
      width,
      height,
    });
    this.transformInX = new TransformInX({
      gl,
      width,
    });
    this.transformInY = new TransformInY({
      gl,
      height,
    });
    this.solvePoissonEquation = new SolvePoissonEquation({
      gl,
      lx,
      ly,
      width,
      height,
    });
  }

  public run({
    gl,
    width,
    height,
    uxs,
    uys,
    pressures,
  }: {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
    uxs: PingPongBuffers;
    uys: PingPongBuffers;
    pressures: PingPongBuffers;
  }) {
    this.computeRightHandSide.run({
      gl,
      width,
      height,
      uxs,
      uys,
      pressures,
    });
    this.transformInX.run({
      gl,
      width,
      height,
      pressures,
      isForward: true,
    });
    this.transformInY.run({
      gl,
      width,
      height,
      pressures,
      isForward: true,
    });
    this.solvePoissonEquation.run({
      gl,
      width,
      height,
      pressures,
    });
    this.transformInY.run({
      gl,
      width,
      height,
      pressures,
      isForward: false,
    });
    this.transformInX.run({
      gl,
      width,
      height,
      pressures,
      isForward: false,
    });
  }
}
