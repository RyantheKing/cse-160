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
    autoSegment();
    rainbowMode();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = handleClick;
    canvas.onmousemove = function(ev) { if (ev.buttons === 1) handleClick(ev);}

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    shape = 'square';
    drawn = false;
}

let masterSlider = document.getElementById('shape_size');
let slaveSlider = document.getElementById('seg_count');
let red = document.getElementById('red');
let green = document.getElementById('green');
let blue = document.getElementById('blue');

function syncSliders() {
    if (autoseg) {
        slaveSlider.value = masterSlider.value;
    }
}
masterSlider.oninput = syncSliders;

let g_points = [];  // The array for the position of a mouse press
let g_colors = [];  // The array to store the color of a point
let g_sizes = [];   // The array to store the size of a point
let g_shapes = [];  // The array to store the shape of a point
let g_segs = [];    // The array to store the number of segments for a point
function handleClick(ev) {
    if (rainbow) {
        if (red.value >= 255) {
            if (green.value >= 255) {
                red.value = +red.value - 15;
            } else if (green.value > 0 || blue.value == 0) {
                green.value = +green.value + 15;
            } else {
                blue.value = +blue.value - 15;
            }
        } else if (green.value >= 255) {
            if (blue.value >= 255) {
                green.value = +green.value - 15;
            } else if (blue.value > 0 || red.value == 0) {
                console.log('here');
                blue.value = +blue.value + 15;
            } else {
                red.value = +red.value - 15;
            }
        } else {
            if (red.value >= 255) {
                blue.value = +blue.value - 15;
            } else if (red.value > 0 || green.value == 0) {
                red.value = +red.value + 15;
            } else {
                green.value = +green.value - 15;
            }
        }
    }
    // console.log(red.value, green.value, blue.value);
    let rgb = [red.value/255, green.value/255, blue.value/255, 1.0];
    let rect = ev.target.getBoundingClientRect();
    let size = document.getElementById('shape_size').value;
    let segs = +document.getElementById('seg_count').value;

    let x = ((ev.clientX - rect.left) - canvas.width/2)/(canvas.width/2);
    let y = (canvas.height/2 - (ev.clientY - rect.top))/(canvas.height/2);

    g_points.push([x, y]);
    g_colors.push(rgb);
    g_sizes.push(size);
    g_shapes.push(shape);
    g_segs.push(segs);
    // console.log([x,y]);
    // console.log(rgb);
    // console.log(size);
    // console.log(shape);
    // console.log(segs);

    renderAllShapes();
}

function clearCanvas() {
    g_points = [];
    g_colors = [];
    g_sizes = [];
    g_shapes = [];
    g_segs = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawn = false;
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
    // buffer prep stuff
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (drawn) {
        showDrawing();
    }

    for (let i = 0; i < g_points.length; i++) {
        let xy = g_points[i];
        let rgba = g_colors[i];
        let sz = g_sizes[i];
        let shp = g_shapes[i];
        let segs = g_segs[i];

        // color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        if (shp === 'square') {
            // draw point
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(xy), gl.DYNAMIC_DRAW);
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
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
            // Enable the assignment to a_Position variable
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        } else if (shp === 'circle') {
            let sides = segs;
            let vertices = [xy[0], xy[1]];
            let rad_step = 2 * Math.PI / sides;
            for (let i = 0; i <= sides; i++) {
                vertices.push(xy[0] + Math.cos(rad_step * i) * sz/400);
                vertices.push(xy[1] + Math.sin(rad_step * i) * sz/400);
            }
            vertices.push(xy[0] + sz/400);
            vertices.push(xy[1]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, sides + 2);
        }
    }
}

function autoSegment() {
    autoseg = document.getElementById('auto_seg').checked;
    syncSliders();
}

function rainbowMode() {
    rainbow = document.getElementById('rainbow').checked;
    console.log('ran');
    if (rainbow) {
        minSlider = Math.min(red.value, green.value, blue.value);
        maxSlider = Math.max(red.value, green.value, blue.value);
        if (red.value == maxSlider) {
            red.value = 255;
            if (blue.value == minSlider) {
                blue.value = 0;
            } else {
                green.value = 0;
            }
        } else if (green.value == maxSlider) {
            green.value = 255;
            if (blue.value == minSlider) {
                blue.value = 0;
            } else {
                red.value = 0;
            }
        } else {
            blue.value = 255;
            if (green.value == minSlider) {
                green.value = 0;
            } else {
                red.value = 0;
            }
        }
    }
}


function drawScalene(verticies, color) {
    for (let i = 0; i < 6; i++) {
        verticies[i] /= 400;
    }
    gl.uniform4f(u_FragColor, color[0]/255, color[1]/255, color[2]/255, 1.0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function showDrawing() {
    drawScalene([-384, 0, -336, 0, -370, 34], [168, 170, 183])
    drawScalene([-384, 0, -336, 0, -370, -34], [168, 170, 183])
    drawScalene([-370, 34, -336, 0, -336, 48], [168, 170, 183])
    drawScalene([-370, -34, -336, 0, -336, -48], [168, 170, 183])
    drawScalene([-336, 48, -264, -108, -264, 48], [186, 190, 209])
    drawScalene([-336, 48, -264, -108, -336, -108], [186, 190, 209])

    drawScalene([-336, 48, -48, 96, -48, 48], [186, 190, 209])
    drawScalene([-204, -108, 24, -108, -204, 48], [186, 190, 209])
    drawScalene([-204, 48, -48, 96, 24, -108], [186, 190, 209])
    drawScalene([-48, 96, 0, 96, 24, -108], [186, 190, 209])
    drawScalene([24, -108, 0, 96, 144, -48], [186, 190, 209])
    drawScalene([36, 60, 144, -48, 384, -48], [186, 190, 209])
    drawScalene([24, -108, 192, -48, 144, 36], [186, 190, 209])
    drawScalene([144, 36, 360, 36, 360, -48], [186, 190, 209])
    drawScalene([144, 36, 132, 24, 360, -48], [186, 190, 209])
    drawScalene([24, -96, -72, -96, -72, -132], [50, 50, 50])
    drawScalene([24, -96, -72, -132, 24, -132], [50, 50, 50])

    drawScalene([-264, 60, -204, 60, -204, -108], [73, 117, 178])
    drawScalene([-264, -108, -264, 60, -204, -108], [73, 117, 178])
    drawScalene([36, 60, -264, 60, -192, 72], [73, 117, 178])
    drawScalene([-192, 72, 24, 72, 36, 60], [73, 117, 178])
    drawScalene([360, 36, 360, -48, 384, -48], [73, 117, 178])
    drawScalene([360, 36, 384, -48, 384, 36], [73, 117, 178])

    drawScalene([288, -6, 276, 30, 300, 30], [100, 100, 100])
    drawScalene([288, -6, 276, -42, 300, -42], [100, 100, 100])
    drawScalene([288, -6, 264, 12, 276, 30], [100, 100, 100])
    drawScalene([288, -6, 264, -24, 276, -42], [100, 100, 100])
    drawScalene([288, -6, 312, 12, 300, 30], [100, 100, 100])
    drawScalene([288, -6, 312, -24, 300, -42], [100, 100, 100])
    drawScalene([300, -6, 264, 12, 264, -24], [37, 49, 100])
    drawScalene([276, -6, 312, 12, 312, -24], [37, 49, 100])

    drawScalene([-40.8, 96, -31.2, 96, -36, 132], [125, 125, 125])
    drawScalene([-16.8, 96, -7.2, 96, -12, 108], [125, 125, 125])
    
    drawn = true;
}
