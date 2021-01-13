/*
    pkplat platformer engine
    by pumpkinhead
    
    table of contents:
    1.      declaration of pkplat
    2.      functions
    3.      pkplat.Event class
    4.      pkplat.Controller class
    5.      pkplat.SpecialPlatformController class
    6.      pkplat.MovingPlatformController class
    7.      pkplat.ActorController class
    8.      pkplat.PlayerController class
*/

///////////////////////////////////////////////////////////////////////////////
//DECLARATION//////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

window.pkplat = {};
pkplat.gravity = -0.5;
pkplat.level = [];
pkplat.bodies = [];

///////////////////////////////////////////////////////////////////////////////
//FUNCTIONS////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

pkplat.parseObj = function(obj) {
    var bounds, x, y;
    
    if (obj instanceof Wick.Clip) {
        bounds = {
            left: obj.x - obj.width / 2,
            right: obj.x + obj.width / 2,
            bottom: obj.y + obj.height / 2,
            top: obj.y - obj.height / 2
        };
        x = obj.parentClip.x;
        y = obj.parentClip.y;
    } else {
        bounds = obj.bounds;
        x = obj.parentClip.x;
        y = obj.parentClip.y;
    }
        
    return {
        left: bounds.left + x,
        right: bounds.right + x,
        top: bounds.top + y,
        bottom: bounds.bottom + y,
        gate: obj.gate,
        xv: obj.xv || 0,
        yv: obj.yv || 0,
        obj: obj
    };
}

pkplat.updateBlockInLevel = function(obj) {
    for (let i in pkplat.level) {
        let v = pkplat.level[i];
        
        if (v.obj == obj) {
            pkplat.level[i] = pkplat.parseObj(obj);
            
            return true;
        }
    }
    
    return false;
};

pkplat.setLevel = function(clip) {
    //console.log(clip.activeFrame._children);
    //pkplat.level = clip.activeFrame._children;
    pkplat.level = [];
    
    if (clip instanceof Wick.Frame) {
        for (let path of clip._children) {
            pkplat.level.push(pkplat.parseObj(path));
        }
    } else {
        for (let path of clip.activeFrame._children) {
            pkplat.level.push(pkplat.parseObj(path));
        }
    }
};

pkplat.addActor = function(actor) {
    if (!(actor instanceof Wick.Clip)) throw new Error("Actor must be a Wick Clip");
    
    pkplat.bodies.push(actor);
};

pkplat.removeActor = function(actor) {
    var i = pkplat.bodies.indexOf(actor);
    
    if (i >= 0) {
        pkplat.bodies.splice(i, 1);
        return true;
    }
    
    return false;
};

///////////////////////////////////////////////////////////////////////////////
//EVENT CLASS///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

pkplat.Event = class {
    constructor(name, obj) {
        this.target = null;
        this.name = name;
        this.functions = [];
        
        if (obj !== undefined) {
            this.attachToObj(obj);
        }
    }
    
    connect(f) {
        this.functions.push(f);
    }
    
    disconnect(f) {
        var i = this.functions.indexOf(f);
        
        if (i >= 0) this.functions.splice(i, 1);
    }
    
    dispatch(args) {
        for (let f of this.functions) {
            f.apply(this.target, args);
        }
    }
    
    attachToObj(obj) {
        if (obj !== undefined) this.detachFromObj(obj);
        
        this.target = obj;
        
        obj.__events[this.name] = this;
    }
    
    detachFromObj(obj) {
        if (this.name in obj.__events) {
            obj.__events[this.name] = undefined;
        }
    }
};

///////////////////////////////////////////////////////////////////////////////
//CONTROLLER CLASS//////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

pkplat.Controller = class {
    constructor(clip) {
        if (clip === null || clip === undefined || !(clip instanceof Wick.Clip)) throw new Error("Controller must be attached to a clip");
        
        this.clip = clip;
        
        clip.controller = this;
        clip.xv = 0;
        clip.yv = 0;
        clip.mass = 1;
        
        this.__events = {};
    }
    
    getEventFromName(evName) {
        var ev = this.__events[evName];
        if (ev === undefined) throw new Error("Event does not exist");
        
        return ev;
    }
    
    addEventListener(evName, f) {
        this.getEventFromName(evName).connect(f);
    }
    
    removeEventListener(evName, f) {
        this.getEventFromName(evName).disconnect(f);
    }
    
    dispatchEvent(evName, ...args) {
        this.getEventFromName(evName).dispatch(args);
    }
    
    remove() {
        pkplat.removeActor(this.clip);
        
        this.clip.controller = undefined;
        this.clip = null;
    }
    
    ////////////////////
    //BODY X COLLISION//
    ////////////////////
    
    xCollision(f) {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        var right = clip.x + clip.width / 2;
        var left = clip.x - clip.width / 2;
        var top = clip.y - clip.height / 2;
        var bottom = clip.y + clip.height / 2;
        
        for (let rect of pkplat.level) { //Static
            if (right > rect.left &&
                left < rect.right &&
                bottom > rect.top &&
                top < rect.bottom
            ) { //If intersecting
                let dir;
                
                if (clip.x > (rect.left + rect.right) / 2) { //If on right side
                    clip.x = rect.right + clip.width / 2;
                    dir = "right";
                    
                    clip.xv = 0;
                } else { //If on left side
                    clip.x = rect.left - clip.width / 2;
                    dir = "left";
                    
                    clip.xv = 0;
                }
                
                
                if (f !== undefined) f.call(this, dir, "static", rect);
                //clip.y += rect.yv;
            }
        }
        
        for (let actor of pkplat.bodies) { //Dynamic
            if (actor == clip) continue;
            
            if (
                right > actor.x - actor.width / 2 &&
                left < actor.x + actor.width / 2 &&
                bottom > actor.y - actor.height / 2 &&
                top < actor.y + actor.height / 2
            ) { //If intersecting
                let dir;
                /*
                var vel = (clip.mass * clip.xv) / actor.mass;
                actor.xv += vel / 2;
                //actor.controller.xCollision();*/
                
                if (clip.x > actor.x) { //On right side
                    //clip.x = actor.x + actor.width / 2 + clip.width / 2;
                    dir = "right";
                } else { //On left side
                    //actor.x += actor.xv;
                    //clip.x = actor.x - actor.width / 2 - clip.width / 2;
                    //actor.x = clip.x + clip.width / 2 + actor.width / 2;
                    dir = "left";
                }
                
                //Moving special platforms
                if (actor.controller instanceof pkplat.MovingPlatformController) {
                    if (actor.collidable) {
                        if (dir === "left") {
                            clip.x = actor.x - actor.width / 2 - clip.width / 2;
                            
                            if (actor.controller.dx >= 0) actor.controller.dispatchEvent("actortouched", "right", clip);
                        } else if (dir === "right") {
                            clip.x = actor.x + actor.width / 2 + clip.width / 2;
                            
                            if (actor.controller.dx <= 0) actor.controller.dispatchEvent("actortouched", "left", clip);
                        }
                        
                        clip.xv = 0;
                    }
                } else
                //Immobile special platforms
                if (actor.controller instanceof pkplat.SpecialPlatformController) {
                    if (actor.collidable) clip.xv = 0;
                    
                    if (dir === "left") {
                        if (actor.collidable) clip.x = actor.x - actor.width / 2 - clip.width / 2;
                        
                        actor.controller.dispatchEvent("actortouched", "right", clip);
                    } else if (dir === "right") {
                        if (actor.collidable) clip.x = actor.x + actor.width / 2 + clip.width / 2;
                        
                        actor.controller.dispatchEvent("actortouched", "right", clip);
                    }
                }
                
                if (f !== undefined) f.call(this, dir, "actor", actor);
            }
        }
    }
    
    ////////////////////
    //BODY Y COLLISION//
    ////////////////////
    
    yCollision(f) {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        var right = clip.x + clip.width / 2;
        var left = clip.x - clip.width / 2;
        var top = clip.y - clip.height / 2;
        var bottom = clip.y + clip.height / 2;
        
        clip.ground = null;
        
        for (let rect of pkplat.level) { //Static
            if (right > rect.left &&
                left < rect.right &&
                bottom > rect.top &&
                top < rect.bottom
            ) { //If intersecting
                let dir;
                
                //console.log(rect.yv);
                if (clip.y > (rect.top + rect.bottom) / 2) { //If on bottom side
                    clip.y = rect.bottom + clip.width / 2;
                    dir = "bottom";
                    
                    clip.yv = rect.yv;
                } else { //If on top side
                    clip.y = rect.top - clip.width / 2;
                    dir = "top";
                    
                    clip.yv = rect.yv;
                }
                if (clip.ground === null) clip.ground = rect;
                
                if (f !== undefined) f.call(this, dir, "static", rect);
            }
        }
        
        for (let actor of pkplat.bodies) { //Dynamic
            if (actor == clip) continue;
            
            if (
                right > actor.x - actor.width / 2 &&
                left < actor.x + actor.width / 2 &&
                bottom > actor.y - actor.height / 2 &&
                top < actor.y + actor.height / 2
            ) { //If intersecting
                let dir;
                
                /*var vel = (clip.mass * clip.yv) / actor.mass;
                actor.yv += vel / 2;
                clip.yv = 0;
                clip.xv = actor.xv;
                //actor.controller.yCollision();
                //actor.y += clip.yv;*/
                
                if (clip.y > actor.y) { //On bottom side
                    //actor.yv += (top - (actor.y - actor.height / 2));
                    //clip.y = actor.y + actor.height / 2 + clip.height / 2;
                    dir = "bottom";
                } else { //On top side
                    //actor.yv += (bottom - (actor.y - actor.height / 2));
                    //clip.y = actor.y - actor.height / 2 - clip.height / 2;
                    dir = "top";
                }
                
                //Moving platforms
                if (actor.controller instanceof pkplat.MovingPlatformController) {
                    if (actor.collidable) {
                        if (dir === "top") {
                            clip.y = actor.y - actor.height / 2 - clip.height / 2;
                        } else if (dir === "bottom") {
                            clip.y = actor.y + actor.height / 2 + clip.height / 2;
                        }
                        
                        clip.yv = actor.controller.dy > 0 ? actor.controller.dy : 0;
                        clip.x += actor.controller.dx;
                        
                        if (actor.controller.dy === 0) {
                            if (dir === "top") {
                                actor.controller.dispatchEvent("actortouched", "bottom", clip);
                            } else if (dir === "bottom") {
                                actor.controller.dispatchEvent("actortouched", "top", clip);
                            }
                        }
                    }
                    
                //Immobile special platforms
                } else if (actor.controller instanceof pkplat.SpecialPlatformController) {
                    if (actor.collidable) clip.yv = 0;
                    
                    if (dir === "top") {
                        if (actor.collidable) clip.y = actor.y - actor.height / 2 - clip.height / 2;
                        
                        actor.controller.dispatchEvent("actortouched", "bottom", clip);
                    } else if (dir === "bottom") {
                        if (actor.collidable) clip.y = actor.y + actor.height / 2 + clip.height / 2;
                        
                        actor.controller.dispatchEvent("actortouched", "top", clip);
                    }
                }
                
                if (f !== undefined) f.call(this, dir, "actor", actor);
            }
        }
    }
    
    update() {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
    }
};

///////////////////////////////////////////////////////////////////////////////
//SPECIAL PLATFORM CONTROLLER CLASS////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

pkplat.SpecialPlatformController = class extends pkplat.Controller {
    constructor(clip) {
        super(clip);
        
        clip.collidable = true;
        
        //create events
        new pkplat.Event("actortouched", this);
    }
    
    xCollision() {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        var right = clip.x + clip.width / 2;
        var left = clip.x - clip.width / 2;
        var top = clip.y - clip.height / 2;
        var bottom = clip.y + clip.height / 2;
        
        for (let actor of pkplat.bodies) { //Dynamic
            if (actor == clip) continue;
            
            if (
                right > actor.x - actor.width / 2 &&
                left < actor.x + actor.width / 2 &&
                bottom > actor.y - actor.height / 2 &&
                top < actor.y + actor.height / 2
            ) { //If intersecting
                let dir;
                
                if (actor.x > clip.x) { //On right side
                    dir = "right";
                } else { //On left side
                    dir = "left";
                }
                
                this.dispatchEvent("actortouched", dir, actor);
            }
        }
    }
    
    yCollision() {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        var right = clip.x + clip.width / 2;
        var left = clip.x - clip.width / 2;
        var top = clip.y - clip.height / 2;
        var bottom = clip.y + clip.height / 2;
        
        for (let actor of pkplat.bodies) { //Dynamic
            if (actor == clip) continue;
            
            if (
                right > actor.x - actor.width / 2 &&
                left < actor.x + actor.width / 2 &&
                bottom > actor.y - actor.height / 2 &&
                top < actor.y + actor.height / 2
            ) { //If intersecting
                let dir;
                
                if (actor.y > clip.y) { //On bottom side
                    dir = "bottom";
                } else { //On top side
                    dir = "top";
                }
                
                this.dispatchEvent("actortouched", dir, actor);
            }
        }
    }
};

///////////////////////////////////////////////////////////////////////////////
//MOVING PLATFORM CONTROLLER CLASS//////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

pkplat.MovingPlatformController = class extends pkplat.SpecialPlatformController {
    constructor(clip) {
        super(clip);
        
        this.dx = 0;
        this.dy = 0;
        
        //create events
        new pkplat.Event("blocktouched", this);
    }
    
    xCollision() {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        var right = clip.x + clip.width / 2;
        var left = clip.x - clip.width / 2;
        var top = clip.y - clip.height / 2;
        var bottom = clip.y + clip.height / 2;
        
        for (let rect of pkplat.level) { //Static
            if (right > rect.left &&
                left < rect.right &&
                bottom > rect.top &&
                top < rect.bottom
            ) { //If intersecting
                let dir;
                
                if (clip.x > (rect.left + rect.right) / 2) { //If on right side
                    dir = "right";
                } else { //If on left side
                    dir = "left";
                }
                
                this.dispatchEvent("blocktouched", dir, rect);
                //clip.y += rect.yv;
            }
        }
        
        for (let actor of pkplat.bodies) { //Dynamic
            if (actor == clip) continue;
            
            if (
                right > actor.x - actor.width / 2 &&
                left < actor.x + actor.width / 2 &&
                bottom > actor.y - actor.height / 2 &&
                top < actor.y + actor.height / 2
            ) { //If intersecting
                let dir;
                
                if (actor.x > clip.x) { //On right side
                    dir = "right";
                } else { //On left side
                    dir = "left";
                }
                
                if (dir === "left") {
                    actor.x = clip.x - clip.width / 2 - actor.width / 2;
                } else if (dir === "right") {
                    actor.x = clip.x + clip.width / 2 + actor.width / 2;
                }
                
                this.dispatchEvent("actortouched", dir, actor);
                clip.xv = this.dx;
            }
        }
    }
    
    yCollision() {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        var right = clip.x + clip.width / 2;
        var left = clip.x - clip.width / 2;
        var top = clip.y - clip.height / 2;
        var bottom = clip.y + clip.height / 2;
        
        for (let rect of pkplat.level) { //Static
            if (right > rect.left &&
                left < rect.right &&
                bottom > rect.top &&
                top < rect.bottom
            ) { //If intersecting
                let dir;
                
                //console.log(rect.yv);
                if (clip.y > (rect.top + rect.bottom) / 2) { //If on bottom side
                    dir = "bottom";
                } else { //If on top side
                    dir = "top";
                }
                
                this.dispatchEvent("blocktouched", dir, rect);
            }
        }
        
        for (let actor of pkplat.bodies) { //Dynamic
            if (actor == clip) continue;
            
            if (
                right > actor.x - actor.width / 2 &&
                left < actor.x + actor.width / 2 &&
                bottom > actor.y - actor.height / 2 &&
                top < actor.y + actor.height / 2
            ) { //If intersecting
                let dir;
                
                if (actor.y > clip.y) { //On bottom side
                    dir = "bottom";
                } else { //On top side
                    dir = "top";
                }
                
                if (dir === "top") {
                    actor.y = clip.y - clip.height / 2 - actor.height / 2;
                } else if (dir === "bottom") {
                    actor.y = clip.y + clip.height / 2 + actor.height / 2;
                }
                
                this.dispatchEvent("actortouched", dir, actor);
                
                //actor.y += dy;
                //actor.yv = this.dy;
                actor.x += this.dx;
            }
        }
    }
    
    move(dx, dy) {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        dx = dx || 0;
        dy = dy || 0;
        this.dx = dx;
        this.dy = dy;
        
        var clip = this.clip;
        
        clip.x += dx;
        
        this.xCollision(); //X collision
        
        clip.y += dy;
        
        this.yCollision(); //Y collision
    }
    
    goTo(x, y) {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        x = x || 0;
        y = y || 0;
        
        var clip = this.clip;
        var lastX = clip.x;
        var lastY = clip.y;
        
        this.dx = x - lastX;
        this.dy = y - lastY;
        
        clip.x = x;
        this.xCollision();
        clip.y = y;
        this.yCollision();
    }
};

///////////////////////////////////////////////////////////////////////////////
//ACTOR CONTROLLER//////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

pkplat.ActorController = class extends pkplat.Controller {
    constructor(clip, maxHp) {
        super(clip);
        
        clip.friction = 0.8;
        clip.speed = 1;
        clip.jumpPower = 10;
        
        clip.moveDir = 0;
        clip.jumping = false;
        clip.noAccel = false;
        clip.ground = null;
        
        //HP
        clip.maxHp = maxHp || 100;
        this.__hp = clip.maxHp;
        
        Object.defineProperty(clip, "hp", {
            configurable: true,
            get() {
                return this.controller.__hp;
            },
            set(v) {
                if (typeof(v) !== "number") throw new Error("Health can only be a number");
                
                if (v > this.maxHp) v = this.maxHp;
                if (v < 0) v = 0;
                
                var lastHp = this.controller.__hp;
                this.controller.__hp = v;
                
                this.controller.dispatchEvent("healthchanged", v, lastHp);
            }
        });
        
        //create events
        new pkplat.Event("blocktouched", this);
        new pkplat.Event("actortouched", this);
        new pkplat.Event("jumped", this);
        new pkplat.Event("healthchanged", this);
        
        //this.addEventListener("blocktouched", function(side) {
            //console.log(side);
        //});
    }
    
    update() {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        
        //X movement
        
        if (!clip.noAccel) {
            if (clip.moveDir > 0) {
                clip.xv += clip.speed;
            } else if (clip.moveDir < 0) {
                clip.xv -= clip.speed;
            }/* else if (clip.xv !== 0) { //accelerate backwards
                /*var dir = Math.sign(clip.xv);
                clip.xv -= clip.acceleration * dir;
                
                if (Math.sign(clip.xv) != dir) { //changed direction
                    clip.xv = 0;
                }
            }*/
            
            clip.xv *= clip.friction;
        }
        
        //if (clip.xv < -clip.maxSpeed) clip.xv = -clip.maxSpeed;
        //if (clip.xv > clip.maxSpeed) clip.xv = clip.maxSpeed;
        
        clip.x += clip.xv;
        
        if (clip.ground !== null) {
            clip.x += clip.ground.xv;
            //clip.xv += clip.ground.xv;
        }
        
        this.xCollision(function(side, type, body) {
            if (type === "static") {
                this.dispatchEvent("blocktouched", side, body);
            } else if (type === "actor") {
                this.dispatchEvent("actortouched", side, body);
            }
        }); //X collision
        
        clip.yv -= pkplat.gravity;
        
        clip.y += clip.yv;
        
        this.yCollision(function(side, type, body) {
            console.log(side);
            
            if (side == "top" && (type == "static" || (body.controller instanceof pkplat.SpecialPlatformController && body.collidable))) {
                if (clip.jumping) clip.yv = -clip.jumpPower;
            }
                
            if (type === "static") {
                this.dispatchEvent("blocktouched", side, body);
            } else {
                this.dispatchEvent("actortouched", side, body);
            }
        }); ///Y collision and jumping
    }
};

///////////////////////////////////////////////////////////////////////////////
//PLAYER CONTROLLER/////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

pkplat.PlayerController = class extends pkplat.ActorController {
    constructor(clip) {
        super(clip);
        
        this.wallJumping = false;
        this.rightKey = "right";
        this.leftKey = "left";
        this.upKey = "up";
        this.downKey = "down";
        
        //walljumping
        this.addEventListener("blocktouched", function(side) {
            if (this.wallJumping && (side == "left" || side == "right")) {
                clip.yv = -clip.jumpPower / 2;
                clip.xv = (side == "right" ? 1 : -1) * 30;
            }
        });
    }
    
    update() {
        if (this.clip === null) {
            console.warn("No clip is attached");
            return;
        }
        
        var clip = this.clip;
        
        if (isKeyDown(this.rightKey)) {
            clip.moveDir = 1;
        } else if (isKeyDown(this.leftKey)) {
            clip.moveDir = -1;
        } else {
            clip.moveDir = 0;
        }
        
        clip.jumping = isKeyDown(this.upKey);
        
        super.update();
    }
};
