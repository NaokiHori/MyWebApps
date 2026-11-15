import { PingPongBuffers } from "../../pingPongBuffers";
import { DCT } from "./transformInX/dct";

export class TransformInX {
  private dct: DCT;

  public constructor({ gl, width }: { gl: WebGL2RenderingContext; width: number }) {
    this.dct = new DCT({ gl, width });
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
      this.dct.run({
        gl,
        width,
        height,
        pressures,
        isForward,
      });
    } else {
      this.dct.run({
        gl,
        width,
        height,
        pressures,
        isForward,
      });
    }
  }
}
