/**********************************************************************************
   -- Copyright (C) 2014-2025 by John Goacher - All Rights Reserved
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/.
***********************************************************************************/

var g_logging = false;
var g_credits =	"";
var g_resultsFilename;
var g_handRecordsFilename;
var g_hands;
var g_scoring = 0;	// Set to "IMP" for IMPs scoring.
var g_lastBindex = 0;
var g_currentDir;
var g_currentPair;
var g_inactiveCards;
var g_playableCards;
var g_currentPlayer;
var g_currentTrickCards;
var g_currentPlayIndex;	//0..51 represents index to position within the 52 card sequence being played.
var g_lastMatchedPlayIndex; //0..51
var g_showPlay=0;			//S If showPlay!=0 show played cards for this hand
var g_hiscore;
var g_allBoards = 0;	// Set non-zero while running an analysis on all boards in a set.
var g_session = 0;
var g_bgTrans = 0;		// Unique transaction id allocated to background transaction (e.g single shot accuracy request)
var g_edited = 0;   // Set to 1 when a change has been made (or 2, if only the Dealer has been changed)
var g_partialHand = 0;	// Non-zero if playing a hand which started with fewer than 52 cards
var g_partialHandTotalTricks;	// Total number of tricks which can be made by declarer and defenders on a partial hand
var g_session_contract;
var g_showOriginalContract = false;	// Set true when "Play: <contract>" button is pressed for a hand recorded in a lin file.
var g_session_declarer;
var g_defaultTravellerWidth;
var g_lastAllTravellersPair=-1;
var g_lastAllTravellersDir="NS";
var g_mode = 0;	// Set to 1 while in play mode
var g_timeout = "";
var g_sectionHeight; // Calculated height for a quadrant of the board display
	// Following variable relate to hand entry.
var g_boardNumberFontSize;
var g_fontRatio = 1.0;
var g_textBratio = 0.9;	// Text font size as fraction of button height
var g_handEntryMode = 0;
var g_inputDir = 0;	// 0,1,2,3 = N,E,S,W
var g_inputBoard;
var g_cardQuadrant;
var g_stopPropagation = 0;
var g_helpId = "";	// id of current help text on display
var g_playButtonText = "Play"; // Text to show on Play button (otherwise may show, for example, Play: 3H by S)
var g_defaultContract = 0;     // Set to 1 when there is a default contract for current board (contract and declarer but no
							   //  bidding information or cards played)
var g_defaultContractIndex = -1;  // If default contract is set, this is the index to the button in the makeable contracts table
								  // that relates to that declarer/suit combination.
var g_timeoutID = "";		// ID of javascript timeout function related to request throttling.
var g_travellers = null;	// Non-null if traveller records are available
var g_currentTraveller = null; // Traveller record corresponding to current board
var g_currow = -1;			   // Index to current row being displayed (for travellers containing bidding/play data for each row
var g_title = "&nbsp";
var g_sessInfo = null;		// Holds Session Info for the current event
var g_rankInfo = null;		// Holds ranking information for current event.
var g_validPercentageFields = false;	// Set to true if percentage fields in json ranking table are non-blank and no negative values
var g_scoring = "MatchPoints";	// Scoring type - MatchPoints, IMP, VP
var g_eventType = "Pairs";		// Event Type - one of Pairs, Teams
var g_maxImps = 0;			// Maximum number of IMPs recorded on a single board, if using IMP scoring.
var g_test = 0;				// Set to 1 if called from test environment.
var g_xml = "";			// Set to filename of xml file if present (or to 1 if xml supplied as a string)
var g_xmlstr = "";			// Holds xml when supplied as a string parameter
var g_handstr = "";			// Holds file content when supplied as a string parameter rather than a file url
var g_handstrType = "";		// Can be "pbn", "dlm", or "lin" if file content supplied as string
var g_debug = false;
var g_ofs = 1;				// Offset to columns beyond (optional) lead card column in Scorecard table
var g_protocol = "http:";	// called with http or https
var g_loaded = false;		// Is true if hands/travellers have been loaded already
var g_fullInfo = false;		// Set to true if makeable contract tables contain full information
var g_backgroundFetchCompleted = false;		// Set to true if background fetch of makeable contracts/opt contracts/opening leads has completed.
var g_openingLeadsPresent = false;	// Set to true when ddtricks for opening leads have been calculated and applied.
var g_travellersHaveLeads = false;  // Set to true if at least one lead card is found in a traveller.
var g_file = "";			// contains url of 'pbn' or 'dlm' if filename reference was supplied in request
var g_sessionMode = "scorecard"; // assume last looked at scorecard in results analysis
var g_playItAgain = true;		 // False if in Results Analysis screens
var g_scoreToImps = [[0,10,0],[20,40,1],[50,80,2],[90,120,3],[130,160,4],
					[170,210,5],[220,260,6],[270,310,7],[320,360,8],[370,420,9],
					[430,490,10],[500,590,11],[600,740,12],[750,890,13],[900,1090,14],
					[1100,1290,15],[1300,1490,16],[1500,1740,17],[1750,1990,18],[2000,2240,19],
					[2250,2490,20],[2500,2990,21],[3000,3490,22],[3500,3990,23],[4000,32767,24]];
var g_checkContracts = new Array();
var g_scorecardContext = new Array();	// Array of context objects for current scorecard, indexed by board number
var g_uniquePairNumbers = "";		// Set to true or false for Teams events from within function checkForUniquePairNumbers
var g_showAllControls = true;
var g_isMobi = false;	// True if a mobile device
var g_namSize = 0;
var g_bidFontSize = 0;
var g_dealerFontSize = 0;	// Size of dealer char on traveller
var g_urqButtonHeight = 0;	// Height of buttons in upper right quadrant of traveller
var g_urqButtFontSize = 0;	// Font size of buttons in upper right quadrant
var g_scoreFontSize = 0;	// Font size for score in lin file
var g_vulBarLength = 0;		// Height or width of vulnerability bar

var g_worker;	// Worker for Play It Again
var g_mworkers = new Array();	// Workers for makeable contract calculation
var g_nextmworker = 0;
var g_workerInitCount = 0;
var g_db = null;	// Database handle for indexedDB

var g_bgObj = new Object();
var g_completionCount = 0;		// Count of background accuracy requests completed
var g_completionTarget = 0;		// Used for background player accuracy requests

var g_mcSession = 1;	// "Session" number for tagging single board makeable contract requests

var g_trumps = "";	// Trump suit for current board being played
var g_leader = "";	// Leader for current board being played
var g_initial_data = "";
var g_initial_options = "";
var g_newFeatureNoticeShown = 0;	// Set to 1 if has been shown already during this session
var g_initialised = false;			// Set true in buildpage1
var g_playerAcc = new Array();		// Holds player accuracy counts for event, indexed by player name
var g_accTrans = new Object();		// Holds list of acc transactions outstanding for each player

var cacheTimeout = 300000;	// Limit in milliseconds on how long PBN and json are kept in Local Storage

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function getPosition(element) {
		// Find location of an element (for display of popup messages at cursor location)
    var xPosition = 0;
    var yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
	
	xPosition += document.body.scrollLeft;
	yPosition += document.body.scrollTop;
	
    return { x: xPosition, y: yPosition };
}

function displayErrorAbsPosition(message,x,y)
{
	var popup = document.getElementById("popup_box");
	popup.style.top = y + "px";
	popup.style.left = x  + "px";
	popup.innerHTML = message;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(2000).fadeOut(100);
}

function displayError(element,message)
{
	var popup = document.getElementById("popup_box");
	popup.style.top = ((getPosition(element).y) - 20) + "px";
	popup.style.left = getPosition(element).x  + "px";
	popup.innerHTML = message;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(2000).fadeOut(100);
}

function setRequestTimeout(override=false)
{
	if ((g_timeoutID=="")&(override))	// Only put timeout if requests are being made to remote server, or we are in a card play sequence
		g_timeoutID = setTimeout(function(){g_timeoutID = "";}, 10000);
}

function showPopupStatic(element,content)
{
	var popup = document.getElementById("popup_box");
	popup.style.top = ((getPosition(element).y) - 20) + "px";
	popup.style.left = getPosition(element).x  + "px";
	popup.innerHTML = content;
	$("#popup_box").finish();
	$("#popup_box").show();
}

function setupPlayMatchContractHelp()
{
	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\><span style=\"font-size:16px;\">";
	help = help + "A yellow highlighted bid in the bidding box indicates an associated alert. Hover the cursor over the highlighted bid, ";
	help = help + "or click on it, in order to see the explanation.<BR><BR>";
	help = help + "Tap the play button located below the bidding table to see how the bid contract was played.<BR><BR>";
	help = help + "All playable cards at the current position are highlighted together with the total number of makeable tricks (assuming optimum play from this point onwards). The card that was actually played at each position is denoted with an * prefix.<BR><BR>";
	help = help + "At each point in the play you may choose to play the prefixed card, in order to follow how the contract was played. The button at the bottom of the display marked '>' provides a quick way of stepping through the played sequence.";
	help = help + " However, if the card played was non-optimal, you might choose to play a different card in order to investigate an alternate line of play.<BR><BR>";
	help = help + "Once you have deviated from the recorded line of play, no subsequent card will be prefixed with an *. You can use the button at the bottom of the display marked '<' to step back until you rejoin the original played sequence.<BR><BR>";
	help = help + "The 'Acc' button (Accuracy of Play) provides information on the extent to which the actual line of play differs from an optimal double dummy line of play. "
	help = help + "For each player it shows the number of cards played that were sub-optimal.<BR><BR>";
	
	if (showTravellerRowButtons())
	{
		help = help + "The '<' and '>' buttons in the top right panel of the board display enable you to step backwards and forwards through ";
		help = help + "the traveller rows to see how the same board was bid and played at other tables<BR><BR>";
	}
	
	help = help + "</span></DIV>";
	help = help + "<BUTTON id=hide_playMatchContractHelp style=\"cursor:pointer;\">CLOSE</BUTTON>";
	
	document.getElementById("playMatchContractHelp").innerHTML = help;
}

function setupEditHelp()
{
	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";
	help = help + "Cards not yet assigned to any quadrant are shown in green. ";
	help = help + "Click on a green card to assign it to the current quadrant.<BR><BR>";
	help = help + "Cards assigned to the hand in the current quadrant are shown with a check mark. ";
	help = help + "Click on a checked card to de-assign it. ";
	help = help + "The 'Clear' button de-assigns all cards from all quadrants.<BR><BR>";

	if ((g_test==1)|(g_xml!=""))
		help = help + "Use the 'Change Vulnerability' button to change the board vulnerability. ";
	else
		help = help + "Use the 'Change Vulnerability' and 'Change Dealer' buttons to change the board vulnerability and dealer. ";

	help = help + "Makeable contracts and optimum contracts/scores can be calculated by clicking the 'Analyse' button after exiting edit mode, ";
	help = help + "providing that all 52 cards have been assigned (changing the vulnerability can affect the optimum contract/score).<BR><BR>";
    help = help + "The 'New...' button adds a new empty board to the current set of boards.";
    help = help + "Any changes made to the board currently being edited are retained.<BR><BR>";
    help = help + "The 'Delete' button deletes the board currently being edited. If there is only a single board then it cannot be deleted.<BR><BR>";
    help = help + "The 'Prev', 'Next', and 'GoTo' buttons facilitate navigation between boards without leaving edit mode. ";
    help = help + "Any changes made to the board currently being edited are retained.<BR><BR>";
	help = help + "Exit from edit mode by clicking the 'Done' button, or play the hand by clicking a '-' entry in the makeable contracts table.<BR><BR>";
	help = help + "Hands can be played starting with less than 52 cards providing each quadrant contains the same number of cards.<BR><BR>";
	help = help + "</span></DIV>";
	help = help + "<BUTTON id=hide_editHelp style=\"cursor:pointer;\">CLOSE</BUTTON>";
	
	document.getElementById("editHelp").innerHTML = help;
}

function setupPlayHelp()
{
	var help = "<div style=\"float:left;word-wrap:break-word;\"><span style=\"font-size:16px;\">";
	help = help + "Click on a green or yellow card to play the card.<BR><BR>";
	help = help + "A card value preceded by a blue asterisk indicates the lead card that was actually played by the defender on lead in the selected contract.<BR><BR>";
	help = help + "The subscript on the green and yellow cards shows the number of tricks that will be made, by declarer or the defenders, if this card is played and ";
	help = help + "all subsequent cards played by declarer and the defenders are green cards. <BR><BR>";
	help = help + "Cards highlighted in blue are cards already played as part of the current trick.<BR><BR>";
	help = help + "Cards which are greyed out have been played as part of a previous trick.<BR><BR>";
	help = help + "The button marked with a '<' can be used to unplay one or more cards.<BR><BR>";
	help = help + "Click on 'Stop' to leave play mode.<BR><BR>";
	help = help + "</span></DIV>";
	help = help + "<BUTTON id=hide_playHelp style=\"cursor:pointer;\">CLOSE</BUTTON>";
	
	document.getElementById("playHelp").innerHTML = help;
}

function setupCommandHelp()
{
	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";
	help = help + "Press the 'Analyse' button to calculate makeable contracts and optimum contracts/scores for the displayed board.<BR><BR>";
	help = help + "Press the 'Edit' button to edit the current board, change dealer or vulnerability, or to add/delete boards.<BR><BR>"
	help = help + "Start playing a contract interactively by clicking on an entry in the makeable contracts table (including entries shown as '-' or '*')<BR><BR>";
	help = help + "A button highlighted bright yellow in the makeable contracts table designates the suit/declarer combination actually played ";
	help = help + "in a club game or tournament.<BR><BR>";

	if ((g_test==1)|(g_xml!=""))
	{
		help = help + "Press the 'Edit' button to edit the current board, or to change the dealer or vulnerability.<BR><BR>"
		help = help + "The 'Goto...' button allows any board to be selected from the set of boards for the current event.<BR><BR>";
		help = help + "The '<' and '>' buttons step backwards or forwards through the set of boards.<BR><BR>";
		help = help + "The 'Results Analysis' mode enables you to analyse your performance and card play against double dummy and against other pairs. Click <a href=\"bsolhelp.htm\" target=_blank class=myLink>here</a> for more information<BR><BR>";  
	}
	else
	{
		help = help + "Press the 'Edit' button to edit the current board, change dealer or vulnerability, or to add/delete boards.<BR><BR>"
		help = help + "The 'Goto...' button, if present, allows any board to be selected from the set of boards.<BR><BR>";
		help = help + "The '<' and '>' buttons, if present, step backwards or forwards through the set of boards.<BR><BR>";
		help = help + "The 'Save' button saves the set of boards as a PBN file.<BR><BR>";
		
		if ((typeof g_hands.lin)!="undefined")
			help = help + "The 'Save As LIN' button saves the current board as a LIN format file, including player names, auction and play data.<BR><BR>";
	}
	
	help += "'More../Analyse All Boards' calculates makeable contracts/optimum contracts for all boards in the current board set<BR><BR>"; 
	help += "'More../Show Player Accuracy Matrix' calculates and displays the number of deviations from optimal double dummy play for all players for all boards in the current board set. ";
	help += "This function is only available if the boards contain a record of the cards played (usually only available for events played online).<BR><BR>"; 
	
	help = help + "</span></DIV>";
	help = help + "<DIV style=\"clear:both;\"><BUTTON id=hide_commandHelp style=\"cursor:pointer;\">CLOSE</BUTTON></div>";
	
	document.getElementById("commandHelp").innerHTML = help;
}

function setupSettingsHelp()
{
	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";

	help = help + "The <b>'Auto-Analyse Entire Board Set'</b> setting determines whether Bridge Solver will start calculating makeable contracts and ";
	help = help + "optimum contracts/scores for all boards when Bridge Solver is invoked. This takes place in the background and ";
	help = help + "does not prevent hands being played while the calculation is in progress.<BR><BR>";

	help = help + "</span></DIV>";
	help = help + "<DIV style=\"clear:both;\"><BUTTON id=hide_settingsHelp style=\"cursor:pointer;\">CLOSE</BUTTON></div>";
	
	document.getElementById("settingsHelp").innerHTML = help;
}

function setupKRHelp()
{
	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\><span style=\"font-size:16px;\">";
	help = "When the KR checkbox is ticked, the results of a Kaplan Rubens hand evaluation are displayed, followed by high card points in brackets.<BR><BR>";
	help += "KR is one of a number of algorithms which attempt to emulate an expert's evaluation of the strength of a hand, taking into account features ";
	help += "such as the hand distribution and location of the honour cards, rather than simply adding up high card points. ";
	help += "It is of course an evaluation in isolation which does not take into account the fit, or lack thereof, with partner&#39;s hand<BR><BR>";
	help += "There are a number of slightly different variants of the KR algorithm but the version used by Bridge Solver Online matches ";
	help += "the <a href='http://www.rpbridge.net/8j19.htm' target='_blank'> one described on Richard Pavlicek&#39;s website</a>, which details all the steps ";
	help += "used in the calculation.<BR><BR>";
	help += "RP's own version of the calculator can be found <a href='http://www.rpbridge.net/cgi-bin/xhe1.pl' target='_blank'>here</a>."
	help = help + "</span></DIV>";
	help = help + "<BR><BR><BUTTON id=hide_krHelpText style=\"cursor:pointer;\">CLOSE</BUTTON>";
	
	document.getElementById("krHelpText").innerHTML = help;
}

function redrawMCTable(large)
{
	var i,j,value;
	var labels = "NSEW";
	var contracts;
	
	if (large)
		contracts = document.getElementById("makeableContracts");
	else
		contracts = document.getElementById("miniMakeableContracts");
		
	var rows = contracts.rows;
	var buttonHeight = (g_sectionHeight/5);
	var buttonTextHeight = ((buttonHeight*4.5)/7) + "px";
	
	if (!large)
		buttonTextHeight = ((buttonHeight*4)/12) + "px";
	
	var symbolHeight = "12px";
	
	if (!large) symbolHeight = "8px";

	var cardSymbols = ["<img height=" + symbolHeight + " src=\"pics/spade.gif\">","<img height=" + symbolHeight + " src=\"pics/heart.gif\">","<img height=" + symbolHeight + " src=\"pics/diamond.gif\">","<img height=" + symbolHeight + " src=\"pics/club.gif\">"];
	var cells = rows[0].cells;
	
	cells[0].innerHTML = "";
	cells[5].innerHTML = "<span style=\"font-size:" + symbolHeight + ";\">NT</span>";
	cells[4].innerHTML = cardSymbols[0];
	cells[3].innerHTML = cardSymbols[1];
	cells[2].innerHTML = cardSymbols[2];
	cells[1].innerHTML = cardSymbols[3];
	
	var cvector = g_hands.boards[g_lastBindex].DoubleDummyTricks;
	contracts.setAttribute("data-contracts",cvector);
	
	var showContracts = document.getElementById("mkrad1").checked;
	
	var suits = "NSHDC";
	var directions = "NSEW";
	var defSuit;
	var defDeclarer;
	
	if (g_defaultContract!=0)
	{
		defDeclarer = directions.indexOf(g_hands.boards[g_lastBindex].Declarer);
		defSuit = suits.indexOf(g_hands.boards[g_lastBindex].Contract.charAt(1));
	}
	
	for (i=0;i<4;i++)
	{
		rows[1+i].cells[0].innerHTML = "<span style=\"font-size:" + buttonTextHeight + ";\">" + labels.charAt(i) + "</span>";
		
		for (j=0;j<5;j++)
		{
			value = "*";
			
			if ((cvector.charAt(j+5*i)!="*")&(cvector.charAt(j+5*i)!="-"))
			{
				value = parseInt(cvector.charAt(j+5*i),16);
				
				if (showContracts)
				{
					if (value<7)
						value = "-";
					else 
						value = value - 6;
				}
			}
			else if ((!showContracts)&(cvector.charAt(j+5*i)=="-"))
				value = "*";
			else
				value = cvector.charAt(j+5*i);
			
			var bcolor = "";
			
			if ((g_defaultContract!=0)&(i==defDeclarer)&(j==defSuit))
				bcolor = "background-color:#FFFF00;";
			
			if (large)
				rows[1+i].cells[1+4-j].innerHTML = "<BUTTON class=menuButton style=\"min-width:0px;width:42px;max-width:42px;max-height:" + buttonHeight + "px;" + bcolor + "\">" + "<span style=\"font-style:normal;font-size:" + buttonTextHeight + ";\">" + value + "</span></BUTTON>";
			else
				rows[1+i].cells[1+4-j].innerHTML = "<span style=\"font-size:10px;" + bcolor + "\">" + value + "</span>";

		}
	}		
}

function hideAllPopups()
{
	$("#popup_box").hide();
	$("#optionsBox").hide();
	$("#progressDiv").hide();
	hideHelp();
	$("#toolsSubMenu").hide();
	$("#settings").hide();
}

function showSettings()
{
	hideAllPopups();
	document.getElementById("settingsHide").onclick = hideAllPopups;
	document.getElementById("showSettingsHelp").onclick = function (){showHelp(this,'settingsHelp')};
	$("#settings").show();
}

function showOptions(pthis)
{
		// Respond to the HELP button
	var popup = document.getElementById("optionsBox");
	popup.style.top = 20 + "px";
	popup.style.left = 100  + "px";
	document.getElementById("optionsClose").onclick = function()
		{
			$("#optionsBox").hide();
		}
		
	document.getElementById("optionsSave").onclick = function()
		{
			var ns1 = document.getElementById("nsrad1").checked;
			var ns2 = document.getElementById("nsrad2").checked;
			var ns3 = document.getElementById("nsrad3").checked;
			var ew1 = document.getElementById("ewrad1").checked;
			var ew2 = document.getElementById("ewrad2").checked;
			var ew3 = document.getElementById("ewrad3").checked;
			var mk1 = document.getElementById("mkrad1").checked;
			var mk2 = document.getElementById("mkrad2").checked;
			
			var string = "{\"options\":{\"ns\":[\"" + ns1 + "\",\"" + ns2 + "\",\"" + ns3 + "\"],\"ew\":[\"" + ew1 + "\",\"" + ew2 + "\",\"" + ew3 + "\"],\"mk\":[\"" + mk1 + "\",\"" + mk2 + "\"]}}";
			setCookie("BSOL_options",string,20*365);
			
			var sel = document.getElementById("honourCardSet");
			
			if (sel!=null)
			{	
				if (localStorageSupported())
				{
					localStorage.setItem("honourCardSet",sel.value);
				}
			}
			
			if (remoteState!==document.getElementById("mkuseremote").checked)
				startStopMainWorker();
		}
		
	document.getElementById("nsrad1").onclick = document.getElementById("nslab1").onclick = document.getElementById("nsrad1").ontouchstart = document.getElementById("nslab1").ontouchstart = function() {document.getElementById("nsrad1").checked=true;displayHands();};
	document.getElementById("nsrad2").onclick = document.getElementById("nslab2").onclick = document.getElementById("nsrad2").ontouchstart = document.getElementById("nslab2").ontouchstart = function() {document.getElementById("nsrad2").checked=true;displayHands();};
	document.getElementById("nsrad3").onclick = document.getElementById("nslab3").onclick = document.getElementById("nsrad3").ontouchstart = document.getElementById("nslab3").ontouchstart = function() {document.getElementById("nsrad3").checked=true;displayHands();};
	document.getElementById("ewrad1").onclick = document.getElementById("ewlab1").onclick = document.getElementById("ewrad1").ontouchstart = document.getElementById("ewlab1").ontouchstart = function() {document.getElementById("ewrad1").checked=true;displayHands();};
	document.getElementById("ewrad2").onclick = document.getElementById("ewlab2").onclick = document.getElementById("ewrad2").ontouchstart = document.getElementById("ewlab2").ontouchstart = function() {document.getElementById("ewrad2").checked=true;displayHands();};
	document.getElementById("ewrad3").onclick = document.getElementById("ewlab3").onclick = document.getElementById("ewrad3").ontouchstart = document.getElementById("ewlab3").ontouchstart = function() {document.getElementById("ewrad3").checked=true;displayHands();};
	document.getElementById("mkrad1").onclick = document.getElementById("mklab1").onclick = document.getElementById("mkrad1").ontouchstart = document.getElementById("mklab1").ontouchstart = function() {document.getElementById("mkrad1").checked=true;redrawMCTable(true);};
	document.getElementById("mkrad2").onclick = document.getElementById("mklab2").onclick = document.getElementById("mkrad2").ontouchstart = document.getElementById("mklab2").ontouchstart = function() {document.getElementById("mkrad2").checked=true;redrawMCTable(true);};
	
	try {
		document.getElementById("honourCardSet").onchange = displayHands;
	} catch (e) {};
	
	$("#optionsBox").show();
}

function showtoolsSubMenu()
{
	$("#toolsSubMenu").show();
}

function hideHelp()
{
	if (g_helpId!="")
	{
		$("#"+g_helpId).hide();
		g_helpId = "";
	}
}

function showHelp(pthis,detailedHelp)
{
		// Respond to the HELP button
	if ((g_helpId!="")&(g_helpId!=detailedHelp))
	{
		hideHelp();
	}
	
	g_helpId = detailedHelp;
	var popup = document.getElementById(detailedHelp);
	popup.style.top = 10 + "px";
	popup.style.left = 150  + "px";
	document.getElementById("hide_"+detailedHelp).onclick = function()
		{
			$("#"+g_helpId).hide();
		}
		
	$("#"+detailedHelp).show();
}

function largeSpinner()
{
	var spinner = document.getElementById("spinner");
	var largeSpinner = document.getElementById("largeSpinner");
	$("#spinner").finish();
	spinner.style.display="none";
	$("#largeSpinner").finish();
	largeSpinner.style.display="none";
	$("#largeSpinner").fadeIn(1);
}

function spinnerNoDelay(pthis)
{
	var spinner = document.getElementById("spinner");
	spinner.style.top = ((getPosition(pthis).y) - 20) + "px";
	spinner.style.left = getPosition(pthis).x  + "px";
	$("#spinner").finish();
	spinner.style.display="none";
	$("#spinner").fadeIn(1);
}

function spinnerNoDelayAbs(pthis,px,py)
{
	var spinner = document.getElementById("spinner");
	spinner.style.top = py;
	spinner.style.left = px;
	$("#spinner").finish();
	spinner.style.display="none";
	$("#spinner").fadeIn(1);
}

function spinner(pthis){
	var spinner = document.getElementById("spinner");
	spinner.style.top = ((getPosition(pthis).y) - 20) + "px";
	spinner.style.left = getPosition(pthis).x  + "px";
	$("#spinner").finish();
	spinner.style.display="none";
	$("#spinner").delay(500).fadeIn(200);
}


function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

function createMiniHandString(hand,index)
{
		// Create a string containing the hand for North, South, East, or West, to go into the mini hand diagram
	var points = 0;
	var incPoints;
	var cardSymbols = ["<img height=10px src=\"pics/spade.gif\">","<img height=10px src=\"pics/heart.gif\">","<img height=10px src=\"pics/diamond.gif\">","<img height=10px src=\"pics/club.gif\">"];
	var suitLetters = ["S","H","D","C"];
	var cardLetters = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
	hand = hand.Deal[index];
	hand = hand.split(".");
	var cardindex;
	
	var text = "";
	
	for (i=0;i<4;i++)
	{
		var tmpstr = hand[i];
		
		text = text + cardSymbols[i] +"&nbsp;";
		
		for (j=0;j<tmpstr.length;j++)
		{
			var card = tmpstr.charAt(j);
			var cardstr;
			
			if (card!="T")
				cardstr = card;
			else
				cardstr = "10";
				
			if (card=="A")
			{
				incPoints=4;
				cardindex = 12;
			}
			else if (card=="K") 
			{
				incPoints=3;
				cardindex = 11;
			}
			else if (card=="Q")
			{
				incPoints=2;
				cardindex = 10;
			}
			else if (card=="J")
			{
				incPoints=1;
				cardindex = 9;
			}
			else if (card=="T")
			{
				incPoints = 0;
				cardindex = 8;
			}
			else
			{
				incPoints = 0;
				cardindex = Number(card) - 2;
			}
			
			if ((g_handEntryMode==0)|(g_playableCards[i][cardindex]==-1))
				points = points + incPoints;

			text = text + convertHonourCards(cardstr);
		}
		
		if (i!=3) text = text.concat("<BR>");

		text = "<SPAN style=\"font-size:12px;font-weight:normal;\">" + text + "</SPAN>";
	}
	
	var record = new Object();
	
	var textstr = text;
    	var ruler = document.getElementById("ruler");
    
    	ruler.style.display="inline";
   	 ruler.innerHTML = textstr;    
	var align="margin:auto;width:" + ruler.offsetWidth + "px;";
	ruler.style.display="none";

	if (index==1)
		align = "float:left";
	else if (index==3)
		align = "float:right;";
		
	record.text = "<DIV style=\"text-align:left;" + align + "\"><SPAN style=\"font-weight:600;font-size:12pt;\">" + text + "</SPAN></DIV>";
	record.points = points;
	
	return record;
}

function convertHonourCards(para)
{
	var str = para;
	
	try {	// in case html doesn't contain honourCardSet field
		var value = document.getElementById("honourCardSet").value;
		
		if (value=="JQKA") return str;
		
		if (value=="BDKA")
		{
			str = str.replace(/J/g,"B");
			str = str.replace(/Q/g,"D");
			return str;
		}
		else if (value=="VDRA")
		{
			str = str.replace(/J/g,"V");
			str = str.replace(/Q/g,"D");
			str = str.replace(/K/g,"R");
		}
		else if (value=="BVHA")
		{
			str = str.replace(/J/g,"B");
			str = str.replace(/Q/g,"V");
			str = str.replace(/K/g,"H");
		}
		
		return str;
	} catch (e) {return para};
}

function roundSym (num,decPlaces) {
	var multi = Math.pow(10, decPlaces);
	var value = (Math.round(multi*Math.abs(num))/multi).toFixed(decPlaces);
	if (num<0) { value = -value; }
	return value;
}

function higherHonourCount(suit,base)
{
	var honours = "";
	
	if (base=="T")
		honours = "JQKA";
	else if (base=="J")
		honours = "QKA";
	else if (base=="Q")
		honours = "KA";
	else if (base=="K")
		honours = "A";
		
	var cnt = 0;
	
	for (var i=0;i<honours.length;i++)
	{
		if (suit.includes(honours[i]))
			cnt++;
	}
	
	return cnt;
}

function krCalc(suits)
{
	var totcards = 0;
	
	for (var i=0;i<4;i++)
	{
		totcards += suits[i].length;
	}
	
	if (totcards!=13) return "";
	
		// Kaplan Rubens Evaluator
	var total = 0;
	
	for (var i=0;i<4;i++)
	{
		var suit = suits[i];
		var krpoints = 0;	
	
		if (suit.includes("A")) krpoints += 4;
		if (suit.includes("K")) krpoints += 3;
		if (suit.includes("Q")) krpoints += 2;
		if (suit.includes("J")) krpoints += 1;
		if (suit.includes("T")) krpoints += 0.5;
		
		if ((suit.length>=2)&(suit.length<=6))
		{
			if (suit.includes("T"))
				if ((suit.includes("J"))|(higherHonourCount(suit,"J")>=2))
					krpoints += 0.5;	// Rule 6
					
			if (suit.includes("9"))
				if (suit.includes("8")|suit.includes("T")|(higherHonourCount(suit,"T")==2))
					krpoints += 0.5; //Rule 7
		}
		
		if ((suit.length>=4)&(suit.length<=6))
		{
			if (suit.includes("9"))
				if ((!suit.includes("8"))&(!suit.includes("T"))&(higherHonourCount(suit,"T")==3))
					krpoints += 0.5;	// Rule 8
		}
		
		if (suit.length>=7)
			if ((!suit.includes("Q"))|(!suit.includes("J")))
				krpoints += 1;	// Rule 9
				
		if (suit.length>=8)
			if (!suit.includes("Q"))
				krpoints += 1;	// Rule 10
				
		if (suit.length>=9)
			if ((!suit.includes("Q"))&(!suit.includes("J")))
				krpoints += 1;	// Rule 11
				
		krpoints = (suit.length*krpoints)/10.0;	// Rule 12
		
//		alert(krpoints);
		
		if (suit.includes("A"))
			krpoints += 3;	//Rule 13
			
		if ((suit.includes("K"))&(suit.length>=2))
			krpoints += 2; // Rule 14
			
		if ((suit.includes("K"))&(suit.length==1))
			krpoints += 0.5;  // Rule 15
		
		if ((suit.length>=3)&(suit.includes("Q")))
		{
			if ((suit.includes("A"))|(suit.includes("K")))
				krpoints += 1;	// Rule 16
				
			if ((!suit.includes("A"))&(!suit.includes("K")))
				krpoints += 0.75;	// Rule 17
		}
		
		if ((suit.length==2)&(suit.includes("Q")))
		{
			if ((suit.includes("A"))|(suit.includes("K")))
				krpoints += 0.5;	// Rule 18
			else
				krpoints += 0.25;	// Rule 19
		}
		
		if (suit.includes("J"))
		{
			var cnt = higherHonourCount(suit,"J");
			
			if (cnt==2)
				krpoints += 0.5;	// Rule 20
			else if (cnt==1)
				krpoints += 0.25;	// Rule 21
		}
		
		if (suit.includes("T"))
		{
			var cnt = higherHonourCount(suit,"T");
			
			if (cnt==2)
				krpoints += 0.25;	// Rule 22
			
			if ((suit.includes("9"))&(cnt==1))
				krpoints += 0.25;	// Rule 23
		}
		
		if (suit.length==0)
			krpoints += 3;	// Rule 24
		else if (suit.length==1)
			krpoints += 2;	// Rule 25
		else if (suit.length==2)
			krpoints += 1;	// Rule 26
			
		total += krpoints;
	}
	
	total = total - 1;
	
	var cnt3 = 0;
	
	for (var i=0;i<4;i++)
	{
		var suit = suits[i];
		
		if (suit.length==3) cnt3++;
	}
	
	if (cnt3==3)	// shape is 4-3-3-3
		total += 0.5;
		
	return total;
}

function createHandString(hand,index)
{
		// Create a string containing the hand for North, South, East, or West, to go into the table above the traveller
	var points = 0;
	var incPoints;
	var cardSymbolSize = 0.8*(g_textBratio*g_sectionHeight/4) + "px";
	if (!g_isMobi) cardSymbolSize = 0.6*(g_textBratio*g_sectionHeight/4) + "px";
	
	var cardSymbols = ["<img height=" + cardSymbolSize + " src=\"pics/spade.gif\">","<img height=" + cardSymbolSize + " src=\"pics/heart.gif\">","<img height=" + cardSymbolSize + " src=\"pics/diamond.gif\">","<img height=" + cardSymbolSize + " src=\"pics/club.gif\">"];
	var suitLetters = ["S","H","D","C"];
	var cardLetters = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
	hand = hand.Deal[index];
	hand = hand.split(".");
	var cardindex;
	var buttHeight = (g_sectionHeight/4) + "px";
	var showSubscript = false;
	var showColourCode = false;
	var cardFontSize = (0.9*g_textBratio*g_sectionHeight/4) + "px";
	var subFontSize = 0.45*(g_textBratio*g_sectionHeight/4) + "px";
	
	if ((index==0)|(index==2))	// North/South Hand
	{
		showSubscript = document.getElementById("nsrad1").checked;
		showColorCode = !document.getElementById("nsrad3").checked;
	}
	else
	{
		showSubscript = document.getElementById("ewrad1").checked;
		showColorCode = !document.getElementById("ewrad3").checked;
	}
	
	var matchSuit = -1;
	var matchCard = -1;
	
	if (g_showPlay)
	{
		if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		{
			var played = g_hands.boards[g_lastBindex].Played;
			
			if (g_currentPlayIndex<played.length)
			{		
				if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 1))	// still following the actual cards played in the match
				{
						var playedInMatch = played[g_currentPlayIndex];
						var suitChars = "SHDC";
						matchSuit = Number(suitChars.indexOf(playedInMatch.toUpperCase().charAt(0)));
						
						var cardChars = "23456789TJQKA";
						matchCard = cardChars.indexOf(playedInMatch.toUpperCase().charAt(1));
				}
			}
		}
	}

	var text = "";
	
	var krpoints = 0;	// Kaplan Reuben evaluator points for this holding
	
	for (i=0;i<4;i++)
	{
		var tmpstr = hand[i];
		
		text = text + "<BUTTON class=blankButton style='height:" + buttHeight + ";'>" + cardSymbols[i] + "</BUTTON>";
		
		for (j=0;j<tmpstr.length;j++)
		{
			var card = tmpstr.charAt(j);
			var cardstr;
			
			if (card!="T")
				cardstr = card;
			else
				cardstr = "10";
				
			if (card=="A")
			{
				incPoints=4;
				cardindex = 12;
			}
			else if (card=="K") 
			{
				incPoints=3;
				cardindex = 11;
			}
			else if (card=="Q")
			{
				incPoints=2;
				cardindex = 10;
			}
			else if (card=="J")
			{
				incPoints=1;
				cardindex = 9;
			}
			else if (card=="T")
			{
				incPoints = 0;
				cardindex = 8;
			}
			else
			{
				incPoints = 0;
				cardindex = Number(card) - 2;
			}
			
			cardstr = convertHonourCards(cardstr);
			
			if ((g_handEntryMode==0)|(g_playableCards[i][cardindex]==-1))
				points = points + incPoints;

			var score = g_playableCards[i][cardindex];
			var id = suitLetters[i] + cardLetters[cardindex] + i + "" + cardindex;
			
			if (score>=0)
			{
				if ((g_inputDir==index)&(g_handEntryMode!=0))
				{
					var color = "#00FF00";
					
					var id = suitLetters[i] + cardLetters[cardindex] + i + "" + cardindex;
					text = text + "<button id=\"button" + id + "\" onclick=\"buttclick(this);\" style=\"margin:0px;cursor:pointer;background-color:" + color + ";height:" + buttHeight + ";width:30px;padding:1px;font-size:" + cardFontSize + ";font-weight:bold;vertical-align:text-top\"" + cardstr + "><SPAN>"+cardstr+"</SPAN></button>";
				}
				else
				{
					var sup = "";
					var color = "#FFFFFF";
					
					if (showColorCode)
					{
						color = "#FFFF00";
						
						if (score==g_hiscore) color = "#00FF00";
					}
					
					if (g_showPlay!=0)
					{
						if ((matchSuit==i)&(matchCard==cardindex))
							sup = "<SPAN style=\"font-size:" + cardFontSize + ";font-style:italic;color:blue;\">*</SPAN>"
					}
					
					var id = suitLetters[i] + cardLetters[cardindex] + i + "" + cardindex;
					var subscript = "";
					
					if (showSubscript)
						subscript = "<SPAN><SUB style=\"font-size:12px;font-style:italic;vertical-align:-5%;\">" + score + "</SUB></SPAN>";
						
					text = text + "<button id=\"button" + id + "\" onclick=\"buttclick(this);\" style=\"margin:0px;padding:0px;cursor:pointer;background-color:" + color + ";height:" + buttHeight + ";min-width:30px;padding:1px;font-size:" + cardFontSize + ";font-weight:bold;vertical-align:text-top;\"" + cardstr + "><SPAN style='display:block:text-align:center;line-height:1em;'>" + sup +cardstr+"</SPAN>" + subscript + "</button>";
				}
			}
			else if (g_currentTrickCards[i][cardindex]!=0)
				text = text + "<BUTTON style=\"margin:0px;background-color:#6699FF;color:white;height:" + buttHeight + ";min-width:30px;font-size:" + cardFontSize + ";font-weight:bold;padding:1px;vertical-align:text-top\" disabled><SPAN  style='display:block:text-align:center;line-height:1em;'>" + cardstr + "</SPAN></BUTTON> ";
			else if (g_inactiveCards[i][cardindex]!=0)
				text = text + "<BUTTON style=\"margin:0px;border:0px;background-color:#EEEEEE;color:#CCCCCC;font-size:" + cardFontSize + ";font-weight:bold;height:" + buttHeight + ";padding:1px;vertical-align:text-top\"><SPAN  style='display:block:text-align:center;line-height:1em;'>" + cardstr + "</SPAN></BUTTON> ";
			else
				if ((g_handEntryMode==0)|(g_inputDir!=index))
					text = text + "<BUTTON class=blankButton style=\"height:" + buttHeight + ";font-size:" + cardFontSize + ";font-weight:bold;\"><SPAN  style='display:block:text-align:center;line-height:1em;'>" + cardstr + "</SPAN></BUTTON> ";
				else
					text = text + "<button id=\"button" + id + "\" onclick=\"deselectCard(this);\" style=\"margin:0px;cursor:pointer;background-color:#FFFFFF;height:" + buttHeight + ";min-width:30px;font-size:" + cardFontSize + ";font-weight:bold;padding:1px;vertical-align:text-top\"><SPAN style='display:block:text-align:center;line-height:1em;'>" + cardstr + "<SUB style=\"font-size:12px;font-style:italic;vertical-align:-5%;\">&#10004;</SUB></SPAN></button>"; 
		}
		
		if (i!=3) text = text.concat("<BR>");
	}
	
	krpoints = krCalc(hand);
		
	var record = new Object();
	
	var textstr = text;
    var ruler = document.getElementById("ruler");
    
    ruler.style.display="inline";
    ruler.innerHTML = textstr;    
	var align="margin:auto;width:" + ruler.offsetWidth + "px;";
	ruler.style.display="none";

	if (index==1)
		align = "float:left";
	else if (index==3)
		align = "float:right;";
		
	var pts = document.getElementById("points");
		
	record.text = "<DIV style=\"text-align:left;" + align + "\"><SPAN style=\"font-weight:600;font-size:10pt;\">" + text + "</SPAN></DIV>";
	
	var kr = false;
	var krid = document.getElementById("krcalc");
	
	if (krid!==null)
	{
		kr = krid.checked;
	}
	
	if (kr)	// Show Kaplan-Rubens points as well
		if (krpoints!=="")
			record.points = roundSym(krpoints,2) + " (" + points + ")";
		else
			record.points = "--(" + points + ")";
	else
	record.points = points;
	
	return record;
}

function substituteSuitSymbol(contract)
{
		// Adjust the contract string depending on the number of tricks actually made, e.g. 11 tricks in 3NT becomes 3NT+2
		// Also inserts suit symbols in place of letters in the contract and specifies a monospaced font for displaying the contract.
	var symbolHeight = Math.floor((g_sectionHeight)/8) + "px";
	var cardSymbols = ["<img height=" + symbolHeight + " src=\"pics/spade.gif\">","<img height=" + symbolHeight + " src=\"pics/heart.gif\">","<img height=" + symbolHeight + " src=\"pics/diamond.gif\">","<img height=" + symbolHeight + " src=\"pics/club.gif\">"];
	var suit = contract.charAt(1);
	
	if (suit=="S")
		suit = 0;
	else if (suit=="H")
		suit = 1;
	else if (suit=="D")
		suit = 2;
	else if (suit=="C")
		suit = 3;
	else
		suit = -1;
		
	if (suit!=-1)
	{
		if (contract.length>2)
			return contract.charAt(0) + "<SPAN style=\"font-size:17px;\">" + cardSymbols[suit] + "</SPAN>" + contract.substr(2);
		else
			return contract.charAt(0) + "<SPAN style=\"font-size:17px;\">" + cardSymbols[suit] + "</SPAN>";
	}
	else
		return contract;
}

function doPopup(pelement,text)
{
		// Display popup box containing specified text at location of this element	
	var y = ((getPosition(pelement).y) - 20) + "px";
	var x = getPosition(pelement).x  + "px";
	doPopupAt(text,x,y);
}

function doPopupAt(text,px,py)
{
		// Display popup box containing specified text at location of this element	
	var popup = document.getElementById("popup_box");
	popup.style.top = py + "px";
	popup.style.left = px  + "px";
	popup.innerHTML = text;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(4000).fadeOut(100);  // Display for 4 seconds
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

function convertParContract(str)
{
	if (str.length<=2) return str;
	
	var firstNum = Number(str.charAt(0));
	var lastNum = Number(str.charAt(str.length-2));
	var diff = lastNum-firstNum;
	str = str.charAt(0) + str.charAt(str.length-1) + "+" + diff;
	return str;
}

function convertParContractString(str)
{
	var result="";
	var idx = 0;
	
	while (idx<str.length)
	{
		var ch = str.charAt(idx);
		if (!isNaN(parseInt(ch,10)))
		{
			var firstIdx = idx;
			
			idx++;
			
			while (idx<str.length)
			{
				ch = str.charAt(idx);
				if (!isNaN(parseInt(ch,10)))
				{
					idx++;
				}
				else
					break;
			}
			
			idx++;
			result = result + convertParContract(str.substring(firstIdx,idx));
		}
		else
		{
			result = result + str.charAt(idx);
			idx++;
		}
	}
	
	return result;
}

function updateParResults(data,pindex)
{
	var nsc = convertParContractString(data.contractsNS);
	var ewc = convertParContractString(data.contractsEW);
	var nss = data.scoreNS;
	var ews = data.scoreEW;
	
	nss = nss.substring(3);
	ews = ews.substring(3);
	
	var index = nss.indexOf("-");
	if (index==-1) nss = "+" + nss;
	
	index = ews.indexOf("-");
	if (index==-1) ews = "+" + ews;
	
	nsc = nsc.substring(3).trim();
	ewc = ewc.substring(3).trim();
	
	var optstring;
	
	if (nsc==ewc)
	{
		optstring =  nsc + "; " + nss;
	}
	else
	{
		optstring =  nsc + "; " + nss + "<BR>" + ewc + "; " + ews;
	}

	g_hands.boards[pindex].OptimumScore = optstring;
	
	if (pindex==g_lastBindex) updateUpperLeftQuadrant(pindex);
}

function displayHands()
{	
	var north = document.getElementById("northHand");
	var handstr = createHandString(g_hands.boards[g_lastBindex],0);
	north.innerHTML = handstr.text;
	
	var east = document.getElementById("eastHand");
	handstr = createHandString(g_hands.boards[g_lastBindex],1);
	east.innerHTML = handstr.text;
	
	var south = document.getElementById("southHand");
	handstr = createHandString(g_hands.boards[g_lastBindex],2);
	south.innerHTML = handstr.text;
	
	var west = document.getElementById("westHand");
	handstr = createHandString(g_hands.boards[g_lastBindex],3);
	west.innerHTML = handstr.text;
}

function processPosition(hcards,para)
{
		// Updates the card display while in 'play' mode from the json data received back from the web server after a card is played.
		// hcards is a javascript object built from the json string received from the server.
	var savehcards = hcards;
	
	if (hcards.errno<0)
	{
		alert(savehcards);
		alert(hcards.errmsg);
	}
	
	var finished="";
	
	if (hcards.errno==0)
	{
		g_currentPlayer = hcards.player;
		if (g_currentPlayer=="north") g_currentPlayer = 0;
		else if (g_currentPlayer=="east") g_currentPlayer = 1;
		else if (g_currentPlayer=="south") g_currentPlayer = 2;
		else if (g_currentPlayer=="west") g_currentPlayer = 3;
	}
	
	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			g_playableCards[i][j] = -1;
			g_inactiveCards[i][j] = 1;	// set all cards inactive, then set cards remaining active.
			g_currentTrickCards[i][j] = 0;
		}
	}
	
	if (hcards.errno==0)
	{
		if (g_showPlay!=0)
		{
			g_currentPlayIndex = hcards.trick*4 + hcards.trickCard;
			
				// Check if cards played match what is stored in the hand record up to this point
			if (g_currentPlayIndex==0)
				g_lastMatchedPlayIndex = -1;
			else
			{
				if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
				{
					var played = g_hands.boards[g_lastBindex].Played;
					
					if (g_lastMatchedPlayIndex >= (g_currentPlayIndex-2))
					{
						g_lastMatchedPlayIndex = g_currentPlayIndex - 2;
					}
	
					if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 2))	// see if card just played is still part of sequence played in match
					{
						if ((g_currentPlayIndex-1)<=(played.length-1))
						{
							var lastSuit = hcards.lastSuit;
							var lastCard = hcards.lastCard;
							
							var playedInMatch = played[g_currentPlayIndex-1];
							var suitChars = "SHDC";
							var matchSuit = Number(suitChars.indexOf(playedInMatch.toUpperCase().charAt(0)));
							
							var cardChars = "23456789TJQKA";
							var matchCard = cardChars.indexOf(playedInMatch.charAt(1));
							
							if ((lastSuit==matchSuit)&(lastCard==matchCard))
							{
								g_lastMatchedPlayIndex++;
								
								if ((typeof g_hands.boards[g_lastBindex].Claimed)!="undefined")
								{
									if ((g_lastMatchedPlayIndex==played.length-1)&(played.length<52))
										if (g_hands.boards[g_lastBindex].Claimed!="")   
											finished = "<BR><SPAN style=\"color:red;font-weight:bold;font-size:16px;\">" + g_hands.boards[g_lastBindex].Claimed + " Tricks Claimed</SPAN>";
										else
											finished = "<BR><SPAN style=\"color:red;font-weight:bold;font-size:16px;\">No More Cards Played</SPAN>";
								}
							}
						}
					}
				}
			}
		}
		
		var currentTrick = hcards.currentTrick;
		
		for (i=0;i<currentTrick.length;i++)
		{
			g_currentTrickCards[currentTrick[i][0]][currentTrick[i][1]] = 1;
		}
		
		var remaining = hcards.remaining;
		
		for (i=0;i<4;i++)
		{
			var playerCardsRemaining = remaining[i];
			
			for (j=0;j<4;j++)
			{
				var suitRemaining = playerCardsRemaining[j];
				
				for (k=0;k<suitRemaining.length;k++)
				{
					g_inactiveCards[j][suitRemaining[k]] = 0;
				}
			}
		}
		
		var cards = hcards.cards;
		
		g_hiscore = 0;
		
		for (i=0;i<cards.length;i++)
		{
			var data = cards[i];
			var score = data.score;
			var suits = data.values;			
			var currentTricks;
			
			if ((g_currentPlayer==0)|(g_currentPlayer==2))	// North/South
				currentTricks = hcards.tricksNS;
			else
				currentTricks = hcards.tricksEW;
				
				// Add current tricks to tricks remaining to give total that can be made on this hand given current position
			score = score + currentTricks;
				
			if (score>g_hiscore) g_hiscore = score;
			
			for (j=0;j<4;j++)
			{
				var values = suits[j];
				
				for (k=0;k<values.length;k++)
				{
					g_playableCards[j][values[k]] = score;
				}
			}
		}

		if ((hcards.trick==0)&(hcards.trickCard==0))
		{
			if ((g_session_contract.charAt(0)=="-")|(g_session_contract.charAt(0)=="*"))
			{
				var maxTricksDeclarer = g_partialHandTotalTricks - g_hiscore;
				var minusTricks;
				
				if (g_partialHand==0)
				{
					if (maxTricksDeclarer<7)
					{
						minusTricks = 7 - maxTricksDeclarer;
						g_session_contract = "1" + g_session_contract.substring(1) + "-" + minusTricks;
					}
					else
					{
						var contractTricks = maxTricksDeclarer - 6;
						g_session_contract = contractTricks + g_session_contract.substring(1);				
					}
				}
				else	// For partial hands just show the suit, not the level of contract
				{
					g_session_contract = g_session_contract.substring(1);
				}
			}
		}

		if ((hcards.tricksNS+hcards.tricksEW)==g_partialHandTotalTricks) finished = "<BR><SPAN style=\"color:red;font-weight:bold;font-size:16px;\">Finished</SPAN>";
		
		var original = "";
		
		if ((g_showPlay!=0)&(g_showOriginalContract==false))
			original = "<BR><SPAN style=\"font-size:12px;font-weight:normal;\">(originally played in " + g_hands.boards[g_lastBindex].Contract + ")</SPAN>";
		
		document.getElementById("currentPosition").innerHTML = "<SPAN style=\"font-weight:bold;font-size:16px;\">Contract: " + substituteSuitSymbol(g_session_contract) + " by " + g_session_declarer + original + "<BR><BR>" + "NS Tricks: " + hcards.tricksNS + "<BR>EW Tricks: " + hcards.tricksEW + "</SPAN>" + finished;
	}
	
	displayHands();
}

function calldds(str)
{
	var board = g_hands.boards[g_lastBindex];
	var deal = board.Deal;
	var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
	
	var msg = new Object();
	msg.request = str;
	
	if (str!=="q")
	{
		msg.pbn = dealstr;
		msg.trumps = g_trumps;
		msg.leader = g_leader;
	}
	
	msg.requesttoken = g_session;
	msg.sockref = g_session;
	
	var context = new Object();
	context.request = msg.request;
	
	if (str!=="q")
		context.para = "ongoing";
	else
		context.para = "quit";
		
	msg.context = context;
	
	g_worker.postMessage(msg);
}

function buttclick(pthis)
{
		// When a button is clicked on a playable card this function send the card played to the server which will
		// then update the current position and return a json string containing it.
	
	var cards = "23456789TJQKA";
	var suits = "SHDC";
	
	var str = pthis.id.replace("button","");
	var suit = Number(str.charAt(2));
	var cd;
	
	if (str.length==4)
		cd = Number(str.charAt(3));
	else
		cd = Number(str.substr(3));
		
	if (g_handEntryMode==0)
	{
		str = str.substr(0,2);
	
		if (requestPending())
			return;	// Don't allow while there is a request in progress.
		else
			setRequestTimeout(true);
			
/*		for (var i=0;i<4;i++)
		{
			var cstr = suits[i] + ": ";
			
			for (var j=0;j<13;j++)
			{
				if (g_inactiveCards[i][j]==0)
					cstr += cards[j];
			}
			
			alert(cstr);
		}*/

		spinner(pthis);
		callddd(str);
	}
	else
	{
		var count;
		
			// Check number of cards already allocated to this quadrant.
		if ((count = countAllocated(g_inputDir))<13)
		{
            clearMakeableOnInputBoard();
			count++;
			g_playableCards[suit][cd] = -1;
			g_cardQuadrant[suit][cd] = g_inputDir;
			
			var nextdir = g_inputDir;
			var i;
			
			if (count==13)
			{
				for (i=0;i<4;i++)
				{
					if (nextdir==3)
						nextdir = 0;
					else
						nextdir++;
						
					if (countAllocated(nextdir)==0) break;	// Found an empty quadrant
				}
				
				if (countAllocated(nextdir)==0)
				{
					if (13==countUnallocated())	// Allocate all remaining cards to this quadrant
					{
						selectQuadrant(nextdir);
					
						for (i=0;i<4;i++)
						{
							for (j=0;j<13;j++)
							{
								if (g_playableCards[i][j]>=0)
								{
									g_playableCards[i][j] = -1;
									g_cardQuadrant[i][j] = nextdir;
								}
							}
						}

						deselectCurrentDir(g_inputDir);
						exitHandEntryMode();
						return;
					}
					
					selectQuadrant(nextdir);
				}
/*				else	// All quadrants are full, so exit edit mode
				{
					deselectCurrentDir(g_inputDir);
					processHandEntry();
					exitHandEntryMode();
				}*/
			}
			processHandEntry();
		}
		else
		{
			var compass = ["North","East","South","West"];
			displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">13 Cards already allocated to " + compass[g_inputDir] + "</SPAN>");
		}
	}
	
	g_stopPropagation = 1;
}

function quitHandEntryMode()
{
	if (g_handEntryMode!=0)
	{
		var i,j;
		var quadrant = ["northHand","eastHand","southHand","westHand"];

		deselectCurrentDir(g_currentDir);
		g_handEntryMode = 0;
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
		$("#scoreandtraveller").show();
		document.getElementById("editHand").innerHTML = "Edit";

		document.getElementById("board").rows[0].cells[2].innerHTML = "";
	}
}

function exitHandEntryMode()
{
	if (g_handEntryMode!=0)
	{
		var i,j;
		var quadrant = ["northHand","eastHand","southHand","westHand"];
			
		deselectCurrentDir(g_currentDir);
		g_handEntryMode = 0;
		delete g_inputBoard.Bids;
		delete g_inputBoard.Played;
		delete g_inputBoard.Contract;
		delete g_inputBoard.Claimed;
		delete g_inputBoard.Declarer;
		
		if ((typeof g_hands.lin)!=="undefined")
		{
			delete g_hands.lin;
			setupCommandHelp();
		}
		
		g_hands.boards[g_lastBindex] = g_inputBoard;
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
		$("#scoreandtraveller").show();
		$("#mainTitle").show();
		document.getElementById("editHand").innerHTML = "Edit";
		
		var ptsctl = document.getElementById("ptsctl");
		
		if (ptsctl!==null)
			ptsctl.style.display = "inline";
		
		document.getElementById("currentPosition").innerHTML = g_credits;
		showCredits();
	}
}

function showCredits()
{
	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		if (g_hands.boards[g_lastBindex].Played.length>1) return;	// Board contains play data, so show bidding and replay controls instead of credits
	
		// Check for empty string first because toUpperCase() fails on empty string.
	if ((typeof g_hands.lin)=="undefined")
	{
		if (g_file==="")
			document.getElementById("currentPosition").innerHTML = g_credits;
		else if (g_file!==1)
		{
			if (!g_file.toUpperCase().endsWith('LIN'))
				document.getElementById("currentPosition").innerHTML = g_credits;
		}
	}
}

function countAllocated(index)
{
	var i,j;
	var count = 0;
	
	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			if ((g_cardQuadrant[i][j]==index)&(g_playableCards[i][j]==-1)) count++;
		}
	}
	
	return count;
}

function countUnallocated()
{
	var i,j;
	var count = 0;
	
	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			if (g_playableCards[i][j]!=-1) count++;
		}
	}
	
	return count;
}

function deselectCard(pthis)
{
		// When a button is clicked on a playable card this function send the card played to the server which will
		// then update the current position and return a json string containing it.
    clearMakeableOnInputBoard();
	var str = pthis.id.replace("button","");
	var suit = Number(str.charAt(2));
	var cd;
	
	if (str.length==4)
		cd = Number(str.charAt(3));
	else
		cd = Number(str.substr(3));
		
	g_playableCards[suit][cd] = 1;
	processHandEntry();
}

function hideSpinner()
{
	$("#spinner").finish();
	$("largeSpinner").finish();
	document.getElementById("spinner").style.display="none";
	document.getElementById("largeSpinner").style.display="none";
}

function log(pstr)
{
	if (g_logging)
	{
		var requestStr = "log.htm?" + pstr + "&uniqueTID=" + new Date().getTime();
		doRequestHTMLasync(requestStr,doNothing,doNothing,{"para":"log"});
	}
}

function callddd(pstr)
{
	if (pstr!="q") calldds(pstr);
}

function dddquitfunc(data,statusText,jqXHR)
{
	// do nothing routine, supplied as a callback when user quits a play session
}

function getTindexByName(boards,boardName)
{
		// Find the index of the hand corresponding to a particular traveller in the boards array
	var i;
	
	for (i=0;i<boards.length;i++)
	{
		if (boards[i].board.split(".").join("") == boardName.split(".").join(""))
		{
			return i;
		}
	}
	
	return -1;
}

function getTindex(boards,traveller)
{
		// Find the index of the hand corresponding to a particular traveller in the boards array
	var i;
	
	for (i=0;i<boards.length;i++)
	{
		if (boards[i].board == (traveller+1))
		{
			return i;
		}
	}
	
	return -1;
}

function resetState()
{
	stopPlay();
	
	if (g_timeout!="")	// Clear timeout routine queued, if any
	{
		clearTimeout(g_timeout);
		g_timeout = "";
	}
	
	hideSpinner();
	
	hideRanking();
	$("#scores").hide();
	$("#scoreandtraveller").hide();
//	$("#mainTitle").hide();
	$("").hide();
	hideAllPopups();
	$("#popup_box").finish();
	document.getElementById("popup_box").display = "none";
}

function terminateSession()
{
	hideSpinner();
	
	if (g_session!=0)
	{
		callddd("q");  // Terminate any double dummy playing g_session that is in progress.

		showCredits();
	}
	
	exitHandEntryMode(); // In case hand editing is in progress.
}

function playLinContract(auto=false,dest=0)
{
	var declarerChars = "NESW";
	var leaderChars = "ESWN";
	
	var board = g_hands.boards[g_lastBindex];
	
	var contract = board.Contract;
	
	if (!g_showOriginalContract)
		contract = contract.replace(/[xX\*]/g,"");
		
	var contractChar = contract.charAt(1);
	
	if (!auto) g_showPlay = 1;
	
	playContract(board.Declarer,contract.charAt(1),contract,auto,dest);
}

function showBidding()
{
	var vul = g_hands.boards[g_lastBindex].Vulnerable;
	var red = "#FF0000";
	var green ="#00FF00";
	var dirs = "WNES";
	var i,row;
	var headerDiv = document.createElement("div");
	var headerTable = document.createElement("table");
	headerTable.className = "bidding";
	headerTable.id = "biddingHeader";
	headerTable.style.borderBottom="0px";
	headerDiv.appendChild(headerTable);
	headerTable.insertRow(-1);
	var headerRow = headerTable.rows[0];
	
	for (i=0;i<4;i++)
	{
		headerRow.insertCell(-1);
		var cell = headerRow.cells[i];
		cell.style.width = "50px";
		cell.innerHTML = dirs.charAt(i);
		
		var color;
		if (vul=="All") color = red;
		else if (vul=="None") color = green;
		else if ((i==0)|(i==2))
		{
			if (vul=="EW") color = red; else color = green;
		}
		else
		{
			if (vul=="NS") color = red; else color = green;
		}
		
		cell.style.backgroundColor = color;
		cell.style.fontSize = g_bidFontSize;
	}
	
	var el = document.createElement("div");
	var table = document.createElement("table");
	table.className = "bidding";
	table.id = "bidding";
	el.appendChild(table);
	
	var bids = g_hands.boards[g_lastBindex].Bids;
	var dealer = g_hands.boards[g_lastBindex].Dealer;
	var dealerChars = "WNES";
	var dealerIndex = dealerChars.indexOf(dealer);
	
	var j=0;
	var k;
	
	i = 0;
	
	while (j<bids.length)
	{
		if (i==0)
		{
			table.insertRow(-1);
			row = table.rows[table.rows.length-1];
		}
		
		if (j==0)
		{
			for (k=0;k<dealerIndex;k++)
			{
				row.insertCell(-1);
				row.cells[i].style.width="50px";
				row.cells[i] = "-";
				i++;
			}
		}
		
		row.insertCell(-1);
		
		var components = bids[j].split("|");
		var bd = components[0].toUpperCase();
		var suffix = "";
		if (bd.indexOf("!")!=-1) suffix = "!";
		
		if (bd.charAt(0)=="P") bd = "Pass" + suffix;
		else if (bd.charAt(0)=="D") bd = "x" + suffix;
		else if (bd.charAt(0)=="R") bd = "xx" + suffix;
		
		if (components.length>1)
		{
			row.cells[i].style.backgroundColor="yellow";
			row.cells[i].id = "bidIdx" + j;
			row.cells[i].style.cursor = "pointer";
		}
		else
		{
			row.cells[i].style.cursor = "default";			
		}
			
		row.cells[i].innerHTML = bd;
		row.cells[i].style.fontSize = g_bidFontSize;
		i++;
		
		if (i>3) i =0;
		j++;
	}
	
	var boxHeight = 3*g_sectionHeight/5 + "px";
	
	return "<div style=\"margin-left:35px;float:left;padding: 0; border:1px solid black; width: 200px;\">" + headerDiv.innerHTML + "</div><div id=biddingContent style=\"margin-left:35px; float:left; clear:both; padding: 0; border:1px solid black; width: 200px; height:" + boxHeight + "; overflow-y: auto;\">" + el.innerHTML + "</div>";
}

function lottPair(direction)
{
	// Law of Total Tricks
	var suitChars = "SHDC";
	var tricks;
	var board = g_hands.boards[g_lastBindex];
	
	if ((typeof board.Deal)!="undefined")
	{
		var h1,h2;
		
		if (direction==1)
		{
			h1 = board.Deal[0].split(".");
			h2 = board.Deal[2].split(".");
		}
		else
		{
			h1 = board.Deal[1].split(".");
			h2 = board.Deal[3].split(".");
		}
		
		var max = 0;
		var suit;
		var i;
		
		for (i=0;i<4;i++)
		{
			var slen = h1[i].length + h2[i].length;
			
			if (slen>max)
			{
				max = slen;
				suit = i;
			}
		}
		
		var t1,t2;
		
		if (direction==1)
		{
			t1 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"N");
			t2 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"S");
		}
		else
		{
			t1 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"E");
			t2 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"W");
		}
		
		if ((t1!=-1)|(t2!=-1))
		{
			tricks = t1;
			if (t2>t1) tricks = t2;
		}
		else
		{
			tricks = -1;
		}
	}
	
	var result = new Object();
	result.tricks = tricks;
	result.trumpCount = max;
	result.suit = suit;
	
	if (tricks!=-1)
		return result;
	else
		return null;
}

function lott()
{
	var ns = lottPair(1);
	var ew = lottPair(2);
	
	if ((ns!=null)&(ew!=null))
	{
		var str = (ns.tricks + ew.tricks) + "-" + (ns.trumpCount + ew.trumpCount) + " = " + (ns.tricks + ew.tricks - ns.trumpCount - ew.trumpCount);
		return str;
	}
	else
		return "N/A";
}

function updateUpperLeftQuadrant(boardIndex)
{
	var btable;
	var optFontSize = g_sectionHeight/7 + "px";
	var lottFontSize = g_sectionHeight/9 + "px";
		
	var lottStr = "<BR><DIV style=\"margin-top:5px;\"><SPAN id=lott style=\"font-size:" + lottFontSize + ";font-weight:bold;\">LoTT: " + lott() + "</SPAN></DIV>";
	
	btable = document.getElementById("board");
	
	var ocell = btable.rows[0].cells[0];
	ocell.innerHTML = "";
	
	var names = "";
	var namesFound = true;
	
	if ((typeof g_hands.boards[boardIndex].PlayerNames)!="undefined")
	{
		if (g_hands.boards[boardIndex].PlayerNames.length>0)
			names = g_hands.boards[boardIndex].PlayerNames;
		else
			namesFound = false;
	}
	else if ((typeof g_hands.PlayerNames)!="undefined")
	{
		names = g_hands.PlayerNames;
	}
	else
	{
		namesFound = false;
	}
	
	if (namesFound)
	{
		var k;
		var namstr = "<DIV style=\"text-align:left;border:1px solid grey;padding:2px;margin-left:10px;margin-right:10px;\">";
		var boardName = g_hands.boards[boardIndex].board;
		var namOffset = 0;
		if ((boardName.indexOf(".Closed")!=-1)&(names.length==8)) namOffset = 4;
		var northName = names[namOffset + 2];
		var southName = names[namOffset];
		var westName = names[namOffset + 1];
		var eastName = names[namOffset + 3];
		
		namstr = namstr + "<SPAN id=namstr style=\"font-weight:bold;font-size:" + g_namSize + ";\">" + "N: " + northName + "<BR>" + "S: " + southName + "<BR>";
		namstr = namstr + "E: " + eastName + "<BR>W: " + westName + "</SPAN><BR>";

		ocell.style.verticalAlign = "top";
		ocell.innerHTML = namstr + "</DIV>";
	}
	else
	{
		ocell.style.verticalAlign = "middle";
	}
	
	if ((typeof g_hands.boards[boardIndex].OptimumScore)!="undefined")
	{
		if (g_hands.boards[boardIndex].OptimumScore!="")			
			ocell.innerHTML = ocell.innerHTML + "<SPAN id=optStr style=\"font-weight:bold;font-size:" + optFontSize + ";\">Optimum:" + "<BR>" + g_hands.boards[boardIndex].OptimumScore + "</SPAN>" + lottStr;
	}
	else
	{
		ocell.innerHTML = ocell.innerHTML + lottStr;
	}
}

function clearCardData()
{
	var i,j;
	
	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			g_playableCards[i][j] = -1;
			g_inactiveCards[i][j] = 0;
			g_currentTrickCards[i][j] = 0;
		}
	}
}

function validContract(contract)
{
	var levels = "1234567";
	var suits = "CDHSN";
	
	if (contract==null) return false;
	if (contract.length<2) return false;
	
	if (levels.indexOf(contract.charAt(0))==-1) return false;
	if (suits.indexOf(contract.charAt(1))==-1) return false;
	
	return true;
}

function findPlayedCardDir(bindex,card)
{
	var suits = "SHDC";
	var curBoard = g_hands.boards[bindex];
	var deal = curBoard.Deal;
	var i,suitIndex;
	
	var suit = card.toUpperCase().charAt(0);
	var value = card.toUpperCase().charAt(1);
	
	suitIndex = suits.indexOf(suit);
	
	for (i=0;i<4;i++)
	{
		var holding = deal[i].split(".");
		
		if (holding[suitIndex].indexOf(value)!=-1)
			return i; //0,1,2,3 = N,E,S,W
	}
	
	return -1;
}

function calculateTricks(bindex)
{
	var sequence = "23456789TJQKA";
	var trumpSuit;
	var i,j;
	var nstricks = 0;
	var ewtricks = 0;
	var tricks;
	var tricksuit,card;
	var winnerDir = -1;
	var contract = g_hands.boards[bindex].Contract;
	
	if (validContract(contract))
	{
			// Get trump suit
		trumpsuit = contract.charAt(1).toUpperCase();
		
		var curBoard = g_hands.boards[bindex];
		var played = curBoard.Played;
		
		if (curBoard.Claimed=="")
		{
			if (played.length==52)
			{
				for (i=0;i<played.length-3;i=i+4)
				{
					tricksuit = played[i].charAt(0).toUpperCase();
					trickdir = findPlayedCardDir(bindex,played[i]);
					trickvalue = sequence.indexOf(played[i].charAt(1).toUpperCase());
					
					for (j=1;j<4;j++)
					{
						card = played[i+j];
						cardsuit = card.charAt(0).toUpperCase();
						carddir = findPlayedCardDir(bindex,card);
						
						if (cardsuit==tricksuit)
						{
							if (sequence.indexOf(card.charAt(1))>trickvalue)
							{
								trickvalue = sequence.indexOf(card.charAt(1));
								trickdir = carddir;
							}
						}
						else if ((trumpsuit!="N")&(cardsuit==trumpsuit))
						{
							tricksuit = trumpsuit;	// After first ruff, subsequent cards have to be in trumpsuit to beat it
							trickvalue = sequence.indexOf(card.charAt(1));
							trickdir = carddir;
						}
					}
				
					if ((trickdir==0)|(trickdir==2))
						nstricks++;
					else
						ewtricks++;
				}
			
				if ((curBoard.Declarer=="N")|(curBoard.Declarer=="S"))
					tricks = nstricks;
				else
					tricks = ewtricks;
			}
			else
			{
				return "";
			}
		}
		else
		{
			tricks = curBoard.Claimed;
		}
		
		var target = Number(contract.charAt(0)) + 6;
		
		if (tricks==target)
			return "";
		else if (tricks>target)
			return "+" + (tricks-target);
		else
			return tricks-target;
	}	
}

function initTravRow(dir)
{
	if (g_travellers!=null)
	{
		g_currentTraveller = getTravellerForBoard(g_lastBindex);
		changeCurrentPair(g_hands.pair_number,g_hands.direction);
		
		if (g_currentTraveller.traveller_line.length>1)
		{
			if (dir==1)
			{
				if (g_currow<g_currentTraveller.traveller_line.length-1)
					g_currow++;
				else
					g_currow = 0;
			}
			else
			{
				if (g_currentTraveller.traveller_line.length>1)
				{
					if (g_currow>0)
						g_currow--;
					else
						g_currow = g_currentTraveller.traveller_line.length-1;
				}
			}
		}
		
		terminateSession();
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
	}
}

function initPrevTravRow()
{
	initTravRow(0);
}

function prevTravRow()
{
	if (g_currentTraveller!=null)
	{
		if (g_currentTraveller.traveller_line.length>1)
		{
			if (g_currow>0)
				g_currow--;
			else
				g_currow = g_currentTraveller.traveller_line.length-1;
		}
	}
	else
	{
		getHands({callback:initPrevTravRow});
		return;
	}
	
	terminateSession();
	setupTraveller(g_lastBindex,true);
	enterPlayMode();
}

function initNextTravRow()
{
	initTravRow(1);
}

function nextTravRow()
{
	if (g_currentTraveller!=null)
	{
		if (g_currentTraveller.traveller_line.length>1)
		{
			if (g_currow<g_currentTraveller.traveller_line.length-1)
				g_currow++;
			else
				g_currow = 0;
		}
	}
	else
	{
		getHands({callback:initNextTravRow});
		return;
	}
	
	terminateSession();
	setupTraveller(g_lastBindex,true);
	enterPlayMode();
}

function setFieldsFromTravellerLine(bindex,tline)
{
	g_hands.boards[bindex].Contract = tline.contract;
	g_hands.boards[bindex].Declarer = tline.played_by;
	g_hands.boards[bindex].PlayerNames = [];
	g_hands.boards[bindex].Played = [];
	g_hands.boards[bindex].Played[0] = tline.lead;
	g_hands.boards[bindex].Bids = [];
}

function setHandRecordFromLin(bindex,tline)
{
	var curBoard;
	var lin;
	
	if ((typeof tline.board)!="undefined")
	{
		curBoard = g_hands.boards[bindex];
		var board = tline.board;
		
		curBoard.PlayerNames = board.PlayerNames;
		curBoard.Dealer = board.Dealer;
		curBoard.Vulnerable = board.Vulnerable;
		curBoard.Deal = board.Deal;
		curBoard.Bids = board.Bids;
		curBoard.Played = board.Played;
		curBoard.Claimed = board.Claimed;
		curBoard.Score = board.Score;
		curBoard.Contract = board.Contract;
		curBoard.Declarer = board.Declarer;
		
		if (board.Played.length>0)
			curBoard.lead = board.Played[0];
		
		return curBoard;
	}
	else
	{
		setFieldsFromTravellerLine(bindex,tline);
		return g_hands.boards[bindex];
	}
}

function showTravellerRowButtons()
{
		// should return true if g_xml!=="" ?
//	return (g_showAllControls);
	return false;
}

function exitCardPlay()
{
	resetTimeout();
	terminateSession();
	document.getElementById("play").innerHTML = g_playButtonText;
	setupTraveller(g_lastBindex,true);
	enterPlayMode();
	document.getElementById("mctable").className = "";
}

function updatePointsDisplay()
{
	var npts,epts,spts,wpts;
	
	var tindex = g_lastBindex;
	
	if (!g_handEntryMode)
	{
		var handstr = createHandString(g_hands.boards[tindex],0);
		npts = handstr.points;
		
		handstr = createHandString(g_hands.boards[tindex],1);
		epts = handstr.points;
		
		handstr = createHandString(g_hands.boards[tindex],2);
		spts = handstr.points;
		
		handstr = createHandString(g_hands.boards[tindex],3);
		wpts = handstr.points;
	}
	else
	{
		npts = epts = spts = wpts = "";
	}
	
	var points = document.getElementById("points");
	points.rows[0].cells[1].innerHTML = npts;
	points.rows[1].cells[0].innerHTML = wpts;
	points.rows[1].cells[2].innerHTML = epts;
	points.rows[2].cells[1].innerHTML = spts;
}

function setupTraveller(index,active)
{
	var i,j,k;
	var table = document.getElementById("traveller");
	var hcards;
	var boardChanged = false;
	
//	alert("setupTrav1: " + JSON.stringify(g_hands.boards[g_lastBindex]));
//	alert("setupTrav1: " + JSON.stringify(g_hands.boards[0]));
//	if (g_currow!=-1) alert("curtrav: " + JSON.stringify(g_currentTraveller.traveller_line[g_currow]));
//	alert("g_lastBindex: " + g_lastBindex + " pair: " + g_hands.pair_number + " direction: " + g_hands.direction);

	g_mode = 0;	// Cancel play mode if it is active
	
	if (index!=g_lastBindex) boardChanged = true;
	
	g_lastBindex = index;
	
	$("#board").show();
	$("#scorecard").show();
	hideMenuItems();
	showMainMenuItems();
	
	if (active==true)
	{
		show("play");
		show("computeMakeable");
		show("tools");

//		if ((typeof g_hands.lin)=="undefined")
		{
			if ((((g_test==1))&(g_file==''))|(g_xml!=""))
			{
				show("bsession");
				show("bsessionHelp");
			}
		}

		$("#scorecard").show();
	}
	else
	{
		hideMenuItems();
	}
	
	var rowButtonsVisibility = "visibility:hidden";
	
	if (showTravellerRowButtons()) rowButtonsVisibility = "";
	
	var curBoard = g_hands.boards[g_lastBindex];
	
	if (g_travellers!==null)
	{
		var traveller = getTravellerForBoard(g_lastBindex);
		g_currentTraveller = traveller;
//		alert("from current traveller: " + JSON.stringify(g_currentTraveller.traveller_line[g_currow]));
		
		if (traveller!=null)
		{
			if (g_currentTraveller.traveller_line.length>1) rowButtonsVisibility = "";
			
			if (boardChanged) g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);
			
			if (g_currow!=-1)
			{
				var tline = g_currentTraveller.traveller_line[g_currow];
				
//				alert("tline: " + JSON.stringify(tline));
				
				curBoard = setHandRecordFromLin(g_lastBindex,tline);
				
//				alert("curBoard: " + JSON.stringify(curBoard));
			}
			else if (boardChanged) // (and g_currow==-1). Mustn't display old record because it doesn't apply to the new board.
			{
				delete g_hands.boards[g_lastBindex].PlayerNames;
				g_hands.boards[g_lastBindex].Played = [];
				g_hands.boards[g_lastBindex].Bids = [];
			}
		}
	}
	
	if (active==true)
	{				
		g_defaultContract = 0;	// Assume no default contract defined.

		if (((typeof curBoard.Contract)!="undefined")&((typeof curBoard.Declarer)!="undefined"))
		{
			if ((typeof curBoard.Played)!="undefined")
			{
				var pbutton = "";
				var isLin = false;
				
				if ((g_file!="")&(g_file!==1))
				{
					if (g_file.toUpperCase().endsWith("LIN")) isLin = true;
				}
				
				if (curBoard.Played.length>1) isLin = true;
				
				if ((typeof curBoard.Bids)!="undefined")
					if (curBoard.Bids.length>0) isLin = true;
				
				if (isLin)
				{
					if (validContract(curBoard.Contract))
					{
						var tricksOffset = calculateTricks(g_lastBindex);
						var score = curBoard.Score;
						
						if (score!="")
						{
							var ewscore = score;
							
							if (ewscore.indexOf("%")!=-1)
							{
								ewscore = ewscore.replace("%","");
								ewscore = 100.0 - ewscore;
								ewscore = ewscore.toFixed(2) + "%";
								
								score = score.replace("%","");
								score = Number(score).toFixed(2) + "%";
							}
							else
							{
								score = Number(score).toFixed(2);
								ewscore = (-Number(ewscore)).toFixed(2);
							}
							
							score = " NS: " + score + "&nbsp;&nbsp;&nbsp;EW: " + ewscore;
						}
						
						var bckbutton = "<BUTTON id=prevrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"prevTravRow();\"><SPAN id=prevRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";display:block:text-align:center;line-height:1em;\"><</SPAN></BUTTON>&nbsp;";
						var fwdbutton = "&nbsp;<BUTTON id=nextrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"nextTravRow();\"><SPAN id=nextRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";display:block:text-align:center;line-height:1em;\">><SPAN></BUTTON>";
						var accbutton = "&nbsp;<BUTTON id=accbutton class=menuButton style=\"margin-left:2px;min-width:35px;max-width:35px;width:35px;max-height:" + g_urqButtonHeight + ";\" onclick=\"log('button=acc');playLinContract(true,1);\"><SPAN id=accButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";display:block:text-align:center;line-height:1em;\">Acc</SPAN></BUTTON>";
						pbutton = "<div style=\"margin-left:2px;margin-top:2px;clear:both;float:left;\">" + bckbutton + "<BUTTON id=linPlay class=\"menuButton\" style=\"min-width:130px;max-height:" + g_urqButtonHeight + ";\"><SPAN id=linPlayButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";display:block:text-align:center;line-height:1em;\">Play: " + curBoard.Contract + tricksOffset + " by " + curBoard.Declarer + "</SPAN></BUTTON>";
						pbutton = pbutton + accbutton + "<BUTTON id=matchContractHelp class=\"menuButton\" style=\"margin-left:2px;min-width:15px;max-width:15px;width:15px;max-height:" + g_urqButtonHeight + ";\"><SPAN id=matchContractHelpButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";display:block:text-align:center;line-height:1em;\">?</SPAN></BUTTON>" + fwdbutton + "<BR><SPAN id=scoreSpan style=\"font-size:" + g_scoreFontSize + ";\">" + score + "</SPAN></div>";
					}
					
					var bidding = "";
					
					if ((typeof curBoard.Bids)!="undefined")
					{
						bidding = showBidding();
					}
						
					document.getElementById("currentPosition").innerHTML = bidding + pbutton;
					
					if (document.getElementById("accbutton")!=null)
						if (document.getElementById("accbutton").style.display=="none") document.getElementById("prevrow").style.marginLeft = "35px";
					
					if ((typeof curBoard.Bids)!="undefined")
					{
						var bids = g_hands.boards[g_lastBindex].Bids;
						
						for (var j=0;j<bids.length;j++)
						{
							var cell = document.getElementById("bidIdx" + j);
							
							if (cell!=null)
							{
								cell.onmouseover = cell.onclick = function(){showBidAlert(this)};
								cell.onmouseout = function(){
									var popup = document.getElementById("popup_box");
									popup.innerHTML = "";
									popup.style.display="none";
									$("#popup_box").finish();
								}
							}
						}
					}
						
					if (pbutton!="")
					{
						document.getElementById("linPlay").onclick = function(){g_showOriginalContract = true;playLinContract();};
						document.getElementById("matchContractHelp").onclick = function(){showHelp(this,"playMatchContractHelp");};
					}
				}
			}

			var declStr = "NSEW";
			var suitStr = "CDHSN";
			
			if (validContract(curBoard.Contract))
			{
				var declIndex = declStr.indexOf(curBoard.Declarer);
				var suitIndex = suitStr.indexOf(curBoard.Contract.charAt(1));
				
				g_defaultContract = 1;
				g_defaultContractIndex = (declIndex * 5) + suitIndex;
			}
		}
		else
		{
			document.getElementById("currentPosition").innerHTML = g_credits;				
		}
	}

	document.getElementById("wvul").style.height = "36px";	// reset height of vulnerability bar in case we have just left play mode
	document.getElementById("northHand").style.height = "";
	document.getElementById("westHand").style.height = "";
	document.getElementById("southHand").style.height = "";
	document.getElementById("makeableContracts").className = "mc";		// Revert to smaller font for makeable contracts table
	
	if (g_session!=0) callddd("q");  // Terminate any double dummy playing g_session that is in progress.
	g_session = 0;
	g_lastBindex = index;
	
	clearCardData();
	
	while (table.rows.length>6)
	{
		table.deleteRow(-1);
	}
	
	var npts,spts,wpts,epts;
	var tindex = index;
	
	if (tindex==-1)
	{
		hide("play");
		$("#board").hide();
	}
	else if (tindex!=-1)tindex
	{
		var north = document.getElementById("northHand");
		var handstr = createHandString(g_hands.boards[tindex],0);
		north.innerHTML = handstr.text;
		north.style.backgroundColor = "#EEEEEE";
		npts = handstr.points;
		
		var east = document.getElementById("eastHand");
		handstr = createHandString(g_hands.boards[tindex],1);
		east.innerHTML = handstr.text;
		east.style.backgroundColor = "#EEEEEE";
		epts = handstr.points;
		
		var south = document.getElementById("southHand");
		handstr = createHandString(g_hands.boards[tindex],2);
		south.innerHTML = handstr.text;
		south.style.backgroundColor = "#EEEEEE";
		spts = handstr.points;
		
		var west = document.getElementById("westHand");
		handstr = createHandString(g_hands.boards[tindex],3);
		west.innerHTML = handstr.text;
		west.style.backgroundColor = "#EEEEEE";
		wpts = handstr.points;
		
		if (g_handEntryMode)
			npts = epts = spts = wpts = "";
		
		var points = document.getElementById("points");
		points.rows[0].cells[1].innerHTML = npts;
		points.rows[1].cells[0].innerHTML = wpts;
		points.rows[1].cells[2].innerHTML = epts;
		points.rows[2].cells[1].innerHTML = spts;

		var dealer = new Array(4);
		dealer['N'] = "North";
		dealer['S'] = "South";
		dealer['W'] = "West";
		dealer['E'] = "East";
		
		document.getElementById("boardNumber").innerHTML = "<SPAN style=\"font-size:" + g_boardNumberFontSize + ";font-weight:normal;\">" + makeBoardNameString(g_hands.boards[g_lastBindex].board) + "</SPAN>";
		
		var vul = g_hands.boards[tindex].Vulnerable;
		var boardDealer = dealer[g_hands.boards[tindex].Dealer];
											  
		document.getElementById("nvul").innerHTML = "";
		document.getElementById("wvul").innerHTML = "";
		document.getElementById("evul").innerHTML = "";
		document.getElementById("svul").innerHTML = "";
		
		setDealerChar(boardDealer,vul);
		
/*		var dealerChar = "<SPAN style=\"font-size:15px;\">&#9679</SPAN>";
											  
		if (boardDealer=="North")
			document.getElementById("nvul").innerHTML = dealerChar;
		else if (boardDealer=="West")
			document.getElementById("wvul").innerHTML = dealerChar;
		else if (boardDealer=="East")
			document.getElementById("evul").innerHTML = dealerChar;
		else if (boardDealer=="South")
			document.getElementById("svul").innerHTML = dealerChar;*/
		
		displayVulnerability(vul,boardDealer);

		redrawMCTable(true);	// Populate makeable contracts table for this board.
				
		updateUpperLeftQuadrant(g_lastBindex);

		document.getElementById("play").onclick = function(){
				if ((document.getElementById("play")).innerHTML == "Stop")
				{
					exitCardPlay();
				}
				else
				{
					if (requestPending()) return;
					
					terminateSession();
	
//					if (g_defaultContract==0)
					{
						var pos = getPosition(this);
						doPopupAt("Tap any of the entries (including blank entries)in the makeable<BR>contracts table at any time to start playing that contract.",pos.x-100,pos.y-100);
						document.getElementById("mctable").className = "shadow";
						setTimeout(function(){document.getElementById("mctable").className = "";},4400); // same timeout as in doPopupAt function
					}
//					else
//					{
//						playLinContract();
//					}
				}
			};
		
		document.getElementById("help").onclick = function()
			{
				hideAllPopups();
				
				if (g_session==0)
					showHelp(this,"commandHelp");
				else
					showHelp(this,"playHelp");
			}
	
		document.getElementById("options").onclick = function()
			{
				hideAllPopups();
				showOptions(this);
			}
	
		document.getElementById("backPlay").onclick = function()
			{
				if (requestPending())
					return;	// Don't allow while there is a request in progress.
				else
					setRequestTimeout(true);		

				hideAllPopups();
				spinner(this);
				callddd("u");  // Take back previous card played	
			}
	
		try {
			document.getElementById("forwardPlay").onclick = function()
				{
					hideAllPopups();
					playNextCard(this);
				}
		} catch (e) {};

		document.getElementById("editHand").onclick = edit;
	}
	
	if (active)
	{
		var board = g_hands.boards[g_lastBindex];
		
/*		if ((typeof g_hands.Title)!="undefined")
			g_title = g_hands.Title;*/
		
		document.getElementById("titleText").innerHTML = g_title;
		
		$("#mainTitle").show();
		
		if ((typeof g_hands.display)=="undefined")
		{
			if ((g_hands.boards[g_lastBindex].DoubleDummyTricks == "********************")|(g_hands.boards[g_lastBindex].DoubleDummyTricks == "--------------------"))
			{
				if (checkBoardValid(g_lastBindex))
				{
					console.log("request issued");
					calculateMakeableSingleBoard(g_lastBindex); // Calculate makeable contracts if not defined
				}
			}
		}
	}
}

function setDealerChar(dir,vul)
{
		var dealerCharWhite = "<SPAN id=dealerChar style=\"font-size:" + g_dealerFontSize + "px;color:white;\">&#9679</SPAN>";
		var dealerCharBlue = "<SPAN id=dealerChar style=\"font-size:" + g_dealerFontSize + "px;color:#0088ff;\">&#9679</SPAN>";
		var dealerChar = dealerCharBlue;

		if (vul=="All")
			dealerChar = dealerCharWhite;
		else if ((vul=="NS")&((dir=="North")|(dir=="South")))
			dealerChar = dealerCharWhite;
		else if ((vul=="EW")&((dir=="East")|(dir=="West")))
			dealerChar = dealerCharWhite;
					
		if (dir=="North")
			document.getElementById("nvul").innerHTML = dealerChar;
		else if (dir=="East")
			document.getElementById("evul").innerHTML = dealerChar;
		else if (dir=="South")
			document.getElementById("svul").innerHTML = dealerChar;
		else if (dir=="West")
			document.getElementById("wvul").innerHTML = dealerChar;
}

function clear()
{
	if (g_handEntryMode!=0)
	{
        clearMakeableOnInputBoard();
		hideAllPopups();
		var bnum = g_hands.boards[g_lastBindex].board;
		g_hands.boards[g_lastBindex] = {"Dealer":"N","Vulnerable":"None","Deal":["...","...","...","..."],"DoubleDummyTricks":"********************"};
		g_hands.boards[g_lastBindex].board = bnum;
		setupHandEntryBoard();
	}
}

function edit()
{
	if (g_handEntryMode==0)
	{
		if (requestPending()) return;
		
		log("button=edit");
		g_edited = 0;
		
		if ((g_hands.boards[g_lastBindex].board.toString().indexOf(".edited")==-1)&((g_test==1)|(g_xml!="")))
		{
			var board = JSON.parse(JSON.stringify(g_hands.boards[g_lastBindex]));
			var bname = g_hands.boards[g_lastBindex].board.toString().replace(".Open","").replace(".Closed","") + ".edited";
			
				// Does edited version already exist ?
			var index = getTindexByName(g_hands.boards,bname);
			
			if (index==-1)
				var index = g_hands.boards.length;
				
			g_hands.boards[index] = board;
			g_hands.boards[index].board = bname;
			gotoTravellerByIndex(index);
		}
	
		g_defaultContract = 0;	// Don't highlight contract played now that hand has been edited.
		delete g_hands.boards[g_lastBindex].Contract;
		delete g_hands.boards[g_lastBindex].Declarer;
		delete g_hands.boards[g_lastBindex].PlayerNames;
		delete g_hands.boards[g_lastBindex].Bids;
		delete g_hands.boards[g_lastBindex].Played;
		
		resetState();
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
		$("#scoreandtraveller").show();
		$("#mainTitle").show();
		hideMenuItems();
		
		if ((g_test!=1)&(g_xml==""))
		{
			show("deleteBoard");
			show("newBoard");
			
			if (g_hands.boards.length>1)
			{
				show("next");
				show("prev");
				show("gotoBoard");
			}
		}
		
		show("editHand");
		show("clearHand");
		show("help");
		
		var table = document.getElementById("board");
		var cell = table.rows[0].cells[2];
		cell.innerHTML = "<SPAN style=\"font-size:18px;color:red;\">Tap on N,S,E,W quadrants<BR>to edit the cards<BR>for that player</SPAN";
		
		setupHandEntryBoard();
		document.getElementById("editHand").innerHTML = "Done";
	}
	else
	{
		exitHandEntryMode();
	}
}

function getCardIndex(card)
{
	if (card=="A")
	{
		return 12;
	}
	else if (card=="K") 
	{
		return 11;
	}
	else if (card=="Q")
	{
		return 10;
	}
	else if (card=="J")
	{
		return 9;
	}
	else if (card=="T")
	{
		return 8;
	}
	else
	{
		return Number(card) - 2;
	}
}

function clearMakeableOnInputBoard()
{
    if (g_edited!=1)
    {
        g_edited = 1;
        g_inputBoard.DoubleDummyTricks = "********************";
        g_inputBoard.OptimumScore = "";
        redrawMCTable(true);
	}
}

function setupHandEntryBoard()
{
	var i,j,k;
	var quadrant = ["northHand","eastHand","southHand","westHand"];
	g_handEntryMode = 1;
	g_inputDir = 0;
	var cards = "";
	
	g_inputBoard = g_hands.boards[g_lastBindex];
	g_cardQuadrant = new Array(4);
	
	var table = document.getElementById("board");
	table.rows[0].cells[0].innerHTML = "<SPAN style=\"font-size:22px;font-weight:bold;\">Board:<BR>" + g_inputBoard.board + "</SPAN>";	
		
	for (i=0;i<4;i++)
	{
		g_cardQuadrant[i] = new Array(13);
		
		for (j=0;j<13;j++)
		{
			g_cardQuadrant[i][j] = 0;
			g_playableCards[i][j] = 1;	// Card available to be allocated to a player
			g_inactiveCards[i][j] = 0;
			g_currentTrickCards[i][j] = 0;
		}
	}

	for (i=0;i<4;i++)	// For each hand
	{
		var cards = g_inputBoard.Deal[i];
		cards = cards.split(".");
		
		for (j=0;j<4;j++)	// For each suit
		{
			var suitCards = cards[j];
			
			for (k=0;k<suitCards.length;k++)
			{
				var index = getCardIndex(suitCards[k]);
				g_cardQuadrant[j][index] = i;
				g_playableCards[j][index] = -1;
			}
		}
	}
	
	$('#popup_box').hide();
	document.getElementById('popup_box').style.display='none';

	initHandEntry();
	processHandEntry();
}

function deselectCurrentDir(index)
{
	var cardIndex = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
	var i,j;
	var cards2 = "";
	
	if (index!=-1)
	{
		for (i=0;i<4;i++)
		{
			for (j=12;j>=0;j--)
			{
				if ((g_playableCards[i][j]==-1)&(g_cardQuadrant[i][j]==g_inputDir))
					cards2 = cards2 + cardIndex[j];
			}
			
			if (i!=3) cards2 = cards2 + ".";
		}
		
		g_inputBoard.Deal[g_inputDir] = cards2;
		
		g_inputDir = -1;
	}
}

function initHandEntry()
{
	var cardStr = "23456789TJQKA";
	var currentCards = g_inputBoard.Deal[g_inputDir].split(".");
	var cards = "";
	var i,j;
	
	for (i=0;i<4;i++)
	{
		for (j=12;j>=0;j--)
		{
			if ((g_playableCards[i][j] != -1)|(g_cardQuadrant[i][j]==g_inputDir))
				cards = cards + cardStr[j];
		}
		
		if (i<3) cards = cards + ".";
	}
	
	g_inputBoard.Deal[g_inputDir] = cards;
	
	processHandEntry();
}

function setVulnerability(vul)
{
    clearMakeableOnInputBoard();
	g_inputBoard.Vulnerable = vul;
	g_inputBoard.OptimumScore = "";
	displayVulnerability(vul,g_inputBoard.Dealer);
}

function setDealer(dealer)
{
    if (g_edited==0) g_edited = 2;   // Indicate Dealer modified (doesn't affect makeable contracts)

    g_inputBoard.Dealer = dealer.charAt(0);
    displayDealer(dealer,g_inputBoard.Vulnerable);
}

function showDeleteConfirmation()
{
    var htmltext;
    var boardNam = g_hands.boards[g_lastBindex].board;

    if (g_hands.boards.length==1)
    {
        htmltext = "<SPAN style=\"font-weight:bold;\">Can't delete only board</SPAN><BR><BR>";
	    htmltext = htmltext + "<BUTTON onclick=\"document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">OK</BUTTON>";
    }
    else
    {
	    htmltext = "<SPAN style=\"font-weight:bold;\">Delete Board " + boardNam +" ?</SPAN><BR><BR>";
	    htmltext = htmltext + "<BUTTON onclick=\"log('button=deleteBoard');deleteBoard();edit();document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">Yes</BUTTON>";
	    htmltext = htmltext + "<BUTTON onclick=\"document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">No</BUTTON>";
	}

	var buttLoc = getPosition(document.getElementById("deleteBoard"));
	doPopupNoTimeout(document.getElementById("deleteBoard"),htmltext,buttLoc.x - 20,buttLoc.y - 100);
}

function newBoard(boardnum)
{
        // Currently not used....
    var i;
	var dealerPattern = "NESW";
	var vulnerabilityPattern = ["None", "NS", "EW", "All", "NS", "EW", "All", "None","EW", "All", "None", "NS", "All", "None", "NS", "EW"];
    var currentBoardName = g_hands.boards[g_lastBindex].board;
    var board = new Object();
    var curTindex = g_lastBindex;
    var idx = 1;

    if (!isNaN(boardnum)) idx = Number(boardnum);

	board.Dealer = dealerPattern.charAt((idx-1) % 4);
	board.Vulnerable = vulnerabilityPattern[(idx-1) % 16];
	board.board = boardnum.toString();
	board.DoubleDummyTricks = "********************";
	board.Deal = new Array();

    clearMakeableOnInputBoard();

	for (i=0;i<4;i++)
	{
	    board.Deal[i] ="...";
	}

	    // Insert the new board at the correct position within the numbered boards.
	var bnum = Number(board.board);

	for (i=0;i<g_hands.boards.length;i++)
	{
	    var cbd = g_hands.boards[i];

	    if (!isNaN(cbd.board))
	    {
	        if (Number(cbd.board)>bnum)
	        {
	            var tmp = new Array();
	            var j;

	            for (j=0;j<i;j++)
	                tmp[j] = g_hands.boards[j];

                tmp[i] = board;

                for (j=i;j<g_hands.boards.length;j++)
                    tmp[j+1] = g_hands.boards[j];

                g_hands.boards = new Array();

                for (j=0;j<tmp.length;j++)
                    g_hands.boards[j] = tmp[j];

                if (curTindex>=i) g_lastBindex++;

	            return;
	        }
	    }
	}

	g_hands.boards[g_hands.boards.length] = board;
}

function deleteBoard()
{
    var i;
    var tmp = new Array();

    if (g_hands.boards.length==1) return;

    clearMakeableOnInputBoard();

    for (i=0;i<g_lastBindex;i++)
        tmp[i] = g_hands.boards[i];

    for (i=g_lastBindex+1;i<g_hands.boards.length;i++)
        tmp[i-1] = g_hands.boards[i];

    g_hands.boards = new Array();

    for (i=0;i<tmp.length;i++)
        g_hands.boards[i] = tmp[i];

    if (g_lastBindex>g_hands.boards.length-1) g_lastBindex = 0;

    quitHandEntryMode();
}

function showDealerKeypad()
{
	var htmltext = "<SPAN style=\"font-weight:bold;\">Select Dealer...</SPAN><BR>";
	var dlr = ["North","East","South","West"];
	var i;
	
	for (i=0;i<4;i++)
	{
		htmltext = htmltext + "<BUTTON onclick=\"setDealer(\'" + dlr[i] + "\');document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">" + dlr[i] + "</BUTTON>";
		htmltext = htmltext + "<BR>";
	}
	
	htmltext = htmltext + "<BR><BUTTON onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</BUTTON>";
	
	var buttLoc = getPosition(document.getElementById("setDealer"));
	doPopupNoTimeout(document.getElementById("setDealer"),htmltext,buttLoc.x - 20,buttLoc.y - 20);
}

function showVulnerabilityKeypad()
{
	var htmltext = "<SPAN style=\"font-weight:bold;\">Select Vulnerability...</SPAN><BR>";
	var vul = ["None","NS","EW","All"];
	var i;
	
	for (i=0;i<4;i++)
	{
		htmltext = htmltext + "<BUTTON onclick=\"setVulnerability(\'" + vul[i] + "\');document.getElementById('popup_box').style.display='none';\" style=\"width:80px;cursor:pointer;font-size:14px;padding:1px;text-align:center\">" + vul[i] + "</BUTTON>";
		htmltext = htmltext + "<BR>";
	}
	
	htmltext = htmltext + "<BR><BUTTON style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</BUTTON>";
	
	var buttLoc = getPosition(document.getElementById("setVul"));
	doPopupNoTimeout(document.getElementById("setVul"),htmltext,buttLoc.x - 20,buttLoc.y - 20);
}

function displayVulnerability(vul,dealer)
{
	var vcolor = "#FF0000";
	var nvcolor = "#00FF00";
	var nscolor,ewcolor;
	
	nscolor = ewcolor = nvcolor;
	
	if (vul=="All")
		nscolor = ewcolor = vcolor;
	else if (vul=="NS")
		nscolor = vcolor;
	else if (vul=="EW")
		ewcolor = vcolor;
	
	document.getElementById("nvul").style.backgroundColor = nscolor;
	document.getElementById("wvul").style.backgroundColor = ewcolor;
	document.getElementById("evul").style.backgroundColor = ewcolor;
	document.getElementById("svul").style.backgroundColor = nscolor;
	displayDealer(dealer,vul);
}

function displayDealer(dealer,vul)
{
        dealer = dealer.charAt(0);

		document.getElementById("nvul").innerHTML = "";
		document.getElementById("wvul").innerHTML = "";
		document.getElementById("evul").innerHTML = "";
		document.getElementById("svul").innerHTML = "";

		if (dealer=="N")
			setDealerChar("North",vul);
		else if (dealer=="W")
			setDealerChar("West",vul);
		else if (dealer=="E")
			setDealerChar("East",vul);
		else if (dealer=="S")
			setDealerChar("South",vul);
}

function processHandEntry()
{
	var north = document.getElementById("northHand");
	var handstr = createHandString(g_inputBoard,0);
	north.innerHTML = handstr.text;
	north.style.backgroundColor = "#EEEEEE";
	npts = handstr.points;
	var east = document.getElementById("eastHand");
	handstr = createHandString(g_inputBoard,1);
	east.innerHTML = handstr.text;
	east.style.backgroundColor = "#EEEEEE";
	epts = handstr.points;
	var south = document.getElementById("southHand");
	handstr = createHandString(g_inputBoard,2);
	south.innerHTML = handstr.text;
	south.style.backgroundColor = "#EEEEEE";
	spts = handstr.points;
	
	var west = document.getElementById("westHand");
	handstr = createHandString(g_inputBoard,3);
	west.innerHTML = handstr.text;
	west.style.backgroundColor = "#EEEEEE";
	wpts = handstr.points;
	
	var points = document.getElementById("points");
	
	points.rows[0].cells[1].innerHTML = "";
	points.rows[1].cells[0].innerHTML = "";
	points.rows[1].cells[2].innerHTML = "";
	points.rows[2].cells[1].innerHTML = "";
	
	var dealer = new Array(4);
	dealer['N'] = "North";
	dealer['S'] = "South";
	dealer['W'] = "West";
	dealer['E'] = "East";
	
	document.getElementById("boardNumber").innerHTML = "<SPAN style=\"font-size:48px;\">" + makeBoardNameString(g_inputBoard.board) + "</SPAN>";
	
	var vul = g_inputBoard.Vulnerable;
	var boardDealer = dealer[g_inputBoard.Dealer];
										  
	document.getElementById("nvul").innerHTML = "";
	document.getElementById("wvul").innerHTML = "";
	document.getElementById("evul").innerHTML = "";
	document.getElementById("svul").innerHTML = "";
	
	var dealerChar = "&#9679";
										  
	if (boardDealer=="North")
		document.getElementById("nvul").innerHTML = dealerChar;
	else if (boardDealer=="West")
		document.getElementById("wvul").innerHTML = dealerChar;
	else if (boardDealer=="East")
		document.getElementById("evul").innerHTML = dealerChar;
	else if (boardDealer=="South")
		document.getElementById("svul").innerHTML = dealerChar;
	
	displayVulnerability(vul,boardDealer);

	var contracts = document.getElementById("makeableContracts");
	var rows = contracts.rows;
	
	var cvector = g_inputBoard.DoubleDummyTricks;
	
	redrawMCTable(true);
	
	if ((g_test==1)|(g_xml!=""))	// Show only Set Vulnerability if travellers are available - can't save the board so no point showing Dealer
		document.getElementById("boardNumber").innerHTML = "<BUTTON id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<BR>Vul</BUTTON>";
	else
	{
		document.getElementById("boardNumber").innerHTML = "<BUTTON id=setDealer class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<BR>Dealer</BUTTON><BR><BUTTON id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<BR>Vul</BUTTON>";
		document.getElementById("setDealer").onclick = showDealerKeypad;
	}
	
	document.getElementById("setVul").onclick = showVulnerabilityKeypad;		
	
	document.getElementById("play").onclick = function(){
//			if (g_defaultContract==0)
			{
				if (!requestPending())
				{
					doPopup(this,"Tap any of the entries (including blank entries)<BR>in the makeable contracts table at any time to start playing that contract.");
					document.getElementById("mctable").className = "shadow";
				}
			}
//		else
//			{
//				playLinContract();
//			}
		};
	
	document.getElementById("help").onclick = function()
		{
			showHelp(this,"editHelp");
		}

	document.getElementById("backPlay").onclick = function()
		{
			hideAllPopups();
			spinner(this);
			callddd("u");  // Take back previous card played	
		}
		
	document.getElementById("editHand").onclick = edit;
	document.getElementById("clearHand").onclick = clear;

	var ptsctl = document.getElementById("ptsctl");
	
	if (ptsctl!==null)
		ptsctl.style.display = "none";
}

function makeBoardNameString(boardName)
{
	boardName = boardName.split(".");
	var result = boardName[0];
	
	if (boardName.length>1) result = result + "<BR><SPAN style=\"font-size:12px;\">" + boardName[1] + "</SPAN>";
	
	return result;
}

function hideMenuItems()
{
	hide("prev");
	hide("showBoards");
	hide("gotoBoard");
	if (document.getElementById("saveLIN")!=null) hide("saveLIN");
	hide("saveBoards");
	hide("backPlay");
	hideForwardPlay();
	hide("play");
	hide("deleteBoard");
	hide("newBoard");
	hide("editHand");
	hide("clearHand");
	hide("options");
	hide("help");
	hide("computeMakeable");
	hide("tools");
	hide("bsession");
	hide("bsessionHelp");
	hide("next");
	hideAllPopups();
	$('#popup_box').hide();
	document.getElementById('popup_box').style.display='none';
}

function showMainMenuItems()
{
//	if ((typeof g_hands.lin)=="undefined")
	if ((g_hands.boards.length>1)|(g_test==1)|(g_xml!=""))
	{
		show("prev");
		show("gotoBoard");
		show("next");

		if (g_file=='')
		{
			show("bsession");
			show("bsessionHelp");
		}
	}

	if ((g_test!=1)&(g_xml==""))
	{
		if ((typeof g_hands.lin)!=="undefined")
			if (document.getElementById("saveLIN")!=null) show("saveLIN");
		
		document.getElementById("saveBoards").innerHTML = "Save";	// **** Remove this assignment when html is no longer cached.
		show("saveBoards");
	}
		
	show("play");
	show("editHand");
	show("options");
	show("computeMakeable");
	show("tools");
}

function checkPlayerNameForTline(name,names)
{
	var namePresent = false;
	
	for (var i=0;i<4;i++)
	{
		if (names[i]==name) return true;
	}
	
	return false;
}

function checkAccsProcessedForName(name)
{
	var keys = Object.keys(g_accTrans[name].transList);
	
	if (keys.length==0)
		return true;
	else
		return false;
}

function allAccsProcessed(name=null)
{
	if (name!==null)
	{
		return checkAccsProcessedForName(name);
	}
	else	// Check if finished for all names
	{
		for (var key in g_accTrans)
		{
			if (!checkAccsProcessedForName(key)) return false;
		}
	}
	
	return true;
}

function accCalcPossibleForBoard(board)
{
	var possible = false;
	
	if (typeof board=="undefined") return false;
	
	if ((typeof board.Played!=="undefined")&(typeof board.PlayerNames!=="undefined"))
		if ((board.Played.length>1))
			return true;

	return false;
}

function accCalcPossible()
{
	var found = false;
	
	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (g_travellers!==null)
		{
			var traveller = getTravellerForBoard(i);
			
			var tlines = traveller.traveller_line;
			
			for (var j=0;j<tlines.length;j++)
			{
				var board = tlines[j].board;
				
				if (accCalcPossibleForBoard(board))
				{
					found = true;
					break;
				}
			}
		}
		else
		{
			var board = g_hands.boards[i];
			
			if (accCalcPossibleForBoard(board))
			{
				found = true;
				break;
			}
		}
		
		if (found) break;
	}
	
	return found;
}

function processAccs(name=null)
{
	for (var key in g_accTrans)
		g_accTrans[key].transList = new Object();
		
	var requestCount = 0;
	showEmptyProgressBar("Calculating accuracy of play for all participants");
	
	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (g_travellers!==null)
		{
			var traveller = getTravellerForBoard(i);
			
			if (traveller==null) continue;
			
			var tlines = traveller.traveller_line;
			
			if ((typeof tlines)!=="undefined")
			{
				for (var j=0;j<tlines.length;j++)
				{
					var accPresent = false;
					
					if (typeof tlines[j].board!=="undefined")
					{
						if (typeof tlines[j].board.acc=="undefined")
						{
							tlines[j].board.acc = [-1,-1,-1,-1];	// Create array to hold results, -1 indicates player didn't play this board (e.g. was Dummy)
						}
						else
						{
							for (var k=0;k<4;k++)
								if (tlines[j].board.acc[k]!==-1)
								{
									accPresent = true;
									break;
								}
						}
						
						if ((!passed(tlines[j]))&(!accPresent)&(accCalcPossibleForBoard(tlines[j].board)))
						{
							makeAccRequest(tlines[j].board,i,j);
							requestCount++;
						}
					}
				}
			}
		}
		else
		{
			var accPresent = false;
			var board = g_hands.boards[i];
			
			if (typeof board.acc=="undefined")
			{
				board.acc = [-1,-1,-1,-1];	// Create array to hold results, -1 indicates player didn't play this board (e.g. was Dummy)
			}
			else
			{
				for (var k=0;k<4;k++)
					if (board.acc[k]!==-1)
					{
						accPresent = true;
						break;
					}
			}
			
			if ((board.Contract!=="Passed")&(!accPresent)&(accCalcPossibleForBoard(board)))
			{
				makeAccRequest(board,i,-1);
				requestCount++;
			}
		}
	}
	
	if (requestCount==0)
	{
		finishBackgroundOperation();
		log('button=showPlayerAccMatrix');
		showPlayerAccMatrix();
	}
}

function makeAccRequest(board,bdindex,tindex)
{			
	var declCHARS = "NSEW";
	var playedCards = "";
	var names;
	
	names = board.PlayerNames;
	
	var context = {"names":names,"declarer":board.Declarer,"dest":1};
	
	var deal = board.Deal;
	var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		// Check number of cards in each hand is the same and greater than zero. Allow for embedded dots in hand strings
	var handlen = deal[0].length;
	var k;
	
	if ((deal[0].length==3)&(deal[1].length==3)&(deal[2].length==3)&(deal[3].length==3))
	{
		var errormsg = "<DIV style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><SPAN style=\"font-size:16px;\">Board empty - nothing to do.</SPAN></DIV>";
		displayError(document.getElementById("makeableContracts"),errormsg);
		return;
	}
	
	for (k=1;k<4;k++)
	{
		if (handlen!=deal[k].length)
		{
			var errormsg = "<DIV style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><SPAN style=\"font-size:16px;\">All hands must start with the same number of cards.</SPAN></DIV>";
			displayError(document.getElementById("makeableContracts"),errormsg);
			return;
		}
	}
	
	if ((typeof board.Played)!="undefined")
	{
		var played = board.Played;
		
		if (played.length>1)
		{
			for (var i=0;i<played.length;i++)
				playedCards = playedCards + played[i];
		}
	}
	
	var leaderChars = "ewsn";	// Declarer is one place to the right of leader
	var leader = leaderChars.charAt(declCHARS.indexOf(board.Declarer));
		
	var msg = new Object();
	msg.request = "a";
	msg.cards = playedCards;
	msg.trumps = board.Contract.charAt(1);
	msg.leader = leader;
	msg.pbn = dealstr;
	
	var context = new Object();
	context.key = makeAccKey(board);
	context.declarer = board.Declarer;
	context.tid = g_bgTrans++;
	context.names = names;
	
	for (var i=0;i<4;i++)
		g_accTrans[names[i]].transList[context.tid]=1;
	
	context.bdindex = bdindex;
	context.tindex = tindex;
	context.request = msg.request;
	context.requestSubType = "b";	// Background request
	msg.context = context;
	
	g_mworkers[g_nextmworker].postMessage(msg);

	g_nextmworker++;
	if (g_nextmworker>=g_mworkers.length) g_nextmworker = 0;
	g_completionTarget++;
}

function makeAccKey(board)
{
	var key = new Object();
	
	key.names = board.PlayerNames;
	key.deal = board.Deal;
	key.trumps = board.Contract.charAt(1);
	key.cards = board.Played;
	
	return JSON.stringify(key);
}

function playContract(declarer,suitChar,contract,auto=false,dest=0)
{			
	if (requestPending())
		return;	// There is still a request outstanding.

	var declCHARS = "NSEW";
	var playedCards = "";
	var names;
	
	hideAllPopups();
	
	if (g_session!=0) callddd("q");	// Terminate any ddd session that is currently in progress
	
	terminateSession();
	exitHandEntryMode();
	
	clearCardData();
	displayHands();
	
	if ((typeof g_hands.boards[g_lastBindex])!="undefined")
		names = g_hands.boards[g_lastBindex].PlayerNames;
	else
	{
		names = new Array();
		names[0] = "S";
		names[1] = "W";
		names[2] = "N";
		names[3] = "E";
	}
	
	var context = {"names":names,"declarer":declarer,"dest":dest};
	
	var deal = g_hands.boards[g_lastBindex].Deal;
	var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		// Check number of cards in each hand is the same and greater than zero. Allow for embedded dots in hand strings
	var handlen = deal[0].length;
	var k;
	
	if ((deal[0].length==3)&(deal[1].length==3)&(deal[2].length==3)&(deal[3].length==3))
	{
		var errormsg = "<DIV style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><SPAN style=\"font-size:16px;\">Board empty - nothing to do.</SPAN></DIV>";
		displayError(document.getElementById("makeableContracts"),errormsg);
		return;
	}
	
	for (k=1;k<4;k++)
	{
		if (handlen!=deal[k].length)
		{
			var errormsg = "<DIV style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><SPAN style=\"font-size:16px;\">All hands must start with the same number of cards.</SPAN></DIV>";
			displayError(document.getElementById("makeableContracts"),errormsg);
			return;
		}
	}
	
	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
	{
		var played = g_hands.boards[g_lastBindex].Played;
		
		if (played.length>1)
		{
			for (var i=0;i<played.length;i++)
				playedCards = playedCards + played[i];
		}
	}
	
	var leaderChars = "ewsn";	// Declarer is one place to the right of leader
	var leader = leaderChars.charAt(declCHARS.indexOf(declarer));
	
	setRequestTimeout();
	
	if (!auto)
	{							
		g_session_declarer = declarer;
		
		if (g_showOriginalContract)
			g_session_contract = contract;
		else
			g_session_contract = "*" + contract.substring(1);
		
		if ((handlen-3)!=13)	// Subtracting 3 is to allow for the dots between suits.
		{
			g_partialHand = 1;
			g_partialHandTotalTricks = handlen-3;	// Subtract 3 to allow for the dots between suits
		}
		else
		{
			g_partialHand = 0;
			g_partialHandTotalTricks = 13;
		}
		
		hideMenuItems();
		show("backPlay");
		showForwardPlay();
		show("options");
		show("play");
		show("help");
	}
	
	var session = new Date().getTime();
	
	g_session = session;
	
	spinner(document.getElementById("makeableContracts").rows[1].cells[0]);
	
	g_leader = leader;
	g_trumps = suitChar;

	if (!auto)
	{
		var dealstr = "W:" + dealstr;
		
		var msg = new Object();
		msg.request = "g";
		msg.pbn = dealstr;
		msg.trumps = g_trumps;
		msg.leader = g_leader;
		msg.requesttoken = g_session;
		msg.sockref = g_session;
		
		var context = new Object();
		context.request = msg.request;
		context.para = "new";
		msg.context = context;
		
		g_worker.postMessage(msg);
	
		document.getElementById("play").innerHTML = "Stop";
	}
	else
	{
		var msg = new Object();
		msg.request = "a";
		msg.cards = playedCards;
		msg.trumps = suitChar;
		msg.leader = leader;
		msg.pbn = dealstr;
		
		var context = new Object();
		context.key =  makeAccKey(g_hands.boards[g_lastBindex]);
		context.declarer = declarer;
		context.names = names;
		context.request = msg.request;
		context.requestSubType = "s";	// Single shot accuracy request for one board
		msg.context = context;
		
		g_worker.postMessage(msg);
	}
}

function failSilently(jqXHR,textStatus,errorThrown)
{
		// Just ignore the error.
		alert("error: " + textStatus);
	resetTimeout();
}

function constructFilename()
{
	if ((typeof g_hands.evid)=="undefined")
		return g_hands.event + "_" + g_hands.club;
	else
		return g_hands.evid;
}

function getFullMakeableJson(context)
{
}

function showEmptyProgressBar(text)
{
	$("#toolsSubMenu").hide();
	document.getElementById("saveBoards").setAttribute("disabled","");
	document.getElementById("editHand").setAttribute("disabled","");

	g_title = "<DIV id=outerProgress style='float:left;width:800px;height:15px;'><DIV id=progress style='float:left;width:0px;height:15px;background-color:#88ff88;text-align:left;color:blue;'>" + text + "</DIV></DIV>";
	document.getElementById("titleText").innerHTML = g_title;
	document.getElementById("outerProgress").width = "800px";
	document.getElementById("progress").width = "0px";
}

function calculateMakeableAllBoards()
{
		// This function is only enabled when makeable contracts are calculated locally, not on the server
	g_allBoards = 1;
	showEmptyProgressBar("Analysing Boards in background");	
	console.log("generating requests for " + g_hands.boards.length + " boards");
	
	for (var i=0;i<g_hands.boards.length;i++)
		g_hands.boards[i].tag = -1;
		
	for (var i=0;i<g_hands.boards.length;i++)
		calculateMakeableSingleBoard(i);
}

function finishBackgroundOperation()
{
	$("#progressDiv").hide();
	document.getElementById("saveBoards").removeAttribute("disabled");
	document.getElementById("editHand").removeAttribute("disabled");
	
	if ((typeof g_hands.Title)!="undefined")
		g_title = g_hands.Title;
	else
		g_title = "&nbsp;";

	document.getElementById("titleText").innerHTML = g_title;
}

function resetAnalyseAllBoards()
{
	g_allBoards = 0;
	finishBackgroundOperation();
}

function completedAnalyseAllBoards()
{
	restartBackgroundWorkers();
	resetAnalyseAllBoards();
}

function cacheMakeable(pindex,data)
{
	var limit = 500;
	var delMax = limit/10;
	
	if (g_db==null) return;
	
	try {
		var board = g_hands.boards[pindex];
		var deal = board.Deal;
		var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		var vul = board.Vulnerable;
		var key = makeDealKey(dealstr,vul,getRequestedLeads(pindex));
		var ddata = new Object();
		ddata.deal = key;
		ddata.time = Date.now();
		ddata.dd = JSON.parse(data);
		const transaction = g_db.transaction(["ddCache"], "readwrite");
		const objectStore = transaction.objectStore("ddCache");
		objectStore.put(ddata);
		
		const myIndex = objectStore.index("time");
		const countRequest = myIndex.count();
		countRequest.onsuccess = function(){
			if (countRequest.result>500)
			{
				var delCount = countRequest.result - 100;
				
					// delete oldest 10 items
				const myIndex = objectStore.index("time");
				
				myIndex.openCursor().onsuccess = function(){
					const cursor = event.target.result;
					if (cursor) {
					  if (delCount>0)
					  {
						  delCount = delCount-1;
						  const key = cursor.value.deal;
						  objectStore.delete(key);
						  cursor.continue();
					  }
					} else {
					  console.log("Oldest records purged from ddCache in indexedDB");
					}
				};
  			}
		};
	} catch (e) {};
}

function calcMCTableIndex(suit,leadDirection)
{
	var suits = "NSHDC";
	var dir = "EWSN";
	
	var index = 5*(dir.indexOf(leadDirection.toUpperCase())) + suits.indexOf(suit.toUpperCase());
	return index;
}

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

function makeableContractRequestsOutstanding()
{
	var mccount = 0;
	
	for (var j=0;j<g_hands.boards.length;j++)
	{
		if (g_hands.boards[j].tag!=null)
			if (g_hands.boards[j].tag!==-1) mccount++;
	}
	
	return mccount;
}

function dddLoadMakeable(data,statusText,jqXHR,bindex)
{
	var vul = ["None","All","NS","EW"];
	var leader = "nesw";
	resetTimeout();
	
	var tmp = data;
	tmp = JSON.parse(tmp);
	
	if (this.hasOwnProperty("pbn"))	// It's from a remote request, fill in the missing fields from context
	{
		tmp.sess.pbn = this.pbn;
		tmp.vul = convertVulStr(this.vul);
	}
	
	for (var i=0;i<g_hands.boards.length;i++)
	{
		var board = g_hands.boards[i];
		var deal = board.Deal;
		var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		
		var found = false;
		
		if (!tmp.sess.hasOwnProperty("pbn"))	// It's a cached value from old version that doesn't have the pbn field (when cached entries time out this clause will no longer be necessary)
		{
			if (g_hands.boards[i].hasOwnProperty("tag")&(tmp.sess.sockref==g_hands.boards[i].tag))
				found = true;							  	
		}
		else if (g_hands.boards[i].hasOwnProperty("tag")&(tmp.sess.sockref==g_hands.boards[i].tag)&(vul[tmp.vul]==board.Vulnerable)&(dealstr==tmp.sess.pbn))
		{
			found = true;
		}
		
		if (found)
		{
			board.DoubleDummyTricks = tmp.sess.ddtricks;
			updateParResults(tmp,i);
			
			if ((typeof tmp.openingLeads)!="undefined")
			{
				g_openingLeadsPresent = true;
				board.openingLeads = tmp.openingLeads;
			}
				
			cacheMakeable(i,data);

			if (i==g_lastBindex) redrawMCTable(true);
			
			if (g_allBoards==1)
			{
				g_hands.boards[i].tag = -1;
				
					// Count requests outstanding
				var mccount = makeableContractRequestsOutstanding();
				
				document.getElementById("progress").style.width = ((800*(g_hands.boards.length-mccount))/g_hands.boards.length).toFixed(0) + "px";
				
				if (mccount==0)
				{
					g_allBoards = 0;
					hideSpinner();
					
					if (!g_playItAgain)
					{
						if (g_sessionMode=="ranking") setupRanking(true);
						else if (g_sessionMode=="scorecard") setupScorecard(true);
						else if (g_sessionMode=="traveller") showComparison();
						else if (g_sessionMode=="check") checkAllContracts();
					}
					
					if (g_openingLeadsPresent)
					{
						var table = document.getElementById("scoring");
						var rows = table.rows;
						rows[1].cells[5+g_ofs].innerHTML = "<select id='ETFMode' name='ETFMode' style='background-color:yellow;'><option value=0>DD Tricks(ETF)</option><option value=1>Adjusted ETF</option></select>";
						document.getElementById("rankingDD").innerHTML = "<select id='rankETFMode' name='rankETFMode' style='background-color:yellow;'><option value=0>Double Dummy</option><option value=1>Lead-Adjusted DD</option></select>";
		
						document.getElementById("ETFMode").onchange = function(){document.getElementById("rankETFMode").value=this.selectedIndex;log("operation=ETFMode:"+this.selectedIndex);setupScorecard(true);};			
						document.getElementById("rankETFMode").onchange = function(){document.getElementById("ETFMode").value=this.selectedIndex;log("operation=rankETFMode:"+this.selectedIndex);setupRanking();};
					}
					
					redrawMCTable(true);
					updateUpperLeftQuadrant(g_lastBindex);
					
					g_fullInfo = true;
					g_backgroundFetchCompleted = true;
					
					completedAnalyseAllBoards();
				}
			}
			else
			{
				hideSpinner();
			}
		}
	}
}

function resetTimeout()
{
	if (g_timeoutID!="")
	{
		clearTimeout(g_timeoutID);
		g_timeoutID = "";
	}
}

function tricksConceded(data)
{
		// Note: The direction index is 0,1,2,3 for N,S,E,W
	var tricksConceded = data.tricksConceded;
	var cardDirection = data.cardDirection;
	
	var errCount = new Array();
	
	for (var i=0;i<4;i++)
		errCount[i] = 0;
		
	for (var i=0;i<tricksConceded.length;i++)
	{
		if (tricksConceded[i]!=0)
			errCount[cardDirection[i]]++;
	}
	
	return errCount;
}

function returnAccCount(acc,direction)
{
	direction = (direction + 2) % 4;
	return acc[direction];
}

function returnName(names,direction,firstNameOnly=true)
{
		// Direction for names array starts with South rather than North
	var namesDirection = (direction + 2) % 4;
	
	if (firstNameOnly)
		return names[namesDirection].split(" ")[0];	// First name only
	else
		return names[namesDirection];
}

function updatePlayerAccCountsFromBoard(board,lindata)
{
	if (typeof board=="undefined") return;
	if (typeof board.acc=="undefined") return;
	
	var acc = board.acc;
	
	var names = board.PlayerNames;
	var declarer = board.Declarer;
	
	if (typeof declarer=="undefined") return;	// could happen if board is edited
	
	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex,false);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex,false);
	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex,false);
	
	var declErrCount = returnAccCount(acc,declIndex);
	var leadErrCount = returnAccCount(acc,leadIndex);
	var partnerErrCount = returnAccCount(acc,leadPartnerIndex);

	updatePlayerAccCounts(declName,"decl",declErrCount,board,lindata);
	updatePlayerAccCounts(leadName,"lead",leadErrCount,board,lindata);
	updatePlayerAccCounts(leadPartnerName,"leadPartner",partnerErrCount,board,lindata);
}

function confirmShowAcc()
{	
	var htmltext = "<SPAN style=\"font-size:16px;\">Player Accuracy Matrix popup window blocked by browser.<BR>Click Proceed to show the window.</SPAN><BR><BR>";
	var i;
	var str = "";

	htmltext = htmltext + "<BR><BUTTON style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';showPlayerAccMatrix();\">Proceed</BUTTON>";
	htmltext = htmltext + "<BUTTON style=\"cursor:pointer;margin-left:20px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</BUTTON>";
	
	hideAllPopups();
	doPopupNoTimeout(document.getElementById("boardNumber"),htmltext,200,100);
}

function showPlayerAccMatrix()
{
	g_playerAcc = new Array();
	
	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (g_travellers!==null)
		{
			var traveller = getTravellerForBoard(i);
			
			if (traveller!==null)
			{
				for (var j=0;j<traveller.traveller_line.length;j++)
				{
					var tline = traveller.traveller_line[j];
					updatePlayerAccCountsFromBoard(tline.board,tline.lindata);
				}
			}
		}
		else
		{
			updatePlayerAccCountsFromBoard(g_hands.boards[i],"");
		}
	}
	
	for (var i=0;i<g_playerAcc.length;i++)
	{
		var pobj = g_playerAcc[i];
		
		pobj.totalErrCount = pobj.declErrCount + pobj.leadErrCount + pobj.leadPartnerErrCount;
		pobj.totalCount = pobj.declCount + pobj.leadCount + pobj.leadPartnerCount;
		
		pobj.ratio = pobj.totalErrCount/pobj.totalCount;
	}
	
	g_playerAcc.sort(function(a,b) {
			if (a.ratio>b.ratio) return 1;
			else if (a.ratio<b.ratio) return -1;
			else return 0;
		});
	
	var str = "";
	
	if ((typeof g_hands.club)!=="undefined")
		str += " - " + g_hands.club;
		
	if ((typeof g_hands.event)!=="undefined")
		str += " " + g_hands.event;
	
		// Make html page
	var html = '<head></head>';
	html += '<body><style type=\"text/css\">.myLink {cursor: pointer;font-weight: normal; color: #000099;}\na { font-weight: bold;}\na:link { color: blue; text-decoration:none }\na:visited { color: blue; text-decoration:none }\na:active { color: blue; text-decoration:none }\na:hover { color: red; text-decoration:none }</style>';
	html += '<h2>Player Accuracy Matrix' + str + '</h2>';
	html += '<button onclick="downloadFile(mydoc(),\'text/html\',\'acc.htm\');">Download</button>';
	html += '<script language=JavaScript>' + downloadFile.toString() + ';function mydoc(){alert("File will be in the Downloads folder");return document.body.outerHTML;};</script>';
	html += '<BUTTON class=menuButton style="margin-left:30px;" onclick="document.getElementById(\'accMatrixHelp\').style.display=\'block\';">Help</BUTTON>';

	html += '<div id="accMatrixHelp" style="width:600px; margin-top:10px; word-wrap:break-word; padding:10px; display:none; border-style:solid; border-width:thin; border-color:#000000; background-color:#FFFFEE">';
	html += '<span style="font-size:16px;">';
	html += "- The player accuracy matrix shows the number of deviations from optimal double dummy play, for each board for each player<BR><BR>";
	html += "- The Avg column shows the average number of deviations per board for each player.<BR><BR>";
	html += "- Rows are sorted by the Avg value (low to high).<BR><BR>";
	html += "- The cells are colour coded - white indicates board not played or player role was dummy, green indicates optimal play, orange indicates one deviation, red indicates two or more deviations<BR><BR>";
	html += "- Clicking on a cell brings up the board in Bridge Solver Online, with the bidding and play data for the relevant player<BR><BR>";
	html += "- The 'Totals Per Board' row shows the total number of deviations from double dummy play for each board (summed over all tables that played the board). Boards with higher totals may be those that are more difficult to play<BR>";

	html += "</span><BR>";
	html += '<BUTTON style="cursor:pointer;" onclick="document.getElementById(\'accMatrixHelp\').style.display=\'none\';">Hide Help</BUTTON>';	
	html += '</div>';
	
	html += '<table cellpadding=2px style="margin-top:10px;border-spacing:0px;">';
	html += "<tr style='background-color:#dddddd;'><th>Name</th><th>Avg</th><th colspan=" + g_hands.boards.length + " style='text-align:center;'>Board Number</th><tr>";
	html += "<tr style='background-color:#dddddd;'><td></td><td></td>";
	
	for (var i=0;i<g_hands.boards.length;i++)
	{
		var str = "" + g_hands.boards[i].board;
		
		if (str.length==1) str = "&nbsp;" + str;
		html += "<td style=\"border-left:1px solid black;border-right:1px solid black;\">" + str + "</td>";
	}
	
	html += "</tr>";
	
	var totals = new Object();
	
	for (var i=0;i<g_hands.boards.length;i++)
	{
		totals[i] = 0;
	}
	
	for (var i=0;i<g_playerAcc.length;i++)
	{
//		alert(g_playerAcc[i].name + " " + g_playerAcc[i].ratio);
		html += "<tr>";
		html += "<td>" + g_playerAcc[i].name + "</td><td>" + g_playerAcc[i].ratio.toFixed(2) + "</td>";

		for (var j=0;j<g_hands.boards.length;j++)
		{
			var board = g_hands.boards[j];
			var bdnum = board.board;
			
			var found = false;
			
			if (typeof g_playerAcc[i].boards[bdnum]!=="undefined")
			{
				found = true;
				
					// Sometimes a file will contain multiple instances of the same board, e.g. a lin file representing a BBO traveller.
					// Check that the player played this particular board instance (N.B. These files will not contain travellers)
				if (g_travellers==null)
				{
					var names = g_hands.boards[j].PlayerNames;
				
					if ((typeof names)!=="undefined")
					{
						found = false;
						
						for (var k=0;k<names.length;k++)
						{
							if (g_playerAcc[i].name==names[k])
							{
								found = true;
								break;
							}
						}
					}
				}
				
				if (found)
				{
					var lindata = g_playerAcc[i].boards[bdnum].lindata;
					var errCount = g_playerAcc[i].boards[bdnum].errCount;
					var bg = "#88ff88";
					
					if (errCount==1)
						bg = "#ffa500";
					else if (errCount>1)
						bg = "#ff0000";
						
					bg = "background-color:" + bg + ";";
					
					errCount = Number(errCount);
					if (errCount==0) errCount = "";
					
					if (!isNaN(errCount)) totals[j] += Number(errCount);
					
					var url = "";
					
					if (g_travellers!==null)
						url = window.location.href + "?lin=" + lindata;
					else
						url = window.location.href + "?jsonlin=" + encodeURIComponent(JSON.stringify(g_hands.boards[j]));				
	
					html += "<td class=myLink style=\"border:1px solid grey;text-align:right;" + bg + "\" onclick=window.open(\'" + url + "\')>" + "<SPAN style=\"color:white;font-weight:bold;\">" + errCount + "</SPAN></td>";
				}
			}
			
			if ((typeof g_playerAcc[i].boards[bdnum]=="undefined")|!found)	// If didn't play this board (or this instance of this board)
			{
				html += "<td style=\"border:1px solid grey;background-color:white;\"></td>";
			}
		}
		
		html += "</tr>";
	}
	
	html += "<tr style='background-color:#dddddd;'><td colspan=2>Totals Per Board</td>";
	
	for (var i=0;i<g_hands.boards.length;i++)
		html += "<td style=\"text-align:right;border:1px solid grey;\">" + totals[i] + "</td>";
	
	html += "</tr>";
	
	html += "</table><body>";
	
	var myWindow = window.open("", "_blank");

	if (myWindow==null)
	{
		confirmShowAcc();
		return;
	}
				
	myWindow.document.write(html);
	myWindow.document.close();
}

function getPlayerAcc(name)
{
	for (var i=0;i<g_playerAcc.length;i++)
	{
		if (name==g_playerAcc[i].name)
			return g_playerAcc[i].ratio.toFixed(2);
	}
	
	return "";
}

function updatePlayerAccCounts(name,role,count,board,lindata)
{
	if (count==-1) return;	// Board was probably passed out, or has no play information
	
	var pobj = g_playerAcc.find(item => item.name === name);
	
	if (pobj==null)
	{
		pobj = new Object();
		pobj.name = name;
		pobj.declErrCount = 0;
		pobj.declCount = 0;
		pobj.leadErrCount = 0;
		pobj.leadCount = 0;
		pobj.leadPartnerErrCount = 0;
		pobj.leadPartnerCount = 0;
		pobj.boards = new Object();
		
		g_playerAcc.push(pobj);
	}
	
	if (role=="decl")
	{
		pobj.declCount++;
		pobj.declErrCount += count;
	}
	else if (role=="lead")
	{
		pobj.leadCount++;
		pobj.leadErrCount += count;
	}
	else if (role=="leadPartner")
	{
		pobj.leadPartnerCount++;
		pobj.leadPartnerErrCount += count;
	}

	var rec = new Object();
	rec.errCount = count;
	rec.lindata = lindata;
	pobj.boards[board.board] = rec;
}

function storeAccInMemory(context,index,count)
{
	var acc = null;
	var bdindex = context.bdindex;
	var board;
	
	if (context.tindex!==-1)
	{
		var traveller = getTravellerForBoard(bdindex);
		var tindex = context.tindex;
		board = traveller.traveller_line[tindex].board;
		acc = board.acc;
	}
	else
	{
		board = g_hands.boards[context.bdindex];
		var acc = board.acc;
	}
	
	var plindex = (index + 2) % 4;
	acc[plindex] = count;
	
	return board;
}

function invoke_buildPage2()
{
	if (g_file!='')	// If a pbn or dlm filename was supplied.
		getHands({callback:buildpage2});
	else
		buildpage2();
}

function openIndexedDB()
{
	if ("indexedDB" in window)
	{
		console.log("indexedDB functionality is available in this browser");
		const request = indexedDB.open('cacheData', 1);
		
		request.onerror = function(event) {
		  console.log("Database error: " + event.target.errorCode);
		};
		
		request.onupgradeneeded = function(event) {
		  g_db = event.target.result;
		  const objectStore = g_db.createObjectStore("ddCache", { keyPath: "deal" });
		  objectStore.createIndex("time", "time", { unique: false });
		  const objectStore2 = g_db.createObjectStore("accCache", { keyPath: "key" });
		  objectStore2.createIndex("time", "time", { unique: false });
		};
		
		request.onsuccess = function(event) {
			g_db = event.target.result;
			invoke_buildPage2();
		}
	}
	else
	{
		console.log("indexedDB functionality is NOT available in this browser");
		invoke_buildPage2();
	}
}

function getDDTricks(msg)
{
	delete msg.pfunc;	// Can't pass cloned object containing function
	
	if (g_mworkers.length>0)
	{
		g_mworkers[g_nextmworker].postMessage(msg);
	
		g_nextmworker++;
		if (g_nextmworker>=g_mworkers.length) g_nextmworker = 0;
	}
	else	// Background workers not currently running
	{
		g_worker.postMessage(msg);
	}
}

function getIndexedDDTricks(msg)
{
	if (g_db==null)
		getDDTricks(msg);
	else
	{
		const transaction = g_db.transaction(["ddCache"], "readwrite");
		const objectStore = transaction.objectStore("ddCache");
		var req = objectStore.get(makeDealKey(msg.dealstr,msg.vulstr,msg.leadstr));
		
		req.onsuccess = function(event){
			if (typeof event.target.result!=="undefined")
			{
				var dataObj = event.target.result;
				dataObj.dd.sess.sockref = this.sockref;
				var data = JSON.stringify(dataObj.dd);
				dddLoadMakeable(data,"","",this.context.bindex);
			}
			else	// get it remotely or calculate locally
			{
				getDDTricks(this);
			}
		}.bind(msg);
	}
}

function startAnalyseAll()
{
	// Generate background requests to calculate makeable contracts for all boards
	log('button=analyseAll');
	restartBackgroundWorkers();
	
	g_bgObj.fn = "analyseAll";		// Will be processed by worker event listener function when background workers have initialised
}

function generateBackgroundAccRequests()
{
	g_bgObj.fn = "processAccs";		// Will be processed by worker event listener function when background workers have initialised
}

function callGetIndexedAcc()
{
		// Revert the current traveller back to g_hands.pair_number/g_hands.direction
	var display = document.getElementById("scoreandtraveller").style.display;
	gotoNextTraveller();
	gotoPrevTraveller();
	if (display=="none") $("#scoreandtraveller").hide();
	getIndexedAcc();
}

function getIndexedAcc()
{
	restartBackgroundWorkers();
	g_completionTarget = 0;
	g_completionCount = 0;

	$("#toolsSubMenu").hide();
	
	if (!accCalcPossible())
	{
		doPopupAt("<DIV style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><SPAN style=\"font-size:16px;\">Can't calculate accuracy of play (boards do not contain a record of the card play sequence)</SPAN></DIV>",200,200);
		return;
	}
	
	if (g_db==null)	// IndexedDB not supported in this browser
	{
		generateBackgroundAccRequests();
	}
	else
	{
		var boards;
		const transaction = g_db.transaction(["accCache"], "readwrite");
		const objectStore = transaction.objectStore("accCache");
		
		if (g_travellers!==null)
			boards = g_travellers.event.board;
		else
			boards = g_hands.boards;
		
		for (var i=0;i<boards.length;i++)
		{
		  var board = boards[i];
		  
		  if (g_travellers!==null)
		  {
			  var tlines = board.traveller_line;
			  
			  for (var j=0;j<tlines.length;j++)
			  {
				  let tline = tlines[j];
				  
				  if (accCalcPossibleForBoard(tline.board))
				  {  
					  var req = objectStore.get(makeAccKey(tline.board));
					  
					  req.onsuccess = function(event){
						  if (typeof event.target.result!=="undefined")
						  {
							this.board.acc = event.target.result.acc;
							g_completionTarget++;
							g_completionCount++;
						  }
						}.bind(tline);
				  }
			  }
		  }
		  else
		  {
				if (accCalcPossibleForBoard(board))
				{
					  var req = objectStore.get(makeAccKey(board));
					  
					  req.onsuccess = function(event){
						  if (typeof event.target.result!=="undefined")
						  {
							this.acc = event.target.result.acc;
							g_completionTarget++;
							g_completionCount++;
						  }
						}.bind(board);
				}
		  }
		}
		
		transaction.oncomplete = function(event) {
			console.log("All acc values retrieved");
			purgeOldEntries();		// Remove old entries from acc cache
			
			generateBackgroundAccRequests();
		};
	}
}

function purgeOldEntries()
{
	if (g_db==null) return;
	
	const transaction = g_db.transaction(["accCache"], "readwrite");
	const objectStore = transaction.objectStore("accCache");
	
	const myIndex = objectStore.index("time");
	const countRequest = myIndex.count();
	countRequest.onsuccess = function(){
		if (countRequest.result>5000)
		{
			var delCount = countRequest.result - 5000;
			
				// delete oldest items
			const myIndex = objectStore.index("time");
			
			myIndex.openCursor().onsuccess = function(){
				const cursor = event.target.result;
				if (cursor) {
				  if (delCount>0)
				  {
					  delCount = delCount-1;
					  const key = cursor.value.key;
					  objectStore.delete(key);
					  cursor.continue();
				  }
				} else {
				  console.log("Old entries purged from accCache in indexedDB");
				}
			};
		}
	};
}

function storeAcc(data,context)
{
	var tmp = data.sess;
	
	var errCount = tricksConceded(tmp);
	var names = context.names;
	var declarer = context.declarer;
	
	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex,false);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex,false);
	
	var leadErrCount = errCount[leadIndex];
		
	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex,false);
	
	var partnerErrCount = errCount[leadPartnerIndex];
	
		// Update the board record (in g_hands.boards, or in traveller if there are any
	storeAccInMemory(context,declIndex,tmp.declErr);
	storeAccInMemory(context,leadIndex,leadErrCount);
	var board = storeAccInMemory(context,leadPartnerIndex,partnerErrCount);
	
	if (g_db!==null)
	{
		const transaction = g_db.transaction(["accCache"], "readwrite");
		const objectStore = transaction.objectStore("accCache");
	
		var data = new Object();
		data.key = makeAccKey(board);
		data.acc = board.acc;
		data.time = Date.now();
		
		var req = objectStore.put(data);
	}
	
	g_completionCount++;
	document.getElementById("progress").style.width = ((800*g_completionCount)/g_completionTarget).toFixed(0) + "px";
}

function returnAccValue(acc,index)
{
	var index = (index + 2) % 4;
	return acc[index];
}

function getCachedAcc(tline)
{
	var board = tline.board;
	var declarer = board.Declarer;
	var direction = "NESW";
	var names = board.PlayerNames;
	
	var acc = tline.board.acc;
	
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex);
	var declErrCount = returnAccValue(acc,declIndex);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex);
	var leadErrCount = returnAccValue(acc,leadIndex);
	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex);
	var partnerErrCount = returnAccValue(acc,leadPartnerIndex);
	
	displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,0,1);
}

function displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,elapsed,dest)
{
	var defErrCount = Number(leadErrCount) + Number(partnerErrCount);
	
	var acc = document.getElementById("accuracy");
	var str = "<DIV style=\"float:left;clear:both;\"><DIV style=\"float:left;\"><SPAN style=\"font-size:24px;\">Accuracy of Play</SPAN></DIV><DIV style=\"float:left;clear:both;margin-top:10px;\"><SPAN style=\"font-size:16px;color:black;\">Number of card play deviations from optimal<BR>double dummy play:</SPAN></DIV>";
	
	var str2 = "<DIV style=\"margin-top:10px;float:left;clear:both;\"><SPAN style=\"font-size:18px;color:blue;\">";
	
	if ((declErrCount==0)&(defErrCount==0))
		str = str + str2 + "Card play was optimal by declarer and defenders</SPAN></DIV>";
		
	if (declErrCount>0)
		str = str + str2 + "Declarer (" + declName + "): " + declErrCount + "</SPAN></DIV>";

	if (defErrCount>0)
	{
		str = str + str2 + "Defenders: " + defErrCount;
		str += "<BR>&nbsp;&nbsp;&nbsp;Lead Defender (" + leadName + "): " + leadErrCount;
		str += "<BR>&nbsp;&nbsp;&nbsp;Partner: (" + leadPartnerName + "): " + partnerErrCount + "</SPAN></DIV>";
	}
	
	str += "</DIV></DIV>";
		
//		str += "<BR>Elapsed time: " + tmp.sess.deltaElapsed + "<BR><BR>";
	
/*		var optCount = 0;
	var subOptCount = 0;
	
	for (var i=0;i<tmp.sess.optimumCount.length;i++)
	{
		if (tmp.sess.cardDirection[i]==0)
		{
			optCount += tmp.sess.optimumCount[i];
			subOptCount += tmp.sess.subOptimumCount[i];
		}
	}
	
	str += " ,optimumCardRatio: " + optCount/(optCount+subOptCount);*/
	
	if (dest==0)
		acc.innerHTML = "<SPAN style=\"font-size:16px;color:blue;\">" + str + "</SPAN>";
	else
	{
		var htmltext = "Accuracy of Play:<BR>Declarer Errors: " + declErrCount + "<BR>" + "Defence Errors: " + defErrCount + "<BR>" + "Elapsed Time: " + elapsed + " seconds";
		htmltext = "</div><BR><BUTTON style=\"cursor:pointer;margin-top:15px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</BUTTON>";
		doPopupNoTimeout(document.getElementById("boardNumber"),"<SPAN style=\"font-size:16px;color:blue;\">" + str + htmltext + "</SPAN>",250,50);
	}
}

function load(data,statusText,jqXHR,ctx)
{
	var context = this;
		// Note: The direction index for Names is 2,3,0,1 for N,E,S,W, but for errCount is 0,1,2,3
	hideSpinner();
	resetTimeout();
	var tmp = data;
	
	tmp = eval("(" + tmp + ")");
	tmp = tmp.sess;
	
	if (load.arguments.length>3)	// being performed locally, not on server
		context = ctx;
	
	var errCount = tricksConceded(tmp);
	
		
	var names = context.names;
	var declarer = context.declarer;
	
	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex);
	var declErrCount = tmp.declErr;
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex);
	
	var leadErrCount = errCount[leadIndex];
		
	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex);
	
	var partnerErrCount = errCount[leadPartnerIndex];
	var elapsed = tmp.deltaElapsed;
	
	displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,elapsed,this.dest);
}

function load2(data,statusText,	jqXHR)
{
	hideSpinner();
	resetTimeout();
	
	var tmp = data;
	tmp = eval("(" + tmp + ")");
	
	var htmltext = "Accuracy of Play:<BR>Declarer Errors: " + tmp.sess.declErr + "<BR>" + "Defence Errors: " + tmp.sess.defErr + "<BR>" + "Elapsed Time: " + tmp.sess.deltaElapsed + " seconds";
	htmltext += "</div><BR><BUTTON style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</BUTTON>";
	doPopupNoTimeout(document.getElementById("boardNumber"),htmltext,250,50);
}

function dddloadfunc(data,statusText,jqXHR,context)
{
		// Process the response from a ddd request
	var ctx = this;
	if (dddloadfunc.arguments.length>3) ctx = context;
	
	hideSpinner();
	resetTimeout();
	
	if (g_mode==1)
	{
		var tmp =data;
		tmp = eval("(" + tmp + ")");
//				alert(tmp.sess.deltaElapsed);
		
		if ((tmp.sess.status<200)&(tmp.sess.status!=0))
		{
			if (tmp.sess.status==14)
			{
				displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Request Timed Out</SPAN>");
				return;
			}
			else
			{
				displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Error: " + tmp.sess.status + "</SPAN>");
				return;
			}
		}
		
		if (ctx.para=="new")
		{
			log("fn=playcontract");
		}
		
		if (ctx.para=="new")	// If it's a new session store the session identifier as the current session
		{
			if (tmp.requesttoken==g_session)	// response holds the correct request token, so update the session number to reflect the global session id allocated by the cgi
				g_session = tmp.sess.sockref;
			else
				return;	// this session was cancelled before this response was received.
		}
		
		if (tmp.sess.sockref!=g_session)	// Don't process this response, this session is no longer current.
			return;
		else
		{
			if (tmp.sess.status==0)
				processPosition(tmp.sess);
			else							// some kind of error detected by ddd
			{
				if (tmp.sess.status==201)	// No lock file, session never existed or timed out
				{
					displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">No active session (expired ?)</SPAN>");
				}
				else if (tmp.sess.status==207)
				{
					displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Cannot go back, no cards played yet</SPAN>");
				}
				else if (tmp.sess.status==208)	// hand finished, all tricks now played
				{
					processPosition(tmp.sess);
				}
				else if (tmp.sess.status==209)
				{
					displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Invalid card in recorded play sequence</SPAN>");
				}
				else if (tmp.sess.status!=202) // Not a 'lock file' busy message
					alert("Error " + tmp.sess.status + "," + tmp.sess.errno + " - " + tmp.sess.errmsg);
			}
		}
	}
}

function playNextCard(pthis)
{
	if (g_showPlay)
	{
		if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		{
			var played = g_hands.boards[g_lastBindex].Played;
			
			if (g_currentPlayIndex<played.length)
			{		
				if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 1))	// still following the actual cards played in the match
				{
					var playedInMatch = played[g_currentPlayIndex];
				
					if (requestPending())
						return;	// Don't allow while there is a request in progress.
					else
						setRequestTimeout(true);
			
					spinner(pthis);
					callddd(playedInMatch.toUpperCase());
				}
				else
				{
					displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Not currently following played sequence</SPAN>");
				}
			}
			else if (g_currentPlayIndex==played.length)
			{
				if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 1))
				{
					displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">No more played cards recorded for this board</SPAN>");
				}
				else
				{
					displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Not currently following played sequence</SPAN>");
				}
			}
			else
			{
				displayError(document.getElementById("boardNumber"),"<SPAN style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">No more played cards recorded for this board</SPAN>");
			}
		}
	}
}

function hideForwardPlay()
{
		// Try/Catch in case using older version of ddummy.htm without this button
	try {
		hide("forwardPlay");
	} catch (err) {};
}

function showForwardPlay()
{
		// Try/Catch in case using older version of ddummy.htm without this button
	try {
			// Only show this button if playing a contract from a BBO lin file
		if (g_showPlay!=0) show("forwardPlay");
	} catch (err) {};
}

function enterPlayMode()
{
	g_mode = 1;	// indicate page is in play g_mode
	show("editHand");
	hide("backPlay");
	hideForwardPlay();
	show("play");
	$("#scorecard").hide();
	show("help");
	
	document.getElementById("makeableContracts").className = "mc_large";
	document.getElementById("traveller").style.width = "800px";
	document.getElementById("northHand").style.height = g_sectionHeight + "px";
	document.getElementById("westHand").style.height = g_sectionHeight + "px";
	document.getElementById("southHand").style.height = g_sectionHeight + "px";
	document.getElementById("wvul").style.height = (g_sectionHeight-40) + "px";	// Increase height of vulnerability bar to match new table height.
	document.getElementById("vul").style.width = g_sectionHeight + "px";	// Increase width of table centre to match new table height.
	
	var contracts = document.getElementById("makeableContracts");
	var rows = contracts.rows;
	
	var cvector = g_hands.boards[g_lastBindex].DoubleDummyTricks;
	var value;
	
	for (i=0;i<4;i++)
	{
		for (j=0;j<5;j++)
		{
			value = rows[1+i].cells[1+4-j].innerHTML;
			
			rows[1+i].cells[1+4-j].className = "myLink";
			rows[1+i].cells[1+4-j].onclick = function(){
				var declCHARS = "NSEW";
				var suitCHARS = "CDHSN";
				var suit = $(this).index() - 1;
				var schars = "cdhsn";
				var suitChar = schars.charAt(suit);
				var contract = "*" + suitCHARS.charAt(suit); // Put '*' in case it's number of tricks in makeable contracts table entry !
				if (suit==4) contract = contract + "T"; // No Trumps
				var declarer = $(this.parentNode).index() - 1;
				
				var indx = (5*($(this.parentNode).index() - 1))+ ($(this).index() - 1);
				
				g_showOriginalContract = false;
				
				if ((g_defaultContract==0)|(indx!=g_defaultContractIndex))
				{
					g_showPlay = 0;
					playContract(declCHARS.charAt(declarer),suitChar,contract);
				}
				else
					playLinContract();
			};
		}
	}
	
	showCredits();
}

function stopPlay()
{
	terminateSession();	// Terminate current playing session if there is one in progress.
	g_mode = 0;			// Not in play mode any more
	
	var contracts = document.getElementById("makeableContracts");
	var rows = contracts.rows;
	
	for (i=0;i<4;i++)
	{
		for (j=0;j<5;j++)
		{
			rows[1+i].cells[1+4-j].className = "mc";
			rows[1+i].cells[1+4-j].onclick = null;
		}
	}
	
	showCredits();
}

function selectQuadrant(index)
{
	if (g_stopPropagation!=0)
	{
		g_stopPropagation = 0;
		return;
	}
	
	if (g_handEntryMode!=0)
	{
		if (index!=g_inputDir)
		{
			deselectCurrentDir(index);
			g_inputDir = index;
			initHandEntry();
			processHandEntry();
		}
	}
}

function calculateMakeableSingleBoard(bindex)
{
	if (!requestPending())
		calculateMakeableContracts(dddLoadMakeable,getRequestedLeads(bindex),bindex);
}

function requestPending()
{
	if (g_timeoutID!="")	// already a request in progress
	{
		return true;
	}

	return false;
}

function checkBoardValid(bindex)
{
	if ((typeof g_hands.boards[bindex].Deal)=="undefined") return false;
	
	var deal = g_hands.boards[bindex].Deal;
	
	if ((deal[0].length!=16)|(deal[1].length!=16)|(deal[2].length!=16)|(deal[3].length!=16))	// Note string length includes embedded dots between the four suits.
	{
		return false;
	}
	
	return true;
}

function makeDealKey(dealstr,vul,leadstr)
{
	var vulArray = ["None","All","NS","EW"];
	var idx = 0;
	
	for (var i=0;i<4;i++)
	{
		if (vulArray[i]==vul)
		{
			idx = i;
			break;
		}
	}
	
	return idx + "." + dealstr + "_" + leadstr;
}

function calculateMakeableContracts(pfunc,pleadstr,bindex)
{
	var i,j,k;
	
	requestStr = "";
	paraStr = "";
	
	var validBoard = true;
	
	var started = 0;
	var vul = "";
	var deal = "";
	
	for (k=bindex;k<g_hands.boards.length;k++)
	{
		validBoard = checkBoardValid(k);
		
		if (validBoard) break;
	}
	
	bindex = k;
	
	if (validBoard)
	{
		var deal = g_hands.boards[bindex].Deal;
		var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
			// Get the makeable contracts for the current board.
		var suitCHARS = "CDHSN";
		var dealerChars = "ewsn";	// Dealer is one place to the right of declarer
		
		vul = g_hands.boards[bindex].Vulnerable;
		if (g_allBoards==0) g_hands.boards[bindex].OptimumScore = "";
		if (bindex==g_lastBindex) updateUpperLeftQuadrant(bindex);
	
		var contracts;
		
		contracts = document.getElementById("makeableContracts");
		
		var rows = contracts.rows;
	
		if (g_allBoards==0)
		{
			g_hands.boards[bindex].DoubleDummyTricks = "********************";
			spinnerNoDelay(document.getElementById("makeableContracts").rows[1].cells[0]);
		}
		
		requestStr = "W:" + dealstr.split("x").join(" ");

			// Clear makeable contracts table.
		if (bindex==g_lastBindex)
			for (j=0;j<5;j++)		// For each trump suit
				for (i=0;i<4;i++)	// For each leader
				{
					rows[1+i].cells[1+j].firstChild.childNodes[0].nodeValue = "*";
				}
	}
	
	if (validBoard)
	{
		var tag = g_mcSession++;
		g_hands.boards[bindex].tag = tag;
		
		var leadstr = "";
		
		if (pleadstr!="")
		{
			if (g_allBoards==0) largeSpinner();
			leadstr = "&leadstr=" + pleadstr;
		}
		
		var notFound = true;
			
		dealstr = "W:" + dealstr;
		
		var context = new Object();
		context.para = "makeable";
		context.bindex = bindex;
		context.request = "m";

		var msg = new Object();
		msg.request = "m";
		msg.dealstr = dealstr;
		msg.leadstr = pleadstr;
		msg.vulstr = vul;
		msg.pfunc = pfunc;
		
		msg.sockref = tag;
		msg.context = context;
		
		getIndexedDDTricks(msg);	// Note: This can be an asynchronous request
	}
	
	if ((!validBoard)&g_allBoards==0)
	{
		var errormsg;
		
		errormsg = "<DIV style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><SPAN style=\"font-size:16px;\">All hands must contain 13 cards before makeable contracts can be calculated.</SPAN></DIV>";

		displayErrorAbsPosition(errormsg,300,250);
	}
	else if ((!validBoard)&(g_allBoards!=0))
	{
		var mccount = makeableContractRequestsOutstanding(); // Count this board as analysed, so that end of sequence can still be detected
		
		if (mccount==0) completedAnalyseAllBoards();
	}
}

function gotoTraveller(name)
{
	terminateSession();
	setupTraveller(getTindexByName(g_hands.boards,name),true);
	enterPlayMode();
	$("#scoreandtraveller").show();
	$("#mainTitle").show();
	$("#allBoards").hide();
	$("#popup_box").hide();
}

function gotoPrevTraveller()
{
	var bindex = getNextOrPrevBindex(false);
	gotoTravellerByIndex(bindex);
}

function gotoNextTraveller()
{
	var bindex = getNextOrPrevBindex(true);
	gotoTravellerByIndex(bindex);
}

function getNextOrPrevBindex(forward)
{
	var tindex = g_lastBindex;
	
	if (forward)
		{if (tindex<g_hands.boards.length-1) tindex++; else tindex = 0;}
	else
		{if (tindex>0) tindex--; else tindex = g_hands.boards.length-1;}
		
	return tindex;
}

function gotoTravellerByIndex(index)
{
	var saveHandEntryMode = g_handEntryMode;
	
	terminateSession();
	setupTraveller(index,true);
	enterPlayMode();
	$("#scoreandtraveller").show();
	$("#mainTitle").show();
	$("#allBoards").hide();
	$("#popup_box").hide();
	
	if (saveHandEntryMode!=0) edit();
}

function doPopupNoTimeout(pelement,htmltext,posx,posy)
{
		// Display popup box containing specified html at location of this element	
	var popup = document.getElementById("popup_box");
	popup.style.top = Number(posy) + "px";
	popup.style.left = Number(posx) + "px";
	popup.style.padding = "10px";
	popup.style.backgroundColor = "#FFFFDD";
	popup.innerHTML = htmltext;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").show();
}

function showBoardKeypad()
{
	var boardThreshold = 36; // Show a scroll bar if more boards than this
	var htmltext = "<SPAN style=\"font-weight:bold;\">Go to Board Number...</SPAN><BR>";
	var i;
	
	if (g_hands.boards.length>boardThreshold) htmltext += "<div style=\"overflow:scroll;max-height:300px;\">";
	
	for (i=0;i<g_hands.boards.length;i++)
	{
		if ((typeof g_hands.boards[i].Deal)!="undefined")
		{
			var board = g_hands.boards[i].board;
			htmltext = htmltext + "<BUTTON onclick=\"log('button=gotoBoard');gotoTravellerByIndex(" + i + ");\" style=\"width:50px;cursor:pointer;font-size:14px;padding:1px;text-align:center\">" + makeBoardNameString(board) + "</BUTTON>";
		}
		
		if ((i%10)==9) htmltext = htmltext + "<BR>";
	}
	
	if (g_hands.boards.length>boardThreshold) htmltext += "</div>";
	
	htmltext = htmltext + "</div><BR><BUTTON style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</BUTTON>";
	
	hideAllPopups();
	doPopupNoTimeout(document.getElementById("gotoBoard"),htmltext,100,50);
}

function showNewBoardSelector()
{
	var htmltext = "<SPAN style=\"font-weight:bold;\">Choose A Number For New Board in range 1 to 99 (numbers in use are not shown)</SPAN><BR><BR>";
	var i;
	var buttonCount = 0;

	for (i=1;i<100;i++)
	{
	    var j;
	    var inUse = false;

	    for (j=0;j<g_hands.boards.length;j++)
	    {
	        if (g_hands.boards[j].board==i) {inUse = true;break;}
	    }

        if (!inUse)
        {
            buttonCount++;
		    htmltext = htmltext + "<BUTTON onclick=\"log('button=newBoard');newBoard(" + i + ");gotoTraveller(\'" + i + "\');terminateSession();edit();\" style=\"width:50px;font-size:14px;padding:1px;text-align:center\">" + i + "</BUTTON>";
        }

		if ((buttonCount%12)==11) htmltext = htmltext + "<BR>";
	}

	htmltext = htmltext + "<BR><BR><BUTTON onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</BUTTON>";

	$("#optionsBox").hide();
	hideHelp();
	doPopupNoTimeout(document.getElementById("newBoard"),htmltext,100,50);
}

function showTravellerKeypad()
{
	var htmltext = "<SPAN style=\"font-weight:bold;\">Go to Board Number...</SPAN><BR>";
	var i;
	var str = "";

	if (g_handEntryMode!=0) str = "edit();";
	
	for (i=0;i<g_hands.boards.length;i++)
	{
		var board = g_hands.boards[i].board.toString();
		htmltext = htmltext + "<BUTTON onclick=\"$('#popup_box').hide();log('button=gototraveller');g_lastBindex = getTindexByName(g_hands.boards,'" + board + "');showComparison();\" style=\"width:50px;cursor:pointer;font-size:14px;padding:1px;text-align:center\">" + makeBoardNameString(board) + "</BUTTON>";
		
		if ((i%10)==9) htmltext = htmltext + "<BR>";
	}
	
	htmltext = htmltext + "<BR><BUTTON style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</BUTTON>";
	
	hideAllPopups();
	doPopupNoTimeout(document.getElementById("gotoBoard"),htmltext,100,50);
}

function initSettings()
{
	if (localStorageSupported())
	{
		if (document.getElementById("mkauto1").checked)
		{
			res = localStorage.getItem("mkauto1");

			if (res!==null)
			{
				document.getElementById("mkauto1").checked = (res==="true");
			}
			else
			{
				document.getElementById("mkauto1").checked = true;
			}
		}
		
		document.getElementById("mkauto1").onclick = document.getElementById("mkautolab1").onclick = function(){localStorage.setItem("mkauto1",document.getElementById("mkauto1").checked);};

		var krck = document.getElementById("krcalc");
		
		if (krck!==null)
		{
			res = localStorage.getItem("krcalc");
			
			if (res!==null)
			{
				if (res=="true")
					krck.checked  = true;
				else
					krck.checked = false;
			}
		}
	}
}

function setOptions(optionsStr)
{
		//*** This function is only called at startup, from buildPage1
	try {
		if (optionsStr!==null)
		{
			var options = eval("(" + optionsStr + ")");
			document.getElementById("nsrad1").checked = options.options.ns[0]==="true";
			document.getElementById("nsrad2").checked = options.options.ns[1]==="true";
			document.getElementById("nsrad3").checked = options.options.ns[2]==="true";
			document.getElementById("ewrad1").checked = options.options.ew[0]==="true";
			document.getElementById("ewrad2").checked = options.options.ew[1]==="true";
			document.getElementById("ewrad3").checked = options.options.ew[2]==="true";
			document.getElementById("mkrad1").checked = options.options.mk[0]==="true";
			document.getElementById("mkrad2").checked = options.options.mk[1]==="true";			
		}
		
		var sel = document.getElementById("honourCardSet");
		
		if (sel!=null)
		{
			if (localStorageSupported())
			{
				var value = localStorage.getItem("honourCardSet");
				if (value!=null) sel.value = value;
			}
		}
	} catch (err) {alert(err);};
}

function getRowFromTraveller(pair,direction)
{
	var i;
	var info = getSessionInfo();
	var singleWinner = info.singleWinner;
	
	var tlines = g_currentTraveller.traveller_line;
	
	
	for (i=0;i<tlines.length;i++)
	{
		var line = tlines[i];
		
		if ((((direction==1)|singleWinner)&(line.ns_pair_number==pair))|(((direction==2)|singleWinner)&(line.ew_pair_number==pair)))
		{
//			alert("getRowFromTraveller: pair/direction/row: " + pair + "/" + direction + "/" + i + " " + JSON.stringify(line)); 
			return i;
		}
	}
	
	return -1;	// Indicates not found in any traveller
}

function getInfoForSimilarContracts(lineIndex,direction)
{
	var i;
	var traveller = g_currentTraveller.traveller_line;
	var curLine = traveller[lineIndex];
	var suit = curLine.contract.charAt(1);
	var declarer = curLine.played_by;
	var level = Number(curLine.contract.charAt(0));
	
	var result = new Object();
	result.totalPairs = traveller.length;
	result.totalThisSuitAndDeclarer = 0;
	result.moreTricks = 0;
	result.sameTricks = 0;
	result.lessTricks = 0;
	result.bidPartScore = 0;
	result.madePartScore = 0;
	result.bidGameScore = 0;
	result.madeGameScore = 0;
	result.bidSmallSlam = 0;
	result.madeSmallSlam = 0;
	result.bidGrandSlam = 0;
	result.madeGrandSlam = 0;
	
	for (i=0;i<traveller.length;i++)
	{
		if (i!=lineIndex)
		{
			var t = traveller[i];
			
			if ((t.contract.charAt(1)==suit)&(declarer==t.played_by))
			{
				result.totalThisSuitAndDeclarer++;
				
				
			}
		}
	}
	
	var playedByPercent = Math.round((100*(result.totalThisSuitAndDeclarer+1))/(result.totalPairs));
	
	var str = "This suit/declarer combination was played at " + result.totalThisSuitAndDeclarer + " of " + result.totalPairs + " other tables (" + playedByPercent + "%).";	
	document.getElementById("comparisonText").innerHTML = document.getElementById("comparisonText").innerHTML + "<span style=\"font-size:12px;\"><BR><BR><p>" + str + "</p></span>";

	return result;
}

function getContractType(contract)
{
	var result = new Object();
	result.ctype = 0;	// assume part score
	result.str = "a part score";
	var minor = "CD";
	var major = "HS";
	var nt = "N";
	var level = Number(contract.charAt(0));
	var suit = contract.charAt(1);
	
	if (level==7)
	{
		result.ctype = 3;
		result.str = "a grand slam";
		return result;
	}
		
	if (level==6) 
	{
		result.ctype = 2;
		result.str = "a small slam";
		return result;
	}
	
	if (((level==5)&(minor.indexOf(suit)!=-1))|((level>=4)&(major.indexOf(suit)!=-1))|((level>=3)&(nt==suit)))
	{
		result.ctype = 1;
		result.str = "game";
		return result;
	}
	
	return result;	// Part Score;
}

function calcScoreForMakeable(suit,tricks,vulnerable)
{
		// N.B This calculates basic score for a non-doubled contract.
	var suits = "CDHSN";
	var score = 0;
	var minor = false;
	var nt = false;
	
	var level = Number(tricks)-6;
	
	if (suits.indexOf(suit)==4)
		nt = true;
	else if (suits.indexOf(suit)<2)
		minor = true;
	
	score = 50;	// Basic score for making contract
	
	if (nt) score = score + 10;
	
	var perTrick = 20;
	
	if (!minor) perTrick = 30;
	
	score = score + level*perTrick;
	
	if ((nt&level>=3)|((!minor)&level>=4)|(minor&(level>=5)))
	{
		if (vulnerable)
			score = score + 450;
		else
			score = score + 250;
			
		if (level==6)
		{
			if (vulnerable)
				score = score + 750;
			else
				score = score + 500;
		}
		else if (level==7)
		{
			if (vulnerable)
				score = score + 1500;
			else
				score = score + 1000;
		}
	}
	
	return score;
}

function getMakeableTricksForContract(index,contract,declarer)
{
	var trickChars = "0123456789ABCD";
	var suits = "NSHDC";
	var decls = "NSEW";
	
	if (!validContract(contract)) return -1;
	
	var suit = suits.indexOf(contract.charAt(1));
	var decl = decls.indexOf(declarer);
	
	if ((typeof g_hands.boards[index].DoubleDummyTricks)=="undefined")
		return -1;
		
	var cvector = g_hands.boards[index].DoubleDummyTricks;
	
	var value = trickChars.indexOf(cvector.charAt((5*decl) + suit).toUpperCase());
	
	if ((value=="-")|(value=="*")) return -1;
	
	return Number(value);
}

function getHighestScoringMakeableContractForDirection(bindex,direction,vulnerable)
{
	var suit = "CDHSN";
	var dir = "NS";
	var score;
	var topscore = 0;
	var result = new Object();
	var contract = "";
	var declarer = "";
	var i,j;
	var tricks;
	var lastSuit=null,lastDeclarer,lastTricks=null;
	
	if (direction==2) dir = "EW";
	
	for (i=0;i<dir.length;i++)
	{
		for (j=0;j<suit.length;j++)
		{
			contract = "1" + suit.charAt(j);
			declarer = dir.charAt(i);
			
				//********** if used would need to modify this to allow for the fact that makeable contracts might not be
				//********** available.
			tricks = getMakeableTricksForContract(bindex,contract,declarer);
			score = calcScoreForMakeable(suit.charAt(j),tricks,vulnerable);		
			
			if (score>topscore)
			{
				topscore = score;
				lastSuit = suit.charAt(j);
				lastDeclarer = declarer;
				lastTricks = tricks;
			}
		}
	}
	
	if (dir.indexOf(lastDeclarer)==0)	// Check whether partner can also make this contract
	{
		tricks = getMakeableTricksForContract(bindex,"1" + lastSuit,dir.charAt(1));
		
		if (tricks==lastTricks) lastDeclarer = dir;
	}
	
	if (lastSuit!=null)
	{
		result.contract = (lastTricks - 6) + lastSuit;
		result.declarer = lastDeclarer;
		return result;
	}
	
	return null;	// No makeable contract possible
}

function drawBoxedBar(value,vmax,width,height,bcolor,leftBorder)
{
	var rbd = "";
	var wth = width + "px";
	var hgt = height + "px";
	var dwth = 0;
	
	if (vmax>0)
		dwth = Math.round((width*value)/vmax);
	else if (leftBorder)
	{
		dwth = 0;
	}
	
	var baseWidth = dwth;
	
	dwth = dwth + "px";
	
	var lbd = "none";
	
	if (leftBorder) lbd = "1px solid grey";
	
	var str = "";
	
//	if (Math.round(baseWidth)>0)
	{
		str = "<div style=\"display:inline-block;background-color:" + bcolor + ";height:" + hgt + ";min-height:" + hgt + ";border-left:" + lbd + ";border-top:1px solid grey;border-bottom:1px solid grey;border-right:1px solid grey;width:" + dwth + ";min-width:" + dwth + ";max-width:" + dwth + ";\">";
		str = str + "</div>";
	}
	
	return str;
}

function drawBar(value,vmax,width,height,gradColor)
{
	var wth = width + "px";
	var hgt = height + "px";
	var dwth = Math.round((width*value)/vmax) + "px";
	
	var color = "blue";
	
	if (gradColor)
		color = makeColor(value/vmax);
		
	var str = "<div style=\"border:1px solid black;min-height:" + hgt + ";height:" + hgt + ";max-height:" + hgt + ";width:" + wth + ";min-width:" + wth + ";max-width:" + wth + ";\">";
	str = str + "<div style=\"background-color:" + color + ";height:100%;min-height:100%;border:none;width:" + dwth + ";min-width:" + dwth + ";max-width:" + dwth + ";\">";
	str = str + "</div></div>";
	
	return str;
}

function computeTravellerStatistics(pdirection)
{
	var i,j;
	var result = new Array();
	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	
	var traveller = g_currentTraveller.traveller_line;
	
	for (i=0;i<traveller.length;i++)
	{
		var found = false;
		var tline = traveller[i];
		
		if (played(tline))
		{
			var contract = tline.contract;
			
			if (!validContract(contract))
			{
				if (passed(tline))
					contract = "Passed";
				else
					contract = "N/A";
			}
			
			for (j=0;j<result.length;j++)
			{
				var cobj = result[j];
				
				if ((cobj.contract==contract)&(cobj.played_by==tline.played_by))
				{
					found = true;
					cobj.tcount++;
					
					var percent;
					
					if (g_scoring!="IMP")
						percent = (100*Number(tline.ns_match_points))/(Number(tline.ns_match_points) + Number(tline.ew_match_points));
					else if (g_eventType!="Teams")
						percent = Number(tline.ns_match_points);
					else
					{
						if (pdirection==1)
							percent = Number(tline.crossImpsNS);
						else
							percent = Number(tline.crossImpsEW);						
					}
						
					if (percent<cobj.minPercent)
						cobj.minPercent = percent;
					else if (percent>cobj.maxPercent)
						cobj.maxPercent = percent;
	
					break;
				}
			}
			
			if (!found)
			{
				var newobj = new Object();
				newobj.contract = contract;
				newobj.played_by = tline.played_by;
				newobj.tcount = 1;
				
				var percent;
				
				if (g_scoring!="IMP")
					percent = (100*Number(tline.ns_match_points))/(Number(tline.ns_match_points) + Number(tline.ew_match_points));
				else if (g_eventType!="Teams")
					percent = Number(tline.ns_match_points);
				else
				{
					if (pdirection==1)
						percent = Number(tline.crossImpsNS);
					else
						percent = Number(tline.crossImpsEW);						
				}
					
				newobj.minPercent = percent;
				newobj.maxPercent = percent;
				result[result.length] = newobj;
			}
		}
	}
	
	var str = "";
	
	result.sort(function(a,b) {
			var suits = "CDHSN";
			var levelb = Number(b.contract.charAt(0));
			var levela = Number(a.contract.charAt(0));
			var suitb = suits.indexOf(b.contract.charAt(1));
			var suita = suits.indexOf(a.contract.charAt(1));
			
			if (levelb>levela) return 1;
			else if (levelb<levela) return -1;
			else if (suitb>suita) return 1;
			else if (suitb<suita) return -1;
			else return 0;
			});
	
	var ctable = document.getElementById("contractTable");
	var tlen = ctable.rows.length;
	
	for (i=0;i<tlen-1;i++)
	{
		ctable.deleteRow(-1);
	}
	
	if (g_scoring!="IMP")
	{
		if (pdirection==1)
			ctable.rows[0].cells[3].innerHTML = "Min/Max NS Percentage";
		else
			ctable.rows[0].cells[3].innerHTML = "Min/Max EW Percentage";
	}
	else
	{
		var tailEnd = "Points";
		
		if (g_eventType=="Teams") tailEnd = "Cross Imps";
		
		if (pdirection==1)
			ctable.rows[0].cells[3].innerHTML = "Min/Max NS " + tailEnd;
		else
			ctable.rows[0].cells[3].innerHTML = "Min/Max EW " + tailEnd;
	}
	
	for (i=0;i<result.length;i++)
	{
		var curobj = result[i];
		percentLo = curobj.minPercent;
		percentHi = curobj.maxPercent;
		
		if (g_scoring!="IMP")
		{
			percentLo = parseFloat(curobj.minPercent).toFixed(0);
			percentHi = parseFloat(curobj.maxPercent).toFixed(0);
		}
		
		if (pdirection==2)
		{
			var tmp = percentLo;
			
			if (g_scoring!="IMP")
			{
				percentLo = 100 - percentHi;
				percentHi = 100 - tmp;
			}
			else if (g_eventType!="Teams")
			{
				percentLo = -percentHi;
				percentHi = -tmp;
			}
		}

		ctable.insertRow(-1);
		var crow = ctable.rows[ctable.rows.length-1];
		
		for (j=0;j<6;j++)
		{
			crow.insertCell(-1);
		}
		
		var cells = crow.cells;
		cells[0].innerHTML = curobj.contract;
		cells[1].innerHTML = curobj.played_by;
		cells[2].innerHTML = curobj.tcount;

		cells[3].innerHTML = drawBar(curobj.tcount,traveller.length,150,15,false);
		
		if (g_scoring!="IMP")
		{
			if (percentHi==percentLo)
				cells[4].innerHTML = percentLo + "%";
			else
				cells[4].innerHTML = percentLo + "-" + percentHi + "%";
		}
		else
		{
			if (percentHi==percentLo)
				cells[4].innerHTML = percentLo;
			else
				cells[4].innerHTML = percentLo + " to " + percentHi;
		}
		
			// Draw the box showing minimum and maximum percentage, or IMPs
		var box1,box2,box3;
		
		if (g_scoring!="IMP")
		{
			box1 = drawBoxedBar(percentLo,percentLo,Math.round(150*percentLo/100),15,"white",true);
			box2 = drawBoxedBar(percentHi-percentLo,percentHi-percentLo,Math.round(150*(percentHi-percentLo)/100),15,"#dddddd",false);
			box3 = drawBoxedBar(100-percentHi,100-percentHi,Math.round(150*(100-percentHi)/100),15,"white",false);
		}
		else
		{
			g_MaxImps = Number(g_maxImps);
			percentLo = Number(percentLo);
			percentHi = Number(percentHi);
			box1 = drawBoxedBar(g_maxImps + percentLo,g_maxImps + percentLo,Math.round(150*(g_maxImps + percentLo)/(2*g_maxImps)),15,"white",true);
			box2 = drawBoxedBar(percentHi-percentLo,percentHi-percentLo,Math.round(150*(percentHi-percentLo)/(2*g_maxImps)),15,"#dddddd",false);
			box3 = drawBoxedBar(g_maxImps-percentHi,g_maxImps-percentHi,Math.round(150*(g_maxImps-percentHi)/(2*g_maxImps)),15,"white",false);
		}
		
		cells[5].style.minWidth = "300px";
		cells[5].style.width = "300px";
		cells[5].innerHTML = box1+box2+box3;
	}
	
	return result;
}

function checkHigherScoringPairs(traveller,prow,direction)
{
	var i,j;
	var result = new Object();
	var dirs = "NSEW";
	var suits = "CDHSN";
	result.playedSameSuit = 0;
	result.moreTricks = 0;
	result.moreTricksAtSameLevel = 0;
	result.bidGame = 0;
	result.bidAndMadeGame = 0;
	result.bidSmallSlam = 0;
	result.bidAndMadeSmallSlam = 0;
	result.bidGrandSlam = 0;
	result.bidAndMadeGrandSlam = 0;
	result.wereDoubled = 0;
	result.madeDoubled = 0;
	result.otherSuit = 0;
	result.defended = 0;
	result.declarer = 0;
	result.bidLowerLevel = 0;
	result.contractType = 0;
	result.matrix = new Array();
	
	for (i=0;i<4;i++)
	{
		result.matrix[i] = new Array();
		
		for (j=0;j<5;j++)
			result.matrix[i][j] = 0;
	}
	
	var ew = "EW";
	var sign = 1;
	
	if (direction==2) sign = -1;
	
	var tline = traveller[prow];
	var score = Number(tline.score);
	var contract = tline.contract;
	var suit = contract.charAt(1);
	var level = Number(contract.charAt(0));
	var tricks = Number(tline.tricks);
	var ourctype = getContractType(contract).ctype;
	
	result.contractType = ourctype;
	
	for (i=0;i<traveller.length;i++)
	{
		var curLine = traveller[i];
		
		if ((i!=prow)&(curLine.ns_pair_number!=""))
		{
				// was suit and direction the same ?
			var curContract = curLine.contract;
			var curSuit = curLine.contract.charAt(1);
			var curLevel = Number(curLine.contract.charAt(0));
			var curTricks = Number(curLine.tricks);
			var curDirection = 1;
			
			result.matrix[dirs.indexOf(curLine.played_by)][suits.indexOf(curSuit)]++;
				
			if (ew.indexOf(curLine.played_by)!=-1)
				curDirection = 2;
				
			if ((direction==curDirection)&(suit==curSuit)) result.playedSameSuit++;
			
			var diff = (Number(curLine.score) - score)*sign;
				
			if (diff>0)		// they did better, why ?
			{
				result.declarer++;
				
				if (direction==curDirection)
				{
					if (suit!=curSuit)	// their contract was in a different suit
						result.otherSuit++;
					else
					{
						if (curTricks>tricks)
							result.moreTricks++;
							
						var cres = getContractType(curContract);
						var ctype = cres.ctype;
						
						if (ctype==ourctype)
						{
							if (curTricks>tricks) result.moreTricksAtSameLevel++;
						}
						else if (ctype>ourctype)
						{
							if (ctype==1)
							{
								result.bidGame++;
								
								if (curTricks>=(curLevel+6)) result.bidAndMadeGame++;
							}
							else if (ctype==2)
							{
								result.bidSmallSlam++;
								
								if (curTricks>=(curLevel+6)) result.bidAndMadeSmallSlam++;
							}
							else
							{
								result.bidGrandSlam++;
								
								if (curTricks>=(curLevel+6)) result.bidAndMadeGrandSlam++;
							}
						}
						else if ((curContract.indexOf("x")!=-1)|(curContract.indexOf("*")!=-1))
						{
							result.wereDoubled++;
								
							if (curTricks>=(curLevel+6)) result.madeDoubled++;
						}
						else if (curTricks<=tricks)
						{
							if (curLevel<level)
								result.bidLowerLevel++;
						}
					}
				}
				else
				{
					result.defended++;
				}
			}
		}
	}
		
//	var result = getHighestScoringMakeableContractForDirection(direction,g_hands.boards[g_lastBindex].Vulnerable);
	
	return result;
}

function makeColor(value)
{
	var r = 64 + Math.round((1-value)*192);
	var g = 64 + Math.round(value*192);
	var diff = g-r;
	
	if (diff<0) diff = -diff;
	
	r = Math.round(r+(192-diff)*r/192);
	g = Math.round(g+(192-diff)*g/192);
	
	var color = "rgb(" + r + "," + g + ",0)";
	return color;
}

function convertAdjustmentToCrossImps(tline,dir)
{
	var nssc1 = tline.score;
	var ewsc1 = tline.score;
	
	if (nssc1.toString().charAt(0)=="A")
	{
		nssc1 = nssc1.toString().substring(1,3);
		ewsc1 = ewsc1.toString().substring(3,5);
	}
	else
	{
		nssc1 = tline.ns_score.toString().replace("%","");
		ewsc1 = ewsc1.ew_score.toString().replace("%","");
	}
	
	var pc = nssc1;
	
	if (dir==2) pc = ewsc1;
	
	var percent = Number(pc);
	percent = (percent - 50)/10;
	return 2*percent;
}

function isValidCrossImps(tline)
{
	var valid = true;
	
	if ((typeof tline.ns_cross_imp_points)!=="undefined")
		if (tline.ns_cross_imp_points==="") valid = false;
		
	return valid;
}

function calculateCrossImps()
{
	var boards = g_travellers.event.board;
	var i;
	
	var pairs = g_travellers.event.participants.pair;
	
	for (i=0;i<pairs.length;i++)
		pairs[i].crossImpsBoardsPlayed = 0;
	
	for (i=0;i<boards.length;i++)
	{
		var tlines = boards[i].traveller_line;
		var j,k;
		
		for (j=0;j<tlines.length;j++)
		{
			var includeBoard = true;
				
			includeBoard = isValidCrossImps(tlines[j]);
					
			if (played(tlines[j]))	// Otherwise this pair didn't play this board.
			{
				var totalNS = 0;
				var totalEW = 0;
				var nplayed = 0;

				if (scoreContainsAdjustment(tlines[j]))
				{
					nplayed++;
					
					totalNS = convertAdjustmentToCrossImps(tlines[j],1);
					totalEW = convertAdjustmentToCrossImps(tlines[j],2);
				}
				else
				{
					var score1 = tlines[j].score;
					
					for (k=0;k<tlines.length;k++)
					{
						if (k!=j)
						{
							if (played(tlines[k]))	// otherwise other pair didn't play board
							{
								if (!scoreContainsAdjustment(tlines[k]))
								{
									nplayed++;
									
									if (includeBoard)
									{
										var score2 = tlines[k].score;
										totalNS = totalNS + convertScoreToImps(score1,score2);
										totalEW = totalEW + convertScoreToImps(score2,score1);
									}
								}
							}
						}
					}
				}
				
				if (nplayed>0)
				{
					var infoNS = getPlayerInfo(tlines[j].ns_pair_number,1);
					var infoEW = getPlayerInfo(tlines[j].ew_pair_number,2);
					var nsIndex = infoNS.pair_index;
					var ewIndex = infoEW.pair_index;
					
					if (includeBoard)
					{
						tlines[j].crossImpsNS = (totalNS/nplayed).toFixed(2);
						tlines[j].crossImpsEW = (totalEW/nplayed).toFixed(2);
					}
					else
					{
						tlines[j].crossImpsNS = "";
						tlines[j].crossImpsEW = "";					
					}
					
					if ((typeof g_travellers.event.participants.pair[nsIndex].boardsPlayed)=="undefined")
					{
						g_travellers.event.participants.pair[nsIndex].boardsPlayed = 0;
						g_travellers.event.participants.pair[nsIndex].totalCrossImps = 0;
					}
					
					if ((typeof g_travellers.event.participants.pair[ewIndex].boardsPlayed)=="undefined")
					{
						g_travellers.event.participants.pair[ewIndex].boardsPlayed = 0;
						g_travellers.event.participants.pair[ewIndex].totalCrossImps = 0;
					}
					
					var nsObj = g_travellers.event.participants.pair[nsIndex];
					var ewObj = g_travellers.event.participants.pair[ewIndex];
					
					nsObj.boardsPlayed++;
					ewObj.boardsPlayed++;

					if (includeBoard)
					{
						nsObj.crossImpsBoardsPlayed++;
						ewObj.crossImpsBoardsPlayed++;
						
						nsObj.totalCrossImps += Number((totalNS/nplayed).toFixed(2));
						ewObj.totalCrossImps += Number((totalEW/nplayed).toFixed(2));
					}
				}
				else
				{
					tlines[j].crossImpsNS = "";
					tlines[j].crossImpsEW = "";					
				}
			}
		}
	}
	
	var pairs = g_travellers.event.participants.pair;
	
	for (i=0;i<pairs.length;i++)
	{
		pairs[i].crossImpsPerBoard = Number(pairs[i].totalCrossImps)/pairs[i].crossImpsBoardsPlayed;
	}
}

function scoreContainsAdjustment(tline)
{
	if ((tline.ns_score.toString().indexOf("%")!=-1)|(tline.ew_score.toString().indexOf("%")!=-1)|(tline.score.toString().indexOf("A")!=-1))
		return true;
	else
		return false;
}

function convertScoreToImps(score1,score2)
{
	var diff = Number(score1) - Number(score2);
	
	var absdiff = diff;
	if (absdiff<0) absdiff = -diff;
	
	var i;
	
	for (i=0;i<g_scoreToImps.length;i++)
	{
		var range = g_scoreToImps[i];
		
		if ((absdiff>=Number(range[0]))&(absdiff<=Number(range[1])))
		{
			if (diff>=0) return Number(range[2]);
			else return -Number(range[2]);
		}
	}
	
	return null;
}

function calculateMaxImps()
{
	if ((typeof g_travellers)!="undefined")
	{
		var travellers = g_travellers.event.board;
		var maxImps = -32767;
		var i,j;
		
		for (i=0;i<g_travellers.event.board.length;i++)
		{
			var board = g_travellers.event.board[i];
			
			for (j=0;j<board.traveller_line.length;j++)
			{
				var tline = board.traveller_line[j];
				var nspts = Number(tline.ns_match_points);
				var ewpts = Number(tline.ew_match_points);
				
				if ((nspts<0)|(ewpts<0)) g_scoring = "IMP";
				
				if (g_eventType!="Teams")
				{
					if (nspts>maxImps) maxImps = nspts;
					if (ewpts>maxImps) maxImps = ewpts;
				}
				else if (Math.abs(tline.crossImpsNS)>maxImps)
				{
					maxImps = Math.abs(tline.crossImpsNS);
				}
				else if (Math.abs(tline.crossImpsEW)>maxImps)
				{
					maxImps = Math.abs(tline.crossImpsEW);
				}
			}
		}
		
		g_maxImps = maxImps;
	}
}

function returnPoints(tline,sign)
{
	var nspts = Number(tline.ns_match_points);
	var ewpts = Number(tline.ew_match_points);
	
	if (g_eventType=="Teams")
	{
		nspts = Number(tline.crossImpsNS);
		ewpts = Number(tline.crossImpsEW);
	}
			
	if (sign==-1) return ewpts;
	else return nspts;
}

function calcPercentage(tline,sign)
{
	var nspts = Number(tline.ns_match_points);
	var ewpts = Number(tline.ew_match_points);
			
	var percent = 100*(nspts/(nspts + ewpts));
			
	if (sign==-1) percent = 100 - percent;
			
	percent = parseFloat(Math.round(percent * 100) / 100).toFixed(0);
	return Number(percent);
}

function showBidAlert(pthis){
		// Show the explanation of the bid
	var id = Number(pthis.id.substring(6));
	var bids = g_hands.boards[g_lastBindex].Bids;
	var msg = bids[id];
	msg = msg.split("|");
	
	if (msg.length>1)
		msg = msg[1];
	
	var popup = document.getElementById("popup_box");
	popup.style.padding = "2px";
	popup.style.backgroundColor = "yellow";
	popup.style.top = ((getPosition(pthis).y) - 20 - $(this).scrollTop()) + "px";
	popup.innerHTML = "<SPAN style='font-weight:bold;'>" + msg + "</span>";
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(4000).fadeOut(100);
	popup.style.left = (getPosition(pthis).x -  $(popup).width())  + "px";
}

function showNames(pthis,dir){
		// Show popup with player names
	if (pthis.innerHTML == "") return;
	var pair = pthis.innerHTML;
	var info = getPlayerInfo(pair,dir);
	var pairs;
	var dirLabel = "N/S";
	
	if (dir==2) dirLabel = "E/W";
	
	if (info.singleWinner)
		dirLabel = "Pair";
		
	var text ="&nbsp;" + info.player1 + " & " + info.player2 + "  " + dirLabel + " " + pair + "&nbsp;";
	
	var popup = document.getElementById("popup_box");
	popup.style.padding = "0px";
	popup.style.top = ((getPosition(pthis).y) - 20 - $(this).scrollTop()) + "px";
	popup.style.left = getPosition(pthis).x  + "px";
	popup.innerHTML = text;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(4000).fadeOut(100);
}

function leadCard(lead)
{
	// lead card can be supplied as, for example, AS, or SA. This function returns the value of
	// the lead card field in the AS format.
	var cards = "23456789TJQKA";
	var suit = "CHDS";
	var pvalue = lead.toUpperCase();
	pvalue = pvalue.replace("10","T");
	
	var validCard = true;
	
	if (pvalue.length!=2)
		return lead;
	else
	{
		var cvalue = pvalue.charAt(0);
		
		if (cards.indexOf(cvalue)==-1)	// Try reversing it to see if it's the other way around.
		{
			var c1 = pvalue.charAt(0);
			var c2 = pvalue.charAt(1);
			
			cvalue = c2;
			
			if (cards.indexOf(cvalue)==-1)	// Not this way either, just return the original
				return pvalue.replace("T","10");
				
			pvalue = c2 + c1;
		}
		
		if (suit.indexOf(pvalue.charAt(1))==-1)
			return pvalue.replace("T","10");
	}

	return pvalue.replace("T","10");
}

function comparePairNumbers(a,b)
{
	if ((!isNaN(a))&(!isNaN(b)))	// The pair numbers are wholly numeric
	{
		a = Number(a);
		b = Number(b);
		if (b<a) return 1;
		else if (b==a) return 0;
		else return -1;
	}
	
	if ((a.indexOf("-")!=-1)|(b.indexOf("-")!=-1))	// Hyphenated pair number for team-player1-player2
	{
		a = a.split("-");
		b = b.split("-");
		
		if (a.length!=b.length) return 0;
		
		var i;
		
		for (i=0;i<a.length;i++)
		{
			if (isNaN(a[i])|isNaN(b[i])) return 0;
			var result = comparePairNumbers(a[i],b[i]);
			if (result!=0) return result;
		}
		
		return 0;
	}
	
		// The pair numbers contain a letter (is it a prefix or a suffix ?)
	if ((b.charAt(0)>'9')|(a.charAt(0)>'9')) // ACBL Score style (prefix letter)
	{	
		if (b.charAt(0)<a.charAt(0)) return 1;
		else if (b.charAt(0)>a.charAt(0)) return -1;
		
		a = a.substring(1);
		b = b.substring(1);
		
		if ((a.length>0)&(b.length>0))
			return comparePairNumbers(a,b);
		else return 0;
	}
	else	// Scorebridge style with prefix letter last.
	{
		if (b.substring(b.length-1)<a.substring(a.length-1)) return 1;
		else if (b.substring(b.length-1)>a.substring(a.length-1)) return -1;
		
		a = a.substring(0,a.length-1);
		b = b.substring(0,b.length-1);
		
		if ((a.length>0)&(b.length>0))
			return comparePairNumbers(a,b);
		else return 0;
	}
}

function getMakeableTricksForLead(pindex,tline)
{
	var ntricks = null;
	
	if ((typeof g_hands.boards[pindex].DoubleDummyTricks)!="undefined")
	{
		if (tline.lead!="")
		{
			var idx = getLeadsIdx(tline.contract,tline.played_by);
			
			if ((typeof g_hands.boards[pindex].openingLeads)!="undefined")
			{
				var leads = g_hands.boards[pindex].openingLeads[idx];
				
				var ltricks;
				
				for (j=0;j<leads.length;j++)
				{
					var cl = leads[j];
					
					if (cl[0].replace("T","10")==leadCard(tline.lead))
					{
						var score = Number(cl[1]);
						ntricks = 13-score;
						break;
					}
				}
			}
		}
	}
	
	return ntricks;
}


function drawMiniHand()
{
	if (checkBoardValid(g_lastBindex)&((typeof g_hands.boards[g_lastBindex].Deal)!="undefined"))
	{
		var minitable = document.getElementById("minihand");
		minitable.rows[1].cells[1].innerHTML = "<span style=\"font-size:20px;\">" + g_hands.boards[g_lastBindex].board + "</span>";
		minitable.rows[1].cells[1].style.textAlign = "center";
		
		var north = createMiniHandString(g_hands.boards[g_lastBindex],0);
		var east = createMiniHandString(g_hands.boards[g_lastBindex],1);
		var south = createMiniHandString(g_hands.boards[g_lastBindex],2);
		var west = createMiniHandString(g_hands.boards[g_lastBindex],3);
		
		var miniPoints = document.getElementById("miniPoints");
		
		if (miniPoints!=null)
		{
			var ptsSpan = "<span style=\"font-size:10px;\">";
		
			miniPoints.rows[0].cells[1].innerHTML = ptsSpan + north.points + "</span>";
			miniPoints.rows[1].cells[0].innerHTML = ptsSpan + west.points + "</span>";
			miniPoints.rows[1].cells[2].innerHTML = ptsSpan + east.points + "</span>";
			miniPoints.rows[2].cells[1].innerHTML = ptsSpan + south.points + "</span>";
		}
		
		document.getElementById("miniNorth").innerHTML = north.text;
		document.getElementById("miniEast").innerHTML = east.text;
		document.getElementById("miniSouth").innerHTML = south.text;
		document.getElementById("miniWest").innerHTML = west.text;
		document.getElementById("miniDlr").innerHTML = "<span style=\"font-size:10px;\">Dlr: " + g_hands.boards[g_lastBindex].Dealer + "<BR>Vul: " + g_hands.boards[g_lastBindex].Vulnerable + "</span>";

		redrawMCTable(false);
		$("#minihand").show();
		$("#miniMakeableContracts").show();
	}
	else
	{
		$("#minihand").hide();
		$("#miniMakeableContracts").hide();
	}
}

function sortTravellerLines(lines,pdirection)
{
	lines.sort(function(a,b) {
			var sign = 1;
	
			if (pdirection==2) sign = -1;
			
			if ((a.contract!=null)&(b.contract!=null))
			{
				var suits = "CDHSN";
				var declarers = "WESN";
				var levelb = Number(b.contract.charAt(0));
				var levela = Number(a.contract.charAt(0));
				var suitb = suits.indexOf(b.contract.charAt(1));
				var suita = suits.indexOf(a.contract.charAt(1));
			}
			
			var mpta = returnPoints(a,sign);
			var mptb = returnPoints(b,sign);
	
			if ((a.contract!=null)&(b.contract!=null))
			{
/*				if (sortBySuit)
				{
					if (suitb>suita) return 1;
					else if (suitb<suita) return -1;
					else if (levelb>levela) return 1;
					else if (levelb<levela) return -1;
				}*/
				if (levelb>levela) return 1;
				else if (levelb<levela) return -1;
				else if (suitb>suita) return 1;
				else if (suitb<suita) return -1;
				else if ((b.contract.indexOf("**")!=-1)&(a.contract.indexOf("**")==-1)) return 1;
				else if ((b.contract.indexOf("**")==-1)&(a.contract.indexOf("**")!=-1)) return -1;
				else if ((b.contract.indexOf("*")!=-1)&(a.contract.indexOf("*")==-1)) return 1;
				else if ((b.contract.indexOf("*")==-1)&(a.contract.indexOf("*")!=-1)) return -1;
				else if ((b.ns_pair_number=="")&(a.ns_pair_number!="")) return 1;	// checking for optimum contract row
				else if ((b.ns_pair_number!="")&(a.ns_pair_number=="")) return -1;	// checking for optimum contract row
				else if (declarers.indexOf(b.played_by)>declarers.indexOf(a.played_by)) return 1;
				else if (declarers.indexOf(a.played_by)>declarers.indexOf(b.played_by)) return -1;
			}
			
			if (mptb>mpta) return 1;
			else if (mptb<mpta) return -1;
			else return comparePairNumbers(a.ns_pair_number,b.ns_pair_number);
			});	
}

function displayTraveller(pdirection)
{
	var table = document.getElementById("travellerTable");
	var rows = table.rows;
	var nrows = rows.length;
	var i;
	var sign = 1;
	var dirstr = "NS";
	
	window.scroll(0,0);
	
	if (g_scoring=="IMP")
	{
		if (g_eventType!="Teams")
			rows[0].cells[5].innerHTML = "Points";
		else
			rows[0].cells[5].innerHTML = "Cross Imps";
	}

	if (pdirection==2)
	{
		sign = -1;
		dirstr = "EW";
	}

	for (i=2;i<nrows;i++)
	{
		table.deleteRow(-1);
	}

	var lines = g_currentTraveller.traveller_line;

	var optimum = g_hands.boards[g_lastBindex].OptimumScore;
	var optscore = "";
	var optcontract = "";

	if ((typeof optimum)!="undefined")
	{
		optimum = optimum.split(";");
		optscore = optimum[1];
		optcontracts = optimum[0].split(",");
		
		var k;
		
		for (k=0;k<optcontracts.length;k++)
		{
			var optcontract = optcontracts[k];
			optcontract = optcontract.split(" ");
			var contract = optcontract[1];
	
			if (contract.indexOf("+")!=-1)	// remove overtricks
			{
				contract = contract.substring(0,2);
			}
	
			if (contract.indexOf("N")!=-1) contract=contract.replace("N","NT");
	
			contract = contract.replace("x","*");
	
			var optdir = optcontract[0];
	
			var ctricks = getMakeableTricksForContract(g_lastBindex,contract,optdir.charAt(0));
	
			var line = new Object();
			line.ns_pair_number = "";
			line.ew_pair_number = "";
			line.contract = contract;
			line.played_by = optdir;
			line.tricks = ctricks;
			line.lead = "";
			line.score = optscore.replace("+","");
	
			lines[lines.length] = line;
		}
	}
	
	sortTravellerLines(lines,pdirection);
	
	var j = 0;

	for (j=0;j<rows[0].cells.length;j++)
		rows[0].cells[j].style.padding = "4px";

	var beige = "#ffffdd";
	var backColor = beige;

	var red = "#ff5555";
	var green = "#55ff55";

	var maxover = 3;	// Maximum number of over/under tricks on this traveller (initially assume 3)

	var validBoard = checkBoardValid(g_lastBindex);
	
	for (i=0;i<lines.length;i++)
	{
		var tline = lines[i];

		var overtricks = 0;
		
		if (validBoard&validContract(tline.contract))
			overtricks = Math.abs(tline.tricks - (6 + (Number(tline.contract.charAt(0)))));

		if (validBoard&((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined"))
		{
			if (validContract(tline.contract))
			{
				var ddovertricks = Math.abs(tline.tricks - getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by));
				if (ddovertricks > maxover) maxover = ddovertricks;
			}
		}
	}

	for (i=0;i<lines.length;i++)
	{
		var tline = lines[i];
		
		if (played(tline))
		{
			table.insertRow(-1);
			var row = rows[rows.length-1];
			
			var m;
			
			for (m=0;m<14;m++)
				row.insertCell(-1);
	
			row.cells[0].innerHTML = tline.ns_pair_number;
			row.cells[0].onclick = row.cells[0].onmouseover = function(){showNames(this,1);};
			row.cells[0].onmouseout = function(){
					var popup = document.getElementById("popup_box");
					popup.innerHTML = "";
					popup.style.display="none";
					$("#popup_box").finish();
				}
			row.cells[0].style.textAlign="right";
			row.cells[0].className = "myLink";
	
			if ((sign==1)&(tline.ns_pair_number==g_hands.pair_number))
				row.cells[0].style.backgroundColor = "#bbbbff";
	
			row.cells[1].innerHTML = tline.ew_pair_number;
			row.cells[1].onclick = row.cells[1].onmouseover = function(){showNames(this,2);};
			row.cells[1].onmouseout = function(){
					var popup = document.getElementById("popup_box");
					popup.innerHTML = "";
					popup.style.display="none";
					$("#popup_box").finish();
				}
			row.cells[1].style.textAlign="right";
			row.cells[1].className = "myLink";
	
			if ((sign==-1)&(tline.ew_pair_number==g_hands.pair_number))
				row.cells[1].style.backgroundColor = "#bbbbff";
	
			if (validContract(tline.contract))
			{
				row.cells[2].innerHTML = tline.contract;
			}
			else
			{
				if (passed(tline))
					row.cells[2].innerHTML = "Passed";
				else
					row.cells[2].innerHTML = "N/A";
			}
	
			if (i!=0)
			{
				if (row.cells[2].innerHTML!=rows[i+1].cells[2].innerHTML)
					if (backColor == beige)
						backColor = "#eeeeee";
					else
						backColor = beige;
			}
	
			if (validContract(tline.contract))
			{
				row.cells[3].innerHTML = tline.played_by;
				row.cells[4].innerHTML = leadCard(tline.lead);
				row.cells[5].innerHTML = tline.tricks;
				row.cells[5].style.textAlign="right";
				
				var overtricks = tline.tricks - (6 + (Number(tline.contract.charAt(0))));
				
				var overtstr = overtricks;
				
				if (overtricks==0) overtstr = "=";
				else if (overtricks>0) overtstr = "+" + overtricks;
				
				row.cells[6].innerHTML = overtstr;
				row.cells[6].style.textAlign="right";
		
				var colorplus  = green;
				var colorminus = red;
		
				if ((sign == 1)&((tline.played_by=="W")|(tline.played_by=="E")))
				{
					colorplus = red;
					colorminus = green;
				}
				else if ((sign == -1)&((tline.played_by=="N")|(tline.played_by=="S")))
				{
					colorplus = red;
					colorminus = green;
				}
		
				if (validBoard&((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined"))
				{
					row.cells[7].innerHTML = getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by);
					row.cells[7].style.textAlign="right";
					
					var relDDLead = "";
					
					if (tline.lead!="")
					{
						if ((typeof g_hands.boards[g_lastBindex].openingLeads)!="undefined")
						{
							var idx = getLeadsIdx(tline.contract,tline.played_by);
							var leads = g_hands.boards[g_lastBindex].openingLeads[idx];
							
							var ltricks;
							
							var validLeadCard = false;
							
							for (j=0;j<leads.length;j++)
							{
								var cl = leads[j];
	
								
								if (cl[0].replace("T","10")==leadCard(tline.lead))
	
	
								{
									validLeadCard = true;
									var score = Number(cl[1]);
									
									if ((13-score)!=getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by))
									{
										row.cells[7].innerHTML = (13-score) + "(" + getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by) + ")";
										row.cells[4].style.backgroundColor = colorplus;
										relDDLead = tline.tricks - (13-score);
										if (relDDLead==0) relDDLead = "=";
										else if (relDDLead>0) relDDLead = "+" + relDDLead;
										break;
									}
								}
							}
							
							if (!validLeadCard) row.cells[4].style.backgroundColor = "#888888";	
						}
					}
			
					var relDD = tline.tricks - getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by);
					
					var relDDStr = "" + relDD;
					
					if (relDD==0) relDDStr = "=";
					else if (relDD>0) relDDStr = "+" + relDDStr;
					
					if (relDDLead!="") relDDStr = relDDLead + "(" + relDDStr + ")";
		
					row.cells[8].innerHTML = relDDStr;
					row.cells[8].style.textAlign="right";
			
					var ddoverplus,ddoverminus;
			
					if (relDD>0)
					{
						ddoverplus = relDD;
						ddoverminus = 0;
					}
					else if (relDD<0)
					{
						ddoverminus = -relDD;
						ddoverplus = 0;
					}
					else
					{
						ddoverplus = ddoverminus = 0;
					}
			
					var width = Math.round((ddoverminus*13)/maxover);
					width = width + "px";
					var pbar = "<div style=\"float:left;align:left;width:13px;min-width;13px;max-width:13px;height:16px;border:none;background-color:" + backColor + ";\"><div style=\"float:right;position:absolute:top:0px;right:80px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
					pbar = pbar + ";background-color:" + colorminus + ";\"></div></div>";
			
					var width = Math.round((ddoverplus*13)/maxover);
					width = width + "px";
					var pbar2 = "<div style=\"float:left;width:13px;min-width;13px;max-width:13px;height:16px;border:none;border-left:0px;background-color:" + backColor + ";\"><div style=\"float:left;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
					pbar2 = pbar2 + ";background-color:" + colorplus + ";\"></div></div>";
			
					row.cells[9].style.minWidth = "30px";
					row.cells[9].innerHTML = pbar+pbar2;
				}
			}
	
			row.cells[10].innerHTML = tline.score;
			row.cells[10].style.textAlign="right";
	
			if (tline.ns_pair_number!="")
			{
				var percentNS,percentEW;
				
				if (g_scoring!="IMP")
				{
					percentNS = calcPercentage(tline,1);
					percentEW = 100 - percentNS;
				}
				else
				{
					if (g_eventType!="Teams")
					{
						if (tline.ns_match_points>0)
						{
							percentNS = 100*(tline.ns_match_points/g_maxImps);
							percentEW = 0;
						}
						else
						{
							percentNS = 0;
							percentEW = 100*(tline.ew_match_points/g_maxImps);
						}
					}
					else	// It's a Teams event, so show calculated cross Imp scores
					{
						percentNS = 100*(tline.crossImpsNS/g_maxImps);
						percentEW = 100*(tline.crossImpsEW/g_maxImps);							
					}
				}
		
				if (g_scoring!="IMP") row.cells[11].innerHTML = percentNS + "%";
				else if (g_eventType!="Teams")
					row.cells[11].innerHTML = tline.ns_match_points;
				else
				{
					row.cells[11].innerHTML = tline.crossImpsNS;		
				}
				
				row.cells[11].style.textAlign="right";
		
				var colorNS  = green;
				var colorEW = red;
		
				if (sign == -1)
				{
					colorNS = red;
					colorEW = green;
				}
		
				var width = Math.round((percentNS*50)/100);
				width = width + "px";
				var pbar = "<div style=\"float:left;align:left;width:50px;min-width;50px;max-width:50px;height:16px;border:none;background-color:" + backColor + ";\"><div style=\"float:right;position:absolute:top:0px;right:80px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
				pbar = pbar + ";background-color:" + colorNS + ";\"></div></div>";
		
				var width = Math.round((percentEW*50)/100);
				width = width + "px";
				var pbar2 = "<div style=\"float:left;width:50px;min-width;50px;max-width:50px;height:16px;border:none;border-left:0px;background-color:" + backColor + ";\"><div style=\"float:left;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
				pbar2 = pbar2 + ";background-color:" + colorEW + ";\"></div></div>";
		
				row.cells[12].style.minWidth = "104px";
				row.cells[12].innerHTML = pbar+pbar2;
		
				if (g_scoring!="IMP") row.cells[13].innerHTML = percentEW + "%";
				else if (g_eventType!="Teams")
					row.cells[13].innerHTML = tline.ew_match_points;
				else
				{
					row.cells[13].innerHTML = (tline.crossImpsEW);					
				}
				
				row.cells[13].style.textAlign="right";
			}
			else
			{
				row.cells[11].colSpan=3;
				row.cells[11].style.textAlign = "center";
				row.cells[11].innerHTML = "--- Optimum Contract ---";
				row.deleteCell(13);
				row.deleteCell(12);
			}
	
			row.style.backgroundColor = backColor;
	
			for (j=0;j<row.cells.length;j++)
			{
				row.cells[j].style.padding = "4px";
	
				if (row.cells[0].innerHTML=="")
				{
					row.cells[j].style.borderTop = row.cells[j].style.borderBottom = "1px solid black";
				}
			}
		}
	}
	
	for (i=lines.length-1;i>=0;i--)
	{
		tline = lines[i];
		
		if (tline.ns_pair_number=="")
		{
			lines.remove(i);	// Utilising locally defined Array.remove function
		}
	}
	
	computeTravellerStatistics(pdirection);
	
	drawMiniHand();
}

function compareScores(tlines,ourscore,pdirection)
{
	var res = new Object();
	res.adjusted = 0;
	res.lower = 0;
	res.higher = 0;
	res.same = 0;
	var sign = 1;
	var i;
	
	if (ourscore.toString().indexOf("A")!=-1)
	{
		res.adjusted++;
		return res;
	}

	if (pdirection==2) sign = -1;

	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];
		
		if (played(tline))
		{
			var score = tline.score;
			var diff = sign*(score-ourscore);
	
			if (diff>0) res.higher++;
			else if (diff<0) res.lower++;
			else res.same++;
		}
	}

	res.same--;	// Deduct one for our own traveller line.

	return res;
}

function getPairObject(pair,direction,rankNS,rankEW)
{
	var sessInfo = getSessionInfo();
	var i;
	
	if ((direction==1)|sessInfo.singleWinner)
	{
		for (i=0;i<rankNS.length;i++)
			if (rankNS[i].pair==pair) return rankNS[i];
	}
	
	if (direction==2)
	{
		for (i=0;i<rankEW.length;i++)
			if (rankEW[i].pair==pair) return rankEW[i];
	}
	
	return null;
}

function checkForUniquePairNumbers()
{
		// N.B This function should only be called for Teams events
		
	var pairs = g_travellers.event.participants.pair;
	
	if (g_uniquePairNumbers==="")
	{	
		var singleWinner = true;	// By default assume pair numbers are unique
		
			// Check whether pair numbers are unique
		var checkKeys = new Array();
		
		for (i=0;i<pairs.length;i++)
			if (typeof checkKeys[pairs[i].pair_number] === 'undefined')
			{
				checkKeys[pairs[i].pair_number] = 1;
			}
			else
			{
				singleWinner = false;
				break;
			}
			
			// If pair numbers are unique across NS&EW make sure the directions in the pairs array are all recorded as "N"
			// (because the code relies on the fact that for single winner events all pair numbers are recorded as direction "N" in the json file)
		if (singleWinner)
			for (i=0;i<pairs[i].length;i++)
				pairs[i].direction = "N";
				
		g_uniquePairNumbers = singleWinner;
	}
	else
		singleWinner = g_uniquePairNumbers;
			
	return singleWinner;
}

function getSessionInfo()
{
	if (g_sessInfo!=null) return g_sessInfo;
	
		// Return number of NS pairs, number of EW pairs, and single winner indicator (in which case all pairs are designated NS)
	var sessInfo = new Object();
	var i;
	var singleWinner = false;
	
	var evtype = g_travellers.event.event_type;
	
	if ((evtype.toUpperCase()=="TEAMS")|(evtype.toUpperCase()=="SWISS_TEAMS"))
		g_eventType = "Teams";
	else
		g_eventType = "Pairs";
	
	var pairs = g_travellers.event.participants.pair;
	
		// For Teams, treat as a two winner event, because there are two pairs with the same number
	if ((g_travellers.event.winner_type==1)&(g_eventType!="Teams"))
		singleWinner = true;
	else if (g_eventType=="Teams")
	{
			// For teams we use same code as for 2 winner or single winner pairs events depending whether or not
			// the pair numbers are unique across NS and EW. In either case we produce a single cross imps ranking list
			// even if pairs always play in the same direction.
		singleWinner = checkForUniquePairNumbers();
	}
		
	var percentPresent = false;
	
	for (i=0;i<pairs.length;i++)
	{
		if (pairs[i].percentage!="")
		{
			if (pairs[i].percentage.charAt(0)=="-")	// Heuristic to cope with Scorebridge
			{
				g_scoring = "IMP";
				percentPresent = false;
				break;
			}
			else
				percentPresent = true;	// Carry on with the loop in case a negative "percentage" is encoutered.
		}
	}
	
	g_validPercentageFields = percentPresent;
	
	if (g_validPercentageFields)
		g_scoring = "MatchPoints";
	else
	{
		if (g_eventType!="Teams")	// If Teams, defer until cross-imps have been calculated
			calculateMaxImps();
		
		if (g_scoring!="IMP")
			g_scoring = "VP";
	}
	
	sessInfo.singleWinner = singleWinner;
	
	g_sessInfo = sessInfo;
	return sessInfo;
}

function addRankPositions(data)
{
	var i;
	
	for (i=0;i<data.length;i++)
	{
		data[i].samePosition = "";
	}
	
	var sameCount = 0;
	var ximpsPos = 1;

	for (i=0;i<data.length;i++)
	{
		if (i==0) data[i].crossImpsPosition = ximpsPos;
		
		if (i>0)
		{
			if (g_eventType!="Teams")
			{
				if (data[i].position==data[i-1].position)
				{
					data[i].samePosition = "=";
					data[i-1].samePosition = "=";
				}
			}
			else
			{
				if (data[i].boardsPlayed>0)
				{
					if (Number(data[i].crossImpsPerBoard.toFixed(2))==Number(data[i-1].crossImpsPerBoard).toFixed(2))
					{
						data[i].crossImpsPosition = ximpsPos;
						data[i].samePosition = "=";
						data[i-1].samePosition = "=";
						sameCount++;
					}
					else
					{
						ximpsPos += 1 + sameCount;
						data[i].crossImpsPosition = ximpsPos;
						sameCount = 0;
					}
				}
			}
		}
	}
}

function comparePositions(a,b)
{
	if (isNaN(a)&!isNaN(b)) return 1;
	if (isNaN(b)&!isNaN(a)) return -1;
	if (isNaN(a)&isNaN(b)) return 0;
	a = Number(a);
	b = Number(b);
	if (a>b) return 1;
	else if (a<b) return -1;
	else return 0;
}

function sortRanking(orderByRank)
{
		// This function sorts entries either by position in ranking, or by pair number order.
	if (g_rankInfo==null) return;
	
	if (orderByRank) // sort by position
	{
		if (g_eventType!="Teams")
		{
			g_rankInfo.rankNS.sort(function(a,b){
						return comparePositions(a.position,b.position);
				});
			
			g_rankInfo.rankEW.sort(function(a,b){
						return comparePositions(a.position,b.position);
				});
		}
		else		
		{
			g_rankInfo.rankNS.sort(function(a,b){
						if (b.crossImpsPerBoard>a.crossImpsPerBoard) return 1;
						else if (b.crossImpsPerBoard<a.crossImpsPerBoard) return -1;
						else return 0;
				});
			
			g_rankInfo.rankEW.sort(function(a,b){
						if (b.crossImpsPerBoard>a.crossImpsPerBoard) return 1;
						else if (b.crossImpsPerBoard<a.crossImpsPerBoard) return -1;
						else return 0;
				});
			
			g_rankInfo.rankCombined.sort(function(a,b){
						if (b.crossImpsPerBoard>a.crossImpsPerBoard) return 1;
						else if (b.crossImpsPerBoard<a.crossImpsPerBoard) return -1;
						else return 0;
				});
		}
	}
	else	// sort by pair number
	{
		g_rankInfo.rankNS.sort(function(a,b){
					return comparePairNumbers(a.pair,b.pair);
			});
		
		g_rankInfo.rankEW.sort(function(a,b){
					return comparePairNumbers(a.pair,b.pair);
			});

		g_rankInfo.rankCombined.sort(function(a,b){
					return comparePairNumbers(a.pair,b.pair);
			});
	}
}

function getRankingInfo()
{
	if (g_rankInfo!=null)
		return g_rankInfo;
		
	var sessInfo = getSessionInfo();
	
	var pairs = g_travellers.event.participants.pair;
	
	var rankNS = new Array();
	var rankEW = new Array();
	var rankCombined = new Array();		// Used for Teams event re-scored as Cross Imps
	
	var i,j;
	var maxPlayed = 0;	// Max boards played by any pair.
	
	for (i=0;i<pairs.length;i++)
	{
		var pair = pairs[i].pair_number;
		
		if ((pair!="")&(pair!=null))
		{
			var data = new Object();
			
			data.plusMpts =0;
			data.minusMpts = 0;
			
			if ((typeof pairs[i].totalCrossImps)!="undefined")
			{
				data.totalCrossImps = Number(pairs[i].totalCrossImps);
				data.crossImpsPerBoard = pairs[i].crossImpsPerBoard;
			}
				
			data.boardsPlayed = 0;
			data.crossImpsBoardsPlayed = pairs[i].crossImpsBoardsPlayed;	// In a Teams event, sometimes some boards are excluded from cross-imps calculations
			data.pair = pairs[i].pair_number;
			
			try {
				var cpos = Number((pairs[i].place + "").replace(/\=/g,""));	// Position in Ranking Table
				data.position = cpos;
			} catch (e) {};
			
			data.percentage = pairs[i].percentage;
			data.total_score = pairs[i].total_score;
			
			if ((pairs[i].direction)=="N")
				data.direction = 1;
			else
				data.direction = 2;
				
			data.dd = new Object();
			
			if ((pairs[i].direction=="N")|sessInfo.singleWinner)
				rankNS[rankNS.length] = data;
			else
				rankEW[rankEW.length] = data;
		}
	}

	for (i=0;i<g_travellers.event.board.length;i++)
	{
		var tlines = g_travellers.event.board[i].traveller_line;
		
		for (j=0;j<tlines.length;j++)
		{
			var tline = tlines[j];
			var pairNS = tline.ns_pair_number;
			var pairEW = tline.ew_pair_number;
			
			if (played(tline))
			{
					// Note nsObj and ewObj will both be from rankNS array if singleWinner event
				var nsObj = getPairObject(pairNS,1,rankNS,rankEW);
				var ewObj = getPairObject(pairEW,2,rankNS,rankEW);
				
				if ((nsObj!=null)&(ewObj!=null))
				{
					nsObj.plusMpts += Number(tline.ns_match_points);
					nsObj.minusMpts += Number(tline.ew_match_points);
					nsObj.boardsPlayed++;
					
					if (nsObj.boardsPlayed>maxPlayed) maxPlayed = nsObj.boardsPlayed;
					
					ewObj.plusMpts += Number(tline.ew_match_points);
					ewObj.minusMpts += Number(tline.ns_match_points);				
					ewObj.boardsPlayed++;
					if (ewObj.boardsPlayed>maxPlayed) maxPlayed = ewObj.boardsPlayed;
				}
			}
		}
	}
	
	var nsHigh = -65535;
	var nsLow = 65535;
	var ewHigh = -65535;
	var ewLow = 65535;
	
		// Calculate percentages, and high/low points for all positions
	for (i=0;i<rankNS.length;i++)
	{
		if (g_scoring!="IMP") rankNS[i].percent = (100*rankNS[i].plusMpts)/(rankNS[i].plusMpts + rankNS[i].minusMpts);
		else
		{
			rankNS[i].plusMpts = (maxPlayed*rankNS[i].plusMpts)/rankNS[i].boardsPlayed;
			rankNS[i].minusMpts = (maxPlayed*rankNS[i].minusMpts)/rankNS[i].boardsPlayed;			
			rankNS[i].percent = (100*rankNS[i].plusMpts)/g_maxImps;
		}
		
		rankNS[i].percent = Math.round(100*rankNS[i].percent)/100;
		
		if (rankNS[i].plusMpts>nsHigh) nsHigh = rankNS[i].plusMpts;
		if (rankNS[i].plusMpts<nsLow) nsLow = rankNS[i].plusMpts;
	}
	
	for (i=0;i<rankEW.length;i++)
	{
		if (g_scoring!="IMP") rankEW[i].percent = (100*rankEW[i].plusMpts)/(rankEW[i].plusMpts + rankEW[i].minusMpts);
		else
		{
			rankEW[i].plusMpts = (maxPlayed*rankEW[i].plusMpts)/rankEW[i].boardsPlayed;
			rankEW[i].minusMpts = (maxPlayed*rankEW[i].minusMpts)/rankEW[i].boardsPlayed;			
			rankEW[i].percent = (100*rankEW[i].plusMpts)/g_maxImps;
		}
		
		rankEW[i].percent = Math.round(100*rankEW[i].percent)/100;
		
		if (rankEW[i].plusMpts>ewHigh) ewHigh = rankEW[i].plusMpts;
		if (rankEW[i].plusMpts<nsLow) ewLow = rankEW[i].plusMpts;
	}
	
	var highMpts,lowMpts;
	
	if (ewHigh>nsHigh) highMpts = ewHigh;
	else highMpts = nsHigh;
	
	if (ewLow<nsLow) lowMpts = ewLow;
	else lowMpts = nsLow;
	
	if (g_scoring=="IMP")
	{
		for (i=0;i<rankNS.length;i++)
		{
			rankNS[i].percent = (100*(rankNS[i].plusMpts - lowMpts))/(highMpts-lowMpts);
		}

		for (i=0;i<rankEW.length;i++)
		{
			rankEW[i].percent = (100*(rankEW[i].plusMpts - lowMpts))/(highMpts-lowMpts);
		}
	}
	
	if (g_eventType=="Teams")
	{
			// Generate conbined array, but only include entries where crossImpsPerBoard is defined.
			// Otherwise, it means the pair did not play any boards so should not be included.
		var offset = 0;
		
		for (i=0;i<rankNS.length;i++)
			if ((typeof rankNS[i].crossImpsPerBoard)!="undefined")
			{
				rankCombined[offset] = rankNS[i];
				offset++;
			}
		
		for (i=0;i<rankEW.length;i++)
			if ((typeof rankEW[i].crossImpsPerBoard)!="undefined")
			{
				rankCombined[offset] = rankEW[i];
				offset++;
			}
	}
	
	var rankInfo = new Object();
	rankInfo.sessInfo = sessInfo;
	rankInfo.rankNS = rankNS;
	rankInfo.rankEW = rankEW;
	rankInfo.rankCombined = rankCombined;
	rankInfo.maxPlayed = maxPlayed;		// Max boards played by any pair.
	rankInfo.highMpts = highMpts;
	rankInfo.lowMpts = lowMpts;
	
	g_rankInfo = rankInfo;
	
	sortRanking(true);	// Sort by rank before adding the rank positions to the elements
	
	if (g_eventType!="Teams")
	{
		addRankPositions(rankInfo.rankNS);
		addRankPositions(rankInfo.rankEW);
	}
	else
	{
		addRankPositions(rankInfo.rankCombined);
	}
	
	return rankInfo;
}

function getPlayerInfo(pair,direction)
{
		// Gets player information for the current pair from the travellers record, using the information
		// passed to ddummy.htm in the pair_number and direction fields.
	var info = new Object();
	var pair_found = false;
	var pairs = g_travellers.event.participants.pair;
	var player1 = "";
	var player2 = "";
	var singleWinner = true;

	var i;
	
		// First check whether it;s a single winner movement (in which case pair numbers are unique but a particular
		// pair may sometimes be NS and sometimes EW
	var sessInfo = getSessionInfo();
	singleWinner = sessInfo.singleWinner;
	
	for (i=0;i<pairs.length;i++)
	{
		if (((pairs[i].direction=="N")&((direction==1)|singleWinner))&pair==pairs[i].pair_number)
		{
			pair_found = true;
			player1 = pairs[i].player[0].player_name;
			player2 = pairs[i].player[1].player_name;
			break;
		}
		else if (((pairs[i].direction=="E")&((direction==2)|singleWinner))&pair==pairs[i].pair_number)
		{
			pair_found = true;
			player1 = pairs[i].player[0].player_name;
			player2 = pairs[i].player[1].player_name;			
			break;
		}
	}
	
	if (pair_found)
	{
		if (player1==null) player1 = "noname noname";
		if (player2==null) player2 = "noname noname";
		info.player1 = player1;
		info.player2 = player2;
		info.pair_found = true;
		info.pair_number = pair;
		info.pair_index = i;	// Index to entry for this pair in g_travellers.event.participants.pair;
		info.direction = direction;	// Only relevant here if not single winner movement.
		info.singleWinner = singleWinner;
	}
	else
		info.pair_found = false;	// error

	return info;
}

function setBars(cells,value,cellindex,range,colorL,colorR,width)
{
		// Graphical indication of percentages
	var halfRange = range/2;
	var plus = ((2*width*(value-halfRange))/range) + "px";
	var minus = ((2*width*(halfRange-value))/range) + "px";;
	
	if (plus<0) plus = 0;
	if (minus<0) minus = 0;
	
	var cellWidth = width + "px";
	
	var pbar = "<div style=\"margin:0px;border:none;position:relative;height:12px;width:100%;min-width:" + width + "px;max-width:100%;background-color:white;\">";

	cells[cellindex+1].style.padding = "0px";
	cells[cellindex+1].style.backgroundColor = "#FFFFFF";
	cells[cellindex+1].innerHTML = pbar +  "<div align=left style=\"position: relative; border:none;bottom: 0; float: left; width: " + minus + ";max-width:" + minus + ";min-width:" + minus + ";height: 12px; background-color: " + colorR + "; margin: 0px;\"></div>" + "</div>";
	cells[cellindex+1].style.borderLeft="1px solid #CCCCCC";
	cells[cellindex+1].style.borderRight="1px solid #CCCCCC";
	cells[cellindex+1].align = "left";

	cells[cellindex+1].align = "right";
	cells[cellindex].style.padding = "0px";
	cells[cellindex].style.backgroundColor = "#FFFFFF";
	cells[cellindex].innerHTML = pbar + "<div align=right style=\"position: relative; border:none;bottom: 0; float: right; width: " + plus + ";max-width:" + plus + ";min-width:" + plus + ";height: 12px; background-color: " + colorL + "; margin: 0px;\"></div>" + "</div>";
	cells[cellindex].style.borderRight="1px solid #CCCCCC";
	cells[cellindex].style.borderLeft="1px solid #CCCCCC";
}

function getBoardIndex(travindex)
{
	// get board index, given index to a traveller.
	var board = g_travellers.event.board[travindex].board_no;
	
	var i;
	
	for (i=0;i<g_hands.boards.length;i++)
	{
		if (g_hands.boards[i].board == board)
		{
			return i;
		}
	}
	
	return null;
}

function getTravIndex(boardindex)
{
	// get traveller index, given index to a board.
	var board = g_hands.boards[boardindex].board;
	
	var i;
	
	for (i=0;i<g_travellers.event.board.length;i++)
	{
		if (g_travellers.event.board[i].board_no == board)
		{
			return i;
		}
	}
	
	return null;
}

function addSummaryRow(stable,text)
{
	stable.insertRow(-1);
	srow = stable.rows[stable.rows.length-1];
	srow.insertCell(-1);
	srow.insertCell(-1);
	srow.cells[0].style.textAlign = "right";
	srow.cells[0].innerHTML = text;
	return srow;
}

function addSummarySection(stable,playedInRole,sumOfPercent,sumOfCrossImps,crossImpBoards,etfAchieved,etfBoards,etfTotal)
{
	var srow = addSummaryRow(stable,"Boards:");
	srow.cells[1].innerHTML = playedInRole;
	
	if (g_scoring!="IMP")
	{
		srow = addSummaryRow(stable,"Avg Percentage:");
		
		if (playedInRole!=0)
		{
			srow.cells[1].innerHTML = parseFloat(Math.round((100*sumOfPercent)/playedInRole) / 100).toFixed(0) + "%";
		}
		else
			srow.cells[1].innerHTML = "N/A";
	}
	else
	{
		if (g_eventType=="Teams")
			srow = addSummaryRow(stable,"Avg Cross Imps Per Board:");
		else
			srow = addSummaryRow(stable,"Average Per Board");
		
		if (playedInRole!=0)
		{
			if (crossImpBoards!=0)
				srow.cells[1].innerHTML = parseFloat(Math.round((100*sumOfCrossImps)/crossImpBoards) / 100).toFixed(2);
			else
				srow.cells[1].innerHTML = "";
		}
		else
			srow.cells[1].innerHTML = "N/A";
	}

	srow = addSummaryRow(stable,"% of Boards with ETF >=0 :");
	
	if (etfBoards>0)
	{
		var etfPercent = (Math.round(100*etfAchieved/etfBoards)).toFixed(0);
		srow.cells[1].innerHTML = etfPercent.toString() + "%";
	}
	else
	{
		srow.cells[1].innerHTML = "No Data";
	}
	
	srow = addSummaryRow(stable,"Avg ETF:");
	
	if (etfBoards>0)
	{
		var etfAvg = (Math.round(100*etfTotal/etfBoards)/100).toFixed(2);
		srow.cells[1].innerHTML = etfAvg;
	}
	else
	{
		srow.cells[1].innerHTML = "No Data";
	}
}

function getPlayerAndRole(info,tline)
{
	var prole = new Object();
	var found = false;
	var tdirection = 1;		// assume played North/South
	var declarer_pair = false;
	var first = false;
	var opp_pair;
	var optNE = document.getElementById("pdiroptNE").checked;
	var optNW = document.getElementById("pdiroptNW").checked;
	var optSE = document.getElementById("pdiroptSE").checked;
	
	if ((info.pair_number==tline.ns_pair_number)&((info.direction==1)|info.singleWinner))
	{
		found = true;
		tdirection = 1;	// Played NS
		
		opp_pair = tline.ew_pair_number;
		
		if ((tline.played_by=="N")|(tline.played_by=="S"))
		{
			declarer_pair = true;
			
			if (((!info.singleWinner)&(tline.played_by=="N"))|
				((info.singleWinner)&optNE&(tline.played_by=="N"))|
				((info.singleWinner)&optNW&(tline.played_by=="N"))|
				((info.singleWinner)&optSE&(tline.played_by=="S")))
			{
				first = true;
			}
		}
		else if (((!info.singleWinner)&(tline.played_by=="W"))|
				((info.singleWinner)&optNE&(tline.played_by=="W"))|
				((info.singleWinner)&optNW&(tline.played_by=="W"))|
				((info.singleWinner)&optSE&(tline.played_by=="E")))
		{
			first = true;
		}
	}
	else if ((info.pair_number==tline.ew_pair_number)&((info.direction==2)|info.singleWinner))
	{
		found = true;
		tdirection =2 ;	// played EW
		
		opp_pair = tline.ns_pair_number;
		
		if ((tline.played_by=="E")|(tline.played_by=="W"))
		{
			declarer_pair = true;
			
			if (((!info.singleWinner)&(tline.played_by=="E"))|
				((info.singleWinner)&optNE&(tline.played_by=="E"))|
				((info.singleWinner)&optNW&(tline.played_by=="W"))|
				((info.singleWinner)&optSE&(tline.played_by=="E")))
				first = true;
		}
		else if (((!info.singleWinner)&(tline.played_by=="N"))|
				((info.singleWinner)&(optNE)&(tline.played_by=="N"))|
				((info.singleWinner)&(optNW)&(tline.played_by=="S"))|
				((info.singleWinner)&(optSE)&(tline.played_by=="N")))
		{
			first = true;
		}
	}
	
	prole = new Object();
	prole.found = found;
	prole.tdirection = tdirection;
	prole.declarer_pair = declarer_pair;
	prole.first = first;
	prole.opp_pair = opp_pair;
	
	return prole;
}

function checkInitialDirection(pair)
{
	var i;
	var pairs = g_travellers.event.participants.pair;
	var found = false;
	
	for (i=0;i<pairs.length;i++)
	{
		if (pairs[i].direction=="E") // the data distinguishes between pairs who started NS and EW
		{
			found = true;
			break;
		}
	}
	
	if (found)
	{
		for (i=0;i<pairs.length;i++)
		{
			if (pair==pairs[i].pair_number)
			{
				return pairs[i].direction;
			}
		}
	}
	
	return null;
}

function played(tline)
{
	if ((tline.ns_score=="Bye")|(tline.ew_score=="Bye")) return false;
	
	if (tline.contract!="NP") return true;
	else if (scoreContainsAdjustment(tline))
		return true;
	else
		return false;
}

function passed(tline)
{
	if (tline.contract=="Passed") return true;
	else return false;
}

function setButtonColor()
{
	document.getElementById("ascorecard").style.backgroundColor = "";
	document.getElementById("aranking").style.backgroundColor = "";
	document.getElementById("atraveller").style.backgroundColor = "";
	document.getElementById("acheck").style.backgroundColor = "";
	
	if (g_sessionMode=="scorecard") document.getElementById("ascorecard").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="ranking") document.getElementById("aranking").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="traveller") document.getElementById("atraveller").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="check") document.getElementById("acheck").style.backgroundColor = "#BBBB88";
}

function mergeScorecardRows(table,nrows,col)
{
		// Merge column cells in adjacent rows of scorecard when pair number and names are shared, and
		// apply alternate shading to groups of rows.
	var pair = table.rows[1].cells[col].innerHTML;
	var first = 0;
	var last = 0;
	var alt = 0;
	var shaded = 1;
	
	while (first<nrows)
	{
		for (last=first;last<=nrows;last++)
		{
			if ((table.rows[1+last].cells[col].innerHTML!=pair)|(last==nrows))
			{
				if ((table.rows[1+last].cells[col].innerHTML!=pair))
				{
					last--;
				}
				
				if  ((1 + last - first)>0)
				{
					table.rows[1+first].cells[col].rowSpan = 1 + last - first;
				}
				
				if (shaded!=0)
				{
					table.rows[1+first].className = "results_tr_grey";
				}
				
				for (j=first+1;j<=last;j++)
				{
					table.rows[1+j].deleteCell(col);
					
					if (shaded!=0)
						table.rows[1+j].className = "results_tr_grey";
				}
				
				if (shaded == 0)
					shaded = 1;
				else
					shaded = 0;
				
				first = last + 1;
				
				if (first<nrows)
				{
					pair = table.rows[1+first].cells[col].innerHTML;
				}
					
				break;
			}
		}
	}
}

function setLeadForScorecardRow(bnum,row,tline,declarer)
{
	var j;
	var colorPlus = "#ffff00";
	
	row.cells[4].innerHTML = leadCard(tline.lead);
	
	if (g_openingLeadsPresent&((typeof g_hands.boards[bnum].DoubleDummyTricks)!=null)&((typeof g_hands.boards[bnum].openingLeads)!="undefined"))
	{
		var relDDLead = "";
		
		if (tline.lead!="")
		{
			var idx = getLeadsIdx(tline.contract,tline.played_by);
			var leads = g_hands.boards[bnum].openingLeads[idx];
			
			var ltricks;
			
			var validLeadCard = false;
			
			for (j=0;j<leads.length;j++)
			{
				var cl = leads[j];
				
				if (cl[0].replace("T","10")==leadCard(tline.lead))
				{
					validLeadCard = true;
					var score = Number(cl[1]);
					
					if ((13-score)!=getMakeableTricksForContract(bnum,tline.contract,tline.played_by))
					{
						if (declarer)
							row.cells[4].style.backgroundColor = "#00ff00";
						else
							row.cells[4].style.backgroundColor = "#ff0000";
						
						break;
					}
				}
			}
			
			if (!validLeadCard) row.cells[4].style.backgroundColor = "#888888";
		}
	}
}

function drawHighLowSame(res)
{
	var dhwidth = (100*res.higher)/(res.higher+res.lower+res.same);
	var dswidth = (100*res.same)/(res.higher+res.lower+res.same);
	var dlwidth = (100*res.lower)/(res.higher+res.lower+res.same);
	
	var divstart = "<div style='clear:both;border:none;min-width:300px;width:300px;'><div style='clear:both;float:left;border:1px solid black;min-width:100px;width:100px;background-color:white;'><div style='clear:both;height:16px;background-color:grey;width:";
	var divend = "px;'></div></div>";
	var result =  divstart+dhwidth+divend+"<div style='float:left;max-width:190px;'>&nbsp;" + res.higher+" pairs made a higher score"+"</div></div>";
	var result = result + divstart+dswidth+divend+"<div style='float:left;max-width:190px;'>&nbsp;" + res.same+" pairs made the same score"+"</div></div>";
	var result = result + divstart+dlwidth+divend+"<div style='float:left;max-width:190px;'>&nbsp;" + res.lower+" pairs made a lower score"+"</div></div>";
	return result;
}

function setupResultReasons(ctx,result)
{
	var suit = "CDHSN";
	var dir = "NSEW";
	var tlines = ctx.tlines;
	var tline = tlines[ctx.row];
	var board = ctx.board;
	var contractStr = ["part score","game","small slam","grand slam"];
	var i,j;
	var count = 0;
	var aveScores = new Array();
	
	var acount = 0;
	var adir = "";
	var aObj;
	var playerInfo = null;
	var declName = "";
	var ourVul = false;
	var declDir = 1;
	var ourDir = -1;
	var oppsDir = -1;
	var oppsVul = false;
	
	var ourInfo = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var role = getPlayerAndRole(ourInfo,tline);
	var ourDir = role.tdirection;
	if (ourDir==1) oppsDir = 2; else oppsDir = 1;
	
	ourVul = false;
	
	var ourShortNames = ourInfo.player1.split(" ")[0] + "/" + ourInfo.player2.split(" ")[0];
	
	var oppsShortNames = "";
	var oppsInfo = "";
	
	if (oppsDir==1)
		oppsInfo  = getPlayerInfo(tline.ns_pair_number,1);
	else
		oppsInfo = getPlayerInfo(tline.ew_pair_number,2);
		
	oppsShortNames = oppsInfo.player1.split(" ")[0] + "/" + oppsInfo.player2.split(" ")[0];
	
	if (((ctx.Vulnerable=="NS")|(ctx.Vulnerable=="All"))&(ourDir==1))
		ourVul = true;
	else if (((ctx.Vulnerable=="EW")|(ctx.Vulnerable=="All"))&(ourDir==2))
		ourVul = true;
	
	if (((ctx.Vulnerable=="NS")|(ctx.Vulnerable=="All"))&(oppsDir==1))
		oppsVul = true;
	else if (((ctx.Vulnerable=="EW")|(ctx.Vulnerable=="All"))&(oppsDir==2))
		oppsVul = true;
	
	if ((tline.played_by=="N")|(tline.played_by=="S"))
	{
		declDir = 1;
		playerInfo = getPlayerInfo(tline.ns_pair_number,1);
	}
	else
	{
		declDir = 2;
		playerInfo = getPlayerInfo(tline.ew_pair_number,2);
	}
		
	if ((tline.played_by=="N")|(tline.played_by=="E"))
		declName = playerInfo.player1;
	else
		declName = playerInfo.player2;
		
	document.getElementById("resultReasons").innerHTML = "";
	
	for (i=0;i<tlines.length;i++)
	{
		var ctline = tlines[i];
		
		if (played(ctline))
		{
			if (adir=="")
			{
				aObj = new Object();
				aObj.higherScoreCount = 0;
				aObj.moreTricks = 0;
				aObj.count = 1;
				aObj.contract = ctline.contract;
				aObj.played_by = ctline.played_by;
				aObj.total = Number(ctline.tricks);
				adir = ctline.played_by;
				
				if ((Number(ctline.score)>Number(tline.score))&(ctx.direction==1))
					aObj.higherScoreCount++;
				else if ((Number(ctline.score)<Number(tline.score))&(ctx.direction==2))
					aObj.higherScoreCount++;
				
				if ((ctline.contract.charAt(1)==tline.contract.charAt(1))&(Number(ctline.tricks)>Number(tline.tricks))) aObj.moreTricks++;
			}
			else
			{
				if ((aObj.contract==ctline.contract)&(aObj.played_by==ctline.played_by))
				{
					aObj.count++;
					aObj.total = aObj.total + Number(ctline.tricks);
					
					if ((Number(ctline.score)>Number(tline.score))&(ctx.direction==1))
						aObj.higherScoreCount++;
					else if ((Number(ctline.score)<Number(tline.score))&(ctx.direction==2))
						aObj.higherScoreCount++;
						
					if ((ctline.contract.charAt(1)==tline.contract.charAt(1))&(Number(ctline.tricks)>Number(tline.tricks))) aObj.moreTricks++;
				}
				else
				{
					adir = ctline.played_by;
					aObj.average = aObj.total/aObj.count;
					aveScores[acount] = aObj;
					acount++;
					
					aObj = new Object();
					aObj.moreTricks = 0;
					aObj.higherScoreCount = 0;
					aObj.count = 1;
					aObj.contract = ctline.contract;
					aObj.played_by = ctline.played_by;
					aObj.total = Number(ctline.tricks);
					
					if ((Number(ctline.score)>Number(tline.score))&(ctx.direction==1))
						aObj.higherScoreCount++;
					else if ((Number(ctline.score)<Number(tline.score))&(ctx.direction==2))
						aObj.higherScoreCount++;
						
					if ((ctline.contract.charAt(1)==tline.contract.charAt(1))&(Number(ctline.tricks)>Number(tline.tricks))) aObj.moreTricks++;
				}
			}
		}
	}
	
	aObj.average = aObj.total/aObj.count;
	aveScores[acount] = aObj;
	
	for (i=0;i<tlines.length;i++)
		if (played(tlines[i])) count++;
		
	var bidx = getTindexByName(g_hands.boards,""+board);
	
	var tricksOffset = 0;
	var tricksTarget = tline.contract.charAt(0);
	var offsetStr = "";
	
	if (!isNaN(tricksTarget))
	{
		tricksOffset = tline.tricks - (Number(tricksTarget)+6);
		
		if (tricksOffset>0)
			offsetStr = "+" + tricksOffset;
		else if (tricksOffset<0)
			offsetStr = tricksOffset;
	}
		
//	tricksOffset = calculateTricks(bidx);
	var contractPlayer = "";
	
	if (tline.contract.toUpperCase().charAt(0)!=='P')
		contractPlayer = " by " + tline.played_by + " (" + declName + ")";
	
	var str2 = "Board " + board + ", Contract " + tline.contract + offsetStr + contractPlayer + "<BR><BR>";

	str2 = str2 + "<div id=accuracy style=\"float:left;\"></div>";
		
	str2 += "<div style=\"float:left;clear:both;margin-top:10px;\">";
	
	var tmp = getHighestScoringMakeableContractForDirection(bidx,ourDir,ourVul);
	
	if (tmp==null)
		str2 += "No theoretical makeable contract by " + ourShortNames + "<BR><BR>";
	else if ((tmp.contract.charAt(0)=="0"))
		str2 += "No theoretical makeable contract by " + ourShortNames + "<BR><BR>";
	else
		str2 += "Highest scoring makeable contract by " + ourShortNames + " is: " + tmp.contract + " by " + tmp.declarer + "<BR><BR>";
		
	tmp = getHighestScoringMakeableContractForDirection(bidx,oppsDir,oppsVul);
	
	if (tmp==null)
		str2 += "No theoretical makeable contract by " + oppsShortNames + "<BR><BR>";
	else if (tmp.contract.charAt(0)=="0")
		str2 += "No theoretical makeable contract by " + oppsShortNames + "<BR><BR>";
	else
		str2 += "Highest scoring makeable contract by " + oppsShortNames + " is: " + tmp.contract + " by " + tmp.declarer + "<BR><BR>";
		
	var curbd = g_hands.boards[bidx];
	
	if ((typeof curbd.OptimumScore)!="undefined")
		str2 += "[OptimumScore \"" + curbd.OptimumScore + "\"]<BR><BR>";

	var ourscore = tline.score;
	var res = compareScores(tlines,ourscore,ctx.direction);
	
	str2 = str2 + "<BR>";
	
	var str5 = "<table cols=5 class=ranking style='border:1px solid gray;border-spacing:0px;'>";
	str5 = str5 + "<tr style='border:1px solid grey;'><th>Contract</th><th>Decl</th><th>Ave Tks</th><th colspan=2>No Of Pairs</th><th colspan=2>Higher Scores</th></tr>";
	
	for (i=0;i<aveScores.length;i++)
	{
		aObj = aveScores[i];
		var hcount = aObj.higherScoreCount;
		if (hcount==0) hcount = "";
		
		var moreTricks = aObj.moreTricks;
		if (moreTricks==0) moreTricks = "";
		
		var bcolor = "";
		
		if (tline.contract==aObj.contract)
		{
			bcolor = "background-color:#cccccc;";
		}
		
		str5 = str5 + "<tr style='border:1px solid grey;" + bcolor + "'><td>" + aObj.contract + "</td><td>" + aObj.played_by + "</td><td>" + aObj.average.toFixed(2) + "</td><td>" + aObj.count + "</td><td><div style='height:12px;border:1px solid black;width:50px;'><div style='height:12px;background-color:blue;width:" + ((50*aObj.count)/count)+ "px;'></div></div></td><td>" + hcount + "</td><td><div style='height:12px;border:1px solid black;width:50px;'><div style='height:12px;background-color:blue;width:" + ((50*hcount)/count)+ "px;'></div></div></td></tr>";
	}
	
	str2 = str2 + str5 + "</table></div>";
	
	str2 = str2 + "<div style='width:30%;float:left;'><div id=popupHand style='width:100%;margin-left:10px;float:left;'></div><div id=popupMakeable style='float:right;clear:both;'></div></div>";
	
	var str = "";
	
	str = str2 + "<div style='float:left;clear:both;'>" + str + "</div>";
	
	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:520px;width:600px;\"><span style=\"font-size:16px;\">";
	help = help + str;
	help = help + "</span></DIV><BR>";
	help = help + "<BUTTON id=hide_resultReasons style=\"cursor:pointer;\">CLOSE</BUTTON>";
	
	document.getElementById("resultReasons").innerHTML = help;
	
	var saveBindex = g_lastBindex;
	
	g_lastBindex = getTindexByName(g_hands.boards,String(board));
	
	drawMiniHand();
	$("#minihand").hide();
	var cp = document.getElementById("minihand").cloneNode(true);
	cp.removeAttribute("id");
	$(cp).find("*").removeAttr("id");
	
	document.getElementById("popupHand").appendChild(cp);
	
	var cp = document.getElementById("miniMakeableContracts").cloneNode(true);
	cp.removeAttribute("id");
	$(cp).find("*").removeAttr("id");
	
	document.getElementById("popupMakeable").appendChild(cp);
	
	g_lastBindex = saveBindex;
	
	drawMiniHand();	// Draw the original board in case user clicks on the Board button.
}

function showPlayAnalysis(bd)
{
	var ctx = g_scorecardContext[bd];
	var data=checkHigherScoringPairs(ctx.tlines,ctx.row,ctx.direction);
	setupResultReasons(ctx,data);
	var index = getTindexByName(g_hands.boards,bd);
	setupTraveller(index,false);
	
	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		if (g_hands.boards[g_lastBindex].Played.length>1)	
			playLinContract(true,1);

//	showHelp(this,"resultReasons");
}

function showNewFeaturesNotice()
{
	if (!g_newFeatureNoticeShown) g_newFeatureNoticeShown = 1;

	try {
		if (localStorageSupported())
		{
			var alertShown = localStorage.getItem("newFeatureShown");
			var shown;
			
			if (alertShown==null)
				shown = false;
			else if (Number(alertShown)>3)
				shown = true;
			else
				shown = false;
				
			var txt = "<ul><li>The High Card Points display at the bottom left of the board diagram now has the option to display the result of a Kaplan-Rubens hand evaluation. Click on the ? character in the points display box for further explanation.</li>";
			txt += "</ul>";
			txt += "See the <a href=releaseNotes.htm target=_blank>release notes.</a> for a full history of recent changes";
			
			if (!shown)
			{
				localStorage.setItem('newFeatureShown','4');
				var str = "<div style=\"width:500px;\"><SPAN style=\"font-size:24px;\">New Features</SPAN><BR><SPAN style=\"font-size:15px;\">" + txt + "</SPAN></div>";
				str += "<BR><button style=menuButton onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\"><SPAN style=\"font-size:16px;\">Close</SPAN></button>";
				doPopupNoTimeout(document.getElementById("boardNumber"),"<SPAN style=\"font-size:16px;color:blue;\">" + str + "</SPAN>",100,50);
			}
		}
	} catch (err) {};
}

function makeScoreClickFunction(tline)
{
	return function(){var row=this.parentNode;var bd=row.cells[0].innerHTML;log('button=acc2');getCachedAcc(tline);};
}

function setupScorecard2(table,stable,boards,info,sessInfo,etfRange,sortedBoards)
{
	var j,n;
	var playedInRoleCombined = 0;
	var sumOfPercentCombined = 0;
	var sumOfCrossImpsCombined = 0;
	var crossImpBoardsCombined = 0;
	var etfTotalCombined = 0;
	var etfBoardsCombined = 0;
	var etfAchievedCombined = 0;
	var oppDir;
	var oppInfo;
	var ctx = new Object();
	
	g_scorecardContext = new Array();
	
	var rows = table.rows;
	var srows = stable.rows;
	while (rows.length>2) table.deleteRow(-1);
	
	var upperLimit;
	
	var mPlayer1 = info.player1.trim().split(" ");
	if (mPlayer1.length>1) mPlayer1 = mPlayer1[0] + " " + mPlayer1[1].charAt(0); else mPlayer1 = mPlayer1[0];
	
	var mPlayer2 = info.player2.trim().split(" ");
	if (mPlayer2.length>1) mPlayer2 = mPlayer2[0] + " " + mPlayer2[1].charAt(0); else mPlayer2 = mPlayer2[0];	
	
	if (sortedBoards) upperLimit =1; else upperLimit = 5;
	
	for (n=0;n<upperLimit;n++)
	{
		var lineCount=0;
		var playedInRole = 0;
		var sumOfPercent = 0;
		var sumOfCrossImps = 0;
		var crossImpBoards = 0;	// Note this number can be fewer than "playedInRole" (some may not count for cross imps in Teams events)
		var etfTotal = 0;
		var etfBoards = 0;
		var etfAchieved = 0;
		var lastOppPair = -1;
		
		for (j=0;j<boards.length;j++)
		{
			ctx = new Object();
			var board = boards[j];
			var tlines = board.traveller_line;
			
			sortTravellerLines(tlines,1);
			
			ctx.tlines = tlines;
		
			var i,prole,found,tdirection,dirChars,declarer_pair,first;
			
			var opp_pair;
	
			for (i=0;i<tlines.length;i++)
			{
				var tline = tlines[i];
				
				if (info.pair_found)
				{
					prole = getPlayerAndRole(info,tline);
					found = prole.found;
					tdirection = prole.tdirection;
					declarer_pair = prole.declarer_pair;
					first = prole.first;
					opp_pair = prole.opp_pair;
					
					if (sessInfo.singleWinner)
					{
						if (tdirection==1) dirChars = " (EW)"; else dirChars = " (NS)"; // Playing direction of opponents
					}
					else
						dirChars = "";
										
					if (found)
					{
						ctx.row = i;
						ctx.direction = tdirection;
						
						if ((lineCount==0)&!sortedBoards)
						{
							table.insertRow(-1);
							var row = table.rows[table.rows.length-1];
							row.insertCell(-1);
							row.cells[0].colSpan = 13;
							row.cells[0].style.backgroundColor = "#FFFF88";
							row.cells[0].style.borderRight = "1px solid #cccccc";
							
							stable.insertRow(-1);
							var srow = stable.rows[stable.rows.length-1];
							srow.insertCell(-1);
							srow.cells[0].colSpan = 2;
							srow.cells[0].style.backgroundColor = "#FFFF88";
							srow.cells[0].style.borderRight = "1px solid black";
							srow.cells[0].style.textAlign = "center";
							
							var str;
							
							if (n==0)
								str = "Declarer - " + mPlayer1;
							else if (n==1)
								str = "Declarer - " + mPlayer2;
							else if (n==2)
								str = "Defending - " + mPlayer1 + " on lead";
							else if (n==3)
								str = "Defending - " + mPlayer2 + " on lead";
							else
								str = "Passed, or no contract available";
							
							row.cells[0].innerHTML = "<span style=\"font-weight:600;\">" + str + "</span>";
							srow.cells[0].innerHTML = "<span style=\"font-weight:bold;\">" + str + "</span>";
						}
						
						lineCount++;
						
						if (sortedBoards|(validContract(tline.contract)&(((n==0)&declarer_pair&first)|((n==1)&declarer_pair&!first)|((n==2)&first&!declarer_pair)|((n==3)&!first&!declarer_pair)))|((n==4)&!validContract(tline.contract)))
						{
							if (played(tline)|sortedBoards)	// Otherwise board was not actually played
							{
								playedInRole++;
																	
								table.insertRow(-1);
								var row = table.rows[table.rows.length-1];
								
								if (sortedBoards)
									if (opp_pair!=lastOppPair)
									{
										row.style.borderTop = "1px solid #cccccc";
									}
									
								lastOppPair = opp_pair;
									
								var k;
								
								for (k=0;k<12+g_ofs;k++)
								{
									row.insertCell(-1);
								}
								
								row.cells[0].innerHTML = board.board_no;
								row.cells[0].onclick = function(){log("operation=selectBoardFromScorecard");g_lastBindex = getTindexByName(g_hands.boards,this.innerHTML);showComparison();};
								row.cells[0].className = "myLink";
								
								ctx.board = board.board_no;
								g_scorecardContext[board.board_no] = ctx;
								
								if (g_currentTraveller!=null)
									if (board.board_no==g_currentTraveller.board_no)
										row.cells[0].style.backgroundColor = "pink";
										
								if (g_hands.direction==1) oppDir = 2; else oppDir = 1;
	
								oppInfo = getPlayerInfo(opp_pair,oppDir);
								
								var p1 = oppInfo.player1.trim().split(" ");
								var p2 = oppInfo.player2.trim().split(" ");
								
								if (sortedBoards)
									row.cells[1].innerHTML = opp_pair + dirChars + "<BR>(" + p1[0] + " & " + p2[0] + ")";
								else
								{
									row.cells[1].innerHTML = opp_pair;		
									row.cells[1].className = "myLink";
									
									if (tdirection==2)
										row.cells[1].onclick = row.cells[1].onmouseover = function(){showNames(this,1);};
									else
										row.cells[1].onclick = row.cells[1].onmouseover = function(){showNames(this,2);};
								}
								
								row.cells[1].style.borderRight = "1px solid black";
								row.cells[1].style.textAlign = "middle";
								
								row.cells[1].onmouseout = function(){
										var popup = document.getElementById("popup_box");
										popup.innerHTML = "";
										popup.style.display="none";
										$("#popup_box").finish();
									}
								
								if (validContract(tline.contract))
								{
									var contractLevel = Number(tline.contract.charAt(0));
									var overtricks = tline.tricks - (contractLevel + 6);
								}
								
								var value;
								
								var nspts = Number(tline.ns_match_points);
								var ewpts = Number(tline.ew_match_points);
								
								if (g_scoring!="IMP")
									value = 100*(nspts/(nspts + ewpts));
								else
								{
									if (g_eventType!="Teams")
										value = 50*(1 + nspts/g_maxImps);
									else
									{
										if (tdirection==1)	// Played NS
											value = 50*(1 + (Number(tline.crossImpsNS))/g_maxImps);
										else
											value = 50*(1 + (Number(tline.crossImpsEW))/g_maxImps);
									}
								}
								
								if ((tdirection==2)&(g_eventType!="Teams")) value = 100 - value;
								
								sumOfPercent = sumOfPercent + value;
								
								if (g_scoring!="IMP")
								{
									value = parseFloat(Math.round(value * 100) / 100).toFixed(0);
									row.cells[9+g_ofs].innerHTML = value + "%";
								}
								else
								{
									var showResultBars = true;
									
									if (g_eventType!="Teams")
									{
										if (tdirection==1)
										{
											row.cells[9+g_ofs].innerHTML = nspts;
											sumOfCrossImps += nspts;	// Add to this total for summary section in case cross imp or aggregate scoring used
											crossImpBoards++;
										}
										else
										{
											row.cells[9+g_ofs].innerHTML = ewpts;	// Add to this total for summary section in case cross imp or aggregate scoring used
											sumOfCrossImps += ewpts;											
											crossImpBoards++;
										}
									}
									else
									{
										if (tdirection==1)
										{
											row.cells[9+g_ofs].innerHTML = tline.crossImpsNS;
											sumOfCrossImps += Number(tline.crossImpsNS);
											
											if (tline.crossImpsNS!=="")
												crossImpBoards++;
										}
										else
										{
											row.cells[9+g_ofs].innerHTML = tline.crossImpsEW;
											sumOfCrossImps += Number(tline.crossImpsEW);
											
											if (tline.crossImpsEW!=="")
												crossImpBoards++;
										}
									}
								}
								
								row.cells[9+g_ofs].style.textAlign = "right";
				
								try {
									if ((typeof tline.board)!="undefined")
									{
										row.cells[9+g_ofs].onclick = function(){var row=this.parentNode;var bd=row.cells[0].innerHTML;log('button=acc2');showPlayAnalysis(bd);};
										row.cells[9+g_ofs].className = "myLink";
									}
								} catch (err) {};
								
								row.cells[2].style.textAlign = "right";
								
								var width = (100*value)/100;
			
								setBars(row.cells,100-width,10+g_ofs,100,"#FF0000","#00FF00",50);
	
								if (validContract(tline.contract))
								{
									row.cells[2].innerHTML = tline.contract;
									row.cells[3].innerHTML = tline.played_by;
								
									row.cells[2].style.textAlign = "left";
									
										//************* change to deal with non-contract (e.g. Passed Out, or Not Played)
									if (tline.tricks!="")
									{
										var overtricks = (tline.tricks - (6 + (Number(tline.contract.charAt(0)))));
										if (overtricks>=0) overtricks = "+" + overtricks;
										
										if (overtricks!=0)
											row.cells[5+g_ofs].innerHTML = overtricks;
										else
											row.cells[5+g_ofs].innerHTML = "=";
											
										row.cells[4+g_ofs].style.textAlign = "right";
										
										var backColor = "white";
										
										row.cells[4+g_ofs].innerHTML = tline.tricks;
//										row.cells[4+g_ofs].style.backgroundColor = backColor;

										row.cells[5+g_ofs].style.textAlign = "right";
										row.cells[5+g_ofs].style.borderRight = "1px solid black";
									}
									
									if (g_ofs==1)
									{
										setLeadForScorecardRow(j,row,tline,declarer_pair);
//										row.cells[4].className = "myLink";
										row.cells[4].style.textAlign = "right";
//										row.cells[4].onclick = function(){var row=this.parentNode;var contract=row.cells[2].innerHTML;var declarer=row.cells[3].innerHTML;var idx = getLeadsIdx(contract,declarer);alert(JSON.stringify(g_hands.boards[getTindexByName(g_hands.boards,row.cells[0].innerHTML)].openingLeads[idx]))};
									}
									
									var hindex = getBoardIndex(j);
									
									if (hindex!=null)
									{
										if ((typeof g_hands.boards[hindex].DoubleDummyTricks)!="undefined")
										{
											var ntricks2 = getMakeableTricksForContract(hindex,g_hands.boards[hindex].Contract,g_hands.boards[hindex].Declarer);
											var ETFMode = document.getElementById("ETFMode");
											
											if (ETFMode!=null)
											{
												if (document.getElementById("ETFMode").selectedIndex==1)
												{
													var ltricks = getMakeableTricksForLead(hindex,tline);
													
													if ((declarer_pair)&(ltricks!=null))
														if (ltricks!=ntricks2)
															ntricks2 = ltricks;
												}
											}
												
											backColor = "white";
											
											if (ntricks2>=0)
											{
												var relDD = tline.tricks - ntricks2;
												
												if (declarer_pair)
												{
													if (relDD>0) backColor = "#00FF00";
													else if (relDD<0) backColor = "#FF0000";
												}
												else
												{
													relDD = -relDD;
													if (relDD>0) backColor = "#FF0000";
													else if (relDD<0) backColor = "#00FF00";
												}
												
												if (relDD==0) backColor = "#88FF88";	// Light Green
												
												etfTotal += relDD;
												etfBoards++;	// Number of boards for which ETF available.
												
												if (relDD>=0) etfAchieved++;
												
												var ddStr = relDD.toString();
												
												if (relDD==0) ddStr = "=";
												else if (relDD>0) ddStr = "+" + relDD;
												
												row.cells[6+g_ofs].innerHTML = ddStr;
												row.cells[6+g_ofs].style.textAlign = "right";
												row.cells[6+g_ofs].style.borderLeft = "1px solid #cccccc";
												setBars(row.cells,etfRange-Number(relDD),7+g_ofs,2*etfRange,"#FF0000","#00FF00",40);
											}
											else
											{
												setBars(row.cells,etfRange,7+g_ofs,2*etfRange,"#FF0000","#00FF00",40);
												row.cells[6+g_ofs].colSpan = 2;
												row.cells[6+g_ofs].innerHTML = "No Data";
												row.cells[6+g_ofs].style.borderLeft = "1px solid #cccccc";
												row.deleteCell(7+g_ofs);
											}
										}
										else
										{
											setBars(row.cells,etfRange,7+g_ofs,2*etfRange,"#FF0000","#00FF00",40);
											row.cells[6+g_ofs].colSpan = 2;
											row.cells[6+g_ofs].style.borderLeft = "1px solid #cccccc";
											row.cells[6+g_ofs].innerHTML = "No Data";
											row.deleteCell(7+g_ofs);
										}
									}
								}
								else
								{
									if (passed(tline))
										row.cells[2].innerHTML = "Passed";
									else
										row.cells[2].innerHTML = "N/A";
										
									row.cells[7+g_ofs].style.backgroundColor = "white";
									row.cells[8+g_ofs].style.backgroundColor = "white";
									row.cells[7+g_ofs].style.borderLeft = "1px solid #CCCCCC";
									row.cells[8+g_ofs].style.borderLeft = "1px solid #CCCCCC";
								}
								
								row.cells[8+g_ofs].style.borderRight = "1px solid black";
	
								var ourscore = tline.score;
								var comment = "";
							}
							
							break;
						}
					}
				}
			}
		}
		
		playedInRoleCombined += playedInRole;
		sumOfPercentCombined += sumOfPercent;
		sumOfCrossImpsCombined += sumOfCrossImps;
		crossImpBoardsCombined += crossImpBoards;
		etfAchievedCombined += etfAchieved;
		etfBoardsCombined += etfBoards;
		etfTotalCombined += etfTotal;
		
		if (!sortedBoards) addSummarySection(stable,playedInRole,sumOfPercent,sumOfCrossImps,crossImpBoards,etfAchieved,etfBoards,etfTotal);
	}
	
	if (!sortedBoards)
	{
		stable.insertRow(-1);
		srow = stable.rows[stable.rows.length-1];
		srow.insertCell(-1);
		srow.cells[0].colSpan = 2;
		srow.cells[0].style.backgroundColor = "#FFFF88";
		srow.cells[0].style.borderRight = "1px solid black";
		srow.cells[0].style.textAlign = "center";
		
		str = "<span style=\"font-weight:600;\">" + "Overall Result:" + "</span>";
		srow.cells[0].innerHTML = str;
		
		addSummarySection(stable,playedInRoleCombined,sumOfPercentCombined,sumOfCrossImpsCombined,crossImpBoardsCombined,etfAchievedCombined,etfBoardsCombined,etfTotalCombined);
	}
	
	if (sortedBoards) mergeScorecardRows(table,table.rows.length-2,1);
		
	table.insertRow(-1);
	row = table.rows[table.rows.length-1];
	row.insertCell(-1);
	row.cells[0].colSpan=12+g_ofs;
	row.cells[0].style.whiteSpace = "normal";
	row.cells[0].style.borderTop = "1px solid black";
	row.cells[0].style.borderRight = "1px solid #cccccc";
	row.cells[0].innerHTML = "<DIV style=\"max-width:400px;float:left;text-align:left;\"><SPAN style=\"font-size:10px;font-style:italic;\">ETF is the number of tricks made by the current pair, as declarer or defenders, relative to the double dummy target for a particular contract. Adjusted ETF is calculated relative to a revised double dummy target that depends on the actual lead made by the defenders of a contract.</span></DIV>";
}

function setupScorecard(keepScrollSetting)
{
	g_sessionMode = "scorecard";
	setButtonColor();
	
	hideAllPopups();
	hide("scoreandtraveller");
	$("#abuttons").show();
	
	setCurrentTraveller();
	
	if (keepScrollSetting===undefined) window.scroll(0,0);
	
	var j,n;
	var sessInfo = getSessionInfo();
	
		// Make sure pair number is valid, so that something is displayed even if none was supplied.
	if (g_hands.pair_number=="")
	{
		g_hands.pair_number = g_travellers.event.participants.pair[0].pair_number;
		
		if (g_travellers.event.participants.pair[0].direction=="N")
			g_hands.direction = 1;
		else
			g_hands.direction = 2;
			
		changeCurrentPair(g_hands.pair_number,g_hands.direction);
		setDefaultContracts();
	}
		
	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var table = document.getElementById("scoring");
	var rows = table.rows;
	var stable = document.getElementById("scoring_summary");
	var srows = stable.rows;
	var winners = 2;
	var dirStr = "NS Pair ";
	var optNE = document.getElementById("pdiroptNE").checked;
	var optNW = document.getElementById("pdiroptNW").checked;
	var optSE = document.getElementById("pdiroptSE").checked;
	
	if (g_hands.direction==2) dirStr = "EW Pair ";
	
	document.getElementById("first_player_name").innerHTML = "<span style=\"font-weight:600;\">" + "Set direction for " + info.player1 + ":" + "</span>";
	
	if (sessInfo.singleWinner)
	{
		winners = 1;
		dirStr = "Pair ";
		$("#player_direction").show();
		
		var startDirection = checkInitialDirection(g_hands.pair_number);

		if (startDirection==null)
		{
			$("#optNEdiv").show();
			$("#optNWdiv").show();
			$("#optSEdiv").show();
		}
		else if (startDirection=="N")
		{
			$("#optNEdiv").show();
			$("#optNWdiv").show();			
			$("#optSEdiv").hide();
			
			if ((!optNE)&(!optNW))
			{
				document.getElementById("pdiroptNE").checked = true;
				optNE = true;
			}
		}
		else	// Must be "E"
		{
			$("#optNEdiv").show();
			$("#optSEdiv").show();			
			$("#optNWdiv").hide();
			
			if ((!optNE)&(!optSE))
			{
				document.getElementById("pdiroptNE").checked = true;
				optNE = true;
			}
		}
	}
	else
	{
		$("#player_direction").hide();
	}
		
	while (srows.length>1) stable.deleteRow(-1);
	
	if (g_scoring=="IMP") rows[1].cells[6+g_ofs].innerHTML = "Points";
	if (g_eventType=="Teams") rows[1].cells[6+g_ofs].innerHTML = "Cross Imps";
	
	var boards = g_travellers.event.board;
	
	document.getElementById("scPlayerNames2").innerHTML = info.player1 + " & " + info.player2 + " - " + dirStr + g_hands.pair_number;
	
	var etfRange = 0;
	
		// Calculate range for ETF tricks (to determine bar chart range).
	for (j=0;j<boards.length;j++)
	{
		var board = boards[j];
		var tlines = board.traveller_line;
	
		var i,prole,found,tdirection,declarer_pair,first;
		
		var opp_pair;

		for (i=0;i<tlines.length;i++)
		{
			var tline = tlines[i];
			
			if (info.pair_found)
			{
				prole = getPlayerAndRole(info,tline);
				found = prole.found;

				if (validContract(tline.contract))
				{
					if (played(tline))	// Otherwise board was not actually played
					{
						var overtricks = (tline.tricks - (6 + (Number(tline.contract.charAt(0)))));
						if (Math.abs(overtricks)>etfRange) etfRange = Math.abs(overtricks);
					}
				}
			}
		}
	}
	
	if (etfRange<4) etfRange = 4;	// Make this the minimum range for graph. Usually, overtricks and undertricks will not be higher than this.
	
	setupScorecard2(table,stable,boards,info,sessInfo,etfRange,false);
	
	var optRoles = (document.getElementById("sortMode").selectedIndex==0);

	if (!optRoles) setupScorecard2(table,stable,boards,info,sessInfo,etfRange,true);	// Display table sorted by board number
		
	$("#scores").show();
	hideRanking();
	$("#comparison").hide();
	$("#checkListDiv").hide();
}

function showRanking()
{
	var str = g_title;
	
	var sessInfo = getSessionInfo();
	
		// If all pair numbers are recorded as NS pairs, then pair numbers are unique, so we can tell which direction they played
	if ((g_eventType=="Teams")&!sessInfo.singleWinner) 
		str = str + "<BR><SPAN style=\"font-size;12px;color:#ff4444;\">Calculated cross imp ranking for individual pairs (assumes NS and EW pairs do not switch direction during the event)</SPAN>";
	
	document.getElementById("titleText").innerHTML = str;
	$("#ranking").show();
	$("#rcheckdiv").show();
}

function hideRanking()
{
	document.getElementById("titleText").innerHTML = g_title;
	$("#ranking").hide();
	$("#rcheckdiv").hide();
}

function setupRanking(keepScrollSetting)
{
	g_sessionMode = "ranking";
	setButtonColor();
	
	hideAllPopups();
	$("#scoreandtraveller").hide();
	$("#scores").hide();
	$("#comparison").hide();
	$("#checkListDiv").hide();
	$("#abuttons").show();
	
	setCurrentTraveller();
	
	if (keepScrollSetting===undefined) window.scroll(0,0);
	
	var sessInfo = getSessionInfo();
	var table = document.getElementById("rankingNS");
	var rows = table.rows;
	var winners = 2;
	
	if (sessInfo.singleWinner) winners = 1;
	
	var rankInfo = getRankingInfo();
		
	ddComparisonAll();
	
	if (table.rows[0].cells.length==5)
		colcount = 6;
	else
		colcount = 8;
		
	table.rows[0].cells[2].innerHTML = "Players";	// Change column heading that was in event.htm
	
	if (g_eventType=="Teams") table.rows[0].cells[1].innerHTML = "Team";
	
	while (rows.length>1) table.deleteRow(-1);
	
	if (g_eventType=="Teams")
	{
		if (rows[0].cells.length==5)
		{
			rows[0].insertCell(3);
			rows[0].insertCell(3);
		}
		
		rows[0].cells[3].outerHTML = "<th>Total XImps</th>";
		rows[0].cells[4].outerHTML = "<th>Boards</th>";
		cellOffset = 2;	// Allow for extra column which has been inserted.
		rows[0].cells[3 + cellOffset].innerHTML = "XImps/Board";	
	}
	
	if ((winners!="1")&(g_eventType!="Teams"))
	{
			// Add extra heading row (avoids changing event.htm which might cause temporary caching issue)
		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];
		var cell = document.createElement("th");
		row.appendChild(cell);
		row.cells[0].innerHTML = "North/South";
		row.cells[0].colSpan = colcount;
	}

	setupRankingTable(table,"NS",rankInfo,winners);
	
	var rankingHeader = document.getElementById("rankingHeader");
	
	if ((winners!="1")&(g_eventType!="Teams"))
	{
		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];
		
		var cell = document.createElement("th");
		row.appendChild(cell);
		cell.colSpan = colcount;
		cell.innerHTML = "East/West";

		setupRankingTable(table,"EW",rankInfo,winners);
	}

	showRanking();
	$("#comparison").hide();
	$("#checkListDiv").hide();
}

function changeCurrentPair(pair,direction)
{
	getRankingInfo();
	
	var data = getPairObject(g_hands.pair_number,g_hands.direction,g_rankInfo.rankNS,g_rankInfo.rankEW);
	
	if (data!=null)
	{
			// find which radio button is checked, out of the direction buttons
		var button = document.getElementById("pdiroptNW");
		if (button.checked)
			data.dirChoice = button;
		else
		{
			button = document.getElementById("pdiroptNE");
			if (button.checked) data.dirChoice = button;
			else
			{
				data.dirChoice = document.getElementById("pdiroptSE");
			}
		}
	}
	
	g_hands.pair_number = pair;
	g_hands.direction = direction;
	
	data = getPairObject(g_hands.pair_number,g_hands.direction,g_rankInfo.rankNS,g_rankInfo.rankEW);
	
		// Possibly direction is incorrect, so reverse it. If caller consistently supplies wrong direction, but same pair number range is used
		// NS and EW, then this cannot be detected.
	if (data==null)
	{
		if (g_hands.direction==1) g_hands.direction = 2;
		else g_hands.direction = 1;

		data = getPairObject(g_hands.pair_number,g_hands.direction,g_rankInfo.rankNS,g_rankInfo.rankEW);
	}
	
	if (g_currentTraveller!=null)
	{
		g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);
		if (g_currow==-1) g_currow = 0;
	}
	
	if ((typeof data.dirChoice)!="undefined")
	{
		data.dirChoice.checked = true;
	}
}

function setClickFunctionForNames(cell,pair,direction)
{
	cell.onclick = function(){log("operation=selectScorecardForNamedPair");changeCurrentPair(pair,direction);setDefaultContracts();setupScorecard();};
}

function setupRankingTable(table,dir,rankInfo,winners)
{
	var i,j;
	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var rangeMax = -32767;
	var rangeMin = 32767;
	
	if (g_eventType!="Teams")
	{
		if (dir=="NS")
		{
			pairs = rankInfo.rankNS;
		}
		else
		{
			pairs = rankInfo.rankEW;
		}
	}
	else
	{
		pairs = rankInfo.rankCombined;
	}
	
	var rows = table.rows;

	if ((g_scoring=="IMP")|(g_scoring=="VP"))	// Change Percentage Column Header
	{
		rows[0].cells[3].innerHTML = "Points";
		
		for (i=0;i<g_travellers.event.participants.pair.length;i++)
		{
			var tvalue;
			
			if (g_eventType!="Teams")
				tvalue = g_travellers.event.participants.pair[i].total_score;
			else
				tvalue = g_travellers.event.participants.pair[i].crossImpsPerBoard;
			
			if (tvalue!="")
			{
				tvalue =Number(tvalue);
				
				if (!isNaN(tvalue))
				{
					if (tvalue<rangeMin) rangeMin = tvalue;
					if (tvalue>rangeMax) rangeMax = tvalue;
				}
			}
		}
	}
	
	var cellOffset = 0;
	
	if (g_eventType=="Teams")
	{
		rows[0].cells[3].innerHTML = "Total XImps";
		rows[0].cells[4].innerHTML = "Bds";
		cellOffset = 2;	// Allow for extra column which has been inserted.
	}
		
	var shaded = 0;

	for (i=0;i<pairs.length;i++)
	{
		if (pairs[i].boardsPlayed==0) continue;
		
		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];
		
		if (shaded!=0)
		{
			row.className = "results_tr_grey";
			shaded = 0;
		}
		else
		{
			shaded = 1;
		}
		
		for (j=0;j<6+cellOffset;j++)
		{
			row.insertCell(-1);
		}

		if (g_eventType!="Teams")
			row.cells[0].innerHTML = pairs[i].samePosition + pairs[i].position;
		else
		{
			row.cells[0].innerHTML = pairs[i].samePosition + pairs[i].crossImpsPosition;
		}
		
		row.cells[0].style.textAlign = "right";
		
		row.cells[1].innerHTML = pairs[i].pair;
		
		var direction = 1;
		
		if (dir=="EW") direction = 2;
		
		if (g_eventType!="Teams")
		{
			if (((dir=="NS")&((info.direction==1)|info.singleWinner))&pairs[i].pair==info.pair_number)
			{
				row.cells[2].style.backgroundColor = "pink";
			}
	
			if (((dir=="EW")&(info.direction==2))&pairs[i].pair==info.pair_number)
			{
				row.cells[2].style.backgroundColor = "pink";
			}
		}
		else
		{
			if ((pairs[i].pair==info.pair_number)&(pairs[i].direction==g_hands.direction))
				row.cells[2].style.backgroundColor = "pink";
		}

		var pairInfo = getPlayerInfo(pairs[i].pair,pairs[i].direction);
		
		setClickFunctionForNames(row.cells[2],pairs[i].pair,pairs[i].direction);
		row.cells[2].innerHTML = pairInfo.player1 + " & " + pairInfo.player2;
		row.cells[2].style.textAlign="left";
		row.cells[2].className = "myLink";	
		
		if (g_eventType!="Teams")
		{
			if (g_validPercentageFields)
				row.cells[3+cellOffset].innerHTML = pairs[i].percentage;
			else
				row.cells[3+cellOffset].innerHTML = Number(pairs[i].total_score).toFixed(2);
		}
		else
		{
			row.cells[3].innerHTML = (Number(pairs[i].totalCrossImps)).toFixed(2);
			row.cells[3].style.textAlign = "right";
			row.cells[4].innerHTML = pairs[i].crossImpsBoardsPlayed;
			row.cells[4].style.textAlign = "right";
			row.cells[4].style.borderRight = "1px solid black";
			row.cells[3+cellOffset].innerHTML = (Number(pairs[i].crossImpsPerBoard)).toFixed(2);
		}
			
		var backColor = "#6666FF";
		
		if ((g_validPercentageFields)&(g_eventType!="Teams"))	// Sometimes percentage field is erroneously non-blank for Teams
		{
			var width = (100*pairs[i].percent.toFixed(0))/100;
			width = width + "px";
			var pbar = "<div style=\"float:left;align:left;width:100px;min-width;100px;max-width:100px;height:16px;border:none;background-color:white;\">";
			pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\">";
			pbar = pbar + "</div></div>";
	
			row.cells[4+cellOffset].style.minWidth = "100px";
			row.cells[4+cellOffset].innerHTML = pbar;
			row.cells[4+cellOffset].style.backgroundColor = "white";
		}
		else
		{
			var width;
			
			if (g_eventType=="Teams")
				width = ((100*(pairs[i].crossImpsPerBoard - rangeMin))/(rangeMax - rangeMin)).toFixed(0);
			else
				width = (100*(pairs[i].total_score - rangeMin).toFixed(0))/(rangeMax - rangeMin);
				
			if (width<1) width = 1;	// Fudge factor so that we always see a minimal bar (otherwise bar chart looks as though entry is missing)
			
			width = width + "px";
			var pbar = "<div style=\"float:left;align:left;width:100px;min-width;100px;max-width:100px;height:16px;border:none;background-color:white;\">";
			pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\">";
			pbar = pbar + "</div></div>";
	
			row.cells[4+cellOffset].style.minWidth = "100px";
			row.cells[4+cellOffset].innerHTML = pbar;
			row.cells[4+cellOffset].style.backgroundColor = "white";
			
		}
		
		var nboards = pairs[i].boardsPlayed;
		var pbar = "<div style=\"float:left;align:left;width:141px;min-width;141px;max-width:141px;height:16px;border:none;background-color:white;\">";

		var dd = pairs[i].dd;
		
		var backColor = "#00CC00";	// Green
		var width = (140*dd.ddOverH)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";


		var backColor = "#88FF88";	// Light Green
		var width = (140*dd.ddEqualsH)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";

		var backColor = "#FF0000";	// Red
		var width = (140*dd.ddUnderH)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";

		var backColor = "#ccccff";	// Light Blue
		var width = (140*dd.ddUnknown)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";

		pbar = pbar + "</div>";

		row.cells[5+cellOffset].style.minWidth = "100px";
		row.cells[5+cellOffset].innerHTML = pbar;
		row.cells[5+cellOffset].style.backgroundColor = "white";
		
/*		row.insertCell(-1);
		
		var str="";
		
		str += getPlayerAcc(pairInfo.player1) + "/";
		str += getPlayerAcc(pairInfo.player2);
		
		row.cells[row.cells.length-1].innerHTML = str;*/
	}
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function loadTraveller_2(data,statusText,jqXHR)
{
	if (data!="") dddLoadMakeable(data,statusText,jqXHR,this.bindex);

	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var player1 = info.player1;
	var player2 = info.player2;
	
	var pdirection = 1; // Assume played this board as NS (for singlewinner movement can switch direction
	
	var pairs = g_travellers.event.participants.pair;
	var declarer_pair = false;
	
	var tlines = g_currentTraveller.traveller_line;
	
	var i;

	var found = false;
			
	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];
		
		if (played(tline))
		{
			if (info.pair_found)
			{
				var prole,found,pdirection,declarer_pair,first,opp_pair;
				
				prole = getPlayerAndRole(info,tline);
				found = prole.found;
				pdirection = prole.tdirection;
				declarer_pair = prole.declarer_pair;
				first = prole.first;
				opp_pair = prole.opp_pair;
				
				if (found)
				{
					if (declarer_pair)
					{
						if (first) declarer_name = info.player1;
						else declarer_name = info.player2;
					}
												
					var subHeading = document.getElementById("compSubHeading");
					var hstr = "";
					
					hstr = "Board " +  g_currentTraveller.board_no;
					
					var dirstr = "NS";
					
					if (pdirection==2) dirstr = "EW";
					
					if (info.singleWinner)
						hstr = hstr + ", comparison for pair " + g_hands.pair_number + " playing " + dirstr;
					else
						hstr = hstr + ", comparison for " + dirstr + " pair " + g_hands.pair_number;
						
					hstr = hstr + " (" + player1 + " and " + player2 + ")";
					
					subHeading.innerHTML = "<span style=\"font-size:12px;\">" + hstr + "</span>";
					
					g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);
					
					if (g_currow==-1) continue;	// Didn't play on this traveller
					
					var tline = g_currentTraveller.traveller_line[g_currow];
	
					var str;
					
					if (!validContract(g_hands.boards[g_lastBindex].Contract))
					{
						if (tline.contract=="Passed")
							str = "Board was passed out.";
						else if (tline.contract=="NP")
							str = "Board was not played.";
						else
							str = "Contract not available.";
					}
					else
					{
						str = "Contract was " + g_hands.boards[g_lastBindex].Contract + " by " + g_hands.boards[g_lastBindex].Declarer + " ";
						
						if (declarer_pair)
							str = str + "(" + declarer_name + ")";
						else
						{
							str = str + "(defended by " + player1.split(" ")[0] + " and " + player2.split(" ")[0] + ")";
						}
						
						var contractLevel = Number(g_hands.boards[g_lastBindex].Contract.charAt(0));
						var overtricks = tline.tricks - (contractLevel + 6);
						
						str = str + " making " + tline.tricks + " tricks";
						
						if (overtricks>0)
							str = str + " (" + overtricks + " overtricks)";
						else if (overtricks<0)
							str = str + " (" + (-overtricks) + " off)";
					}
		
					var nspts = Number(tline.ns_match_points);
					var ewpts = Number(tline.ew_match_points);
					
					if (g_scoring!="IMP")
					{
						var percent = 100*(nspts/(nspts + ewpts));
						
						if (pdirection==2) percent = 100 - percent;
						
						percent = parseFloat(Math.round(percent * 100) / 100).toFixed(0);
						var pbar = document.getElementById("pbar");
						var width = Math.round((percent*150)/100);
						width = width + "px";
						pbar.style.width = width;
						pbar.style.minWidth = width;
						pbar.style.MaxWidth = width;
						pbar.style.backgroundColor = "#55ff55";	// green
									
						document.getElementById("percentValue").innerHTML = percent + "%";
						$("#percentValue").show();
						$("#ourPercentage").show();
					}
					else
					{
						$("#percentValue").hide();
						$("#ourPercentage").hide();
					}
					
					if (validContract(g_hands.boards[g_lastBindex].Contract))
					{
						if (((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined")&checkBoardValid(g_lastBindex))
						{
							var ntricks2 = getMakeableTricksForContract(g_lastBindex,g_hands.boards[g_lastBindex].Contract,g_hands.boards[g_lastBindex].Declarer);
							
							if (tline.tricks==ntricks2)
								str = str + ", the same number predicted by double dummy analysis."
							else if (tline.tricks<ntricks2)
							{
								var shortfall = ntricks2 - tline.tricks;
								str = str + ", " + shortfall + " fewer than predicted by double dummy analysis.";
							}
							else
							{
								var excess = tline.tricks - ntricks2;
								str = str + ", " + excess + " more than predicted by double dummy analysis.";				
							}
				
						}
					}
	
					var ourscore = tline.score;
					var res = compareScores(g_travellers.event.board[getTravIndex(g_lastBindex)].traveller_line,ourscore,pdirection);
		
					if (res.adjusted>0)	// We received a percentage instead of score (don't say anything.
					{
					}
					else if ((res.lower==0)&(res.higher==0)) str = str + " This was a completely flat board.";
					else if (res.higher==0)
					{
						if (res.same==0) str = str + " This was an outright top score.";
						else str = str + " This was a joint top with " + res.same + " other pairs.";
					}				
					else if (res.lower==0)
					{
						if (res.same==0) str = str + " This was an outright bottom score."
						else str = str + " This was a joint bottom with " + res.same + " other pairs.";
					}
					else
						str = str + " There were " + res.higher + " higher scoring and " + res.lower + " lower scoring pairs on this board."
					
					var ns = "NS";
					var ew = "EW";
					var str2 = "";
					
						// Temporarily disable this output.
/*
					if (((pdirection==1)&(ns.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1))|
						((pdirection==2)&(ew.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1)))
					{
							// we were declarer
						// *** need to change this line if used: checkHigherScoringPairs(g_currentTraveller.traveller_line,g_currow,pdirection);
						
					}*/
					
					document.getElementById("comparisonText").innerHTML = "<span style=\"font-size:12px;\">" + str + str2 + "</span>";		
					
	//				getInfoForSimilarContracts(g_currow,g_hands.direction);
		
					break;
				}
			}
		}
	}
	
	if (!found)
	{
		var str = "The currently selected pair (" + player1 + " & " + player2 + ") did not play this board.";
		str = str + " Colour coding of table below is from point of view of NS pairs."
		document.getElementById("compSubHeading").innerHTML = str;
		document.getElementById("percentValue").innerHTML = "";
		$("#ourPercentage").hide();
		$("#comparisonText").hide();
	}
	else
	{
		if (g_scoring!="IMP")
			$("#ourPercentage").show();
		else
			$("#ourPercentage").hide();
			
		$("#comparisonText").show();
	}
	
	displayTraveller(pdirection);
	
	hideSpinner();
	hideAllPopups();
	$("#scoreandtraveller").hide();	
	hideRanking();
	$("#scores").hide();
	$("#comparison").show();
	$("#checkListDiv").hide();
	$("#abuttons").show();	
}

function getLeadsIdx(contract,declarer)
{
	var decl = "WNES";
	var suits = "NCDHS";
	var idx;
	
	var suit = contract.charAt(1);
	var leaderIdx = decl.indexOf(declarer);
	var suitIdx = suits.indexOf(suit);
	var idx = 4*suitIdx + leaderIdx;
	
	return idx;
}

function getTlineForPair(boardIndex,info)
{
		// Return traveller line containing data for this pair playing this board. Also returns direction in which
		// the pair were sitting when playing the board. Returns null if the pair didn't play this board.
	var k;
	var result = new Object();
	
	var tindex = getTravIndex(boardIndex);
	
	if (tindex==null) return null;
	
	var tlines = g_travellers.event.board[tindex].traveller_line;
	
	for (k=0;k<tlines.length;k++)
	{
		var tline = tlines[k];
		var x = tline.ns_pair_number;			
		
		if (((info.pair_number==tline.ns_pair_number)&((info.direction==1)|info.singleWinner)))
		{
			result.direction = 1;
			result.tline = tline;
			return result;
		}
		else if (((info.pair_number==tline.ew_pair_number)&((info.direction==2)|info.singleWinner)))
		{
			result.direction = 2;
			result.tline = tline;
			return result;
		}
	}

	return null;
}

function getDirectionForTline(tline,info)
{
}

function ddComparisonAll()
{
	var i,j,k;
	var rankInfo = getRankingInfo();
	var singleWinner = rankInfo.sessInfo.singleWinner;
	
	var ddNS = new Array();
	var ddEW = new Array();
	
	for (i=0;i<rankInfo.rankNS.length;i++)
	{
		var data = new Object();
		data.pair = rankInfo.rankNS[i].pair;
		data.ddUnderH = 0;
		data.ddOverH = 0;
		data.ddEqualsH = 0
		data.ddUnknown = 0;
		ddNS[data.pair] = data;
	}
	
	for (i=0;i<rankInfo.rankEW.length;i++)
	{
		var data = new Object();
		data.pair = rankInfo.rankEW[i].pair;
		data.ddUnderH = 0;
		data.ddOverH = 0;
		data.ddEqualsH = 0;
		data.ddUnknown = 0;
		ddEW[data.pair] = data;
	}
	
		// Fill in contract, lead card, declarer in all hand records.
	for (j=0;j<g_hands.boards.length;j++)
	{
		for (i=0;i<g_travellers.event.board.length;i++)
		{
			if (g_travellers.event.board[i].board_no==g_hands.boards[j].board)
			{
				var tlines = g_travellers.event.board[i].traveller_line;
				
				for (k=0;k<tlines.length;k++)
				{
					var tline = tlines[k];
					
					var ddUnknown = true;
										
					if (tline.tricks!="")
					{
						var ddmakeable = getMakeableTricksForContract(j,tline.contract,tline.played_by);

						if (ddmakeable>=0)
						{
							ddUnknown = false;
							
							var declarerOverTricks = tline.tricks - ddmakeable;
							var defenceOverTricks = -declarerOverTricks;
							var relTricks = tline.tricks - ddmakeable;
							
							var ETFMode = document.getElementById("ETFMode");
							
							if (ETFMode!=null)
							{
								if (ETFMode.selectedIndex==1)
								{
									var ltricks = getMakeableTricksForLead(j,tline);
									
									if (ltricks!=null)
										declarerOverTricks = tline.tricks - ltricks;
								}
							}
							
							var nsDeclarer = true;
							
							if ((tline.played_by=="E")|(tline.played_by=="W"))
								nsDeclarer = false;
								
							var pair = tline.ns_pair_number;
							var nsOverTricks = declarerOverTricks;
							
							if (!nsDeclarer) nsOverTricks = defenceOverTricks;
							
							if (nsOverTricks==0) ddNS[pair].ddEqualsH++;
							else if (nsOverTricks<0) ddNS[pair].ddUnderH++;
							else ddNS[pair].ddOverH++;
							
							pair = tline.ew_pair_number;
							var ewOverTricks = declarerOverTricks;
							
							if (nsDeclarer) ewOverTricks = defenceOverTricks;
							
							if (singleWinner)
							{
								if (ewOverTricks==0) ddNS[pair].ddEqualsH++;
								else if (ewOverTricks>0) ddNS[pair].ddOverH++;
								else ddNS[pair].ddUnderH++;
							}
							else
							{
								if (ewOverTricks==0) ddEW[pair].ddEqualsH++;
								else if (ewOverTricks>0) ddEW[pair].ddOverH++;
								else ddEW[pair].ddUnderH++;
							}
						}
					}
					
					if (played(tline)&ddUnknown)	// Passed, percentage awarded or no data for double dummy contract
					{
						var pair = tline.ns_pair_number;
						
						if ((typeof ddNS[pair])!="undefined")	// Pair is a valid pair because it's in the ranking table
							ddNS[pair].ddUnknown++;
							
						pair = tline.ew_pair_number;
						
						if (!singleWinner)
						{
							if ((typeof ddEW[pair])!="undefined") ddEW[pair].ddUnknown++;
						}
						else
						{
							if ((typeof ddNS[pair])!="undefined") ddNS[pair].ddUnknown++;		
						}
					}
				}
			}
		}
	}
	
	for (i=0;i<rankInfo.rankNS.length;i++)
	{
		rankInfo.rankNS[i].dd = ddNS[rankInfo.rankNS[i].pair];
	}
	
	for (i=0;i<rankInfo.rankEW.length;i++)
	{
		rankInfo.rankEW[i].dd = ddEW[rankInfo.rankEW[i].pair];
	}
	
	return rankInfo;
}

function getTravellerForBoard(bindex)
{
	var i;
	var traveller = null;
	
	for (i=0;i<g_travellers.event.board.length;i++)
	{
		if (g_travellers.event.board[i].board_no==g_hands.boards[bindex].board)
		{
			if (g_travellers.event.board[i].traveller_line.length!=0)
			{
				return g_travellers.event.board[i];
				break;
			}
		}
	}
	
	return null;
}

function setCurrentTraveller()
{
	g_currentTraveller = getTravellerForBoard(g_lastBindex);
	return g_currentTraveller;
}

function checkContract(bindex,trindex)
{
	var decl="NESW";
	var suits = "NSHDC";
	var result = new Object();
	result.valid = true;
	result.leadDeclError = false;
	result.possibleWrongPolarity = false;
	result.shortSuit = false;
	result.possibleSuitDeclError = false;
		
	if (!checkBoardValid(bindex))	// No Hand Record for this board
		return result;
		
	if (g_travellers==null) return result;	// No travellers, only hands records for this event.
	
	var traveller = getTravellerForBoard(bindex);
	
	if (traveller==null) return result;
	
	var line = traveller.traveller_line[trindex];
	
	if (validContract(line.contract))
	{
		var dcl = decl.indexOf(line.played_by);
		var partner = dcl + 2;
		partner = partner % 4;
		var leader = dcl + 1;
		if (leader>3) leader = 0;
		
		var declSuit = suits.indexOf(line.contract.charAt(1));
		result.declSuit = declSuit;
		
		if (declSuit>0)		// i.e. Not a NoTrump contract, so check combined trump suit length
		{
			var hand = g_hands.boards[bindex].Deal[dcl];
			hand = hand.split(".");
			var tks = hand[declSuit-1].length;
			var maxSuitLength = tks;
			
			hand = g_hands.boards[bindex].Deal[partner];
			hand = hand.split(".");
			
			if (hand[declSuit-1].length>maxSuitLength)
				maxSuitLength = hand[declSuit-1].length;
				
			var tks = tks + hand[declSuit-1].length;
			
			if ((tks<7)&(maxSuitLength<5))
			{
				result.valid = false;
				result.shortSuit = true;
				result.combinedSuitLength = tks;
			}
		}
		
		if (line.tricks>=7)	// They made a contract in this suit, is it likely ?
		{	
			var oppIndx1 = (dcl+1)%4;
			var oppIndx2 = (dcl+3)%4;
			
			var oppTks1 = getMakeableTricksForContract(bindex,line.contract,decl.charAt(oppIndx1));
			var oppTks2 = getMakeableTricksForContract(bindex,line.contract,decl.charAt(oppIndx2));
			
			if ((oppTks1>=9)|(oppTks2>=9))
			{
				result.valid = false;
				result.possibleSuitDeclError = true;
			}
		}
		
		if (line.lead!="")	// check lead card is consistent with declarer
		{
			var curlead = leadCard(line.lead).replace("10","T");
			
			var suit = curlead.charAt(1);
			var card = curlead.charAt(0);
			
			hand = g_hands.boards[bindex].Deal[leader];
			
			hand = hand.split(".");
			
			if (hand[suits.indexOf(suit)-1].indexOf(card)==-1)
			{
				var reason = "";
				var partner = leader + 2;
				partner = partner % 4;
				hand = g_hands.boards[bindex].Deal[partner];
				
				hand = hand.split(".");
				
				if (hand[suits.indexOf(suit)-1].indexOf(card)!=-1)
					result.possibleWrongPolarity = true;
					
				result.valid = false;
				result.leadDeclError = true;
				return result;
			}
			else
				return result;
		}
		else
			return result;
	}
	else
		return result;
}

function getRequestedLeads(bindex)
{
	var i;
	
	if (g_travellers==null) return "";	// No travellers, only hands records for this event.
	
	var traveller = getTravellerForBoard(bindex);
	
	if (traveller==null) return "";
	
	var leadsRequired = new Array();
	
	for (i=0;i<20;i++) leadsRequired[i] = 0;
	
	var lines = traveller.traveller_line;
	
			// Build up request string for required opening lead information for this traveller.
	for (i=0;i<lines.length;i++)
	{
		if (validContract(lines[i].contract))
		{
			var idx = getLeadsIdx(lines[i].contract,lines[i].played_by);
			leadsRequired[idx] = 1;
			
			if (lines[i].lead!="") g_travellersHaveLeads = true;
		}
	}
	
	var leadstr = "";
	
	for (i=0;i<20;i++) leadstr = leadstr + leadsRequired[i];
	
	if (leadstr.indexOf("1")!=-1) return leadstr;
	else return "";
}

function showComparison()
{
	g_sessionMode = "traveller";
	setButtonColor();
	
		// Display the information extracted from the traveller for the current board
	var i;
	
	setCurrentTraveller();
	
	if (g_currentTraveller!=null)
	{
		if (((typeof g_hands.boards[g_lastBindex].openingLeads)=="undefined")&!g_backgroundFetchCompleted)
		{
			if ((typeof g_hands.boards[g_lastBindex].Deal)!="undefined")
			{
				var leadstr = getRequestedLeads(g_lastBindex);
				
				calculateMakeableContracts(loadTraveller_2,leadstr,g_lastBindex);
			}
			else	// No Hand Data available
			{
				this.bindex = g_lastBindex;
				loadTraveller_2("","","");
			}
		}
		else
		{
			this.bindex = g_lastBindex;
			loadTraveller_2("","","");
		}
	}
	else
	{
		hideAllPopups();
		$("#scoreandtraveller").hide();	
		hideRanking();
		$("#scores").hide();
		$("#abuttons").show();	

		displayErrorAbsPosition("no traveller available for current board",300,250);
	}
}

function showCurrentBoard()
{
	log("button=PlayItAgain");
	
	g_playItAgain = true;

	if ((typeof g_hands.boards[g_lastBindex].Deal)!="undefined")
	{
		hideRanking();
		$("#scores").hide();
		$("#comparison").hide();
		$("#checkListDiv").hide();
		$("#abuttons").hide();
		$("#scoreandtraveller").show();
		$("#mainTitle").show();
		g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
	}
	else
		displayErrorAbsPosition("No hand diagram available for this board",300,200);
}

function travellersNotFound(jqXHR,textStatus,errorThrown)
{
		// Travellers not found
	clearTravellersLocalStorage();
	hideSpinner();
	resetTimeout();
	this.callback();
}

function setDefaultContracts()
{
	var i,j,k;
	
	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	
		// Create blank hand records for any travellers which do not have them.
	for (i=0;i<g_travellers.event.board.length;i++)
	{
		var bindex = getBoardIndex(i);
		
		if (bindex==null)		// No board for this traveller
		{
			var newindex = g_hands.boards.length;
			g_hands.boards[newindex] = new Object();
			g_hands.boards[newindex].board = "" + g_travellers.event.board[i].board_no;
		}
	}
	
		// Fill in contract, lead card, declarer, and all leads from traveller in all hand records.
	for (j=0;j<g_hands.boards.length;j++)
	{
		var leadstr = getRequestedLeads(j);
		
		if (leadstr!="") g_hands.boards[j].requestedLeads = leadstr;	// used to determine which declarer/suit combinations to calculate optimum leads for
		
		var found = false;
		
		for (i=0;i<g_travellers.event.board.length;i++)
		{
			if (g_travellers.event.board[i].board_no==g_hands.boards[j].board)
			{
				var tlineData = getTlineForPair(j,info);
				
				if (tlineData!=null)
				{
					var tline = tlineData.tline;
					
					if (!setHandRecordFromLin(j,tline))
					{
						var tlDirection = tlineData.direction;
						
						g_hands.boards[j].Declarer = tline.played_by;
						g_hands.boards[j].Contract = tline.contract;
						
						var played = new Array();
						
						var lead = leadCard(tline.lead).replace("10","T");
						
						if (lead.length==2)
						{
							lead = lead.charAt(1) + lead.charAt(0);
						}
						else
							lead = "  ";
							
						played[0] = lead;
						g_hands.boards[j].Played = played;	// Opening Lead for current pair
						g_hands.boards[j].Bids = new Array();
					}
					
					found = true;
					break;
				}
			}
		}
		
		if (!found)
		{
			delete g_hands.boards[j].Declarer;
			delete g_hands.boards[j].Contract;
		}
	}
}

function loadTraveller_1(data,statusText,jqXHR,context)
{
/*	var players = new Array();*/
	
	hideSpinner();
	resetTimeout();
	
/*	if (g_hands.lin!=="")
	{
		try {
			var tmp = JSON.parse(linToJson(g_hands.lin));
			var bd = tmp.boards[0];
			if ((typeof bd.PlayerNames)!=="undefined")
			{
				for (var i=0;i<4;i++)
					players[i] = bd.PlayerNames[i];
			}
		} catch (e) {};
	}*/
	
	if (data!="")
	{
		if (g_travellers==null)
		{
			if (g_xml!="")
			{
				if (g_debug)
					alert(data);
					
				data = convertXML(data);	// convert it to json
				
				if (g_debug)
					alert(JSON.stringify(data));
			}
				
			g_travellers = eval("(" + data + ")");
			
			if ((typeof g_travellers.event.participants.pair)!="undefined")
			{
				var i;
				
				var pairs = g_travellers.event.participants.pair;
				
					// Standardise representation of direction.
				for (i=0;i<pairs.length;i++)
				{
					if (pairs[i].direction=="NS") pairs[i].direction="N";
					else if (pairs[i].direction=="EW") pairs[i].direction="E";
				}
			}
			
			getSessionInfo();	// Set up details of session.
			
			if (g_eventType=="Teams")
			{
				calculateCrossImps();
				calculateMaxImps();
				g_rankInfo = null;
				getRankingInfo();
			}
		}
		
		var i;
		
		for (i=0;i<g_travellers.event.participants.pair.length;i++)
		{
			var data = g_travellers.event.participants.pair[i];
		}
		
		for (var i=0;i<g_travellers.event.board.length;i++)
		{
			var tlines = g_travellers.event.board[i].traveller_line;
			
			for (var j=0;j<tlines.length;j++)
			{
				if ((typeof tlines[j].lindata)!="undefined")
				{
					if (typeof tlines[j].board=='undefined')	// If fetched from cache it may have been converted already
					{
						try {
							var lind = decodeURIComponent(tlines[j].lindata.replace(/\\'/g,"'"));
							var tmp = eval("(" + linToJson(lind) + ")");
							tlines[j].board = tmp.boards[0];
							
/*							if ((typeof tmp.boards[0].PlayerNames)!=="undefined")
							{
								try {
									if ((players.length>0)&(players.length==tmp.boards[0].PlayerNames.length))
									{
										var found = true;
								
										for (var k=0;k<players.length;k++)
											if (players[k]!==tmp.boards[0].PlayerNames[k]) found = false;
									}
									
									if (found)
									{
										alert("found it: " + j);
										g_currow = j;
									}
								} catch (e) {};
							}*/
						} catch (e) {
							tlines[j].lindata = "";
						};
					}
				}
			}
		}
		
		setDefaultContracts();
	}
	
	context.callback(context);
}

function needToAnalyse()
{
	var result = false;
	
	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (checkBoardValid(i))
		{
			if (((typeof g_hands.boards[i].DoubleDummyTricks)=="undefined")|(g_hands.boards[g_lastBindex].DoubleDummyTricks == "********************")|(g_hands.boards[g_lastBindex].DoubleDummyTricks == "--------------------"))
				return true;
				
			if (((typeof g_hands.boards[i].OptimumScore)=="undefined")|(g_hands.boards[i].OptimumScore==""))
				return true;
				
			if (g_travellers!=null)
			{
				getRequestedLeads(i);
				if (g_travellersHaveLeads)
					return true;
			}
		}
	}
}

function localStorageSupported() {
	try {
		return "localStorage" in window && window["localStorage"] !== null;
	} catch (e) {
		return false;
	}
}

function saveEventLocalStorage(data)
{
	if (localStorageSupported())
	{
		try {
			localStorage.setItem("bwjson",data);
		} catch (e) {clearTravellersLocalStorage();};
	}
}

function loadTraveller(data,statusText,jqXHR)
{
	try {
		localStorage.removeItem("bwjson");
		localStorage.setItem("bwtime","" + Date.now());
	} catch (e) {clearTravellersLocalStorage();};

	saveEventLocalStorage(data);
	loadTraveller_1(data,statusText,jqXHR,this);
}

function getPBNSegment(data)
{
		// Return information for one board from the PBN data and also remove these lines from the original array
	var i;
	
	for (i=0;i<data.length;i++)
	{
		if (data[i].trim().length==0)
			break;
	}
	
		//Return rows up to and including i, and remove them from the data array,
	return data.splice(0,i+1);
}

function getLine(data,s,resetFlag)
{
		// Used by pbnToJson function
	var line;
	var i;
	
	for (i=0;i<data.length;i++)
	{
		line = data[i];
		var pos = line.indexOf(s);
		
		if (pos!=-1)
		{
			line = line.substring(s.length);
			pos = line.indexOf('"');
			line = line.substring(pos+1);
			pos = line.indexOf('"');
			line = line.substring(0,pos);
			if (!resetFlag) data.splice(0,i+1);
			return line;
		}
	}
	
	return null;
}	

function downloadFile(text, fileType, fileName) {
  var blob = new Blob([text], { type: fileType });
  var a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.click();
  a.remove();
}

function generatePBN(all)
{
	var str="";
	var nboards = g_hands.boards.length;
	
	var suits = ["NT"," S"," H"," D"," C"];
	var declarer = "NSEW";
	var i,j,k;
	
	str += "% PBN 2.1\r\n";
	str += "% EXPORT\r\n";
	str += "%Content-type: text/x-pbn; charset=ISO-8859-1\r\n";
	str += "%Creator: Bridge Solver Online\r\n";
	
	var lo = 0;
	var hi = nboards;
	
	if (all==false)
	{
		lo = g_lastBindex;
		hi = lo+1;
	}
	
	for (i=lo;i<hi;i++)
	{
		if ((typeof g_hands.boards[i].Deal)=="undefined") continue;

		str += "[Event \"\"]\r\n";
		str += "[Site \"\"]\r\n";
		str += "[Date \"\"]\r\n";
		
		var boardName = g_hands.boards[i].board;
		
		str += "[Board \"" + boardName + "\"]\r\n";
		str += "[West \"\"]\r\n";
		str += "[North \"\"]\r\n";
		str += "[East \"\"]\r\n";
		str += "[South \"\"]\r\n";
		str += "[Dealer \"" + g_hands.boards[i].Dealer + "\"]\r\n";
		str += "[Vulnerable \"" + g_hands.boards[i].Vulnerable + "\"]\r\n";
		
		var board = g_hands.boards[i];
		var deal = board.Deal;
		
		str += "[Deal \"" + g_hands.boards[i].Dealer.charAt(0) + ":";
		
		var dealer = g_hands.boards[i].Dealer.charAt(0);
		
		var index = 0;
		
		if (dealer=='N') index = 0;
		else if (dealer=='E') index = 1;
		else if (dealer=='S') index = 2;
		else index = 3;
		
		for (j=0;j<4;j++)
		{
			str += deal[index];
			
			if (j!=3) str += " ";
			
			index++;
			if (index==4) index=0;
		}
		
		str += "\"]\r\n";
		
		str += "[Scoring \"\"]\r\n";
		str += "[Declarer \"\"]\r\n";
		str += "[Contract \"\"]\r\n";
		str += "[Result \"\"]\r\n";

		if ((typeof board.DoubleDummyTricks)!="undefined")
		{
			var doubleDummyTricks = board.DoubleDummyTricks;
			str += "[DoubleDummyTricks \"" + doubleDummyTricks + "\"]\r\n";
			
			str += "[OptimumResultTable \"Declarer;Denomination\\2R;Result\\2R\"]\r\n";
			
			for (j=0;j<4;j++)
			{
				for (k=0;k<5;k++)
				{
					str += declarer.charAt(j) + " " + suits[k] + " ";
					
					var tricksChar = doubleDummyTricks.charAt(5*j + k);
					
					var tricks = 0;
					var tricksStr = "";
					
					if ((tricksChar!='*')&(tricksChar!='-'))
					{
						tricks = parseInt(tricksChar,16);
						
						tricksStr = "" + tricks;
						if (tricksStr.length<2) tricksStr = " " + tricksStr;
					}
					else
					{
						tricksStr = " 0";
					}
					
					str += tricksStr + "\r\n";
				}
			}

		}
		
		if ((typeof board.OptimumScore)!="undefined")
			str += "[OptimumScore \"" + board.OptimumScore + "\"]\r\n";
		
		str += "\r\n";
	}
	
	log("button=save");
	downloadFile(str, "text/pbn", "boards.pbn");
}

function stripComments(fileData)
{
	var outData = "";
	var inbComment = false; // for comments preceded by a curly bracket
	var insComment = false; // for comments preceded by a semicolon
	var bJustEnded = false;
	var escChar = true;
	var i;
	
	for (i=0;i<fileData.length;i++)
	{
		var c = fileData.charAt(i);
		
		if (bJustEnded)
		{
			bJustEnded = false;
			
			if (c=="\n")
			{
						// Don't write new line terminator if removing comment has left an empty line.
				if ((outData.length!=0)&(outData.charAt(outData.length-1)!="\n")) 
					outData += "\n";
				
				escChar = true;
				continue;
			}
		}
		
		if (insComment)
		{
			if (c=="\n")
			{
				insComment = false;
				
					// Don't write new line terminator if removing comment has left an empty line.
				if ((outData.length!=0)&(outData.charAt(outData.length-1)!="\n")) 
					outData += "\n";
				
				escChar = true;
				continue;
			}
		}
		
		if (inbComment)
		{
			if (c=="}")
			{
				inbComment = false;
				bJustEnded = true;
				escChar = false;
				continue;
			}
		}
		
		if ((!inbComment)&(!insComment))
		{
			if ((c==';')&escChar)
				insComment = true;
			else if ((c=='{')&escChar)
				inbComment = true;
			else
			{
				outData += c;
				
				if ((c==' ')|(c=='\n'))
					escChar = true;
				else
					escChar = false;
			}
		}
	}
	
	return outData;
}

function pbnToJson(fileData)
{
		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	  }
	}
	
	g_fullInfo = true;	// Assume makeable contracts table contains full information
	
	var defaultBoard = 1;

		// This routine only works for PBN files that conform to "Export Format"
		// First convert the different types of line endings to a single "\n"
	fileData = fileData.replace(/\r\n/g,"\n");
	fileData = fileData.replace(/\r/g,"\n");
	fileData = stripComments(fileData);
	fileData = fileData.split("\n");
	
	var line = "";
	var outStr = "{\"boards\":[";
	
	var count = 0;
	
	var i,tmp;
	
	while (fileData.length>0)
	{	
		var data = getPBNSegment(fileData);
		
		tmp=getLine(data,"[Board",true);

		if (tmp===null)
		{
			tmp = "" + defaultBoard++;
		}
		
		var dealer = getLine(data,"[Dealer",true);
		var vulStr = getLine(data,"[Vulnerable",true);
		var deal = getLine(data,"[Deal ",true);	// Include space to distinguish from "Dealer" keyword.
	
		if ((dealer!==null)&(vulStr!==null)&(deal!==null))
		{
			if ((dealer!="")&(vulStr!="")&(deal!=""))
			{
				if (count!=0) outStr = outStr + ",";
	
				count++;
				outStr = outStr + "{\"board\":\"" + tmp + "\",";
				outStr = outStr + "\"Dealer\":\"" + dealer + "\",";
				
				if ((vulStr=="Love")|(vulStr=="-")) vulStr = "None";
				if (vulStr=="Both") vulStr = "All";
				
				outStr = outStr + "\"Vulnerable\":\"" + vulStr + "\",";			
				outStr = outStr + "\"Deal\":[";
				
				var first = deal.charAt(0);
				deal = deal.substring(deal.indexOf(':')+1).trim();
				
				var lang = identifyHonourCardSet(deal,lang);
				deal = convertToJQKA(deal,lang);
				
				var index = 0;
				
				if (first=='N')
					index = 0;
				else if (first=='S')
					index = 2;
				else if (first=='W')
					index = 3;
				else if (first=='E')
					index = 1;
				
				var hands2 = deal.split(" ");
				var hands = new Array(4);
				
				for (i=0;i<4;i++)
				{
					if (hands2[i].trim()=="-")
						hands2[i] = "...";	// Empty hand
					
					hands[index] = hands2[i];
					index++;
					
					if (index>3) index = 0;
				}
	
				for (i=0;i<4;i++)
				{
					outStr = outStr + "\"" + hands[i] + "\"";
					
					if (i!=3) outStr = outStr + ",";
				}
				
				outStr = outStr + "],";
				
				var ddum = "********************";
				
				var optScore = getLine(data.slice(0),"[OptimumScore",true);
				
				if (optScore!==null)
				{
					outStr = outStr + "\"OptimumScore\":\"" + optScore + "\",";
				}
				
				var optPresent = getLine(data,"[OptimumResultTable",false);
				
				if (optPresent!==null)
				{
					var trickCount = new Array(20);
					var idx = new Array(20);
					
					for (i=0;i<20;i++)
					{
						trickCount[i] = 0;
						idx[i] = 0;
					}
					
					for (i=0;i<20;i++)
					{
						var ctr;
						
						if (i<data.length)
							ctr = data[i];
						else	// end of file
						{
							break;
						}
	
						ctr = ctr.trim();
						
						if (ctr.length==0) continue;	// Ignore blank lines
						
						if (ctr.charAt(0)=='[')		// No more entries in table, rewind and start search for new board
						{
							break;
						}
						
						ctr = ctr.trim();
						var comp = ctr.split(/ +/);
					
						var decl = comp[0].trim().toUpperCase().charAt(0);
						
						if (decl=='N') idx[i] = 0;
						else if (decl=='S') idx[i] = 5;
						else if (decl=='E') idx[i] = 10;
						else if (decl=='W') idx[i] = 15;
						
						var cont = comp[1].trim().toUpperCase().charAt(0);
						
						if (cont=='N') idx[i] = idx[i] + 0;
						else if (cont=='S') idx[i] = idx[i] + 1;
						else if (cont=='H') idx[i] = idx[i] + 2;
						else if (cont=='D') idx[i] = idx[i] + 3;
						else if (cont=='C') idx[i] = idx[i] + 4;
						
						trickCount[i] = parseInt(comp[2]);
					}
					
					var fullInfo = false;	// Set true if full information is present in the table (not just for makeable contracts);
					
					for (i=0;i<20;i++)
					{
						if ((trickCount[i]>1)&(trickCount[i]<7))
						{
								// 0 1nd 1 are often used to indicate number of tricks for a particular contract is not present, but any value
								// in range 2 to 7 inclusive suggests that full information is present.
							fullInfo = true;
							break;
						}
					}
					
					if (!fullInfo) g_fullInfo = false;
					
					for (i=0;i<20;i++)
					{
						if (!fullInfo)
							if (trickCount[i]<7) trickCount[i] = -1;
						
						if (trickCount[i]>=0)
							ddum = setCharAt(ddum,idx[i],parseInt(trickCount[i]).toString(16).trim().charAt(0));
						else
							ddum = setCharAt(ddum,idx[i],'-');						
					}
				}
				else
				{
					g_fullInfo = false;
				}
				
				outStr = outStr + "\"DoubleDummyTricks\":\"" + ddum + "\"}";
			}
		}
	}
	
	outStr = outStr + "]}";
	return outStr;
}

function dlmToJson(data)
{
	var dealerPattern = "NESW";
	var vulnerabilityPattern = ["None","NS","EW","All","NS","EW","All","None","EW","All","None","NS","All","None","NS","EW"];
	var cards = "AKQJT98765432";
	var hands = new Array();
	var quadrant = new Array();
	
		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	  }
	}
	
	g_fullInfo = false;	// Board set does not contain full double dummy tricks information.

		// This routine only works for PBN files that conform to "Export Format"
	data = data.split("\n");
	
	var line = "";
	var outStr = "{\"boards\":[";
	
	var count = 0;
	
	var i,j,k,tmp;
	var first=1;
	var last=0;
	
	var j = 0;
	
	for (k=j;k<data.length;k++)
	{
		tmp = data[k];
		
		if (tmp.length==0) break;
		if (!(tmp.indexOf("From board=")==0)) continue;
		tmp = tmp.substring(11);
		first = Number(tmp);
		break;
	}
	
	j = k+1;
	
	for (k=j;k<data.length;k++)
	{
		tmp = data[k];
		
		if (tmp.length==0) break;
		if (!(tmp.indexOf("To board=")==0)) continue;
		tmp = tmp.substring(9);
		last = Number(tmp);
		break;
	}
	
	j = k+1;
	
	var line = "";
	var count = 0;
	
	for (k=j;k<data.length;k++)
	{
		tmp=data[k];
	
		if (tmp.length==0) break;
		if (!(tmp.indexOf("Board ")==0)) continue;
		
		tmp = tmp.substring(6);
		
		var num = tmp.substring(0,2);
		var encodedDeal = tmp.substring(3);
		
		if (num.charAt(0)=='0') num = num.substring(1,2);
		
		var boardNum = Number(num);
		
		if (boardNum>last) break;
		
		if (count!=0) outStr = outStr + ",";
		count++;
		
		outStr = outStr + "{\"board\":\"" + boardNum + "\",";
		outStr = outStr + "\"Dealer\":\"" + dealerPattern.charAt((boardNum-1)%4) + "\",";
		outStr = outStr + "\"Vulnerable\":\"" + vulnerabilityPattern[(boardNum-1)%16] + "\",";			
		
		for (i=0;i<4;i++)
			hands[i] = "";
			
		for (i=0;i<26;i++)
		{
			var x = encodedDeal.charCodeAt(i) - 97;
			quadrant[2*i] = x>>2;
			quadrant[2*i + 1] = x&3;
		}
		
		for (i=0;i<52;i++)
		{
			if ((i!=0)&((i%13)==0))
			{
				for (j=0;j<4;j++)
				{
					hands[j] = hands[j] + ".";
				}
			}
			
			hands[quadrant[i]] = hands[quadrant[i]] + cards.charAt(i%13);
		}
		
		outStr = outStr + "\"Deal\":[";
		
		for (i=0;i<4;i++)
		{
			outStr = outStr + "\"" + hands[i] + "\"";
			if (i!=3) outStr = outStr + ",";
		}
		
		outStr = outStr + "],";
		
		outStr = outStr + "\"DoubleDummyTricks\":\"********************\"}";
	}

	outStr = outStr + "]}";
		
	return outStr;
}

function convertHand(cards,hand)
{
	var str = "";
	var suits = "SHDC";
	var values = "23456789TJQKA";
	var suitIndex = 0;
	var currentHand = new Array();
	var i,j;
	
	for (i=0;i<4;i++)
	{
		currentHand[i] = new Array();
		
		for (j=0;j<13;j++)
			currentHand[i][j] = 0;
	}
	
	for (i=0;i<hand.length;i++)
	{
		var cchar = hand.charAt(i);
		
		if ((cchar=='S')|(cchar=='H')|(cchar=='D')|(cchar=='C'))
		{
			suitIndex = suits.indexOf(cchar);
			if (cchar!='S') str = str + ".";
		}
		else
		{
			currentHand[suitIndex][values.indexOf(cchar)] = 1;
			cards[suitIndex][values.indexOf(cchar)] = 1;
		}
	}
	
	str = "";
	
	for (i=0;i<4;i++)
	{
		for (j=12;j>=0;j--)
		{
			if (currentHand[i][j]!=0)
				str = str + values.charAt(j);
		}
		
		if (i!=3)
			str = str + ".";
	}
	
	return str;
}

function inferHand(cards)
{
	var suits = "SHDC";
	var values = "23456789TJQKA";
	var suitIndex = 0;
	var hand = "";
	var i,j;
	
	for (i=0;i<4;i++)
	{
		hand = hand + suits.charAt(i);
		
		for (j=0;j<13;j++)
		{
			if (cards[i][j]==0)
			{
				hand = hand + values.charAt(j);
			}
		}
	}
	
	return convertHand(cards,hand);
}

function writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,pnames_g,score)
{
	var outStr = "";
	var direction = "NESW";
	var i;
	var namOffset = 0;
	var names = new Array();
	
	if ((boardStr.indexOf(".Closed")!=-1)&(pnames_g.length==8)) namOffset = 4;
	
	if (pnames.length>0)
		names = pnames;
	else if (pnames_g.length>0)
	{
		for (var i=0;i<4;i++)
			names[i] = pnames_g[i+namOffset];
	}
	
	outStr = outStr + "{\"board\":\"" + boardStr + "\",";
	
	if (names.length>0)
	{
		outStr += "\"PlayerNames\":[";
		
		for (i=0;i<names.length;i++)
		{
			if (i!=0) outStr += ",";
			var pname = names[i].trim();
			if (pname.indexOf("~~")==0) pname = pname + " (Robot)";
			outStr += "\"" + pname + "\"";

			var entry = new Object();
			entry.transList = new Object();
			g_accTrans[pname] = entry;
		}
		
		outStr += "],";
	}
	
	outStr = outStr + "\"Dealer\":\"" + dealer + "\",";
	outStr = outStr + "\"Vulnerable\":\"" + vul + "\",";		
	
	outStr = outStr + "\"Deal\":[";
	
	outStr = outStr + "\"" + north + "\"," + "\"" + east + "\"," + "\"" + south + "\"," + "\"" + west + "\"";
	
	outStr = outStr + "],";
	
	outStr = outStr + "\"Bids\":[";
	
	for (i=0;i<bids.length;i++)
	{
		outStr = outStr + "\"" + bids[i] + "\"";
		if (i<bids.length-1) outStr = outStr + ",";
	}
	
	outStr = outStr + "],";
	
	outStr = outStr + "\"Played\":[";
	
	for (i=0;i<played.length;i++)
	{
		outStr = outStr + "\"" + played[i] + "\"";
		if (i<played.length-1) outStr = outStr + ",";
	}
	
	outStr = outStr + "],";
	
	outStr = outStr + "\"Claimed\":\"" + claimed + "\",";
	outStr = outStr + "\"Score\":\"" + score + "\",";
	
	var contract = "";
	var doubled = false;
	var redoubled = false;
	
	var relPosition = 0;
	
	for (i=bids.length-1;i>=0;i--)
	{
		var bd = bids[i];
		
		bd = bd.toUpperCase();
		
		if ((!doubled)&(!redoubled))
		{
			if (bd.charAt(0)=="D") doubled = true;
			if (bd.charAt(0)=="R") redoubled = true;
		}
		
		if ((!(bd.charAt(0)=="P"))&(!(bd.charAt(0)=="R"))&(!(bd.charAt(0)=="D")))
		{
			bd = bd.split("|");
			
			contract = bd[0];
			
			if (doubled) contract = contract + "x";
			if (redoubled) contract = contract + "xx";
			
			relPosition = i;
			break;
		}
	}
	
	if (!(contract==""))
	{
		var suitChar = contract.toUpperCase().charAt(1);
				
			// Identify who was first to bid this suit
		for (i=relPosition;i>=0;i=i-2)	// Step down by 2 because only looking at own bids and partner's bids
		{
			var bd = bids[i].toUpperCase();
			
			if (bd.length>1)
				if (suitChar==bd.charAt(1))
					relPosition = i;
		}
	}
	else
	{
		contract = "Passed";
	}
	
	var position = direction.indexOf(dealer) + relPosition;
	var declarer = "" + direction.charAt(position % 4);
	
	outStr = outStr + "\"Contract\":\"" + contract + "\",";
	outStr = outStr + "\"Declarer\":\"" + declarer + "\",";
	
	var doubleDummyTricks = "********************";	
	outStr = outStr + "\"DoubleDummyTricks\":\"" + doubleDummyTricks + "\"}";
	
	return outStr;		
}

function linToJson(str)
{
		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	  }
	}

	var dealerSelect = ["S","W","N","E"];
	var bids = new Array();
	var played = new Array();
	var playerNames = new Array();
	var boardDealt = false;
	var outStr = "";
	var i,j;
	var inHeader = true;
	
	str = str.replace(/[\"\[\]]/g,"");  // Filter out characters which won't survive conversion of the final json string to a json object
	
//		try {
		outStr += "{\"boards\":[";
					
		str = str.replace(/\n/g,"");
		str = str.replace(/\r/g,"");
		
		var pairs = str.split("|");
		
		var boardStr = "";
		var board=-1;
		var vul="";
		var dealer="";
		var deal="";
		var north = "";
		var south = "";
		var west = "";
		var east = "";
		var claimed = "";
		var score = "";
		var pnames = new Array();
		var count = 0;
		
		for (i=0;i<pairs.length/2;i++)
		{
			var index = 2*i;
			
			var command = pairs[index];
			var para = pairs[index+1];
			
			if (command=="st")	// Marks start of new board ?
			{
				inHeader = false;
				
				if (boardDealt)
				{
					if (count!=0) outStr = outStr + ",";
					count++;
					
					outStr += writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,playerNames,score);
					pnames = new Array();
				
					bids = new Array();
					played = new Array();
					vul="";
					dealer="";
					deal="";
					boardDealt = false;	
					claimed = "";
					score = "";
				}
			}
			else if (command=="qx")
			{
				inHeader = false;
				
				if (boardDealt)
				{
					if (count!=0) outStr += ",";

					count++;
					
					outStr += writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,playerNames,score);
					pnames = new Array();
					bids = new Array();
					played = new Array();
					vul="";
					dealer="";
					deal="";
					boardDealt = false;		
					claimed = "";
					score = "";
				}
				
//						board = Integer.valueOf(boardStr);
				boardStr = para;
				
				if (boardStr.charAt(0)=='o')
					boardStr = boardStr.substring(1) + ".Open";
				else if (boardStr.charAt(0)=='c')
					boardStr = boardStr.substring(1) + ".Closed";					
			}
			else if (command=="mb")
			{
				inHeader = false;
				bids[bids.length] = para;
			}
			else if (command=="an")	// Alert (announcement)
			{
				if (bids.length>0)
				{
					bids[bids.length-1] += "|" + para;	// Append the alert explanation to the last bid
				}
			}
			else if (command=="pc")
			{
				inHeader = false;
				played[played.length] = para.toUpperCase();
			}
			else if (command=="ah")	// An alternative command for expressing the board number
			{
				inHeader = false;
				
				if (para.indexOf(" ")!=-1)
				{
					var fields = para.split(" ");
					para = fields[1].trim();
					
					boardStr = para;
				}
				else
				{
					if (para.toUpperCase().startsWith("BOARD"))
						boardStr = para.substr(5);
					else
						boardStr = "NA";
				}
			}
			else if (command=="md")
			{
				inHeader = false;
				para = para.toUpperCase();
				var dnum = Number(para.substring(0,1));
				
				if (!(para.substring(1,2)==","))
				{
					boardDealt = true;
					dealer = dealerSelect[dnum-1];
					deal = para.substring(1);
					
					var hands  = deal.split(",");
					var cards = new Array();
					
					for (j=0;j<4;j++)
					{
						cards[j] = new Array();
						
						for (k=0;k<13;k++)
							cards[j][k]=0;
					}
					
					south = convertHand(cards,hands[0]);
					west = convertHand(cards,hands[1]);
					north = convertHand(cards,hands[2]);
					
					if (hands.length>3)
					{
						if (hands[3].trim().length!=0)
							east = convertHand(cards,hands[3]);
						else
							east = inferHand(cards);
					}
					else
					{
						east = inferHand(cards);
					}
				}
			}
			else if (command=="pn")
			{
				if (inHeader)
					playerNames = para.split(",");
				else
					pnames = para.split(",");				
			}
			else if (command=="sv")
			{
				inHeader = false;
				para = para.toUpperCase();
				if ((para=="O")|(para=="0")) vul = "None";
				else if (para=="N") vul = "NS";
				else if (para=="E") vul = "EW";
				else if (para=="B") vul = "All";
			}
			else if (command=="mc")
			{
				inHeader = false;
				claimed = para;
			}
			else if (command=="zz")
			{
				score = para;
			}
		}
		
		if (boardDealt)
		{
			if (count!=0) outStr += ",";
			count++;
			
			outStr += writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,playerNames,score);
			pnames = new Array();
		}
		
		outStr += "]";
		
/*		if (playerNames.length>0)
		{
			outStr += ",\"PlayerNames\":[";
			
			for (i=0;i<playerNames.length;i++)
			{
				if (i!=0) outStr += ",";
				var pname = playerNames[i].trim();
				if (pname.indexOf("~~")==0) pname = "Robot";
				outStr += "\"" + pname + "\"";
			}
			
			outStr += "]";
		}*/
		
		outStr += "}";
//		} catch (e) {alert("lin file conversion error");};
	
	return outStr;
}

function callAnalysisFunction(index)
{
	if (index==0) setupRanking();
	else if (index==1) setupScorecard();
	else if (index==2) showComparison();
}

function handsNotFound(jqXHR,textStatus,errorThrown)
{
	// Hands Not Found
	var msg = "Hand Record file could not be retrieved";
	var errormsg = "<DIV style=\"padding:10px;background-color:#FFEEEE;width:200px;position:absolute;top:100px;left:100px;\"><SPAN style=\"font-size:16px;\">" + msg + "</SPAN></DIV>";
	displayError(document.getElementById("boardNumber"),errormsg);
	clearPBNlocalStorage();
	getTraveller(this);
}

function clearPBNlocalStorage()
{
	if (localStorageSupported())
	{
		localStorage.removeItem("bwpbn");localStorage.removeItem("bwtimepbn");localStorage.removeItem("turlpbn");
	}
}

function clearTravellersLocalStorage()
{
	if (localStorageSupported())
	{
		localStorage.removeItem("bwjson");localStorage.removeItem("bwtime");localStorage.removeItem("turl");
	}
}

function loadHands(data,statusText,jqXHR,context)
{
	loadHands_1(data,statusText,jqXHR,this);
}

function loadHands_1(data,statusText,jqXHR,context)
{
	if ( typeof String.prototype.endsWith != 'function' ) {
	  String.prototype.endsWith = function( str ) {
		return this.substring( this.length - str.length, this.length ) === str;
	  }
	};
	
	if ((typeof context)!="undefined")
		if ((typeof context.callback)!="undefined")
			this.callback = context.callback;
	
	var hands;
	
	if (g_file!==1)	// If pbn data not supplied as string
	{
		if ((g_file=='')|(g_file.toUpperCase().endsWith('PBN')))
			hands = pbnToJson(data);
		else if (g_file.toUpperCase().endsWith('DLM'))
			hands = dlmToJson(data);
		else if (g_file.toUpperCase().endsWith('LIN'))
			hands = linToJson(data);
		else	// if pbn string was not supplied as explicit parameter
			alert("Only PBN, DLM, and bridge base online LIN file types are supported");
	}
	else
	{
		hands = data;
	}
	
	hands = eval("(" + hands + ")");
	
	var saved_boards = g_hands.boards;
	
	var i;
	var board = new Object();
	
	if (typeof g_hands.boards!=="undefined")
		board = g_hands.boards[g_lastBindex].board;
	else
		saved_boards = new Object();
	
	g_hands.boards = hands.boards;
	
	if ((typeof hands.PlayerNames)!="undefined")
		g_hands.PlayerNames = hands.PlayerNames;
	
	for (i=0;i<saved_boards.length;i++)
	{
		board = saved_boards[i];
		
		if ((typeof board.board)!="undefined")
		{
			if (board.board.toString().indexOf(".edited")!=-1)
			{
				g_hands.boards[g_hands.boards.length] = board;
			}
		}
	}
	
	var index = 0;
	
	if ((typeof board.board)!="undefined")
		index = getTindexByName(g_hands.boards,board.board);
		
	if ((g_file=='')|(g_xml!="")) // If request is from Bridgewebs, or if xml filename or xml string has been explicitly supplied
	{
		g_lastBindex = index;
		setupTraveller(g_lastBindex,true);
		getTraveller(this);
	}
	else
	{
		if (index!=-1)	// Shouldn't happen that index==-1 unless current hand is not in retrieved PBN file !!
		{
			setupTraveller(index,true);
			enterPlayMode();
		}
		else
		{
			hideSpinner();
			document.getElementById("bdy").style.display="none";
			alert("Board " + board.board + " does not exist");
		}
		
		hideSpinner();
		resetTimeout();
		this.callback();
	}
}

function getHands(context)
{
		var data="";
		
		if (requestPending())
			return;	// Don't allow while there is a request in progress.
		else
			setRequestTimeout();
		
			// Get the hand records for this event
		var turl = "";
		
		if (g_file=='')	// No pbn url or pbn string supplied.
		{
			if (g_test==1)
				turl = "data/" + g_hands.club + "_" + g_hands.event + ".pbn";
		}
		else if (g_file!==1)	// filename supplied (1 would indicate pbn content supplied as a string parameter)
		{
			turl = g_file;
		}
			
		if ((data!=="")&(g_loaded==false))
		{
			g_loaded = true;
			loadHands_1(data,"","",context);
		}
		else if ((turl!="")&(g_loaded==false))
		{
			g_loaded = true;
			hideRanking();
			$("#scores").hide();
			$("#comparison").hide();
			$("#checkListDiv").hide();
			largeSpinner();
			doRequestHTMLasync(turl,loadHands,handsNotFound,context);
		}
		else if ((g_handstr!=="")&(g_loaded==false))
		{
			var data = "";
			g_loaded = true;
			
			if (g_handstrType=="pbn")
				data = pbnToJson(g_handstr);
			else if (g_handstrType=="lin")
				data = linToJson(g_handstr);
			else if (g_handstrType=="dlm")
				data = dlmToJson(g_handstr);
			
			loadHands_1(data,"","",context);
		}
		else
			loadTraveller_1("","","",context);
}

function gotoSession()
{
	g_playItAgain = false;
	log("button=session");
	if (g_sessionMode=="ranking") getHands({callback:setupRanking});
	else if (g_sessionMode=="scorecard") getHands({callback:setupScorecard});
	else if (g_sessionMode=="check") getHands({callback:checkAllContracts});
	else getHands({callback:showComparison});
}

function sessionHelp()
{
	var tag = g_sessionMode;
	
	window.open("bsolhelp.htm#" + tag);
}

function getTraveller(context)
{
			// Get the traveller data
		var turl = "";
		var data = "";
		
		if (g_test==1)
			turl = "data/" + g_hands.club + "_" + g_hands.event + ".json";
		else if ((g_xml!="")&(g_xml!==1))
		{
			turl = g_xml;
		}
		
		if (g_travellers==null)
		{
			if (g_xml!==1) // xml string not supplied as parameter
			{
				if (data=="")
				{
					largeSpinner();
					doRequestHTMLasync(turl,loadTraveller,travellersNotFound,context);
				}
				else
				{
					loadTraveller_1(data,"","",context);
				}
			}
			else
			{
				loadTraveller_1(g_xmlstr,"","",context);
			}
		}
		else
			loadTraveller_1("","","",context);
}

function setDisplaySizing()
{
	var dim = "800#480";
	dim = dim.split("#");
	
	var width,height;

		// Default settings - for windowed desktop systems.
	width = dim[0];
	height = dim[1];
	height = ((800*height)/width) -17 - 25; // allow for table padding and buttons below
	g_sectionHeight = height/3;
	
	var ismobi = false;
	
	if (navigator.userAgent!="undefined")
		ismobi = /mobile/i.test(navigator.userAgent) && !/ipad|tablet/i.test(navigator.userAgent); // if true, it's a phone rather than PC or tablet
	
	g_isMobi = ismobi;
	
	var defaultHeight = 480 - 17 - 25;
	
//	if ((ismobi=="Mobi")|(ismobi=="Android"))
	{
		var screen_width = screen.availWidth;
		var screen_height = screen.availHeight;
		
		if ((screen_width!="undefined")&(screen_height!="undefined"))
		{
			height = screen_height;
			width = screen_width;
			
				// Sanity check
			var ratio = width/height;
			
			if (ratio<1.66) height = width/1.66
			
	/*		if (ratio>1.666)	// If ratio is lower than 1.666 use default values for height and width
			{
				if (ratio>1.78)	// BSOL window won't look right at very high aspect ratio, so use defaults instead.
				{
					width=800;
					height=450;
				}
			}*/
			
			if (width>height)
				height = ((800*height)/width) -17 - 80; // allow for table padding and buttons below
			else	// Use the defaults
			{
				height = defaultHeight;
			}
			
			g_sectionHeight = height/3;
		}
	}
	
	var buttHeight = (g_sectionHeight/4) + "px";
	var vulBarHeight = ((20*height)/defaultHeight);
	g_vulBarLength = (g_sectionHeight-2*vulBarHeight);
	
	document.getElementById("northHand").style.height = g_sectionHeight + "px";
	document.getElementById("westHand").style.height = g_sectionHeight + "px";
	document.getElementById("southHand").style.height = g_sectionHeight + "px";
	document.getElementById("wvul").style.height = (g_sectionHeight-2*vulBarHeight) + "px";	// Increase height of vulnerability bar to match new table height.
	document.getElementById("wvul").style.width = vulBarHeight + "px";	// Increase height of vulnerability bar to match new table height
	document.getElementById("nvul").style.width = g_vulBarLength + "px";	// Set length of vulnerability bar
	document.getElementById("svul").style.width = g_vulBarLength + "px";	// Set length of vulnerability bar
	document.getElementById("vul").style.height = g_sectionHeight + "px";	// Increase width of table centre to match new table height.
	document.getElementById("vul").style.width = g_sectionHeight + "px";	// Increase width of table centre to match new table height.
	
	for (var i=0;i<3;i++)
	{
		document.getElementById("vul").rows[i].cells[0].style.width = vulBarHeight + "px";
		document.getElementById("vul").rows[i].cells[2].style.width = vulBarHeight + "px";
	}


	var table = document.getElementById("vul");
	var rows = table.rows;
	rows[0].style.height = vulBarHeight + "px";
	rows[0].cells[0].style.height = vulBarHeight + "px";
	rows[2].style.height = vulBarHeight + "px";
	rows[2].cells[0].style.height = vulBarHeight + "px";
	document.getElementById("nvul").style.height = vulBarHeight + "px";
	document.getElementById("svul").style.height = vulBarHeight + "px";
	
	g_boardNumberFontSize = ((48*height)/defaultHeight) + "px";
	g_fontRatio = height/defaultHeight;
	
	document.getElementById("scrollDiv").style.height = (height + 10) + "px";

	var nodes = document.getElementsByClassName("blankButton");
	
	var i;
	
	for (i=0;i<nodes.length;i++)
	{
		nodes[i].style.height = buttHeight;
	}
	
	if (g_isMobi)
		g_namSize = g_sectionHeight/9 + "px";
	else
		g_namSize = g_sectionHeight/10 + "px";
		
	var namstr = document.getElementById("namstr");
	
	if (namstr!=null)
		namstr.style.fontSize = g_namSize;
	
	var bidtable = document.getElementById("bidding");
	var biddingHeader = document.getElementById("biddingHeader");
	
	if (g_isMobi)
		g_bidFontSize = g_sectionHeight/8 + "px";
	else
		g_bidFontSize = g_sectionHeight/10 + "px";
	
	if (bidtable!=null)
	{
		for (var i=0;i<bidtable.rows.length;i++)
		{
			var row = bidtable.rows[i];
			
			for (var j=0;j<row.cells.length;j++)
				row.cells[j].style.fontSize = g_bidFontSize;
		}
		
		var row = biddingHeader.rows[0];
		
		for (var i=0;i<row.cells.length;i++)
			row.cells[i].style.fontSize = g_sectionHeight/8 + "px";
			
		document.getElementById("biddingContent").style.height = 3*g_sectionHeight/5 + "px";
	}
	
	var optFontSize = g_sectionHeight/7 + "px";
	var lottFontSize = g_sectionHeight/9 + "px";
	
	var optimumStr = document.getElementById("optStr");
	
	if (optimumStr!=null) optimumStr.style.fontSize = optFontSize;
	
	var lottStr = document.getElementById("lott");
	
	if (lottStr!=null) lottStr.style.fontSize = lottFontSize;

	g_dealerFontSize = 16*g_fontRatio;
	
	var dealerEl = document.getElementById("dealerChar");
	
	if (dealerEl!=null)
		dealerEl.style.fontSize = g_dealerFontSize + "px";
		
	g_urqButtonHeight = g_sectionHeight/5 + "px";
	g_urqButtFontSize = g_textBratio*0.8*g_sectionHeight/6 + "px";
	
	var linplay = document.getElementById("linPlay");
	
	if (linplay!=null)
	{
		document.getElementById("prevrow").style.height = g_urqButtonHeight;
		document.getElementById("nextrow").style.height = g_urqButtonHeight;
		document.getElementById("accbutton").style.height = g_urqButtonHeight;
		document.getElementById("linPlay").style.height = g_urqButtonHeight;
		document.getElementById("matchContractHelp").style.height = g_urqButtonHeight;
		document.getElementById("prevRowButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("nextRowButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("accButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("linPlayButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("matchContractHelpButtFontSize").style.fontSize = g_urqButtFontSize;
	}
	
	g_scoreFontSize = g_sectionHeight/8 + "px";
	
	var scorespan = document.getElementById("scoreSpan");
	
	if (scorespan!=null) scorespan.style.fontSize = g_scoreFontSize;
	
	var vul = document.getElementById("setVul");
	
	if (vul!=null) vul.style.minWidth = g_vulBarLength + "px";
	
	var dlr = document.getElementById("setDealer");
	
	if (dlr!=null) dlr.style.minWidth = g_vulBarLength + "px";
}

function orientationChanged()
{
	setDisplaySizing();
	if (g_handEntryMode==0) document.getElementById("boardNumber").innerHTML = "<SPAN style=\"font-size:" + g_boardNumberFontSize + ";font-weight:normal;\">" + makeBoardNameString(g_hands.boards[g_lastBindex].board) + "</SPAN>";
	displayHands();
	redrawMCTable(true);
}

function showCheckTraveller()
{
	drawMiniHand();
	var cp = document.getElementById("minihand").cloneNode(true);
	cp.removeAttribute("id");
	$(cp).find("*").removeAttr("id");
	
			// Should delete old cloned node if present
			// Should remove all the ids from the loned node first
	var cboard = document.getElementById("checkBoard");
	while (cboard.firstChild) cboard.removeChild(cboard.firstChild);
	cboard.appendChild(cp);
	$("#checkList").hide();
	
	var tlines = getTravellerForBoard(g_lastBindex).traveller_line;
	
	var table = document.getElementById("checkTraveller");
	var rows = table.rows;
	var i;
	
	for (i=rows.length-1;i>0;i--)
		table.deleteRow(-1);
		
	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];
		
		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];
		
		row.insertCell(-1);
		row.cells[0].innerHTML = tline.ns_pair_number;
		row.insertCell(-1);
		row.cells[1].innerHTML = tline.ew_pair_number;
		row.insertCell(-1);
		row.cells[2].innerHTML = tline.contract;
		row.insertCell(-1);
		row.cells[3].innerHTML = tline.played_by;
		row.insertCell(-1);
		row.cells[4].innerHTML = tline.lead;
		row.insertCell(-1);
		row.cells[5].innerHTML = tline.tricks;
	}
	
	$("#checkTravellerDiv").show();
}

function checkAllContracts()
{
	var suits = "NSHDC";
	var i,j;
	
	g_sessionMode = "check";
	setButtonColor();
	
	hideAllPopups();
	hideRanking();
	$("#scoreandtraveller").hide();
	$("#scores").hide();
	$("#comparison").hide();
	$("#abuttons").show();
	$("#checkListDiv").show();
	$("#checkList").show();
	$("#checkTravellerDiv").hide();
	
	var table = document.getElementById("checkList");
	if (g_checkContracts.length>0) return;
	
	for (i=0;i<g_hands.boards.length;i++)
	{
		var traveller = getTravellerForBoard(i);
		
		var lines = traveller.traveller_line;
		
		for (j=0;j<lines.length;j++)
		{
			var result = checkContract(i,j);
			
			if (!result.valid)	// Report if necessary
			{
				var line = lines[j];
				
					// Is there any other pair on the traveller in the same contract ?
				var other = false;
				var k;
				
				for (k=0;k<lines.length;k++)
				{
					var oppLine = lines[k];
					
					if (k!=j)
					{
						if (validContract(oppLine.contract))
						{
							var oppSuit = suits.indexOf(oppLine.contract.charAt(1));

							if ((oppSuit==result.declSuit)&(oppLine.played_by==line.played_by))
							{
								other = true;
								break;
							}
						}
					}
				}
				
				if (other)	// Don't log this as a possible error if another pair on the traveller have same suit/declarer
				{
					result.shortSuit = false;
					result.possibleSuitDeclError = false;
				}
				
				if (result.leadDeclError|result.shortSuit|result.possibleSuitDeclError)
				{
					result.bindex = i;
					result.traveller = traveller;
					result.tindex = j;				
					g_checkContracts[g_checkContracts.length] = result;
					
/*					if (result.leadDeclError)
 						alert("Board: " + g_hands.boards[i].board + ",  " + line.contract + " " + line.played_by + " " + line.lead + ", Lead Card or Declarer is incorrect");				

					if (result.shortSuit)
						alert("Board: " + g_hands.boards[i].board + ",  " + line.contract + " " + line.played_by + " " + "Short suit length: " + result.combinedSuitLength);
	
					if (result.possibleSuitDeclError)
						alert("Board: " + g_hands.boards[i].board + ",  " + line.contract + " " + line.played_by + " " + "Either Suit or Declarer may be incorrect");				
*/
				}
			}
		}
	}
	
	var table = document.getElementById("checkList");
	
	for (i=0;i<g_checkContracts.length;i++)
	{
		table.insertRow(-1);
		
		var row = table.rows[table.rows.length-1];
		var data = g_checkContracts[i];
		var tline = data.traveller.traveller_line[data.tindex];
		
		row.insertCell(-1);
		row.cells[0].innerHTML = g_hands.boards[data.bindex].board;
		row.cells[0].onclick = function(){g_lastBindex = getTindexByName(g_hands.boards,this.innerHTML);showCheckTraveller();};
		row.cells[0].style.textAlign="right";
		row.cells[0].className = "myLink";
		row.insertCell(-1);
		row.cells[1].innerHTML = tline.ns_pair_number;
		row.insertCell(-1);
		row.cells[2].innerHTML = tline.ew_pair_number;
		row.insertCell(-1);
		row.cells[3].innerHTML = tline.contract;
		row.insertCell(-1);
		row.cells[4].innerHTML = tline.played_by;
		row.insertCell(-1);
		row.cells[5].innerHTML = tline.lead;
		row.insertCell(-1);
		row.cells[6].innerHTML = tline.tricks;		
		row.insertCell(-1);
		
		var reason = "";
		
		if (data.leadDeclError)
			reason = "Lead Card or Declarer is incorrect";				
		else if (data.shortSuit)
		 	reason = "Check declarer suit (short length)";
		else if (data.possibleSuitDeclError)
			reason = "Either Suit or Declarer may be incorrect";				

		row.cells[7].innerHTML = reason;
	}
}

function reportBSOLNotSupported()
{
	document.body.innerHTML = "<div style='background-color:#ffff00;border:1px solid black;padding:5px 5px;width:400px;margin-top:25px;margin-left:25px;'><SPAN style='font-size:18px;'>This browser does not support the features required by Bridge Solver. Try upgrading to a more recent version of the browser, if possible, or try a different browser.</SPAN></DIV>";
}

function listener(event,workerType)
{
	if ((event.data!=="initialised")&(event.data!=="failed"))
	{
		var request = event.data.context.request;
		
		if (request=="m")
			dddLoadMakeable(event.data.result,"","",event.data.context.bindex);
		else if (request=="a")
		{
			if (event.data.context.requestSubType=="b")	// Background acc request
			{
				var result = JSON.parse(event.data.result);

				if ((typeof result.sess.status)!="undefined")
					console.log("error from background acc request, status code: " + result.sess.status);
				else
					storeAcc(result,event.data.context);
				
				var names = event.data.context.names;
				var tid = event.data.context.tid;
				
				var nameFound = false;
				
				for (var i=0;i<4;i++)
				{
					delete g_accTrans[names[i]].transList[tid];
				}
				
				if (allAccsProcessed())
				{
					finishBackgroundOperation();
					log('button=showPlayerAccMatrix');
					showPlayerAccMatrix();
				}
			}
			else
				load(event.data.result,null,null,event.data.context);
		}
		else if (request=="b")
		{
			dddLoadMakeable(event.data.result,"","",event.data.context.bindex);
		}
		else
		{
			if (event.data.context.para=="benchmark")
			{
				var res = JSON.parse(event.data.result);
				
				if (localStorageSupported())
					localStorage.setItem("benchmark",String(res.sess.deltaElapsed));
					
				console.log("benchmark time was " +  res.sess.deltaElapsed + " seconds");
			
				if (Number(res.sess.deltaElapsed)>0.12)
				{
				}
					
				buildPage1(g_initial_data,g_initial_options);
			}
			else
			{
				dddloadfunc(event.data.result,null,null,event.data.context);
			}
		}
	}
	else if (event.data=="failed")
	{
		hideSpinner();
		reportBSOLNotSupported();
		return;
	}
	else	// worker creation succeeded
	{
//				g_workerInitCount++;
		if (workerType=="main")
		{
			if (!g_initialised)	// buildPage1 hasn't run yet
			{
				if (localStorageSupported())
					var tmp = localStorage.getItem("benchmark");
				else
					tmp = null;
					
				if (tmp==null)
				{
						// generate benchmarking request
					var dealstr = "W:.AKQT954.KJ64.72xAKJ8.82.A8.KJT64x97652.76.Q92.AQ8xQT43.J3.T753.953";
					
					var msg = new Object();
					msg.request = "g";
					msg.pbn = dealstr;
					msg.trumps = "H";
					msg.leader = "n";
					msg.requesttoken = 1;
					msg.sockref = 1;
					
					var context = new Object();
					context.request = msg.request;
					context.para = "benchmark";
					msg.context = context;
					
					g_worker.postMessage(msg);
				}
				else
				{
					buildPage1(g_initial_data,g_initial_options);
				}
			}
		}
		else	// Background worker
		{
			g_workerInitCount++;
			console.log("initcount: " + g_workerInitCount);
			
			if (g_workerInitCount==g_mworkers.length)
			{
				if (g_bgObj.fn=="processAccs")
				{
					processAccs();
					return;
				}
			}
			
			if ((g_workerInitCount==g_mworkers.length))
			{
				if (g_bgObj.fn=="analyseAll")
				{
					g_bgObj.fn = "";
					console.log("calculate makeable all boards");
					calculateMakeableAllBoards();
				}
			}
		}
	}
}

function listenerMain(event)
{
	listener(event,"main");
}
		
function listenerBackground(event)
{
	listener(event,"background");
}

function workerSupported()
{
	if (typeof(Worker)!=="undefined")
		return true;
	else
		return false;
}

function webAssemblySupported()
{
	try {
		if (typeof WebAssembly === "object"&& typeof WebAssembly.instantiate === "function") {
			const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
			if (module instanceof WebAssembly.Module)
				return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
		}
	} catch (e) {}
	
    return false;
}

function createBackgroundWorkers()
{
	var nworkers = 4;	// Make this the maximum number of concurrent worker threads for makeable contracts
	
	if (navigator.hardwareConcurrency<nworkers)
		nworkers = navigator.hardwareConcurrency;
		
	console.log("ncores: " + nworkers);
	
	for (var i=0;i<nworkers;i++)
	{
		var worker = new Worker("calldds.js");
		worker.addEventListener("message",listenerBackground);
		g_mworkers.push(worker);
	}
	
	g_nextmworker = 0;
}

function stopBackgroundWorkers()
{
	console.log("stopping background worker threads");
	
	for (var i=0;i<g_mworkers.length;i++)
	{
		g_mworkers[i].terminate();
	}
	
	g_mworkers = new Array();
	
	g_workerInitCount = 0;
	g_nextmworker = 0;
	resetAnalyseAllBoards();
}

function createMainWorker()
{
	if (g_worker==null)
	{
		if ((g_hands!=null)&(g_session!==0)) exitCardPlay();	// g_hands may not have been initialised yet when createMainWorker is called at startup
		console.log("creating main worker thread");
		g_worker = new Worker("calldds.js");
		g_worker.addEventListener("message",listenerMain);
	}
}

function restartBackgroundWorkers()
{
		console.log("terminate then restart background workers");
		
		stopBackgroundWorkers();
		createBackgroundWorkers();	// Recreate them
}

function buildPage(data,options)
{
//document.body.style.transform = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-o-transform'] = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-webkit-transform'] = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-moz-transform'] = 'scale(' + $(window).width()/800 + ')';
	g_initial_data = data;
	g_initial_options = options;
	largeSpinner();
	console.log("start: " + Date.now());
	
	if (webAssemblySupported()&workerSupported())
	{
		createMainWorker();
	}
	else
	{
		hideSpinner();
		reportBSOLNotSupported();
	}
}

function buildPage1(data,options)
{
	g_initialised = true;
	$("#largeSpinner").finish();
	
//	if (webAssemblySupported()&workerSupported())	// Create background workers, even if "play it again" will user remote server
//		createBackgroundWorkers();
		
	var defaultOptions = getCookie("BSOL_options");
		
    g_protocol = location.protocol  || 'http:';
	
    if (g_protocol != 'https:')
    {
        g_protocol = 'http:';
    }

	hide("bsession");
	hide("bsessionHelp");
	hide("branking");
	hide("bscorecard");
	hide("btraveller");
	hideRanking();
	hide("scores");
	
	document.getElementById("northHand").style.whiteSpace = "nowrap";
	document.getElementById("eastHand").style.whiteSpace = "nowrap";
	document.getElementById("southHand").style.whiteSpace = "nowrap";
	document.getElementById("westHand").style.whiteSpace = "nowrap";
	document.getElementById("miniNorth").style.whiteSpace = "nowrap";
	document.getElementById("miniEast").style.whiteSpace = "nowrap";
	document.getElementById("miniSouth").style.whiteSpace = "nowrap";
	document.getElementById("miniWest").style.whiteSpace = "nowrap";
	
	var referrer = document.referrer;
	
	var idx = document.referrer.indexOf("testpbntojson");
	
	var sctable = document.getElementById("scoring");
	
	if (sctable.rows[1].cells.length<8) g_ofs = 0;
	
	var table = document.getElementById("rankingNS");
	table.rows[0].cells[4].id = "rankingDD";
	
	if (idx!=-1)
		g_test = 1;
		
	if ((typeof data.file)!="undefined")
		g_file = data.file;
		
	if ((typeof data.handstr)!="undefined")
	{
		g_file = 1;	// Indicate pbn has been supplied as a literal string
		g_handstr = data.handstr;
		g_handstrType = data.handstrType;
		delete data.handstr;
		delete data.handstrType;
	}

	if ((typeof data.xml)!="undefined")
		g_xml = data.xml;		// url of file containing travellers etc. has been providedg
		
	if ((typeof data.xmlstr)!="undefined")	// Indicate json has been supplied as a literal string
	{
		g_xml = 1;
		g_xmlstr = data.xmlstr;
		delete data.xmlstr;	// Delete field because it makes ajax requests containing g_hands very large
	}
	
	if ((typeof data.debug)!="undefined")
		if (data.debug=="true")
			g_debug = true;
			
	initSettings();

	if (defaultOptions === undefined)
		setOptions(options);
	else
		setOptions(defaultOptions);
	
	g_credits = "<SPAN style=\"font-size:12px;\"><a href=\"http://www.bridgesolver.co.uk\" target=\"_blank\">Bridge Solver Online</a>:<BR><SPAN style=\"font-weight:bold\">John Goacher</SPAN></SPAN><BR><BR><SPAN style=\"font-size:12px;\">Double Dummy Solver Module:<BR><SPAN style=\"font-weight:bold\">Bo Haglund</SPAN></SPAN>";

		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	  }
	}

	$(window).on("orientationchange",function(event){
		window.t = setTimeout(function(){orientationChanged();},250);
	});
	
	$("#computeMakeable").keypress(function(e){
   			if(e.keyCode === 13){
       			e.preventDefault();
   			}});
	
	setDisplaySizing();
	
//	document.getElementById("scrollDiv").style.height = (height + 10) + "px";

	hideRanking();
	hide("scores");
	hide("scoreandtraveller");
	
	document.getElementById("northHand").onclick = function() {selectQuadrant(0);};
	document.getElementById("eastHand").onclick = function() {selectQuadrant(1);};
	document.getElementById("southHand").onclick = function() {selectQuadrant(2);};
	document.getElementById("westHand").onclick = function() {selectQuadrant(3);};
	document.getElementById("bsession").onclick = gotoSession;
	document.getElementById("computeMakeable").onclick = function () {calculateMakeableSingleBoard(g_lastBindex);};
	document.getElementById("gotoBoard").onclick = function() {getHands({callback:showBoardKeypad});};
	document.getElementById("newBoard").onclick = showNewBoardSelector;
	document.getElementById("deleteBoard").onclick = showDeleteConfirmation;
	
	if (document.getElementById("saveLIN")!=null) document.getElementById("saveLIN").onclick = function() {hideAllPopups();downloadFile(g_hands.lin,"text/lin","board.lin");};
	document.getElementById("saveBoards").onclick = function() {hideAllPopups();getHands({callback:generatePBN});};
//	document.getElementById("analyseAllBoards").onclick = calculateMakeableAllBoards;	
//	document.getElementById("saveSingleBoard").onclick = function() {generatePBN(false);$("#toolsSubMenu").hide();};
//	document.getElementById("closetoolsSubMenu").onclick = function(){$("#toolsSubMenu").hide();};
	document.getElementById("aranking").onclick = function() {log("button=AllPairs");setupRanking();};
	document.getElementById("ascorecard").onclick = function() {log("button=Personal");setupScorecard();};
	document.getElementById("aacc").onclick = function() {log("button=showAccMatrix");callGetIndexedAcc();};
	document.getElementById("atraveller").onclick = function() {log("button=Traveller");showComparison();};
	document.getElementById("tools").onclick = function() {showtoolsSubMenu();};
	document.getElementById("analyseAllBoards").onclick = function() {getHands({callback:startAnalyseAll});};
	document.getElementById("showPlayerAcc").onclick = function() {getHands({callback:callGetIndexedAcc});};
	document.getElementById("showSettings").onclick = function() {getHands({callback:showSettings});};
	document.getElementById("showReleaseHistory").onclick = function() {window.open("releaseNotes.htm","_blank");};
	
	if (document.getElementById("aprev")!=null)
	{
		document.getElementById("aprev").onclick = function(){log('button=prevTraveller');g_lastBindex=getNextOrPrevBindex(false);showComparison();};
		document.getElementById("anext").onclick = function(){log('button=nextTraveller');g_lastBindex=getNextOrPrevBindex(true);showComparison();};
	}
	
	if (document.getElementById("acheck")!=null)
	{
//		document.getElementById("acheck").onclick = function(){log("button=check");checkAllContracts();};
		document.getElementById("acheck").style.display = "none";
	}
	
	document.getElementById("agotoboard").onclick = showTravellerKeypad;
	document.getElementById("aboard").onclick = showCurrentBoard;
	document.getElementById("rankcheck").onclick = function(){sortRanking(!document.getElementById("rankcheck").checked);setupRanking()};

	var cell = document.getElementById("scPlayerNames");
	
	cell.innerHTML = "<div style='float:left;'><select id='sortMode' name='sortMode' style='background-color:yellow;'><option value=0>Sort By Role</option><option value=1>Sort by Board</option></select></div><div style='float:left;vertical-align:middle;margin-left:10px;'><span id='scPlayerNames2' style='color:white;'></span></div>";
	document.getElementById("sortMode").onchange = function(){log("operation=sortMode:"+this.selectedIndex);setupScorecard(true);};			
	
	var krckbox = document.getElementById("krcalc");
	
	if (krckbox!==null)
	{
		krckbox.onchange = function(){
								var krck = document.getElementById("krcalc");
								
								if (localStorageSupported())
								{
									if (krck.checked)
										localStorage.setItem("krcalc","true");
									else
										localStorage.setItem("krcalc","false");
								}
								
								updatePointsDisplay();
							};
		setupKRHelp();
		document.getElementById("krhelp").onclick = function(){showHelp(this,"krHelpText");};
	}
	
	g_defaultTravellerWidth = document.getElementById("traveller").style.width;
	g_inactiveCards = new Array(4);
	g_playableCards = new Array(4);
	g_currentTrickCards = new Array(4);
	
	for (i=0;i<4;i++)
	{
		g_playableCards[i] = new Array(13);
		g_inactiveCards[i] = new Array(13);
		g_currentTrickCards[i] = new Array(13);
		
		for (j=0;j<13;j++)
		{
			g_playableCards[i][j] = -1;
			g_inactiveCards[i][j] = 0;
			g_currentTrickCards[i][j] = 0;
		}
	}
	
	g_hands = data;
	
//	g_hands.boards = pbnToJson(g_handstr);
	
	if ((typeof g_hands.lin)!=="undefined")
	{
		var linstr = linToJson(g_hands.lin);
		var linhands = eval("(" + linstr + ")");
		g_hands.boards = linhands.boards;
	}
	
		// Set defaults in case pair number and direction not provided.
	if ((typeof g_hands.pair_number)=="undefined") g_hands.pair_number = "";
	if ((typeof g_hands.direction)=="undefined") g_hands.direction = 1;
	if (g_hands.direction=="") g_hands.direction = 1;
	if (g_hands.direction=="NS") g_hands.direction = 1;
	else if (g_hands.direction=="EW") g_hands.direction = 2;
	
	if ((g_hands.pair_number=="")&((typeof g_hands.lin)!=="undefined")) g_showAllControls = false;
	
	openIndexedDB();	// Will call getHands or buildPage2 from onsuccess callback
}

function buildpage2()
{
	var rank1button = document.getElementById("rank1");
	var rank2button = document.getElementById("rank2");
	
//	g_lastBindex = 0;
	hide("next");
	hide("prev");
	
	$("#allBoards").hide();
	$("#scoreandtraveller").hide();;
	
	var prev = document.getElementById("prev");
	prev.onclick = function(){log("button=prevBoard");getHands({callback:gotoPrevTraveller});}

	var next = document.getElementById("next");
	next.onclick = function(){log("button=nextBoard");getHands({callback:gotoNextTraveller});}
	
	if ((typeof g_hands.Title)!="undefined")
		g_title = g_hands.Title;
		
	document.getElementById("titleText").innerHTML = g_title;
	
	setupCommandHelp();
	setupPlayHelp();
	setupEditHelp();
	setupSettingsHelp();
	setupPlayMatchContractHelp();
	showMainMenuItems();
	if (g_file=="") setupTraveller(g_lastBindex,true);
	enterPlayMode();	// Large version of traveller with clickable contracts
	
	g_playItAgain = true;
	
	var emptyHand = false;
	
	if ((typeof g_hands.display)=="undefined")
	{
		$("#mainTitle").show();
		
		if (g_hands.boards.length==1)
		{
			g_lastBindex = 0;
			var board = g_hands.boards[g_lastBindex];
			var count = 0;
			
			for (i=0;i<4;i++)
			{
				count = count + board.Deal[i].length;
			}
			
			if (count==12)	// Only one board, and it's empty (just contains the suit separators), so go into edit mode.
			{
				emptyHand = true;
				
				if (g_xml=="")
					edit();	// Go into edit mode if no travellers
				else
					g_hands.display = "allpairs";
			}
		}
		
		if (!emptyHand)
			$("#scoreandtraveller").show();
			
		if ((typeof g_hands.forceAnalyse)!="undefined")	// Call "analyse" automatically.
		{
			calculateMakeableSingleBoard(g_lastBindex);
		}
		else
		{
			if (((g_hands.boards.length==1))&(g_file==""))
				calculateMakeableSingleBoard(g_lastBindex); // Calculate them anyway if not defined	
			else
			{
				if (document.getElementById("mkauto1").checked)
				{					
					g_bgObj.fn = "analyseAll";
					
					createBackgroundWorkers();
				}
			}
		}
	}
	
	hideSpinner();
	
	if ((typeof g_hands.display)!="undefined")
	{
		g_playItAgain = false;
		
		var display = g_hands.display;
		log("button=analysis");
		
		if (display=="allpairs")
		{
		    g_sessionMode = "ranking";
			getHands({callback:setupRanking});
		}
		else if (display=="personal")
		{
		    g_sessionMode = "scorecard";
			getHands({callback:setupScorecard});
		}
		else if (display=="board")
		{
		    g_sessionMode = "traveller";
			getHands({callback:showComparison});
		}
		else if (display=="check")
		{
			g_sessionMode = "check";
			getHands({callback:checkAllContracts});
		}
		else
		{
			g_playItAgain = true;
		}
	}
	
	console.log("initialisation complete: " + Date.now());
	
	showNewFeaturesNotice();
}

function doNothing()
{
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

function show(button)
{
	$("#"+button).show();
}

function hide(button)
{
	$("#"+button).hide();
}

function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

function doRequestHTML(fileref)
{
	var response;
	var request = makeHttpObject();
	request.open("GET", fileref, false);
	request.send(null);
	response = request.responseText;
	return response;
}

function doRequestHTMLasync(fileref,ploadfunc,errorFunc,pcontext)
{
	$.ajax({
	  url:fileref,
	  data: "",
	  cache: false,
	  success: ploadfunc,
	  error: errorFunc,
	  dataType: "html",
	  context:pcontext
	});
}

function errorFunc(jqXHR,textStatus,errorThrown)
{
		// textStatus should be one of "timeout", "error", "abort", "parsererror".
		// errorThrown contains HTTP status if the error was an HTTP error.
	hideSpinner();
	resetTimeout();
	
	var errormsg;
	
	if (textStatus=="error")
	{
		if (errorThrown=="")
			errormsg = "Could not contact web server";
		else
			errormsg = "Error response From web server: " + errorThrown;
	}
	else if (textStatus=="timeout")
		errormsg = "No response from web server, please try again";
	else
		errormsg = "Unknown Error";
		
	errormsg = "<DIV style=\"padding:10px;background-color:#FFEEEE;width:200px;\"><SPAN style=\"font-size:16px;\">" + errormsg + "</SPAN></DIV>";
		
	displayError(document.getElementById("boardNumber"),errormsg);
}

function doit(para)
{
	para = para.replace(/\\"/g,'"');
	para = para.replace(/\\r\\n/g,"\r\n");
	var data = pbnToJson(para);
	var hands = eval("(" + data + ")");
	g_hands = new Object();
	g_hands.boards = new Array();
	g_hands.boards[0] = new Object();
	g_hands.boards[0].board = "1";
	g_lastBindex = 0;
	g_test = 0;
	g_file = 'xyz.pbn';
	g_travellers = null;
	loadHands_1(para);
}

function loadSubPage(fileref)
{
	g_session = 0;
	var response = doRequestHTML(fileref);
	var target = document.getElementById("work_frame");
	target.innerHTML = response;
	
	try {
		if (fileref=="contactus.htm") setupMailLinks();
	} catch (err) {};
}
