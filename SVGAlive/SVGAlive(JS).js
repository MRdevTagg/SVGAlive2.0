/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, setOne,} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{fps:45,playmode:'rew', initialFrame : 90});
	setOne('.other-id',{fps:35})
	const { example, example_1, loo} = getThem()

	example.addTriggers([document.querySelector('body')]).setLoop('pingpong').start()
	
	
	loo.setLoop('ff').start()
	

	getArray("example", (anim) => anim.outEvent( "click", ()=> anim.toggle(true), 0 ));


	const preloader = document.querySelector('.preload')
	preloader.style.opacity = 0
	setTimeout( ()=> preloader.style['display'] = 'none', 1000 )
	console.log(getThem())
});
