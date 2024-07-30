import Button from "../ui/Button.js";

class BuyInPopup {
    constructor(scene) {
        this.scene = scene;
        this.buyInPopupContainer = null;
        this.overlay = null;
        this.base = null;

        this.CreateBuyInPopup();
    };

    CreateBuyInPopup() {
        this.CreateOverlay();

        this.buyInPopupContainer = this.scene.add.container(0, 0);
        this.buyInPopupContainer.setDepth(4);

        this.base = this.scene.add.image(0, 0, "popup_base").setOrigin(0.5);

        // let messageTextStyle = { fontFamily: "BAHNSCHRIFT", fontSize: '56px', fill: '#fff', fontStyle: 'bold', align: 'center', wordWrap: { width: this.base.displayWidth - 40 } };
        // this.messageText = this.scene.add.text(this.base.x, this.base.y, "Yes get error now go to game please", messageTextStyle).setOrigin(0.5);

        // this.buyInPopupContainer.add([this.base, this.messageText]);
        this.buyInPopupContainer.add([this.base]);

        this.CreateCrossButton();

        this.CreateBuyInSlider();
        this.SetBuyInMinMaxAmount();
        // this.HideBuyInPopup();
    };

    CreateOverlay() {
        this.overlay = this.scene.add.image(0, 0, "overlay").setOrigin(0);
        this.overlay.setDisplaySize(this.scene.scale.width, this.scene.scale.height);
        this.overlay.setInteractive();
        this.overlay.setDepth(4);
    };

    CreateCrossButton() {
        this.crossButton = new Button(this.scene, Math.round(this.scene.scale.width / 2), Math.round(this.scene.scale.height), "cross_button");
        this.crossButton.setClickCallback(this.OnCrossButtonClicked, this);
        this.crossButton.setDepth(5);
    };

    OnCrossButtonClicked() {
        console.log("OnCrossButtonClicked");
        this.HideBuyInPopup();
    };

    ResizeCrossButton(newWidth, newHeight, newScale) {
        this.crossButton.setScale(newScale);
        this.crossButton.setPosition(newWidth / 2 + ((this.base.width / 2 * newScale) - 25 * newScale), newHeight / 2 - ((this.base.height / 2 * newScale) - 25 * newScale));
    };

    //#region - CREATE SLIDER
    CreateBuyInSlider() {
        this.sliderContainer = this.scene.add.container(0, 0);
        this.raiseSliderBase = this.scene.add.image(this.raiseSliderConstantValueObj.basePosX, this.raiseSliderConstantValueObj.basePosY, "raise_base").setOrigin(0);
        this.raiseSliderBar = this.scene.add.image(this.raiseSliderConstantValueObj.barPosX, this.raiseSliderConstantValueObj.barPosY, "raise_bar").setOrigin(0);
        this.raiseSliderBar.setInteractive({ draggable: true });

        let raiseAmountTextStyle = { fontFamily: "BAHNSCHRIFT", fontSize: '30px', fill: '#fff', fontStyle: 'normal', align: 'center' };
        this.raiseAmountText = this.scene.add.text(this.raiseSliderBar.x + this.raiseSliderConstantValueObj.amountTextPosX, this.raiseSliderBar.y - this.raiseSliderConstantValueObj.amountTextPosY, this.minVal, raiseAmountTextStyle).setOrigin(0.5);

        this.sliderContainer.add([this.raiseSliderBase, this.raiseSliderBar, this.raiseAmountText]);

        this.scene.input.on('drag', (pointer, gameObject, dragX) => {
            dragX = Phaser.Math.Clamp(dragX, this.minRange, this.maxRange);
            this.raiseAmount = (dragX / this.limitParam) - (this.minRange / this.limitParam);
            this.raiseAmountText.setText(parseInt(this.raiseAmount + this.minVal));

            gameObject.x = Math.round(dragX);;
            this.raiseAmountText.x = this.raiseSliderConstantValueObj.amountTextPosX + Math.round(dragX);;
        });

        this.buyInPopupContainer.add(this.sliderContainer);
        // this.raiseSliderCloseButton = new Button(this.scene, 0, 0, "raise_popup_cross_button");
        // this.raiseSliderCloseButton.setClickCallback(this.OnRaiseSliderCloseButtonClicked, this);

        // this.raiseSliderOkButton = new Button(this.scene, 0, 0, "raise_popup_correct_button");
        // this.raiseSliderOkButton.setClickCallback(this.OnRaiseSliderOkButtonClicked, this);

        // this.HideRaiseSlider();
    };
    SetBuyInMinMaxAmount(_minAmt, _maxAmt) {
        this.minRange = this.raiseSliderConstantValueObj.clampMinRange;
        this.maxRange = this.raiseSliderConstantValueObj.clampMaxRange;
        this.minVal = _minAmt;
        this.maxVal = _maxAmt;
        this.limitParam = (this.maxRange - this.minRange) / (this.maxVal - this.minVal);

        this.raiseAmountText.setText(this.minVal);
    };

    HideRaiseSlider() {
        this.sliderContainer.setVisible(false);
        // this.raiseSliderCloseButton.hide();
        // this.raiseSliderOkButton.hide();
    };

    ResizeRaiseSlider(newWidth, newHeight, newScale) {
        this.sliderContainer.setScale(newScale);
        this.sliderContainer.setPosition((newWidth / 2 - this.raiseSliderConstantValueObj.containerPosX * newScale), (newHeight - this.raiseSliderConstantValueObj.containerPosY * newScale));

        // this.raiseSliderCloseButton.setScale(newScale);
        // this.raiseSliderCloseButton.setPosition(this.sliderContainer.x - this.raiseSliderConstantValueObj.closeButtonPosX * newScale, this.sliderContainer.y + this.raiseSliderConstantValueObj.closeButtonPosY * newScale);

        // this.raiseSliderOkButton.setScale(newScale);
        // this.raiseSliderOkButton.setPosition(this.sliderContainer.x + (this.raiseSliderBase.width + this.raiseSliderConstantValueObj.okButtonPosX) * newScale, this.sliderContainer.y + this.raiseSliderConstantValueObj.okButtonPosY * newScale);
    };
    //#endregion

    ShowBuyInPopup(_msg) {
        this.messageText.setText(_msg);
        this.overlay.setVisible(true);
        this.buyInPopupContainer.setVisible(true);
        this.crossButton.show();
        this.crossButton.enable();
    };

    HideBuyInPopup() {
        this.overlay.setVisible(false);
        this.buyInPopupContainer.setVisible(false);
        this.crossButton.hide();
    };

    OverlayPressed() { }

    resize(newWidth, newHeight, newScale) {
        this.overlay.setDisplaySize(newWidth, newHeight);
        this.buyInPopupContainer.setScale(newScale);
        this.buyInPopupContainer.setPosition((newWidth / 2), (newHeight / 2));
        this.ResizeCrossButton(newWidth, newHeight, newScale);

        this.ResizeRaiseSlider(newWidth, newHeight, newScale);
    };

};
export default BuyInPopup