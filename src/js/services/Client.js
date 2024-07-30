import io from 'socket.io-client';
import { Model } from "../Model";
import { Constant } from '../Constant.js';

// Connection to a broadcast channel
class Client {
    constructor() {
        this.GetValueFromServer();
        this.SetValueFromQueryParameter();

        // this.baseUrl = "http://3.129.109.248:4008/pokerCoreEngine";
        // this.baseUrl = "http://44.207.196.95:5002/pokerCoreEngineOmaha";
        this.baseUrl = "http://localhost:5002/pokerCoreEngineOmaha";
        // this.baseUrl = "http://192.168.1.25:5008/pokerCoreEngineOmaha";//stagging local machine

        // this.gameId = null;
        this.userId = null;
        this.isAutoMuck = null;
        this.isSitIn = null;


        // this.socket = io(this.baseUrl, {
        //     // query: {
        //     //     token: this.token
        //     // }
        // });

        // this.InitSocketListeners();
    };

    async GetValueFromServer() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.authToken = this.urlParams.get("authToken");
        this.tableId = this.urlParams.get("table_id");
        this.buyIn = this.urlParams.get("buyIn");
        this.maxPlayers = this.urlParams.get("max_players");
        this.smallBlind = this.urlParams.get("smallBlind");
        this.bigBlind = this.urlParams.get("bigBlind");
    };
    async SetValueFromQueryParameter() {
        Model.SetAuthToken(this.authToken);
        Model.SetTableId(this.tableId);
        Model.SetBuyInAmount(this.buyIn);
        Model.SetMaxPlayersCount(this.maxPlayers);
        Model.SetSmallBlindAmount(this.smallBlind);
        Model.SetBigBlindAmount(this.bigBlind);
    };
    IsParamsMissing() {
        if (!this.authToken || !this.tableId || !this.buyIn || !this.maxPlayers) {
            return true;
        }
        return false;
    };

    //############################### ON EVENT #######################################
    async InitSocketListeners() {
        let ref = this;
        this.socket.on('connect', () => {
            console.log('Socket successfully connected!');
            // this.SetConnection();
        });


        this.socket.on('disconnect', () => {
            console.log('Disconnected!');
        });

        // this.socket.on('reconnect', () => {
        //     console.log('The reconnect occurred!');
        // });

        // this.socket.on('reconnecting', () => {
        //     console.log('reconnecting !');
        // });

        await this.VerifyUser();
        await this.GetRoomDetails();
        await this.LeaveRoomSuccess();
        await this.UpdateRoom();
        await this.StartGame();
        await this.UpdateBlinds();
        await this.StartPreFlopRound();
        await this.SendBetData();
        await this.UpdateTimer();
        await this.PotSplitData();
        await this.UpdatePotValue();
        await this.DealFlopRound();
        await this.DealTurnRound();
        await this.DealRiverRound();
        await this.DealShowDownRound();
        await this.SitInSuccess();
        await this.ReplayHand();
        await this.GetRoundData();
        await this.ReconnectSession();

    };

    //##################################################################################
    //#region - All Emit Events 

    async SetConnection() {
        let data = {
            "authToken": Model.GetAuthToken(),
        }
        console.log("SetConnection Model.GetAuthToken(): ", Model.GetAuthToken());
        this.socket.emit("set-connection", data);
    };

    async JoinRoom() {
        let data = {
            "authToken": Model.GetAuthToken(),
            "table_id": Model.GetTableId(),
            "buyIn": Model.GetBuyInAmount(),
            "max_players": Model.GetMaxPlayersCount()
        }
        console.log("Model.GetAuthToken(): ", Model.GetAuthToken());
        console.log("Model.GetTableId(): ", Model.GetTableId());
        console.log("Model.GetBuyInAmount(): ", Model.GetBuyInAmount());
        console.log("Model.GetMaxPlayersCount(): ", Model.GetMaxPlayersCount());
        this.socket.emit("join-room", data);
    };

    async LeaveRoom() {
        let data = {
            "authToken": Model.GetAuthToken(),
        }
        this.socket.emit("leave-room", data);
    };

    async PlaceBet(_token, _gameId, _userId, _inHandBalance, _betAmount) {
        console.log("PlaceBet _token: ", _token);
        console.log("PlaceBet _gameId: ", _gameId);
        console.log("PlaceBet _userId: ", _userId);
        console.log("PlaceBet _inHandBalance: ", _inHandBalance);
        console.log("PlaceBet _betAmount: ", _betAmount);
        let data = {
            "authToken": _token,
            "game_id": _gameId,
            "user_id": _userId,
            "buyIn": _inHandBalance,
            "bet": _betAmount,
        }
        this.socket.emit("update-bet", data);
    };

    async AutoMuck() {
        let data = {
            "authToken": Model.GetAuthToken(),
            // "game_id": this.gameId,
            "game_id": Model.GetGameId(),
            "auto_muck": this.isAutoMuck,
        }
        this.socket.emit("auto-muck", data);
    };
    async SitIn() {
        let data = {
            "authToken": Model.GetAuthToken(),
            // "game_id": this.gameId,
            "game_id": Model.GetGameId(),
            "sit_in": this.isSitIn
        }
        this.socket.emit("sit-in", data);
    };


    //#endregion
    //##################################################################################

    //##################################################################################
    //#region - All Listen Events 

    async VerifyUser() {
        this.socket.on('verify-user', async (_data) => {
            console.log('verify-user !', _data);
            if (!_data.error) {
                Model.SetLocalPlayerId(_data.data.user_id);
                await this.JoinRoom();
            } else {
                Constant.game.events.emit("evtShowAlert", _data.message);
            }
        });
    };

    async GetRoomDetails() {
        this.socket.on('room-details', async (_data) => {
            console.log('room-details !', _data);
            if (!_data.error) {
                Model.SetRoomDetailsData(_data.data);
                Model.SetPlayersData(_data.data.players);
                Constant.game.events.emit("evtCreatePlayer");
            } else {
                Constant.game.events.emit("evtShowAlert", _data.message);
            }
        });
    };

    async LeaveRoomSuccess() {
        this.socket.on('leave-room-res', async (_data) => {
            console.log('leave-room-res !', _data);
            if (!_data.error) {
                // Model.SetRoomDetailsData(_data.data);
                // Constant.game.events.emit("evtCreatePlayer");

            }
        });
    };

    async UpdateRoom() {
        this.socket.on('update-room', async (_data) => {
            console.log('update-room !', _data);
            if (!_data.error) {
                if (_data.data.is_joining == true) {
                    Model.UpdateRoomDetailsData(_data.data);
                    Constant.game.events.emit("evtCreatePlayer");
                } else {
                    Model.SetLeavedRoomPlayerDetails(_data.data);
                    Constant.game.events.emit("evtInactivePlayer");
                }
            } else {
                Constant.game.events.emit("evtShowAlert", _data.message);
            }
        });
    };

    async StartGame() {
        this.socket.on('start-game', async (_data) => {
            // console.log('start-game !', _data);
            if (!_data.error) {
                Model.SetGameId(_data.data.game_id);
                Model.SetRoomName(_data.data.room_name);
                // this.gameId = _data.data.game_id;
                Model.SetSmallBigBlindPlayerData(_data.data);
                Model.SetSmallBlindPlayerId(_data.data);
                Model.SetBigBlindPlayerId(_data.data);
                Constant.game.events.emit("evtShowSmallAndBigBlind");
            } else {
                Constant.game.events.emit("evtShowAlert", _data.message);
            }
        });
    };

    async UpdateBlinds() {
        this.socket.on('update-blind', async (_data) => {
            console.log('update-blind !', _data);
            Model.SetUpdateBlindsData(_data.data);
            Constant.game.events.emit("evtShowBlindDeductAnimation");
        });
    };

    async StartPreFlopRound() {
        this.socket.on('pre-flop', async (_data) => {
            console.log('pre-flop !', _data);
            if (!_data.error) {
                Model.SetPreFlopRoundData(_data.data);
                Constant.game.events.emit("evtShowCardDistributionAnimation");

            }
        });
    };

    async SendBetData() {
        this.socket.on('send-bet', async (_data) => {
            console.log('send-bet !', _data);
            if (!_data.error) {
                Model.SetTurnData(_data.data);
                Constant.game.events.emit("evtChangeTurn");
            } else {
                Constant.game.events.emit("evtShowAlert", _data.message);
            }
        });
    };

    async UpdateTimer() {
        this.socket.on('update-timer', async (_data) => {
            // console.log('update-timer !', _data);
            if (!_data.error) {
                Model.SetTimerData(_data);
                Constant.game.events.emit("evtShowTimer");
            }
        });
    };

    async UpdatePotValue() {
        this.socket.on('update-pot', async (_data) => {
            console.log('update-pot !', _data);
            if (!_data.error) {
                Model.SetUpdatePotValueData(_data);
                Constant.game.events.emit("evtUpdatePotValue");
            }
        });
    };

    async PotSplitData() {
        this.socket.on('pot-split', async (_data) => {
            console.log('pot-split !', _data);
        });
    };

    async DealFlopRound() {
        this.socket.on('deal-flop', async (_data) => {
            console.log('deal-flop !', _data);
            if (!_data.error) {
                Model.SetDealFlopRoundData(_data.data);
                Constant.game.events.emit("evtDealFlopRound");
            }
        });
    };

    async DealTurnRound() {
        this.socket.on('deal-turn', async (_data) => {
            console.log('deal-turn !', _data);
            if (!_data.error) {
                Model.SetDealTurnRoundData(_data.data)
                Constant.game.events.emit("evtDealTurnRound");
            }
        });
    };

    async DealRiverRound() {
        this.socket.on('deal-river', async (_data) => {
            console.log('deal-river !', _data);
            if (!_data.error) {
                Model.SetDealRiverRoundData(_data.data);
                Constant.game.events.emit("evtDealRiverRound");
            }
        });
    };

    async DealShowDownRound() {
        this.socket.on('show-down', async (_data) => {
            console.log('show-down !', _data);
            if (!_data.error) {
                Model.SetShowDownRoundData(_data.data);
                Constant.game.events.emit("evtShowDownRound");
            }
        });
    };

    async SitInSuccess() {
        this.socket.on('sit-in-res', async (_data) => {
            console.log('sit-in-res !', _data);
        });
    };

    async ReplayHand() {
        this.socket.on('replay-hand', async (_data) => {
            console.log('replay-hand !', _data);
            if (!_data.error) {
                Model.SetReplayHandData(_data.data);
                Constant.game.events.emit("evtReplayHand");
            } else {
                Constant.game.events.emit("evtShowAlert", _data.message);
            }
        });
    };

    async GetRoundData() {
        this.socket.on('round-data', async (_data) => {
            console.log('round-data !', _data);
        });
    };

    async ReconnectSession() {
        this.socket.on('reconnect-session', async (_data) => {
            console.log('reconnect-session !', _data);
            if (!_data.error) {
                Model.SetReconnectData(_data.data);
                Constant.game.events.emit("evtReconnect");
            } else {
                Constant.game.events.emit("evtShowAlert", _data.message);
            }
        });
    };






    //#endregion

    //##################################################################################

};

let client = new Client();

export { client as Client };