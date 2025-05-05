// Yahir Rico

// Art assets from Kenny Assets set:
// https://kenney.nl/assets/alien-ufo-pack
// https://kenney.nl/assets/space-shooter-redux
// https://kenney.nl/assets/sci-fi-sounds


// debug with extreme prejudice
"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 800,
    height: 600,
    fps: { forceSetTimeOut: true, target: 30 },
    scene: [MainMenuScene, GameScene, GameOverScene]
}

const game = new Phaser.Game(config);