/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useRef, useState } from "react";
import { getByObject, setOne } from "./AliveSVGLibrary";
import useAliveSVGs from "./useAliveSVG";
import { SelectedContext } from "./SelectedContext";
import PropTypes from "prop-types";

const isSupported = () => {
  const obj = document.createElement("object");
  obj.type = "image/svg+xml";
  return obj.type === "image/svg+xml";
};

export const AliveSVG = ({
  selectable = true,
  selectEvent='click',
  onSelect,
  behavior,
  name,
  options,
  styles,
  Fallback = ()=> (<img />),
}) => {
  const { setSelected } = useContext( SelectedContext );
  const [ svgsReady, setSvgsReady] = useState(false)
  const { documentReady, makeAlive, animated } = useAliveSVGs( { behavior, selectable, selectEvent,
    onSelect, setSelected });
  const obj = useRef(null);

  const init = () => {
    setOne(obj.current, options);
  };

  useEffect(() => {
   if(documentReady && obj.current && !animated) {
    if (!svgsReady) {
      const interval = setInterval(() => {
        if (obj.current.contentDocument.readyState === "complete") {
          setSvgsReady(true);
          console.log(`%c${name} frames are Ready...`,'color: #ffffaa');
          clearInterval(interval);
        }
      }, 150);
    } else{
      init();
      getByObject(obj.current) && makeAlive(getByObject(obj.current));
    }
  }
  }, [documentReady, obj, svgsReady]);

  return isSupported() ? (
    <object
      ref={obj}
      data={`./AliveSVG/sources/${name}.svg`}
      type="image/svg+xml"
      style={
        !styles?.backgroundColor
          ? { ...styles, backgroundColor: "transparent" }
          : styles
      }
    ></object>
  ) : (
    <Fallback/ >
  );
};

AliveSVG.propTypes ={
  selectable: PropTypes.bool, // Bool that indicates if this can be selected
  selectEvent: PropTypes.string, // String that will be the event that triggers seletion 
  onSelect: PropTypes.func, // handler callback to execute right after selection
  behavior: PropTypes.func, // Main function that handles animation behavior
  name: PropTypes.string.isRequired, // name of the animation svg file 
  options: PropTypes.object, // default options for Animated instance at start
  styles: PropTypes.object, // object containing the HTMLObjectElement styles
  Fallback: PropTypes.any, // to show something if svgs are not supported
}


