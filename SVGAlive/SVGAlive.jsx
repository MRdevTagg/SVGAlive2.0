/* eslint-disable  */
import React, { useEffect, useRef } from 'react';
import { Animated } from './SVGAlive(controls)';

export const SVGAlive = ({ name, controls, play }) => {
	const obj = useRef(null);
	const anim = useRef(null);
	const changeProp = (prop, value) => {
		if (!anim.current) return;
		typeof anim.current[prop] === 'boolean' && !value ?
		anim.current[prop] = !anim.current[prop] :
		anim.current[prop] = value

	};
	const changeControls = () => {
		for (const key in controls) {
			const val = controls[key];
			if (key === 'max' || key === 'min'){
				switch (key) {
					case 'min':
					anim.current.current >= val && changeProp(key, val);
						break;
					case 'max':
					anim.current.current <= val && changeProp(key, val);
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
		anim.current && anim.current.start({});
	};
	const init = () => {
		anim.current = new Animated({object: obj.current});
		const {current} = anim;
		current && controls && changeControls(controls)
		current && play && current.start({})
		current && current.parent.addEventListener('click', handleClick);
	};
	useEffect(() => {
		return () => {
			const {current} = anim;
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
