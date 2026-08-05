import { useEffect } from 'react';

export function Metrika() {
  useEffect(() => {
    (window as any).ym = (window as any).ym || function() {
      ((window as any).ym.a = (window as any).ym.a || []).push(arguments);
    };
   (window as any).ym.l = Date.now();
    (window as any).ym(111330306, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js?id=111330306';
    document.head.appendChild(script);
  }, []);

  return null;
}
