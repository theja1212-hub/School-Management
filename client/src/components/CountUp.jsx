import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

export default function CountUp({ value = 0, prefix = '', suffix = '', decimals = 0 }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const controls = animate(0, Number(value) || 0, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <>
      {prefix}
      {n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </>
  );
}