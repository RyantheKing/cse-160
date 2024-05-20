class Cylinder {
    constructor() {
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 10;
    }

    render() {
        let rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawCircle3D([0, 0, 0.5], 0.5, this.segments);
        drawCircle3D([0, 0, -0.5], 0.5, this.segments);
        let rad_step = 2 * Math.PI / this.segments;
        let x1, y1, x2, y2;
        let c = 0;
        for (let i = 0; i < this.segments; i++) {
            gl.uniform4f(u_FragColor, rgba[0]*(1-c/10), rgba[1]*(1-c/10), rgba[2]*(1-c/10), rgba[3]);
            if (i >= 5) {c--;} else {c++;}
            x1 = Math.cos(rad_step * i)/2;
            y1 = Math.sin(rad_step * i)/2;
            x2 = Math.cos(rad_step * (i + 1))/2;
            y2 = Math.sin(rad_step * (i + 1))/2;
            drawTriangle3D([x1, y1, 0.5, x2, y2, 0.5, x1, y1, -0.5]);
            drawTriangle3D([x1, y1, -0.5, x2, y2, -0.5, x2, y2, 0.5]);
        }
    }
}