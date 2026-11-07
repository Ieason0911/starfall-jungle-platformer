import Phaser from 'phaser';
import './style.css';

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const WORLD_WIDTH = 3600;
const TILE = 36;

class JungleScene extends Phaser.Scene {
  constructor() {
    super('jungle');
    this.gameStarted = false;
    this.touch = { left: false, right: false, jump: false };
    this.lives = 3;
    this.shards = 0;
  }

  preload() {
    const root = `${import.meta.env.BASE_URL}assets/game/`;
    this.load.image('bgTrees', `${root}background/background_color_trees.png`);
    this.load.image('playerIdle', `${root}player/character_green_idle.png`);
    this.load.image('playerWalkA', `${root}player/character_green_walk_a.png`);
    this.load.image('playerWalkB', `${root}player/character_green_walk_b.png`);
    this.load.image('playerJump', `${root}player/character_green_jump.png`);
    this.load.image('playerHit', `${root}player/character_green_hit.png`);
    this.load.image('grass', `${root}tiles/terrain_grass_block.png`);
    this.load.image('grassCenter', `${root}tiles/terrain_grass_block_center.png`);
    this.load.image('grassTop', `${root}tiles/terrain_grass_block_top.png`);
    this.load.image('spikes', `${root}tiles/spikes.png`);
    this.load.image('shardGreen', `${root}tiles/gem_green.png`);
    this.load.image('shardYellow', `${root}tiles/gem_yellow.png`);
    this.load.image('shardBlue', `${root}tiles/gem_blue.png`);
    this.load.image('doorClosed', `${root}tiles/door_closed.png`);
    this.load.image('doorOpen', `${root}tiles/door_open.png`);
    this.load.image('bush', `${root}tiles/bush.png`);
    this.load.image('treeRound', `${root}foliage/foliagePack_009.png`);
    this.load.image('treeWide', `${root}foliage/foliagePack_010.png`);
    this.load.image('foliageA', `${root}foliage/foliagePack_014.png`);
    this.load.image('foliageB', `${root}foliage/foliagePack_016.png`);
    this.load.image('magic', `${root}effects/magic_01.png`);
  }

  create() {
    this.worldHeight = this.scale.height;
    this.floorY = this.worldHeight - 48;
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, this.worldHeight);
    this.physics.world.gravity.y = 1080;
    this.addBackground();
    this.addScenery();
    this.buildLevel();
    this.createPlayer();
    this.createCollectibles();
    this.createHazards();
    this.createExit();
    this.createAnimations();
    this.createHud();
    this.createTouchControls();
    this.createOverlay('start');
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
    this.input.on('pointerup', () => this.clearTouch());
    this.input.on('gameout', () => this.clearTouch());
  }

  addBackground() {
    this.add.rectangle(0, 0, WORLD_WIDTH, this.worldHeight, 0x85d7b2)
      .setOrigin(0).setScrollFactor(0).setDepth(-10);
    this.add.tileSprite(0, 0, WORLD_WIDTH, this.worldHeight, 'bgTrees')
      .setOrigin(0).setTileScale(2.1, 2.1).setScrollFactor(0.13).setDepth(-9);
    const haze = this.add.rectangle(0, 0, WORLD_WIDTH, this.worldHeight, 0x8eddb3, 0.13)
      .setOrigin(0).setScrollFactor(0.2).setDepth(-8);
    haze.setBlendMode(Phaser.BlendModes.SCREEN);
  }

  addScenery() {
    const treeKeys = ['treeRound', 'treeWide'];
    for (let x = 130, i = 0; x < WORLD_WIDTH; x += 390, i += 1) {
      const tree = this.add.image(x, this.floorY + 1, treeKeys[i % treeKeys.length])
        .setOrigin(0.5, 1).setDisplaySize(i % 3 === 0 ? 164 : 138, i % 3 === 0 ? 224 : 188)
        .setScrollFactor(0.48).setDepth(0).setAlpha(0.88);
      if (i % 2 === 0) tree.setTint(0xc6ffd0);
    }
    for (let x = 240; x < WORLD_WIDTH; x += 250) {
      this.add.image(x, this.floorY - 3, x % 2 ? 'foliageA' : 'foliageB')
        .setOrigin(0.5, 1).setDisplaySize(42, 48).setScrollFactor(0.82).setDepth(2);
    }
  }

  buildLevel() {
    this.platforms = this.physics.add.staticGroup();
    const groundSegments = [
      [0, 700], [810, 1160], [1270, 1710], [1815, 2225], [2335, 2675], [2775, WORLD_WIDTH - 2775],
    ];
    const floating = [
      [370, this.floorY - 96, 126], [940, this.floorY - 100, 126],
      [1365, this.floorY - 88, 108], [1515, this.floorY - 160, 126],
      [1910, this.floorY - 95, 162], [2390, this.floorY - 105, 126],
      [2580, this.floorY - 94, 90],
    ];
    for (const [left, width] of groundSegments) this.addPlatform(left, this.floorY, width, true);
    for (const [left, top, width] of floating) this.addPlatform(left, top, width, false);
  }

  addPlatform(left, top, width, ground) {
    const collisionHeight = ground ? this.worldHeight - top + 400 : TILE;
    const collider = this.add.rectangle(left + width / 2, top + collisionHeight / 2, width, collisionHeight, 0x000000, 0)
      .setVisible(false);
    this.physics.add.existing(collider, true);
    this.platforms.add(collider);
    collider.refreshBody();

    const count = Math.ceil(width / TILE);
    for (let index = 0; index < count; index += 1) {
      const x = left + index * TILE + TILE / 2;
      this.add.image(x, top + TILE / 2, index === 0 || index === count - 1 ? 'grassTop' : 'grass')
        .setDisplaySize(TILE, TILE).setDepth(3);
      if (ground) {
        for (let y = top + TILE; y < this.worldHeight + 50; y += TILE) {
          this.add.image(x, y + TILE / 2, 'grassCenter').setDisplaySize(TILE, TILE).setDepth(3);
        }
      }
    }
  }

  createPlayer() {
    this.player = this.physics.add.sprite(82, this.floorY - 30, 'playerIdle')
      .setDisplaySize(48, 48).setDepth(8);
    this.player.body.setSize(12, 14).setOffset(3, 3);
    this.player.body.setAllowGravity(false);
    this.player.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, this.platforms);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.08);
    this.cameras.main.setDeadzone(Math.min(260, this.scale.width * 0.28), this.scale.height * 0.28);
    this.jumpQueuedUntil = 0;
    this.lastGroundedAt = 0;
    this.lastHurtAt = -1000;
    this.spawnX = 82;
  }

  createAnimations() {
    this.anims.create({ key: 'walk', frames: [{ key: 'playerWalkA' }, { key: 'playerWalkB' }], frameRate: 9, repeat: -1 });
  }

  createCollectibles() {
    this.shardPoints = [
      [430, this.floorY - 140], [590, this.floorY - 110], [1000, this.floorY - 150],
      [1395, this.floorY - 140], [1578, this.floorY - 205], [1980, this.floorY - 170],
      [2448, this.floorY - 190], [3005, this.floorY - 112],
    ];
    const keys = ['shardGreen', 'shardYellow', 'shardBlue'];
    this.shardsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.shardPoints.forEach(([x, y], index) => {
      const aura = this.add.image(x, y, 'magic').setDisplaySize(44, 44).setTint(0x74ffd4)
        .setAlpha(0.62).setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
      this.tweens.add({ targets: aura, angle: 360, alpha: 0.28, duration: 2600 + index * 90, yoyo: true, repeat: -1 });
      const shard = this.shardsGroup.create(x, y, keys[index % keys.length])
        .setDisplaySize(30, 30).setDepth(5);
      shard.body.setAllowGravity(false);
      shard.body.setSize(13, 13);
      shard.setData('aura', aura);
      this.tweens.add({ targets: shard, y: y - 9, duration: 760 + index * 35, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    this.physics.add.overlap(this.player, this.shardsGroup, (_player, shard) => this.collectShard(shard));
  }

  createHazards() {
    this.hazards = this.physics.add.staticGroup();
    const spots = [
      [520, this.floorY], [1040, this.floorY], [1438, this.floorY], [2020, this.floorY],
      [2460, this.floorY], [2910, this.floorY], [3250, this.floorY],
    ];
    for (const [x, groundTop] of spots) {
      const spike = this.hazards.create(x, groundTop - 10, 'spikes').setDisplaySize(36, 24).setDepth(5);
      spike.refreshBody();
    }
    this.physics.add.overlap(this.player, this.hazards, () => this.hurtPlayer());
  }

  createExit() {
    this.exit = this.add.image(WORLD_WIDTH - 100, this.floorY - 38, 'doorClosed')
      .setDisplaySize(54, 76).setDepth(6);
    this.physics.add.existing(this.exit, true);
    this.exit.body.setSize(16, 28);
    this.physics.add.overlap(this.player, this.exit, () => this.touchExit());
    this.exitHint = this.add.text(WORLD_WIDTH - 100, this.floorY - 90, '集齊 8 枚星之碎片', {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: '14px', color: '#fff6c5',
      stroke: '#174438', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(7);
  }

  createHud() {
    this.hudPlate = this.add.rectangle(18, 16, 288, 64, 0x12362d, 0.83)
      .setOrigin(0).setStrokeStyle(2, 0x95d79a, 0.7).setScrollFactor(0).setDepth(30);
    this.hudTitle = this.add.text(34, 24, '星落遺跡  ·  叢林篇', {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: '17px', color: '#fff1ba',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(31);
    this.shardLabel = this.add.text(34, 50, '', {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: '15px', color: '#e2fff0',
    }).setScrollFactor(0).setDepth(31);
    this.livesLabel = this.add.text(246, 50, '', {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: '15px', color: '#ffd7ad',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(31);
    this.refreshHud();
    this.helpText = this.add.text(this.scale.width - 18, 22, '移動 ← → / A D　跳躍 Space / ↑', {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: '14px', color: '#f4fff2',
      stroke: '#194539', strokeThickness: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);
    if (this.game.device.input.touch || this.scale.width < 700) this.helpText.setVisible(false);
  }

  createTouchControls() {
    this.touchControls = [];
    const touchDevice = this.game.device.input.touch || this.scale.width < 700;
    const y = this.scale.height - 54;
    this.addHoldButton(46, y, '◀', 'left', touchDevice);
    this.addHoldButton(116, y, '▶', 'right', touchDevice);
    this.addHoldButton(this.scale.width - 58, y, '跳', 'jump', touchDevice);
  }

  addHoldButton(x, y, label, inputName, visible) {
    const background = this.add.rectangle(x, y, 60, 60, 0x12362d, 0.72)
      .setStrokeStyle(2, 0xc8f6c9, 0.8).setScrollFactor(0).setDepth(32).setInteractive();
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: label === '跳' ? '19px' : '25px',
      color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(33);
    background.setVisible(visible);
    text.setVisible(visible);
    background.on('pointerdown', () => { this.touch[inputName] = true; });
    background.on('pointerup', () => { this.touch[inputName] = false; });
    background.on('pointerout', () => { this.touch[inputName] = false; });
    this.touchControls.push(background, text);
  }

  createOverlay(mode, title = '', message = '') {
    const width = this.scale.width;
    const height = this.scale.height;
    const panelWidth = Math.min(620, width - 28);
    const panelHeight = Math.min(310, height - 28);
    this.overlay = this.add.container(width / 2, height / 2).setDepth(100).setScrollFactor(0);
    const dim = this.add.rectangle(0, 0, width, height, 0x061b16, 0.56);
    const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x173e32, 0.97)
      .setStrokeStyle(3, 0xc2e99b, 0.92);
    const heading = this.add.text(0, -panelHeight * 0.29, mode === 'start' ? '星落遺跡' : title, {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: width < 520 ? '31px' : '42px',
      color: '#fff0b5', fontStyle: 'bold', stroke: '#173e32', strokeThickness: 5,
    }).setOrigin(0.5);
    const subheading = this.add.text(0, -panelHeight * 0.08, mode === 'start' ? '叢 林 篇  ·  星之試煉' : message, {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: width < 520 ? '16px' : '19px',
      color: '#d7f5d2', align: 'center', wordWrap: { width: panelWidth - 50 },
    }).setOrigin(0.5);
    const instructions = this.add.text(0, panelHeight * 0.12,
      mode === 'start' ? '收集 8 枚星之碎片，避開遺跡尖刺，抵達神殿出口。\n方向鍵／A D 移動　·　Space／↑ 跳躍' : '星之碎片：' + this.shards + ' / 8', {
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: width < 520 ? '14px' : '16px',
        color: '#f3fff0', align: 'center', lineSpacing: 8, wordWrap: { width: panelWidth - 48 },
      }).setOrigin(0.5);
    const buttonY = panelHeight * 0.34;
    const button = this.add.rectangle(0, buttonY, Math.min(230, panelWidth - 44), 50, 0xc8e77a)
      .setStrokeStyle(2, 0xf6ffd5).setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(0, buttonY, mode === 'start' ? '開始探險' : '再探險一次', {
      fontFamily: 'Arial, "Microsoft JhengHei", sans-serif', fontSize: '18px', color: '#183b2b', fontStyle: 'bold',
    }).setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(0xdaf49a));
    button.on('pointerout', () => button.setFillStyle(0xc8e77a));
    button.on('pointerdown', () => {
      if (mode === 'start') this.startGame();
      else {
        this.physics.world.resume();
        this.scene.restart();
      }
    });
    this.overlay.add([dim, panel, heading, subheading, instructions, button, buttonText]);
  }

  startGame() {
    this.overlay.destroy();
    this.overlay = undefined;
    this.gameStarted = true;
    this.player.body.setAllowGravity(true);
    this.player.body.setVelocity(0, 0);
    this.shards = 0;
    this.lives = 3;
    this.refreshHud();
  }

  collectShard(shard) {
    if (!shard.active || !this.gameStarted) return;
    const aura = shard.getData('aura');
    if (aura) aura.destroy();
    this.tweens.add({
      targets: shard, scale: 1.7, alpha: 0, duration: 180,
      onComplete: () => shard.destroy(),
    });
    shard.body.enable = false;
    this.shards += 1;
    this.refreshHud();
    if (this.shards === this.shardPoints.length) {
      this.exit.setTexture('doorOpen');
      this.exitHint.setText('出口已開啟！');
    }
  }

  hurtPlayer() {
    if (!this.gameStarted || this.time.now - this.lastHurtAt < 1050) return;
    this.lastHurtAt = this.time.now;
    this.lives -= 1;
    this.refreshHud();
    if (this.lives <= 0) {
      this.endGame('試煉尚未完成', '遺跡仍等待下一位探險者。');
      return;
    }
    this.player.setTexture('playerHit').setVelocity(0, 0);
    this.player.setPosition(this.spawnX, this.floorY - 30).setAlpha(0.5);
    this.time.delayedCall(650, () => {
      if (this.player?.active) this.player.setAlpha(1).setTexture('playerIdle');
    });
  }

  touchExit() {
    if (!this.gameStarted) return;
    if (this.shards >= this.shardPoints.length) {
      this.endGame('神殿已開啟', '你找回了全部星之碎片，完成叢林試煉！');
    } else if (this.time.now > (this.nextDoorHint || 0)) {
      this.nextDoorHint = this.time.now + 1600;
      this.exitHint.setText(`還差 ${this.shardPoints.length - this.shards} 枚碎片`);
      this.time.delayedCall(1400, () => {
        if (this.exitHint?.active && this.shards < this.shardPoints.length) this.exitHint.setText('集齊 8 枚星之碎片');
      });
    }
  }

  endGame(title, message) {
    this.gameStarted = false;
    this.clearTouch();
    this.player.body.setAllowGravity(false);
    this.player.body.setVelocity(0, 0);
    this.createOverlay(title === '神殿已開啟' ? 'win' : 'lose', title, message);
  }

  refreshHud() {
    if (this.shardLabel) this.shardLabel.setText(`✦ 星之碎片  ${this.shards} / 8`);
    if (this.livesLabel) this.livesLabel.setText(`生命  ${'♥'.repeat(Math.max(this.lives, 0))}`);
  }

  clearTouch() {
    this.touch.left = false;
    this.touch.right = false;
    this.touch.jump = false;
  }

  update(time) {
    if (!this.player?.body || !this.gameStarted) return;
    const body = this.player.body;
    const left = this.keys.left.isDown || this.keys.a.isDown || this.touch.left;
    const right = this.keys.right.isDown || this.keys.d.isDown || this.touch.right;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.space)
      || Phaser.Input.Keyboard.JustDown(this.keys.up)
      || Phaser.Input.Keyboard.JustDown(this.keys.w)
      || (this.touch.jump && !this.touchJumpWasDown);
    this.touchJumpWasDown = this.touch.jump;
    if (jumpPressed) this.jumpQueuedUntil = time + 140;
    if (body.blocked.down || body.touching.down) this.lastGroundedAt = time;

    const speed = 250;
    body.setVelocityX(left === right ? 0 : (left ? -speed : speed));
    if (left) this.player.setFlipX(true);
    if (right) this.player.setFlipX(false);

    const groundedRecently = time - this.lastGroundedAt < 125;
    if (time < this.jumpQueuedUntil && groundedRecently) {
      body.setVelocityY(-495);
      this.jumpQueuedUntil = 0;
      this.lastGroundedAt = -1000;
    }
    if (!groundedRecently && body.velocity.y < -90) {
      this.player.setTexture('playerJump');
    } else if (left || right) {
      this.player.play('walk', true);
    } else {
      this.player.anims.stop();
      this.player.setTexture(body.velocity.y > 80 ? 'playerJump' : 'playerIdle');
    }
    if (this.player.x < 18) this.player.x = 18;
    if (this.player.y > this.worldHeight + 130) this.hurtPlayer();
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#85d7b2',
  pixelArt: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1080 }, debug: false },
  },
  scene: [JungleScene],
});

window.addEventListener('beforeunload', () => game.destroy(true));
