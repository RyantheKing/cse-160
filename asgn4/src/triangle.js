let vertexBuffer;
function initTrianges() {
    vertexBuffer = gl.createBuffer();
    // uvBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(a_Position);
}

function drawTriangle3D(vertices) {
    let n = vertices.length / 3;

    // let vertexBuffer = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
    let n = vertices.length / 3;

    // let vertexBuffer = gl.createBuffer();
    let uvBuffer = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);

    uvBuffer = null;
}

function drawTriangles3DUV(vertices, uv) {
    let n = vertices.length / 3;

    // let vertexBuffer = gl.createBuffer();
    let uvBuffer = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);

    uvBuffer = null;
}

function drawTriangle3DUVNormal(vertices, uv, normals) {
    let n = vertices.length / 3;

    // let vertexBuffer = gl.createBuffer();
    let uvBuffer = gl.createBuffer();
    let normalBuffer = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);

    uvBuffer = null;
    normalBuffer = null;
}

function drawTriangles3DUVNormal(vertices, uv, normals) {
    let n = vertices.length / 3;

    // let vertexBuffer = gl.createBuffer();
    let uvBuffer = gl.createBuffer();
    let normalBuffer = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

let circlePoints1 = new Float32Array([
    0,
    0,
    -0.5,
    0.5,
    0,
    -0.5,
    0.4045084971874737,
    0.29389262614623657,
    -0.5,
    0.15450849718747373,
    0.47552825814757677,
    -0.5,
    -0.15450849718747367,
    0.4755282581475768,
    -0.5,
    -0.40450849718747367,
    0.2938926261462366,
    -0.5,
    -0.5,
    6.123233995736766e-17,
    -0.5,
    -0.4045084971874737,
    -0.2938926261462365,
    -0.5,
    -0.15450849718747378,
    -0.47552825814757677,
    -0.5,
    0.15450849718747361,
    -0.4755282581475768,
    -0.5,
    0.40450849718747367,
    -0.2938926261462367,
    -0.5,
    0.5,
    0,
    -0.5
]);
let circlePoints2 = new Float32Array([
    0,
    0,
    0.5,
    0.5,
    0,
    0.5,
    0.4045084971874737,
    0.29389262614623657,
    0.5,
    0.15450849718747373,
    0.47552825814757677,
    0.5,
    -0.15450849718747367,
    0.4755282581475768,
    0.5,
    -0.40450849718747367,
    0.2938926261462366,
    0.5,
    -0.5,
    6.123233995736766e-17,
    0.5,
    -0.4045084971874737,
    -0.2938926261462365,
    0.5,
    -0.15450849718747378,
    -0.47552825814757677,
    0.5,
    0.15450849718747361,
    -0.4755282581475768,
    0.5,
    0.40450849718747367,
    -0.2938926261462367,
    0.5,
    0.5,
    0,
    0.5
]);

function drawCircle3D() {
    // let vertices = [center[0], center[1], center[2]];
    // let rad_step = 2 * Math.PI / segments;
    // // let vertexBuffer = gl.createBuffer();

    // for (let i = 0; i < segments; i++) {
    //     vertices.push(center[0] + Math.cos(rad_step * i) * radius);
    //     vertices.push(center[1] + Math.sin(rad_step * i) * radius);
    //     vertices.push(center[2]);
    // }
    // vertices.push(center[0] + radius);
    // vertices.push(center[1]);
    // vertices.push(center[2]);

    // console.log(vertices);

    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, circlePoints1, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 12);

    gl.bufferData(gl.ARRAY_BUFFER, circlePoints2, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 12);
}

// function drawCircle3D(center, radius, segments) {
//     // let vertices = [center[0], center[1], center[2]];
//     let rad_step = 2 * Math.PI / segments;
//     // let circleBuffer = gl.createBuffer();
//     // if (!circleBuffer) {
//     //     console.log('Failed to create the buffer object');
//     //     return -1;
//     // }

//     let allvertices = [];

//     for (let i = 0; i < segments; i++) {
//         allvertices.push(center[0])
//         allvertices.push(center[1])
//         allvertices.push(center[2])
//         allvertices.push(center[0] + Math.cos(rad_step * i) * radius);
//         allvertices.push(center[1] + Math.sin(rad_step * i) * radius);
//         allvertices.push(center[2]);
//         allvertices.push(center[0] + Math.cos(rad_step * (i + 1)) * radius);
//         allvertices.push(center[1] + Math.sin(rad_step * (i + 1)) * radius);
//         allvertices.push(center[2]);
//     }

//     drawTriangle3D(allvertices);

//     // for (let i = 0; i < segments; i++) {
//     //     vertices.push(center[0] + Math.cos(rad_step * i) * radius);
//     //     vertices.push(center[1] + Math.sin(rad_step * i) * radius);
//     //     vertices.push(center[2]);
//     // }
//     // vertices.push(center[0] + radius);
//     // vertices.push(center[1]);
//     // vertices.push(center[2]);

//     // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
//     // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
//     // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
//     // gl.enableVertexAttribArray(a_Position);

//     // gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);
// }