function FWCPFWTS() {
}

FWCPFWTS.prototype.freewar = function() {
		var modificator = new FreewarParser();
		
		return modificator;
}
	
FWCPFWTS.prototype.toolset = function() {}

///////////////////////////////////////////////////

function Toolset() {}
Toolset.prototype.NIEDERLAGE = -1;
Toolset.prototype.SIEG = 1;

Toolset.prototype.styleResult = function(result, calcMsg) {
	var msg = null;
	var color = null;
	
	if(result == this.SIEG) {
		msg = "SIEG";
		color = "09E309";
	}
	else {
		msg = "NIEDERLAGE";
		color = "FC0000";
	}

	return {
		"msg": calcMsg
		, "result": result
		, "resultObj": " <span style=\"color: #"+color+"\" title=\""+calcMsg+"\">"+msg+"</span>"
	}
}

Toolset.prototype.fight = function(angreifer,verteidiger,resitenz) {
	if ( angreifer == null || verteidiger == null ) {
		return 0;
	}
	
	var a_H = angreifer.health.current;
	var a_A = 0; 		
	var a_D = 0; 
		
	if (resitenz == 0) {
		a_A += angreifer.offence.player;
		a_D += angreifer.defence.player;
	}
		
	a_A += angreifer.offence.weapon;
	a_D += angreifer.defence.weapon;
		
	var v_H = verteidiger.health.current;
	var v_A = verteidiger.offence.player + verteidiger.offence.weapon;
	var v_D = verteidiger.defence.player + verteidiger.defence.weapon;

		// Kampf berechnen
		var nFv = (v_A-a_D)>=1 ? (v_A-a_D) : 1;
		var Fv = a_H / (nFv);

		var nFa = (a_A-v_D)>=1 ? (a_A-v_D) : 1;
		var Fa = v_H / (nFa);
				
		var calsMsg = Fa+":"+Fv;		
		
		

		if(Fa<=Fv) {
			if(resitenz==2 && Fa>=1) {
				// Superresistente NPCs heilen sich nach jedem Schlag vollstÃ¤ndig
				return this.styleResult(this.NIEDERLAGE,calsMsg);
			}
			return this.styleResult(this.SIEG,calsMsg);	
		}
		else if(Fa>Fv){
			return this.styleResult(this.NIEDERLAGE,calsMsg);	
		}

}


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
		case "/freewar/internal/fight.php":
			this.main();
			break;
	}

}

FreewarParser.prototype.item = function() {
	var valueCurOfExpression = /([.0-9]+)([ ]*\/[ ]*)([.0-9]+)/;
	var numberExpression = /([.0-9]+)/;
	
	
	var userData = {
		"name": null
		, "xp": null
		, "money": null
		, "intelligence": null
		, "health": null
		, "offence": null			
		, "defence": null
	};
	
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
			
			if(xp.indexOf(" von ") > -1) {
				var parts = xp.split(" von ");
				xp = parts[0]*1;
			}
			
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
	var siteParser = this;

	this.receiveFromBackground("userData",function(value) {
		if(value != null) {				
			var health = value.health.current;
			var offence = value.offence.player + value.offence.weapon;
			var defence = value.defence.player + value.defence.weapon;
			$("p.personlistcaption:first").each(function(i,obj) {
				obj.innerHTML += " (L: "+health+", A: "+offence+", V: "+defence+")";
			});
			
			$("p.listusersrow").each(function(i,playerP) {
				var inTable = false;
				
				$(playerP).find("table:first tr td:last").each(function(k,playerCell) {
					inTable = true;
					siteParser.playerCheck(value, playerCell);
				});
				
				if(inTable == false) {
					siteParser.playerCheck(value, playerP);				
				}
			});
		}
	});
}

FreewarParser.prototype.playerCheck = function(userdata, playerCell) {
	var valueCurOfExpression = /([.0-9]+)([ ]*\/[ ]*)([.0-9]+)/;
	
	var toolsetHelper = new Toolset();
	
	if($(playerCell).text().indexOf("NPC") > -1) {
		var npc = {
			"name": null
			, "npcTye": null
			, "health": null
			, "offence": {"player": null, "weapon": null}
			, "defence": {"player": 0, "weapon": 0}
		};
		
		$(playerCell).find("b:first").each(function(i,obj) {
			npc.name = $(obj).text().trim();
		});
		
		////////////////
		// TEXT Nodes //
		////////////////
		this.getTextNodesIn(playerCell).each(function(i, textnode) {	
			var textOfTextnode = $(textnode).text();
			
			//NPC Type and Health
			if(textOfTextnode.indexOf("NPC") > -1) {
				var headA = textOfTextnode.split(" LP: ");
				var npcTye = headA[0];
				npc.npcTye = npcTye;						
				
				if(npcTye.indexOf("Resistenz") > -1) {
					npc.resistant = 1;
				}
				if(npcTye.indexOf("Superresistenz") > -1) {
					npc.resistant = 2;
				}
				
				if(headA.length > 1) {
					var health = headA[1];
					valueCurOfExpression.exec(health);
					var currentHealth = RegExp.$1;
					var maxHealth = RegExp.$3;
					
					currentHealth = currentHealth.replace("\.","")*1;
					maxHealth = maxHealth.replace("\.","")*1;
					
					npc.health = {"current": currentHealth, "max": maxHealth};
				}
			}
			else if(textOfTextnode.indexOf("Angriffsst") > -1) {
				var parts = textOfTextnode.split(":");
				var offence = parts[parts.length-1];
				offence = offence.substring(0,offence.length-1);
				offence = offence.replace("\.","")*1;
				
				npc.offence = {"player": offence, "weapon": 0};
			}
		});
				
		if(npc.health != null) {
			var fight = toolsetHelper.fight(userdata,npc,0);
			$(playerCell).find("a:last").after(fight.resultObj);
		}
		
	}
}
