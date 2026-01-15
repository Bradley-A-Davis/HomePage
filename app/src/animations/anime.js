import { animate } from 'animejs';

export function bounce(target) {
  return animate({
    targets: target,
    translateY: [0, 20],
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    duration: 800,
  });
}

export function fadeIn(target) {
  return animate({
    targets: target,
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
  });
}