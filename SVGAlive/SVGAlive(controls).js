export const $ = el => document.querySelector(el);
export const $$ = el => document.querySelectorAll(el);
export const tag = el => document.getElementsByTagName(el);
const valid = (prop,validProps,propName) => {
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
  #isPlaying = false;
  #firstPlay = true;
  #current = 0;
  #previous = null;
  #direction = 1;
  #triggers;
  #condition = () => this.#current <= this.max;
  #atStart = () => this.#current >= this.min;
  #atEnd = () => this.#current <= this.max;
  #reachPoint = (frame) => this.#current === frame;
  #frameID = null;
  #lastFrameTime = null;
  #mode;
  #loop;
  constructor({ object, triggers, min, max, fps, loop, loopmode, playmode, initialFrame }) {
//related DOMElements
    this.name;
    this.object = object;
    this.parent = object.contentDocument.querySelector(`svg`);
    this.#triggers = triggers || [this.parent]
//playmodes and loopmodes   
    this.loop = loop || false;
    this.#loopMode = validLoopmode(loopmode) || 'ff'
    this.#playmode = validPlaymode(playmode) || 'ff'
//Frames and timing related
    this.frames = [...this.parent.querySelectorAll("svg")];
    this.fps = (fps < 120 && fps) || 120;
    this.min = (min >= 0 && min) || 0;
    this.max = (max <= this.frames.length - 1 && max) || this.frames.length - 1;
    this.skip = false;
    this.#mode = this.loop && this.#loopMode !== 'pingpong' ? this.#loopMode : this.#playmode;
    this.#current = initialFrame

    declare(this);
    this.#awake(initialFrame);
  }
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
		return mode[this.#playmode] && mode[this.#playmode]()
  }
  #awake(initial) {
    if(!initial || initial > this.max || initial < this.min){
      this.#mode === 'ff' ? this.#current = this.min : this.#current = this.max;
    } 
    this.frames[this.#current]?.setAttribute("display", "initial");
    console.log( `${this.name} is awake on "${this.#mode}" mode al frame ${this.#current}`)
  }
  #fixedUpdate(){
    this.loop && this.#loopMode !== "pingpong" && this.setPlay(this.#loopMode);
  }
  #update() {
    if (!this.#isPlaying) return;
    const framesToDraw = Math.floor(
      (performance.now() - this.#lastFrameTime) / (1000 / this.fps)
    );
    this.#fixedUpdate()

    this.#animate(framesToDraw);

    this.#frameID = requestAnimationFrame(this.#update.bind(this));
  }
  #animate(framesToDraw) {
    for (let i = 0; i < framesToDraw; i++) {
      this.#lastFrameTime += 1000 / this.fps;
      this.#play();
    }
  }
  #play() {
    this.#setCondition();
    this.#condition() ? this.#draw()
    : this.loop ? this.#setLoopMode()
    : this.stop();
  }
  #draw() {
    this.frames[this.#previous]?.setAttribute("display", "none");
    this.frames[this.#current]?.setAttribute("display", "initial");
    this.#previous = this.#current;
    this.#current += this.#direction;
  }
  
// PUBLIC METHODS

  start() {

    if (!this.#isPlaying) {

      this.#firstPlay  && (this.#firstPlay = false);
      this.#isPlaying = true;
      this.#lastFrameTime = performance.now();
      this.#update();
    }
    return this
  }

  stop() {
    if(this.#isPlaying){
      cancelAnimationFrame(this.#frameID);
      this.#isPlaying = false;
      this.#previous = null
      this.#lastFrameTime = null;
    }
    return this
  }
  toggle(on = null){
    if(!this.#firstPlay){
      !this.#isPlaying || (!this.#atEnd() || !this.#atStart()) && (this.#previous = null)
      !this.loop || this.#loopMode === 'pingpong' ? 
        this.#playmode === "ff" ? this.setPlay("rew") : this.setPlay("ff") :
        this.#loopMode === "ff" ? this.setLoop("rew") : this.setLoop("ff") ;
    }
    on && this.start()
    return this
  }
  setPlay( playmode ) {
    validPlaymode(playmode) && (this.#playmode = playmode);
    this.#setCondition()
    return this
  }
  setLoop( loopmode ) {
    !this.loop && (this.loop = true)
    validLoopmode(loopmode) && (this.#loopMode = loopmode);
    this.#loopMode !== "pingpong" && this.setPlay(loopmode);
    this.#setCondition()
    return this
  }
  addTriggers(triggers){
    this.#triggers = [...this.#triggers, ...triggers]
    return this
  }
  outEvent(event,cb,triggerIndex){
    this.#triggers[triggerIndex].addEventListener(event,cb)
  }
  
}






const SVGAliveError = (object) =>{
  return`
    Error: Object reference alredy declared in an existing Animated instance
    Resolution: It won't be created
    Advice: Remove useless instantiation
    Instances: ${JSON.stringify(getArray().map(el => el.name))}
    path:  ${object.getAttribute('data')}
    $id:  ${object.getAttribute('id')}
    class:  ${object.getAttribute('class')}`
  
}
const evaluate = (obj,options) =>{

const fltr = getArray().filter((anim) =>  obj === anim.object)
  if(fltr.length > 0) return console.error(SVGAliveError(obj));
  else return new Animated({object:obj, ...options})
}
const getValidName = (animation)=> {
  const validName = animation.object.getAttribute('data').split('/').pop().split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9_]/g, '_');
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
const declare = (instance) => {
  let finalName = getValidName(instance);
  instance.name = finalName
  instances[instance.name] = instance;
};

export const setOneDOM = (obj,options) => evaluate( obj, options );
export const setManyDOM = (objs,options) => objs.forEach( anim => evaluate(anim, options));
export const setOne = (idOrClassName,options) => evaluate($(idOrClassName), options);
export const setMany = (className,options) => $$(className).forEach( anim => evaluate(anim,options));

export const getByObject = (obj)=> getArray().filter( anim => anim.object === obj )[0]
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



