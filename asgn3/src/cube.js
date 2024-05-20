class Cube {
    static vetexArray = new Float32Array([
        -.5,-.5,-.5, .5,-.5,-.5, .5,.5,-.5,
        -.5,-.5,-.5, -.5,.5,-.5, .5,.5,-.5,
        .5,.5,.5, -.5,-.5,.5, -.5,.5,.5,
        .5,-.5,.5, .5,.5,.5, -.5,-.5,.5,
        -.5,-.5,-.5, -.5,-.5,.5, -.5,.5,.5,
        -.5,-.5,-.5, -.5,.5,-.5, -.5,.5,.5,
        .5,.5,.5, .5,-.5,-.5, .5,.5,-.5,
        .5,-.5,.5, .5,.5,.5, .5,-.5,-.5,
        .5,.5,.5, -.5,.5,.5, -.5,.5,-.5,
        .5,.5,.5, .5,.5,-.5, -.5,.5,-.5,
        -.5,-.5,-.5, .5,-.5,-.5, .5,-.5,.5,
        -.5,-.5,-.5, -.5,-.5,.5, .5,-.5,.5,
    ]);
    static vetexArray1 = new Float32Array([
        -.5,-.5,-.5, .5,-.5,-.5, .5,.5,-.5,
        -.5,-.5,-.5, -.5,.5,-.5, .5,.5,-.5,
        .5,.5,.5, -.5,-.5,.5, -.5,.5,.5,
        .5,-.5,.5, .5,.5,.5, -.5,-.5,.5,
    ]);
    static vetexArray2 = new Float32Array([
        -.5,-.5,-.5, -.5,-.5,.5, -.5,.5,.5,
        -.5,-.5,-.5, -.5,.5,-.5, -.5,.5,.5,
        .5,.5,.5, .5,-.5,-.5, .5,.5,-.5,
        .5,-.5,.5, .5,.5,.5, .5,-.5,-.5,
    ]);
    static vetexArray3 = new Float32Array([
        .5,.5,.5, -.5,.5,.5, -.5,.5,-.5,
        .5,.5,.5, .5,.5,-.5, -.5,.5,-.5,
        -.5,-.5,-.5, .5,-.5,-.5, .5,-.5,.5,
        -.5,-.5,-.5, -.5,-.5,.5, .5,-.5,.5,
    ]);
    static uvArray = new Float32Array([
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
        0,1, 1,0, 1,1,
        0,0, 0,1, 1,0,
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
        0,1, 1,0, 1,1,
        0,0, 0,1, 1,0,
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
    ]);
    static uvArray1 = new Float32Array([
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
        0,1, 1,0, 1,1,
        0,0, 0,1, 1,0,
    ]);
    static uvArray2 = new Float32Array([
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
        0,1, 1,0, 1,1,
        0,0, 0,1, 1,0,
    ]);
    static uvArray3 = new Float32Array([
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
        0,0, 1,0, 1,1,
        0,0, 0,1, 1,1,
    ]);

    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }

    render() {
        let rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV([-.5,-.5,-.5, .5,-.5,-.5, .5,.5,-.5], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([-.5,-.5,-.5, -.5,.5,-.5, .5,.5,-.5], [0,0, 0,1, 1,1]);

        drawTriangle3DUV([.5,.5,.5, -.5,-.5,.5, -.5,.5,.5], [0,1, 1,0, 1,1]);
        drawTriangle3DUV([.5,-.5,.5, .5,.5,.5, -.5,-.5,.5], [0,0, 0,1, 1,0]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV([-.5,-.5,-.5, -.5,-.5,.5, -.5,.5,.5], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([-.5,-.5,-.5, -.5,.5,-.5, -.5,.5,.5], [0,0, 0,1, 1,1]);

        drawTriangle3DUV([.5,.5,.5, .5,-.5,-.5, .5,.5,-.5], [0,1, 1,0, 1,1]);
        drawTriangle3DUV([.5,-.5,.5, .5,.5,.5, .5,-.5,-.5], [0,0, 0,1, 1,0]);

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV([.5,.5,.5, -.5,.5,.5, -.5,.5,-.5], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([.5,.5,.5, .5,.5,-.5, -.5,.5,-.5], [0,0, 0,1, 1,1]);

        drawTriangle3DUV([-.5,-.5,-.5, .5,-.5,-.5, .5,-.5,.5], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([-.5,-.5,-.5, -.5,-.5,.5, .5,-.5,.5], [0,0, 0,1, 1,1]);
    }

    renderfast() {
        let rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        if (this.textureNum != -1) {
            drawTriangles3DUV(Cube.vetexArray, Cube.uvArray);
        } else {
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            drawTriangles3DUV(Cube.vetexArray1, Cube.uvArray1);

            gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
            drawTriangles3DUV(Cube.vetexArray2, Cube.uvArray2);

            gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
            drawTriangles3DUV(Cube.vetexArray3, Cube.uvArray3);
        }
    }
}