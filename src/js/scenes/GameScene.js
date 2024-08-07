import Phaser from "phaser";
import { Constant } from "../Constant.js";
import { SelectedResolution } from "../ResolutionSelector.js";
import { Utils } from "../Utils.js";
import Text from "../ui/Text.js";
import Button from "../ui/Button.js";
import { SoundManager } from "../SoundManager.js";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
        this.numOfPrizes = null;
        this.angleStep = null;
        this.prizesTextArray = [];
        this.prizesDataArray = [];
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
        SoundManager.ButtonClickSound();
        this.playButtonText.TextScaleTween();
        this.SpinWheel();
    };
    ResizePlayButton(newWidth, newHeight, newScale) {
        this.playButton.setScale(newScale);
        this.playButton.setPosition(newWidth / 2, newHeight / 2 + 400 * newScale);

        this.playButtonText.setScale(newScale);
        this.playButtonText.setPosition(this.playButton.x, this.playButton.y);
    };

    CreateWheel() {
        this.numOfPrizes = Constant.slicePrizes.length;
        this.angleStep = 360 / this.numOfPrizes;
        this.prizesTextArray = [];

        this.wheel = this.add.sprite(0, 0, "wheel");
        this.pin = this.add.sprite(0, 0, "pin");
        // this.pin.flipY = true;

        for (let i = 0; i < this.numOfPrizes; i++) {
            this.prizeText = this.add.text(
                this.wheel.x,
                this.wheel.y,
                Constant.slicePrizes[i],
                {
                    fontFamily: 'BAHNSCHRIFT',
                    fontSize: '22px',
                    fontStyle: 'bold',
                    color: '#ffffff',
                    align: 'center',
                },

            );
            this.prizeText.setOrigin(0.5);
            this.prizesTextArray.push(this.prizeText);
        }

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

    updatePrizesTextPositions() {
        const wheelAngle = Phaser.Math.DegToRad(this.wheel.angle);
        this.prizesTextArray.forEach((prizeText, index) => {
            const data = this.prizesDataArray[index];
            const x = this.wheel.x + data.radius * Math.cos(data.angle + wheelAngle);
            const y = this.wheel.y + data.radius * Math.sin(data.angle + wheelAngle);
            prizeText.setPosition(x, y);
            prizeText.setRotation(data.angle + wheelAngle + Phaser.Math.DegToRad(90)); // Adjust rotation
        });
    }

    SpinWheel() {
        if (this.canSpin) {
            SoundManager.PlayWheelSound();
            this.canSpin = false;
            this.playButton.disable();
            this.playButtonText.disable();
            this.prizeAmountText.setText("");

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
                delay: 200,
                angle: totalAngle - stopAngle,
                duration: Constant.rotationTime,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onUpdate: this.updatePrizesTextPositions,//for dynamic prize text
                onComplete: function (tween) {
                    SoundManager.StopWheelSound();
                    this.prizeAmountText.setText(Constant.slicePrizes[segmentIndex]);
                    if (Constant.slicePrizes[segmentIndex] == "BAD LUCK!!!") {
                        SoundManager.PlayLooseSound();
                    } else {
                        SoundManager.PlayWinSound();
                    }
                    setTimeout(() => {
                        this.canSpin = true;
                        this.playButton.enable();
                        this.playButtonText.enable();
                    }, 300);

                }
            });
        }
    };

    ResizeWheel(newWidth, newHeight, newScale) {
        this.wheel.setScale(newScale);
        this.wheel.setPosition(newWidth / 2, newHeight / 2);

        this.pin.setScale(newScale);
        //Top of the wheel
        // this.pin.setPosition(newWidth / 2, newHeight / 2 - 270 * newScale);

        //Middle of the wheel
        this.pin.setPosition(newWidth / 2, newHeight / 2);

        for (let i = 0; i < this.prizesTextArray.length; i++) {
            this.prizesTextArray[i].setScale(newScale);

            if (i == 0) {
                this.prizesTextArray[i].setAngle(this.angleStep / 2);
                this.prizesTextArray[i].setPosition(
                    this.wheel.x + (this.wheel.width / 2.5) * Math.cos(Phaser.Math.DegToRad(22.5 - 90)) * newScale,
                    this.wheel.y + (this.wheel.height / 2.5) * Math.sin(Phaser.Math.DegToRad(22.5 - 90)) * newScale
                );
            } else {
                this.prizesTextArray[i].setAngle(i * this.angleStep + this.angleStep / 2);
                this.prizesTextArray[i].setPosition(
                    this.wheel.x + (this.wheel.width / 2.5) * Math.cos(Phaser.Math.DegToRad(i * this.angleStep + this.angleStep / 2 - 90)) * newScale,
                    this.wheel.y + (this.wheel.height / 2.5) * Math.sin(Phaser.Math.DegToRad(i * this.angleStep + this.angleStep / 2 - 90)) * newScale
                );
            }

            const angle = Phaser.Math.DegToRad(i * this.angleStep + this.angleStep / 2 - 90);
            const radius = (this.wheel.width / 2.5) * newScale;
            this.prizesDataArray.push({ angle: angle, radius: radius });
        }

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