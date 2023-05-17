export const $ = el => document.querySelector(el);
export const $$ = el => document.querySelectorAll(el);
export const tag = el => document.getElementsByTagName(el);


export const animationsAll = {};
export class Animated {
  constructor({ object,trigger, min, max, fps, loopMode, playmode, loop, toggle }) {
//related DOMElements
    this.name;
    this.object = object;
    this.parent = object.contentDocument.querySelector(`svg`);
    this.trigger = trigger || [this.parent]
//playmodes and loopmodes   
    this.loop = loop || false;
    this.toggleOn = toggle || false;
    this.playmode = playmode || "ff";
    this.loopMode = loopMode || "pingpong";
//Frames and timing related
    this.frames = [...this.parent.querySelectorAll("svg")];
    this.fps = (fps < 60 && fps) || 60;
    this.min = (min >= 0 && min) || 0;
    this.max = (max <= this.frames.length - 1 && max) || this.frames.length - 1;
    this.isPlaying = false;
    this.direction = 1;
    this.current = 0;
    this.previous = null;
    this.skip = false;

    this.condition = () => this.current <= this.max;
    this.reachStart = () => this.current >= this.min;
    this.reachEnd = () => this.current <= this.max;
    this.reachPoint = (frame) => this.current === frame;

    this.firstPlay = true;
    this.frameID = null;
    this.lastFrameTime = null;

    declare(this);
  }

  addTriggers(triggers){
    this.trigger = [...this.trigger, ...triggers]
  }
  outEvent(event,cb,triggerIndex){
    this.trigger[triggerIndex].addEventListener(event,cb)
  }
  setLoop() {
     const mode = {
      ff : () => (this.current = this.min),
      pingpong : () => {
        this.toggle()
      },
      rew : () => (this.current = this.max),
    };
		return mode[this.loopMode] && mode[this.loopMode]()
  }
  setPlay() {
  const mode = {
  "ff":()=>{
        this.direction = 1;
        this.condition = () => this.reachEnd();
	},
   "rew":()=>{
        this.direction = -1;
        this.condition = () => this.reachStart();
	 }
    }
		return mode[this.playmode] && mode[this.playmode]()
  }
  setPlayMode( playmode ) {
    console.log('awake')
    playmode && (this.playmode = playmode);
    if(this.firstPlay){
      this.frames[this.current]?.setAttribute("display", "none");
      this.playmode === "ff" && (this.current = this.min);
      this.playmode === "rew" && (this.current = this.max);
      this.draw();
    }
  }
  setLoopMode( loopmode ) {
    loopmode && (this.loopmode = loopmode);

    if(this.firstPlay){
      this.frames[this.current]?.setAttribute("display", "none");
      this.loopmode === "ff" && (this.current = this.min);
      this.loopmode === "rew" && (this.current = this.max);
      this.draw();
    }
  }


  start({toggle = false, loop = false} = null) {
    loop && (this.loop = loop);
    toggle && (this.toggleOn = toggle);
    this.toggleOn && this.toggle();
    this.firstPlay && this.awake();
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastFrameTime = performance.now();
      this.animate();
    }
  }
  awake() {
      this.setPlayMode();
      this.setLoopMode()
      this.firstPlay = false;
  }
  fixedUpdate(){
 this.loop && this.loopMode !== "pingpong" && (this.playmode = this.loopMode);
  }
  animate() {
    if (!this.isPlaying) return;
    const framesToDraw = Math.floor(
      (performance.now() - this.lastFrameTime) / (1000 / this.fps)
    );
    this.fixedUpdate()

    this.update(framesToDraw);

    this.frameID = requestAnimationFrame(this.animate.bind(this));
  }
  update(framesToDraw) {
    for (let i = 0; i < framesToDraw; i++) {
      this.lastFrameTime += 1000 / this.fps;
      this.play();
    }
  }
  play() {
    this.setPlay();
    this.condition() ? this.draw()
    : this.loop ? this.setLoop()
    : this.stop();
  }
  draw() {
    this.frames[this.previous]?.setAttribute("display", "none");
    this.frames[this.current]?.setAttribute("display", "initial");
    this.previous = this.current;
    this.current += this.direction;
  }
  stop() {
    cancelAnimationFrame(this.frameID);
    this.isPlaying = false;
    this.previous = null
    this.lastFrameTime = null;
  }
  toggle(){
    if(!this.firstPlay){
      !this.isPlaying || this.loop && !this.reachEnd() || !this.reachStart() && (this.previous = null);
      this.current === this.min && (this.playmode = 'ff');
      this.current === this.max && (this.playmode = 'rew');
      this.playmode === "ff" ? this.playmode = "rew" : this.playmode = "ff";
    }
  }
}

const SVGAliveError = (object) =>{
  return`
    error: Object reference alredy declared in an existing Animated instance
    resolution: It won't be created
    advice: Remove useless instantiation
    instances: ${JSON.stringify(getArray().map(el => el.name))}
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
  for (const key in animationsAll) {
    if (key === validName) {
      let prefix = 1;
      while (animationsAll[`${validName}_${prefix}`]) {
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
  animationsAll[finalName] = animation;
};

export const setOneDOM = (obj,options) => evaluate( obj, options );
export const setManyDOM = (objs,options) => objs.forEach( anim => evaluate(anim, options));
export const setOne = (idOrClassName,options) => evaluate($(idOrClassName), options);
export const setMany = (className,options) => $$(className).forEach( anim => evaluate(anim,options));

export const getByObject = (obj)=> getArray().filter( anim => anim.object === obj )[0]
export const getThem = (name = null) => !name ? animationsAll : animationsAll[name];
export const getArray = (filter = null, cb) => {
  const arrayToReturn = [];
  for (const key in animationsAll) {
    filter
      ? key.includes(filter) && arrayToReturn.push(animationsAll[key])
      : arrayToReturn.push(animationsAll[key]);
  }
  cb && arrayToReturn.map( (anim,i,arr) => cb(anim,i,arr))
  return arrayToReturn;
}



