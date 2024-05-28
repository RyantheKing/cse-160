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
    static normalArray = new Float32Array([
        0,0,-1, 0,0,-1, 0,0,-1,
        0,0,-1, 0,0,-1, 0,0,-1,
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1,
        -1,0,0, -1,0,0, -1,0,0,
        -1,0,0, -1,0,0, -1,0,0,
        1,0,0, 1,0,0, 1,0,0,
        1,0,0, 1,0,0, 1,0,0,
        0,1,0, 0,1,0, 0,1,0,
        0,1,0, 0,1,0, 0,1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
    ]);
    static normalArray1 = new Float32Array([
        0,0,-1, 0,0,-1, 0,0,-1,
        0,0,-1, 0,0,-1, 0,0,-1,
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1,
    ]);
    static normalArray2 = new Float32Array([
        -1,0,0, -1,0,0, -1,0,0,
        -1,0,0, -1,0,0, -1,0,0,
        1,0,0, 1,0,0, 1,0,0,
        1,0,0, 1,0,0, 1,0,0,
    ]);
    static normalArray3 = new Float32Array([
        0,1,0, 0,1,0, 0,1,0,
        0,1,0, 0,1,0, 0,1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
    ]);

    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -1;
    }

    render() {
        let rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUVNormal([-.5,-.5,-.5, .5,-.5,-.5, .5,.5,-.5], [0,0, 1,0, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal([-.5,-.5,-.5, -.5,.5,-.5, .5,.5,-.5], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

        drawTriangle3DUVNormal([.5,.5,.5, -.5,-.5,.5, -.5,.5,.5], [0,1, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([.5,-.5,.5, .5,.5,.5, -.5,-.5,.5], [0,0, 0,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);

        if (!u_lightOn) {gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);}
        drawTriangle3DUVNormal([-.5,-.5,-.5, -.5,-.5,.5, -.5,.5,.5], [0,0, 1,0, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([-.5,-.5,-.5, -.5,.5,-.5, -.5,.5,.5], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);

        drawTriangle3DUVNormal([.5,.5,.5, .5,-.5,-.5, .5,.5,-.5], [0,1, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([.5,-.5,.5, .5,.5,.5, .5,-.5,-.5], [0,0, 0,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

        if (!u_lightOn) {gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);}
        drawTriangle3DUVNormal([.5,.5,.5, -.5,.5,.5, -.5,.5,-.5], [0,0, 1,0, 1,1], [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([.5,.5,.5, .5,.5,-.5, -.5,.5,-.5], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);

        drawTriangle3DUVNormal([-.5,-.5,-.5, .5,-.5,-.5, .5,-.5,.5], [0,0, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([-.5,-.5,-.5, -.5,-.5,.5, .5,-.5,.5], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
    }

    renderfast() {
        let rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        // this.normalMatrix.setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        if (this.textureNum != -1) {
            drawTriangles3DUVNormal(Cube.vetexArray, Cube.uvArray, Cube.normalArray);
        } else {
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            drawTriangles3DUVNormal(Cube.vetexArray1, Cube.uvArray1, Cube.normalArray1);
            if (!g_lightOn) {gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);}
            drawTriangles3DUVNormal(Cube.vetexArray2, Cube.uvArray2, Cube.normalArray2);
            if (!g_lightOn) {gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);}
            drawTriangles3DUVNormal(Cube.vetexArray3, Cube.uvArray3, Cube.normalArray3);
        }
    }
}