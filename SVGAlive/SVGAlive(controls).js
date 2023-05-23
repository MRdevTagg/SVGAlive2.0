export const $ = el => document.querySelector(el);
export const $$ = el => document.querySelectorAll(el);
export const tag = el => document.getElementsByTagName(el);
const valid = (prop, validProps, propName) => {
 if(prop)
 { const filter = validProps.filter( (validProp) => validProp === prop );
  if (filter.length === 0){ 
   console.error(`setted to default :
"${prop}" is an invalid prop
you must pass ${JSON.stringify(validProps).split(',').join(` or `).replace('[','').replace(']','')} as "${propName}" value`);
   return null
  }
  else return prop;
}
}
const validPlaymode = (mode)=> valid(mode,['ff','rew'],'playmode');
const validLoopmode = (mode)=> valid(mode,['ff','rew','pingpong'],'loopmode');

export const instances = {};
export class Animated {
  #playmode = "ff";
  #loopMode = "pingpong";
  isPlaying = false;
  firstPlay = true;
  #current = 0;
  #previous = null;
  #direction = 1;
  #triggers;
  #frameID = null;
  #lastFrameTime = null;
  #mode;
  #loop;
  #willToggle = false;
  #object;
  #frames;
  #parent
  #name
  #condition = () => this.#current <= this.max;
  #atStart = () => this.#current >= this.min;
  #atEnd = () => this.#current <= this.max;
  #reachPoint = (frame) => this.#current === frame;

  constructor({ object, triggers, min, max, fps, loop, loopmode, playmode, initialFrame,name }) {
//related DOMElements
this.#object = object;
this.#parent = object.contentDocument.querySelector(`svg`);
this.#triggers = triggers || [this.#parent]
//playmodes and loopmodes   
this.#loop = loop || false;
this.#loopMode = validLoopmode(loopmode) || 'ff'
this.#playmode = validPlaymode(playmode) || 'ff'
//Frames and timing related
this.#frames = [...this.#parent.querySelectorAll("svg")];
this.fps = (fps < 120 && fps) || 120;
this.min = (min >= 0 && min) || 0;
this.max = (max <= this.#frames.length - 1 && max) || this.#frames.length - 1;
this.skip = false;
this.#mode = this.#loop && this.#loopMode !== 'pingpong' ? this.#loopMode : this.#playmode;
this.#current = initialFrame;

this.afterDraw = null;
this.beforeDraw = null;


this.#name = declare(this, name || null);  
this.#awake(initialFrame);
  }
  //GETTERS
  getObject(){ return this.#object };
  getCurrent(){ return this.#current };
  getThis(){ return this.#parent };
  getName(){ return this.#name };
  
  // PRIVATE METHODS
  #setLoopMode() {
     const mode = {
      ff : () => this.#current = this.min,
      pingpong : () => {
        this.#previous = null
        this.toggle()
      },
      rew : () => this.#current = this.max,
    };
		return mode[this.#loopMode] && mode[this.#loopMode]()
  }
  #setCondition() {
  const mode = {
  "ff":()=>{
        this.#direction = 1;
        this.#condition = () => this.#atEnd();
	},
   "rew":()=>{
        this.#direction = -1;
        this.#condition = () => this.#atStart();
	}
    }
		return mode[this.#playmode]()
  }
  #awake(initial) {
    if(!initial || initial > this.max || initial < this.min){
      this.#mode === 'ff' ? this.#current = this.min : this.#current = this.max;
    } 
    this.#frames[this.#current]?.setAttribute("display", "block");
    //console.log( `${this.#name} is awake on "${this.#mode}" mode at frame ${this.#current}`)
  }
  #update() {
    if (!this.isPlaying) return;
    const framesToDraw = Math.floor(
      (performance.now() - this.#lastFrameTime) / (1000 / this.fps)
    );

    this.#animate(framesToDraw);

    this.#frameID = requestAnimationFrame(this.#update.bind(this));
  }
  #animate(framesToDraw) {
    for (let i = 0; i < framesToDraw; i++) {
      this.#lastFrameTime += 1000 / this.fps;
      typeof this.beforeDraw === 'function' && this.beforeDraw(this)
      this.#play();
      typeof this.afterDraw === 'function' && this.afterDraw(this)
    }
  }
  #play() {
    this.#setCondition();
    this.#condition() ? this.#draw()
    : this.#loop ? this.#setLoopMode()
    : this.stop();
  }
  #draw() {
    if(!this.skip){
      this.#frames[this.#previous]?.setAttribute("display", "none");
      this.#frames[this.#current]?.setAttribute("display", "block");
      this.#previous = this.#current;
      this.#current += this.#direction;
    }this.skip === true && (this.skip = false)
  }
// PUBLIC METHODS

  start() {
    if (!this.isPlaying) {
      this.firstPlay  && (this.firstPlay = false);
      this.isPlaying = true;
      this.#lastFrameTime = performance.now();
      this.#update();
    }
    return this
  }
  stop() {
    if(this.isPlaying){
      cancelAnimationFrame(this.#frameID);
      this.#loop = false 
      this.isPlaying = false;
      this.#willToggle && (this.#previous = null)
      this.#lastFrameTime = null;
    }
    return this
  }
  toggle(on = false){
    this.#willToggle = on;
    if(!this.firstPlay){
      !this.isPlaying || (!this.#atEnd() || !this.#atStart()) && (this.#previous = null)
      !this.#loop || this.#loopMode === 'pingpong' ? 
        this.#playmode === "ff" ? this.setPlay("rew") : this.setPlay("ff") :
        this.#loopMode === "ff" ? this.setLoop("rew") : this.setLoop("ff") ;
    }
    !this.isPlaying && on && this.start()
    return this
  }
  setPlay( playmode ) {
    validPlaymode(playmode) && (this.#playmode = playmode);
    this.#setCondition()
    return this
  }
  setLoop( loopmode ) {
    loopmode && !this.#loop && (this.#loop = true)
    validLoopmode(loopmode) && (this.#loopMode = loopmode);
    this.#loopMode !== "pingpong" && this.setPlay(loopmode);
    this.#setCondition()
    return this
  }
  setFPS(fps){
    fps && (this.fps = fps)
    return this
  }
  addTriggers(triggers){
    this.#triggers = [...this.#triggers, ...triggers]
    return this
  }
  outEvent(event,cb,triggerIndex = 0){
    this.#triggers[triggerIndex].addEventListener(event,cb)
    return this
  }
  goToFrame(frame, play = true){
    this.#frames[this.#previous]?.setAttribute("display", "none");
    this.#frames[this.#current]?.setAttribute("display", "none");
    this.previous = null;
    this.#current = frame;
    this.#draw();
    !play && this.stop();
    return this
  }
  reach(point){
    if( typeof point === 'number' && point >= 0 && point <= this.#frames.length -1  ) return this.#reachPoint(point)
    else if(typeof point === 'string' && (point === 'max' || point === 'min')){
       const mode = {
         max : ()=> this.#atStart(),
         min : ()=> this.#atEnd()
       }
       return mode[point]()
     }
     else return console.error('you must pass a valid frame number or "max" or "min"')
  }

}





const SVGAliveError = (object) =>{
  return`
    Error:${object instanceof HTMLObjectElement ? 
    'Object reference alredy declared in an existing Animated instance' : 
    'The element ho reference must be instanceof HTMLObjectElement'}
    Resolution: It won't be created
    Advice: Remove useless instantiation
    Instances: ${JSON.stringify(getArray().map(el => el.name))}
    path:  ${object.getAttribute('data')}
    $id:  ${object.getAttribute('id')}
    class:  ${object.getAttribute('class')}`
  
}
const evaluate = (obj,options) =>{
if(obj instanceof HTMLObjectElement === false) return console.error(SVGAliveError(obj))
const fltr = getArray().filter((anim) => anim.getObject() === obj)
  if(fltr.length > 0) return console.error(SVGAliveError(obj));
  else return new Animated({object:obj, ...options})
}
const getValidName = (animation, name)=> {
  const validName = name || animation.getObject().getAttribute('data').split('/').pop().split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9_]/g, '_');
  let finalName = validName;
  for (const key in instances) {
    if (key === validName) {
      let prefix = 1;
      while (instances[`${validName}_${prefix}`]) {
        prefix++;
      }
      finalName = `${validName}_${prefix}`;
    }
  }
  animation.name = finalName;
  return finalName;
}
const declare = (instance, name) => {
  let finalName = getValidName(instance,name);
  instances[finalName] = instance;
  return finalName
};

export const setOneDOM = (obj,options) => evaluate( obj, options );
export const setManyDOM = (objs,options) => objs.forEach( anim => evaluate(anim, options));
export const setOne = (idOrClassName,options) => evaluate($(idOrClassName), options);
export const setMany = (className,options) => $$(className).forEach( anim => evaluate(anim,options));

export const getByObject = (obj)=> getArray().filter( anim => anim.getObject() === obj )[0]
export const getThem = (name = null) => !name ? instances : instances[name];
export const getArray = (filter = null, cb) => {
  const arrayToReturn = [];
  for (const key in instances) {
    filter
      ? key.includes(filter) && arrayToReturn.push(instances[key])
      : arrayToReturn.push(instances[key]);
  }
  cb && arrayToReturn.map( (anim,i,arr) => cb(anim,i,arr))
  return arrayToReturn;
}



