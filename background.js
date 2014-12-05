function Storage() {}

var bgStorage = {};

///////////////////////////////////////////////////////////////////////////////////


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if (request.method == "storeInBackground") { 
		if(bgStorage[request.host]==null) {
			bgStorage[request.host] = {};
		}
		bgStorage[request.host][request.key] = request.value;
	}
	else if (request.method == "receiveFromBackground") {
		var value = null;
		if(bgStorage[request.host] != null) {
			value = bgStorage[request.host][request.key];
		}
		sendResponse(value);
	}
});