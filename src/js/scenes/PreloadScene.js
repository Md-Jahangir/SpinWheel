import Phaser from "phaser";
import FontFaceObserver from "fontfaceobserver";
import { Utils } from "../Utils.js";
import { SelectedResolution } from "../ResolutionSelector.js";
import { Server } from "../services/Server.js";

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
        this.progressBar = null;
        this.loadingText = null;
        this.fonts = {
            "BAHNSCHRIFT": null,
        }

        this.buttonImagesArray = [
            { name: 'button_base', path: 'assets/images/button_base.png' },

        ];

        this.imagesNameArray = [
            { name: "one_pixel_white", path: "assets/images/one_pixel_white.png" },
            { name: "error_logo", path: "assets/images/error_logo.png" },
            { name: "wheel", path: "assets/images/wheel.png" },
            { name: "pin", path: "assets/images/pin.png" },

        ];

        this.spritesheetArray = [
            // { name: 'card_spritesheet', path: 'assets/images/gameScene/player/card_spritesheet47.png', frameConfig: { frameWidth: 2205 / 13, frameHeight: 1200 / 5 } },

        ];

        this.audioFiles = [
            // { name: 'card', path: 'assets/sounds/card.mp3' },
        ];
    }

    preload() {
        let url;
        url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js';
        this.load.plugin('rexbbcodetextplugin', url, true);

        url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js';
        this.load.plugin('rextexteditplugin', url, true);

        //SPLASH
        this.load.image('background', 'assets/images/background.png');
        this.load.image('progress_base', 'assets/images/preloadScene/progress_base.png');
        this.load.image('progress_bar', 'assets/images/preloadScene/progress_bar.png');

    };

    create() {
        this.game.events.on("resize", this.resize, this);

        this.splashBg = this.add.image(0, 0, "background").setOrigin(0);
        // this.progressBase = this.add.image(Math.round(this.scale.width / 2), Math.round(this.scale.height / 1.1), "progress_base").setOrigin(0.5);
        // this.progressBar = this.add.image(Math.round(this.scale.width / 2), Math.round(this.scale.height / 1.1), "progress_bar").setOrigin(0.5);
        let loadingTextStyle = { fontFamily: 'Poppins_Bold', fontSize: '62px', fill: '#FFF', fontStyle: "normal", align: 'center' };
        // this.loadingText = this.add.text(Math.round(this.scale.width / 2), Math.round(this.scale.height / 1.1), "Loading: ", loadingTextStyle).setOrigin(0.5);
        this.loadingText = this.add.text(Math.round(this.scale.width / 2), Math.round(this.scale.height / 2), "Loading: ", loadingTextStyle).setOrigin(0.5);
        // this.progressBar.setCrop(0, 0, 0, this.progressBar.height);
        this.LoadFonts();
        // this.progressBase.setVisible(false);
        // this.progressBar.setVisible(false);
        this.resize(window.innerWidth, window.innerHeight);
    };

    LoadFonts() {
        let propNames = Object.getOwnPropertyNames(this.fonts);
        propNames.forEach((fontName, index) => {
            let isLast = index >= propNames.length - 1;
            this.fonts[fontName] = new FontFaceObserver(fontName);
            this.fonts[fontName].load().then(this.FontLoadSuccess.bind(this, fontName, isLast), this.FontLoadError.bind(this, fontName));
        });
    };

    FontLoadSuccess(fontName, isLast) {
        if (isLast) {
            this.LoadAssests();
        }
    };
    FontLoadError(fontName) { };

    LoadAssests() {
        this.load.on('progress', this.LoadProgress, this);
        this.load.on('complete', this.OnComplete, { scene: this.scene });


        this.buttonImagesArray.forEach(button => {
            this.load.image(`${button.name}_normal`, button.path);
            this.load.image(`${button.name}_hover`, button.path);
            this.load.image(`${button.name}_disabled`, button.path);
        });

        this.imagesNameArray.forEach(_img => {
            this.load.image(_img.name, _img.path);
        });

        this.spritesheetArray.forEach(_img => {
            this.load.spritesheet(_img.name, _img.path, _img.frameConfig);
        });

        this.audioFiles.forEach(audio => {
            this.load.audio(audio.name, audio.path);
        });


        this.load.start();
    };

    LoadProgress(percentage) {
        // this.progressBar.setCrop(0, 0, this.progressBar.width * percentage, this.progressBar.height);
        percentage = percentage * 100;
        this.loadingText.setText("Loading: " + parseInt(percentage) + " %");
    }

    OnComplete() {
        setTimeout(() => {
            this.scene.stop('PreloadScene');
            this.scene.start("GameScene");
        }, 1000);
    }

    resize(newWidth, newHeight) {
        let newScale = Utils.getScale(SelectedResolution.width, SelectedResolution.height, newWidth, newHeight);

        this.splashBg.setDisplaySize(newWidth, newHeight);


        // this.progressBase.setScale(newScale);
        // this.progressBase.setPosition(
        //     newWidth / 2,
        //     newHeight / 1.1
        // );

        // this.progressBar.setScale(newScale);
        // this.progressBar.setPosition(
        //     newWidth / 2,
        //     newHeight / 1.1
        // );

        this.loadingText.setScale(newScale);
        this.loadingText.setPosition(
            newWidth / 2,
            // newHeight / 1.07
            newHeight / 2
        );
    }

}