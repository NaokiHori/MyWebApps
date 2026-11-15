import { Program } from "../../../webgl/program";
import { VertexAttribute } from "../../../webgl/vertexAttribute";
import { VertexBufferObject } from "../../../webgl/vertexBufferObject";

export function setVertexPosition({
  gl,
  program,
}: {
  gl: WebGL2RenderingContext;
  program: Program;
}): VertexBufferObject {
  return program.use<VertexBufferObject>((webGLProgram: WebGLProgram) => {
    const positions = [
      [-1, -1],
      [3, -1],
      [-1, 3],
    ];
    const numberOfVertices = positions.length;
    const numberOfItemsForEachVertex = positions[0].length;
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
    return vertexBufferObject;
  });
}
