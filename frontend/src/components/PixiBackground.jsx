import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

/**
 * Renders an animated PixiJS canvas as a fixed full-screen background.
 * Matches the original site's background.js aesthetic — particles drifting
 * across the deep red canvas with gold-tinted glints.
 */
export default function PixiBackground() {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    let app;
    let particles = [];

    async function init() {
      const PIXI = await import('pixi.js');
      const { gsap } = await import('gsap');

      app = new PIXI.Application({
        resizeTo: window,
        backgroundColor: 0x7b3334,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (containerRef.current) {
        containerRef.current.appendChild(app.view);
      }
      appRef.current = app;

      const NUM_PARTICLES = 60;

      function createParticle() {
        const g = new PIXI.Graphics();
        const size = Math.random() * 3 + 1;
        const alpha = Math.random() * 0.4 + 0.1;

        g.beginFill(0xd4af37, alpha);
        g.drawCircle(0, 0, size);
        g.endFill();

        g.x = Math.random() * app.screen.width;
        g.y = Math.random() * app.screen.height;

        app.stage.addChild(g);
        particles.push(g);

        gsap.to(g, {
          x: g.x + (Math.random() - 0.5) * 200,
          y: g.y - Math.random() * 300 - 50,
          alpha: 0,
          duration: Math.random() * 6 + 4,
          ease: 'power1.out',
          onComplete: () => {
            g.x = Math.random() * app.screen.width;
            g.y = app.screen.height + 10;
            g.alpha = Math.random() * 0.4 + 0.1;
            gsap.to(g, {
              x: g.x + (Math.random() - 0.5) * 200,
              y: -20,
              alpha: 0,
              duration: Math.random() * 8 + 5,
              ease: 'none',
              repeat: -1,
              delay: Math.random() * 4,
            });
          },
        });
      }

      for (let i = 0; i < NUM_PARTICLES; i++) {
        setTimeout(createParticle, i * 80);
      }
    }

    init();

    return () => {
      particles = [];
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      zIndex={-1}
      pointerEvents="none"
    />
  );
}
