
# How to Use SVGAlive

SVGAlive is a software and Animation library designed to create javascript-based animated and interactive single-file SVGs in a simple and code-less way.

## The App (SVGAlive.exe)

- It creates a single SVG from a given SVG sequence files.
- You don't need to worry about ID conflicts within the frames because SVGAlive resolves them internally during the compilation process.
- Also, the sizes will be fixed.

**Convert Multiple SVGs into a Single Animated and Interactive SVG:**

1. Put the resources you will use as frames inside the "/src" folder. You can create a sub-folder for each animation.
2. If you have multiple animations, you can make a subdirectory inside the "/src" folder for each animation's frames.
3. Run the SVGAlive.exe file.
4. The first prompt will ask you to put the name of the sub-folder where you put the resources. If you leave it blank, it will be assumed that you have the frame resources in the "src" folder. Put the name or leave it blank (depending on your case) and hit enter.
5. The second prompt will ask you to give a name to the final SVG compiled file (this is optional). Choose a name (or not) and hit enter again.
6. The final prompt will ask you to give a name to the destination sub-folder in case you want to create one. Put the name or leave it blank and hit enter.
7. When finished, you will be prompted to close. If you hit enter, you will start a new operation. Otherwise, type 'y' and then enter or just close the window.

**IMPORTANT!!**: Do not close the app until you get the COMPLETED message.

Now your file will be fixed and compiled in the /SVGAlive/sources directory.

*NOTE*: The final svg file must be passed as data to an object tag, and If you’re previewing the page using a code Injection tool (like liveserver), it will render a parsererror within the object 'cause liveserver injects code inside the svg (but it will only affects when previewing the page, not on deployment), to solve this you can use fiveServer extension or a no-code-injection like http-server or similar to preview the page.
Using vite or React you don’t have any issues of this type.

## HOW TO IMPLEMENT

**To use it with Javascript and HTML:**

1. Copy the entire "SVGAlive" folder into your root directory. (you can choose which animations you want to keep inside the 'sources' folder)
2. You can eliminate the .jsx component (from the copied folder of course)
3. In your HTML, the SVG must be embedded into an object element passing its URL into the data attribute, for example:

```html
<object data="./SVGAlive/sources/your-folder-path(if there is one)/your-svg-name.svg" type="image/svg+xml"></object>
```

**To customize the animation behavior:**

1. - Give an id to the object that holds the svg like this, also it could be a class
(this is not mandatory but i recomend to do so, as it is going to make you easier to create the `Animated` instance):

```html
    <object id="your-anim-id" data="../SVGAlive/your-animation-name.svg" type="image/svg+xml"></object>
```

## **NOTES:**

- ***not-same-instance:*** - If you point to a &lt;object&gt; that's alredy referenced into an existing Animated instance, to avoid confusions, the instance will not be created and an Error will be shown in the console with the details
- ***names:*** - The name for the Animated instance will be taken from the svg file
- ***prefix:*** - If you create many Animated instances with the same svg source, the name will be incremented with the
  following prefix 'your-svg-name, your-svg-name_1, your-svg-name_2, ...', corresponding to the order you created them.
- ***size:*** - The size of the image will be relative to the object width or height mantaining its aspect ratio
- ***Creation conditions:*** - Create all Animated instances after the content loads (like in window.onload event)

## Create, access and manipulate Animations using the following methods

### `setOneDOM(obj, options)`

Evaluates a single DOM object and creates an `Animated` instance if it doesn't exist already.

#### Parameters

- `obj`: The DOM object.
- `options`: The options to pass to the `Animated` constructor.

Example usage:

```javascript
const element = document.getElementById("myElement");
setOneDOM(element, {fps: 24, playmode:'rew'});
```

### `setManyDOM(objs, options)`

Evaluates multiple DOM objects and creates `Animated` instances for each if they don't exist already.

#### Parameters

- `objs`: An array of DOM objects.
- `options`: The options to pass to the `Animated` constructor.

Example usage:

```javascript
const elements = document.querySelectorAll(".myElements");
setManyDOM(elements, {loop: true});
```

### `setOne(idOrClassName, options)`

Evaluates a single DOM object by its ID or class name and creates an `Animated` instance if it doesn't exist already.

#### Parameters

- `idOrClassName`: The ID or class name of the DOM object.
- `options`: The options to pass to the `Animated` constructor.

Example usage:

```javascript
setOne("#myElement", {loop:true,loopMode:'ff'});
```

### `setMany(className, options)`

Evaluates multiple DOM objects by their class name and creates `Animated` instances for each if they don't exist already.

#### Parameters

- `className`: The class name of the DOM objects.
- `options`: The options to pass to the `Animated` constructor.

Example usage:

```javascript
setMany(".myElements", {fps:12,loop:true,loopMode:'toggle'});
```

### `getByObject(obj)`

Finds an `Animated` instance by its DOM object.

#### Parameters

- `obj`: The DOM object associated with the `Animated` instance.

#### Returns

The `Animated` instance, or undefined if not found.

Example usage:

```javascript
const element = document.getElementById("myElement");
const animatedInstance = getByObject(element);
```

### `getThem(name)`

Gets one or all `Animated` instances by name.

#### Parameters

- `name`: The name of the `Animated` instance to get (optional).

#### Returns

A single `Animated` instance, or the entire `instances` object if no name is provided.

Example usage:

```javascript
const instanceByName = getThem("myInstanceName");
const allInstances = getThem();
// also you can destructure the instances from the instances object:
const {myInstanceName, myInstanceName_1, ...otherInstances} = getThem();
myInstanceName_1.start({toggle:true})
```

### `getArray(filter, cb)`

Gets an array of `Animated` instances, optionally filtered by a keyword and/or mapped with a callback function.

#### Parameters

- `filter`: A string to filter instances by matching their names or a part of it (optional).
- `cb`: A callback function to map the instances (optional).

#### Returns

An array of filtered and/or mapped `Animated` instances.

Example usage:

```javascript
const filteredInstances = getArray("myFilter");
const mappedInstances = getArray(null, instance => instance.name);
const mappedFilteredInstances = getArray('myFilter', instance => instance.start({}));
```

### `addTriggers(triggers)`

Adds new triggers to the `trigger` array.

- `triggers`: An array of DOM elements that will trigger the animation.

Example usage:

```javascript
animatedInstance.addTriggers([button1, button2]);
```

### `outEvent(event, cb, triggerIndex)`

Adds an event listener to the specified trigger.

- `event`: The event type (e.g., "click", "mouseover").
- `cb`: The callback function to execute when the event occurs.
- `triggerIndex`: The index of the trigger in the `trigger` array.

Example usage:

```javascript
animatedInstance.outEvent("click", () => console.log("Clicked!"), 0);
```

### `setPlayMode(playmode)`

Sets the play mode and updates the animation state.

- `playmode`: The new play mode ("ff" for forward or "rew" for reverse).

Example usage:

```javascript
animatedInstance.setPlayMode("rew");
```

### `setLoopMode(loopmode)`

Sets the loop mode and updates the animation state.

- `loopmode`: The new loop mode ("ff" for forward, "rew" for reverse, or "toggle" for toggle).

Example usage:

```javascript
animatedInstance.setLoopMode("rew");
```

### `start({toggle = false, loop = false} = null)`

Starts the animation.

- `toggle`: A boolean indicating whether the animation should toggle (default: `false`).
- `loop`: A boolean indicating whether the animation should loop (default: `false`).

Example usage:

```javascript
animatedInstance.start({toggle: true, loop: true});
```

## Here's a more detailed example of usage

### HTML

```html
<body>
  <h1>SVGAlive HTML example</h1>
  <object class="your-id" data="SVGAlive/sources/example.svg" type="image/svg+xml"></object>
  <object class="your-id" data="SVGAlive/sources/example.svg" type="image/svg+xml"></object>
  <object class="other-id" data="SVGAlive/sources/other.svg" type="image/svg+xml"></object>

  <script src="SVGAlive/SVGAlive(JS).js" type="module"></script>
</body>
```

### Javascript

```javascript
// import all the required functions from the controls(assuming it is in this path)
import { setMany, getThem, getArray, setOne,} from "./SVGAlive(controls).js";
// Do all the magic after the content loads
window.addEventListener("load", ()=> {
//create the instances
  setMany(".your-id",{ fps:100,loop:true });
  setOne('.other-id');
// destructure the instances object
  const { example, example_1, other } = getThem();
// start playing arround
  example.addTriggers([document.querySelector('body')])
  example.setLoopMode('rew')
  example_1.loop = false
  other.setPlayMode('rew')
// Note that in this example we're doing more complicated stuff just at once (it could be just one line)
  getArray("example", //get an array from the instances with the name 'example'
  (anim) => {
    anim.outEvent( "click", ()=> anim.setPlayMode('rew'), 0 ) // iterate them and add an outEvent for each instance trigger at index 0
    })[1].start({}); // finally return the second instance (example_1 in this case) from the array and start the example_1 animation
});

```

NOTES:

- This doesn't mean that you necessarily have to create the Animated({}) instance on this script, you can create it anywhere as long as you import the these methods from "./SVGAlive(controls).js".

## To use in ReactJS, you must do the following

1. Copy the entire "SVGAlive" folder into your root directory. (you can choose which animations you want to keep inside the 'sources' folder)
2. You can eliminate the SVGAlive(JS).js script (from the copied folder, of course)
3. You can use it like this in your app:

All the customization now are the props you pass to the component:

- `name`: will reference your file name (assuming your files are in the /SVGAlive/sources directory, otherwise you will have to modify the component)
- `controls`: is an object that has all the props and methods from the Animated class
- `play`: if true, the animation will start playing

In this example, I've created three instances of a cube animation with different behaviors:

```jsx
import { SVGAlive } from '../SVGAlive/SVGAlive';

<>
    <SVGAlive name='cube' controls={{fps:12, loop:false}}/>
    <SVGAlive name='cube' controls={{fps:30, playMode:'rew'}}/>
    <SVGAlive name='cube' />
</>
```

**NOTE:** For this component to work properly, you must have all your animations in the same directory. Otherwise, you will have to modify the component to change the `name` prop to recive the entire path instead of the name.

I'm currently working on this component and extending the Animated class functionalities to achieve more complex animation beahaviors with the less code as possible.
It will be ready very soon!!

In the meantime
Enjoy creating animated and interactive SVGs with SVGAlive!

***Mathias Romeo***
