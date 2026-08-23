import { useEffect, useRef, useState } from "react";

export default function usePressFeedback() {
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  const press = () => {
    setPressed(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPressed(false), 220);
  };
  return { pressed, press };
}
