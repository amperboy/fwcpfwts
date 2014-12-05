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
	
	chrome.runtime.sendMessage({"method":"printAbilities"});
	
	if(path == "/freewar/internal/ability.php") {
		this.ability();
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