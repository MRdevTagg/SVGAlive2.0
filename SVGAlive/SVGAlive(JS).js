/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, setOne,} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps:45,loop:true });
	setOne('.other-id',{fps:35})
	const { example, example_1, loo} = getThem()

	example.addTriggers([document.querySelector('body')]).setLoop('rew').start()
	example_1.loop = false
	
	loo.setLoop('ff').start()
	

	getArray("example", (anim) => anim.outEvent( "click", ()=> anim.toggle(true), 0 ));


	const preloader = document.querySelector('.preload')
	preloader.style.opacity = 0
	setTimeout( ()=> preloader.style['display'] = 'none', 1000 )
	console.log(getThem())
});
