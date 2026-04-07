import { useRef, useState } from "react";

type StateUpdater<T> = T | ((current: T) => T);

const resolveNextState = <T,>(updater: StateUpdater<T>, current: T): T => {
  if (typeof updater === "function") {
    return (updater as (current: T) => T)(current);
  }

  return updater;
};

export const useHistoryState = <T,>(initializer: () => T) => {
  const [value, setValue] = useState<T>(initializer);
  const [tick, setTick] = useState(0);
  const undoStackRef = useRef<T[]>([]);
  const redoStackRef = useRef<T[]>([]);

  const setWithHistory = (updater: StateUpdater<T>) => {
    setValue((current) => {
      const next = resolveNextState(updater, current);
      undoStackRef.current.push(current);
      redoStackRef.current = [];
      return next;
    });
    setTick((current) => current + 1);
  };

  const undo = () => {
    setValue((current) => {
      const previous = undoStackRef.current.pop();

      if (!previous) {
        return current;
      }

      redoStackRef.current.push(current);
      return previous;
    });
    setTick((current) => current + 1);
  };

  const redo = () => {
    setValue((current) => {
      const next = redoStackRef.current.pop();

      if (!next) {
        return current;
      }

      undoStackRef.current.push(current);
      return next;
    });
    setTick((current) => current + 1);
  };

  const reset = (nextState: T) => {
    setWithHistory(nextState);
  };

  return {
    value,
    setValue,
    setWithHistory,
    undo,
    redo,
    reset,
    canUndo: undoStackRef.current.length > 0,
    canRedo: redoStackRef.current.length > 0,
    undoStackRef,
    redoStackRef,
    tick,
  };
};
