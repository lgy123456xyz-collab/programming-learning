/**********************************************************************************
   -- Copyright (C) 2023 by John Goacher - All Rights Reserved
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/.
***********************************************************************************/
#include "dll.h"
#include "timer.h"
#include <sys/un.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <unistd.h>
#include <errno.h>
#include <ctype.h>
#include <sys/time.h>
#include <sys/resource.h>
#include <inttypes.h>
#include "emscripten.h"

extern "C" {
	char* EMSCRIPTEN_KEEPALIVE handleDDSRequest(char*,char*,char*,char*,char*,char*,char*,char*,char*,char*);
}

char *unescstring(char *, int, char *, int);
void convertDDStr(char *strs,char *strd);
int playAccuracy(char*,char,char,char*,char*);
int findCard(char*,int,char,int);

char fullResponse[4096];

int playSingleCard(char* pbn,char trump,char leader,char* currentTrickCards,char* response)
{
	char* suitLetters  = "SHDCN";
	char* cardLetters = "23456789TJQKA";
	char* direction = "nesw";
	struct dealPBN pdn;
	struct futureTricks fut;
	int res[14][4];
	char *respptr = response;
	cTimer timer;

	timer.start();

	respptr[0] = 0;

	strcpy(&pdn.remainCards[0],pbn);

	for (int i=0;i<strlen(pdn.remainCards);i++)
	{
		if (pdn.remainCards[i]=='x')
			pdn.remainCards[i] = ' ';
	}

	if (currentTrickCards[0]!='g')	// Remove the played card from the PBN string
	{
		char suitChar = currentTrickCards[strlen(currentTrickCards)-2];
		char faceChar = currentTrickCards[strlen(currentTrickCards)-1];
		int suitIndex = (strchr(suitLetters,suitChar)-&suitLetters[0]);
		findCard(&pdn.remainCards[0],suitIndex,faceChar,1);
	}

	pdn.trump = strchr(suitLetters,trump)-&suitLetters[0];
	pdn.first = strchr(direction,leader)-&direction[0];

	int sbcode = -1;

	if (strlen(currentTrickCards)<=6)
	{
		for (int i=0;i<3;i++)
		{
			pdn.currentTrickSuit[i] = 0;
			pdn.currentTrickRank[i] = 0;
		}


		for (int i=0;i<((strlen(currentTrickCards))/2);i++)
		{
			pdn.currentTrickSuit[i] = strchr(suitLetters,currentTrickCards[2*i])-&suitLetters[0];
			pdn.currentTrickRank[i] = 2 + (strchr(cardLetters,currentTrickCards[1+2*i])-&cardLetters[0]);
		}

		sbcode = SolveBoardPBN(pdn,-1,3,1,&fut,0);

		timer.check();

		respptr += snprintf(respptr,1000,"\"deltaElapsed\":%f,",timer.dblElapsed());
		respptr += snprintf(respptr,1000,"\"pbn\":\"%s\",",pdn.remainCards);

		if (sbcode==1)	// Success
		{
			for (int i=0;i<14;i++)
				for (int j=0;j<4;j++)
					res[i][j] = 0;

			for (int i=0;i<fut.cards;i++)
			{
				int score = fut.score[i];
				int suit = fut.suit[i];
				int partHolding = fut.rank[i];
				int value = 1;
				partHolding = value<<(partHolding-2);
				partHolding = partHolding|(fut.equals[i]>>2);
				res[score][suit] = res[score][suit]|partHolding;
			}
		}

		respptr += snprintf(respptr,1000,"\"cards\":[");
		int ocnt = 0;

		for (int i=0;i<14;i++)
		{
			int used = 0;

			for (int j=0;j<4;j++)
				if (res[i][j]!=0) used=1;

			if (used)
			{
				if (ocnt!=0) respptr += snprintf(respptr,1000,",");
				ocnt++;

				respptr += snprintf(respptr,1000,"{");
				respptr += snprintf(respptr,1000,"\"score\":%d,\"values\":[",i);
				for (int j=0;j<4;j++)
				{
					respptr += snprintf(respptr,1000,"[");

					if (res[i][j]!=0)
					{
						int tot = 0;

						for (int k=12;k>=0;k--)
						{
							int val = (res[i][j]>>k)&1;

							if (val)
							{
			
								if (tot!=0) respptr += snprintf(respptr,1000,",");
								tot++;
								respptr += snprintf(respptr,1000,"%d",k);
							}
						}
					}

					respptr += snprintf(respptr,1000,"]");

					if (j<3) respptr += snprintf(respptr,1000,",");
				}
				respptr += snprintf(respptr,1000,"]}");
			}
		}

		respptr += snprintf(respptr,1000,"]");
	}
	else
	{
		respptr += snprintf(respptr,1000,"\"pbn\":\"%s\"",pdn.remainCards);
		return 0;
	}

	respptr += snprintf(respptr,1000,",\"currentTrick\":[");

	for (int i=0;i<3;i++)
	{
		if (pdn.currentTrickRank[i]!=0)
		{
			if (i>0) respptr += snprintf(respptr,1000,",");
			respptr += snprintf(respptr,1000,"[%d,%d]",pdn.currentTrickSuit[i],pdn.currentTrickRank[i]-2);
		}
	}

	respptr += snprintf(respptr,1000,"]");

	if (sbcode==1)
		return 0;
	else
		return sbcode;
}

char* handleDDSRequest(char* dealstr,char* trumps,char* request,char* leader,char* vulStr,char* cards,char* leadStr,char* token,char* sockref,char* resume)
{
		// Minimal parameter validation is carried out in this routine because the parameters will already have been checked in ddummy.js prior to
		// calling this cgi. The checks here are mainly to prevent buffer overflow in case anyone attempts to call the cgi directly. ddd/DDS will carry
		// out further checks on the validity of the parameter values.
    int res,j;
	struct solvedBoards solved;
	struct futureTricks *fut;
	int solutions[20];
	struct ddTableDealPBN pdn;
	struct ddTableResults tablep;
	struct parResults par;
	char requestToken[31];	// Locally unique token passed by the client program to the cgi with the initial request when playing a hand.
	char ddcacheStr[21];
	char ddTricks[21];
		// The lengths of the following three buffers are sufficient to cope with the largest response that can be generated by ddd/DDS
	char tmpbuf[1024];
	char response[4096];
	char oleads[3000];	// String to hold opening leads info for all 20 makeable contracts.
	char buffer[21];
	int result = 0;
	int thread;
	int ddCalcOK = 1;
	int leadsRequested = 0;	// Set to 1 if lead cards requested for at least one makeable contract (means lead string will be included in cache file name
	int i,k;
	char unique[40];	// This field is used to store a globally unique session token generated by this cgi module and used to identify a particular play session that is in progress.
	int vul;

	thread = 0;	// Thread number to be passed to dd and dds for card play

	vul = -1;

	int stringCount = 0;

	for (i=0;i<20;i++)
		solutions[i] = 1;

	oleads[0] = 0;

	requestToken[0] = 0;

	if (token!=0)	// Start of a new contract, save the token sent by the client
	{		// and return it along with the new session id		
	   strcpy(requestToken,token);
	}

	if (vulStr!=0) // Vulnerability supplied (as required for Par function)
	{
		if (strcmp(vulStr,"None")==0) vul = 0;
		else if (strcmp(vulStr,"All")==0) vul = 1;
		else if (strcmp(vulStr,"NS")==0) vul = 2;
		else if (strcmp(vulStr,"EW")==0) vul = 3;
	}

	stringCount = 2;

	if (request==0)
	{
		result = 404;
	}

	if (leadStr!=0)
	{
		if (strlen(leadStr)==20)
		{
			for (i=0;i<20;i++)
			{
				if (leadStr[i]!='0')
				{
					leadsRequested = 1;
					solutions[i] = 3;	// return all lead cards as well as makeable contracts for this position.
				}
			}
		}
		else
			result = 408;
	}

	if (leadsRequested==0)	// If no leads requested we won't include this string in the filename for the makeable contract results (for backward compatibility)
		leadStr = 0;

	if (sockref!=0)
	{
	   if (strlen(sockref)>40)
		   result = 405;
	}
	else	// create a unique reference
	{
	   unique[0] = 0;
	   srand(time(NULL));
	   snprintf(unique,40,"%jd%d",(intmax_t)getpid(),rand()); // Concatenate current time and process pid to give a unique session identifier
	}

	if (result==0)
	{
		if (request!=0)
		{
		   if (request[0]=='m')
		   {
			   if (dealstr!=0)
			   {
					for (i=0;i<strlen(dealstr);i++)
					{
						if (dealstr[i]=='x') dealstr[i] = ' ';
					}

					for (i=0;i<80;i++)
						pdn.cards[i] = 0;

					strcpy(&pdn.cards[0],dealstr);

						// Call InitStart to tell DDS how many threads to create. Tell DDS there is 4 GB memory available to 
						// ensure it does not reduce the number of threads (DDS in this version assumes memory requirement per thread
						// is much higher than is normally the case).
					InitStart(1,1);	// Initialise DDS to allocate storage, one thread for each suit + NT

		 			int ddres = CalcDDtableAndLeadsPBN(pdn,solutions,&tablep,&solved);

					if (ddres==1)	// Successful
					{
						ddcacheStr[20] = 0;

						for (i=0;i<5;i++)
							for (j=0;j<4;j++)
							{
							int value = tablep.resTable[i][j];

							if (value<10)
								ddcacheStr[4*i+j] = (char)(48 + value);
							else
								ddcacheStr[4*i+j] = (char)(97 + value - 10);
							}

						convertDDStr(ddcacheStr,ddTricks);

						char suit[]="SHDC";
						char rank[] = "23456789TJQKA";

						snprintf(tmpbuf,1000,"\"openingLeads\":[");
						strcat(oleads,tmpbuf);

						for (i=0;i<20;i++)
						{
							fut = &solved.solvedBoard[i];

							snprintf(tmpbuf,1000,"[");
							strcat(oleads,tmpbuf);

							for (j=0;j<fut->cards;j++)
							{
								char suitc = suit[fut->suit[j]];
								char card = rank[fut->rank[j]-2];

								snprintf(tmpbuf,1000,"[\"%c%c\",%d]",card,suitc,fut->score[j]);
								strcat(oleads,tmpbuf);

								int equals = fut->equals[j];

								for (k=2;k<=14;k++)
								{
									if (equals&(1<<k))
									{
										snprintf(tmpbuf,1000,",[\"%c%c\",%d]",rank[k-2],suitc,fut->score[j]);
										strcat(oleads,tmpbuf);
									}
								}

								if (j<(fut->cards - 1))
									strcat(oleads,",");
							}

							snprintf(tmpbuf,1000,"]");
							strcat(oleads,tmpbuf);

							if (i!=19)
								strcat(oleads,",");
							else
								strcat(oleads,"]");
						}
					}
					else
					{
						ddCalcOK = 0;
						snprintf(tmpbuf,1024,"%s%s%s","{\"status\":\"","312","\"");
						strcat(response,tmpbuf);
						snprintf(tmpbuf,1024,"%s%d%s",",\"errno\":\"",ddres,"\"");
						strcat(response,tmpbuf);
						snprintf(tmpbuf,1024,"%s%s%s",",\"errmsg\":\"","error detected by DDS CalcDDtablePBN function","\"}");
						strcat(response,tmpbuf);
					}


					if (ddCalcOK)	// dd tricks available for calculation of par contracts/score
					{
						res=Par(&tablep,&par,vul);

						response[0] = 0;

							// This code does not attempt to set a limiting value for the second parameter of the snprintf calls because it is known
							// that the target buffer is sufficiently large to cope with the worst case response string.
						snprintf(tmpbuf,1024,"%s%s%s","{\"sockref\":\"",sockref,"\"");
						strcat(response,tmpbuf);
						snprintf(tmpbuf,1024,"%s%s%s",",\"ddtricks\":\"",ddTricks,"\"}");
						strcat(response,tmpbuf);

						if (res==1) // Par function was successful, so include the results.
						{
							snprintf(tmpbuf,1024,"%s%s%s",",\"contractsNS\":\"",par.parContractsString[0],"\"");
							strcat(response,tmpbuf);
							snprintf(tmpbuf,1024,"%s%s%s",",\"contractsEW\":\"",par.parContractsString[1],"\"");
							strcat(response,tmpbuf);
							snprintf(tmpbuf,1024,"%s%s%s",",\"scoreNS\":\"",par.parScore[0],"\"");
							strcat(response,tmpbuf);
							snprintf(tmpbuf,1024,"%s%s%s",",\"scoreEW\":\"",par.parScore[1],"\"");
							strcat(response,tmpbuf);

							if (leadsRequested==1)
							{
								strcat(response,",");
								strcat(response,oleads);
							}
						}
						else
						{
							snprintf(tmpbuf,1024,"%s%s%s","{\"status\":\"","311","\"");
							strcat(response,tmpbuf);
							snprintf(tmpbuf,1024,"%s%d%s",",\"errno\":\"",res,"\"");
							strcat(response,tmpbuf);
							snprintf(tmpbuf,1024,"%s%s%s",",\"errmsg\":\"","error detected by DDS Par function","\"}");
							strcat(response,tmpbuf);
						}

						snprintf(tmpbuf,1024,"%s%d%s",",\"vul\":\"",vul,"\"");
						strcat(response,tmpbuf);
					}
			   }
			   else
			   {
					result = 407;	// No deal string supplied
			   }
			}
			else if (request[0]=='a')	// Look at Play Accuracy
			{
				if (trumps==0)
					result = 410;	// No trump parameter supplied
				else if (leader==0)
					result = 411;	// No leader parameter supplied
				else
				{
					if (cards!=0)
					{
						result = playAccuracy(dealstr,trumps[0],leader[0],cards,response);
					}
					else
						result = 412;	// No card sequence supplied
				}
			}
			else    // Play a card
			{
				InitStart(1,1);	// Initialise DDS to allocate storage, just 1 thread
				result = playSingleCard(dealstr,trumps[0],leader[0],request,tmpbuf);
				snprintf(response,1000,"{\"errno\":%d,\"errmsg\":\"\",%s}",result,tmpbuf);
			}
		}
		else
			result = 406;	// No request parameter supplied
	}

	fullResponse[0] = '\0';

	if (result==0)
	{
		strcpy(fullResponse,"{\"sess\":");
		strcat(fullResponse,response);

		if (strlen(requestToken)!=0)
		{
			strcat(fullResponse,",\"requesttoken\":\"");
			strcat(fullResponse,requestToken);
			strcat(fullResponse,"\"");
		}

		strcat(fullResponse,"}");
	}
	else
	{
		strcpy(fullResponse,"{\"sess\":{\"status\":\"");
		buffer[0] = 0;
		snprintf(buffer,20,"%d",result);
		strcat(fullResponse,buffer);
		strcat(fullResponse,"\"}}");
	}

	return &fullResponse[0];
}

void convertDDStr(char *strs,char *strd)
{
		// Take a string with same organisation as returned by
		// DDS and convert it to format used by ddummy.js
	int i,j,value;

	strd[20] = 0;

	for (i=0;i<5;i++)
	   for (j=0;j<4;j++)
	   {
		int index,index2;

		if (i==4)
			index = 0;
		else
			index = i+1;

		if (j==2) index2 = 1;
		else if (j==1) index2 = 2;
		else index2 = j;

		int value = strs[4*i+j];

		if (value<10)
			strd[index+5*index2] = value;
		else
			strd[index+5*index2] = value;
	   }

}

	// Play Accuracy Analysis Routines
int getNthIndex(char* s, int start, char t, int n)
{
    int count = 0;
	int i;

	if (n==0) return start;

    for (i = start; i < strlen(s); i++)
    {
        if (s[i] == t)
        {
            count++;
            if (count == n)
            {
                return i+1;
            }
        }
    }
    return -1;
}

int findCard(char* s,int suitIndex,char faceChar,int remove)
{
		// Now find which hand the card is in
	int hand = 0;	// West hand
	int found = 0;
	int cardIndex = -1;
	int i,k;

	for (i=0;i<4;i++)
	{
		if (found==1) break;

		int startOfHand = getNthIndex(s,0,' ',i);

		if (startOfHand==-1) return -1;

			// Now locate start of suit
		int startOfSuit = getNthIndex(s,startOfHand,'.',suitIndex);
		
		if (startOfSuit==-1) return -1;

			// Is card in this suit holding ?
		k = startOfSuit;

		while (k<strlen(s))
		{
			if ((s[k]=='.')|(s[k]==' '))
				break;

			if (s[k]==faceChar)
			{
				found = 1;
				cardIndex = k;
				hand = (i+3) % 4;
				break;
			}

			k++;
		}
	}

	if (found==1)
	{
		if (remove==1) memmove(&s[cardIndex],&s[cardIndex+1],strlen(s)-cardIndex);
		return hand;
	}
	else
		return -1;
}

int playCard(char* pbn,char trump,char leader,char* currentTrickCards,char* response)
{
	char* suitLetters  = "SHDCN";
	char* cardLetters = "23456789TJQKA";
	char* direction = "nesw";
	struct dealPBN pdn;
	struct futureTricks fut;

	strcpy(&pdn.remainCards[0],pbn);

	for (int i=0;i<strlen(pdn.remainCards);i++)
	{
		if (pdn.remainCards[i]=='x')
			pdn.remainCards[i] = ' ';
	}

	pdn.trump = strchr(suitLetters,trump)-&suitLetters[0];
	pdn.first = strchr(direction,leader)-&direction[0];

	for (int i=0;i<3;i++)
	{
		pdn.currentTrickSuit[i] = 0;
		pdn.currentTrickRank[i] = 0;
	}

	for (int i=0;i<strlen(currentTrickCards)/2;i++)
	{
		int j = i/2;
		pdn.currentTrickSuit[j] = strchr(suitLetters,currentTrickCards[2*j])-&suitLetters[0];
		pdn.currentTrickRank[j] = 2 + (strchr(cardLetters,currentTrickCards[1+2*j])-&cardLetters[0]);
	}

	int sbcode = SolveBoardPBN(pdn,-1,3,1,&fut,0);

}

int playAccuracy(char* pbn,char trump,char leader, char* cards,char* response)
{
	int i,j,k,res;
	struct dealPBN pdn;
	struct ddTableResults tablep;
	struct parResults par;
	struct futureTricks fut;
	char* cardLetters = "23456789TJQKA";
	char* suitLetters  = "SHDCN";
	char* direction = "nesw";
	char tricksConceded[500];
	char cardDirection[500];
	char optimumCount[500];
	char subOptimumCount[500];
	int declHand = 0;
	cTimer timer;

	response[0] = 0;

	InitStart(1,1);

	timer.start();

	tricksConceded[0] = 0;
	cardDirection[0] = 0;
	optimumCount[0] = 0;
	subOptimumCount[0] = 0;

	for (i=0;i<80;i++)
		pdn.remainCards[i] = 0;

	pdn.remainCards[0] = 'W';
	pdn.remainCards[1] = ':';

	if (strlen(pbn)>77) return 500;	// PBN string too long

		// **** CURRENTLY ASSUMES PDN STRINGS ALWAYS START WITH WEST HAND
	strcpy(&pdn.remainCards[2],pbn);

	for (i=0;i<strlen(pdn.remainCards);i++)
	{
		if (pdn.remainCards[i]=='x')
			pdn.remainCards[i] = ' ';
	}

	if (strchr(suitLetters,trump)==NULL) return 501;	// Invalid trump suit

	pdn.trump = strchr(suitLetters,trump)-&suitLetters[0];	// Spades

	if (strchr(direction,leader)==NULL) return 502;	// Invalid dealer suit

	pdn.first = strchr(direction,leader)-&direction[0];  // North
	int defHand = pdn.first;

	if (strlen(cards)>104) return 503;	// More than 52 played cards (each card is two characters)

	int declErr = 0;
	int defErr = 0;

	int m,p;

	for (m=0;m<13;m++)
	{
		for (i=0;i<3;i++)
		{
			pdn.currentTrickSuit[i] = 0;
			pdn.currentTrickRank[i] = 0;
		}

		for (p=0;p<4;p++)
		{
			if ((((m*4)+(p+1))*2)>strlen(cards)) break;

			int score = 0,maxScore = 0;

			char cardStr[14];

			char suitChar = cards[8*m+2*p];
			char faceChar = cards[8*m+2*p+1];
			int suitIndex = -1;

			if (strchr(suitLetters,suitChar)==NULL) return 504;	// Invalid suit in played card sequence

			suitIndex = (strchr(suitLetters,suitChar)-&suitLetters[0]);

			if (p==0)
			{
				pdn.first  = findCard(&pdn.remainCards[0],suitIndex,faceChar,0);
				if (pdn.first==-1) return 505;	// Played card not found in PBN string
			}

			int sbcode = SolveBoardPBN(pdn,-1,3,1,&fut,0);

			if (sbcode!=1) return 506;	// Error return from SolveBoard in playAccuracy function

			for (int i=0;i<fut.cards;i++)
			{
				if (fut.score[i]>maxScore) maxScore = fut.score[i];
			}			


			if (p<3)
			{
				pdn.currentTrickSuit[p] = suitIndex;
				pdn.currentTrickRank[p] = 2 + (strchr(cardLetters,faceChar)-&cardLetters[0]);
			}

			int maxScoreCount = 0;
			int lowerScoreCount = 0;

			for (int i=0;i<fut.cards;i++)
			{
				int thisScore = fut.score[i];
				int equals = fut.equals[i];
				int res;

				for (j=0;j<14;j++)
					cardStr[j] = 0;

				cardStr[0] = cardLetters[fut.rank[i]-2];

				if (thisScore==maxScore)
					maxScoreCount++;
				else
					lowerScoreCount++;

				for (j=2;j<14;j++)
				{
					res = equals >> j;

					if ((res&1)!=0)
					{
						cardStr[strlen(cardStr)] = cardLetters[j-2];

						if (thisScore==maxScore)
							maxScoreCount++;
						else
							lowerScoreCount++;
					}
				}

				if ((strchr(cardStr,faceChar)!=NULL)&(suitIndex==fut.suit[i]))
				{
					score = fut.score[i];
				}
			}

			int idx;
			
			idx = findCard(&pdn.remainCards[0],suitIndex,faceChar,1);	// Find hand that card was in, and also remove it from the PBN string

			if (idx==-1) return 507;	// Could not remove card from PBN string (not found)

			int scoreDiff = maxScore - score;

			if (scoreDiff!=0)
			{
				if ((idx==defHand)|(idx==(defHand+2)%4))
				{
					declHand = 0;
					defErr++;
				}
				else
				{
					declHand = 1;
					declErr++;
				}
			}

			if (strlen(tricksConceded)>0)
			{
				strcat(tricksConceded,",");
				strcat(cardDirection,",");
				strcat(optimumCount,",");
				strcat(subOptimumCount,",");
			}

			snprintf(tricksConceded+strlen(tricksConceded),500,"%d",scoreDiff);
			snprintf(cardDirection+strlen(cardDirection),500,"%d",idx);
			snprintf(optimumCount+strlen(optimumCount),500,"%d",maxScoreCount);
			snprintf(subOptimumCount+strlen(subOptimumCount),500,"%d",lowerScoreCount);
		}
	}

	timer.check();

	snprintf(response,500,"{\"declErr\":%d,\"defErr\":%d,\"totalCardsPlayed\":%d,\"deltaElapsed\":%f",declErr,defErr,strlen(cards)/2,timer.dblElapsed());
	strcat(response,",\"tricksConceded\":[");
	strcat(response,tricksConceded);
	strcat(response,"]");
	strcat(response,",\"cardDirection\":[");
	strcat(response,cardDirection);
	strcat(response,"]");
	strcat(response,",\"optimumCount\":[");
	strcat(response,optimumCount);
	strcat(response,"]");
	strcat(response,",\"subOptimumCount\":[");
	strcat(response,subOptimumCount);
	strcat(response,"]}");

	return 0;
}







