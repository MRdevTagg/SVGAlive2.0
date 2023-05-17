
# SVGAlive Developers Guide (it's still in proggress)

## Animated Class

### Constructor

The constructor function initializes several properties of the Animated instance:

`name`: A string containing the name of the animation instance (initialized to undefined)

`object`: The Object element that will contain the svg source as data

`parent`: The parent SVG element containing all the frames

`trigger`: An array of DOM elements that will trigger the animation

`loop`: A boolean indicating whether the animation should loop

`toggleOn`: A boolean indicating whether the animation should toggle

`playmode`: The play mode of the animation, which can be "ff" (forward) or "rew" (reverse)

`loopMode`: The loop mode of the animation, which can be "ff" (forward), "rew" (reverse), or "pingpong"

`frames`: An array containing all the frames of the animation

`fps`: The frames per second of the animation

`min`: The minimum frame number of the animation

`max`: The maximum frame number of the animation

`isPlaying`: A boolean indicating whether the animation is currently playing

`direction`: A number indicating the direction of the animation (1 for forward, -1 for reverse)

`current`: The current frame number of the animation

`previous`: The previous frame number of the animation

`skip`: A boolean indicating whether to skip the current frame

`condition`: A function that returns true if certain condition met

`reachStart`: A function that returns true if the current frame number is greater than or equal to the minimum frame number

`reachEnd`: A function that returns true if the current frame number is less than or equal to the maximum frame number

`reachPoint`: A function that takes a frame number as an argument and returns true if the current frame number is equal to the given frame number

`firstPlay`: A boolean indicating whether this is the first time the animation is played

`frameID`: The ID of the current timestamp from raF

`lastFrameTime`: The time when the last frame was played
Functions
The constructor function also calls the declare function with this as an argument, which adds the Animated instance to the instances object. The declare function creates a unique name for the animation instance and assigns it to the name property of the instance. The declare function is defined outside of the Animated clas

## Internal Methods

### SVGAliveError(object)

Generates an error message for an object that is already declared in an existing `Animated` instance.

#### Parameters

- `object`: The DOM object that caused the error.

#### Returns

A formatted error message string.

### evaluate(obj, options)

Evaluates whether the given object already exists in an `Animated` instance. If it does, logs an error; otherwise, creates a new `Animated` instance.

#### Parameters

- `obj`: The DOM object to evaluate.
- `options`: The options to pass to the `Animated` constructor.

#### Returns

A new `Animated` instance, or logs an error if the object already exists.

### getValidName(animation)

Generates a valid name for the animation based on its `data` attribute, ensuring it is unique among existing instances.

#### Parameters

- `animation`: The `Animated` instance for which to generate a name.

#### Returns

A unique, valid name string.

### declare(animation)

Declares the animation by adding it to the `instances` object with a unique name.

#### Parameters

- `animation`: The `Animated` instance to declare.

## Exported methods
