# SVGAlive

## Overview

Terminal App to compile svg files to a single svg document to perform frame-based animations using a built-in library I created. It can be integrated with React (includes a React functional component template) or JS (includes a template script to instantiate the SVGAlive class). The final product is an .exe file svg builder within a directory structure. It provides an easy-to-use and colored readline interface and an animation handler that allows control over loop-mode, play-mode, frames-per-second, and more. It also includes a User-guide to implement this on any project you may have. I've tested it with different types of svg files, and it worked each time. The .exe file has been tested on Windows only.

## Motivation

My motivation for this project was the need to easily use the content, specifically animations, I create using Adobe Animate or any vector graphics software and be able to make them interactive without the need for a third-party library. It's something I wanted to do since I got back to the development world.

## Challenges

1. **ID conflicts:**  I managed to resolve id conflicts within the svg files, the main issue was that if the svg elements had the same ids, the final svg only renders the first element with that id, so the animation don’t work, during the process I faced a lot of bugs trying to fix the ids within different types of tags inside the svgs and its respective references. However I managed to fix this when the files are being compiled.

2. **Sizes and viewBox fixes:** Unlike common DOMElements, svg behave different when we talk about sizes and rects. I managed to fix all this challenges researching and learning more about svgs to make it render properly. By the moment I couldn’t fix the viewBox during compilation ‘cause to access the getBBox() object, the svg needs to be actually being rendered on the screen, so I used this function i wrote in case the user wanted to fix the width (considering aspect ratio and the different sizes of each element of course ) that triggers itself when the svg is loaded to fix this on runtime. However, this is provisional, and I'm researching other non-render-environment solutions such as the 'svg-to-path' package
to achieve this when the file is being compiled.

3. **Error handling:** I managed to cover all the errors in case they occur so that the app or the animation (on runtime) doesn't crash.

## Technologies used

JavaScript, Node, React

## Dependencies

- gulp
- gulp-svgmin
- gulp-concat
- through2
- cheerio
- readline
- jsdom
- glob
- fs
- pkg

## Building time

It is hard to say, but it took about two weeks and a half (not full-time) to get a functional final product. I took different approaches during the process, like the use of <![CDATA[ ]]> to embed the scripts within the svg file (it worked, but it wasn't performant), or use external resources, etc.

## What's Next?

- Implement an online version of the app using Streams and Blobs instead of all the node packages stuff.
- Resolve the viewBox issue during compilation in a non-render environment.
- Extend the Animations library to easily achieve more complex interactivity within the animations.
- Currently the file loading time are fast (unless you have lot of complicated animations running, which would be a very rare case), and as all the frames are compiled in a single file, it saves a lot of space (nearly the half). But I will like to find a way to compress them even more, but I’m not into it yet.
- NOTE: As the final svg file must be passed as data to an object tag, and If you’re previewing the page using a code Injection tool (like liveserver), it will render a parsererror within the object because liveserver injects code inside the svg (but it will only affects when previewing the page, not on deployment), to solve this you can use no-code-injection http server or similar. Using vite or React you don’t have any issues of this type
