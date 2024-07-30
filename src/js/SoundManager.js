class SoundManager {
    constructor() {
        this.scene = null;
        this.gameBgSound = null;
        this.buttonClickSound = null;
        this.looseSound = null;
        this.winSound = null;
        this.wheelSound = null;
    };

    CreateSound(scene) {
        this.scene = scene.systems.game;
        this.gameBgSound = this.scene.sound.add('bg_sound');
        this.buttonClickSound = this.scene.sound.add('button_sound');
        this.looseSound = this.scene.sound.add('loose_sound');
        this.winSound = this.scene.sound.add('win_sound');
        this.wheelSound = this.scene.sound.add('wheel_sound');
    };

    ButtonClickSound() {
        if (localStorage.getItem("spin_wheel_is_sound_on") == null) {
            localStorage.setItem("spin_wheel_is_sound_on", 1);
        }
        if (localStorage.getItem('spin_wheel_is_sound_on') == 1) {
            this.buttonClickSound.play();
        }
    };
    PlayWheelSound() {
        if (localStorage.getItem('spin_wheel_is_sound_on') == 1) {
            this.wheelSound.loop = true;
            this.wheelSound.play();
        }
    };
    StopWheelSound() {
        if (localStorage.getItem('spin_wheel_is_sound_on') == 1) {
            this.wheelSound.stop();
            this.wheelSound.loop = false;

        }
    };
    PlayWinSound() {
        if (localStorage.getItem('spin_wheel_is_sound_on') == 1) {
            this.winSound.play();
        }
    };
    PlayLooseSound() {
        if (localStorage.getItem('spin_wheel_is_sound_on') == 1) {
            this.looseSound.play();
            this.gameBgSound.volume = 0.6;
        }
    };

    PlayGameBgSound() {
        if (localStorage.getItem('spin_wheel_is_sound_on') == 1) {
            this.gameBgSound.play();
            this.gameBgSound.loop = true;
            this.gameBgSound.volume = 0.7;
        }
    }
    StopGameBgSound() {
        this.gameBgSound.stop();
    }

};

let sound = new SoundManager();

export { sound as SoundManager };