
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

1. - Give an id to the object that holds the svg like this, also it could be a class:

```html
    <object id="your-anim-id" data="../SVGAlive/your-animation-name.svg" type="image/svg+xml"></object>
```

**In Javascript:**
NOTES: if you created the Animated instance using createMany() method, the names will be incremented with the
prefix 'your-svg-name, your-svg-name_1, your-svg-name_2, ...', corresponding to the order you created them.
The size of the image will be relative to the object width or height mantaining its aspect ratio

- Create all Animated instances before you access them using the following methods:

`createOne()` :
   Create single Animated instance from id or className given to the object,
  @param id(string):  (mandatory) it must contain the id or className from the object you want to add to an Animated instance
  @param options(object): (optional) an object that must contain valid properties and values from the Animated class

- `createMany()` :
   Create many Animated instances from a className given to more than one object
  @param id(string): this argument is mandatory, it must contain className from the objects you want to add to an Animated instance
  @param options(object): this is an optional argument, an object that must contain valid properties and values from the Animated class

Access Animations using the following methods:

- `getOne()`:
 get a single Animated instance, it takes a string param that must be equal to the svg file name, if you created
 the Animated instance using the createMany() method you must keep in mind the prefix increment explained in NOTES above
  
- `getAll()` :
 returns an object that contains all Animated instances created to this point, the keys are equal to the svg file name
 with the prefix(if there is more than one with the same name),
 you can destructure it and rename the Animated's references at your convenience

- `getArray()` :
 get an array from all Animated instances created to this point, this method has two optional params: filter and cb
 @param filter(string): you can filter the Animated instances that contains this string in its svg file name
 @param cb(function): you can set a callback function to execute for all animations, you must pass an argument to
 reference each Animated instances, also you can get the index and all the array from the second and third, parameter

In the following example lets supose we have six diferent svg animations files: logo.svg, icon-home.svg, icon-contact.svg, icon-about.svg, icon-services.svg, icon-feedback.svg, and also we have a svg file that we're going to use many times: plus.svg. All of this inside a header tag will look like this:

### HTML ###

```html
<header>
<object id="logoID" data="SVGAlive/sources/logo.svg" type="image/svg+xml"></object>
<nav>
    <div><object class="icons" data="SVGAlive/sources/icon-home.svg" type="image/svg+xml"></object></div>
    <div><object class="icons" data="SVGAlive/sources/icon-contact.svg" type="image/svg+xml"></object></div>
    <div><object class="icons" data="SVGAlive/sources/icon-about.svg" type="image/svg+xml"></object></div>
    <div><object class="icons" data="SVGAlive/sources/icon-services.svg" type="image/svg+xml"></object></div>
    <div><object class="icons" data="SVGAlive/sources/icon-feedback.svg" type="image/svg+xml"></object></div>

</nav>
<object class="pluses" data="SVGAlive/sources/plus.svg" type="image/svg+xml"></object>
<object class="pluses" data="SVGAlive/sources/plus.svg" type="image/svg+xml"></object>
<object class="pluses" data="SVGAlive/sources/plus.svg" type="image/svg+xml"></object>
<object class="pluses" data="SVGAlive/sources/plus.svg" type="image/svg+xml"></object>

</header>
```

### Javascript ###

```javascript
import { createOne, createMany, getOne, getAll, getArray } from "./SVGAlive(controls).js";
window.addEventListener("load", () => {
// createOne() and createMany() act as querySelector() and querySelectorAll() (look at the string we pass to it)
// Create a single Animated instance and set its framerate to 35 fps
createOne("#logoID",{ fps:35, loop:true });
// Create many Animated instances and set their framerate to 60 fps and its playmode to rew
createMany(".icons", { fps: 60, playmode: "rew" });
createMany('.pluses', { loop:true })

// Get Animated instance of logo ant the instance of icon-home and start the animation using getOne method 
// (note that we pass the name of the svg file, and also that every invalid character for variable declaration
// would be replaced by '_')
 getOne("logo").start({loop:true});
 getOne('icon_home').start({})

// we could also get the same result destructuring the object returned by getAll() method
 const { logo, icon_home, icon_contact } = getAll();
logo.start({});
icon_home.start({ loop: true });
icon_contact.fps = 15;
icon_contact.start({});

// if now we want that all the icons have the same behavior we colud get an array from al the Animations instance 
// created this far and then filter the result: this will return an array from all the animated instances that 
// contains 'ico' in its name, ergo we will get all the icons. And we can pass a callbac function 
// that will affect all of them
getArray('icon', (icon) =>icon.start({}))

// We could also add a listener to its parent to trigger the animation and 
// toggle the direcion every time we click on it
getArray('icon', (anim) => anim.object.parentElement.addEventListener("click", () => anim.start({ toggle: true })));

// Now if we have different Animated instances with the same svg file name like the plus.svg example we could do:
getOne('plus').start({});
getOne('plus_1').start({});
getOne('plus_2').start({});

// or we could use destructuring again (note i renamed plus_2)
const { plus, plus_1, plus_2 : p2 } = getAll();
plus.start({});
plus_1.start({});
p2.start({});

// or we could get the array from all Animated instances that includes plus in its name and 
// select them by its index
getArray('plus')[0].start({})
getArray('plus')[1].start({})
getArray('plus')[2].start({})

// if we want to add a listener to the Animated instance of plus_2 itself we could do:
p2.parent.addEventListener('click', () => p2.start({ toggle: true }))
//or
getOne('plus_2').parent.addEventListener('click', () => getOne('plus_2').start({ toggle: true }))

// this is just an example just to cover all the different ways to create, access and manimpulate the animations
// we can use this in every scope we are, add conditions or whatever, if the animation is alredy created :
const body = document.querySelector('body')
body.addEventListener('scroll', ()=> getOne('logo').start({loop:true,fps: body.offsetTop / 10 }))

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

For more advanced customization, I invite you to see the SVGAlive documentation. If you are a developer and you like to play, you can take a look at the "SVGAlive(controls).js" file or the SVGAlive.jsx component in the SVGAlive directory to understand it better and/or modify/extend it as you like.

Enjoy creating animated and interactive SVGs with SVGAlive!
