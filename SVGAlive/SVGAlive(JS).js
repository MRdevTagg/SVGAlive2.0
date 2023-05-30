/* eslint-disable  */
// USE GUIDE:

import { setMany, getThem, getArray, $, setOne, getByObject} from "./SVGAlive(controls).js";
window.addEventListener("load", ()=> {

	setMany(".your-id",{ fps: 40,name:'arrow'});
	setMany('.cube',{ fps: 45,initialFrame : 15, name:'cube' })
	const { arrow, arrow_1 } = getThem()
	const cubes = getArray('cube')
	
	cubes[8].setFPS(60)
	cubes.map((cube, i)=> i % 2 && cube.start())
	getByObject($('.your-id')).addTriggers([$('body'),cubes[0].getObject()])
	.requestStage('last-half', 5)
	.setLoop('toggle')
	.setFPS(50)
	.start()
	.afterDraw = (anim) => !anim.firstPlay && anim.reach(20) && cubes[8].restart();

	arrow_1.setFPS(10).afterDraw = (anim) => !anim.firstPlay && anim.reach('half') && cubes[3].toggle(true);
	getArray('cube', (anim) => anim.outEvent('mouseenter', ()=> anim.toggle(true)).outEvent('click', ()=> anim.pause()))
	[4].setLoop('rew').start()
	cubes[5].setLoop('ff').start()
	cubes[6].setLoop('toggle').start()

	getArray("arrow", (anim,i) => {
		anim.outEvent( "click", ()=> anim.toggle(true))
	});

console.log(getThem())

});
