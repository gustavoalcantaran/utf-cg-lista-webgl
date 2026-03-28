import { createProgram, createShader } from './gl-utils.js';

const cena = {
  program: null,
  quadVao: null,
  colorLoc: null
};

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
    
    const quadVao = gl.createVertexArray();
    cena.quadVao = quadVao;
    gl.bindVertexArray(cena.quadVao);

    const quadVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);

    const vertices = [];
    // define os vértices de um triângulo
    for (let i = 0; i < 9; i++){
      const coluna = i % 3;
      const linha = Math.floor(i / 3);
      vertices.push(
      25+(coluna*60), 25+(linha*60),    // baixo-esquerda
      55+(coluna*60), 25+(linha*60),    // baixo-direita
      55+(coluna*60), 55+(linha*60),    // topo-direita
      25+(coluna*60), 55+(linha*60)     // topo-esquerda
    );
  }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(cena.program, 'posicao');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const projectionUniformLocation = gl.getUniformLocation(cena.program, 'projecao');
    const projectionMatrix = ortho(0, 200, 0, 200, -1, 1);
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

    cena.colorLoc = gl.getUniformLocation(cena.program, 'uColor');
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
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
    gl.bindVertexArray(cena.quadVao);
    for (let i = 0; i < 9; i++){
      gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
      gl.uniform4f(cena.colorLoc, Math.random(), Math.random(), Math.random(), 1.0);
    }
}