/* eslint-disable  */
import React, { useEffect, useRef } from 'react';
import { Animated, setSize } from './SVGAlive(controls)';

export const SVGAlive = ({ name, controls, w, h, play }) => {
	const obj = useRef(null);
	const animRef = useRef(null);
	const changeProp = (prop, value) => {
		if (!animRef.current) return;
		typeof animRef.current[prop] === 'boolean' && !value ?
		animRef.current[prop] = !animRef.current[prop] :
		animRef.current[prop] = value

	};
	const changeControls = () => {
		for (const key in controls) {
			const val = controls[key];
			if (key === 'max' || key === 'min'){
				switch (key) {
					case 'min':
					animRef.current.current >= val && changeProp(key, val);
						break;
					case 'max':
					animRef.current.current <= val && changeProp(key, val);
					break;
					default:
						break;
				}
			}
			changeProp(key, val);
		}
	};
	const handleClick = (e) => {
		e.preventDefault();
		animRef.current && animRef.current.start();
	};
	const init = () => {
		animRef.current = new Animated({object: obj.current});
		const {current} = animRef;
		w && setSize(current.parent, current.frames, w , h )
		current && controls && changeControls(controls)
		current && play && current.start()
		current && current.parent.addEventListener('click', handleClick);
	};
	useEffect(() => {
		return () => {
			const {current} = animRef;
			current && current.parent.removeEventListener('click', handleClick);
		};
	}, []);


	return (
			<object
				ref={obj}
				onLoad={init}
				data={`/SVGAlive/sources/${name}.svg`}
				type="image/svg+xml"
				></object>
	);
};
