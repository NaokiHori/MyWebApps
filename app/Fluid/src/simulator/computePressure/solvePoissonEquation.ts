import { Program } from "../../../../webgl/program";
import { Framebuffer } from "../../webgl/framebuffer";
import { FloatingPointTexture } from "../../webgl/floatingPointTexture";
import { PingPongBuffers } from "../../pingPongBuffers";
import { VertexBufferObject } from "../../../../webgl/vertexBufferObject";
import { setVertexPosition } from "../domain";
import vertexShaderSource from "../domain.vs.glsl?raw";
import fragmentShaderSource from "./solvePoissonEquation.fs.glsl?raw";

export class SolvePoissonEquation {
  private program: Program;
  private vertexBufferObject: VertexBufferObject;

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
    const program = new Program({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
    });
    const vertexBufferObject: VertexBufferObject = setVertexPosition({
      gl,
      program,
    });
    // initialize and send uniform values
    program.setUniform({
      dataType: "FLOAT32",
      uniformName: "u_resolution",
      data: [width, height],
    });
    program.setUniform({
      dataType: "FLOAT32",
      uniformName: "u_grid_size",
      data: [lx / width, ly / height],
    });
    program.setUniform({
      dataType: "INT32",
      uniformName: "rhs",
      data: [0],
    });
    this.program = program;
    this.vertexBufferObject = vertexBufferObject;
  }

  public run({
    gl,
    width,
    height,
    pressures,
  }: {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
    pressures: PingPongBuffers;
  }) {
    const program: Program = this.program;
    const vertexBufferObject: VertexBufferObject = this.vertexBufferObject;
    const {
      texture: rhs,
      framebuffer,
    }: {
      texture: FloatingPointTexture;
      framebuffer: Framebuffer;
    } = pressures.getCurrentField();
    program.use(() => {
      framebuffer.bindAndExecute({
        gl,
        callback: () => {
          gl.disable(gl.BLEND);
          gl.viewport(0, 0, width / 4, height);
          gl.activeTexture(gl.TEXTURE0);
          rhs.bindAndExecute({
            gl,
            callback: () => {
              vertexBufferObject.bindAndDraw(gl.TRIANGLES);
            },
          });
          gl.enable(gl.BLEND);
          gl.activeTexture(gl.TEXTURE0);
        },
      });
    });
    pressures.flip();
  }
}
