function FWCPFWTS() {
}

FWCPFWTS.prototype.freewar = function() {
		var modificator = new FreewarParser();
		
		return modificator;
}
	
FWCPFWTS.prototype.toolset = function() {}



///////////////////////////////////////////////////

function FreewarParser() {
}

FreewarParser.prototype.doStuff = function() {
	var path = document.location.pathname;
	var search = window.location.search;

	switch(path) {
		case "/freewar/internal/ability.php":
			if(search=="") {
				this.ability();
				break;
			}
		case "/freewar/internal/item.php":
			this.item();
			break;
	}

}

FreewarParser.prototype.item = function() {
	console.log("item frame loaded");
	
	var valueCurOfExpression = /(\d+)\/(\d+)/;
	
	var healthC = $("#listrow_lifep").text(); //Lebenspunkte
	var intSpeeP = $("#listrow_int"); //Intelligenz und Speed
	var offenceP = $("#listrow_attackp"); //Angriffsdaten
	var defenceP = $("#listrow_defensep"); //Verteidigungsdaten
	var phasenPEP = $("#phasetext"); //Phasenenergie

	if(healthC.indexOf("Lebenspunkte") > -1) {
		valueCurOfExpression.exec(healthC);
		var health = {"current": RegExp.$1, "max": RegExp.$2};
		console.log(health);
	}

}

FreewarParser.prototype.ability = function() {
	var abilities = new Array();
	
	$(".abilitymenu").each(function(i,table) {
		$(table).find("tr").each(function(k,row) {
			if(k==0) return;
			
			var cells = $(row).find("td");
			
			var abilityName = $(cells[0]).find("a").html();
			var curLevel = 0;
			var maxLevel = 0;
			
			if(cells.length==2) {
				maxLevel = $(cells[1]).find("b").html();
				curLevel = maxLevel;
			}
			if(cells.length==3) {				
				curLevel = $(cells[1]).find("b").html();				
				maxLevel = $(cells[2]).find("b").html();
			}
			
			var ability = {"id": k, "name": abilityName, "curLevel": curLevel, "maxLevel": maxLevel};
			abilities.push(ability);
		});
	});
	
	chrome.runtime.sendMessage({"method":"setAbilities", "abilities": abilities});
}