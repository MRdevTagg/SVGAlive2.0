/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";

const initialStats = {
  name: "_",
  animation: "_",
  current: "_",
  fps: "_",
  lap: "_",
  playmode: "_",
  loopmode: "_",
  loop: "_",
  playing: "_",
  paused: "_",
  frames: "_",
};

export const useUpdatedStats = ( selected ) => {
  const [stats, setStats] = useState(initialStats);
  const rAFref = useRef(null);

  const updatedStats = useCallback(() => {
    if (!selected) return initialStats;
    return {
      name: selected.getName(),
      lap: selected.getLAP(),
      animation: `${selected.getSource().name}.svg`,
      current: selected.getCurrent(),
      frames: selected.getMaxFrames(),
      fps: selected.getFPS(),
      playmode: selected.getPlaymode(),
      loopmode: selected.getLoopmode(),
      loop: selected.getLoop() ? "yes" : "no",
      playing: selected.getPlayState() ? "yes" : "no",
      paused: selected.getPauseState() ? "yes" : "no",
    };
  },[selected])

  useEffect(() => {
    const updateStats = () => {
      setStats(updatedStats());
    };
    rAFref.current = requestAnimationFrame(updateStats);
    return () => {
    rAFref.current = cancelAnimationFrame(updateStats);
    };
  }, [selected, stats]);

  return stats;
};
