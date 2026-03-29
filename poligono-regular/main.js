import { createProgram, createShader } from './gl-utils.js';

const cena = {
  program: null,
  quadVao: null,
  colorLoc: null
};

let numLados = 3;

window.addEventListener('keydown', (event) =>{
  if (event.key === '+'){
    numLados++;
  }
  if (event.key === '-' && numLados > 3){
    numLados--;
  }
});

function calcularVertices(gl) {
  const vertices = [];
  const raio = 50;
  const centroX = 100;
  const centroY = 100;
  for (let i = 0; i < numLados; i++) {
    const angulo = (i / numLados) * 2 * Math.PI;
    vertices.push(centroX + raio * Math.sin(angulo));
    vertices.push(centroY + raio * Math.cos(angulo));
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, cena.poligonoVbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  return 0;
}


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

    //Criando VAO do polígono
    const poligonoVao = gl.createVertexArray();
    cena.poligonoVao = poligonoVao;
    gl.bindVertexArray(poligonoVao);
    
    //Criando VBO do polígono
    const poligonoVbo = gl.createBuffer();
    cena.poligonoVbo = poligonoVbo;
    gl.bindBuffer(gl.ARRAY_BUFFER, poligonoVbo);
    gl.bufferData(gl.ARRAY_BUFFER, 2 * numLados * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(cena.program, 'posicao');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const projectionUniformLocation = gl.getUniformLocation(cena.program, 'projecao');
    const projectionMatrix = ortho(0, 200, 0, 200, -1, 1);
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

    cena.colorLoc = gl.getUniformLocation(cena.program, 'uColor');
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo meio-azul puxado para o roxo, coloquei para ver a cor branca
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
    gl.bindVertexArray(cena.poligonoVao);
    calcularVertices(gl);
    gl.uniform4f(cena.colorLoc, 0.0, 0.0, 0.0, 1.0); // preto
    gl.drawArrays(gl.LINE_LOOP, 0, numLados);
    requestAnimationFrame(() => render(gl));
}