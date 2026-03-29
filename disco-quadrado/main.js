import { createProgram, createShader } from './gl-utils.js';

const cena = {
  program: null,
  quadVao: null,
  colorLoc: null,
  quadMVao : null
};

const objetos = {

};

let tri_Strip = false;

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'c'){
    tri_Strip = !tri_Strip;
  }
});  

export function setupWebGL() {
    // inicializa o WebGL2
    const canvas = document.querySelector('.example-canvas');
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
      console.error('WebGL2 não está disponível');
      throw new Error('WebGL2 não suportado');
    }

    return gl
}

export function initialize(gl) {

    // inicializa o shader the vértice e fragmento e em seguida os compila
    // são programas executados pela GPU sempre que algo precisa ser desenhado
    const vertexShaderCode = document.querySelector('[type="shader/vertex"]').textContent;
    const fragmentShaderCode = document.querySelector('[type="shader/fragment"]').textContent;

    
    // finaliza a combinação (compila + link) dos shaders em um programa
    const program = createProgram(gl,
      createShader(gl, 'vs', gl.VERTEX_SHADER, vertexShaderCode),
      createShader(gl, 'fs', gl.FRAGMENT_SHADER, fragmentShaderCode)
    );
    cena.program = program;
    gl.useProgram(cena.program);
    
    const positionAttributeLocation = gl.getAttribLocation(cena.program, 'posicao');
    
    
    const vertices = [
      10, 190, // v0
      150, 150, // v1
      190, 190, //v2
      150, 50, // v3
      190, 10, // v4
      50, 50, // v5
      10,10, // v6
      50, 150, // v7
      10, 190, // v0
      150, 150 // v1
    ];
    
    const vertices2 = [
      10, 190, // v0
      190, 190, //v2
      190, 10, // v4
      10,10 // v6
    ]
    
    const vertices3 = [
      50, 150, // v7
      150, 150, // v1
      150, 50, // v3
      50, 50 // v5
    ]
    
    //Criando Vao e Vbo para o disco quadrado
    const diskQuadVao = gl.createVertexArray();
    cena.diskQuadVao = diskQuadVao;
    gl.bindVertexArray(cena.diskQuadVao);
    //Criando Vbo para o disco quadrado
    const diskQuadVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, diskQuadVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    //Criando Vao e Vbo para o quadrado de fora
    const quadMVao = gl.createVertexArray();
    cena.quadMVao = quadMVao;
    gl.bindVertexArray(cena.quadMVao);
    //Criando Vbo para o quadrado de fora
    const quadMVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadMVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    //Criando Vao e Vbo para o quadrado de dentro
    const quadMVao2 = gl.createVertexArray();
    cena.quadMVao2 = quadMVao2;
    gl.bindVertexArray(cena.quadMVao2);
    //Criando Vbo para o quadrado de dentro
    const quadMVbo2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadMVbo2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices3), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const projectionUniformLocation = gl.getUniformLocation(cena.program, 'projecao');
    const projectionMatrix = ortho(0, 200, 0, 200, -1, 1);
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

    cena.colorLoc = gl.getUniformLocation(cena.program, 'uColor');
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // --- fim do código de configuração ---
}

function ortho(left, right, bottom, top, near, far) {
  const tx = -(right + left) / (right - left);
  const ty = -(top + bottom) / (top - bottom);
  const tz = -(far + near) / (far - near);
  return new Float32Array([
    2 / (right - left), 0, 0, 0,
    0, 2 / (top - bottom), 0, 0,
    0, 0, -2 / (far - near), 0,
    tx, ty, tz, 1
  ]);
}

export function render(gl) {
    // renderiza: desenha todos os quadrados da cena
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(cena.program);
    gl.uniform4f(cena.colorLoc, 0.0, 1.0, 0.8, 0.2);
    gl.bindVertexArray(cena.diskQuadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);
    /*for (let i = 0; i < 20; i++){
      gl.drawArrays(gl.POINTS, i, 1);
      }*/
    const tri_StripLoc = gl.getUniformLocation(cena.program, "u_tri_Strip");
    if (tri_Strip){
      gl.bindVertexArray(cena.diskQuadVao);
      gl.uniform4f(cena.colorLoc, 0.0,0.0, 0.0, 1.0);
      gl.drawArrays(gl.LINE_STRIP, 0, 10);
      gl.drawArrays(gl.LINES, 0, 2);
      gl.bindVertexArray(cena.quadMVao);
      gl.uniform4f(cena.colorLoc, 0.0, 0.0, 0.0, 1.0);
      gl.drawArrays(gl.LINE_LOOP, 0, 4);
      gl.bindVertexArray(cena.quadMVao2);
      gl.uniform4f(cena.colorLoc, 0.0, 0.0, 0.0, 1.0);
      gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }
    requestAnimationFrame(() => render(gl));
     /*for (let i = 0; i < 7; i += 2){
      gl.drawArrays(gl.LINE_STRIP, i, (i+2)%6);
     }*/
}
