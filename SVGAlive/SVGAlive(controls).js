





export class Animated {
	constructor({ object,min,max,fps,loopMode,playmode,loop,toggle })
	{
		this.object = object;
		this.parent = object.contentDocument.querySelector(`svg`);
		this.frames = [...this.parent.querySelectorAll('svg')];
		this.fps = fps || 104;
		this.loop = loop || false;
		this.toggle = toggle || false;
		this.min = (min >= 0 && min) || 0;
		this.playmode = playmode || 'ff';
		this.loopMode = loopMode || 'pingpong';
		this.max = max <= this.frames.length-1 && max || this.frames.length-1; 
		this.isPlaying = false;
		this.direction = 0;
		this.current = 0;
		this.previous = null;

		this.condition = () => this.current <= this.max;
		this.reachStart = () => this.current >= this.min;
		this.reachEnd = () => this.current <= this.max;
		this.reachPoint = (frame) => this.current === frame;

		this.animationFrameId = null;
		this.lastFrameTime = null;
		
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
		this.frames[this.previous]?.setAttribute('display', 'none');	
    this.frames[this.current]?.setAttribute('display', 'initial');
    this.previous = this.current;
    this.current += this.direction;
}

	start() {
		if (!this.isPlaying) {
			this.isPlaying = true;
			this.loop && this.loopMode !== 'pingpong' && (this.playmode = this.loopMode)
			!this.loop && this.toggle && (this.playmode === 'ff' ? this.playmode = 'rew' : this.playmode = 'ff' )
			if(!this.loop && !this.toggle){
				this.frames[this.current].setAttribute('display','none')
				this.playmode === 'ff'? this.current = this.min : this.current = this.max
				}
			this.draw()
			
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
		
		switch (this.loopMode) {
			case 'ff':
				this.current = this.min;
				break;
			case 'pingpong':
				this.previous = null
				this.playmode === 'ff' ? this.playmode = 'rew' : this.playmode = 'ff';
				break;
			case 'rew':
				this.current = this.max;
				break;

			default:
				break;
		}
	}
}