
class Model {
	constructor() {
		this.userToken = null;
	};
	//#############################################################################################

	GetUserToken() {
		return this.userToken;
	};
	SetUserToken(_token) {
		this.userToken = _token;
	};

};

let gameModel = new Model();

export { gameModel as Model };