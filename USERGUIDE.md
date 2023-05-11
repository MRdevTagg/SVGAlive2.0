
# How to Use SVGAlive

SVGAlive is a software designed to create javascript-based animated and interactive single-file SVGs in a simple and code-less way.

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

*NOTE*: The final svg file must be passed as data to an object tag, and If you’re previewing the page using a code Injection tool (like liveserver), it will render a parsererror within the object 'cause liveserver injects code inside the svg (but it will only affects when previewing the page, not on deployment), to solve this you can use no-code-injection like http-server or similar to preview the page.
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

1. - Give an id to the object that holds the svg like this:

```html
    <object id="your-anim-id" data="../SVGAlive/your-animation-name.svg" type="image/svg+xml"></object>
```

2. - Now just pass the reference to the object in the object prop when you create the Animated instance
3. - Finally you will have access to all the methods and properties to animate your SVGAlive

```javascript
import { Animated } from "./SVGAlive(controls).js";
window.addEventListener('load',()=>{
    const anim = new Animated({object : document.querySelector('#your-id')});
    anim.fps = 24;
    anim.parent.onclick = (e)=>{
        e.preventDefault();
        anim.start();
    }
});
```

NOTES:

- The Animated instance must be created after the content loads.
- Another thing that I strongly recommend attaching the events (such as click, mousemove, etc.) to the anim.parent
- The script above is the same that you have in the SVGAlive(JS).js script as an example. This doesn't mean that you necessarily have to create the Animated({}) instance on this script, you can create it anywhere as long as you import (or require) the Animated class from "./SVGAlive(controls).js".

## To use in ReactJS, you must do the following

1. Copy the entire "SVGAlive" folder into your root directory. (you can choose which animations you want to keep inside the 'sources' folder)
2. You can eliminate the SVGAlive(JS).js script (from the copied folder, of course)
3. You can use it like this in your app:

All the customization now are the props you pass to the component:

- `name`: will reference your file name (assuming your files are in the /SVGAlive/sources directory, otherwise you will have to modify the component)
- `w`: you can add a custom size to the animation
- `controls`: is an object that has all the props and methods from the Animated class
- `play`: if true, the animation will start playing

In this example, I've created three instances of a cube animation with different behaviors and sizes:

```jsx
import { SVGAlive } from '../SVGAlive/SVGAlive';

<>
    <SVGAlive name='cube' controls={{fps:12, loop:false}}/>
    <SVGAlive name='cube' w={40} controls={{fps:30, playMode:'rew'}}/>
    <SVGAlive name='cube' w={100}/>
</>
```

**NOTE:** For this component to work properly, you must have all your animations in the same directory. Otherwise, you will have to modify the component to change the `name` prop to recive the entire path instead of the name.

For more advanced customization, I invite you to see the SVGAlive documentation. If you are a developer and you like to play, you can take a look at the "SVGAlive(controls).js" file or the SVGAlive.jsx component in the SVGAlive directory to understand it better and/or modify/extend it as you like.

Enjoy creating animated and interactive SVGs with SVGAlive!
