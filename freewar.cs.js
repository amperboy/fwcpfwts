var init = function() {
	var plugin = new FWCPFWTS();

	var host = document.location.host;

	if (host.indexOf("freewar.de") > -1) {
		var modificator = plugin.freewar();
		modificator.doStuff();
	}
};


$(document).ready(init);





