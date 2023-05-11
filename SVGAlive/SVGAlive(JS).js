/* eslint-disable  */
// USE GUIDE:
/*
 1. - Give an id to the object that holds the svg like this: 
        <object id="your-anim-id" data="../SVGAlive/your-animation-name.svg" type="image/svg+xml" ></object>;
 2. - Now just pass the reference to the object in the object prop when you create the Animated instance
 3. - Finally you will have access to all the methods and properties to animate your SVGAlive
 */
import { Animated } from "./SVGAlive(controls).js";
	window.addEventListener('load',()=>{
	const anim = new Animated({object : document.querySelector('#your-id')});
	anim.fps = 24;	
	anim.loop = true
	anim.parent.onclick = (e)=>{
		e.preventDefault();
		!anim.isPlaying ? anim.start() : anim.stop();
	}

})