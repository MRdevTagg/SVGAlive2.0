/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, setOne,} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps:100,loop:true });
	setOne('.other-id',{fps:15})
	const { example, example_1, loo} = getThem()

	example.addTriggers([document.querySelector('body')])
	example.setLoopMode('rew')

	example_1.loop = false

	example_1.setLoopMode('rew')
	loo.setLoopMode('ff')
	loo.start({loop:true})

	getArray("example", (anim) => anim.outEvent( "click", ()=> anim.start({toggle:true}), 0 ))[0].start({});
	const preloader = document.querySelector('.preload')
	preloader.style.opacity = 0
	setTimeout( ()=> preloader.style['display'] = 'none', 1000 )
	console.log(getThem())
});
