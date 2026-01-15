import AOS from 'aos';
import 'aos/dist/aos.css';

export function initAOS() {
  AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' });
}