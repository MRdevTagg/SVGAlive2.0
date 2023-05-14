/* eslint-disable  */
// USE GUIDE:
/*
 1. - Give an id to the object that holds the svg like this: 
        <object id="your-anim-id" data="../SVGAlive/your-animation-name.svg" type="image/svg+xml" ></object>;
 2. - Now just pass the reference to the object in the object prop when you create the Animated instance
 3. - Finally you will have access to all the methods and properties to animate your SVGAlive
 */
import { Animated, getAll } from "./SVGAlive(controls).js";
	window.addEventListener('load',()=>{
	new Animated({
		object : document.querySelector('#logo'),playmode:'ff'});
	getAll().logo.fps = 35;	
	getAll().logo.start();

	document.querySelectorAll('.accordion-arrow').forEach(arr=>{
		const newArrow = new Animated({object:arr,toggle:true,fps:60,playmode:'rew'})
		newArrow.object.parentElement.addEventListener('click',()=>newArrow.start())
	})
})