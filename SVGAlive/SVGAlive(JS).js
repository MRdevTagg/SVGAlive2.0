/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, $,} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps: 25, playmode: 'rew',name:'arrow'});
	setMany('.cube',{ fps: 45, playmode: 'rew',initialFrame : 15, name:'cosa'},)
	const { arrow,arrow_1 } = getThem()

	arrow.addTriggers([$('body')]).setLoop('pingpong').start()
	arrow_1.beforeDraw = (arr) => {
		!arr.firstPlay && arr.reach(5) && console.log(`${arr.getName()} reached frame ${arr.getCurrent()}`)
	}
	getArray('cosa', (anim,i) => anim.outEvent('mouseenter',()=> anim.toggle(true).setFPS(70) ,0))[0].setLoop('rew').start().fps = 50

	getArray("arrow", (anim) => anim.outEvent( "click", ()=> anim.toggle(true), 0 ));

console.log(getThem())

});
