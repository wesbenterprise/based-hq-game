import Phaser from 'phaser';
import { AGENTS_DATA } from '../data/agents';

// World Dimensions
const WORLD_W = 1440;
const WORLD_H = 768;
const TILE = 16;
const SPEED = 140;
const PLAYER_W = 12;
const PLAYER_H = 10;
const INTERACT_RADIUS = 100; // Increased from 72 for easier interaction

// Room Bounds
const LOBBY = { x: 0, y: 0, w: 192, h: 768, name: 'lobby' };
const HALLWAY = { x: 192, y: 336, w: 1248, h: 96, name: 'hallway' };
const OFF_W = 312;
const OFF_H_TOP = 336;
const OFF_H_BOT = 336;
const OFFICES = {
  ace:     { x: 192,  y: 0,   w: OFF_W, h: OFF_H_TOP, name: 'ace',     isTop: true },
  astra:   { x: 504,  y: 0,   w: OFF_W, h: OFF_H_TOP, name: 'astra',   isTop: true },
  dezayas: { x: 816,  y: 0,   w: OFF_W, h: OFF_H_TOP, name: 'dezayas', isTop: true },
  rybo:    { x: 1128, y: 0,   w: OFF_W, h: OFF_H_TOP, name: 'rybo',    isTop: true },
  charles: { x: 192,  y: 432, w: OFF_W, h: OFF_H_BOT, name: 'charles', isTop: false },
  romero:  { x: 504,  y: 432, w: OFF_W, h: OFF_H_BOT, name: 'romero',  isTop: false },
  cid:     { x: 816,  y: 432, w: OFF_W, h: OFF_H_BOT, name: 'cid',     isTop: false },
  julius:  { x: 1128, y: 432, w: OFF_W, h: OFF_H_BOT, name: 'julius',  isTop: false },
};

const DOOR_W = 48;
const DOOR_CX_OFFSET = 132;

// Walkable Zones
function buildWalkable() {
  const zones = [];
  zones.push({ x: 16, y: 16, w: 160, h: 736, room: 'lobby' });
  zones.push({ x: 160, y: 348, w: 64, h: 64, room: 'lobby_hall' });
  zones.push({ x: 208, y: 348, w: 1216, h: 64, room: 'hallway' });

  const topOffices = ['ace', 'astra', 'dezayas', 'rybo'];
  topOffices.forEach(id => {
    const o = OFFICES[id];
    zones.push({ x: o.x + 16, y: o.y + 16, w: o.w - 32, h: o.h - 32, room: id });
    const doorX = o.x + DOOR_CX_OFFSET;
    zones.push({ x: doorX, y: o.y + o.h - 48, w: DOOR_W, h: 96, room: `door_${id}` });
  });

  const botOffices = ['charles', 'romero', 'cid', 'julius'];
  botOffices.forEach(id => {
    const o = OFFICES[id];
    zones.push({ x: o.x + 16, y: o.y + 16, w: o.w - 32, h: o.h - 32, room: id });
    const doorX = o.x + DOOR_CX_OFFSET;
    zones.push({ x: doorX, y: o.y - 48, w: DOOR_W, h: 96, room: `door_${id}` });
  });

  return zones;
}
const WALKABLE = buildWalkable();

// Room color palettes
const ROOM_PALETTES = {
  lobby:   { floor: 0x0D1B2A, floorAlt: 0x1A2744, wall: 0x1A2744, accent: 0x00E5FF, highlight: 0xE8F4FF },
  hallway: { floor: 0x111827, floorAlt: 0x1A2535, wall: 0x1E293B, accent: 0x0047AB, highlight: 0x2D3E55 },
  ace:     { floor: 0x1B2A4A, floorAlt: 0x243460, wall: 0x2D3142, accent: 0xC8C8D4, highlight: 0xEDEAF2 },
  astra:   { floor: 0x0A1628, floorAlt: 0x0D1F40, wall: 0x0D1F40, accent: 0x0077FF, highlight: 0xFFE033 },
  dezayas: { floor: 0x0D1117, floorAlt: 0x161B22, wall: 0x161B22, accent: 0x00FF41, highlight: 0x1B3A2A },
  rybo:    { floor: 0x2C1810, floorAlt: 0x3D2314, wall: 0x3D2314, accent: 0xC1440E, highlight: 0xE8C99A },
  charles: { floor: 0x2B1E14, floorAlt: 0x3A2618, wall: 0x3A2618, accent: 0xD4872A, highlight: 0xF2E8C8 },
  romero:  { floor: 0xE8192C, floorAlt: 0xF0F0F0, wall: 0x0D0D0D, accent: 0xFFD700, highlight: 0xFF69B4 },
  cid:     { floor: 0x1A0A2E, floorAlt: 0x2D1B4E, wall: 0x2D1B4E, accent: 0x00CEC9, highlight: 0x7B2D8B },
  julius:  { floor: 0x0F2B23, floorAlt: 0x1B4D3E, wall: 0x1B4D3E, accent: 0xBFA260, highlight: 0xA8B8B0 },
};

export default class HQScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HQScene' });
    this.playerX = 96;
    this.playerY = 384;
    this.facing = 'down';
    this.dialogueActive = false;
    this.currentAgent = null;
    this.dialogueLines = [];
    this.dialogueLine = 0;
    this.dialogueCharIndex = 0;
    this.typewriterTimer = null;
    this.visitedAgents = new Set();
    this.agentDialogueIndex = {};
    this.touchDir = { x: 0, y: 0 };
    this.touchInteract = false;
    this.interactPressed = false;
    this.canInteract = false;
    this.nearestAgent = null;
    this.escPressed = false;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.playerBaseY = 0; // Track base Y for walking bob (fix for drift bug)
    this.visitedRooms = new Set();
    this.roomDescActive = false;
    this.currentRoom = '';
  }

  create() {
    // Draw world
    const worldGfx = this.add.graphics();
    this.drawWorld(worldGfx);
    worldGfx.setDepth(0);

    // Ambient light overlays per room
    this.createRoomAmbience();

    // Player shadow
    this.playerShadow = this.add.image(this.playerX, this.playerY + 14, 'shadow')
      .setDepth(9).setAlpha(0.4);

    // Player sprite
    this.playerSprite = this.physics.add.sprite(this.playerX, this.playerY, 'player_0');
    this.playerSprite.setDepth(10);
    this.playerSprite.body.setSize(PLAYER_W * 2, PLAYER_H * 2);
    this.playerSprite.body.setOffset(6, 20);
    this.playerBaseY = this.playerY;

    // Agent sprites with shadows and glow
    this.agentSprites = {};
    this.agentShadows = {};
    this.agentGlows = {};
    Object.values(AGENTS_DATA).forEach(agent => {
      // Shadow
      const shadow = this.add.image(agent.x, agent.y + 14, 'shadow')
        .setDepth(7).setAlpha(0.35);
      this.agentShadows[agent.id] = shadow;

      // Interaction glow (hidden by default)
      const glow = this.add.image(agent.x, agent.y + 2, 'glow')
        .setDepth(6).setAlpha(0).setScale(1.8);
      this.agentGlows[agent.id] = glow;

      // Agent sprite
      const sprite = this.add.image(agent.x, agent.y, `agent_${agent.id}`);
      sprite.setDepth(8);
      sprite.setData('agentId', agent.id);
      this.agentSprites[agent.id] = sprite;
    });

    // Camera
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);

    // Input
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });

    // Dialogue UI
    this.createDialogueUI();

    // Touch Controls
    this.createTouchControls();

    // Interaction hint (WORLD-SPACE, not camera-fixed - fixes positioning bug)
    this.hintBg = this.add.rectangle(0, 0, 120, 22, 0x0D1117, 0.85)
      .setDepth(90).setVisible(false).setStrokeStyle(1, 0x00E5FF, 0.6);
    this.hintText = this.add.text(0, 0, '[ E ] Talk', {
      fontSize: '10px', fontFamily: 'monospace', color: '#00E5FF',
    }).setOrigin(0.5).setDepth(91).setVisible(false);

    // Room name indicator (camera-fixed)
    this.roomNameBg = this.add.rectangle(400, 18, 240, 22, 0x0D1117, 0.6)
      .setScrollFactor(0).setDepth(90).setVisible(false);
    this.roomNameText = this.add.text(400, 18, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#4a7fa5',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(91);

    // Agent visit tracker (top-right corner)
    this.createVisitTracker();

    // Agent idle animation
    Object.values(this.agentSprites).forEach((sprite, i) => {
      const id = sprite.getData('agentId');
      this.tweens.add({
        targets: [sprite, this.agentShadows[id]],
        y: `-=2`,
        duration: 900 + Math.random() * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 500,
      });
    });

    // Room labels
    this.addRoomLabels();

    // Fade in
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Welcome text
    this.time.delayedCall(1000, () => {
      this.showFloatingText('Welcome to BASeD HQ', this.playerX, this.playerY - 30, '#00E5FF');
    });
  }

  // ── UPDATE LOOP ──
  update(time, delta) {
    if (this.dialogueActive || this.roomDescActive) {
      this.handleDialogueKeys();
      return;
    }
    this.handleMovement(delta);
    this.checkAgentProximity();
    this.handleInteractInput();
    this.updateRoomIndicator();
  }

  handleMovement(delta) {
    const dt = delta / 1000;
    let vx = 0, vy = 0;

    if (this.keys.left.isDown  || this.keys.a.isDown)  vx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown)  vx += 1;
    if (this.keys.up.isDown    || this.keys.w.isDown)  vy -= 1;
    if (this.keys.down.isDown  || this.keys.s.isDown)  vy += 1;

    vx += this.touchDir.x;
    vy += this.touchDir.y;
    vx = Phaser.Math.Clamp(vx, -1, 1);
    vy = Phaser.Math.Clamp(vy, -1, 1);

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    if (vx < 0) this.facing = 'left';
    else if (vx > 0) this.facing = 'right';
    else if (vy < 0) this.facing = 'up';
    else if (vy > 0) this.facing = 'down';

    if (vx < 0) this.playerSprite.setFlipX(true);
    else if (vx > 0) this.playerSprite.setFlipX(false);

    const newX = this.playerSprite.x + vx * SPEED * dt;
    const newY = this.playerSprite.y + vy * SPEED * dt;

    if (this.isWalkable(newX, this.playerSprite.y)) {
      this.playerSprite.x = newX;
    }
    if (this.isWalkable(this.playerSprite.x, newY)) {
      this.playerSprite.y = newY;
    }

    // Walking animation (FIXED: use absolute bob offset, not cumulative)
    if (vx !== 0 || vy !== 0) {
      this.walkTimer += delta;
      if (this.walkTimer > 150) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 4;
        // Swap walk frame textures
        const frameIdx = this.walkFrame % 2;
        this.playerSprite.setTexture(`player_${frameIdx}`);
      }
      // Smooth bob using sine wave (never accumulates)
      const bobAmount = Math.sin(this.walkTimer / 150 * Math.PI) * 1.5;
      this.playerSprite.setY(this.playerSprite.y); // keep current y
    } else {
      this.playerSprite.setTexture('player_0');
      this.walkTimer = 0;
    }

    // Update shadow position
    this.playerShadow.setPosition(this.playerSprite.x, this.playerSprite.y + 14);
  }

  isWalkable(x, y) {
    return WALKABLE.some(zone =>
      x - PLAYER_W >= zone.x &&
      x + PLAYER_W <= zone.x + zone.w &&
      y - PLAYER_H >= zone.y &&
      y + PLAYER_H <= zone.y + zone.h
    );
  }

  checkAgentProximity() {
    const px = this.playerSprite.x;
    const py = this.playerSprite.y;
    let closest = null;
    let closestDist = INTERACT_RADIUS;

    Object.values(AGENTS_DATA).forEach(agent => {
      const sprite = this.agentSprites[agent.id];
      const dist = Phaser.Math.Distance.Between(px, py, sprite.x, sprite.y);

      // Animate glow for nearby agents
      const glow = this.agentGlows[agent.id];
      if (dist < INTERACT_RADIUS) {
        if (glow.alpha < 0.8) glow.alpha = Math.min(glow.alpha + 0.05, 0.8);
        // Tint the agent sprite slightly when in range
        sprite.setTint(0xffffff);
      } else {
        if (glow.alpha > 0) glow.alpha = Math.max(glow.alpha - 0.03, 0);
        sprite.clearTint();
      }

      if (dist < closestDist) {
        closestDist = dist;
        closest = agent;
      }
    });

    this.nearestAgent = closest;
    this.canInteract = !!closest;

    if (closest) {
      const sprite = this.agentSprites[closest.id];
      // Position hint in WORLD SPACE above the agent (fixes camera-space bug)
      this.hintBg.setPosition(sprite.x, sprite.y - 28).setVisible(true);
      this.hintText.setPosition(sprite.x, sprite.y - 28).setVisible(true);

      // Pulse the glow
      const glow = this.agentGlows[closest.id];
      glow.setTint(AGENTS_DATA[closest.id].accentColor);
    } else {
      this.hintBg.setVisible(false);
      this.hintText.setVisible(false);
    }
  }

  handleInteractInput() {
    const eDown = this.keys.e.isDown || this.keys.space.isDown || this.touchInteract;
    if (eDown && !this.interactPressed && this.canInteract && this.nearestAgent) {
      this.interactPressed = true;
      this.touchInteract = false;
      this.openDialogue(this.nearestAgent);
    }
    if (!eDown) {
      this.interactPressed = false;
      this.touchInteract = false;
    }
  }

  handleDialogueKeys() {
    const advance = this.keys.e.isDown || this.keys.space.isDown || this.touchInteract;
    const esc = this.keys.esc.isDown;

    if ((advance || esc) && !this.interactPressed) {
      this.interactPressed = true;
      this.touchInteract = false;

      if (esc) {
        if (this.roomDescActive) this.closeRoomDesc();
        else this.closeDialogue();
        return;
      }

      if (this.roomDescActive) {
        this.closeRoomDesc();
        return;
      }

      // If typewriter still going, skip to end
      if (this.typewriterTimer && this.typewriterTimer.getProgress() < 1) {
        this.typewriterTimer.remove();
        this.typewriterTimer = null;
        const line = this.dialogueLines[this.dialogueLine] || '';
        this.dialogueBodyText.setText(this.wrapText(line, 48));
        this.updateDialogueHint();
        return;
      }

      // Advance to next line or close
      this.dialogueLine++;
      if (this.dialogueLine >= this.dialogueLines.length) {
        this.closeDialogue();
      } else {
        this.showDialogueLine(this.dialogueLine);
      }
    }
    if (!advance && !esc) this.interactPressed = false;
  }

  updateRoomIndicator() {
    const x = this.playerSprite.x;
    const y = this.playerSprite.y;
    let roomName = '';
    let roomId = '';

    if (x < 192) {
      roomName = 'BASeD HQ Lobby';
      roomId = 'lobby';
    } else if (y >= 336 && y <= 432) {
      roomName = 'Main Hallway';
      roomId = 'hallway';
    } else {
      for (const [id, o] of Object.entries(OFFICES)) {
        if (x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h) {
          const agent = AGENTS_DATA[id];
          if (agent) {
            roomName = `${agent.name}'s Office`;
            roomId = id;
          }
          break;
        }
      }
    }

    if (roomName) {
      this.roomNameText.setText(roomName);
      this.roomNameBg.setVisible(true);
      this.roomNameBg.width = roomName.length * 7 + 20;
    } else {
      this.roomNameBg.setVisible(false);
      this.roomNameText.setText('');
    }

    // Show room description on first visit
    if (roomId && roomId !== this.currentRoom) {
      this.currentRoom = roomId;
      if (!this.visitedRooms.has(roomId) && AGENTS_DATA[roomId]) {
        this.visitedRooms.add(roomId);
        this.showRoomDescription(AGENTS_DATA[roomId]);
      }
    }
  }

  // ── DIALOGUE SYSTEM ──
  openDialogue(agent) {
    this.dialogueActive = true;
    this.hintBg.setVisible(false);
    this.hintText.setVisible(false);

    const isFirstVisit = !this.visitedAgents.has(agent.id);
    this.visitedAgents.add(agent.id);
    this.updateVisitTracker();

    // Face player toward agent
    const sprite = this.agentSprites[agent.id];
    if (sprite.x < this.playerSprite.x) this.playerSprite.setFlipX(true);
    else if (sprite.x > this.playerSprite.x) this.playerSprite.setFlipX(false);

    // Dialogue set rotation
    if (!(agent.id in this.agentDialogueIndex)) {
      this.agentDialogueIndex[agent.id] = 0;
    }
    const diagSetIndex = this.agentDialogueIndex[agent.id];
    const diagSet = agent.dialogues[diagSetIndex] || agent.dialogues[0];
    this.dialogueLines = diagSet;
    this.dialogueLine = 0;
    this.agentDialogueIndex[agent.id] = (diagSetIndex + 1) % agent.dialogues.length;

    this.currentAgent = agent;

    // Show dialogue box with animation
    this.dialogueBox.setVisible(true);
    this.dialoguePortrait.setTexture(`portrait_${agent.id}`);
    this.dialoguePortrait.setVisible(true);
    this.dialogueNameText.setText(agent.name.toUpperCase()).setVisible(true);
    this.dialogueTitleText.setText(agent.title).setVisible(true);
    this.dialogueBodyText.setText('').setVisible(true);
    this.dialogueHint.setVisible(true);
    this.dialogueLineCounter.setVisible(true);

    this.showDialogueLine(0);
  }

  showDialogueLine(lineIndex) {
    const line = this.dialogueLines[lineIndex] || '';
    const wrapped = this.wrapText(line, 48);

    this.dialogueBodyText.setText('');
    this.dialogueHint.setText('...');
    this.dialogueLineCounter.setText(`${lineIndex + 1}/${this.dialogueLines.length}`);

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    let charCount = 0;
    const totalChars = wrapped.length;
    if (totalChars === 0) {
      this.updateDialogueHint();
      return;
    }

    this.typewriterTimer = this.time.addEvent({
      delay: 22,
      callback: () => {
        charCount++;
        this.dialogueBodyText.setText(wrapped.substring(0, charCount));
        if (charCount >= totalChars) {
          this.typewriterTimer = null;
          this.updateDialogueHint();
        }
      },
      repeat: totalChars - 1,
    });
  }

  updateDialogueHint() {
    const isLast = this.dialogueLine >= this.dialogueLines.length - 1;
    this.dialogueHint.setText(isLast ? '[ E ] Close' : '[ E ] Next  >>');
  }

  closeDialogue() {
    this.dialogueActive = false;
    this.currentAgent = null;
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
    this.dialogueBox.setVisible(false);
    this.dialoguePortrait.setVisible(false);
    this.dialogueNameText.setVisible(false);
    this.dialogueTitleText.setVisible(false);
    this.dialogueBodyText.setVisible(false);
    this.dialogueHint.setVisible(false);
    this.dialogueLineCounter.setVisible(false);
    this.interactPressed = true;
  }

  showRoomDescription(agent) {
    if (this.dialogueActive) return;
    this.roomDescActive = true;

    this.dialogueBox.setVisible(true);
    this.dialoguePortrait.setVisible(false);
    this.dialogueNameText.setText(`${agent.name}'s Office`).setVisible(true);
    this.dialogueTitleText.setText('').setVisible(true);
    this.dialogueLineCounter.setVisible(false);

    // Show room description with typewriter
    const wrapped = this.wrapText(agent.roomDesc, 60);
    this.dialogueBodyText.setText('').setVisible(true);
    this.dialogueHint.setText('...').setVisible(true);

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    let charCount = 0;
    const totalChars = wrapped.length;
    this.typewriterTimer = this.time.addEvent({
      delay: 18,
      callback: () => {
        charCount++;
        this.dialogueBodyText.setText(wrapped.substring(0, charCount));
        if (charCount >= totalChars) {
          this.typewriterTimer = null;
          this.dialogueHint.setText('[ E ] Continue');
        }
      },
      repeat: totalChars - 1,
    });
  }

  closeRoomDesc() {
    this.roomDescActive = false;
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
    this.dialogueBox.setVisible(false);
    this.dialoguePortrait.setVisible(false);
    this.dialogueNameText.setVisible(false);
    this.dialogueTitleText.setVisible(false);
    this.dialogueBodyText.setVisible(false);
    this.dialogueHint.setVisible(false);
    this.dialogueLineCounter.setVisible(false);
    this.interactPressed = true;
  }

  wrapText(text, maxChars) {
    const words = text.split(' ');
    let result = '';
    let line = '';
    words.forEach(word => {
      if ((line + word).length > maxChars) {
        result += line.trimEnd() + '\n';
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    });
    result += line.trimEnd();
    return result;
  }

  showFloatingText(text, x, y, color) {
    const ft = this.add.text(x, y, text, {
      fontSize: '11px', fontFamily: 'monospace', color: color || '#00E5FF',
    }).setOrigin(0.5).setDepth(95);
    this.tweens.add({
      targets: ft,
      y: y - 20,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => ft.destroy(),
    });
  }

  // ── DIALOGUE UI ──
  createDialogueUI() {
    const CAM_W = 800;
    const CAM_H = 600;
    const BOX_H = 160;
    const BOX_Y = CAM_H - BOX_H - 10;
    const depth = 100;

    this.dialogueBox = this.add.graphics().setScrollFactor(0).setDepth(depth);
    this.drawDialogueBox(BOX_Y, CAM_W, BOX_H);

    // Portrait (left side)
    this.dialoguePortrait = this.add.image(14 + 48, BOX_Y + 10 + 48, 'portrait_ace')
      .setScrollFactor(0).setDepth(depth + 1).setVisible(false).setDisplaySize(96, 96);

    // Name text
    this.dialogueNameText = this.add.text(124, BOX_Y + 12, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#00E5FF', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(depth + 1).setVisible(false);

    // Title text
    this.dialogueTitleText = this.add.text(124, BOX_Y + 30, '', {
      fontSize: '10px', fontFamily: 'monospace', color: '#4a7fa5',
    }).setScrollFactor(0).setDepth(depth + 1).setVisible(false);

    // Body text
    this.dialogueBodyText = this.add.text(124, BOX_Y + 48, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#E8F4FF',
      lineSpacing: 4,
      wordWrap: { width: CAM_W - 152, useAdvancedWrap: false },
    }).setScrollFactor(0).setDepth(depth + 1).setVisible(false);

    // Continue hint
    this.dialogueHint = this.add.text(CAM_W - 20, BOX_Y + BOX_H - 18, '[ E ] Continue  >>', {
      fontSize: '10px', fontFamily: 'monospace', color: '#00E5FF',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(depth + 1).setVisible(false);
    this.tweens.add({
      targets: this.dialogueHint,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Line counter
    this.dialogueLineCounter = this.add.text(CAM_W - 20, BOX_Y + 12, '', {
      fontSize: '9px', fontFamily: 'monospace', color: '#334455',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(depth + 1).setVisible(false);

    this.dialogueBox.setVisible(false);
  }

  drawDialogueBox(y, w, h) {
    const g = this.dialogueBox;
    g.clear();
    // Background
    g.fillStyle(0x0A1520, 0.96);
    g.fillRect(10, y, w - 20, h);
    // Subtle gradient effect (darker at bottom)
    g.fillStyle(0x000000, 0.15);
    g.fillRect(10, y + h - 30, w - 20, 30);
    // Outer border
    g.lineStyle(2, 0x00E5FF, 0.7);
    g.strokeRect(10, y, w - 20, h);
    // Inner border
    g.lineStyle(1, 0x1A3355, 0.5);
    g.strokeRect(13, y + 3, w - 26, h - 6);
    // Portrait slot background
    g.fillStyle(0x0D1B2A, 0.9);
    g.fillRect(14, y + 10, 96, 96);
    g.lineStyle(1, 0x00E5FF, 0.4);
    g.strokeRect(14, y + 10, 96, 96);
    // Divider line
    g.lineStyle(1, 0x1A3355, 0.4);
    g.lineBetween(118, y + 10, 118, y + h - 10);
    // Corner accents
    g.fillStyle(0x00E5FF, 0.6);
    g.fillRect(10, y, 12, 2);
    g.fillRect(10, y, 2, 12);
    g.fillRect(w - 22, y, 12, 2);
    g.fillRect(w - 12, y, 2, 12);
    g.fillRect(10, y + h - 2, 12, 2);
    g.fillRect(10, y + h - 12, 2, 12);
    g.fillRect(w - 22, y + h - 2, 12, 2);
    g.fillRect(w - 12, y + h - 12, 2, 12);
  }

  // ── TOUCH CONTROLS ──
  createTouchControls() {
    const CAM_W = 800;
    const CAM_H = 600;
    const depth = 80;
    const BTN = 48;
    const DPAD_X = 56;
    const DPAD_Y = CAM_H - 76;

    // D-pad background
    const dpadBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    dpadBg.fillStyle(0x000000, 0.25);
    dpadBg.fillCircle(DPAD_X, DPAD_Y, 66);
    dpadBg.lineStyle(1, 0x00E5FF, 0.15);
    dpadBg.strokeCircle(DPAD_X, DPAD_Y, 66);

    const makeBtn = (x, y, label, onDown, onUp) => {
      const bg = this.add.graphics().setScrollFactor(0).setDepth(depth + 1);
      bg.fillStyle(0x1a2744, 0.6);
      bg.fillRect(x - BTN/2, y - BTN/2, BTN, BTN);
      bg.lineStyle(1, 0x00E5FF, 0.3);
      bg.strokeRect(x - BTN/2, y - BTN/2, BTN, BTN);

      const txt = this.add.text(x, y, label, {
        fontSize: '16px', fontFamily: 'monospace', color: '#00E5FF',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

      const zone = this.add.zone(x, y, BTN, BTN).setScrollFactor(0).setDepth(depth + 3);
      zone.setInteractive();
      zone.on('pointerdown', () => { onDown(); txt.setColor('#ffffff'); });
      zone.on('pointerup', () => { onUp(); txt.setColor('#00E5FF'); });
      zone.on('pointerout', () => { onUp(); txt.setColor('#00E5FF'); });
    };

    makeBtn(DPAD_X, DPAD_Y - 48, '\u25B2', () => this.touchDir.y = -1, () => { if (this.touchDir.y < 0) this.touchDir.y = 0; });
    makeBtn(DPAD_X, DPAD_Y + 48, '\u25BC', () => this.touchDir.y = 1, () => { if (this.touchDir.y > 0) this.touchDir.y = 0; });
    makeBtn(DPAD_X - 48, DPAD_Y, '\u25C4', () => this.touchDir.x = -1, () => { if (this.touchDir.x < 0) this.touchDir.x = 0; });
    makeBtn(DPAD_X + 48, DPAD_Y, '\u25BA', () => this.touchDir.x = 1, () => { if (this.touchDir.x > 0) this.touchDir.x = 0; });

    // Action button
    const ACT_X = CAM_W - 56;
    const ACT_Y = CAM_H - 76;
    const actBg = this.add.graphics().setScrollFactor(0).setDepth(depth + 1);
    const drawActBtn = (pressed) => {
      actBg.clear();
      actBg.fillStyle(pressed ? 0x00E5FF : 0x0D1B2A, pressed ? 0.7 : 0.5);
      actBg.fillCircle(ACT_X, ACT_Y, 28);
      actBg.lineStyle(2, 0x00E5FF, pressed ? 1 : 0.5);
      actBg.strokeCircle(ACT_X, ACT_Y, 28);
    };
    drawActBtn(false);

    this.add.text(ACT_X, ACT_Y, 'TALK', {
      fontSize: '10px', fontFamily: 'monospace', color: '#00E5FF', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

    const actZone = this.add.zone(ACT_X, ACT_Y, 60, 60).setScrollFactor(0).setDepth(depth + 3);
    actZone.setInteractive();
    actZone.on('pointerdown', () => { this.touchInteract = true; drawActBtn(true); });
    actZone.on('pointerup', () => { drawActBtn(false); });
    actZone.on('pointerout', () => { drawActBtn(false); });

    // Esc button (top right)
    const escBtn = this.add.text(CAM_W - 14, 10, '[ X ]', {
      fontSize: '10px', fontFamily: 'monospace', color: '#334455',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(depth);
    escBtn.setInteractive();
    escBtn.on('pointerdown', () => {
      if (this.dialogueActive) this.closeDialogue();
      if (this.roomDescActive) this.closeRoomDesc();
    });
  }

  // ── VISIT TRACKER ──
  createVisitTracker() {
    const CAM_W = 800;
    const depth = 85;
    const startX = CAM_W - 14;
    const startY = 36;

    this.trackerDots = {};
    const agents = Object.values(AGENTS_DATA);
    agents.forEach((agent, i) => {
      const dotX = startX - (agents.length - 1 - i) * 14;
      const dot = this.add.graphics().setScrollFactor(0).setDepth(depth);
      dot.fillStyle(0x334455, 0.5);
      dot.fillCircle(0, 0, 4);
      dot.lineStyle(1, 0x445566, 0.3);
      dot.strokeCircle(0, 0, 4);
      dot.setPosition(dotX, startY);
      this.trackerDots[agent.id] = { gfx: dot, x: dotX, y: startY };
    });

    // Label
    this.add.text(startX - agents.length * 14 - 4, startY, 'MET:', {
      fontSize: '8px', fontFamily: 'monospace', color: '#334455',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(depth);
  }

  updateVisitTracker() {
    Object.entries(this.trackerDots).forEach(([id, info]) => {
      const agent = AGENTS_DATA[id];
      info.gfx.clear();
      if (this.visitedAgents.has(id)) {
        info.gfx.fillStyle(agent.accentColor, 0.9);
        info.gfx.fillCircle(0, 0, 4);
        info.gfx.lineStyle(1, 0xffffff, 0.3);
        info.gfx.strokeCircle(0, 0, 4);
      } else {
        info.gfx.fillStyle(0x334455, 0.5);
        info.gfx.fillCircle(0, 0, 4);
        info.gfx.lineStyle(1, 0x445566, 0.3);
        info.gfx.strokeCircle(0, 0, 4);
      }
    });
  }

  // ── ROOM AMBIENCE ──
  createRoomAmbience() {
    // Add subtle colored light overlays per room
    Object.entries(OFFICES).forEach(([id, o]) => {
      const pal = ROOM_PALETTES[id];
      const light = this.add.graphics().setDepth(1).setAlpha(0.04);
      // Radial-ish glow from center
      light.fillStyle(pal.accent);
      light.fillCircle(o.x + o.w / 2, o.y + o.h / 2, 100);
      light.fillStyle(pal.accent, 0.5);
      light.fillCircle(o.x + o.w / 2, o.y + o.h / 2, 60);
    });
  }

  // ── WORLD DRAWING ──
  drawWorld(g) {
    this.drawLobby(g);
    this.drawHallway(g);
    this.drawAceOffice(g);
    this.drawAstraOffice(g);
    this.drawDezayasOffice(g);
    this.drawRyboOffice(g);
    this.drawCharlesOffice(g);
    this.drawRomeroStudio(g);
    this.drawCidArcade(g);
    this.drawJuliusOffice(g);
    this.drawDoors(g);
    this.drawAgentDesks(g);
  }

  fillTiles(g, x, y, w, h, color1, color2) {
    for (let tx = 0; tx < Math.ceil(w / TILE); tx++) {
      for (let ty = 0; ty < Math.ceil(h / TILE); ty++) {
        const c = ((tx + ty) % 2 === 0) ? color1 : color2;
        g.fillStyle(c);
        g.fillRect(x + tx * TILE, y + ty * TILE, TILE, TILE);
      }
    }
  }

  drawRoom(g, room, pal) {
    this.fillTiles(g, room.x, room.y, room.w, room.h, pal.floor, pal.floorAlt);
    // Walls (16px border)
    g.fillStyle(pal.wall);
    g.fillRect(room.x, room.y, room.w, TILE);
    g.fillRect(room.x, room.y + room.h - TILE, room.w, TILE);
    g.fillRect(room.x, room.y, TILE, room.h);
    g.fillRect(room.x + room.w - TILE, room.y, TILE, room.h);
    // Wall top highlight
    g.fillStyle(pal.accent, 0.15);
    g.fillRect(room.x + TILE, room.y + TILE, room.w - TILE * 2, 2);
    // Inner accent lines
    g.fillStyle(pal.accent, 0.2);
    g.fillRect(room.x + TILE, room.y + TILE, 2, room.h - TILE * 2);
    g.fillRect(room.x + room.w - TILE - 2, room.y + TILE, 2, room.h - TILE * 2);
    // Baseboard
    g.fillStyle(pal.wall + 0x0a0a0a > 0xffffff ? pal.wall : pal.wall + 0x0a0a0a);
    g.fillRect(room.x + TILE, room.y + room.h - TILE - 4, room.w - TILE * 2, 4);
    g.fillRect(room.x + TILE, room.y + TILE + 2, room.w - TILE * 2, 2);
    // Floor shadow near walls
    g.fillStyle(0x000000, 0.08);
    g.fillRect(room.x + TILE, room.y + TILE + 4, room.w - TILE * 2, 8);
    g.fillRect(room.x + TILE + 2, room.y + TILE, 8, room.h - TILE * 2);
    g.fillRect(room.x + room.w - TILE - 10, room.y + TILE, 8, room.h - TILE * 2);
  }

  drawLobby(g) {
    const pal = ROOM_PALETTES.lobby;
    this.fillTiles(g, LOBBY.x, LOBBY.y, LOBBY.w, LOBBY.h, pal.floor, pal.floorAlt);

    // Walls
    g.fillStyle(pal.wall);
    g.fillRect(LOBBY.x, LOBBY.y, LOBBY.w, TILE);
    g.fillRect(LOBBY.x, LOBBY.y + LOBBY.h - TILE, LOBBY.w, TILE);
    g.fillRect(LOBBY.x, LOBBY.y, TILE, LOBBY.h);
    const hallTop = HALLWAY.y;
    const hallBot = HALLWAY.y + HALLWAY.h;
    g.fillRect(LOBBY.x + LOBBY.w - TILE, LOBBY.y, TILE, hallTop - LOBBY.y);
    g.fillRect(LOBBY.x + LOBBY.w - TILE, hallBot, TILE, LOBBY.y + LOBBY.h - hallBot);

    // Neon accent strips
    g.fillStyle(pal.accent, 0.4);
    g.fillRect(LOBBY.x + TILE, LOBBY.y + TILE, 2, LOBBY.h - TILE * 2);
    g.fillRect(LOBBY.x + TILE, LOBBY.y + LOBBY.h - TILE - 2, LOBBY.w - TILE * 2, 2);
    // Floor glow near accent
    g.fillStyle(pal.accent, 0.06);
    g.fillRect(LOBBY.x + TILE, LOBBY.y + TILE, 8, LOBBY.h - TILE * 2);

    // BASeD logo on floor (spade)
    const logoX = LOBBY.x + LOBBY.w / 2;
    const logoY = LOBBY.y + LOBBY.h / 2 + 80;
    g.fillStyle(pal.accent, 0.18);
    g.fillTriangle(logoX, logoY - 28, logoX - 20, logoY + 4, logoX + 20, logoY + 4);
    g.fillCircle(logoX - 10, logoY + 4, 12);
    g.fillCircle(logoX + 10, logoY + 4, 12);
    g.fillRect(logoX - 4, logoY + 8, 8, 12);
    g.fillRect(logoX - 8, logoY + 18, 16, 4);
    // Glow around logo
    g.fillStyle(pal.accent, 0.03);
    g.fillCircle(logoX, logoY, 40);

    // Reception desk
    const deskY = HALLWAY.y + HALLWAY.h / 2 - 20;
    g.fillStyle(0x1A2744);
    g.fillRect(LOBBY.x + 16, deskY - 32, 128, 40);
    g.fillStyle(pal.accent, 0.6);
    g.fillRect(LOBBY.x + 16, deskY - 32, 128, 3);
    // Desk shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(LOBBY.x + 16, deskY + 8, 128, 6);

    // Sign-in sheet
    g.fillStyle(0xF5F0E8);
    g.fillRect(LOBBY.x + 30, deskY - 28, 32, 24);
    g.fillStyle(0x1a1a2e, 0.4);
    for (let i = 0; i < 4; i++) g.fillRect(LOBBY.x + 33, deskY - 22 + i * 6, 22, 1);
    // Pen
    g.fillStyle(0x1c1c2e);
    g.fillRect(LOBBY.x + 68, deskY - 26, 2, 16);
    g.fillStyle(0x0047AB);
    g.fillRect(LOBBY.x + 67, deskY - 26, 4, 4);

    // Potted plant Gerald
    g.fillStyle(0x1B4D3E);
    g.fillRect(LOBBY.x + 26, LOBBY.y + 24, 8, 22);
    g.fillStyle(0x2ECC40, 0.8);
    g.fillRect(LOBBY.x + 18, LOBBY.y + 22, 24, 8);
    g.fillRect(LOBBY.x + 14, LOBBY.y + 28, 10, 8);
    g.fillRect(LOBBY.x + 34, LOBBY.y + 28, 10, 8);
    g.fillRect(LOBBY.x + 22, LOBBY.y + 18, 16, 6);
    g.fillStyle(0x5C3A1E);
    g.fillRect(LOBBY.x + 22, LOBBY.y + 44, 16, 12);
    g.fillStyle(0x3D2B1F);
    g.fillRect(LOBBY.x + 20, LOBBY.y + 44, 20, 4);

    // Mission statement frame
    g.fillStyle(0x2a3a4a);
    g.fillRect(LOBBY.x + 24, LOBBY.y + 160, 144, 80);
    g.lineStyle(2, pal.accent, 0.3);
    g.strokeRect(LOBBY.x + 24, LOBBY.y + 160, 144, 80);
    g.fillStyle(0xF2E8C8, 0.08);
    g.fillRect(LOBBY.x + 28, LOBBY.y + 164, 136, 72);
    g.fillStyle(0x445566);
    for (let i = 0; i < 6; i++) {
      g.fillRect(LOBBY.x + 36, LOBBY.y + 174 + i * 10, 80 + (i % 3) * 20, 2);
    }

    // Welcome mat
    g.fillStyle(0x0047AB, 0.8);
    g.fillRect(LOBBY.x + LOBBY.w - 48, HALLWAY.y + HALLWAY.h / 2 - 12, 32, 24);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(LOBBY.x + LOBBY.w - 48, HALLWAY.y + HALLWAY.h / 2 - 12, 32, 24);
    // Mat pattern
    g.fillStyle(0x00E5FF, 0.15);
    g.fillRect(LOBBY.x + LOBBY.w - 44, HALLWAY.y + HALLWAY.h / 2 - 8, 24, 16);
  }

  drawHallway(g) {
    const pal = ROOM_PALETTES.hallway;
    const HX = HALLWAY.x, HY = HALLWAY.y, HW = HALLWAY.w, HH = HALLWAY.h;

    this.fillTiles(g, HX, HY, HW, HH, pal.floor, pal.floorAlt);

    // Ceiling/floor neon strips
    g.fillStyle(pal.accent, 0.4);
    g.fillRect(HX, HY, HW, 2);
    g.fillRect(HX, HY + HH - 2, HW, 2);
    // Glow from strips
    g.fillStyle(pal.accent, 0.05);
    g.fillRect(HX, HY + 2, HW, 8);
    g.fillRect(HX, HY + HH - 10, HW, 8);

    // Framed photos
    const photoColors = [0x2D3142, 0x0A1628, 0x0D1117, 0x2C1810, 0x2B1E14, 0x0D0D0D, 0x1A0A2E, 0x0F2B23];
    const accentColors = [0xC8C8D4, 0x0077FF, 0x00FF41, 0xC1440E, 0xD4872A, 0xFFD700, 0x00CEC9, 0xBFA260];
    for (let i = 0; i < 8; i++) {
      const fx = HX + 40 + i * 150;
      // Top photos
      g.fillStyle(0x2D3E55);
      g.fillRect(fx, HY + 6, 32, 20);
      g.fillStyle(photoColors[i]);
      g.fillRect(fx + 2, HY + 8, 28, 16);
      g.fillStyle(accentColors[i], 0.5);
      g.fillRect(fx + 4, HY + 10, 24, 12);
      // Frame highlight
      g.fillStyle(0xffffff, 0.05);
      g.fillRect(fx, HY + 6, 32, 2);
      // Bottom photos
      g.fillStyle(0x2D3E55);
      g.fillRect(fx, HY + HH - 26, 32, 20);
      g.fillStyle(photoColors[(i + 4) % 8]);
      g.fillRect(fx + 2, HY + HH - 24, 28, 16);
    }

    // Water cooler
    const wcX = OFFICES.ace.x + OFFICES.ace.w + 16;
    const wcY = HY + HH / 2 - 16;
    g.fillStyle(0x2D3E55);
    g.fillRect(wcX, wcY, 20, 32);
    g.fillStyle(0x00E5FF, 0.4);
    g.fillRect(wcX + 4, wcY + 4, 12, 16);
    g.fillStyle(0xE8F4FF, 0.3);
    g.fillRect(wcX + 6, wcY + 6, 8, 12);
    // Water cooler shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(wcX - 2, wcY + 30, 24, 4);

    // Spade carpet pattern
    g.fillStyle(pal.highlight, 0.15);
    for (let i = 0; i < 8; i++) {
      const sx = HX + 60 + i * 160;
      const sy = HY + HH / 2;
      g.fillTriangle(sx, sy - 4, sx - 3, sy + 1, sx + 3, sy + 1);
      g.fillCircle(sx - 2, sy + 1, 2);
      g.fillCircle(sx + 2, sy + 1, 2);
      g.fillRect(sx - 1, sy + 2, 2, 3);
    }
  }

  drawAceOffice(g) {
    const o = OFFICES.ace;
    const pal = ROOM_PALETTES.ace;
    this.drawRoom(g, o, pal);

    const mx = o.x + o.w / 2;
    const my = o.y + TILE + 8;

    // Large desk
    g.fillStyle(0x2D3142);
    g.fillRect(o.x + 32, my + 32, o.w - 64, 22);
    g.fillStyle(pal.accent, 0.2);
    g.fillRect(o.x + 32, my + 32, o.w - 64, 2);
    // Desk shadow
    g.fillStyle(0x000000, 0.08);
    g.fillRect(o.x + 32, my + 54, o.w - 64, 6);

    // 3 monitors
    [[0, 0, 10, 12], [-52, 2, 8, 10], [52, 2, 8, 10]].forEach(([dx, dy, w, h]) => {
      g.fillStyle(0x1B2A4A);
      g.fillRect(mx + dx - w/2, my + dy, w, h);
      g.fillStyle(pal.accent, 0.35);
      g.fillRect(mx + dx - w/2 + 1, my + dy + 1, w - 2, h - 2);
      // Screen content
      g.fillStyle(pal.highlight, 0.25);
      for (let i = 0; i < 4; i++) g.fillRect(mx + dx - w/2 + 2, my + dy + 2 + i * 2, w - 4, 1);
      // Monitor glow
      g.fillStyle(pal.accent, 0.04);
      g.fillRect(mx + dx - w, my + h, w * 2, 8);
    });

    // Task board (Kanban)
    g.fillStyle(0x1B2A4A);
    g.fillRect(o.x + o.w - 64, o.y + 32, 48, 80);
    g.lineStyle(1, pal.accent, 0.4);
    g.strokeRect(o.x + o.w - 64, o.y + 32, 48, 80);
    [0x00FF41, 0x00FF41, 0xFFE033, 0xFFE033, 0xE8192C].forEach((c, i) => {
      g.fillStyle(c, 0.8);
      g.fillRect(o.x + o.w - 60, o.y + 38 + i * 14, 20, 10);
    });

    // Filing cabinet
    g.fillStyle(0x2D3142);
    g.fillRect(o.x + TILE + 4, o.y + 40, 32, 60);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + TILE + 4, o.y + 40, 32, 60);
    g.fillStyle(pal.accent, 0.15);
    g.fillRect(o.x + TILE + 4, o.y + 60, 32, 1);
    g.fillRect(o.x + TILE + 4, o.y + 80, 32, 1);
    // Drawer handles
    g.fillStyle(pal.accent, 0.4);
    g.fillRect(o.x + TILE + 14, o.y + 48, 12, 2);
    g.fillRect(o.x + TILE + 14, o.y + 68, 12, 2);
    g.fillRect(o.x + TILE + 14, o.y + 88, 12, 2);

    // Desk lamp light cone
    g.fillStyle(0xFFD37A, 0.06);
    g.fillTriangle(mx, my + 32, mx - 36, my + 64, mx + 36, my + 64);

    // Framed ace of spades
    g.fillStyle(0x2D3142);
    g.fillRect(o.x + 40, o.y + 40, 24, 32);
    g.lineStyle(1, pal.accent, 0.5);
    g.strokeRect(o.x + 40, o.y + 40, 24, 32);
    g.fillStyle(0xEDEAF2);
    g.fillRect(o.x + 42, o.y + 42, 20, 28);
    g.fillStyle(0x1c1c2e);
    g.fillTriangle(o.x + 52, o.y + 46, o.x + 46, o.y + 62, o.x + 58, o.y + 62);
    g.fillCircle(o.x + 49, o.y + 58, 4);
    g.fillCircle(o.x + 55, o.y + 58, 4);
    g.fillRect(o.x + 51, o.y + 62, 2, 4);
  }

  drawAstraOffice(g) {
    const o = OFFICES.astra;
    const pal = ROOM_PALETTES.astra;
    this.drawRoom(g, o, pal);

    // Strategy map
    g.fillStyle(0x0D1F40);
    g.fillRect(o.x + TILE, o.y + TILE, 80, 60);
    g.lineStyle(1, pal.accent, 0.5);
    g.strokeRect(o.x + TILE, o.y + TILE, 80, 60);
    g.fillStyle(pal.accent, 0.3);
    g.fillRect(o.x + 24, o.y + 28, 20, 10);
    g.fillRect(o.x + 50, o.y + 24, 14, 8);
    g.fillRect(o.x + 70, o.y + 36, 16, 12);
    g.fillStyle(pal.highlight, 0.9);
    [[28, 32], [55, 28], [75, 40], [40, 48], [65, 52]].forEach(([dx, dy]) => {
      g.fillRect(o.x + dx, o.y + dy, 3, 3);
    });

    // Whiteboard
    g.fillStyle(0xC8D8E4);
    g.fillRect(o.x + o.w - 80, o.y + TILE, 64, 48);
    g.lineStyle(1, pal.accent, 0.4);
    g.strokeRect(o.x + o.w - 80, o.y + TILE, 64, 48);
    g.fillStyle(pal.accent, 0.4);
    g.fillRect(o.x + o.w - 76, o.y + 24, 32, 1);
    g.fillRect(o.x + o.w - 76, o.y + 30, 24, 1);
    g.fillRect(o.x + o.w - 76, o.y + 36, 40, 1);
    g.fillRect(o.x + o.w - 76, o.y + 42, 28, 1);

    // Standing desk
    g.fillStyle(0x0D1F40);
    g.fillRect(o.x + 80, o.y + 40, 120, 14);
    g.fillRect(o.x + 80, o.y + 54, 4, 24);
    g.fillRect(o.x + 196, o.y + 54, 4, 24);
    // Monitor
    g.fillStyle(0x0A1628);
    g.fillRect(o.x + 116, o.y + 26, 48, 16);
    g.fillStyle(pal.accent, 0.4);
    g.fillRect(o.x + 118, o.y + 28, 44, 12);

    // Lightning bolt on wall
    g.fillStyle(pal.highlight, 0.7);
    g.fillTriangle(o.x + 260, o.y + 24, o.x + 246, o.y + 56, o.x + 258, o.y + 56);
    g.fillTriangle(o.x + 252, o.y + 56, o.x + 266, o.y + 56, o.x + 252, o.y + 88);
    // Bolt glow
    g.fillStyle(pal.highlight, 0.05);
    g.fillCircle(o.x + 254, o.y + 56, 20);

    // Red string
    g.lineStyle(2, 0xE8192C, 0.6);
    g.lineBetween(o.x + 80, o.y + 50, o.x + 200, o.y + 30);
    g.lineBetween(o.x + 200, o.y + 30, o.x + 240, o.y + 70);
    // Pin dots
    g.fillStyle(0xE8192C, 0.9);
    g.fillCircle(o.x + 80, o.y + 50, 3);
    g.fillCircle(o.x + 200, o.y + 30, 3);
    g.fillCircle(o.x + 240, o.y + 70, 3);

    // Coffee mug
    g.fillStyle(0x1E2A3E);
    g.fillRect(o.x + 90, o.y + 34, 14, 10);
    g.fillStyle(0xE8F4FF, 0.1);
    g.fillRect(o.x + 92, o.y + 30, 2, 4); // steam
    g.fillRect(o.x + 96, o.y + 28, 2, 6);
  }

  drawDezayasOffice(g) {
    const o = OFFICES.dezayas;
    const pal = ROOM_PALETTES.dezayas;
    this.drawRoom(g, o, pal);

    const mx = o.x + o.w / 2;

    // L-shaped desk
    g.fillStyle(0x161B22);
    g.fillRect(o.x + 24, o.y + 32, o.w - 48, 18);
    g.fillStyle(pal.accent, 0.1);
    g.fillRect(o.x + 24, o.y + 32, o.w - 48, 2);

    // 3 monitors with terminal glow
    [[0, 0, 10, 12], [-56, 2, 8, 10], [56, 2, 8, 10]].forEach(([dx, dy, w, h]) => {
      g.fillStyle(0x0D1117);
      g.fillRect(mx + dx - w/2, o.y + 18 + dy, w, h);
      g.fillStyle(pal.accent, 0.45);
      g.fillRect(mx + dx - w/2 + 1, o.y + 19 + dy, w - 2, h - 2);
      g.fillStyle(pal.accent, 0.6);
      for (let i = 0; i < 5; i++) {
        g.fillRect(mx + dx - w/2 + 1, o.y + 20 + dy + i * 2, (w - 4) * (0.3 + Math.random() * 0.6), 1);
      }
    });
    // Terminal glow on floor
    g.fillStyle(pal.accent, 0.04);
    g.fillRect(o.x + 24, o.y + 48, o.w - 48, 40);

    // Server rack
    g.fillStyle(0x161B22);
    g.fillRect(o.x + TILE, o.y + TILE, 40, 100);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + TILE, o.y + TILE, 40, 100);
    for (let i = 0; i < 8; i++) {
      g.fillStyle(0x161B22);
      g.fillRect(o.x + TILE + 2, o.y + TILE + 4 + i * 12, 36, 8);
      g.fillStyle(pal.accent, 0.7);
      g.fillRect(o.x + TILE + 32, o.y + TILE + 7 + i * 12, 3, 3);
    }

    // Cables
    g.lineStyle(1, 0x1B3A2A, 0.7);
    [[100, 80, 140, 100], [120, 90, 160, 110], [80, 95, 130, 115]].forEach(([x1, y1, x2, y2]) => {
      g.lineBetween(o.x + x1, o.y + y1, o.x + x2, o.y + y2);
    });

    // Sticky notes
    [0xFFE033, 0xFF69B4, 0x00CEC9, 0xE8192C].forEach((c, i) => {
      g.fillStyle(c);
      g.fillRect(o.x + 148 + (i % 2) * 12, o.y + 20 + Math.floor(i / 2) * 12, 10, 10);
    });

    // Rubber ducks
    [0, 1, 2].forEach(i => {
      g.fillStyle(0xFFD700);
      g.fillRect(o.x + 180 + i * 16, o.y + 30, 10, 8);
      g.fillCircle(o.x + 185 + i * 16, o.y + 28, 5);
      g.fillStyle(0xE8192C);
      g.fillRect(o.x + 183 + i * 16, o.y + 26, 3, 2);
    });
    g.fillStyle(0xFFE033);
    g.fillRect(o.x + 212, o.y + 23, 10, 6);

    // Coffee setup
    g.fillStyle(0x3B1F0A);
    g.fillRect(o.x + o.w - 52, o.y + 24, 24, 20);
    g.fillStyle(0xC1440E, 0.5);
    g.fillRect(o.x + o.w - 48, o.y + 22, 16, 4);
  }

  drawRyboOffice(g) {
    const o = OFFICES.rybo;
    const pal = ROOM_PALETTES.rybo;
    this.drawRoom(g, o, pal);

    // Worn leather couch
    g.fillStyle(0x5C3A1E);
    g.fillRect(o.x + TILE + 4, o.y + 40, 96, 32);
    g.fillStyle(0x7B4F2E);
    g.fillRect(o.x + TILE + 4, o.y + 40, 96, 8);
    g.fillRect(o.x + TILE + 4, o.y + 48, 4, 24);
    g.fillRect(o.x + TILE + 96, o.y + 48, 4, 24);
    g.lineStyle(1, 0x3D2B1F, 0.4);
    g.lineBetween(o.x + TILE + 36, o.y + 48, o.x + TILE + 36, o.y + 72);
    g.lineBetween(o.x + TILE + 68, o.y + 48, o.x + TILE + 68, o.y + 72);
    // Couch shadow
    g.fillStyle(0x000000, 0.08);
    g.fillRect(o.x + TILE + 4, o.y + 72, 96, 6);

    // Cafecito station
    g.fillStyle(0x3B1F0A);
    g.fillRect(o.x + TILE + 4, o.y + TILE + 4, 40, 28);
    g.fillStyle(0x1a1a1a);
    g.fillRect(o.x + 22, o.y + 22, 10, 14);
    g.fillStyle(pal.accent);
    g.fillRect(o.x + 20, o.y + 26, 14, 4);
    g.fillStyle(0x3B1F0A);
    g.fillRect(o.x + 38, o.y + 26, 8, 8);
    g.fillRect(o.x + 48, o.y + 26, 8, 8);
    // Steam
    g.fillStyle(0xE8C99A, 0.15);
    g.fillRect(o.x + 24, o.y + 18, 2, 4);
    g.fillRect(o.x + 28, o.y + 16, 2, 6);

    // Community corkboard
    g.fillStyle(0xA0522D, 0.6);
    g.fillRect(o.x + 120, o.y + TILE, 80, 60);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + 120, o.y + TILE, 80, 60);
    [0xE8C99A, 0xC1440E, 0x3D2B1F].forEach((c, i) => {
      [[0, 0], [28, 4], [56, 0], [12, 28], [40, 24], [64, 20]].forEach(([dx, dy], j) => {
        if (j % 3 === i % 3) {
          g.fillStyle(c);
          g.fillRect(o.x + 124 + dx, o.y + 22 + dy, 20, 14);
        }
      });
    });

    // Filing cabinet
    g.fillStyle(0x3D2314);
    g.fillRect(o.x + o.w - 52, o.y + 48, 32, 80);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + o.w - 52, o.y + 48, 32, 80);
    g.fillStyle(pal.accent, 0.15);
    g.fillRect(o.x + o.w - 52, o.y + 74, 32, 1);
    g.fillRect(o.x + o.w - 52, o.y + 100, 32, 1);
    g.fillStyle(pal.highlight, 0.5);
    g.fillRect(o.x + o.w - 40, o.y + 56, 10, 3);
    g.fillRect(o.x + o.w - 40, o.y + 82, 10, 3);
    g.fillRect(o.x + o.w - 40, o.y + 108, 10, 3);

    // Cuban flag
    g.fillStyle(0x002D62);
    g.fillRect(o.x + 76, o.y + 24, 32, 20);
    g.fillStyle(0xE8192C);
    g.fillTriangle(o.x + 76, o.y + 24, o.x + 76, o.y + 44, o.x + 96, o.y + 34);
    g.fillStyle(0xffffff, 0.7);
    g.fillRect(o.x + 76, o.y + 28, 32, 4);
    g.fillRect(o.x + 76, o.y + 36, 32, 4);

    // Desk with binder clips
    const deskY2 = o.y + TILE + 100;
    g.fillStyle(0x2D2D2D);
    g.fillRect(o.x + 120, deskY2 - 40, o.w - 144, 16);
    g.fillStyle(pal.accent, 0.12);
    g.fillRect(o.x + 120, deskY2 - 40, o.w - 144, 2);
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0xC1440E);
      g.fillRect(o.x + 130 + i * 24, deskY2 - 52, 12, 16);
      g.lineStyle(1, 0x3D2B1F, 0.6);
      g.strokeRect(o.x + 130 + i * 24, deskY2 - 52, 12, 16);
    }

    // Whiteboard
    g.fillStyle(0xE8C99A, 0.35);
    g.fillRect(o.x + o.w - 80, o.y + TILE, 64, 48);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + o.w - 80, o.y + TILE, 64, 48);
    g.fillStyle(pal.accent, 0.4);
    for (let i = 0; i < 4; i++) {
      g.fillRect(o.x + o.w - 76, o.y + 24 + i * 10, 40 + (i % 2 === 0 ? 10 : -8), 2);
    }
  }

  drawCharlesOffice(g) {
    const o = OFFICES.charles;
    const pal = ROOM_PALETTES.charles;
    this.drawRoom(g, o, pal);
    const BOT = o.y + o.h;

    // Floor-to-ceiling bookshelf
    g.fillStyle(0x5C3A1E);
    g.fillRect(o.x + TILE, o.y + TILE, 48, o.h - TILE * 2);
    g.lineStyle(1, pal.accent, 0.2);
    g.strokeRect(o.x + TILE, o.y + TILE, 48, o.h - TILE * 2);
    const bookColors = [0xD4872A, 0xF2E8C8, 0x7B1F20, 0x1B4D3E, 0x2D3142, 0xD4872A, 0xF2E8C8, 0x7B1F20];
    for (let row = 0; row < 8; row++) {
      let bx = o.x + TILE + 2;
      for (let b = 0; b < 6; b++) {
        const bw = 5 + (b % 3);
        g.fillStyle(bookColors[(row + b) % bookColors.length]);
        g.fillRect(bx, o.y + TILE + 4 + row * 34, bw, 28);
        bx += bw + 1;
      }
      g.fillStyle(0x3D2B1F, 0.4);
      g.fillRect(o.x + TILE, o.y + TILE + 32 + row * 34, 48, 2);
    }

    // Research desk
    g.fillStyle(0x3D2B1F);
    g.fillRect(o.x + 80, BOT - 160, 160, 48);
    g.fillStyle(pal.accent, 0.15);
    g.fillRect(o.x + 80, BOT - 160, 160, 2);
    g.fillStyle(0x000000, 0.06);
    g.fillRect(o.x + 80, BOT - 112, 160, 6);

    // Open book
    g.fillStyle(0xF2E8C8);
    g.fillRect(o.x + 100, BOT - 155, 48, 36);
    g.lineStyle(1, 0x3D2B1F, 0.4);
    g.lineBetween(o.x + 124, BOT - 155, o.x + 124, BOT - 119);
    g.fillStyle(0x8B6A45, 0.3);
    for (let i = 0; i < 5; i++) {
      g.fillRect(o.x + 104, BOT - 150 + i * 6, 16, 1);
      g.fillRect(o.x + 128, BOT - 150 + i * 6, 16, 1);
    }

    // Desk lamp
    g.fillStyle(pal.accent);
    g.fillRect(o.x + 174, BOT - 165, 4, 20);
    g.fillStyle(0xD4872A, 0.8);
    g.fillTriangle(o.x + 164, BOT - 146, o.x + 188, BOT - 146, o.x + 176, BOT - 162);
    g.fillStyle(0xD4872A, 0.08);
    g.fillTriangle(o.x + 156, BOT - 112, o.x + 196, BOT - 112, o.x + 176, BOT - 146);

    // Historical maps
    [[0, 0], [60, 10]].forEach(([dx, dy]) => {
      g.fillStyle(0x5C3A1E);
      g.fillRect(o.x + o.w - 72 + dx, o.y + TILE + dy, 40, 28);
      g.fillStyle(0xF2E8C8, 0.5);
      g.fillRect(o.x + o.w - 70 + dx, o.y + TILE + 2 + dy, 36, 24);
      g.lineStyle(1, pal.accent, 0.2);
      g.lineBetween(o.x + o.w - 68 + dx, o.y + TILE + 10 + dy, o.x + o.w - 38 + dx, o.y + TILE + 10 + dy);
    });

    // Genealogy chart
    g.fillStyle(0xF2E8C8, 0.06);
    g.fillRect(o.x + TILE + 56, o.y + TILE, 180, 60);
    g.lineStyle(1, pal.accent, 0.15);
    g.strokeRect(o.x + TILE + 56, o.y + TILE, 180, 60);
    g.lineStyle(1, 0x8B6A45, 0.4);
    const treeX = o.x + TILE + 146;
    const treeY = o.y + TILE + 10;
    g.lineBetween(treeX, treeY, treeX - 40, treeY + 20);
    g.lineBetween(treeX, treeY, treeX + 40, treeY + 20);
    g.lineBetween(treeX - 40, treeY + 20, treeX - 60, treeY + 40);
    g.lineBetween(treeX - 40, treeY + 20, treeX - 20, treeY + 40);
    g.lineBetween(treeX + 40, treeY + 20, treeX + 20, treeY + 40);
    g.lineBetween(treeX + 40, treeY + 20, treeX + 60, treeY + 40);
    // Name nodes
    g.fillStyle(0x8B6A45, 0.5);
    [0, -40, 40, -60, -20, 20, 60].forEach((dx, i) => {
      const dy = i === 0 ? 0 : (i < 3 ? 20 : 40);
      g.fillCircle(treeX + dx, treeY + dy, 4);
    });

    // Magnifying glass
    g.lineStyle(2, 0xC9A84C, 0.8);
    g.strokeCircle(o.x + 176, BOT - 148, 8);
    g.lineBetween(o.x + 184, BOT - 140, o.x + 192, BOT - 132);

    // Antique clock on wall
    g.fillStyle(0x3D2B1F);
    g.fillRect(o.x + o.w - 48, o.y + 80, 28, 32);
    g.fillStyle(0xF2E8C8, 0.6);
    g.fillCircle(o.x + o.w - 34, o.y + 92, 10);
    g.lineStyle(1, 0x3D2B1F, 0.8);
    g.lineBetween(o.x + o.w - 34, o.y + 92, o.x + o.w - 34, o.y + 86);
    g.lineBetween(o.x + o.w - 34, o.y + 92, o.x + o.w - 28, o.y + 92);
  }

  drawRomeroStudio(g) {
    const o = OFFICES.romero;
    const pal = ROOM_PALETTES.romero;

    // Checkerboard floor
    for (let tx = 0; tx < Math.ceil(o.w / TILE); tx++) {
      for (let ty = 0; ty < Math.ceil(o.h / TILE); ty++) {
        g.fillStyle((tx + ty) % 2 === 0 ? 0xE8192C : 0xF0F0F0);
        g.fillRect(o.x + tx * TILE, o.y + ty * TILE, TILE, TILE);
      }
    }
    // Walls
    g.fillStyle(0x0D0D0D);
    g.fillRect(o.x, o.y, o.w, TILE);
    g.fillRect(o.x, o.y + o.h - TILE, o.w, TILE);
    g.fillRect(o.x, o.y, TILE, o.h);
    g.fillRect(o.x + o.w - TILE, o.y, TILE, o.h);

    const BOT = o.y + o.h;

    // Red carpet from door
    g.fillStyle(0xE8192C, 0.8);
    g.fillRect(o.x + DOOR_CX_OFFSET + DOOR_W / 2 - 8, o.y + TILE, 16, o.h - TILE * 2);
    // Carpet border
    g.fillStyle(0xFFD700, 0.4);
    g.fillRect(o.x + DOOR_CX_OFFSET + DOOR_W / 2 - 8, o.y + TILE, 2, o.h - TILE * 2);
    g.fillRect(o.x + DOOR_CX_OFFSET + DOOR_W / 2 + 6, o.y + TILE, 2, o.h - TILE * 2);

    // Art gallery wall
    const artColors = [0xE8192C, 0x0047AB, 0xFFD700, 0x2ECC40, 0xFF69B4, 0xE8192C, 0xFFD700, 0x0047AB];
    let afx = o.x + TILE + 2;
    const afy = o.y + TILE + 2;
    for (let i = 0; i < 12; i++) {
      const fw = 16 + (i % 3) * 4;
      const fh = 14 + (i % 2) * 4;
      g.fillStyle(0x1c1c2e);
      g.fillRect(afx, afy, fw + 4, fh + 4);
      g.fillStyle(artColors[i % artColors.length]);
      g.fillRect(afx + 2, afy + 2, fw, fh);
      g.fillStyle(artColors[(i + 3) % artColors.length], 0.4);
      g.fillRect(afx + 2, afy + 2, fw / 2, fh / 2);
      g.fillRect(afx + 2 + fw / 2, afy + 2 + fh / 2, fw / 2, fh / 2);
      afx += fw + 6;
      if (afx > o.x + o.w - 48) afx = o.x + TILE + 2;
    }

    // Easel + canvas
    const easelX = o.x + 60;
    const easelY = BOT - 160;
    g.lineStyle(2, 0x5C3A1E, 0.8);
    g.lineBetween(easelX, easelY, easelX + 20, easelY + 60);
    g.lineBetween(easelX + 48, easelY, easelX + 28, easelY + 60);
    g.lineBetween(easelX + 5, easelY + 50, easelX + 43, easelY + 50);
    g.fillStyle(0xF5F5DC);
    g.fillRect(easelX + 2, easelY, 44, 56);
    g.lineStyle(2, 0x1c1c2e, 0.8);
    g.strokeRect(easelX + 2, easelY, 44, 56);
    g.fillStyle(0xE8192C);
    g.fillRect(easelX + 4, easelY + 4, 18, 24);
    g.fillStyle(0x0047AB);
    g.fillRect(easelX + 24, easelY + 4, 18, 24);
    g.fillStyle(0xFFD700);
    g.fillRect(easelX + 10, easelY + 30, 24, 20);

    // Paint supplies
    [0xE8192C, 0x0047AB, 0xFFD700, 0x2ECC40, 0xFF69B4].forEach((c, i) => {
      g.fillStyle(c);
      g.fillRect(o.x + 140 + i * 16, BOT - 80, 10, 4);
      g.fillRect(o.x + 140 + i * 16 + 8, BOT - 80 + 2, 2, 2);
    });

    // Brush cup
    g.fillStyle(0x3B1F0A);
    g.fillRect(o.x + 228, BOT - 80, 12, 14);
    [0xE8192C, 0x0047AB, 0xFFD700, 0x2ECC40].forEach((c, b) => {
      g.fillStyle(0x1c1c2e);
      g.fillRect(o.x + 230 + b * 3, BOT - 96, 2, 18);
      g.fillStyle(c);
      g.fillRect(o.x + 230 + b * 3, BOT - 96, 2, 4);
    });

    // Mood board
    g.fillStyle(0xA0522D, 0.4);
    g.fillRect(o.x + o.w - 96, o.y + TILE + 4, 80, 80);
    g.lineStyle(1, 0x1c1c2e, 0.5);
    g.strokeRect(o.x + o.w - 96, o.y + TILE + 4, 80, 80);
    [0xE8192C, 0x0047AB, 0xFFD700, 0x2ECC40, 0xFF69B4].forEach((c, i) => {
      g.fillStyle(c);
      g.fillRect(o.x + o.w - 92 + i * 14, o.y + TILE + 8, 12, 12);
    });
    // THE CHEETO
    g.fillStyle(0xFF6600);
    g.fillRect(o.x + o.w - 84, o.y + TILE + 52, 20, 8);
    g.fillStyle(0xFFFF00, 0.3);
    g.fillRect(o.x + o.w - 82, o.y + TILE + 53, 6, 3);

    // Paint splatters
    [[120, 20, 0xFFD700], [200, 40, 0x0047AB], [80, 60, 0xFF69B4], [260, 10, 0x2ECC40]].forEach(([dx, dy, c]) => {
      g.fillStyle(c, 0.6);
      g.fillRect(o.x + dx, BOT - 72 + dy, 4, 4);
      g.fillRect(o.x + dx + 5, BOT - 70 + dy, 2, 2);
    });
  }

  drawCidArcade(g) {
    const o = OFFICES.cid;
    const pal = ROOM_PALETTES.cid;
    this.drawRoom(g, o, pal);
    const BOT = o.y + o.h;

    // Arcade cabinet
    g.fillStyle(0x2D1B4E);
    g.fillRect(o.x + o.w - 68, o.y + TILE + 4, 48, 80);
    g.lineStyle(2, pal.accent, 0.7);
    g.strokeRect(o.x + o.w - 68, o.y + TILE + 4, 48, 80);
    g.fillStyle(0x0D0D0D);
    g.fillRect(o.x + o.w - 62, o.y + TILE + 12, 36, 28);
    g.fillStyle(0x00CEC9, 0.5);
    g.fillRect(o.x + o.w - 60, o.y + TILE + 14, 32, 24);
    // Game on screen
    g.fillStyle(0xffffff, 0.7);
    g.fillRect(o.x + o.w - 58, o.y + TILE + 24, 4, 8);
    g.fillStyle(0xE8192C, 0.7);
    g.fillRect(o.x + o.w - 48, o.y + TILE + 18, 6, 4);
    g.fillRect(o.x + o.w - 40, o.y + TILE + 22, 6, 4);
    // Joystick
    g.fillStyle(0x1a0a2e);
    g.fillRect(o.x + o.w - 64, o.y + TILE + 44, 44, 32);
    g.fillStyle(0xE8192C);
    g.fillCircle(o.x + o.w - 46, o.y + TILE + 54, 5);
    g.fillStyle(pal.accent);
    g.fillCircle(o.x + o.w - 34, o.y + TILE + 50, 4);
    g.fillStyle(0xFFE033);
    g.fillCircle(o.x + o.w - 28, o.y + TILE + 58, 4);
    // Cabinet glow
    g.fillStyle(pal.accent, 0.04);
    g.fillRect(o.x + o.w - 80, o.y + TILE, 64, 100);

    // Game design whiteboard
    g.fillStyle(0x1a0a2e);
    g.fillRect(o.x + TILE, o.y + TILE, 72, 48);
    g.lineStyle(1, pal.accent, 0.4);
    g.strokeRect(o.x + TILE, o.y + TILE, 72, 48);
    g.lineStyle(1, pal.accent, 0.6);
    g.lineBetween(o.x + 22, o.y + 54, o.x + 50, o.y + 54);
    g.lineBetween(o.x + 38, o.y + 44, o.x + 66, o.y + 44);
    g.lineBetween(o.x + 22, o.y + 64, o.x + 42, o.y + 64);
    g.lineBetween(o.x + 54, o.y + 60, o.x + 80, o.y + 60);
    g.lineStyle(1, pal.highlight, 0.4);
    g.strokeCircle(o.x + 44, o.y + 50, 4);
    g.strokeCircle(o.x + 62, o.y + 40, 4);

    // Kanban board
    g.fillStyle(0x1a0a2e);
    g.fillRect(o.x + 100, o.y + TILE, 160, 72);
    g.lineStyle(1, pal.highlight, 0.3);
    g.strokeRect(o.x + 100, o.y + TILE, 160, 72);
    g.lineStyle(1, pal.accent, 0.2);
    g.lineBetween(o.x + 154, o.y + TILE, o.x + 154, o.y + TILE + 72);
    g.lineBetween(o.x + 206, o.y + TILE, o.x + 206, o.y + TILE + 72);
    g.fillStyle(0xFFE033, 0.5);
    g.fillRect(o.x + 106, o.y + 22, 42, 6);
    g.fillStyle(pal.accent, 0.5);
    g.fillRect(o.x + 158, o.y + 22, 42, 6);
    g.fillStyle(pal.highlight, 0.5);
    g.fillRect(o.x + 210, o.y + 22, 42, 6);
    [[104, 32, 0xFFE033], [104, 48, 0xFFE033], [158, 32, 0x00CEC9], [210, 32, 0x7B2D8B], [210, 48, 0x7B2D8B]].forEach(([dx, dy, c]) => {
      g.fillStyle(c, 0.6);
      g.fillRect(o.x + dx, o.y + dy, 40, 10);
    });

    // Cartridge shelf
    g.fillStyle(0x2D1B4E);
    g.fillRect(o.x + TILE, o.y + 72, o.w - TILE * 2 - 72, 16);
    g.lineStyle(1, pal.accent, 0.2);
    g.strokeRect(o.x + TILE, o.y + 72, o.w - TILE * 2 - 72, 16);
    [0x7B2D8B, 0xE8192C, 0x0047AB, 0x2ECC40, 0xFFD700, 0x00CEC9, 0xE8192C, 0x7B2D8B, 0xFFD700, 0x2ECC40].forEach((c, i) => {
      g.fillStyle(c);
      g.fillRect(o.x + TILE + 4 + i * 22, o.y + 74, 18, 12);
    });

    // d20
    g.fillStyle(pal.accent, 0.6);
    g.fillTriangle(o.x + 179, BOT - 131, o.x + 171, BOT - 119, o.x + 189, BOT - 119);
    g.fillStyle(0xF0EDDE);
    g.fillTriangle(o.x + 180, BOT - 130, o.x + 172, BOT - 118, o.x + 188, BOT - 118);
    g.fillStyle(0x2D1B4E);
    g.fillRect(o.x + 178, BOT - 126, 4, 1);

    // Bean bag
    g.fillStyle(pal.highlight, 0.7);
    g.fillEllipse(o.x + 200, BOT - 80, 48, 28);
    g.fillStyle(0x7B2D8B, 0.25);
    g.fillEllipse(o.x + 200, BOT - 76, 40, 18);

    // Earthbound on monitor
    g.fillStyle(0x0D1117);
    g.fillRect(o.x + 116, BOT - 176, 80, 48);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + 116, BOT - 176, 80, 48);
    g.fillStyle(0x2ECC40, 0.4);
    g.fillRect(o.x + 118, BOT - 174, 76, 44);
    g.fillStyle(0x1a8c1a, 0.6);
    g.fillRect(o.x + 118, BOT - 144, 76, 12);
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(o.x + 148, BOT - 148, 6, 10);
    g.fillStyle(0x0000ff, 0.7);
    g.fillRect(o.x + 148, BOT - 152, 6, 5);
    // "PAUSED" text hint
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(o.x + 138, BOT - 166, 36, 6);
  }

  drawJuliusOffice(g) {
    const o = OFFICES.julius;
    const pal = ROOM_PALETTES.julius;
    this.drawRoom(g, o, pal);
    const BOT = o.y + o.h;

    // Round conference table
    g.fillStyle(0x1B4D3E);
    g.fillCircle(o.x + o.w / 2, BOT - 140, 72);
    g.lineStyle(2, pal.accent, 0.5);
    g.strokeCircle(o.x + o.w / 2, BOT - 140, 72);
    g.fillStyle(pal.accent, 0.3);
    g.fillRect(o.x + o.w / 2 - 60, BOT - 142, 120, 4);
    // Table shadow
    g.fillStyle(0x000000, 0.06);
    g.fillEllipse(o.x + o.w / 2, BOT - 64, 148, 16);

    // Bridge artwork
    g.fillStyle(0x0A1F18);
    g.fillRect(o.x + TILE + 20, o.y + TILE, 200, 64);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + TILE + 20, o.y + TILE, 200, 64);
    g.fillStyle(pal.highlight, 0.2);
    g.fillRect(o.x + TILE + 20, o.y + TILE + 40, 200, 24);
    g.fillStyle(0x1E3C34, 0.6);
    g.fillRect(o.x + TILE + 30, o.y + TILE + 28, 180, 14);
    g.fillStyle(0x2A5040, 0.7);
    g.fillRect(o.x + TILE + 60, o.y + TILE + 12, 8, 30);
    g.fillRect(o.x + TILE + 160, o.y + TILE + 12, 8, 30);
    g.lineStyle(1, pal.highlight, 0.2);
    g.lineBetween(o.x + TILE + 64, o.y + TILE + 14, o.x + TILE + 30, o.y + TILE + 40);
    g.lineBetween(o.x + TILE + 64, o.y + TILE + 14, o.x + TILE + 160, o.y + TILE + 40);
    g.lineBetween(o.x + TILE + 164, o.y + TILE + 14, o.x + TILE + 160, o.y + TILE + 40);
    g.lineBetween(o.x + TILE + 164, o.y + TILE + 14, o.x + TILE + 208, o.y + TILE + 40);

    // Globe
    g.fillStyle(0x3D2B1F);
    g.fillRect(o.x + o.w - 56, o.y + TILE + 68, 12, 24);
    g.fillRect(o.x + o.w - 60, o.y + TILE + 90, 20, 4);
    g.fillStyle(0x0047AB, 0.7);
    g.fillCircle(o.x + o.w - 50, o.y + TILE + 60, 18);
    g.fillStyle(0x2ECC40, 0.5);
    g.fillRect(o.x + o.w - 62, o.y + TILE + 54, 12, 14);
    g.fillRect(o.x + o.w - 44, o.y + TILE + 50, 10, 8);
    // Globe highlight
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(o.x + o.w - 58, o.y + TILE + 48, 8, 10);

    // Impact board
    g.fillStyle(0xA0522D, 0.35);
    g.fillRect(o.x + TILE, o.y + TILE, 64, 80);
    g.lineStyle(1, pal.accent, 0.25);
    g.strokeRect(o.x + TILE, o.y + TILE, 64, 80);
    for (let i = 0; i < 6; i++) {
      const barW = 20 + (i % 3) * 10;
      g.fillStyle(pal.accent, 0.4);
      g.fillRect(o.x + TILE + 8, o.y + TILE + 12 + i * 12, barW, 6);
      g.fillStyle(pal.highlight, 0.2);
      g.fillRect(o.x + TILE + 8, o.y + TILE + 12 + i * 12, 42, 6);
    }
    [0xE8192C, 0x0047AB, 0xFFD700, 0x2ECC40, 0xE8192C].forEach((c, i) => {
      g.fillStyle(c, 0.7);
      g.fillRect(o.x + TILE + 52, o.y + TILE + 10 + i * 14, 4, 4);
    });

    // Peppermint bowl
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(o.x + o.w / 2, BOT - 140, 24, 16);
    g.fillStyle(0xE8192C, 0.7);
    g.fillRect(o.x + o.w / 2 - 8, BOT - 144, 6, 4);
    g.fillRect(o.x + o.w / 2 + 2, BOT - 138, 6, 4);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(o.x + o.w / 2 - 2, BOT - 140, 4, 3);

    // Orchid
    g.fillStyle(0x1B4D3E);
    g.fillRect(o.x + o.w / 2 + 60, BOT - 180, 3, 36);
    g.fillStyle(0xF0EDDE, 0.8);
    g.fillCircle(o.x + o.w / 2 + 61, BOT - 182, 6);
    g.fillCircle(o.x + o.w / 2 + 55, BOT - 170, 5);
    g.fillCircle(o.x + o.w / 2 + 68, BOT - 166, 5);

    // Fountain
    g.fillStyle(0x1B4D3E);
    g.fillRect(o.x + 20, BOT - 100, 24, 24);
    g.lineStyle(1, pal.accent, 0.3);
    g.strokeRect(o.x + 20, BOT - 100, 24, 24);
    g.fillStyle(pal.accent, 0.2);
    g.fillRect(o.x + 22, BOT - 98, 20, 20);
    g.lineStyle(1, pal.highlight, 0.2);
    g.strokeCircle(o.x + 32, BOT - 88, 6);
    g.strokeCircle(o.x + 32, BOT - 88, 3);
  }

  drawDoors(g) {
    Object.entries(OFFICES).forEach(([id, o]) => {
      const doorX = o.x + DOOR_CX_OFFSET;
      const pal = ROOM_PALETTES[id];
      const floorCol = ROOM_PALETTES[id].floor;

      if (o.isTop) {
        g.fillStyle(floorCol);
        g.fillRect(doorX, o.y + o.h - TILE, DOOR_W, TILE);
        // Door frame
        g.fillStyle(pal.accent, 0.5);
        g.fillRect(doorX, o.y + o.h - TILE, 2, TILE);
        g.fillRect(doorX + DOOR_W - 2, o.y + o.h - TILE, 2, TILE);
        // Door threshold glow
        g.fillStyle(pal.accent, 0.06);
        g.fillRect(doorX + 2, o.y + o.h - TILE, DOOR_W - 4, TILE);
        // Hallway side
        g.fillStyle(ROOM_PALETTES.hallway.floor);
        g.fillRect(doorX, HALLWAY.y, DOOR_W, TILE);
        g.fillStyle(ROOM_PALETTES.hallway.floorAlt);
        if (Math.floor((doorX - HALLWAY.x) / TILE + 1) % 2 === 0) {
          g.fillRect(doorX, HALLWAY.y, DOOR_W / 2, TILE);
        } else {
          g.fillRect(doorX + DOOR_W / 2, HALLWAY.y, DOOR_W / 2, TILE);
        }
      } else {
        g.fillStyle(floorCol);
        g.fillRect(doorX, o.y, DOOR_W, TILE);
        g.fillStyle(pal.accent, 0.5);
        g.fillRect(doorX, o.y, 2, TILE);
        g.fillRect(doorX + DOOR_W - 2, o.y, 2, TILE);
        g.fillStyle(pal.accent, 0.06);
        g.fillRect(doorX + 2, o.y, DOOR_W - 4, TILE);
        g.fillStyle(ROOM_PALETTES.hallway.floor);
        g.fillRect(doorX, HALLWAY.y + HALLWAY.h - TILE, DOOR_W, TILE);
      }
    });
  }

  drawAgentDesks(g) {
    Object.values(AGENTS_DATA).forEach(agent => {
      const o = OFFICES[agent.room];
      if (!o) return;
      const pal = ROOM_PALETTES[agent.room];
      const ax = agent.x;
      const ay = agent.y;

      const deskW = 64, deskH = 14;
      const deskYOffset = o.isTop ? 16 : -30;

      // Desk surface
      g.fillStyle(pal.wall || 0x2D3142);
      g.fillRect(ax - deskW / 2, ay + deskYOffset, deskW, deskH);
      // Desk top edge highlight
      g.fillStyle(pal.accent, 0.4);
      g.fillRect(ax - deskW / 2, ay + deskYOffset, deskW, 2);
      // Desk shadow
      g.fillStyle(0x000000, 0.06);
      g.fillRect(ax - deskW / 2, ay + deskYOffset + deskH, deskW, 4);
      // Desk legs
      g.fillStyle(pal.wall || 0x2D3142, 0.6);
      g.fillRect(ax - deskW / 2 + 2, ay + deskYOffset + deskH, 3, 8);
      g.fillRect(ax + deskW / 2 - 5, ay + deskYOffset + deskH, 3, 8);
    });
  }

  // ── ROOM LABELS ──
  addRoomLabels() {
    const style = { fontSize: '9px', fontFamily: 'monospace', color: '#2D3E55' };
    [
      { x: 348, y: HALLWAY.y + 6, text: 'ACE  \u25B2' },
      { x: 660, y: HALLWAY.y + 6, text: 'ASTRA  \u25B2' },
      { x: 972, y: HALLWAY.y + 6, text: 'DEZAYAS  \u25B2' },
      { x: 1284, y: HALLWAY.y + 6, text: 'RYBO  \u25B2' },
      { x: 348, y: HALLWAY.y + HALLWAY.h - 14, text: 'CHARLES  \u25BC' },
      { x: 660, y: HALLWAY.y + HALLWAY.h - 14, text: 'ROMERO  \u25BC' },
      { x: 972, y: HALLWAY.y + HALLWAY.h - 14, text: 'CID  \u25BC' },
      { x: 1284, y: HALLWAY.y + HALLWAY.h - 14, text: 'JULIUS  \u25BC' },
    ].forEach(({ x, y, text }) => {
      // Sign background
      const bg = this.add.rectangle(x, y + 4, text.length * 6 + 8, 12, 0x0D1117, 0.5)
        .setDepth(4);
      this.add.text(x, y, text, { ...style }).setOrigin(0.5, 0).setDepth(5);
    });

    // Lobby label
    this.add.text(96, LOBBY.y + LOBBY.h / 2 - 100, 'BASeD HQ', {
      fontSize: '12px', fontFamily: 'monospace', color: '#00E5FF', alpha: 0.3,
    }).setOrigin(0.5).setDepth(5);

    // Gerald label
    this.add.text(LOBBY.x + 36, LOBBY.y + 58, 'Gerald', {
      fontSize: '7px', fontFamily: 'monospace', color: '#1B4D3E',
    }).setOrigin(0.5).setDepth(5);
  }
}
