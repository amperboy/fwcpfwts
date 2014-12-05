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

FreewarParser.prototype.getTextNodesIn = function(el) {
    return $(el).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    });
};


FreewarParser.prototype.storeInBackground = function(keyName, value) {
	var host = window.location.host;
	chrome.runtime.sendMessage({
		"method" : "storeInBackground"
		, "host" : host
		, "key" : keyName
		, "value" : value
	});
};


FreewarParser.prototype.receiveFromBackground = function(keyName,responseFunction) {
	var host = window.location.host;
	chrome.runtime.sendMessage({
		"method" : "receiveFromBackground"
		, "host" : host
		, "key" : keyName
	}, responseFunction);	
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
		case "/freewar/internal/main.php":
			this.main();
			break;
	}

}

FreewarParser.prototype.item = function() {
	var valueCurOfExpression = /([.0-9]+)([ ]*\/[ ]*)([.0-9]+)/;
	var numberExpression = /([.0-9]+)/;
	
	
	var userData = {};
	
	var healthP = $("#listrow_lifep"); //Lebenspunkte
	if (healthP.text().indexOf("Lebenspunkte") < 0) {
		return;
	}
	else {
		valueCurOfExpression.exec(healthP.text());
		var health = {"current": RegExp.$1*1, "max": RegExp.$3*1};
		userData.health = health;
	}	
	
	$("p:first").each(function(i,obj) {
		var title = $(obj).text();
		if(title.indexOf("Erfahrung") > -1) {
			var titleData = title.split(" (Erfahrung: ");
			var name = titleData[0];
			var xp = titleData[1].substring(0,titleData[1].length-1);
			
			userData.name = name;
			userData.xp = xp;
		}
	});
	
	var offenceP = $("#listrow_attackp"); //Angriffsdaten	
	if(offenceP.text().indexOf("Angriffsst") > -1) {
		var offencePlayer = $.trim(this.getTextNodesIn(offenceP).get(0).nodeValue)*1;
		var offenceWeapon = 0;
		
		offenceP.find("span:first").each(function(i,obj) {
			offenceWeapon = $(obj).text()*1;
		});
		
		var offence = {"player": offencePlayer, "weapon": offenceWeapon};
		userData.offence = offence;
	}
	
	var defenceP = $("#listrow_defensep"); //Verteidigungsdaten
	if(defenceP.text().indexOf("Verteidigungsst") > -1) {
		var defencePlayer = $.trim(this.getTextNodesIn(defenceP).get(0).nodeValue)*1;
		var defenceWeapon = 0;
		
		defenceP.find("span:first").each(function(i,obj) {
			defenceWeapon = $(obj).text()*1;
		});
		
		var defence = {"player": defencePlayer, "weapon": defenceWeapon};
		userData.defence = defence;
	}
	
	
	var intSpeeP = $("#listrow_int"); //Intelligenz und Speed
	if(intSpeeP.text().indexOf("Intelligenz") > -1) {
		var intNode = this.getTextNodesIn(intSpeeP).get(0).nodeValue;
		numberExpression.exec(intNode);
	
		var intelligence = RegExp.$1*1;
		var speed = 0;
		
		intSpeeP.find("span:first").each(function(i,obj) {
			speed = $(obj).text()*1;
		});
		
		var int = {"intelligence": intelligence, "speed": speed};
		userData.intelligence = int;
	}	
	
	var phasenPEP = $("#phasetext"); //Phasenenergie
	if(phasenPEP.text().indexOf("Phasenenergie") > -1) {
		valueCurOfExpression.exec(phasenPEP.text());
		var phaseEnergie = {"current": RegExp.$1*1, "max": RegExp.$3*1};
		userData.phaseEnergie = phaseEnergie;
	}
	else {
		userData.phaseEnergie = null;
	}
	
	var moneyP = $("#listrow_money");
	if(moneyP.text().indexOf("Geld") > -1) {
		var moneyNode = this.getTextNodesIn(moneyP).get(0).nodeValue;
		numberExpression.exec(moneyNode);
		var money = RegExp.$1;
		money = money.replace("\.","")*1;
		userData.money = money;
	}	
		
	this.storeInBackground("userData", userData);
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
	
	this.storeInBackground("abilities", abilities);
}


FreewarParser.prototype.main = function() {
	this.receiveFromBackground("userData",function(value) {
		if(value != null) {				
			var health = value.health.current;
			$("p.personlistcaption:first").each(function(i,obj) {
				obj.innerHTML += " - Noch "+health+" Lebenspunkte";
			});
		}
	});
}
