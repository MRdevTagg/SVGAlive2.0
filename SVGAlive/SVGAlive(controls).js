export const $ = (el) => document.querySelector(el);
export const $$ = (el) => document.querySelectorAll(el);
export const tag = (el) => document.getElementsByTagName(el);
const valid = (prop, validProps, propName) => {
  if (prop) {
    const filter = validProps.filter((validProp) => validProp === prop);
    if (filter.length === 0) {
      console.error(`setted to default :
"${prop}" is an invalid prop
you must pass ${JSON.stringify(validProps).split(",").join(` or `).replace("[", "").replace("]", "")} as "${propName}" value`);
      return null;
    } else return prop;
  }
};
const validPlaymode = (mode) => valid(mode, ["ff", "rew"], "playmode");
const validLoopmode = (mode) =>
  valid(mode, ["ff", "rew", "pingpong"], "loopmode");

export const instances = {};
export class Animated {
  #object;
  #parent;
  #frames;
  #triggers;
  #mode;
  #playmode = "ff";
  #toToggle = false
  #loop;
  #loopMode = "pingpong";
  isPlaying = false;
  firstPlay = true;
  #current = 0;
  #previous = null;
  #maxFrames;
  #direction = 1;
  #frameID = null;
  #lastFrameTime = null;
  #lap;
  #name;
  #fps;
  #stages;
  #stageName;

  #_askStage; // to ask for a stage change in the loop and trigger the setStage function
  #condition = () => this.#current <= this.#stages[this.#stageName].max;
  #limitMIN = (frame = this.#current, stageName = this.#stageName) => frame >= this.#stages[stageName].min;
  #LimitMAX = (frame = this.#current, stageName = this.#stageName) => frame <= this.#stages[stageName].max;
  #reachPoint = (frame) => this.#current === frame;
  betweenLimits(frame = this.#current, stageName = this.#stageName) {
    return !this.#LimitMAX(frame, stageName) || !this.#limitMIN(frame, stageName);
  }

  constructor({
    object,
    triggers,
    min,
    max,
    fps,
    loop,
    loopmode,
    playmode,
    initialFrame,
    name,
  }) {
    //related DOMElements
    this.#object = object;
    this.#parent = object.contentDocument.querySelector(`svg`);
    this.#frames = [...this.#parent.querySelectorAll("svg")];
    this.#triggers = triggers || [this.#parent];
    //playmodes and loopmodes
    this.#loop = loop || false;
    this.#loopMode = validLoopmode(loopmode) || "ff";
    this.#playmode = validPlaymode(playmode) || "ff";
    //Frames and timing related
    this.#maxFrames = this.#frames.length - 1
    this.#fps = (fps < 120 && fps) || 24;
    this.min = (min >= 0 && min) || 0;
    this.max = (max <= this.#maxFrames && max) || this.#maxFrames;
    this.skip = false;
    this.#mode = this.#loop && this.#loopMode !== "pingpong" ? this.#loopMode : this.#playmode;
    this.#current = initialFrame;
    this.#stages = {
    'initial': {
      min : this.min, 
      max : this.max,
      id : 1},
    'last-half' :{
      min : this.max /2 ,
      max: this.max, 
      id:2, },
    'quarter':{
      min: this.max / 2,
      max: this,max
    }
    }
    this.#stageName = 'initial'
    
    this.updateStages = (stageID = 0) => {
      for (const key in this.#stages) {
        stageID++;
        stages[key].id = stageID;
      }
    }
    // must pass an array of one or more stage objects including a prop called name with a string for the name
    this.addStages = (stages)=> {
      if(!stages || stages.length === 0) return
      stages.map(({name,min,max}) => {
      stages[name] = {min , max}
      })
      this.updateStages();
    }
    this.setStage = (name)=> {
    this.#stages[name] && this.betweenLimits(this.#current, name) && (this.#stageName = name);
    console.log(this.#stages)
    return this
    }
    this.afterDraw = null;
    this.beforeDraw = null;

    this.#name = declare(this, name || null);
    this.#awake(initialFrame);
  }


  //GETTERS
  getObject() { return this.#object; }
  getCurrent() { return this.#current; }
  getParent() { return this.#parent; }
  getName() { return this.#name; }
  getFPS() { return this.#fps; }

  // PRIVATE METHODS
  #setEnding(mode = this.#loopMode) {
    const modes = {
      ff: () => (this.#current = this.#stages[this.#stageName].min),
      pingpong: () => {
        this.#previous = null;
        this.toggle();
      },
      rew: () => (this.#current = this.#stages[this.#stageName].max),
    };
    return modes[mode] && modes[mode]();
  }
  #setCondition() {
    const mode = {
      ff: () => {
        this.#direction = 1;
        this.#condition = () => this.#LimitMAX();
      },
      rew: () => {
        this.#direction = -1;
        this.#condition = () => this.#limitMIN();
      },
    };
    return mode[this.#playmode]();
  }
  #awake(initial) {
    if (!initial || initial > this.#stages[this.#stageName].max || initial < this.#stages[this.#stageName].min) {
      this.#mode === "ff"
        ? (this.#current = this.#stages[this.#stageName].min)
        : (this.#current = this.#stages[this.#stageName].max);
    }
    this.#frames[this.#current]?.setAttribute("display", "block");
    console.log( `${this.#name} is awake on "${this.#mode}" mode at frame ${this.#current}`)
  }
  #update() {
    if (!this.isPlaying) return;
    const framesToDraw = Math.floor(
      (performance.now() - this.#lastFrameTime) / (1000 / this.#fps)
    );

    this.#animate(framesToDraw);

    this.#frameID = requestAnimationFrame(this.#update.bind(this));
  }
  #animate(framesToDraw) {
    for (let i = 0; i < framesToDraw; i++) {
      this.#lastFrameTime += 1000 / this.#fps;
      typeof this.beforeDraw === "function" && this.beforeDraw(this);
      this.#play();
      typeof this.afterDraw === "function" && this.afterDraw(this);
    }
  }
  #play() {
    this.#condition()
      ? this.#draw()
      : this.#loop
      ? this.#setEnding()
      : this.stop();
  }
  #draw() {
    if (!this.skip) {
      this.#frames[this.#previous]?.setAttribute("display", "none");
      this.#frames[this.#current]?.setAttribute("display", "block");
      // in the next round the rendered frame will be the previous
      this.#previous = this.#current;
      this.betweenLimits && (this.#current += this.#direction);
    }
    this.skip === true && (this.skip = false);
  }
  // PUBLIC METHODS

  start() {
    if (!this.isPlaying) {
      this.firstPlay && (this.firstPlay = false);
      this.isPlaying = true;
      this.#lastFrameTime = performance.now();
      this.#update();
    }
    return this;
  }
  stop() {
    if (this.isPlaying) {
      cancelAnimationFrame(this.#frameID);
      this.#loop = false;
      this.isPlaying = false;
      this.#previous = this.#current
      this.#lastFrameTime = null;
    }
    return this;
  }
  pause(){
    this.isPlaying && (this.isPlaying = false)
  }
  toggle() {
    this.#toToggle = true;
    if (!this.firstPlay) {
      /// to prevent rendering two frames at the same time before direction is switched
      !this.isPlaying || this.betweenLimits() && (this.#previous = null);
      !this.#loop || this.#loopMode === "pingpong"
        ? this.#playmode === "ff"
          ? this.setPlay("rew")
          : this.setPlay("ff")
        : this.#loopMode === "ff"
        ? this.setLoop("rew")
        : this.setLoop("ff");
    }
    !this.isPlaying && this.start();
    return this;
  }
  setPlay(playmode) {
    validPlaymode(playmode) && (this.#playmode = playmode);
    this.#setCondition();
    return this;
  }
  setLoop(loopmode) {
    loopmode && !this.#loop && (this.#loop = true);
    validLoopmode(loopmode) && (this.#loopMode = loopmode);
    this.#loopMode !== "pingpong" && this.setPlay(loopmode);
    this.#setCondition();
    return this;
  }
  setFPS(fps) {
    fps && fps <= 120 && fps >= 0 && (this.#fps = fps);
    return this;
  }
  addTriggers(triggers) {
    this.#triggers = [...this.#triggers, ...triggers];
    return this;
  }
  outEvent(event, cb, triggerIndex = 0) {
    this.#triggers[triggerIndex].addEventListener(event, cb);
    return this;
  }
  goToFrame(frame, play = true) {
    this.#frames[this.#previous]?.setAttribute("display", "none");
    this.#frames[this.#current]?.setAttribute("display", "none");
    this.previous = null;
    this.#current = frame;
    this.#draw();
    !play && this.stop();
    return this;
  }
  reach(point) {
    if (
      typeof point === "number" &&
      point >= 0 &&
      point <= this.#maxFrames
    )
      return this.#reachPoint(point);
    else if (
      typeof point === "string" &&
      (point === "max" || point === "min") || point === 'middle'
    ) {
      const mode = {
        max: () => this.#limitMIN(),
        min: () => this.#LimitMAX(),
        middle : () => { return this.#current === this.#stages[this.#stageName].max / 2 }
      };
      return mode[point]();
    } else
      return console.error(
        'you must pass a valid frame number or "max" or "min"'
      );
  }
}

const SVGAliveError = (object) => {
  return `
    Error:${
      object instanceof HTMLObjectElement
        ? "Object reference alredy declared in an existing Animated instance"
        : "The element reference must be a HTMLObjectElement"
    }
    Resolution: It won't be created
    Advice: Remove useless instantiation
    Instances: ${JSON.stringify(getArray().map((el) => el.name))}
    data-path:  ${object.getAttribute("data")}
    obect:  ${JSON.stringify(object)}`
};
const evaluate = (obj, options) => {
  if (obj instanceof HTMLObjectElement === false)
    return console.error(SVGAliveError(obj));
  const fltr = getArray().filter((anim) => anim.getObject() === obj);
  if (fltr.length > 0 || obj instanceof HTMLObjectElement === false ) return console.error(SVGAliveError(obj));
  else return new Animated({ object: obj, ...options });
};
const getValidName = (animation, name) => {
  const validName =
    name ||
    animation.getObject().getAttribute("data").split("/").pop().split(".").slice(0, -1).join(".").replace(/[^a-zA-Z0-9_]/g, "_");
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
};
const declare = (instance, name) => {
  let finalName = getValidName(instance, name);
  instances[finalName] = instance;
  return finalName;
};


export const setOne = (obj, options) => evaluate(typeof obj === "string" ? $(obj) : obj, options);
export const setMany = (objs, options) =>{
  const objects = typeof objs === "string" ? $$(objs) : objs
  objects.forEach((obj) => evaluate(obj, options))
};

export const getByObject = (obj) =>
  getArray().filter((anim) => anim.getObject() === obj)[0];
export const getThem = (name = null) => (!name ? instances : instances[name]);
export const getArray = (filter = null, cb) => {
  const arrayToReturn = [];
  for (const key in instances) {
    filter
      ? key.includes(filter) && arrayToReturn.push(instances[key])
      : arrayToReturn.push(instances[key]);
  }
  cb && arrayToReturn.map((anim, i, arr) => cb(anim, i, arr));
  return arrayToReturn;
};
