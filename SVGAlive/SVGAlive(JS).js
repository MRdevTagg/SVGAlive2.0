/* eslint-disable  */
// USE GUIDE:

import {
  createOne,
  createMany,
  getOne,
  getAll,
  getArray,
} from "./SVGAlive(controls).js";
window.addEventListener("load", () => {
/* create all Animated instances before you call them using the following methods:
	NOTES: if you created the Animated instance using createMany() method, the names will be incremented with the 
	prefix 'your-svg-name, your-svg-name_1, your-svg-name_2, ...', corresponding to the order you created them

	createOne() :
   create single Animated instance from id or class given to the object,
	 @param id(string):  (mandatory) it must contain the id or className from the object you want to add to an Animated instance
	 @param options(object): (optional) an object that must contain valid properties and values from the Animated class

	createMany() :
   create many Animated instances from a className given to more than one object
	 @param id(string): this argument is mandatory, it must contain className from the objects you want to add to an Animated instance
	 @param options(object): this is an optional argument, an object that must contain valid properties and values from the Animated class
	
	 */

	
	/* Access Animations using the following methods:
	
	getOne():
	get a single Animated instance, it takes a string param that must be equal to the svg file name, if you created 
	the Animated instance using the createMany() method you must keep in mind the prefix increment explained in NOTES above
  
	getAll() : 
	returns an object that contains all Animated instances created to this point, the keys are equal to the svg file name 
	with the prefix(if there is more than one with the same name), 
	you can destructure it and rename the Animated's references at your convenience
	
	getArray() :
	get an array from all Animated instances created to this point, this method has two optional params: filter and cb
	@param filter(string): you can filter the Animated instances that contains this string in its svg file name
	@param cb(function): you can set a callback function to execute for all animations, you must pass an argument to reference each Animated instances
	
	*/
  createOne("#logo",{ fps:35 });
  createMany(".accordion_arrow", { fps: 60, playmode: "rew" });

	getOne("mathiasRomeoLogo").start({});
	getArray("arr2", (anim) =>
	anim.object.parentElement.addEventListener("click", () =>
	anim.start({ toggle: true, loop: false })
	)
  );

	//const { mathiasRomeoLogo: logo, arr2_4: arrow4 } = getAll();
	//logo.start({});
  //getArray("arr2_", (anim) => (anim.fps = 12));

  //arrow4.start({ loop: true });
  //getOne("arr2_1").start({ loop: true });
  //getArray("arr2")[3].start({ loop: true });
});
