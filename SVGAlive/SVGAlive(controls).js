




const SetwidthAndHeight = (frame, w, h) => {
  if (!w) {
    return;
  }
  const aspectRatio = frame.getAttribute('height') / frame.getAttribute('width');
  frame.setAttribute('width', w);
  frame.setAttribute('height', h || w * aspectRatio);
}

const fixViewBox = (frame) => {
  const { xMin, xMax, yMin, yMax } = [...frame].reduce((acc, el) => {
    const { x, y, width, height } = el.getBBox();
    if (!acc.xMin || x < acc.xMin) acc.xMin = x;
    if (!acc.xMax || x + width > acc.xMax) acc.xMax = x + width;
    if (!acc.yMin || y < acc.yMin) acc.yMin = y;
    if (!acc.yMax || y + height > acc.yMax) acc.yMax = y + height;
    return acc;
  }, {});

  return `${xMin} ${yMin} ${xMax - xMin} ${yMax - yMin}`;
}

export const setSize = (parent, frames, w, h) => {
  frames.forEach(frame => frame.setAttribute('display', 'initial'));
  const viewbox = fixViewBox(frames);
  frames.forEach((frame, i) => {
    SetwidthAndHeight(frame, w, h);
    frame.setAttribute('viewBox', viewbox);
    frame.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    if (i > 0) {
      frame.setAttribute('display', 'none');
    }
  });
  parent.setAttribute('width', w || frames.reduce((acc, frame) => Math.max(acc, frame.getAttribute('width')), 0));
  parent.setAttribute('height', frames.reduce((acc, frame) => Math.max(acc, frame.getAttribute('height')), 0));
}


export class Animated {
	constructor({object,min,max,fps,loopMode,playmode,loop,toggle})
	{
		this.object = object;
		this.parent = object.contentDocument.querySelector(`svg`);
		this.frames = [...this.parent.querySelectorAll('svg')];
		this.fps = fps || 104;
		this.loop = loop || false;
		this.toggle = toggle || true;
		this.min = (min >= 0 && min) || 0;
		this.playmode = playmode || 'rew';
		this.loopMode = loopMode || 'pingpong';
		this.max = max <= this.frames.length-1 && max || this.frames.length-1; 
		this.isPlaying = false;
		this.direction = 0;
		this.current = 0;
		this.previous = 0;
		this.condition = () => this.current < this.max;
		this.reachStart = () => this.current > this.min;
		this.reachEnd = () => this.current < this.max;
		this.reachPoint = (frame) => this.current === frame;

		this.animationFrameId = null;
		this.lastFrameTime = null;
		setSize(this.parent,this.frames)
	}

	setPlaymode() {
		switch (this.playmode) {
			case 'ff':
				this.direction = 1;
				this.condition = () => this.reachEnd();
				break;
			case 'rew':
				this.direction = -1;
				this.condition = () => this.reachStart();
				break;
		}
	}

	draw(){
    this.previous = this.current;
		this.frames[this.previous]?.setAttribute('display', 'none');	
    this.current += this.direction;
    this.frames[this.current]?.setAttribute('display', 'initial');
}

	start() {
		if (!this.isPlaying) {
			this.isPlaying = true;
			!this.loop && this.toggle ? (this.playmode === 'ff' ? 
			this.playmode = 'rew' : this.playmode = 'ff' )
			: this.playmode === 'ff' ? this.current = this.min
			: this.current = this.max
			this.lastFrameTime = performance.now();
			this.animate();
		}
	}

	stop() {
		cancelAnimationFrame(this.animationFrameId);
		this.isPlaying = false;
		this.lastFrameTime = null;
	}

	animate() {
    if (!this.isPlaying) return;
    const framesToDraw = Math.floor((performance.now() - this.lastFrameTime) / (1000 / this.fps));
 
    for (let i = 0; i < framesToDraw; i++) {
        this.lastFrameTime += 1000 / this.fps;
        this.play();
    }

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
}

	play() {
		this.setPlaymode();
		this.condition() ? this.draw() :
		this.loop ? this.setLoopmode() :
		this.stop();
	}

	setLoopmode() {
		this.stop()
		switch (this.loopMode) {
			case 'ff':
				this.current = this.min;
				this.playmode = 'ff';
				break;
			case 'pingpong':
				this.playmode === 'ff' ? this.playmode = 'rew' : this.playmode = 'ff';
				break;
			case 'rew':
				this.current = this.max;
				this.playmode = 'rew';
				break;

			default:
				break;
		}
		this.start()
	}
}

//JS ONLY


export const createAnim = async({ref,name,id,parent = document.querySelector('body'),path = null})=>{
	if(name && id){
		const obj = document.createElement('object')
		obj.setAttribute('type','image/svg+xml')
		obj.setAttribute('data', path ? path : `SVGAlive/sources/${name}.svg`)
		parent.appendChild(obj)
		console.log(obj)
		const tempAnim = new Animated({object:obj})
		const newObj = {id : tempAnim};
		return { ...ref, newObj }

	}else{console.log('you must pass at least a name to the createAnim function')}
}