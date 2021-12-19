const DEBUG = false;

// VECTOR3 ////////////////////////////////////////////////////////////////////
//Holds 3-dimensional positional data. It doesn't necessarily have to be for
//position

class Vector3 {
    static intersectPlane(planeP, planeN, lineStart, lineEnd) {
        planeN = planeN.getUnit();
        var planeD = -(planeN.dot(planeP));
        var ad = lineStart.dot(planeN);
        var bd = lineEnd.dot(planeN);
        var t = (-planeD - ad) / (bd - ad);
        var lineStartToEnd = lineEnd.sub(lineStart);
        var lineToIntersect = lineStartToEnd.mul(t);
        
        return lineStart.add(lineToIntersect);
    }
    
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    
    set(x, y, z) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.z = z || this.z;
    }
    
    copy(vec) {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
    }
    
    clone(x = this.x, y = this.y, z = this.z) {
        var clone = new this.constructor(x, y, z);
        return clone;
    }
    
    negate() {
        return this.clone(-this.x, -this.y, -this.z);
    }
    
    add(vec) {
        return this.clone(
            this.x + vec.x,
            this.y + vec.y,
            this.z + vec.z
        );
    }
    
    sub(vec) {
        return this.clone(
            this.x - vec.x,
            this.y - vec.y,
            this.z - vec.z
        );
    }
    
    mul(vec) {
        if (vec instanceof Vector3) {
            return this.clone(
                this.x * vec.x,
                this.y * vec.y,
                this.z * vec.z
            );
        }
        
        if (vec instanceof Matrix4) {
            return this.mulMat(vec);
        }
        
        if (vec instanceof CFrame) {
            return this.mulCf(vec);
        }
        
        return this.clone(
            this.x * vec,
            this.y * vec,
            this.z * vec
        );
    }
    
    mulMat(mat) {
        if (!(mat instanceof Matrix4)) throw "Argument 1 not a Matrix4";
        
        var resX = this.x * mat.get(0, 0) + this.y * mat.get(0, 1) + this.z * mat.get(0, 2) + mat.get(0, 3);
        var resY = this.x * mat.get(1, 0) + this.y * mat.get(1, 1) + this.z * mat.get(1, 2) + mat.get(1, 3);
        var resZ = this.x * mat.get(2, 0) + this.y * mat.get(2, 1) + this.z * mat.get(2, 2) + mat.get(2, 3);
        var resW = this.x * mat.get(3, 0) + this.y * mat.get(3, 1) + this.z * mat.get(3, 2) + mat.get(3, 3);
        
        if (resW === 0)
            return this.clone(resX, resY, resZ);
        else
            return this.clone(resX / resW, resY / resW, resZ / resW);
    }
    
    mulCf(cf) {
        if (!(cf instanceof CFrame)) throw "Argument 1 not a CFrame";
        
        return this.mulMat(cf.matrix);
    }
    
    div(vec) {
        if (vec instanceof Vector3) {
            return this.clone(
                this.x / vec.x,
                this.y / vec.y,
                this.z / vec.z
            );
        }
        
        return this.clone(
            this.x / vec,
            this.y / vec,
            this.z / vec
        );
    }
    
    dot(vec) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }
    
    cross(vec) {
        return this.clone(
            this.y * vec.z - this.z * vec.y,
            this.z * vec.x - this.x * vec.z,
            this.x * vec.y - this.y * vec.x
        );
    }
    
    getMagnitudeSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    
    getMagnitude() {
        return Math.sqrt(this.getMagnitudeSq());
    }
    
    getUnit() {
        var magn = this.getMagnitude();
        if (magn === 0) magn = 1;
        
        return this.clone().div(magn);
    }
    
    toString() {
        return "(" + this.x + ", " + this.y + ", " + this.z + ")";
    }
    
    toVector4() {
        return new Vector4(
            this.x,
            this.y,
            this.z
        );
    }
}

// VECTOR4 ////////////////////////////////////////////////////////////////////
//A four-dimensional vector. This is used to do matrix math with vectors.
//Since you can't do math with 4x4 matrices and 3x1 matrices (Vector3s), only
//4x4 matrices and 4x1 (Vector4s). And the fourth value of the vector is used
//in the projection equation.

class Vector4 extends Vector3 {
    constructor(x, y, z, w) {
        super(x, y, z);
        this.w = w || 1;
    }
    
    set(x, y, z, w) {
        super.set(x, y, z);
        this.w = w || this.w;
    }
    
    copy(vec) {
        super.copy(vec);
        
        if (vec instanceof Vector4) {
            this.w = vec.w;
        }
    }
    
    clone(x = this.x, y = this.y, z = this.z, w = this.z) {
        return new this.constructor(x, y, z, w);
    }
    
    mulMat(mat) {
        if (!(mat instanceof Matrix4)) throw "Argument 1 not a Matrix4";
        
        var resX = this.x * mat.get(0, 0) + this.y * mat.get(0, 1) + this.z * mat.get(0, 2) + this.w * mat.get(0, 3);
        var resY = this.x * mat.get(1, 0) + this.y * mat.get(1, 1) + this.z * mat.get(1, 2) + this.w * mat.get(1, 3);
        var resZ = this.x * mat.get(2, 0) + this.y * mat.get(2, 1) + this.z * mat.get(2, 2) + this.w * mat.get(2, 3);
        var resW = this.x * mat.get(3, 0) + this.y * mat.get(3, 1) + this.z * mat.get(3, 2) + this.w * mat.get(3, 3);
        
        var clone = this.clone(resX, resY, resZ, resW);
        
        return clone;
    }
    
    toVector3() {
        return new Vector3(
            this.x / this.w,
            this.y / this.w,
            this.z / this.w
        );
    }
}

// MATRIX4 ////////////////////////////////////////////////////////////////////
//A 4x4 matrix

class Matrix4 {
    static multiplyMats(m1, m2) {
        if (!(m1 instanceof Matrix4)) throw "Argument 1 not a Matrix4";
        if (!(m2 instanceof Matrix4)) throw "Argument 2 not a Matrix4";
        
        var res = new Matrix4();
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                let dot = m1.get(0, y) * m2.get(x, 0) + m1.get(1, y) * m2.get(x, 1) + m1.get(2, y) * m2.get(x, 2) + m1.get(3, y) * m2.get(x, 3);
                
                res.set(x, y, dot);
            }
        }
        
        return res;
    }
    
    static createRotationMatrix(axis, a) {
        if (axis === "x")
            return new Matrix4([
                1, 0, 0, 0,
                0, Math.cos(a), -Math.sin(a), 0,
                0, Math.sin(a), Math.cos(a), 0,
                0, 0, 0, 1,
            ]);
            
        if (axis === "y")
            return new Matrix4([
                Math.cos(a), 0, Math.sin(a), 0,
                0, 1, 0, 0,
                -Math.sin(a), 0, Math.cos(a), 0,
                0, 0, 0, 1
            ]);
            
        if (axis === "z")
            return new Matrix4([
                Math.cos(a), -Math.sin(a), 0, 0,
                Math.sin(a), Math.cos(a), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            
        var rotX = Matrix4.createRotationMatrix("x", a.x);
        var rotY = Matrix4.createRotationMatrix("y", a.y);
        var rotZ = Matrix4.createRotationMatrix("z", a.z);
            
        if (axis === "xyz")
            return rotX.mul(rotY).mul(rotZ);
        if (axis === "xzy")
            return rotX.mul(rotZ).mul(rotY);
        if (axis === "yxz")
            return rotY.mul(rotX).mul(rotZ);
        if (axis === "yzx")
            return rotY.mul(rotZ).mul(rotX);
        if (axis === "zxy")
            return rotZ.mul(rotX).mul(rotY);
        if (axis === "zyx")
            return rotZ.mul(rotY).mul(rotX);
    }
    
    constructor(c) {
        if (c === undefined) {
            this.components = [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ];
        } else {
            this.setComponents(c);
        }
    }
    
    clone() {
        var res = new Matrix4();
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                res.set(x, y, this.get(x, y));
            }
        }
        
        return res;
    }
    
    setComponents(c) {
        this.components = [
            [c[0], c[1], c[2], c[3]],
            [c[4], c[5], c[6], c[7]],
            [c[8], c[9], c[10], c[11]],
            [c[12], c[13], c[14], c[15]]
        ];
    }
    
    get(x, y) {
        return this.components[y][x];
    }
    
    set(x, y, v) {
        this.components[y][x] = v;
    }
    
    mul(mat) {
        return Matrix4.multiplyMats(this, mat);
    }
}

// CFRAME //////////////////////////////////////////////////////////////////////
//Short for "Coordinate frame". This is a Matrix4 that stores positional and
//rotational data.

class CFrame { //that's what roblox calls them lol and point-at matrix is kinda a sucky name so...
                //short for "CoordinateFrame"
                
    static fromMatrix(pos, rtVec, upVec, fwVec) {
        if (fwVec === undefined)
            fwVec = rtVec.cross(upVec).getUnit();
            
        rtVec = upVec.cross(fwVec);
        upVec = fwVec.cross(rtVec);
        fwVec = rtVec.cross(upVec);
        
        return new CFrame(new Matrix4([
            rtVec.x, rtVec.y, rtVec.z, 0,
            upVec.x, upVec.y, upVec.z, 0,
            fwVec.x, fwVec.y, fwVec.z, 0,
            pos.x,   pos.y,   pos.z,   1,
        ]));
    }
    
    static fromRotation(rot, ordering = "xyz") {
        var lookVec = new Vector3(0, 0, 1);
        var upVec = new Vector3(0, 1, 0);
        
        var rotMat = Matrix4.createRotationMatrix(ordering, rot);
        
        lookVec = lookVec.mulMat(rotMat);
        upVec = upVec.mulMat(rotMat);
        
        return new CFrame(new Vector3(0, 0, 0), lookVec, upVec);
    }
    
    setVectors(pos, rtVec, upVec, fwVec) {
        this.matrix.setComponents([
            rtVec.x,    rtVec.y,    rtVec.z,    0,
            upVec.x,    upVec.y,    upVec.z,    0,
            fwVec.x,    fwVec.y,    fwVec.z,    0,
            pos.x,      pos.y,      pos.z,      1,
        ]);
    }
    
    constructor(pos, target, up) {
        if (pos === undefined) {
            this.matrix = new Matrix4();
            return;
        }
        
        if (pos instanceof Matrix4) {
            this.matrix = pos;
            return;
        }
        
        if (target === undefined) {
            this.matrix = new Matrix4([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                pos.x, pos.y, pos.z, 1
            ]);
            return;
        }
        
        var fwVec, rtVec, upVec;
        
        fwVec = target.sub(pos);
        fwVec = fwVec.getUnit();
        
        if (up === undefined) {
            up = new Vector3(0, 1, 0);
            
            rtVec = up.cross(fwVec).getUnit();
            upVec = fwVec.cross(rtVec).getUnit();
            rtVec = upVec.cross(fwVec);
        } else {
            rtVec = up.cross(fwVec);
            upVec = fwVec.cross(rtVec);
            fwVec = rtVec.cross(upVec);
        }
        
        this.matrix = new Matrix4([
            rtVec.x, rtVec.y, rtVec.z, 0,
            upVec.x, upVec.y, upVec.z, 0,
            fwVec.x, fwVec.y, fwVec.z, 0,
            pos.x, pos.y, pos.z,       1,
        ]);
    }
    
    get rightVector() {
        return new Vector3(
            this.matrix.get(0, 0),    
            this.matrix.get(1, 0),
            this.matrix.get(2, 0)
        );
    }
    
    get upVector() {
        return new Vector3(
            this.matrix.get(0, 1),
            this.matrix.get(1, 1),
            this.matrix.get(2, 1)
        );
    }
    
    get forwardVector() {
        return new Vector3(
            this.matrix.get(0, 2),
            this.matrix.get(1, 2),
            this.matrix.get(2, 2)
        );
    }
    
    get position() {
        return new Vector3(
            this.matrix.get(0, 3),
            this.matrix.get(1, 3),
            this.matrix.get(2, 3)
        );
    }
    
    set position(v) {
        this.matrix.set(0, 3, v.x);
        this.matrix.set(1, 3, v.y);
        this.matrix.set(2, 3, v.z);
    }
                
    /*constructor(pos, lookAt) {
        if (pos !== undefined) {
            if (lookAt === undefined) {
                this.__matrix = new Matrix4([
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    pos.x, pos.y, pos.z, 1
                ]);
            } else {
                var fwVec = lookAt.sub(pos).getUnit();
                var upVec = new Vector3(0, 1, 0);
                var rtVec = upVec.cross(fwVec);
                upVec = fwVec.cross(rtVec);
                
                this.__matrix = new Matrix4([
                    fwVec.x, fwVec.y, fwVec.z, 0,
                    rtVec.x, rtVec.y, rtVec.z, 0,
                    upVec.x, upVec.y, upVec.z, 0,
                    pos.x, pos.y, pos.z,       1,
                ]);
            }
        } else {
            this.__matrix = new Matrix4();
        }
    }*/
    
    inverse() {
        var pos = this.position;
        var mat = this.matrix;
        
        var res = new this.constructor(new Matrix4([
            mat.get(0, 0),          mat.get(0, 1),          mat.get(0, 2),      0,
            mat.get(1, 0),          mat.get(1, 1),          mat.get(1, 2),      0,
            mat.get(2, 0),          mat.get(2, 1),          mat.get(2, 2),      0,
            pos.negate().dot(this.rightVector), pos.negate().dot(this.upVector),   pos.negate().dot(this.forwardVector),  1,
        ]));
        
        //console.log(res);
        
        return res;
    }
    
    mul(cf) {
        if (cf instanceof Matrix4) return this.mulMat(cf);
        if (!(cf instanceof CFrame)) throw "Argument 1 not a CFrame";
        
        var mat1 = this.matrix;
        var mat2 = cf.matrix;
        
        return new this.constructor(mat1.mul(mat2));
    }
    
    mulMat(oMat) {
        if (!(oMat instanceof Matrix4)) throw "Argument 1 not a Matrix4";
        
        var mat = this.matrix;
        
        return new this.constructor(mat.mul(oMat));
    }
    
    addVec(vec) {
        if (!(vec instanceof Vector3)) throw "Argument 1 not a Vector3";
        
        var clone = new CFrame(this.matrix.clone());
        clone.position = this.position.add(vec);
        return clone;
    }
    
    subVec(vec) {
        if (!(vec instanceof Vector3)) throw "Argument 1 not a Vector3";
        
        var clone = new CFrame(this.matrix.clone());
        clone.position = this.position.sub(vec);
        return clone;
    }
}

// FACE3 //////////////////////////////////////////////////////////////////////
//This is the most primitive 3D shape. It is used to build more complex shapes.

class Face3 {
    constructor(p0, p1, p2) {
        this.points = [
            p0 || new Vector3(),
            p1 || new Vector3(),
            p2 || new Vector3(),
        ];
        
        this.color = new Color4(1, 1, 1, 1);
    }
    
    clone() {
        var tri = new this.constructor(this.points[0], this.points[1], this.points[2]);
        tri.color = this.color;
        
        return tri;
    }
    
    get normal() {
        var l1 = this.points[1].sub(this.points[0]);
        var l2 = this.points[2].sub(this.points[0]);
        
        return l1.cross(l2).getUnit();
    }
    
    clipAgainstPlane(planeP, planeN) {
        planeN = planeN.getUnit();
        
        //return signed shortest distance from point to plane
        var dist = (p) => 
            planeN.x * p.x + planeN.y * p.y + planeN.z * p.z - planeN.dot(planeP);
        
        //temp arrays to classify points on either side of plane
        //if dist is positive, point lies "inside" of the plane
        var insidePoints = [];
        var outsidePoints = [];
        
        //get dist of each point in triangle to plane
        var d0 = dist(this.points[0]);
        var d1 = dist(this.points[1]);
        var d2 = dist(this.points[2]);
        
        if (d0 >= 0) insidePoints.push(this.points[0]);
        else outsidePoints.push(this.points[0]);
        
        if (d1 >= 0) insidePoints.push(this.points[1]);
        else outsidePoints.push(this.points[1]);
        
        if (d2 >= 0) insidePoints.push(this.points[2]);
        else outsidePoints.push(this.points[2]);
        
        //classify triangle points and break triangle into smaller
        //triangles if needed
        
        if (insidePoints.length === 0) {
            //triangle is entirely outside of plane, ignore
            return [];
        }
        
        if (insidePoints.length === 3) {
            //all points are inside bounds, please use entirety of it
            return [this];
        }
        
        if (insidePoints.length === 1 && outsidePoints.length === 2) {
            //one point is inside bounds, split it into a new triangle
            var outTri = this.clone();
            
            outTri.points[0] = insidePoints[0];
            
            outTri.points[1] = Vector3.intersectPlane(planeP, planeN, insidePoints[0], outsidePoints[0]);
            outTri.points[2] = Vector3.intersectPlane(planeP, planeN, insidePoints[0], outsidePoints[1]);
            
            return [outTri];
        }
        
        if (insidePoints.length === 2 && outsidePoints.length === 1) {
            //two points are inside, split it into a quad
            //(which is then split into two triangles)
            var out1 = this.clone();
            var out2 = this.clone();
            
            out1.points[0] = insidePoints[0];
            out1.points[1] = insidePoints[1];
            out1.points[2] = Vector3.intersectPlane(planeP, planeN, insidePoints[0], outsidePoints[0]);
            
            out2.points[0] = insidePoints[1];
            out2.points[1] = out1.points[2];
            out2.points[2] = Vector3.intersectPlane(planeP, planeN, insidePoints[1], outsidePoints[0]);
            
            return [out1, out2];
        }
    }
}

// OBJECT3D ///////////////////////////////////////////////////////////////////
//This is the base class for all 3D objects

class Object3D {
    constructor() {
        //this.cframe = new CFrame(new Vector3(0, 0, 0), new Vector3(0, 0, 1), new Vector3(0, 1, 0));
        this.cframe = new CFrame();
        this.scale = new Vector3(1, 1, 1);
    }
    
    get position() {
        return this.cframe.position;
    }
    
    set position(v) {
        this.cframe.position = v;
    }
    
    //returns a 3D vector of xyz angles
    getRotationAngles() {
        var fwVec = this.cframe.forwardVector;
        var rtVec = this.cframe.rightVector;
        var upVec = this.cframe.upVector;
        
        var yAng = Math.atan2(fwVec.x, fwVec.z);
        var xAng = Math.atan2(upVec.z, upVec.y);
        var zAng = Math.atan2(upVec.x, upVec.y);
        
        return new Vector3(xAng, yAng, zAng);
    }
    
    rotateX(a) {
        var rotMat = Matrix4.createRotationMatrix("x", a);
    
        var fwVec = this.cframe.forwardVector.mulMat(rotMat);
        var upVec = this.cframe.upVector.mulMat(rotMat);
        var rtVec = this.cframe.rightVector.mulMat(rotMat);
        
        this.cframe.setVectors(this.position, rtVec, upVec, fwVec);
        //cam.cframe = new pk3d.CFrame(cam.position, cam.position.add(fwVec), upVec);
    }
    
    rotateY(a) {
        var rotMat = Matrix4.createRotationMatrix("y", a);
    
        var fwVec = this.cframe.forwardVector.mulMat(rotMat);
        var upVec = this.cframe.upVector.mulMat(rotMat);
        var rtVec = this.cframe.rightVector.mulMat(rotMat);
        
        this.cframe.setVectors(this.position, rtVec, upVec, fwVec);
        //cam.cframe = new pk3d.CFrame(cam.position, cam.position.add(fwVec), upVec);
    }
    
    rotateZ(a) {
        var rotMat = Matrix4.createRotationMatrix("z", a);
    
        var fwVec = this.cframe.forwardVector.mulMat(rotMat);
        var upVec = this.cframe.upVector.mulMat(rotMat);
        var rtVec = this.cframe.rightVector.mulMat(rotMat);
        
        this.cframe.setVectors(this.position, rtVec, upVec, fwVec);
        //cam.cframe = new pk3d.CFrame(cam.position, cam.position.add(fwVec), upVec);
    }
    
    /*get position() {
        return this.cframe.position;
    }
    
    set position(v) {
        this.cframe.position = v;
    }*/
}

// CAMERA /////////////////////////////////////////////////////////////////////
//camera

class Camera extends Object3D {
    constructor(aspect, fov = 90, near = 0.1, far = 1000) {
        super();
        this.cframe = new CFrame(new Vector3(0, 0, 0), new Vector3(0, 0, 1), new Vector3(0, 1, 0));
        //this.cframe.forwardVector = new Vector3(0, 0, 1);
        
        this.aspectRatio = aspect;
        this.fov = fov;
        this.fovRad = fov / 180 * Math.PI;
        this.near = near;
        this.far = far;
        
        this.updateProjectionMatrix();
        
        this.__rot = new Vector3(0, 0, 0);
    }
    
    updateProjectionMatrix() {
        var fovRad = 1 / Math.tan(this.fovRad / 2);
        
        this.__projectionMat = new Matrix4([
            this.aspectRatio * fovRad, 0, 0, 0,
            0, fovRad, 0, 0,
            0, 0, this.far / (this.far - this.near), 1,
            0, 1, (-this.far * this.near) / (this.far - this.near), 0
        ]);
    }
}

// SPRITE /////////////////////////////////////////////////////////////////////
//A 2-dimensional image that has a 3d position

class Sprite extends Object3D {
    constructor(clip) {
        super();
        this.clip = clip;
        this.alwaysOnTop = false;
        
        clip.sprite = this;
        
        this.scale = new Vector3(clip.width / 300, clip.height / 300, 1);
        //x = width
        //y = height
        //z = size
    }
}

// MESH ///////////////////////////////////////////////////////////////////////
//A 3-dimensional shape, built out of Face3s

class Mesh extends Object3D {
    constructor(arr) {
        super();
        
        this.doubleSided = false;
        
        this.faces = [];
        
        if (arr !== undefined) {
            for (let dat of arr) {
                let tri = new Face3(
                    new Vector3(dat[0], dat[1], dat[2]),
                    new Vector3(dat[3], dat[4], dat[5]),
                    new Vector3(dat[6], dat[7], dat[8])
                );
                
                this.faces.push(tri);
            }
        }
    }
    
    flipNormals() {
        for (let face of this.faces) {
            var p0 = face.points[0].clone();
            var p2 = face.points[2].clone();
            
            face.points[2] = p0;
            face.points[0] = p2;
        }
    }
}

// COLOR4 /////////////////////////////////////////////////////////////////////
//Stores rgba color information.

class Color4 {
    constructor(r, g, b, a) {
        //all values in range of 0 to 1
        
        if (g === undefined && b === undefined && a === undefined) {
            this.r = r;
            this.b = r;
            this.g = r;
            this.a = 1;
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a || 1;
        }
    }
    
    clone() {
        return new this.constructor(this.r, this.g, this.b, this.a);
    }
    
    toString() {
        return `rgba(${255*this.r}, ${255*this.g}, ${255*this.b}, ${this.a})`;
    }
    
    toRgbString() {
        return `rgb(${255*this.r}, ${255*this.g}, ${255*this.b})`;
    }
}

// RAY ////////////////////////////////////////////////////////////////////////
//Used for raycasting

class Ray {
	constructor(origin, dir) {
		this.origin = origin;
		this.dir = dir;
	}
	
	//https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	cast(meshes) {
    	var results = [];
    	
    	for (let mesh of meshes) {
    	    if (!(mesh instanceof Mesh)) continue;
    	    
    		for (let tri of mesh.faces) {
    			var a = tri.points[0].mul(mesh.scale).mulCf(mesh.cframe);
    			var b = tri.points[1].mul(mesh.scale).mulCf(mesh.cframe);
    			var c = tri.points[2].mul(mesh.scale).mulCf(mesh.cframe);
    			
    			var e1 = b.sub(a);
    			var e2 = c.sub(a);
    			var n = e1.cross(e2);
    			var det = -this.dir.dot(n);
    			var invdet = 1 / det;
    			
    			var ao = this.origin.sub(a);
    			var dao = ao.cross(this.dir);
    			
    			var u = e2.dot(dao) * invdet;
    			var v = -e1.dot(dao) * invdet;
    			var t = ao.dot(n) * invdet;
    			
    			//det >= 1e-6
    			if (det >= 1e-6 && t >= 0 && u >= 0 && v >= 0 && (u + v) <= 1) {
    				let normal = tri.normal;
    				
    				results.push({
    					distance: t,
    					normal: normal,
    					position: this.origin.add(this.dir.mul(t)),
    					face: tri,
    					object: mesh
    				});
    			}
    		}
    	}
    	
    	if (results.length === 0) return null;
    	
    	results.sort((a, b) =>
    		a.distance - b.distance
    	);
    	
    	return results;
    }
}

// RENDERER ///////////////////////////////////////////////////////////////////
//Renders 3D worlds

class Renderer {
    constructor(clip) {
        this.projFaces = [];
        this.renderClips = [];
        this.faceClip = clip;
        
        this.lightDir = new Vector3(1, -1, 1).getUnit();
    }
    
    mapClipToTri(clip, tri) {
        var xScale = project.width / 2;
        var yScale = project.height / 2;
        
        if (tri.type === "sprite") {
            clip.x = (tri.x + 1) * xScale;
            clip.y = (tri.y + 1) * yScale;
            clip.width = tri.width * xScale;
            clip.height = tri.height * yScale;
            return;
        }
        
        var path = clip.activeFrame._children[0].view.item;
        
        //color
        if (tri.color.a !== 1) console.log(tri.color.a);
        clip.opacity = tri.color.a;
        
        var rgb = tri.color.toRgbString();
        
        path.style.fillColor = rgb;
        path.style.strokeColor = rgb;
        var segments = path.segments; //get paper.js path segments
        
        if (tri !== undefined) {
            segments[0].point.x = tri.x0 * xScale;
            segments[0].point.y = tri.y0 * yScale;
            
            segments[1].point.x = tri.x1 * xScale;
            segments[1].point.y = tri.y1 * yScale;
            
            segments[2].point.x = tri.x2 * xScale;
            segments[2].point.y = tri.y2 * yScale;
            
            //since i can't make a three-vertexed shape in Wick,
            //i have to make a square and make its last point useless
            segments[3].point.x = tri.x2 * xScale;
            segments[3].point.y = tri.y2 * yScale;
        }
    }
    
    render(cam, scene) {
        while (this.projFaces.length > 0) //clear projected triangles
            this.projFaces.shift();
            
        var projTris = [];
        
        var matView = cam.cframe.inverse();
        
        for (let mesh of scene) {
            var meshCf = mesh.cframe;
            
            if (mesh instanceof Sprite) {
                let center = meshCf.position.mulCf(matView);
                
                if (center.z >= cam.near) {
                    //get bottom-left and top-right corners
                    //this is to calculate width/height
                    let p0 = center.add(new Vector3(-mesh.scale.x * mesh.scale.z, -mesh.scale.y * mesh.scale.z, 0));
                    let p1 = center.add(new Vector3(mesh.scale.x * mesh.scale.z, mesh.scale.y * mesh.scale.z, 0));
                    
                    //projection
                    p0 = p0.mulMat(cam.__projectionMat);
                    p1 = p1.mulMat(cam.__projectionMat);
                    center = center.mulMat(cam.__projectionMat);
                    
                    projTris.push({
                        isSprite: true,
                        x: center.x,
                        y: center.y,
                        z: center.z,
                        width: p1.x - p0.x,
                        height: p1.y - p0.y,
                        sprite: mesh
                    });
                }
            } else if (mesh instanceof Mesh) {
                for (let tri of mesh.faces) {
                    let p0 = tri.points[0].mul(mesh.scale).toVector4();
                    let p1 = tri.points[1].mul(mesh.scale).toVector4();
                    let p2 = tri.points[2].mul(mesh.scale).toVector4();
                    
                    //mesh translations
                    p0 = p0.mulCf(meshCf);
                    p1 = p1.mulCf(meshCf);
                    p2 = p2.mulCf(meshCf);
                    
                    //get luminance
                    let l1 = p1.sub(p0);
                    let l2 = p2.sub(p0);
                    let lum = l2.cross(l1).getUnit().dot(this.lightDir);
                    lum = (lum + 1) / 2;
                    let col = new Color4(tri.color.r * lum, tri.color.g * lum, tri.color.b * lum);
                    
                    //camera translations
                    p0 = p0.mulCf(matView);
                    p1 = p1.mulCf(matView);
                    p2 = p2.mulCf(matView);
                    
                    let newTri = new Face3(p0, p1, p2);
                    
                    let clipped = newTri.clipAgainstPlane(
                        new Vector3(0, 0, cam.near),
                        new Vector3(0, 0, 1)
                    );
                    
                    for (let i = 0; i < clipped.length; i++) {
                        p0 = clipped[i].points[0];
                        p1 = clipped[i].points[1];
                        p2 = clipped[i].points[2];
                        
                        //projection
                        p0 = p0.mulMat(cam.__projectionMat);
                        p1 = p1.mulMat(cam.__projectionMat);
                        p2 = p2.mulMat(cam.__projectionMat);
                        
                        p0 = p0.toVector3();
                        p1 = p1.toVector3();
                        p2 = p2.toVector3();
                        
                        //calculate relative normal
                        if (!mesh.doubleSided) {
                            let l1 = p1.sub(p0);
                            let l2 = p2.sub(p0);
                            let normal = l2.cross(l1).getUnit();
                            
                            if (normal.z <= 0) continue;
                        }
                        
                        let mid = (p0.add(p1).add(p2)).div(3);
                        
                        let outTri = new Face3(p0, p1, p2);
                        outTri.color = col;
                        
                        projTris.push(outTri);
                    }
                }
            }
        }
        
        //sort triangles
        projTris.sort(function(a, b) {
            var midA, midB;
            
            if (a instanceof Face3) {
                midA = a.points[0].add(a.points[1]).add(a.points[2]).div(3);
            } else {
                if (a.sprite.alwaysOnTop) midA = -1;
                else midA = a;
            }
            
            if (b instanceof Face3) {
                midB = b.points[0].add(b.points[1]).add(b.points[2]).div(3);
            } else {
                if (b.sprite.alwaysOnTop) midB = -1;
                else midB = b;
            }
            
            return midB.z - midA.z;
        });
        
        for (let tri of projTris) {
            if (tri instanceof Face3) {
                //clip triangles against all four screen edges
                let queue = [tri];
                let numNewTriangles = 1;
                
                for (let p = 0; p < 4; p++) {
                    //let trisToAdd = 0;
                    
                    //debugger;
                    
                    while (numNewTriangles > 0) {
                        let test = queue.pop();
                        numNewTriangles--;
                        
                        let planeP, planeN;
                        
                        switch(p) {
                            case 0: //top
                                planeP = new Vector3(0, -1, 0);
                                planeN = new Vector3(0, 1, 0);
                                break;
                            case 1: //bottom
                                planeP = new Vector3(0, 1, 0);
                                planeN = new Vector3(0, -1, 0);
                                break;
                            case 2: //left
                                planeP = new Vector3(-1, 0, 0);
                                planeN = new Vector3(1, 0, 0);
                                break;
                            case 3: //right
                                planeP = new Vector3(1, 0, 0);
                                planeN = new Vector3(-1, 0, 0);
                                break;
                        }
                        
                        let clipped = test.clipAgainstPlane(planeP, planeN);
                        
                        //debugging: change color of clipped triangles
                        if (DEBUG) {
                            if (clipped.length === 2) { //quad
                                clipped[0].color = new Color4(0.5, 0, 0);
                                clipped[1].color = new Color4(0, 0.5, 0);
                            } else if (clipped.length > 0 && clipped[0] !== test) { //tri
                                clipped[0].color = new Color4(0, 0, 0.5);
                            }
                        }
                        
                        for (let t of clipped) {
                            queue.unshift(t);
                        }
                    }
                    
                    numNewTriangles = queue.length;
                }
                
                for (let t of queue) {
                    this.projFaces.push({
                        type: "tri",
                        x0: t.points[0].x,
                        y0: -t.points[0].y,
                        x1: t.points[1].x,
                        y1: -t.points[1].y,
                        x2: t.points[2].x,
                        y2: -t.points[2].y,
                        color: t.color
                    });
                }
            } else if (tri.isSprite) {
                this.projFaces.push({
                    type: "sprite",
                    sprite: tri.sprite,
                    clip: tri.sprite.clip,
                    
                    x: tri.x,
                    y: -tri.y,
                    width: tri.width,
                    height: tri.height
                });
            }
        }
        
        for (let i = 0; i < this.projFaces.length; i++) {
            let vp = this.projFaces[i];
            let vr = this.renderClips[i];
            
            //add a new object to slot on conditions:
            
            if (vr === undefined || //no object at this slot
                vp.type !== vr.__pk3dtype || //types are mismatched
                (vp.type === "sprite" && vp.clip !== vr) //different sprite
            ) {
                let clone;
                
                if (vp.type === "tri") {
                    //add triangle
                    clone = this.faceClip.clone();
                    clone.__pk3dtype = "tri";
                    clone.x = this.faceClip.project.width / 2;
                    clone.y = this.faceClip.project.height / 2;
                } else if (vp.type === "sprite") {
                    vp.clip.__pk3dtype = "sprite";
                    clone = vp.clip;
                }
                
                //Replace current index with new item
                let prev = this.renderClips.splice(i, 1, clone)[0];
                
                if (prev !== undefined) {
                    if (prev.__pk3dtype === "tri") {
                        let idx = this.faceClip.clones.indexOf(prev);
                        if (idx >= 0) this.faceClip.clones.splice(idx, 1);
                        
                        prev.remove();
                    } else if (prev.__pk3dtype === "sprite") {
                        prev.scaleX = 0;
                        prev.scaleY = 0;
                    }
                }
            }
        }
        
        //Delete everything not included in projFaces list
        //At this point renderClips.length should be greater than or equal to
        //projFaces.length. Not lesser than.
        //This should keep both of their lengths equal
        
        if (this.renderClips.length - this.projFaces.length > 1) {
            //debugger;
        }
        
        let lengthOffset = this.renderClips.length - this.projFaces.length;
        for (let i = 0; i < lengthOffset; i++) {
            let obj = this.renderClips.pop();
            
            if (obj.__pk3dtype === "tri") {
                let idx = this.faceClip.clones.indexOf(obj);
                if (idx >= 0) this.faceClip.clones.splice(idx, 1);
                        
                obj.remove();
            } else if (obj.__pk3dtype === "sprite") {
                obj.scaleX = 0;
                obj.scaleY = 0;
            }
        }
        
        if (this.renderClips.length !== this.projFaces.length) {
            console.log("something has gone wrong");
            console.log("projFaces: " + this.projFaces.length + "   renderClips: " + this.renderClips.length);
        }
        
        //Z-ordering:
        //Do this by removing all the clones from the frame
        //Then add them back in, in the correct order
        
        var parentFrame = this.faceClip.parentFrame;
        
        for (let i = 0; i < this.renderClips.length; i++) {
            let clone = this.renderClips[i];
            
            let idx = parentFrame._children.indexOf(clone);
            parentFrame._children.splice(idx, 1);
        }
        
        for (let i = 0; i < this.projFaces.length; i++) {
            //console.log(this.clones[i]);
            this.mapClipToTri( this.renderClips[i], this.projFaces[i] );
            parentFrame._children.push(this.renderClips[i]);
        }
    }
}

// HELPER FUNCTIONS ///////////////////////////////////////////////////////////

function createMeshFromAsset(meshFile, mtlFile) {
    var mtls;
    
    if (mtlFile !== undefined) {
        var mtlFileDat = atob(mtlFile.src.slice(37)).split("\n");
        
        mtls = {};
        var currentDiffuse = new Color4(1, 1, 1);
        var currentName;
        
        for (let i = 0; i < mtlFileDat.length; i++) {
            let line = mtlFileDat[i].split(" ");
            
            if (line[0] === "#") continue; //skip comments
            
            if (line[0] === "newmtl") {
                if (currentName !== undefined) {
                    mtls[currentName] = currentDiffuse;
                }
                
                currentName = line[1];
                currentDiffuse = new Color4(1, 1, 1);
            }
            
            if (line[0] === "Kd") {
                currentDiffuse = new Color4(+line[1], +line[2], +line[3], 1);
            }
        }
        
        if (currentName !== undefined) mtls[currentName] = currentDiffuse;
        
        console.log(mtls);
    }
    ////
    var meshFileDat = atob(meshFile.src.slice(37)).split("\n");
    
    var vertices = [];
    var faces = [];
    
    var faceColor = new Color4(1, 1, 1);
    
    for (let i = 0; i < meshFileDat.length; i++) {
        let line = meshFileDat[i].split(" ");
        
        if (line[0] === "#") continue; //skip comments
        
        if (line[0] === "v") {
            vertices.push(new Vector3(
                +line[1], +line[2], +line[3]
            ));
        }
        
        if (line[0] === "usemtl") {
            if (mtls) {
                faceColor = mtls[line[1]];
            }
        }
        
        if (line[0] === "f") {
            let vtx = {};
            
            for (let i = 0; i < 3; i++) {
                let item = line[i + 1].split("/");
                vtx[i] = item[0] - 1;
            }
            
            let face = new Face3(
               vertices[vtx[0]],
               vertices[vtx[1]],
               vertices[vtx[2]]
            );
            
            face.color = faceColor.clone();
            
            faces.push(face);
        }
    }
    
    var mesh = new Mesh();
    mesh.faces = faces;
    
    return mesh;
}

window.pk3d = {
    Mesh: Mesh,
    Renderer: Renderer,
    Matrix4: Matrix4,
    Camera: Camera,
    Face3: Face3,
    Vector3: Vector3,
    Vector4: Vector4,
    Object3D: Object3D,
    Color4: Color4,
    CFrame: CFrame,
    Ray: Ray,
    Sprite: Sprite,
    
    createMeshFromAsset: createMeshFromAsset
};
