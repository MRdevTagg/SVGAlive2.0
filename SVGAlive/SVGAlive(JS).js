/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, setOne,} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps:24,loop:true });
	setOne('.your-id')
	setOne('.your-id')
	setOne('.your-id')
	setOne('.your-id')
	getThem('example').addTriggers([document.querySelector('body')])
	getThem('example').setLoopMode('rew')
	getThem('example_1').loop = false
	getThem('example_1').setPlayMode('rew')
	getArray("example", (anim) => anim.outEvent( "click", ()=> anim.start({toggle:true}), 0 ))[0].start({});
	const preloader = document.querySelector('.preload')
	preloader.style.opacity = 0
	setTimeout( ()=> preloader.style['display'] = 'none', 1000 )
	console.log(getThem())
});
