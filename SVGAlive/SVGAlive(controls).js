export const animationsAll = {};
export class Animated {
  constructor({ object, min, max, fps, loopMode, playmode, loop, toggle }) {
    this.object = object;
    this.parent = object.contentDocument.querySelector(`svg`);
    this.frames = [...this.parent.querySelectorAll("svg")];
    this.fps = fps || 104;
    this.loop = loop || false;
    this.toggleOn = toggle || false;
    this.min = (min >= 0 && min) || 0;
    this.playmode = playmode || "ff";
    this.loopMode = loopMode || "pingpong";
    this.max = (max <= this.frames.length - 1 && max) || this.frames.length - 1;
    this.isPlaying = false;
    this.direction = 0;
    this.current = 0;
    this.previous = null;

    this.condition = () => this.current <= this.max;
    this.reachStart = () => this.current >= this.min;
    this.reachEnd = () => this.current <= this.max;
    this.reachPoint = (frame) => this.current === frame;

    this.frameID = null;
    this.lastFrameTime = null;
    createAnimated(this);
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


  start({toggle = null, loop = null} = null) {
    loop && (this.loop = loop);
    toggle && (this.toggleOn = toggle);
    this.toggleOn && this.toggle();
    if (!this.isPlaying) {
      this.isPlaying = true;
      
      this.setInitialState();
      this.draw();
      this.lastFrameTime = performance.now();
      this.animate();
    }
  }
  
  setInitialState() {
    
    this.loop && this.loopMode !== "pingpong" && (this.playmode = this.loopMode);
    if (!this.loop && !this.toggleOn) {
      this.frames[this.current].setAttribute("display", "none");
      this.playmode === "ff" ? (this.current = this.min) : (this.current = this.max);
    }
  }

  animate() {
    if (!this.isPlaying) return;
    const framesToDraw = Math.floor(
      (performance.now() - this.lastFrameTime) / (1000 / this.fps)
    );

    for (let i = 0; i < framesToDraw; i++) {
      this.lastFrameTime += 1000 / this.fps;
      this.play();
    }

    this.frameID = requestAnimationFrame(this.animate.bind(this));
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
    this.lastFrameTime = null;
  }
  toggle(){
    this.previous = null;
    this.playmode === "ff" ? this.playmode = "rew" : this.playmode = "ff";
   
  }
}
const createAnimated = (animation) => {
  let name = animation.object.getAttribute('data').split('/').pop().split('.').slice(0,-1).join('.').replace(/[^a-zA-Z0-9_]/g, '_');
  for (const key in animationsAll) {
    if (key === name) {
      let prefix = 1;
      while (animationsAll[name + "_" + prefix]) {
        prefix++;
      }
      name += "_" + prefix;
    }
  }
  animationsAll[name] = animation;
};
export const createOne = (idOrClassName,options) => new Animated({ object : document.querySelector(idOrClassName), ...options });
export const createMany = (className,options) => 	document.querySelectorAll(className).forEach(anim=> new Animated({object:anim, ...options }));

export const getOne = (id) => getAll()[id]
export const getAll = () => animationsAll;
export const getArray = (filter = null, cb) => {
  const arrayToReturn = [];
  for (const key in animationsAll) {
    filter
      ? key.includes(filter) && arrayToReturn.push(animationsAll[key])
      : arrayToReturn.push(animationsAll[key]);
  }
  cb && arrayToReturn.map( anim => cb(anim))
  return arrayToReturn;
}


