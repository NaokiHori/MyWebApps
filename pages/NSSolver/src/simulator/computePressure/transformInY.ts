import { PingPongBuffers } from "../../pingPongBuffers";
import { DFT } from "./transformInY/dft";

export class TransformInY {
  private dft: DFT;

  public constructor({ gl, height }: { gl: WebGL2RenderingContext; height: number }) {
    this.dft = new DFT({ gl, height });
  }

  public run({
    gl,
    width,
    height,
    pressures,
    isForward,
  }: {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
    pressures: PingPongBuffers;
    isForward: boolean;
  }) {
    if (isForward) {
      this.dft.run({
        gl,
        width,
        height,
        pressures,
        isForward,
      });
    } else {
      this.dft.run({
        gl,
        width,
        height,
        pressures,
        isForward,
      });
    }
  }
}
