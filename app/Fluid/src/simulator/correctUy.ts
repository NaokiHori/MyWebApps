import { Program } from "../../../webgl/program";
import { Framebuffer } from "../webgl/framebuffer";
import { FloatingPointTexture } from "../webgl/floatingPointTexture";
import { PingPongBuffers } from "../pingPongBuffers";
import { VertexBufferObject } from "../../../webgl/vertexBufferObject";
import { setVertexPosition } from "./domain";
import vertexShaderSource from "./domain.vs.glsl?raw";
import fragmentShaderSource from "./correctUy.fs.glsl?raw";

export class CorrectUy {
  private program: Program;
  private vertexBufferObject: VertexBufferObject;

  public constructor({
    gl,
    ly,
    height,
  }: {
    gl: WebGL2RenderingContext;
    ly: number;
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
      dataType: "INT32",
      uniformName: "u_ny",
      data: [height],
    });
    program.setUniform({
      dataType: "FLOAT32",
      uniformName: "u_dy",
      data: [ly / height],
    });
    program.setUniform({
      dataType: "INT32",
      uniformName: "uy",
      data: [0],
    });
    program.setUniform({
      dataType: "INT32",
      uniformName: "pressure",
      data: [1],
    });
    this.program = program;
    this.vertexBufferObject = vertexBufferObject;
  }

  public run({
    gl,
    width,
    height,
    uys,
    pressures,
  }: {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
    uys: PingPongBuffers;
    pressures: PingPongBuffers;
  }) {
    const program: Program = this.program;
    const vertexBufferObject: VertexBufferObject = this.vertexBufferObject;
    const {
      texture: uy,
      framebuffer,
    }: { texture: FloatingPointTexture; framebuffer: Framebuffer } = uys.getCurrentField();
    const { texture: pressure }: { texture: FloatingPointTexture } = pressures.getCurrentField();
    program.use(() => {
      framebuffer.bindAndExecute({
        gl,
        callback: () => {
          gl.disable(gl.BLEND);
          gl.viewport(0, 0, width, height);
          gl.activeTexture(gl.TEXTURE0);
          uy.bindAndExecute({
            gl,
            callback: () => {
              gl.activeTexture(gl.TEXTURE1);
              pressure.bindAndExecute({
                gl,
                callback: () => {
                  vertexBufferObject.bindAndDraw(gl.TRIANGLES);
                },
              });
            },
          });
          gl.activeTexture(gl.TEXTURE0);
          gl.enable(gl.BLEND);
        },
      });
    });
    uys.flip();
  }
}
