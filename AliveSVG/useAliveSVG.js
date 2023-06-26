/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { AliveSvgInstance } from "./AliveSVGLibrary";

const useAliveSVGs = ({behavior, selectable, selectEvent,
  onSelect, setSelected }) => {
  const [documentReady, setDocumentReady] = useState(false);
  const [animated, setNewanimated] = useState(null)

  const makeAlive = (anim)=>{
    setNewanimated(anim)
  }
  useEffect(() => {
    if (!documentReady) {
      const interval = setInterval(() => {
        if (document.readyState === "complete") {
          setDocumentReady(true);
          console.log("%cDocument Ready",'color: #aaffaa');
          clearInterval(interval);
        }
      }, 100);
    }else setDocumentReady(true); 
  }, [documentReady]);

  useEffect(() => {
   if( animated ) {
    console.log(`%c Instance '${animated.getName()}':`,'color: #11aaff');
      if (animated && animated instanceof AliveSvgInstance) {
        if (behavior) {
          console.log(`  - Custom behavior is setted`);
          behavior(animated);
        }
        if (!selectable) return console.log('-- no selectable');
        animated.outEvent(selectEvent, () => {
          setSelected && setSelected(animated);
          onSelect && onSelect(animated);
        });
        console.log(`  - Selectable through \x1b[32m'${selectEvent}'\x1b[37m`);
      }
    }
  }, [animated])
  
  return { documentReady, makeAlive, animated };
};

export default useAliveSVGs;

