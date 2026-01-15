import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function Thing() {
  const el = useRef(null);

  useEffect(() => {
    const anim = animate({
      targets: el.current,
      translateY: [0, 20],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 800,
    });

    return () => anim.pause();
  }, []);

  return <div ref={el} className="h-20 w-20 rounded-2xl bg-black" />;
}