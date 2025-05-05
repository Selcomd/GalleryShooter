// Yahir Rico

class GameOverScene extends Phaser.Scene {
    constructor() {
        super("gameOverScene");
    }


    create(data) {
        const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        this.add.text(400, 200, "GAME OVER", {
            fontSize: "40px",
            fill: "#ff0000"
        }).setOrigin(0.5);

        this.add.text(400, 270, `Final Score: ${data.finalScore}`, {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(400, 340, "Press R to Retry or M for Main Menu", {
            fontSize: "20px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        this.input.keyboard.once("keydown-R", () => {
            this.scene.start("gameScene");
        });

        this.input.keyboard.once("keydown-M", () => {
            this.scene.start("mainMenu");
        });
    }
}
