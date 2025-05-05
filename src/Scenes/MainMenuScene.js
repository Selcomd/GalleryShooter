// Yahir Rico

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("mainMenu");
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.audio("menuMusic", "assets/BGM.mp3");
    }

    create() {
        const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        this.music = this.sound.add("menuMusic", { loop: true, volume: 0.5 });
        this.music.play();

        this.add.text(this.scale.width / 2, 250, "GALAXY ESCAPE", {
            fontSize: "32px", fill: "#fff"
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, 320, "Press SPACE to Start", {
            fontSize: "24px", fill: "#fff"
        }).setOrigin(0.5);

        this.input.keyboard.once("keydown-SPACE", () => {
            this.music.stop();
            this.scene.start("gameScene");
        });
    }
}
