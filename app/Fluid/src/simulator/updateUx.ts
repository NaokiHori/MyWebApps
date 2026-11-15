import { Program } from "../../../webgl/program";
import { Framebuffer } from "../webgl/framebuffer";
import { FloatingPointTexture } from "../webgl/floatingPointTexture";
import { PingPongBuffers } from "../pingPongBuffers";
import { VertexBufferObject } from "../../../webgl/vertexBufferObject";
import { setVertexPosition } from "./domain";
import vertexShaderSource from "./domain.vs.glsl?raw";
import fragmentShaderSource from "./updateUx.fs.glsl?raw";

export class UpdateUx {
  private program: Program;
  private vertexBufferObject: VertexBufferObject;

  public constructor({
    gl,
    lx,
    ly,
    width,
    height,
    timeStepSize,
    diffusivity,
  }: {
    gl: WebGL2RenderingContext;
    lx: number;
    ly: number;
    width: number;
    height: number;
    timeStepSize: number;
    diffusivity: number;
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
      uniformName: "u_diffusivity",
      data: [diffusivity],
    });
    program.setUniform({
      dataType: "FLOAT32",
      uniformName: "u_time_step_size",
      data: [timeStepSize],
    });
    program.setUniform({
      dataType: "INT32",
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
      uniformName: "ux",
      data: [0],
    });
    program.setUniform({
      dataType: "INT32",
      uniformName: "uy",
      data: [1],
    });
    program.setUniform({
      dataType: "INT32",
      uniformName: "temp",
      data: [2],
    });
    this.program = program;
    this.vertexBufferObject = vertexBufferObject;
  }

  public run({
    gl,
    width,
    height,
    uxs,
    uys,
    temps,
  }: {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
    uxs: PingPongBuffers;
    uys: PingPongBuffers;
    temps: PingPongBuffers;
  }) {
    const program: Program = this.program;
    const vertexBufferObject: VertexBufferObject = this.vertexBufferObject;
    const {
      texture: ux,
      framebuffer,
    }: { texture: FloatingPointTexture; framebuffer: Framebuffer } = uxs.getCurrentField();
    const { texture: uy }: { texture: FloatingPointTexture } = uys.getCurrentField();
    const { texture: temp }: { texture: FloatingPointTexture } = temps.getCurrentField();
    program.use(() => {
      framebuffer.bindAndExecute({
        gl,
        callback: () => {
          gl.disable(gl.BLEND);
          gl.viewport(0, 0, width, height);
          gl.activeTexture(gl.TEXTURE0);
          ux.bindAndExecute({
            gl,
            callback: () => {
              gl.activeTexture(gl.TEXTURE1);
              uy.bindAndExecute({
                gl,
                callback: () => {
                  gl.activeTexture(gl.TEXTURE2);
                  temp.bindAndExecute({
                    gl,
                    callback: () => {
                      vertexBufferObject.bindAndDraw(gl.TRIANGLES);
                    },
                  });
                },
              });
            },
          });
          gl.activeTexture(gl.TEXTURE0);
          gl.enable(gl.BLEND);
        },
      });
    });
    // NOTE: flipping buffers should be deferred,
    //       as previous field will be used
    //       to update other fields
  }
}
