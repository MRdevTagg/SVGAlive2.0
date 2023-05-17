export const $ = el => document.querySelector(el);
export const $$ = el => document.querySelectorAll(el);
export const tag = el => document.getElementsByTagName(el);


export const instances = {};
export class Animated {
  #playmode = "ff";
  #loopMode = "pingpong";
  #isPlaying = false;
  #firstPlay = true;
  #current = 0;
  #previous = null;
  #direction = 1;
  #condition = () => this.#current <= this.max;
  #reachStart = () => this.#current >= this.min;
  #reachEnd = () => this.#current <= this.max;
  #reachPoint = (frame) => this.#current === frame;
  #frameID = null;
  #lastFrameTime = null;

  constructor({ object, trigger, min, max, fps, loop }) {
//related DOMElements
    this.name;
    this.object = object;
    this.parent = object.contentDocument.querySelector(`svg`);
    this.trigger = trigger || [this.parent]
//playmodes and loopmodes   
    this.loop = loop || false;
    
//Frames and timing related
    this.frames = [...this.parent.querySelectorAll("svg")];
    this.fps = (fps < 120 && fps) || 120;
    this.min = (min >= 0 && min) || 0;
    this.max = (max <= this.frames.length - 1 && max) || this.frames.length - 1;
    this.skip = false;

    declare(this);
    this.#awake();
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
        this.#condition = () => this.#reachEnd();
	},
   "rew":()=>{
        this.#direction = -1;
        this.#condition = () => this.#reachStart();
	}
    }
		return mode[this.#playmode] && mode[this.#playmode]()
  }
  #awake() {
    const mode = this.loop ? 'loopMode' : 'playmode'
    this.frames[this.#current]?.setAttribute("display", "none");
    this[mode] === "ff" && (this.#current = this.min);
    this[mode] === "rew" && (this.#current = this.max);
    this.#draw();
    console.log( `${this.name} awake`)
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
      !this.#isPlaying || (!this.#reachEnd() || !this.#reachStart()) && (this.#previous = null)
      !this.loop || this.#loopMode === 'pingpong' ? 
        this.#playmode === "ff" ? this.setPlay("rew") : this.setPlay("ff") :
        this.#loopMode === "ff" ? this.setLoop("rew") : this.setLoop("ff") ;
    }
    on && !this.#isPlaying && this.start()
    return this
  }
  setPlay( playmode ) {
    playmode && (this.#playmode = playmode);
    this.#setCondition()
    return this
  }
  setLoop( loopmode ) {
    !this.loop && (this.loop = true)
    loopmode && (this.#loopMode = loopmode);
    this.#loopMode !== "pingpong" && this.setPlay(loopmode);
    this.#setCondition()
    return this
  }
  addTriggers(triggers){
    this.trigger = [...this.trigger, ...triggers]
    return this
  }
  outEvent(event,cb,triggerIndex){
    this.trigger[triggerIndex].addEventListener(event,cb)
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
const declare = (animation) => {
  let finalName = getValidName(animation);
  animation.name = finalName
  instances[finalName] = animation;
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



