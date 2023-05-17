/* eslint-disable  */
import React, { useRef } from 'react';
import { getByObject, setOneDOM } from './SVGAlive(controls)';

export const SVGAlive = ({ name, controls, play }) => {
	const obj = useRef(null);
	const anim = useRef(null);

	const init = () => {
		setOneDOM(obj.current);
		anim.current = getByObject(obj.current)
		const {current: an} = anim;
		an && controls && changeControls(controls)
		an && play && an.start({})
	};

	return (
			<object
				ref={obj}
				onLoad={init}
				data={`/SVGAlive/sources/${name}.svg`}
				type="image/svg+xml"
				></object>
	);
};
