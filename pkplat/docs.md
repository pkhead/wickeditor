### Documentation

### Namespace functions
*void* pkplat.setLevel(*Wick.Clip*/*Wick.Frame* clip)
- Sets the level data to the rectangles contained within *clip*.

*void* pkplat.addActor(*Wick.Clip* actor)
- Adds the actor into the world for collision detection

*void* pkplat.removeActor(*Wick.Clip* clip)
- Removes the actor from the world

### pkplat.Controller class
new pkplat.Controller(*Wick.Clip* clip)
- Creates a new controller assigned to *clip*.

*Wick.Clip* clip
- The clip the Controller was assigned to

*void* addEventListener(*String* evName, *Function* f)
*void* removeEventListener(*String* evName, *Function* f)
*void* remove()
*void* update()

### pkplat.SpecialPlatformController class
new pkplat.SpecialPlatformController(*Wick.Clip* clip)

*Boolean* collidable
*Event* actortouched

**Inherited from pkplat.Controller:**
*Wick.Clip* clip
- The clip the Controller was assigned to

*void* addEventListener(*String* evName, *Function* f)
*void* removeEventListener(*String* evName, *Function* f)
*void* remove()
*void* update()

### pkplat.MovingPlatformController class
new pkplat.MovingPlatformController(*Wick.Clip* clip)
*Number* dx
*Number* dy
*void* move(*Number* dx, *Number* dy)
*void* goTo(*Number* x, *Number* y)

**Inherited from pkplat.SpecialPlatformController:**
*Boolean* collidable
*Event* actortouched

**Inherited from pkplat.Controller:**
*Wick.Clip* clip
- The clip the Controller was assigned to

*void* addEventListener(*String* evName, *Function* f)
*void* removeEventListener(*String* evName, *Function* f)
*void* remove()
*void* update()

### pkplat.ActorController class
new pkplat.ActorController(*Wick.Clip* clip)
*Number* friction
*Number* speed
*Number* jumpPower
*Number* moveDir
*Boolean* jumping
*Boolean* noAccel
*Boolean* ground

*Event* blocktouched
*Event* actortouched
*Event* jumped

*void* update()

**Inherited from pkplat.Controller:**
*Wick.Clip* clip
- The clip the Controller was assigned to

*void* addEventListener(*String* evName, *Function* f)
*void* removeEventListener(*String* evName, *Function* f)
*void* remove()

### pkplat.PlayerController class
new pkplat.PlayerController(*Wick.Clip* clip)

*Boolean* wallJumping
*String* rightKey
*String* leftKey
*String* upKey
*String* downKey

*void* update()

**Inherited from pkplat.ActorController:**
*Number* friction
- Defaults to 0.8
*Number* speed
- Defaults to 1
*Number* jumpPower
- Defaults to 10
*Number* moveDir
*Boolean* jumping
*Boolean* noAccel
*Boolean* ground

*Event* blocktouched
*Event* actortouched
*Event* jumped

**Inherited from pkplat.Controller:**
*Wick.Clip* clip
- The clip the Controller was assigned to

*void* addEventListener(*String* evName, *Function* f)
*void* removeEventListener(*String* evName, *Function* f)
*void* remove()

### pkplat.ActorController

### Tutorial
You need to import the pkhead_plat frame in your project. Make sure that it runs first. To do that, put that on the first frame and on the highest layer.

#### How to make a level
You can start by drawing rectangles to make level blocks. When you are finished, write this code down somewhere:

```
pkplat.setLevel([your level object]);
```

`[your level object]` can be a clip or a frame. Now, the platformer engine will register the rectangles inside that object as level data.

#### How to make a player
To create a player, first you need to make a clip. Then put this code in the default script:

```
new pkplat.PlayerController(this);
pkplat.addActor(this);
```

This will attach a PlayerController to your clip (actor), and then adds the actor to the world, so other actors can interact with it. It will also define a controller variable in your actor so that the actor’s scripts can access the controller.

In your update script of the player actor, write this:

```
this.controller.update();
```

This will update the controller and allow the player to be moved.

#### How to make NPCs
Make a clip, then put this in the default script:

```
new pkplat.ActorController(this);
pkplat.addActor(this);
```

Then in the update script, write this:

```
this.controller.update();
```

This code is very similiar to the code you use to make players. That is because player controllers use modified ActorControllers, so that you can control it using the keyboard.

To make your NPC move to the right, write this:

```
this.moveDir = 1;
```

If you want to make it move left instead, write this:

```
this.moveDir = -1;
```

These will make the NPC move in the same direction until the value is changed.

If you want to make the NPC jump, write this:

```
this.jumping = true;
```

This will make the NPC keep wanting to jumping until it is set to false.

If you want the NPC to turn direction when it touches a wall, write this in the default script:

```
this.controller.addEventListener("blocktouched", function(side) {
  if (side == "left" || side == "right") {
    this.clip.moveDir = -this.clip.moveDir;
  }
});
```

This will add an event listener that will call the function everytime the NPC touches a wall. It works similarly to the Wick Editor `onEvent` function. When an NPC touches the wall, it checks if it touched the left or right side of a wall. If it does, it flips its direction.

IMPORTANT: The `this` value is not the actor in event functions. It is the actor’s controller. `this.clip` is a reference to the actor that is being controlled.

#### How to make moving platforms
Moving platforms are actors, like player or NPCs. To make one, first make a clip. Then put this in the default script:

```
new pkplat.MovingPlatformController(this);
pkplat.addActor(this);
```

To make the platform move, you can write this:

```
this.controller.move(x, y);
```

To make the platform go to a certain point on screen, you can write this:

```
this.controller.goTo(x, y);
```

If you want to make a moving platform that goes left-to-right, and bounces off blocks, do this:

In the default script:

```
this.moveDir = 3;

this.controller.addEventListener("blocktouched", function(side) {
  this.moveDir = -this.moveDir;
});
```

In the update script:

```
this.controller.move(this.moveDir, 0);
```

This will create a new property in the actor named “moveDir,” which contains the speed and direction. When it touches a block, it will flip that direction.

#### How to make a bouncy block
To do this, you will use a SpecialPlatformController. Put this in the default script of your desired actor:

```
new pkplat.SpecialPlatformController(this);
pkplat.addActor(this);

this.controller.addEventListener("actortouched", function(side, actor) {
  if (side == "top") {
    actor.yv = -10;
  }
});
```

#### How to make a push field
By push field, I mean a thing that pushes you up when you are inside it. Make a SpecialPlatformController, and put this code:

```
this.collidable = false;

this.controller.addEventListener("actortouched", function(side, actor) {
  actor.yv -= 0.5;
});
```

This will make it so players can go inside the platform. It will also make it so players that are touching the platform will be gravitated upwards.

#### Removing actors
If you want to remove an actor, you need to remove the clip along with its controller.

```
clip.remove();
controller.remove();
```

Note: If you remove the controller, it will remove the reference to the clip ( `controller.clip` ). So if you write something like this:

```
controller.remove();
controller.clip.remove();
```

it will not work. You need to swap the two lines.

**If there is something wrong with this tutorial please tell me**
