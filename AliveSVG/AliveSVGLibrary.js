export const $ = (el) => document.querySelector(el);
export const $$ = (el) => document.querySelectorAll(el);
export const tag = (el) => document.getElementsByTagName(el);
const valid = (prop, validProps, propName) => {
  if (prop) {
    const filter = validProps.filter((validProp) => validProp === prop);
    if (filter.length === 0) {
      console.error(`setted to default :
"${prop}" is an invalid prop
you must pass ${JSON.stringify(validProps)
        .split(",")
        .join(` or `)
        .replace("[", "")
        .replace("]", "")} as "${propName}" value`);
      return null;
    } else return prop;
  }
};
const validPlaymode = (mode) => valid(mode, ["ff", "rew"], "playmode");
const validLoopmode = (mode) =>
  valid(mode, ["ff", "rew", "toggle"], "loopmode");

export const instances = {};
export class AliveSvgInstance {
  #name; // string name of the instance (it will be setted when the instance gets declared)
  #object; // HTMLObjectElement associated with this instance
  #parent; // parent svg element
  #frames; // array of svgs childs (frames)
  #triggers; // array of DOM nodes that could trigger and modify the animation behavior

  #playmode = "ff"; // animation play mode
  #loop; // boolean indicating if animation looping should be enabled
  #loopMode; // animation loop mode
  #isPlaying = false; // boolean indicating if animation is playing
  #paused = false; // boolean indicating if the animation is paused
  firstPlay = true; // boolean indicating if it is the first time the animation is played
  #current = 0; // number of current frame
  #previous = null; // number of previous frame
  #maxFrames; // number for max frames posible
  #direction = 1; // direction in wich animation runs
  #lap = 0; // number that indicates the times the animation was played
  #fps; // number speed of animation

  #frameID = null; // ID for the requestAnimation frame
  #lastFrameTime = null; // time since the last frame was drawed

  #stages; // object that hold the stages (each stage will establish the MIN and MAX frames limit)
  #stageName; // name of the current stage that will be used to access the stage objects inside #stages as it's key
  #_askStage; // boolean to ask for a stage change in the animationloop and trigger the setStage function
  #_requestedStageName; // string to hold the name of the requested stage
  #_changeStageOnLap; // number that indicates the lap number to change the stage (when)

  #setStage = (name) => {
    const condition = this.#_changeStageOnLap
      ? this.#lap === this.#_changeStageOnLap
      : true;
    if (condition) {
      if (this.#onLimits(this.#current, name)) {
        this.#stages[name]
          ? (this.#stageName = name)
          : console.error("you must pass a valid stage name");
        this.#_askStage = false;
        this.#_requestedStageName = null;
        this.#_changeStageOnLap = null;
      }
    }
    return this;
  };
  #drawCondition = () => this.#current <= this.#stages[this.#stageName].max;
  #limitMIN = (frame = this.#current, stageName = this.#stageName) =>
    frame >= this.#stages[stageName].min;
  #LimitMAX = (frame = this.#current, stageName = this.#stageName) =>
    frame <= this.#stages[stageName].max;
  #reachMIN = (frame = this.#current, stageName = this.#stageName) =>
    frame === this.#stages[stageName].min;
  #reachMAX = (frame = this.#current, stageName = this.#stageName) =>
    frame === this.#stages[stageName].max;
  #reachPoint = (frame) => this.#current === frame;
  #onLimits = (frame = this.#current, stageName = this.#stageName) =>
    this.#playmode === "ff"
      ? this.#reachMIN(frame, stageName)
      : this.#reachMAX(frame, stageName);
  #betweenLimits = (frame = this.#current, stageName = this.#stageName) => {
    return (
      !this.#LimitMAX(frame, stageName) || !this.#limitMIN(frame, stageName)
    );
  };

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
    stages,
    name,
  }) {
    //related DOMElements
    this.#object = object;
    this.#parent = object.contentDocument.querySelector(`svg`);
    this.#frames = [...this.#parent.querySelectorAll("svg")];
    this.#triggers = triggers || [this.#parent];
    //playmodes and loopmodes
    this.#loop = loop || false;
    this.#loopMode = validLoopmode(loopmode) || null;
    this.#playmode = validPlaymode(playmode) || "ff";
    //Frames and timing related
    this.#maxFrames = this.#frames.length - 1;
    this.#fps = (fps <= 120 && fps) || 24;
    this.min = (min >= 0 && min) || 0;
    this.max = (max <= this.#maxFrames && max) || this.#maxFrames;
    this.#current = initialFrame;

    this.#stages = stages || {
      initial: {
        name: "initial",
        min: this.min,
        max: this.max,
      },
      "last-half": {
        name: "last-half",
        min: this.max / 2,
        max: this.max,
      },
      quarter: {
        name: "quarter",
        min: this.max / 4,
        max: this.max,
      },
    };
    this.#stageName = "initial";
    this.afterDraw = null;
    this.beforeDraw = null;

    this.#name = declare(this, name || null);
    this.#awake(initialFrame);
  }

  //GETTERS
  getObject() {
    return this.#object;
  }
  getFrames() {
    return this.#frames;
  }
  getMaxFrames() {
    return this.#maxFrames + 1;
  }
  getCurrent() {
    return this.#current + 1;
  }
  getParent() {
    return this.#parent;
  }
  getName() {
    return this.#name;
  }
  getSource() {
    return { 
      name :this.getObject()
      .getAttribute("data")
      .split("/")
      .pop()
      .split(".")
      .slice(0, -1)
      .join(".")
      .replace(/[^a-zA-Z0-9_]/g, "_"),
      path:this.getObject().getAttribute("data")
    }
  }
  getFPS() {
    return this.#fps;
  }
  getLAP() {
    return this.#lap;
  }
  getPlaymode() {
    return this.#playmode;
  }
  getLoopmode() {
    return this.#loopMode;
  }
  getLoop() {
    return this.#loop;
  }
  getPlayState() {
    return this.#isPlaying;
  }
  getPauseState() {
    return this.#paused;
  }
  getStages() {
    return this.#stages;
  }
  getTriggers() {
    return this.#triggers;
  }
  getRects() {
    return this.getObject().getBoundingClientRect();
  }

  // SETTERS
  setPlayMode(playmode) {
    if (validPlaymode(playmode)) {
      this.#playmode = playmode;
      this.#loop && this.#loopMode !== "toggle" && (this.#loopMode = playmode);
    }

    this.#setDirection();
    return this;
  }
  setLoopMode(loopmode) {
    if (!validLoopmode(loopmode)) return this;
    !this.#loop && (this.#loop = true);
    this.#loopMode = loopmode;
    this.#loopMode !== "toggle" && this.setPlayMode(loopmode);
    this.#setDirection();
    return this;
  }
  setFPS(fps) {
    fps && fps <= 120 && fps >= 0 && (this.#fps = fps);
    return this;
  }
  setLoop(setTo) {
    setTo !== undefined ? (this.#loop = setTo) : (this.#loop = !this.#loop);
    this.#loop && !this.#loopMode && this.setLoopMode(this.#playmode)
  }

  // ACTIONS
  start() {
    if (!this.#isPlaying) {
      this.firstPlay && (this.firstPlay = false);
      this.#isPlaying = true;
      this.#lastFrameTime = performance.now();
      this.#update();
    }
    return this;
  }
  restart() {
    this.firstPlay && this.start();
    if (!this.#isPlaying) {
      this.#setEnding(this.#playmode);
      this.start();
    }
  }
  stop() {
    if (this.#isPlaying) {
      cancelAnimationFrame(this.#frameID);
      this.#draw();
      this.#loop = false;
      this.#lap = 0;
      this.#isPlaying = false;
      this.#lastFrameTime = null;
    }
    return this;
  }
  pause() {
    this.#paused ? (this.#paused = false) : (this.#paused = true);
  }
  toggle(on = true) {
    if (!this.firstPlay) {
      /// to prevent rendering two frames at the same time before direction is switched
      !this.#isPlaying || (this.#betweenLimits() && (this.#previous = null));

      this.#playmode === "ff"
        ? this.setPlayMode("rew")
        : this.setPlayMode("ff");
    }
    !this.#isPlaying && on && this.start();
    return this;
  }

  // ADVANCED INTERACTIONS
  addTriggers(triggers) {
    this.#triggers = [...this.#triggers, ...triggers];
    return this;
  }
  outEvent(event, cb, triggerIndex = 0) {
    this.#triggers[triggerIndex].addEventListener(event, cb);
    return this;
  }
  // must pass an array with one or more stage objects : {min : 0, max ; 15, name : "stagename"}
  addStages(stages) {
    if (!stages || stages.length === 0) return;
    stages.map(({ name, min, max }) => {
      this.#stages[name] = { min, max, name };
    });
    return this;
  }
  requestStage(name, onLap) {
    this.#_askStage = true;
    this.#_requestedStageName = name;
    onLap && (this.#_changeStageOnLap = onLap);
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
    if (typeof point === "number" && point >= 0 && point <= this.#maxFrames)
      return this.#reachPoint(point);
    else if (point === "max" || point === "min" || point === "half") {
      const mode = {
        max: () => this.#limitMIN(),
        min: () => this.#LimitMAX(),
        half: () => {
          return this.#current === this.#stages[this.#stageName].max / 2;
        },
      };
      return mode[point]();
    } else
      return console.error(
        'you must pass a valid frame number or "max" or "min" or "half"'
      );
  }
  reachLAP(lap) {
    return this.#lap === lap;
  }

  // INTERNAL METHODS

  #setEnding(mode = this.#loopMode) {
    this.#loop && this.#lap++;
    this.#draw();
    const modes = {
      ff: () => (this.#current = this.#stages[this.#stageName].min),
      toggle: () => {
        this.toggle();
        this.#draw()
      },
      rew: () => (this.#current = this.#stages[this.#stageName].max),
    };

    return modes[mode] && modes[mode]();
  }
  #setDirection() {
    const mode = {
      ff: () => {
        this.#direction = 1;
        this.#drawCondition = () => !this.#reachMAX();
      },
      rew: () => {
        this.#direction = -1;
        this.#drawCondition = () => !this.#reachMIN();
      },
    };
    return mode[this.#playmode]();
  }
  #awake(initial) {
    const mode =
      this.#loop && this.#loopMode !== "toggle"
        ? this.#loopMode
        : this.#playmode;
    if (
      !initial ||
      initial > this.#stages[this.#stageName].max ||
      initial < this.#stages[this.#stageName].min
    ) {
      mode === "ff"
        ? (this.#current = this.#stages[this.#stageName].min)
        : (this.#current = this.#stages[this.#stageName].max);
      this.#previous = this.#current;
    }
    this.#frames[this.#current]?.setAttribute("display", "block");
    this.#setDirection(mode);
    // console.log(
    //   `${this.#name} is awake on "${mode}" mode at frame ${this.#current}`
    // );
  }
  #update() {
    if (!this.#isPlaying) return;

    const framesToDraw = Math.floor(
      (performance.now() - this.#lastFrameTime) / (1000 / this.#fps)
    );
    this.#animate(framesToDraw);

    this.#frameID = requestAnimationFrame(this.#update.bind(this));
  }
  #animate(framesToDraw) {
    for (let i = 0; i < framesToDraw; i++) {
      this.#lastFrameTime += 1000 / this.#fps;
      if (!this.#paused) {
        typeof this.beforeDraw === "function" && this.beforeDraw(this);
        this.#play();
        typeof this.afterDraw === "function" && this.afterDraw(this);
        this.#_askStage && this.#setStage(this.#_requestedStageName);
      }
    }
  }
  #play() {
    this.#drawCondition()
      ? this.#draw()
      : this.#loop
      ? this.#setEnding()
      : this.stop();
  }
  #draw() {
    this.#frames[this.#previous]?.setAttribute("display", "none");
    this.#frames[this.#current]?.setAttribute("display", "block");
    // in the next round the rendered frame will be the previous
    this.#previous = this.#current;
    !this.#betweenLimits(this.#current + 1 * this.#direction) &&
      (this.#current += this.#direction);
  }
}

const AliveSVGError = (object) => {
  return `
    Error:${
      object instanceof HTMLObjectElement
        ? "Object element is alredy asociated to an existing Animated instance"
        : "The element reference must be a HTMLObjectElement"
    }
    Resolution: It won't be created
    Advice: Remove useless instantiation
    data-path:  ${object.getAttribute("data")}`
};
const evaluate = (obj, options) => {
  if (obj instanceof HTMLObjectElement === false)
    return console.error(AliveSVGError(obj));
  const fltr = getArray().filter((anim) => anim.getObject() === obj);
  if (fltr.length > 0 || obj instanceof HTMLObjectElement === false)
    return console.error(AliveSVGError(obj));
  else return new AliveSvgInstance({ object: obj, ...options });
};
const getValidName = (animation, name) => {
  const validName =
    name ||
    animation
      .getObject()
      .getAttribute("data")
      .split("/")
      .pop()
      .split(".")
      .slice(0, -1)
      .join(".")
      .replace(/[^a-zA-Z0-9_]/g, "_");
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

export const setOne = (obj, options) =>
  evaluate(typeof obj === "string" ? $(obj) : obj, options);
export const setMany = (objs, options) => {
  const objects = typeof objs === "string" ? $$(objs) : objs;
  objects.forEach((obj) => evaluate(obj, options));
};

export const getByObject = (obj) =>
  obj instanceof HTMLObjectElement === true &&
  getArray().filter((anim) => anim.getObject() === obj)[0];
export const getThem = (name = null) => (!name ? instances : instances[name]);
export const getArray = (filter = null, cb) => {
  const array = [];
  for (const key in instances) {
    filter
      ? key.includes(filter) && array.push(instances[key])
      : array.push(instances[key]);
  }
  cb && array.map((anim, i, arr) => cb(anim, i, arr));
  return array;
};
