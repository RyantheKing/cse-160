class Sphere {
    static d = Math.PI/20;
    static v;
    static uv;

    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }

    static generateSphere() {
        let v = [];
        let uv = [];
        for (let t = 0; t < Math.PI; t += Sphere.d) {
            for (let p = 0; p < 2 * Math.PI; p += Sphere.d) {
                let p1 = [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
                let p2 = [Math.sin(t + Sphere.d) * Math.cos(p), Math.sin(t + Sphere.d) * Math.sin(p), Math.cos(t + Sphere.d)];
                let p3 = [Math.sin(t) * Math.cos(p + Sphere.d), Math.sin(t) * Math.sin(p + Sphere.d), Math.cos(t)];
                let p4 = [Math.sin(t + Sphere.d) * Math.cos(p + Sphere.d), Math.sin(t + Sphere.d) * Math.sin(p + Sphere.d), Math.cos(t + Sphere.d)];

                v = v.concat(p1); uv = uv.concat([0, 0]);
                v = v.concat(p2); uv = uv.concat([0, 0]);
                v = v.concat(p4); uv = uv.concat([0, 0]);

                v = v.concat(p1); uv = uv.concat([0, 0]);
                v = v.concat(p4); uv = uv.concat([0, 0]);
                v = v.concat(p3); uv = uv.concat([0, 0]);
            }
        }
        Sphere.v = new Float32Array(v);
        Sphere.uv = new Float32Array(uv);
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        for (let t = 0; t < Math.PI; t += Sphere.d) {
            for (let p = 0; p < 2 * Math.PI; p += Sphere.d) {
                let p1 = [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
                let p2 = [Math.sin(t + Sphere.d) * Math.cos(p), Math.sin(t + Sphere.d) * Math.sin(p), Math.cos(t + Sphere.d)];
                let p3 = [Math.sin(t) * Math.cos(p + Sphere.d), Math.sin(t) * Math.sin(p + Sphere.d), Math.cos(t)];
                let p4 = [Math.sin(t + Sphere.d) * Math.cos(p + Sphere.d), Math.sin(t + Sphere.d) * Math.sin(p + Sphere.d), Math.cos(t + Sphere.d)];

                let v = [];
                let uv = [];
                v = v.concat(p1); uv = uv.concat([0, 0]);
                v = v.concat(p2); uv = uv.concat([0, 0]);
                v = v.concat(p4); uv = uv.concat([0, 0]);

                drawTriangle3DUVNormal(v, uv, v);

                v = []; uv = [];
                v = v.concat(p1); uv = uv.concat([0, 0]);
                v = v.concat(p4); uv = uv.concat([0, 0]);
                v = v.concat(p3); uv = uv.concat([0, 0]);
                drawTriangle3DUVNormal(v, uv, v);
            }
        }
    }

    renderfast() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUVNormal(Sphere.v, Sphere.uv, Sphere.v);
    }
}