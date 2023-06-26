/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, $, setOne, getByObject} from "./AliveSVGLibrary.js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps: 40,name:'arrow'});
	setMany('.cube',{ fps: 45,initialFrame : 15, name:'cube' })
	const { arrow, arrow_1 } = getThem()
	const cubes = getArray('cube')
	
	cubes[8].setFPS(60)
	cubes.map((cube, i)=> i % 2 && cube.setFPS(22).start())
	getByObject($('.your-id')).addTriggers([$('body'),cubes[0].getObject()])
	.requestStage('last-half', 5)
	.setLoopMode('toggle')
	.setFPS(2)
	.start()
	.afterDraw = (anim) => anim.reach(20) && cubes[8].restart();

	arrow_1.setFPS(10).afterDraw = (anim) => !anim.firstPlay && anim.reach('half') && cubes[3].toggle();
	getArray('cube', (anim) => anim.outEvent('mouseenter', ()=> anim.toggle()).outEvent('click', ()=> anim.pause()))
	[4].setLoopMode('rew').start()
	cubes[5].setLoopMode('ff').start()
	cubes[6].setLoopMode('toggle').setFPS(1).start()

	getArray("arrow", (anim,i) => {
		anim.outEvent( "click", ()=> anim.toggle())
	});

console.log(getThem())

});
