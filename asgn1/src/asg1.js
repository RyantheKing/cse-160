// Vertex shader program
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }`

// Fragment shader program
let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

function main() {
    setupWebGL();
    connectVariablesToGLSL();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev){ handleClick(ev, a_Position, u_FragColor) };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    shape = 'square';
}

let g_points = [];  // The array for the position of a mouse press
let g_colors = [];  // The array to store the color of a point
let g_sizes = [];   // The array to store the size of a point
let g_shapes = [];  // The array to store the shape of a point
function handleClick(ev) {
    let rgb = [document.getElementById('red').value/255, document.getElementById('green').value/255, document.getElementById('blue').value/255, 1.0];
    let rect = ev.target.getBoundingClientRect();
    let size = document.getElementById('shape_size').value;

    let x = ((ev.clientX - rect.left) - canvas.width/2)/(canvas.width/2);
    let y = (canvas.height/2 - (ev.clientY - rect.top))/(canvas.height/2);

    g_points.push([x, y]);
    g_colors.push(rgb);
    g_sizes.push(size);
    g_shapes.push(shape);

    renderAllShapes();
}

function clearCanvas() {
    g_points = [];
    g_colors = [];
    g_sizes = [];
    g_shapes = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
    canvas = document.getElementById('asgn1');
  
    gl = getWebGLContext(canvas);
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (u_Size < 0) {
        console.log('Failed to get the storage location of u_Size');
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
    }
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let i = 0; i < g_points.length; i++) {
        let xy = g_points[i];
        let rgba = g_colors[i];
        let sz = g_sizes[i];
        let shp = g_shapes[i];

        // console.log(shp, xy, rgba, sz);

        if (shp === 'square') {
            // draw point
            gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
            // color
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            // size
            gl.uniform1f(u_Size, sz);
            // Draw
            gl.drawArrays(gl.POINTS, 0, 1);
        } else if (shp === 'triangle') {
            let vertices = new Float32Array([
                xy[0], xy[1] + sz/400,
                xy[0] - sz/400, xy[1] - sz/400,
                xy[0] + sz/400, xy[1] - sz/400,
            ]);
            var vertexBuffer = gl.createBuffer();
            // Bind the buffer object to target
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_Position);
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            gl.uniform1f(u_Size, sz);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
    }
}