/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, $, setOne,} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps: 25, playmode: 'rew',name:'arrow'});
	setMany('.cube',{ fps: 45, playmode: 'rew',initialFrame : 15, name:'thing'},)
	const { arrow,arrow_1,thing_5 } = getThem()
	
	arrow.addTriggers([$('body')]).setLoop('pingpong').setFPS(50).start()
	arrow_1.beforeDraw = (arr) => {
		!arr.firstPlay && arr.reach(5) && console.log(`${arr.getName()} reached frame ${arr.getCurrent()}`)
	}
	getArray('thing', (anim) => anim.outEvent('mouseenter', ()=> anim.toggle(true).setFPS(40),0 ))
	[5].setLoop('rew').start()

	getArray("arrow", (anim,i) => {
		anim.outEvent( "click", ()=> anim.toggle(true), 0 )
		i === 0 && anim.outEvent( "dblclick", ()=> !anim.isPlaying ? anim.start() : anim.stop(), 0 )

	});

console.log(getThem())

});
