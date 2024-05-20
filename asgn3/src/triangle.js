function drawTriangle3D(vertices) {
    let n = 3

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
    let n = 3

    let vertexBuffer = gl.createBuffer();
    let uvBuffer = gl.createBuffer();
    if (!vertexBuffer || !uvBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawCircle3D(center, radius, segments) {
    // let vertices = [center[0], center[1], center[2]];
    let rad_step = 2 * Math.PI / segments;
    // let circleBuffer = gl.createBuffer();
    // if (!circleBuffer) {
    //     console.log('Failed to create the buffer object');
    //     return -1;
    // }

    for (let i = 0; i < segments; i++) {
        drawTriangle3D([center[0], center[1], center[2], 
                        center[0] + Math.cos(rad_step * i) * radius, center[1] + Math.sin(rad_step * i) * radius, center[2],
                        center[0] + Math.cos(rad_step * (i + 1)) * radius, center[1] + Math.sin(rad_step * (i + 1)) * radius, center[2]]);
    }
        

    // for (let i = 0; i < segments; i++) {
    //     vertices.push(center[0] + Math.cos(rad_step * i) * radius);
    //     vertices.push(center[1] + Math.sin(rad_step * i) * radius);
    //     vertices.push(center[2]);
    // }
    // vertices.push(center[0] + radius);
    // vertices.push(center[1]);
    // vertices.push(center[2]);

    // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Position);

    // gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);
}