'use client';

import { useEffect, useRef } from 'react';

export default function Game() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    async function initGame() {
      const Phaser = (await import('phaser')).default;
      const { default: BootScene } = await import('../lib/game/scenes/BootScene');
      const { default: HQScene } = await import('../lib/game/scenes/HQScene');

      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#0D1117',
        parent: containerRef.current,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BootScene, HQScene],
      };

      gameRef.current = new Phaser.Game(config);
    }

    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-container"
      style={{ width: '100%', height: '100vh' }}
    />
  );
}
