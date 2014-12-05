function Storage() {}
Storage.prototype.abilities = null;

var store = new Storage();

///////////////////////////////////////////////////////////////////////////////////

function setAbilities(abilities) {
	store.abilities = abilities;
	console.log("setAbilities="+store.abilities);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "setAbilities") { 
		setAbilities(request.abilities);
	}
	
	if (request.method == "printAbilities") { 
		console.log("printAbilities="+store.abilities);
	}
});