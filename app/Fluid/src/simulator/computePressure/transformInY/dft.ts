import { Program } from "../../../../../webgl/program";
import { Framebuffer } from "../../../webgl/framebuffer";
import { FloatingPointTexture } from "../../../webgl/floatingPointTexture";
import { PingPongBuffers } from "../../../pingPongBuffers";
import { VertexBufferObject } from "../../../../../webgl/vertexBufferObject";
import { setVertexPosition } from "../../domain";
import vertexShaderSource from "../../domain.vs.glsl?raw";
import forwardFragmentShaderSource from "./dftForward.fs.glsl?raw";
import backwardFragmentShaderSource from "./dftBackward.fs.glsl?raw";

export class DFT {
  private forwardProgram: Program;
  private backwardProgram: Program;
  private forwardVertexBufferObject: VertexBufferObject;
  private backwardVertexBufferObject: VertexBufferObject;

  public constructor({ gl, height }: { gl: WebGL2RenderingContext; height: number }) {
    const forwardProgram = new Program({
      gl,
      vertexShaderSource,
      fragmentShaderSource: forwardFragmentShaderSource,
    });
    const backwardProgram = new Program({
      gl,
      vertexShaderSource,
      fragmentShaderSource: backwardFragmentShaderSource,
    });
    const forwardVertexBufferObject: VertexBufferObject = setVertexPosition({
      gl,
      program: forwardProgram,
    });
    const backwardVertexBufferObject: VertexBufferObject = setVertexPosition({
      gl,
      program: backwardProgram,
    });
    // initialize and send uniform values
    for (const program of [forwardProgram, backwardProgram]) {
      program.setUniform({
        dataType: "INT32",
        uniformName: "u_ny",
        data: [height],
      });
      program.setUniform({
        dataType: "INT32",
        uniformName: "in_seq",
        data: [0],
      });
    }
    this.forwardProgram = forwardProgram;
    this.backwardProgram = backwardProgram;
    this.forwardVertexBufferObject = forwardVertexBufferObject;
    this.backwardVertexBufferObject = backwardVertexBufferObject;
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
    const program: Program = isForward ? this.forwardProgram : this.backwardProgram;
    const vertexBufferObject: VertexBufferObject = isForward
      ? this.forwardVertexBufferObject
      : this.backwardVertexBufferObject;
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, width / 4, height);
    const {
      texture: inSeq,
      framebuffer,
    }: {
      texture: FloatingPointTexture;
      framebuffer: Framebuffer;
    } = pressures.getCurrentField();
    program.use(() => {
      framebuffer.bindAndExecute({
        gl,
        callback: () => {
          gl.activeTexture(gl.TEXTURE0);
          inSeq.bindAndExecute({
            gl,
            callback: () => {
              vertexBufferObject.bindAndDraw(gl.TRIANGLES);
            },
          });
        },
      });
    });
    pressures.flip();
    gl.enable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
  }
}
