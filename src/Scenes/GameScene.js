// Yahir Rico

class GameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.image("player", "assets/playerShip.png");
        this.load.image("agileEnemy", "assets/agileEnemy.png");
        this.load.image("tankEnemy", "assets/tankEnemy.png");
        this.load.image("playerLaser", "assets/laserBlue01.png");
        this.load.image("enemyLaser", "assets/enemyLaser.png");

        this.load.audio("playerShoot", "assets/laserSound.ogg");
        this.load.audio("enemyShoot", "assets/impactNoise.ogg");
        this.load.audio("impactNoise", "assets/impactNoise.ogg");
        this.load.audio("explosion", "assets/death.ogg");
        this.load.audio("bgm", "assets/BGM.mp3");
    }

    create() {
        this.resetGameState();

        const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        this.bgm = this.sound.add("bgm", { loop: true, volume: 0.3 });
        this.bgm.play();

        this.player = this.add.sprite(400, 550, "player").setScale(0.5);
        this.player.health = this.playerHealth;

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.waveText = this.add.text(16, 16, "Wave: " + this.waveNumber, { fontSize: "20px", fill: "#fff" });
        this.scoreText = this.add.text(300, 16, "Score: 0", { fontSize: "20px", fill: "#fff" });
        this.livesText = this.add.text(650, 16, "Lives: x" + this.playerHealth, { fontSize: "20px", fill: "#fff" });

        this.spawnEnemies();
    }

    update() {
        if (!this.waveCompleteShown) {
            if (this.aKey.isDown) this.player.x -= 5;
            if (this.dKey.isDown) this.player.x += 5;
            this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);

            const now = this.time.now;
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && now - this.lastFired > this.fireCooldown) {
                const laser = this.add.sprite(this.player.x, this.player.y - 20, "playerLaser").setScale(0.5);
                this.playerShots.push(laser);
                this.sound.play("playerShoot");
                this.lastFired = now;
            }

            this.playerShots.forEach((shot, i) => {
                shot.y -= 10;
                if (shot.y < -shot.height) {
                    shot.destroy();
                    this.playerShots.splice(i, 1);
                }
            });

            this.enemyShots.forEach((shot, i) => {
                shot.y += (shot.velocity?.y || 6) * 0.02;
                if (shot.y > 600) {
                    shot.destroy();
                    this.enemyShots.splice(i, 1);
                }
            });

            this.enemies.forEach(enemy => {
                enemy.x += enemy.moveDir * enemy.speed;

                if (enemy.type === "agileEnemy") {
                    enemy.y = enemy.baseY + Math.sin(this.time.now / 200 + enemy.waveOffset) * 10;
                }

                if (enemy.x < 20 || enemy.x > 780) {
                    enemy.moveDir *= -1;
                }
            });

            this.collisionCheck();

            if (this.player.health <= 0) {
                this.bgm.stop();
                this.scene.start("gameOverScene", { finalScore: this.score });
            }

            if (this.enemies.length === 0 && !this.waveCompleteShown) {
                this.waveCompleteShown = true;

                const overlay = this.add.rectangle(400, 300, 450, 160, 0.8);
                const text = this.add.text(240, 270, 'Wave Complete!\n[C] Continue | [M] Main Menu', {
                    fontSize: '20px',
                    fill: '#ffffff',
                    align: 'center'
                });

                this.input.keyboard.once("keydown-C", () => {
                    overlay.destroy();
                    text.destroy();
                    this.waveNumber++;
                    this.waveText.setText("Wave: " + this.waveNumber);
                    this.waveCompleteShown = false;
                    this.spawnEnemies();
                });

                this.input.keyboard.once("keydown-M", () => {
                    this.bgm.stop();
                    this.scene.start("mainMenu");
                });
            }
        }
    }

    spawnEnemies() {
        const layout = [
            { type: "tankEnemy", x: 100, y: 80 },
            { type: "agileEnemy", x: 220, y: 150 },
            { type: "tankEnemy", x: 340, y: 80 },
            { type: "agileEnemy", x: 460, y: 150 },
            { type: "tankEnemy", x: 580, y: 80 }
        ];

        layout.forEach(({ type, x, y }) => {
            const enemy = this.add.sprite(x, y, type).setScale(0.5);
            enemy.type = type;
            enemy.health = type === "tankEnemy" ? 3 : 2;
            enemy.speed = type === "tankEnemy" ? 1.0 : 2;
            enemy.moveDir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

            if (type === "agileEnemy") {
                enemy.baseY = y;
                enemy.waveOffset = Math.random() * Math.PI * 2;
            }

            enemy.shootTimer = this.time.addEvent({
                delay: Phaser.Math.Between(1000, 2500),
                callback: () => this.shotsFromEnemy(enemy),
                callbackScope: this,
                loop: true
            });

            this.enemies.push(enemy);
        });
    }

    shotsFromEnemy(enemy) {
        if (!enemy.active) return;

        const shot = this.add.sprite(enemy.x, enemy.y + 20, "enemyLaser").setScale(0.5);
        shot.velocity = { x: 0, y: 200 };
        this.enemyShots.push(shot);
        this.sound.play("enemyShoot");
    }

    collisionCheck() {
        this.playerShots.forEach((shot, sIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                if (collisions(shot, enemy)) {
                    shot.destroy();
                    this.playerShots.splice(sIndex, 1);
                    enemy.health--;
                    if (enemy.health <= 0) {
                        if (enemy.shootTimer) enemy.shootTimer.remove();
                        enemy.destroy();
                        this.enemies.splice(eIndex, 1);
                        this.sound.play("explosion");
                        this.score += 100;
                        this.scoreText.setText("Score: " + this.score);
                    } else {
                        this.sound.play("impactNoise");
                    }
                }
            });
        });

        this.enemyShots.forEach((shot, i) => {
            if (collisions(shot, this.player)) {
                shot.destroy();
                this.enemyShots.splice(i, 1);
                this.player.health--;
                this.livesText.setText("Lives: x" + this.player.health);
                this.sound.play("explosion");
            }
        });
    }

    resetGameState() {
        this.score = 0;
        this.playerHealth = 3;
        this.waveNumber = 1;

        this.playerShots = [];
        this.enemyShots = [];
        this.enemies = [];
        this.waveCompleteShown = false;

        this.lastFired = 0;
        this.fireCooldown = 300;
    }
}

function collisions(a, b) {
    const ax = a.x, ay = a.y, arx = a.displayWidth / 2, ary = a.displayHeight / 2;
    const bx = b.x, by = b.y, brx = b.displayWidth / 2, bry = b.displayHeight / 2;

    if (Math.abs(ax - bx) > arx + brx) return false;
    if (Math.abs(ay - by) > ary + bry) return false;

    return true;
}
