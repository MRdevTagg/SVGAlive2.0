/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, $, setOne,} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps: 40,name:'arrow'});
	setMany('.cube',{ fps: 45,initialFrame : 15, name:'cube'})
	const { arrow,arrow_1} = getThem()
	const cubes = getArray('cube')
	
	cubes[8].setFPS(60)
	cubes.map((cube, i)=> i % 2 && i !== 3 && cube.setLoop('ff').start())
	arrow.addTriggers([$('body')])
	.setStage('half')
	.setLoop('pingpong')
	.setFPS(50)
	.start()
	.afterDraw = (anim) => !anim.firstPlay && anim.reach(20) && cubes[8].start()

	arrow_1.setFPS(10).afterDraw = (anim) => !anim.firstPlay && anim.reach('middle') && cubes[3].toggle(true).setFPS()
	getArray('cube', (anim) => anim.outEvent('mouseenter', ()=> anim.toggle(true)))
	[5].setLoop('rew').start()
	
	getArray("arrow", (anim,i) => {
		anim.outEvent( "click", ()=> anim.toggle(true))
	});

console.log(getThem())

});
