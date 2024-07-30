// const cp = new BroadcastChannel("create-player-channel");
import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import GameErrorScene from './scenes/GameErrorScene.js';
import { Constant } from './Constant.js';

Constant.isMobile = /iPhone|iPhoneX|iPod|iPad|BlackBerry|kindle|playbook|Windows Phone|Android/i.test(navigator.userAgent);
let config = {
    type: Phaser.AUTO,
    parent: "pokertexasholdem",
    dom: {
        createContainer: true
    },
    plugins: {
        scene: [
            {
                key: 'SpinePlugin',
                plugin: window.SpinePlugin,
                sceneKey: 'spine'
            },
        ]
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    scene: [PreloadScene, GameScene, GameErrorScene]
};

Constant.game = new Phaser.Game(config);

window.focus();

window.addEventListener("resize", resize, false);

function resize() {
    let clientWidth = window.innerWidth;
    let clientHeight = window.innerHeight;
    Constant.game.events.emit("resize", clientWidth, clientHeight);
};