import Phaser from "phaser";
import { Constant } from "../Constant.js";
import { SelectedResolution } from "../ResolutionSelector.js";
import { Utils } from "../Utils.js";
import Text from "../ui/Text.js";
import Button from "../ui/Button.js";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");

    };

    init() { };
    preload() { };

    create() {
        this.game.events.on("resize", this.resize, this);

        this.CreateGameplayBg();
        this.CreatePlayButton();
        this.CreateWheel();

        this.resize(window.innerWidth, window.innerHeight);

    };

    CreateGameplayBg() {
        this.gameplayBg = this.add.image(0, 0, "background").setOrigin(0);
    };
    ResizeGamePlayBg(newWidth, newHeight) {
        this.gameplayBg.setDisplaySize(newWidth, newHeight);
    };

    CreatePlayButton() {
        this.playButton = new Button(this, Math.round(this.scale.width / 2), Math.round(this.scale.height / 2), "button_base");
        this.playButton.setClickCallback(this.OnPlayButtonClicked, this);

        this.playButtonText = new Text(this, this.playButton.x, this.playButton.y, {
            text: "PLAY",
            fontFamily: "BAHNSCHRIFT",
            fontSize: "50px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center",
            wordWrap: {},
            shadow: {},
        }
        );
    };
    OnPlayButtonClicked() {
        this.playButtonText.TextScaleTween();
        console.log("Play buttn");
        this.SpinWheel();
    };
    ResizePlayButton(newWidth, newHeight, newScale) {
        this.playButton.setScale(newScale);
        this.playButton.setPosition(newWidth / 2, newHeight / 2 + 400 * newScale);

        this.playButtonText.setScale(newScale);
        this.playButtonText.setPosition(this.playButton.x, this.playButton.y);
    };


    CreateWheel() {
        this.wheel = this.add.sprite(0, 0, "wheel");
        this.pin = this.add.sprite(0, 0, "pin");
        this.pin.flipY = true;
        this.prizeAmountText = new Text(this, 0, 0, {
            text: "Your prize",
            fontFamily: "BAHNSCHRIFT",
            fontSize: "50px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center",
            wordWrap: {},
            shadow: {},
        }
        );

        this.canSpin = true;
    };

    SpinWheel() {
        if (this.canSpin) {
            this.prizeAmountText.setText("");
            this.canSpin = false;

            const rounds = Phaser.Math.Between(3, 5); // Number of rounds to spin
            const degrees = Phaser.Math.Between(0, 360); // Degrees to rotate
            const totalAngle = 360 * rounds;

            //If the pin is on the top of the wheel
            const numSegments = Constant.slicePrizes.length;
            const segmentSize = 360 / numSegments;
            const segmentIndex = Math.floor(degrees / segmentSize) % numSegments;
            const stopAngle = (segmentIndex * segmentSize) + (segmentSize / 2);

            this.tweens.add({
                targets: [this.wheel],
                angle: totalAngle - stopAngle,
                duration: Constant.rotationTime,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function (tween) {
                    this.prizeAmountText.setText(Constant.slicePrizes[segmentIndex]);
                    this.canSpin = true;
                }
            });
        }
    };

    ResizeWheel(newWidth, newHeight, newScale) {
        this.wheel.setScale(newScale);
        this.wheel.setPosition(newWidth / 2, newHeight / 2);

        this.pin.setScale(newScale);
        //Top of the wheel
        this.pin.setPosition(newWidth / 2, newHeight / 2 - 270 * newScale);

        //Middle of the wheel
        // this.pin.setPosition(newWidth / 2, newHeight / 2);

        this.prizeAmountText.setScale(newScale);
        this.prizeAmountText.setPosition(newWidth / 2, newHeight / 2 - 350 * newScale);
    }


    resize(newWidth, newHeight) {
        let newScale = Utils.getScale(SelectedResolution.width, SelectedResolution.height, newWidth, newHeight);
        this.ResizeGamePlayBg(newWidth, newHeight);
        this.ResizePlayButton(newWidth, newHeight, newScale);
        this.ResizeWheel(newWidth, newHeight, newScale);
    };

    //########################################################################################


}