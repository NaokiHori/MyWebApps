import { Canvas } from "./canvas";
import { Program } from "../../webgl/program";
import { VertexBufferObject } from "../../webgl/vertexBufferObject";
import { VertexAttribute } from "../../webgl/vertexAttribute";
import { IndexBufferObject } from "../../webgl/indexBufferObject";
import { Uniform } from "../../webgl/uniform";
import { FloatingPointTexture } from "./webgl/floatingPointTexture";
import vertexShaderSource from "./visualizer/vertexShader.glsl?raw";
import fragmentShaderSource from "./visualizer/fragmentShader.glsl?raw";

interface Uniforms {
  scale: Uniform;
}

export class Visualizer {
  private program: Program;
  private uniforms: Uniforms;
  private indexBufferObject: IndexBufferObject;

  public constructor({
    gl,
    width,
    height,
  }: {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
  }) {
    const program = new Program({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
    });
    const scale = new Uniform({
      gl,
      program,
      dataType: "FLOAT32",
      name: "u_scale",
      nitems: 2,
    });
    program.setUniform({
      dataType: "INT32",
      uniformName: "u_resolution",
      data: [width, height],
    });
    program.setUniform({
      dataType: "INT32",
      uniformName: "scalar",
      data: [0],
    });
    const indexBufferObject: IndexBufferObject = program.use((webGLProgram: WebGLProgram) => {
      const positions = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ];
      const numberOfVertices = positions.length;
      const numberOfItemsForEachVertex = positions[0].length;
      const indices = [0, 1, 2, 1, 3, 2];
      const attribute = new VertexAttribute({
        gl,
        program: webGLProgram,
        attributeName: "a_position",
      });
      const vertexBufferObject = new VertexBufferObject({
        gl,
        numberOfVertices,
        numberOfItemsForEachVertex,
        usage: gl.STATIC_DRAW,
      });
      vertexBufferObject.bindAndBindVertexAttribute(attribute, numberOfItemsForEachVertex);
      vertexBufferObject.bindAndUpdateData(new Float32Array(positions.flat()));
      const indexBufferObject = new IndexBufferObject({
        gl,
        size: indices.length,
        usage: gl.STATIC_DRAW,
      });
      indexBufferObject.bindAndUpdateData(new Int16Array(indices));
      return indexBufferObject;
    });
    this.program = program;
    this.uniforms = {
      scale,
    };
    this.indexBufferObject = indexBufferObject;
  }

  public draw({
    canvas,
    gl,
    floatingPointTexture,
  }: {
    canvas: Canvas;
    gl: WebGL2RenderingContext;
    floatingPointTexture: FloatingPointTexture;
  }) {
    const program: Program = this.program;
    const indexBufferObject: IndexBufferObject = this.indexBufferObject;
    const { width: canvasWidth, height: canvasHeight }: { width: number; height: number } =
      canvas.getSize();
    program.use(() => {
      gl.viewport(0, 0, canvasWidth, canvasHeight);
      floatingPointTexture.bindAndExecute({
        gl,
        callback: () => {
          indexBufferObject.bindAndDraw(gl.TRIANGLES);
        },
      });
    });
  }

  public handleResizeEvent({
    canvas,
    gl,
    lx,
    ly,
  }: {
    canvas: Canvas;
    gl: WebGL2RenderingContext;
    lx: number;
    ly: number;
  }) {
    const program: Program = this.program;
    // transpose scalar so that vertical direction is wall-bounded
    const scalarAspectRatio: number = ly / lx;
    const scale: Uniform = this.uniforms.scale;
    canvas.syncSize();
    const { width: canvasWidth, height: canvasHeight }: { width: number; height: number } =
      canvas.getSize();
    program.use(() => {
      gl.viewport(0, 0, canvasWidth, canvasHeight);
      const canvasAspectRatio: number = canvasWidth / canvasHeight;
      scale.set({
        data:
          canvasAspectRatio < scalarAspectRatio
            ? [1, canvasAspectRatio / scalarAspectRatio]
            : [scalarAspectRatio / canvasAspectRatio, 1],
      });
    });
  }
}
