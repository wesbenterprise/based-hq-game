import Phaser from 'phaser';
import { AGENTS_DATA } from '../data/agents';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {}

  create() {
    // Generate all textures programmatically
    this.generatePixelTexture();
    this.generatePlayerTexture();
    this.generateAgentTextures();
    this.generatePortraitTextures();
    this.generatePropTextures();

    // Show loading screen briefly
    const bg = this.add.rectangle(400, 300, 800, 600, 0x0D1117);
    const logo = this.add.text(400, 260, 'BASeD HQ', {
      fontSize: '42px',
      fontFamily: 'monospace',
      color: '#00E5FF',
      stroke: '#0D1117',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const sub = this.add.text(400, 320, '— an earthbound-style exploration —', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#4a7fa5',
    }).setOrigin(0.5);

    const hint = this.add.text(400, 380, 'WASD / Arrow Keys to move  •  E or Space to interact', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#445566',
    }).setOrigin(0.5);

    // Blink the hint
    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Transition to main scene after a moment
    this.time.delayedCall(2200, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('HQScene');
      });
    });
  }

  generatePixelTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture('pixel', 1, 1);
    g.destroy();
  }

  generatePlayerTexture() {
    // Wesley — slate blue trousers, white shirt, warm tan skin, gold watch
    const g = this.add.graphics();
    // Body/trousers
    g.fillStyle(0x4A5568);
    g.fillRect(4, 16, 16, 16);
    // Shirt
    g.fillStyle(0xF5F0E8);
    g.fillRect(4, 8, 16, 10);
    // Head
    g.fillStyle(0xC4956A);
    g.fillRect(6, 1, 12, 9);
    // Hair
    g.fillStyle(0x2a2a3e);
    g.fillRect(6, 1, 12, 4);
    g.fillRect(6, 2, 2, 6); // left sideburn
    g.fillRect(16, 2, 2, 6); // right sideburn
    // Eyes
    g.fillStyle(0x2d3142);
    g.fillRect(8, 6, 2, 2);
    g.fillRect(14, 6, 2, 2);
    // Gold watch (left wrist detail)
    g.fillStyle(0xD4A843);
    g.fillRect(3, 16, 2, 2);
    // Shoes
    g.fillStyle(0x2D3142);
    g.fillRect(3, 30, 8, 2);
    g.fillRect(13, 30, 8, 2);
    g.generateTexture('player', 24, 32);
    g.destroy();
  }

  generateAgentTextures() {
    Object.values(AGENTS_DATA).forEach(agent => {
      const g = this.add.graphics();
      const key = `agent_${agent.id}`;

      // Body
      g.fillStyle(agent.primaryColor);
      g.fillRect(4, 12, 16, 20);

      // Shirt accent (collar area)
      g.fillStyle(agent.shirtColor || 0xffffff);
      g.fillRect(7, 12, 10, 6);

      // Head
      g.fillStyle(agent.skinColor);
      g.fillRect(6, 2, 12, 11);

      // Hair
      g.fillStyle(agent.hairColor || 0x2a2a3e);
      g.fillRect(6, 2, 12, 4);

      // Eyes
      g.fillStyle(0x1c1c2e);
      g.fillRect(8, 7, 2, 2);
      g.fillRect(14, 7, 2, 2);

      // Accent detail (unique per agent)
      g.fillStyle(agent.accentColor);
      g.fillRect(9, 14, 6, 2); // small accent stripe

      // Shoes
      g.fillStyle(0x1c1c2e);
      g.fillRect(4, 29, 7, 3);
      g.fillRect(13, 29, 7, 3);

      g.generateTexture(key, 24, 32);
      g.destroy();
    });
  }

  generatePortraitTextures() {
    Object.values(AGENTS_DATA).forEach(agent => {
      const g = this.add.graphics();
      const key = `portrait_${agent.id}`;
      const S = 96; // portrait size

      // Background
      g.fillStyle(agent.portraitBg);
      g.fillRect(0, 0, S, S);

      // Background texture lines (subtle)
      g.fillStyle(0xffffff, 0.03);
      for (let i = 0; i < S; i += 8) {
        g.fillRect(0, i, S, 1);
      }

      // Body / torso
      g.fillStyle(agent.primaryColor);
      g.fillRect(20, 60, 56, 36);

      // Shirt/collar
      g.fillStyle(agent.shirtColor || 0xeeeeee);
      g.fillRect(34, 58, 28, 14);

      // Neck
      g.fillStyle(agent.skinColor);
      g.fillRect(38, 48, 20, 14);

      // Head
      g.fillStyle(agent.skinColor);
      g.fillRect(26, 16, 44, 40);
      // Rounded head top
      g.fillRect(30, 12, 36, 8);
      g.fillRect(34, 8, 28, 6);

      // Hair
      g.fillStyle(agent.hairColor || 0x2a2a3e);
      g.fillRect(26, 12, 44, 12);
      g.fillRect(30, 8, 36, 6);
      g.fillRect(34, 6, 28, 4);
      // Side hair
      g.fillRect(24, 14, 4, 20);
      g.fillRect(68, 14, 4, 20);

      // Eyes
      g.fillStyle(0x1c1c2e);
      g.fillRect(34, 32, 6, 6);
      g.fillRect(56, 32, 6, 6);
      // Eye whites
      g.fillStyle(0xf0f0f0);
      g.fillRect(35, 33, 4, 3);
      g.fillRect(57, 33, 4, 3);
      // Pupils
      g.fillStyle(0x2a2a3e);
      g.fillRect(36, 34, 2, 2);
      g.fillRect(58, 34, 2, 2);

      // Nose
      g.fillStyle(agent.skinColor - 0x101010);
      g.fillRect(44, 40, 4, 6);
      g.fillRect(42, 44, 2, 4);
      g.fillRect(48, 44, 2, 4);

      // Mouth
      g.fillStyle(0x8b4513);
      g.fillRect(38, 52, 20, 3);
      g.fillStyle(0xc47a5a);
      g.fillRect(40, 52, 16, 2);

      // Agent-specific accent details
      this.drawPortraitAccent(g, agent, S);

      // Outline border
      g.lineStyle(2, 0x1c1c2e, 1);
      g.strokeRect(0, 0, S, S);

      g.generateTexture(key, S, S);
      g.destroy();
    });
  }

  drawPortraitAccent(g, agent, S) {
    switch (agent.id) {
      case 'ace':
        // Lapel pin (♠ spade)
        g.fillStyle(0xC8C8D4);
        g.fillRect(30, 64, 4, 4);
        g.fillRect(28, 66, 8, 2);
        g.fillRect(31, 70, 2, 3);
        // Pocket square
        g.fillStyle(0xEDE8DC);
        g.fillRect(54, 62, 8, 6);
        break;

      case 'astra':
        // Volt yellow hair streak
        g.fillStyle(0xFFE033);
        g.fillRect(24, 14, 6, 18);
        // Lightning pin
        g.fillStyle(0xFFE033);
        g.fillRect(30, 64, 3, 5);
        g.fillRect(32, 62, 3, 4);
        g.fillRect(28, 67, 3, 5);
        break;

      case 'dezayas':
        // Hood drawn over head
        g.fillStyle(0x1E2330);
        g.fillRect(22, 8, 52, 24);
        g.fillRect(24, 6, 48, 10);
        // Terminal green glow from below
        g.fillStyle(0x00FF41, 0.2);
        g.fillRect(0, 72, 96, 24);
        // Terminal text on shirt
        g.fillStyle(0x00FF41);
        g.fillRect(26, 66, 16, 1);
        g.fillRect(26, 70, 12, 1);
        g.fillRect(26, 74, 14, 1);
        // Headphones around neck
        g.fillStyle(0x2a2a3e);
        g.fillRect(28, 56, 40, 4);
        g.fillRect(28, 54, 6, 8);
        g.fillRect(62, 54, 6, 8);
        break;

      case 'rybo':
        // Beard
        g.fillStyle(0x7B4F2E);
        g.fillRect(30, 48, 36, 12);
        g.fillRect(32, 52, 32, 10);
        // Cafecito cup in lower corner
        g.fillStyle(0x3B1F0A);
        g.fillRect(68, 74, 20, 18);
        g.fillStyle(0xC1440E);
        g.fillRect(66, 72, 24, 4);
        g.fillStyle(0xE8C99A);
        g.fillRect(66, 88, 24, 4);
        break;

      case 'charles':
        // Glasses (wire frame)
        g.fillStyle(0xC9A84C);
        g.fillRect(30, 30, 16, 2);
        g.fillRect(50, 30, 16, 2);
        g.fillRect(44, 30, 8, 2);
        g.lineStyle(1, 0xC9A84C, 1);
        g.strokeRect(30, 30, 14, 8);
        g.strokeRect(50, 30, 14, 8);
        // Amber tweed texture on jacket
        g.fillStyle(0xD4872A);
        g.fillRect(20, 62, 56, 34);
        // Tweed diagonal dither
        g.fillStyle(0xC17A1C);
        for (let i = 0; i < 10; i++) {
          g.fillRect(20 + i * 6, 62 + (i % 3) * 8, 3, 3);
        }
        // Book in hand
        g.fillStyle(0x5C3A1E);
        g.fillRect(60, 62, 14, 18);
        g.fillStyle(0xC9A84C);
        g.fillRect(60, 62, 2, 18);
        break;

      case 'romero':
        // Yellow beret
        g.fillStyle(0xFFD700);
        g.fillRect(24, 6, 48, 10);
        g.fillRect(22, 10, 52, 6);
        // Bold red jacket with Britto-style pattern
        g.fillStyle(0xE8192C);
        g.fillRect(20, 60, 56, 36);
        // Pattern overlay (geometric)
        g.fillStyle(0xFF69B4);
        g.fillRect(20, 64, 16, 16);
        g.fillRect(52, 64, 16, 16);
        g.fillRect(36, 76, 16, 16);
        // Cobalt trousers
        g.fillStyle(0x0047AB);
        g.fillRect(24, 82, 48, 14);
        // Paint palette
        g.fillStyle(0xD2B48C);
        g.fillRect(66, 62, 22, 14);
        g.fillStyle(0xE8192C);
        g.fillRect(68, 64, 4, 4);
        g.fillStyle(0x0047AB);
        g.fillRect(74, 64, 4, 4);
        g.fillStyle(0xFFD700);
        g.fillRect(80, 64, 4, 4);
        break;

      case 'cid':
        // Purple hoodie with teal graphic tee
        g.fillStyle(0x7B2D8B);
        g.fillRect(20, 58, 56, 38);
        g.fillStyle(0x00CEC9);
        g.fillRect(34, 60, 28, 16);
        // Tiny sprite-within-sprite on tee (6x6)
        g.fillStyle(0x7B2D8B);
        g.fillRect(42, 62, 6, 6);
        g.fillStyle(0xf0f0f0);
        g.fillRect(43, 63, 2, 2);
        g.fillRect(46, 63, 2, 2);
        g.fillRect(44, 66, 2, 2);
        // Handheld game device visible
        g.fillStyle(0x2D1B4E);
        g.fillRect(62, 70, 20, 14);
        g.fillStyle(0x00CEC9);
        g.fillRect(64, 72, 12, 8);
        break;

      case 'julius':
        // Forest green suit
        g.fillStyle(0x1B4D3E);
        g.fillRect(20, 58, 56, 38);
        // Gold tie
        g.fillStyle(0xBFA260);
        g.fillRect(44, 58, 8, 30);
        // Pocket square
        g.fillStyle(0xBFA260);
        g.fillRect(22, 62, 10, 8);
        // Mist gray shirt
        g.fillStyle(0xA8B8B0);
        g.fillRect(38, 58, 20, 10);
        break;
    }
  }

  generatePropTextures() {
    // Peppermint (for Julius's bowl)
    const pm = this.add.graphics();
    pm.fillStyle(0xffffff);
    pm.fillCircle(4, 4, 4);
    pm.fillStyle(0xE8192C);
    pm.fillRect(1, 3, 6, 2);
    pm.generateTexture('peppermint', 8, 8);
    pm.destroy();
  }
}
