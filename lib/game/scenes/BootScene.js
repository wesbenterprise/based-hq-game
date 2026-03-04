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
    this.generateShadowTexture();
    this.generateGlowTexture();
    this.generatePlayerTextures();
    this.generateAgentTextures();
    this.generatePortraitTextures();
    this.generatePropTextures();
    this.generateParticleTexture();

    // Show loading screen
    const bg = this.add.rectangle(400, 300, 800, 600, 0x0D1117);

    // Decorative border lines
    const borderGfx = this.add.graphics();
    borderGfx.lineStyle(1, 0x00E5FF, 0.3);
    borderGfx.strokeRect(20, 20, 760, 560);
    borderGfx.lineStyle(1, 0x00E5FF, 0.1);
    borderGfx.strokeRect(24, 24, 752, 552);

    // Spade logo (large, centered)
    const logoGfx = this.add.graphics();
    logoGfx.fillStyle(0x00E5FF, 0.15);
    logoGfx.fillTriangle(400, 180, 360, 240, 440, 240);
    logoGfx.fillCircle(380, 238, 22);
    logoGfx.fillCircle(420, 238, 22);
    logoGfx.fillRect(394, 248, 12, 20);
    logoGfx.fillRect(388, 264, 24, 6);

    const logo = this.add.text(400, 290, 'BASeD HQ', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#00E5FF',
      stroke: '#0D1117',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const sub = this.add.text(400, 340, 'an earthbound-style exploration', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#4a7fa5',
    }).setOrigin(0.5);

    const sub2 = this.add.text(400, 360, 'walk through the building. meet the team.', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#2D3E55',
    }).setOrigin(0.5);

    // Controls hint
    const hint = this.add.text(400, 420, 'WASD / Arrows to move   |   E / Space to interact', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#445566',
    }).setOrigin(0.5);

    const hint2 = this.add.text(400, 440, 'ESC to close dialogue', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#334455',
    }).setOrigin(0.5);

    // "Press any key" blink
    const startHint = this.add.text(400, 500, '[ PRESS ANY KEY TO START ]', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#00E5FF',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startHint,
      alpha: 0.2,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    // Subtle logo pulse
    this.tweens.add({
      targets: logoGfx,
      alpha: 0.6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start on any key or after delay
    let started = false;
    const startGame = () => {
      if (started) return;
      started = true;
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.start('HQScene');
      });
    };

    this.input.keyboard.on('keydown', startGame);
    this.input.on('pointerdown', startGame);

    // Auto-start after 4 seconds if no input
    this.time.delayedCall(4000, startGame);
  }

  generatePixelTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture('pixel', 1, 1);
    g.destroy();
  }

  generateShadowTexture() {
    // Elliptical shadow for under characters
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(12, 4, 20, 8);
    g.generateTexture('shadow', 24, 8);
    g.destroy();
  }

  generateGlowTexture() {
    // Interaction glow ring
    const g = this.add.graphics();
    const size = 48;
    // Outer glow rings (concentric, fading)
    g.fillStyle(0x00E5FF, 0.04);
    g.fillCircle(size / 2, size / 2, 22);
    g.fillStyle(0x00E5FF, 0.06);
    g.fillCircle(size / 2, size / 2, 18);
    g.fillStyle(0x00E5FF, 0.08);
    g.fillCircle(size / 2, size / 2, 14);
    g.generateTexture('glow', size, size);
    g.destroy();
  }

  generateParticleTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(0, 0, 3, 3);
    g.generateTexture('particle', 3, 3);
    g.destroy();

    // Small sparkle
    const s = this.add.graphics();
    s.fillStyle(0xffffff, 1);
    s.fillRect(1, 0, 1, 3);
    s.fillRect(0, 1, 3, 1);
    s.generateTexture('sparkle', 3, 3);
    s.destroy();
  }

  generatePlayerTextures() {
    // Generate two walk frames for simple animation
    for (let frame = 0; frame < 2; frame++) {
      const g = this.add.graphics();
      const w = 24, h = 32;

      // ── Legs / Trousers ──
      g.fillStyle(0x3D4F65); // slate blue trousers
      if (frame === 0) {
        // Standing / step 1
        g.fillRect(6, 20, 5, 10);  // left leg
        g.fillRect(13, 20, 5, 10); // right leg
      } else {
        // Step 2 - legs apart
        g.fillRect(4, 20, 5, 10);  // left leg forward
        g.fillRect(15, 20, 5, 10); // right leg back
      }

      // ── Shoes ──
      g.fillStyle(0x1C1C2E);
      if (frame === 0) {
        g.fillRect(5, 29, 7, 3);
        g.fillRect(12, 29, 7, 3);
      } else {
        g.fillRect(3, 29, 7, 3);
        g.fillRect(14, 29, 7, 3);
      }

      // ── Belt ──
      g.fillStyle(0x2A2A3E);
      g.fillRect(5, 19, 14, 2);
      g.fillStyle(0xD4A843);
      g.fillRect(10, 19, 4, 2); // belt buckle

      // ── Shirt / torso ──
      g.fillStyle(0xF5F0E8);
      g.fillRect(5, 10, 14, 10);
      // Collar
      g.fillStyle(0xE8E0D0);
      g.fillRect(7, 10, 4, 3);
      g.fillRect(13, 10, 4, 3);
      // Collar shadow
      g.fillStyle(0xD8D0C0);
      g.fillRect(5, 10, 14, 1);

      // ── Arms ──
      g.fillStyle(0xF5F0E8);
      g.fillRect(3, 11, 3, 8);  // left arm
      g.fillRect(18, 11, 3, 8); // right arm
      // Hands
      g.fillStyle(0xC4956A);
      g.fillRect(3, 18, 3, 2);
      g.fillRect(18, 18, 3, 2);

      // ── Gold watch (left wrist) ──
      g.fillStyle(0xD4A843);
      g.fillRect(3, 17, 3, 2);

      // ── Head ──
      g.fillStyle(0xC4956A);
      g.fillRect(7, 2, 10, 9);
      // Ears
      g.fillRect(6, 5, 2, 3);
      g.fillRect(16, 5, 2, 3);

      // ── Hair ──
      g.fillStyle(0x1A1A2E);
      g.fillRect(7, 1, 10, 4);
      g.fillRect(6, 2, 2, 5);  // left sideburn
      g.fillRect(16, 2, 2, 5); // right sideburn
      // Hair highlight
      g.fillStyle(0x2A2A3E);
      g.fillRect(9, 1, 4, 2);

      // ── Face ──
      // Eyes
      g.fillStyle(0xffffff);
      g.fillRect(8, 5, 3, 3);
      g.fillRect(13, 5, 3, 3);
      g.fillStyle(0x1C1C2E);
      g.fillRect(9, 6, 2, 2);
      g.fillRect(14, 6, 2, 2);
      // Eye highlight
      g.fillStyle(0xffffff);
      g.fillRect(9, 6, 1, 1);
      g.fillRect(14, 6, 1, 1);

      // Nose
      g.fillStyle(0xB8855A);
      g.fillRect(11, 7, 2, 2);

      // Mouth (slight smile)
      g.fillStyle(0x8B6040);
      g.fillRect(10, 9, 4, 1);

      g.generateTexture(`player_${frame}`, w, h);
      g.destroy();
    }
  }

  generateAgentTextures() {
    Object.values(AGENTS_DATA).forEach(agent => {
      for (let frame = 0; frame < 2; frame++) {
        const g = this.add.graphics();
        const key = frame === 0 ? `agent_${agent.id}` : `agent_${agent.id}_1`;
        const w = 24, h = 32;

        // ── Legs ──
        g.fillStyle(agent.primaryColor);
        if (frame === 0) {
          g.fillRect(6, 22, 5, 8);
          g.fillRect(13, 22, 5, 8);
        } else {
          g.fillRect(5, 22, 5, 8);
          g.fillRect(14, 22, 5, 8);
        }

        // ── Shoes ──
        g.fillStyle(0x1C1C2E);
        if (frame === 0) {
          g.fillRect(5, 29, 7, 3);
          g.fillRect(12, 29, 7, 3);
        } else {
          g.fillRect(4, 29, 7, 3);
          g.fillRect(13, 29, 7, 3);
        }

        // ── Body / shirt ──
        g.fillStyle(agent.primaryColor);
        g.fillRect(5, 12, 14, 11);
        // Arms
        g.fillRect(3, 13, 3, 7);
        g.fillRect(18, 13, 3, 7);
        // Hands
        g.fillStyle(agent.skinColor);
        g.fillRect(3, 19, 3, 2);
        g.fillRect(18, 19, 3, 2);

        // Shirt/collar accent
        g.fillStyle(agent.shirtColor || 0xffffff);
        g.fillRect(8, 12, 8, 4);
        // Collar lines
        g.fillStyle(agent.primaryColor);
        g.fillRect(11, 12, 2, 3);

        // Agent-specific body detail
        g.fillStyle(agent.accentColor);
        g.fillRect(8, 16, 8, 2); // accent stripe

        // ── Neck ──
        g.fillStyle(agent.skinColor);
        g.fillRect(9, 10, 6, 3);

        // ── Head ──
        g.fillStyle(agent.skinColor);
        g.fillRect(7, 2, 10, 9);
        // Ears
        g.fillRect(6, 5, 2, 3);
        g.fillRect(16, 5, 2, 3);

        // ── Hair ──
        g.fillStyle(agent.hairColor || 0x2a2a3e);
        g.fillRect(7, 1, 10, 4);

        // ── Eyes ──
        g.fillStyle(0xffffff);
        g.fillRect(8, 5, 3, 3);
        g.fillRect(13, 5, 3, 3);
        g.fillStyle(0x1C1C2E);
        g.fillRect(9, 6, 2, 2);
        g.fillRect(14, 6, 2, 2);
        g.fillStyle(0xffffff);
        g.fillRect(9, 6, 1, 1);
        g.fillRect(14, 6, 1, 1);

        // Nose
        const noseDark = agent.skinColor - 0x101010;
        g.fillStyle(noseDark > 0 ? noseDark : 0x9A7050);
        g.fillRect(11, 7, 2, 2);

        // Mouth
        g.fillStyle(0x8B5040);
        g.fillRect(10, 9, 4, 1);

        // ── Agent-specific details on sprite ──
        this.drawAgentSpriteDetail(g, agent);

        g.generateTexture(key, w, h);
        g.destroy();
      }
    });
  }

  drawAgentSpriteDetail(g, agent) {
    switch (agent.id) {
      case 'ace':
        // Silver pocket square
        g.fillStyle(0xC8C8D4);
        g.fillRect(14, 13, 4, 3);
        break;
      case 'astra':
        // Yellow hair streak
        g.fillStyle(0xFFE033);
        g.fillRect(7, 1, 3, 4);
        break;
      case 'dezayas':
        // Hood over head
        g.fillStyle(0x1E2330);
        g.fillRect(6, 1, 12, 5);
        g.fillRect(5, 3, 2, 4);
        g.fillRect(17, 3, 2, 4);
        // Terminal green glow on shirt
        g.fillStyle(0x00FF41, 0.6);
        g.fillRect(8, 16, 8, 2);
        break;
      case 'rybo':
        // Beard
        g.fillStyle(0x7B4F2E);
        g.fillRect(8, 9, 8, 3);
        break;
      case 'charles':
        // Glasses
        g.fillStyle(0xC9A84C);
        g.fillRect(8, 5, 3, 3);
        g.fillRect(13, 5, 3, 3);
        g.fillRect(11, 5, 2, 1);
        break;
      case 'romero':
        // Yellow beret
        g.fillStyle(0xFFD700);
        g.fillRect(6, 0, 12, 3);
        g.fillRect(5, 1, 2, 2);
        break;
      case 'cid':
        // Hoodie bunching
        g.fillStyle(0x7B2D8B);
        g.fillRect(5, 12, 14, 2);
        // Teal tee peek
        g.fillStyle(0x00CEC9);
        g.fillRect(9, 12, 6, 2);
        break;
      case 'julius':
        // Gold tie
        g.fillStyle(0xBFA260);
        g.fillRect(11, 12, 2, 8);
        break;
    }
  }

  generatePortraitTextures() {
    Object.values(AGENTS_DATA).forEach(agent => {
      const g = this.add.graphics();
      const key = `portrait_${agent.id}`;
      const S = 96;

      // ── Background with gradient-like effect ──
      g.fillStyle(agent.portraitBg);
      g.fillRect(0, 0, S, S);
      // Vignette effect (darker edges)
      g.fillStyle(0x000000, 0.15);
      g.fillRect(0, 0, 8, S);
      g.fillRect(S - 8, 0, 8, S);
      g.fillRect(0, 0, S, 6);
      g.fillRect(0, S - 6, S, 6);
      // Scanline texture
      g.fillStyle(0x000000, 0.04);
      for (let i = 0; i < S; i += 4) {
        g.fillRect(0, i, S, 1);
      }
      // Subtle diagonal pattern
      g.fillStyle(0xffffff, 0.02);
      for (let i = -S; i < S; i += 12) {
        g.fillRect(Math.max(0, i), Math.max(0, -i), 1, S);
      }

      // ── Shoulders / torso ──
      g.fillStyle(agent.primaryColor);
      g.fillRect(14, 62, 68, 34);
      // Shoulder curve
      g.fillRect(10, 66, 8, 30);
      g.fillRect(78, 66, 8, 30);

      // ── Shirt/collar ──
      g.fillStyle(agent.shirtColor || 0xeeeeee);
      g.fillRect(32, 58, 32, 16);
      // Collar V-shape
      g.fillStyle(agent.primaryColor);
      g.fillTriangle(42, 58, 54, 58, 48, 68);

      // ── Neck ──
      g.fillStyle(agent.skinColor);
      g.fillRect(36, 48, 24, 16);

      // ── Head ──
      g.fillStyle(agent.skinColor);
      g.fillRect(24, 16, 48, 38);
      // Rounded top
      g.fillRect(28, 12, 40, 8);
      g.fillRect(32, 8, 32, 6);
      // Jaw softening
      g.fillRect(26, 48, 4, 4);
      g.fillRect(66, 48, 4, 4);

      // ── Hair ──
      g.fillStyle(agent.hairColor || 0x2a2a3e);
      g.fillRect(24, 10, 48, 14);
      g.fillRect(28, 6, 40, 8);
      g.fillRect(32, 4, 32, 4);
      // Side hair
      g.fillRect(22, 14, 4, 22);
      g.fillRect(70, 14, 4, 22);
      // Hair highlight
      const hairHighlight = (agent.hairColor || 0x2a2a3e) + 0x1a1a1a;
      g.fillStyle(hairHighlight > 0xffffff ? 0x555555 : hairHighlight, 0.3);
      g.fillRect(34, 6, 12, 4);

      // ── Eyes ──
      // Eye whites
      g.fillStyle(0xf0f0f0);
      g.fillRect(32, 30, 10, 8);
      g.fillRect(54, 30, 10, 8);
      // Iris
      g.fillStyle(0x3a3a4e);
      g.fillRect(34, 32, 6, 6);
      g.fillRect(56, 32, 6, 6);
      // Pupil
      g.fillStyle(0x1C1C2E);
      g.fillRect(36, 33, 3, 4);
      g.fillRect(58, 33, 3, 4);
      // Eye highlight
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(35, 32, 2, 2);
      g.fillRect(57, 32, 2, 2);
      // Eyelids (top)
      g.fillStyle(agent.skinColor - 0x080808 > 0 ? agent.skinColor - 0x080808 : agent.skinColor);
      g.fillRect(32, 29, 10, 2);
      g.fillRect(54, 29, 10, 2);
      // Eyebrows
      g.fillStyle(agent.hairColor || 0x2a2a3e);
      g.fillRect(32, 26, 10, 2);
      g.fillRect(54, 26, 10, 2);

      // ── Nose ──
      const noseShadow = agent.skinColor - 0x181818;
      g.fillStyle(noseShadow > 0 ? noseShadow : 0x9A7050);
      g.fillRect(44, 38, 6, 8);
      g.fillRect(42, 44, 4, 3);
      g.fillRect(48, 44, 4, 3);
      // Nose highlight
      g.fillStyle(agent.skinColor + 0x101010 > 0xffffff ? 0xffffff : agent.skinColor + 0x101010, 0.4);
      g.fillRect(46, 38, 2, 4);

      // ── Mouth ──
      g.fillStyle(0x7B4030);
      g.fillRect(38, 50, 20, 3);
      g.fillStyle(0xC47A5A);
      g.fillRect(40, 50, 16, 2);
      // Smile highlight
      g.fillStyle(agent.skinColor, 0.5);
      g.fillRect(38, 53, 20, 1);

      // ── Agent-specific accent details ──
      this.drawPortraitAccent(g, agent, S);

      // ── Frame border ──
      g.lineStyle(2, agent.accentColor, 0.8);
      g.strokeRect(1, 1, S - 2, S - 2);
      g.lineStyle(1, 0x000000, 0.6);
      g.strokeRect(0, 0, S, S);

      g.generateTexture(key, S, S);
      g.destroy();
    });
  }

  drawPortraitAccent(g, agent, S) {
    switch (agent.id) {
      case 'ace':
        // Lapel pin (spade)
        g.fillStyle(0xC8C8D4);
        g.fillRect(28, 66, 6, 6);
        g.fillRect(26, 68, 10, 2);
        g.fillRect(30, 72, 2, 4);
        // Crisp pocket square
        g.fillStyle(0xEDE8DC);
        g.fillRect(56, 64, 10, 8);
        g.fillStyle(0xC8C8D4, 0.5);
        g.fillRect(56, 64, 10, 2);
        // Stern but fair expression - thinner eyebrows
        g.fillStyle(agent.hairColor);
        g.fillRect(32, 26, 10, 3);
        g.fillRect(54, 26, 10, 3);
        break;

      case 'astra':
        // Bold volt yellow hair streak
        g.fillStyle(0xFFE033);
        g.fillRect(22, 12, 8, 22);
        g.fillRect(24, 8, 6, 6);
        // Lightning pin
        g.fillStyle(0xFFE033);
        g.fillRect(30, 66, 4, 6);
        g.fillRect(32, 62, 4, 6);
        g.fillRect(28, 70, 4, 6);
        // Sharp focused eyes
        g.fillStyle(0x0077FF, 0.3);
        g.fillRect(34, 32, 6, 6);
        g.fillRect(56, 32, 6, 6);
        break;

      case 'dezayas':
        // Hood drawn over head (dark, mysterious)
        g.fillStyle(0x1E2330);
        g.fillRect(20, 6, 56, 26);
        g.fillRect(22, 4, 52, 10);
        // Hood shadow on face
        g.fillStyle(0x000000, 0.15);
        g.fillRect(24, 24, 48, 8);
        // Terminal green glow from below
        g.fillStyle(0x00FF41, 0.15);
        g.fillRect(0, 72, 96, 24);
        g.fillStyle(0x00FF41, 0.08);
        g.fillRect(0, 60, 96, 12);
        // Terminal text on shirt
        g.fillStyle(0x00FF41, 0.9);
        g.fillRect(24, 68, 18, 1);
        g.fillRect(24, 72, 14, 1);
        g.fillRect(24, 76, 16, 1);
        g.fillRect(24, 80, 10, 1);
        // Cursor blink
        g.fillStyle(0x00FF41);
        g.fillRect(36, 80, 4, 2);
        // Headphones around neck
        g.fillStyle(0x2a2a3e);
        g.fillRect(26, 56, 44, 4);
        g.fillRect(24, 54, 8, 8);
        g.fillRect(64, 54, 8, 8);
        // Green reflection in eyes
        g.fillStyle(0x00FF41, 0.3);
        g.fillRect(36, 34, 2, 2);
        g.fillRect(58, 34, 2, 2);
        break;

      case 'rybo':
        // Full beard
        g.fillStyle(0x7B4F2E);
        g.fillRect(28, 46, 40, 14);
        g.fillRect(30, 56, 36, 6);
        g.fillRect(34, 60, 28, 4);
        // Beard texture
        g.fillStyle(0x6A4024, 0.5);
        g.fillRect(30, 48, 2, 8);
        g.fillRect(38, 48, 2, 8);
        g.fillRect(56, 48, 2, 8);
        g.fillRect(62, 48, 2, 8);
        // Cafecito cup
        g.fillStyle(0x3B1F0A);
        g.fillRect(68, 74, 22, 18);
        g.fillStyle(0xC1440E);
        g.fillRect(66, 72, 26, 4);
        // Coffee steam (subtle)
        g.fillStyle(0xE8C99A, 0.3);
        g.fillRect(74, 66, 2, 6);
        g.fillRect(78, 64, 2, 8);
        g.fillRect(82, 66, 2, 6);
        // Warm eyes
        g.fillStyle(0x5C3A1E, 0.3);
        g.fillRect(34, 32, 6, 6);
        g.fillRect(56, 32, 6, 6);
        break;

      case 'charles':
        // Wire-frame glasses
        g.fillStyle(0xC9A84C);
        g.lineStyle(2, 0xC9A84C, 1);
        g.strokeRect(30, 28, 14, 10);
        g.strokeRect(52, 28, 14, 10);
        g.fillRect(44, 30, 8, 2); // bridge
        g.fillRect(20, 32, 10, 2); // left arm
        g.fillRect(66, 32, 10, 2); // right arm
        // Amber tweed jacket
        g.fillStyle(0xD4872A);
        g.fillRect(14, 64, 68, 32);
        g.fillRect(10, 68, 8, 28);
        g.fillRect(78, 68, 8, 28);
        // Tweed texture pattern
        g.fillStyle(0xC17A1C, 0.5);
        for (let i = 0; i < 12; i++) {
          g.fillRect(16 + (i % 6) * 10, 66 + Math.floor(i / 6) * 10, 4, 4);
        }
        // Book in hand
        g.fillStyle(0x5C3A1E);
        g.fillRect(62, 64, 16, 22);
        g.fillStyle(0xC9A84C);
        g.fillRect(62, 64, 3, 22); // spine
        g.fillStyle(0xF2E8C8, 0.3);
        g.fillRect(66, 68, 10, 2); // page lines
        g.fillRect(66, 72, 8, 2);
        g.fillRect(66, 76, 10, 2);
        break;

      case 'romero':
        // Yellow beret (bold, artistic)
        g.fillStyle(0xFFD700);
        g.fillRect(22, 4, 52, 12);
        g.fillRect(20, 8, 56, 8);
        g.fillRect(18, 10, 4, 4); // beret droop
        // Bold red jacket with Britto pattern
        g.fillStyle(0xE8192C);
        g.fillRect(14, 62, 68, 34);
        g.fillRect(10, 66, 8, 30);
        g.fillRect(78, 66, 8, 30);
        // Geometric Britto-style blocks
        g.fillStyle(0xFF69B4);
        g.fillRect(16, 66, 18, 14);
        g.fillRect(54, 66, 18, 14);
        g.fillStyle(0x0047AB);
        g.fillRect(34, 78, 18, 14);
        g.fillStyle(0xFFD700, 0.6);
        g.fillRect(52, 78, 14, 14);
        // Cobalt pants visible at bottom
        g.fillStyle(0x0047AB);
        g.fillRect(20, 88, 56, 8);
        // Paint palette held
        g.fillStyle(0xD2B48C);
        g.fillRect(68, 64, 20, 12);
        g.fillStyle(0xE8192C);
        g.fillRect(70, 66, 4, 4);
        g.fillStyle(0x0047AB);
        g.fillRect(76, 66, 4, 4);
        g.fillStyle(0xFFD700);
        g.fillRect(82, 66, 4, 4);
        g.fillStyle(0x2ECC40);
        g.fillRect(73, 72, 4, 3);
        break;

      case 'cid':
        // Purple hoodie
        g.fillStyle(0x7B2D8B);
        g.fillRect(14, 58, 68, 38);
        g.fillRect(10, 62, 8, 34);
        g.fillRect(78, 62, 8, 34);
        // Hoodie hood bunched behind head
        g.fillStyle(0x6A1D7A);
        g.fillRect(20, 46, 56, 14);
        // Teal graphic tee visible
        g.fillStyle(0x00CEC9);
        g.fillRect(32, 60, 32, 18);
        // Tiny pixel art on tee (game controller)
        g.fillStyle(0x7B2D8B);
        g.fillRect(40, 64, 14, 8);
        g.fillStyle(0xffffff, 0.8);
        g.fillRect(42, 66, 4, 4); // d-pad
        g.fillRect(50, 66, 2, 2); // button A
        g.fillRect(52, 64, 2, 2); // button B
        // Handheld game device in hand
        g.fillStyle(0x2D1B4E);
        g.fillRect(64, 72, 22, 16);
        g.fillStyle(0x00CEC9, 0.8);
        g.fillRect(66, 74, 14, 10); // screen
        // Tiny game scene on handheld
        g.fillStyle(0x1a8c1a, 0.6);
        g.fillRect(66, 80, 14, 4);
        g.fillStyle(0xffffff, 0.8);
        g.fillRect(72, 78, 2, 4);
        // Messy hair
        g.fillStyle(agent.hairColor);
        g.fillRect(22, 6, 4, 10);
        g.fillRect(70, 8, 4, 8);
        break;

      case 'julius':
        // Forest green suit (formal, distinguished)
        g.fillStyle(0x1B4D3E);
        g.fillRect(14, 58, 68, 38);
        g.fillRect(10, 62, 8, 34);
        g.fillRect(78, 62, 8, 34);
        // Suit lapels
        g.fillStyle(0x164035);
        g.fillRect(20, 60, 12, 20);
        g.fillRect(64, 60, 12, 20);
        // Gold tie
        g.fillStyle(0xBFA260);
        g.fillRect(44, 58, 8, 32);
        g.fillStyle(0xD4B470, 0.5);
        g.fillRect(46, 58, 4, 32); // tie highlight
        // Mist gray shirt
        g.fillStyle(0xA8B8B0);
        g.fillRect(36, 58, 24, 12);
        // Pocket square
        g.fillStyle(0xBFA260);
        g.fillRect(20, 64, 10, 8);
        g.fillStyle(0xD4B470, 0.3);
        g.fillRect(22, 64, 6, 4); // square highlight
        // Distinguished grey at temples
        g.fillStyle(0x606060, 0.4);
        g.fillRect(22, 16, 4, 12);
        g.fillRect(70, 16, 4, 12);
        break;
    }
  }

  generatePropTextures() {
    // Peppermint
    const pm = this.add.graphics();
    pm.fillStyle(0xffffff);
    pm.fillCircle(5, 5, 5);
    pm.fillStyle(0xE8192C);
    pm.fillRect(1, 4, 8, 2);
    pm.lineStyle(1, 0xE8192C, 0.5);
    pm.lineBetween(2, 2, 8, 8);
    pm.generateTexture('peppermint', 10, 10);
    pm.destroy();

    // Arrow indicator for doors
    const arrow = this.add.graphics();
    arrow.fillStyle(0x00E5FF, 0.5);
    arrow.fillTriangle(8, 0, 0, 12, 16, 12);
    arrow.generateTexture('arrow_up', 16, 12);
    arrow.destroy();

    const arrowDown = this.add.graphics();
    arrowDown.fillStyle(0x00E5FF, 0.5);
    arrowDown.fillTriangle(0, 0, 16, 0, 8, 12);
    arrowDown.generateTexture('arrow_down', 16, 12);
    arrowDown.destroy();
  }
}
