// JavaScript Document
		var playedCards = new Array();
		var history = new Array();
		
		var log = new Object();
		log.remainCards;
		log.currentTrickCards = new Array();
		log.trumps = "";
		log.leader = "";
		log.player = "";
		log.tricksNS = 0;
		log.tricksEW = 0;
		log.trick = 0;
		log.trickCard = 0;
		log.lastSuit = 0;
		log.lastCard = 0;
		
		var playDir = "nesw";
		var cardStr = "23456789TJQKA";
		var suitStr = "SHDC";
		var players = new Array();

var Module = {
	onAbort: function() {
			self.postMessage("failed");
		},
    onRuntimeInitialized: function() {
		players.push("north");
		players.push("east");
		players.push("south");
		players.push("west");
		
		var res = Module.cwrap('handleDDSRequest','string',['string','string','string','string','string','string','string','string','string','string']);
		self.postMessage("initialised");

		self.addEventListener("message",function(event){
				var request = event.data.context.request;
				var msg;

				if (request=="m")
				{
					var dealstr = event.data.dealstr;
					var vulstr = event.data.vulstr;
					var leadstr = event.data.leadstr;
					if (leadstr.length==0) leadstr = null;
					var sockref = "" + event.data.sockref;
					
					var r1=res(dealstr,null,request,null,vulstr,null,leadstr,null,sockref,null);
					msg = new Object();
					r1 = JSON.parse(r1);
					r1.sess.pbn = dealstr;
					r1.sess.leadstr = event.data.leadstr;
					msg.result = JSON.stringify(r1);
					msg.context = event.data.context;
				}
				else if (request=="b")
				{
					var vul = convertVulStr(event.data.vulstr);
					var scores = new Array();
					
					var starttime = Date.now();
					
					for (var i=0;i<4;i++)
					{
						r1=res(event.data.dealstr,event.data.trumps,"g",playDir[i],null,null,null,null,null,null);
						var tmp = JSON.parse(r1);
						scores.push(getBestScore(tmp));
					}
					
					var elapsed = (Date.now()-starttime)/1000;
					
					msg = new Object();
					msg.result = r1;
					var tmp = JSON.parse(msg.result);				
					tmp.sess.trumps = event.data.trumps;
					tmp.sess.scores = scores;
					tmp.vul = vul;

					delete tmp.sess.cards;
					delete tmp.sess.currentTrick;					
					tmp.sess.sockref = event.data.sockref;
					tmp.requesttoken = event.data.requesttoken;
					
					msg.result = JSON.stringify(tmp);
					msg.context = event.data.context;
				}
				else if (request=="a")
				{
					var cards = event.data.cards;
					log.trumps = event.data.trumps;
					log.leader = event.data.leader;
					var dealstr = event.data.pbn;
					var declarer = event.data.declarer;
					var names = event.data.names;
				
					var r1=res(dealstr,log.trumps,request,log.leader,null,cards,null,null,null,null);
					msg = new Object();
					msg.result = r1;
					msg.context = event.data.context;
				}
				else if (request=="q")
				{
					return;	// Nothing to do
				}
				else if (request=="u")
				{
					if (history.length>0)
					{
						log = history.pop();
						msg = log.msg;
					}
					else
					{
						var r1 = new Object();
						r1.sess = new Object()
						r1.sess.status = 207;
						r1.sess.sockref = event.data.sockref;
						var msg = new Object();
						msg.result = JSON.stringify(r1);
						var context = new Object();
						context.request = "u";
						msg.context = context;
					}
					
					self.postMessage(msg);
				}
				else
				{
					var dealstr;
					var r1;
					
					if (request=="g")
					{
						history = new Array();
						log = new Object();
						log.trumps = event.data.trumps.toUpperCase();
						log.leader = event.data.leader;
						dealstr = event.data.pbn;
						log.remainCards = dealstr;
						log.currentTrickCards = new Array();
						log.tricksNS = 0;
						log.tricksEW = 0;
						log.trick = 0;
						log.trickCard = 0;
					}
					else
					{
						history.push(log);
						log = JSON.parse(JSON.stringify(history[history.length-1]));
						
						request = request.toUpperCase();
						log.lastSuit = suitStr.indexOf(request[0]);
						log.lastCard = cardStr.indexOf(request[1]);
						dealstr = log.remainCards;
						log.currentTrickCards.push(request);
						log.trickCard++;
						
						var str = "";
						
						for (var i=0;i<log.currentTrickCards.length;i++)
							str += log.currentTrickCards[i];
							
						request = str;
						
						if (log.currentTrickCards.length==4)	// Trick played. Work out who won it
						{
							evaluateTrick();
								// Call DDummy just to remove this card from the pbn
							r1=res(dealstr,log.trumps,request,log.leader,null,null,null,null,null,null);
							r1 = JSON.parse(r1);
							dealstr = r1.sess.pbn;
							log.remainCards = r1.sess.pbn;
							log.currentTrickCards = new Array();
							log.trickCard = 0;
							request = "g";
						}
					}
				
					r1=res(dealstr,log.trumps,request,log.leader,null,null,null,null,null,null);
					msg = new Object();
					msg.result = r1;
					var tmp = JSON.parse(msg.result);
					
					tmp.sess.trumps = log.trumps;
					tmp.sess.leader = log.leader;
					
					if (tmp.sess.status!=-2)
					{
						var nxtplayer = playDir.indexOf(log.leader) + tmp.sess.currentTrick.length;
						if (nxtplayer>3) nxtplayer = nxtplayer - 4;
						tmp.sess.player = players[nxtplayer];
						tmp.sess.remaining = convertPBN(tmp.sess.pbn);
						log.remainCards = tmp.sess.pbn;
						tmp.sess.status = 0;
					}
					else
					{
						tmp.sess.status = 208;
						tmp.sess.errno = 0;
						tmp.sess.remaining = convertPBN(log.remainCards);
						var cards = new Array();
						tmp.sess.cards = cards;
						tmp.sess.currentTrick = log.currentTrickCards;
						tmp.sess.sockref = event.data.sockref;
					}
					
					tmp.sess.tricksNS = log.tricksNS;
					tmp.sess.tricksEW = log.tricksEW;
					tmp.sess.trick = log.trick;
					tmp.sess.trickCard = log.trickCard;
					tmp.sess.lastSuit = log.lastSuit;
					tmp.sess.lastCard = log.lastCard;
					
					tmp.sess.sockref = event.data.sockref;
					tmp.requesttoken = event.data.requesttoken;
					
					msg.result = JSON.stringify(tmp);
					msg.context = event.data.context;
					log.msg = msg;
				}
				
				self.postMessage(msg);
		});
    }
 };
  
importScripts("dds.js");

function convertVulStr(vulstr)
{
	var vul = ["None","All","NS","EW"];
	
	vulstr = vulstr.toUpperCase();
	
	for (var i=0;i<vul.length;i++)
	{
		if (vul[i].toUpperCase()==vulstr)
			return i;
	}
	
	return -1;
}

function getBestScore(msg)
{
	var score = 0;
	
	for (var i=0;i<msg.sess.cards.length;i++)
	{
		var sobj = msg.sess.cards[i];
		
		if (sobj.score>score)
			score = sobj.score;
	}
	
	return 13 - score;	// Number of tricks makeable by declarer for this suit with this leader
}

function convertPBN(pbn)
{
	var cardStr = "23456789TJQKA";
	var res = new Array();
	
	pbn = pbn.substring(2);	// Eliminate W:
	pbn = pbn.split(" ");	// Gives an array of the four hands, West first
	
	for (var i=0;i<4;i++)	// For each hand
	{
		var j=i+1;	// Start with North hand first
		if (j>3) j=0;
		
		var suits = new Array();
		var hand = pbn[j];
		hand = hand.split(".");	// Split into suits
		
		for (var k=0;k<4;k++)
		{
			var values = new Array();
			var str = hand[k];
			
			for (m=0;m<str.length;m++)
			{
				values.push(cardStr.indexOf(str.charAt(m)));
			}
			
			suits.push(values);
		}
		
		res.push(suits);
	}
	
	return res;
}

function evaluateTrick()
{
		// Which direction won trick, and is on lead for the next trick ?
	var suitStr = "SHDC";
	var cardStr = "23456789TJQKA";
	var trumpSuit = suitStr.indexOf(log.trumps.toUpperCase());
	var dir = 0;
	
	var tricksuit;
	var lastTrump = -1;
	var maxFace = -1;
	
	for (var i=0;i<4;i++)
	{
		var suit = suitStr.indexOf(log.currentTrickCards[i].charAt(0));
		var face = cardStr.indexOf(log.currentTrickCards[i].charAt(1));
		
		if (i==0)
		{
			trickSuit = suit;
			trickFace = face;
			maxFace = face;
			
			if (suit==trumpSuit) lastTrump = face;
		}
		else
		{
			if (lastTrump==-1)	// Trump not played yet
			{
				if (suit==trumpSuit)
				{
					lastTrump = face;
					dir = i;
				}
				else
				{
					if ((face>maxFace)&(suit==trickSuit))
					{
						maxFace = face;
						dir = i;
					}
				}
			}
			else	// A trump has been played, so can only win trick by overruff
			{
				if ((suit==trumpSuit)&(face>lastTrump))
				{
					lastTrump = face;
					dir = i;
				}
			}
		}
	}
	
	var curlead = playDir.indexOf(log.leader);
	
	curlead = curlead + dir;
	if (curlead>3) curlead = curlead - 4;
	
	log.leader = playDir.charAt(curlead);
	log.player = playDir.charAt(curlead);
	
	if ((log.leader=="n")|(log.leader=="s"))
		log.tricksNS++;
	else
		log.tricksEW++;
		
	log.trick++;
}
