class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        let rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // draw cube centered at the origin
        drawTriangle3D([-0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  0.5, 0.5, 0.5]);
        drawTriangle3D([-0.5, -0.5, 0.5,  -0.5, 0.5, 0.5,  0.5, 0.5, 0.5]);

        gl.uniform4f(u_FragColor, rgba[0]*.95, rgba[1]*.95, rgba[2]*.95, rgba[3]);
        drawTriangle3D([-0.5, -0.5, 0.5,  -0.5, -0.5, -0.5,  0.5, -0.5, -0.5]);
        drawTriangle3D([-0.5, -0.5, 0.5,  0.5, -0.5, -0.5,  0.5, -0.5, 0.5]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3D([-0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, 0.5, -0.5]);
        drawTriangle3D([-0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,  0.5, 0.5, -0.5]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3D([-0.5, 0.5, -0.5,  0.5, 0.5, -0.5,  0.5, 0.5, 0.5]);
        drawTriangle3D([-0.5, 0.5, -0.5,  -0.5, 0.5, 0.5,  0.5, 0.5, 0.5]);

        gl.uniform4f(u_FragColor, rgba[0]*.95, rgba[1]*.95, rgba[2]*.95, rgba[3]);
        drawTriangle3D([0.5, -0.5, -0.5,  0.5, -0.5, 0.5,  0.5, 0.5, 0.5]);
        drawTriangle3D([0.5, -0.5, -0.5,  0.5, 0.5, -0.5,  0.5, 0.5, 0.5]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([-0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,  -0.5, 0.5, 0.5]);
        drawTriangle3D([-0.5, -0.5, -0.5,  -0.5, -0.5, 0.5,  -0.5, 0.5, 0.5]);
    }
}