#! /bin/sh
# This is a shell archive, meaning:
# 1. Remove everything above the #! /bin/sh line.
# 2. Save the resulting text in a file.
# 3. Execute the file with /bin/sh (not csh) to create the files:
#	.
# This archive created: Thu May 14 18:12:22 1992
export PATH; PATH=/bin:$PATH
if test -f 'checks.c'
then
	echo shar: will not over-write existing file "'checks.c'"
else
sed 's/^X//' << \SHAR_EOF > 'checks.c'
X#include <stdio.h>
X#include "trie.h"
X#include "globals.h"
X
X#define ALLCHK 0x7FFFFFE
X
Xunsigned trielookup (t, s) register unsigned t; register char *s;
X{
X    register unsigned  *p;
Xfoo: 
X    if (!*s)
X	return (t);
X    if (!ptr (t))
X	return (0);
X    p = dawg + ptr (t);
X    do {
X	if (chr (*p) == chr (*s)) {
X	    t = *p;
X	    s++;
X	    goto foo;
X	}
X    }
X    while (!last (*p++));
X    return (0);
X}
X
Xunsigned checkout (s, score) char *s; unsigned *score;
X{
X    register unsigned   chek = 0,
X                       *p;
X    register char  *s1 = s;
X    *score = 0;
X    while (s1[-1])
X	(*score) += lettervalue[*--s1];
X /* now s1 points to top of word */
X    p = dawg + ptr (trielookup (root, s1));
X    if (p == dawg)
X	return (0);
X    do
X	if (term (trielookup (*p, s + 1)))
X	    chek |= (1 << chr (*p));
X    while (!last (*p++));
X    while (s[1])
X	(*score) += lettervalue[*++s];
X    return (chek);
X}
X 
Xcomputechecks (fill, check, trans)
X    char fill[17][17]; unsigned check[17][17], trans[17][17];
X{
X    unsigned    i,
X                j;
X    for (i = 1; i < 16; i++)
X	for (j = 1; j < 16; j++) {
X	    trans[j][i] = -1;
X	    check[j][i] =
X		 fill[i][j] ? 0
X		:fill[i][j - 1] || fill[i][j + 1] ?
X		     checkout (fill[i] + j, trans[j] + i)
X		:ALLCHK;
X	}
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'command.c'
then
	echo shar: will not over-write existing file "'command.c'"
else
sed 's/^X//' << \SHAR_EOF > 'command.c'
X#include <ctype.h>
X#include <stdio.h>
X#include "graphics.h"
X#include "globals.h"
X#include "trie.h"
X
Xint dx[10] = {0,-1,0,1,-1,0,1,-1,0,1}; 
Xint dy[10] = {0,1,1,1,0,0,0,-1,-1,-1};
X
Xint redrawflag = 1, computermoveflag = 0, gameover = 0;
Xchar state = 0;
X
X#define GO (computermoving=computermoveflag=1)
X
Xcommand()
X{
X    char    c;
X    int     i,
X            j;
X    redrawflag = 1;
X
X /* Get a command char and clear out lines with temporary messages */
X    c = getch ();
X    clearline (ERRORLINE);
X    clearline (MSGLINE);
X    if (computermoveflag) {
X	computermoveflag = 0;
X	zapmove();
X    }
X     if (state == '#') {
X	state = 0;
X	if (!isalpha (c))
X	    beep ();
X	else {
X	    c = chr (c) | BLANKBIT;
X	    afill[cursory][cursorx] = NEWBIT | c;
X	    dfill[cursorx][cursory] = NEWBIT | c;
X	    yourrack[BLANK]--;
X	    position (cursory, cursorx);
X	    standout ();
X	    placeletter (c);
X	    standend ();
X	}
X    }
X
X    else
X	switch (isupper(c)?tolower (c):c) {	/* Deal with command char */
X
X	    case '7': 
X	    case '8': 
X	    case '9': 		/* Cursor motion */
X	    case '4': 
X	    case '6': 
X	    case '1': 
X	    case '2': 
X	    case '3': 
X		cursorx += dx[c - '0'];
X		cursory += dy[c - '0'];
X		redrawflag = 0;
X		break;
X	    case CTRL(B):
X		cursorx--;
X		break;
X	    case CTRL(F):
X		cursorx++;
X		break;
X	    case CTRL(P):
X		cursory--;
X		break;
X	    case CTRL(N):
X		cursory++;
X		break;
X	    case 'a': 
X	    case 'b': 
X	    case 'c': 
X	    case 'd': 
X	    case 'e': 
X	    case 'f': 
X	    case 'g': 
X	    case 'h': 
X	    case 'i': 
X	    case 'j': 
X	    case 'k': 
X	    case 'l': 
X	    case 'm': 
X	    case 'n': 
X	    case 'o': 
X	    case 'p': 
X	    case 'q': 
X	    case 'r': 
X	    case 's': 
X	    case 't': 
X	    case 'u': 
X	    case 'v': 
X	    case 'w': 
X	    case 'x': 
X	    case 'y': 
X	    case 'z': 
X		c = chr (c);
X		if (!afill[cursory][cursorx])
X		    if (yourrack[c]) {
X			afill[cursory][cursorx] = NEWBIT | c;
X			dfill[cursorx][cursory] = NEWBIT | c;
X			yourrack[c]--;
X			position (cursory, cursorx);
X			standout ();
X			placeletter (c);
X			standend ();
X		    }
X		    else
X			if (yourrack[BLANK]) {
X			    c = chr (c) | BLANKBIT;
X			    afill[cursory][cursorx] = NEWBIT | c;
X			    dfill[cursorx][cursory] = NEWBIT | c;
X			    yourrack[BLANK]--;
X			    tell("(Using your blank)");
X			    position (cursory, cursorx);
X			    standout ();
X			    placeletter (c);
X			    standend ();
X			}
X		    else
X		        beep();
X		else
X		    beep ();
X		break;
X
X	    case '#': 
X		if (yourrack[BLANK] && !afill[cursory][cursorx]) {
X		    state = '#';
X		    tell ("Now type the letter you want the blank to be.");
X		}
X		else
X		    beep ();
X		break;
X
X	    case ' ': 
X		if (afill[cursory][cursorx] & NEWBIT) {
X		    c = afill[cursory][cursorx] ^ NEWBIT;
X		    if (c & BLANKBIT)
X			c = BLANK;
X		    yourrack[c]++;
X		    afill[cursory][cursorx] = 0;
X		    dfill[cursorx][cursory] = 0;
X		    position (cursory, cursorx);
X		    removeletter ();
X		}
X		else
X		    beep ();
X		break;
X		
X	    case '?':		/* Give new help */
X	        givehelp();
X		break;
X
X	    case '.': 		/* Make a move */
X		if (humanmove (0))
X		    GO;
X		break;
X
X	    case '~':		/* Suggest a Move */
X		for (i = 1; i < 16; i++)
X		    for (j = 1; j < 16; j++)
X	    		if (afill[i][j] & NEWBIT) {
X		    c = afill[i][j] ^ NEWBIT;
X		    if (c & BLANKBIT)
X			c = BLANK;
X		    yourrack[c]++;
X		    afill[i][j] = 0;
X		    dfill[j][i] = 0;
X		    position (i, j);
X		    removeletter ();
X		}
X
X		suggestmove();
X		break;
X
X	    case ':': 
X		if (humanmove (1)) {
X		    mvprintw (23, 61, "THIS GAME IS BOGUS");
X		    GO;
X		}
X		break;
X
X	    case '-': 		/* exchange tiles */
X		consecutivepasses = 0;
X		if (exchange ())
X		    GO;
X		break;
X
X	    case '=': 		/* pass */
X		for (i = 1; i < 16; i++)
X		    for (j = 1; j < 16; j++)
X			if (afill[i][j] & NEWBIT)
X			    c = 0;
X		if (c) {
X		    GO;
X		    consecutivepasses++;
X		}
X		else
X		    errortell ("Get your tiles off the board before you pass.");
X		break;
X
X	    case CTRL(C):
X	    case '\177':
X	    case '+':
X		quit ();
X		break;
X
X	    case CTRL(Z):
X	        tstp ();
X		break;
X
X	    case CTRL(L):
X		wrefresh (curscr);
X		redrawflag = 0;
X		break;
X
X	    default: 
X		break;
X	}
X    if (redrawflag)
X	showstuff ();
X
X /* Remap cursor position into legal range and update the screen */
X    cursorx = (cursorx + LEN - 1) % LEN + 1;
X    cursory = (cursory + LEN - 1) % LEN + 1;
X    position (cursory, cursorx);
X    refresh ();
X}
X
Xinitcommand ()
X{
X    cursorx = cursory = 8;
X    position (cursory, cursorx);
X    showstuff ();
X    refresh ();
X    think ();
X    endgame ();
X    quit ();
X}
X
Xthink ()
X{
X    for (;;) {
X	thinking (0);
X	position (cursory, cursorx);
X	refresh ();
X	while (!computermoving)
X	    command ();
X	if (consecutivepasses > 2 || anyrackempty)
X	    return;
X	thinking (1);
X	position (cursory, cursorx);
X	refresh ();
X
X	computermove ();
X	showstuff ();
X	position (cursory, cursorx);
X	refresh ();
X	computermoving = 0;
X	if (consecutivepasses > 2 || anyrackempty)
X	    return;
X    }
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'compdict.c'
then
	echo shar: will not over-write existing file "'compdict.c'"
else
sed 's/^X//' << \SHAR_EOF > 'compdict.c'
SHAR_EOF
fi # end of overwriting check
if test -f 'eval.c'
then
	echo shar: will not over-write existing file "'eval.c'"
else
sed 's/^X//' << \SHAR_EOF > 'eval.c'
X#include <stdio.h>
X#include "globals.h"
X#include "graphics.h"
X#include "trie.h"
X
Xextern char *currentmove;
X
Xeval(fill, trans, r, c) char fill[17][17]; int trans[17][17]; unsigned r,c;
X{
X    register int    c1,
X                    xscore = 0,
X                    fscore = 0,
X                    factor = 1,
X                    count = 0;
X    register char ch, *moveptr=currentmove;
X    register int    l,
X                    t;
X    if (!*moveptr) return;
X    for (c1 = c - 1; ; c1--)
X        if (ch=fill[r][c1]) fscore += lettervalue[ch];
X	else if (ch = *moveptr--)
X	  {
X	    l = lettermult[r][c1] * lettervalue[ch];
X	    t = trans[r][c1];
X	    if (t >= 0)
X		xscore += (t + l) * wordmult[r][c1];
X	    fscore += l;
X	    factor *= wordmult[r][c1];
X	    count++;
X	}
X	else break;
X
X    xscore += fscore * factor + 50 * (count == 7);
X    fscore = xscore;
X    if (fscore > bestmove.value) {
X        for(moveptr=currentmove, t=0; *moveptr; moveptr--, t++)
X		bestmove.word[t] = *moveptr | NEWBIT;
X	bestmove.word[t] = 0;
X	bestmove.r = r;
X	bestmove.c = c;
X	bestmove.fill = fill;
X	bestmove.score = xscore;
X	bestmove.value = fscore;
X    }
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'genmove.c'
then
	echo shar: will not over-write existing file "'genmove.c'"
else
sed 's/^X//' << \SHAR_EOF > 'genmove.c'
X#include <stdio.h>
X#include "globals.h"
X#include "trie.h"
X
Xunsigned row, column;
X
Xunsigned   (*check)[17], *checkrow;
Xchar       (*fill)[17],  *fillrow;
Xint        (*trans)[17], *transrow;
X
X
Xfirstmove ()
X{
X    check = acheck;
X    fill = afill;
X    fillrow = fill[8];
X    checkrow = check[8];
X    trans = atrans;
X    transrow = trans[8];
X    row = 8;
X    column = 8;
X    prefix(root, 6);
X}
X
Xchar currentmovearea[10]={0}, *currentmove=currentmovearea;
X
X
Xputp (xcheck, xfill, xtrans)
X unsigned (*xcheck)[17]; char (*xfill)[17]; int (*xtrans)[17]; 
X{
X    int     lastanchor;
X
X    check = xcheck;
X    fill = xfill;
X    trans = xtrans;
X    for (row = 1; row <= 15; row++) {
X	checkrow = check[row];
X	fillrow = fill[row];
X	lastanchor = 0;
X	for (column = 1; column <= 15; column++)
X	    if (!fillrow[column]
X		    && (fill[row - 1][column] | fill[row + 1][column]
X			| fillrow[column - 1] | fillrow[column + 1])
X		) {
X		if (fillrow[column - 1])
X		    extend (root, lastanchor + 1);
X		else
X		    prefix (root, column - lastanchor - 1);
X		lastanchor = column;
X
X	    }
X    }
X}
Xprefix(loc,lim) register unsigned loc; int lim;
X{register unsigned  *l;
X
X   extend(unterm(loc), column);
X   if (lim && ptr (loc)) {
X	    l = dawg + ptr (loc);
X	    do {register d, c = chr (*l);
X		    if (rack[c])
X			rack[d = c]--;
X		    else if (rack[BLANK]) {
X			c |= BLANKBIT;
X			rack[d = BLANK]--;
X		    }
X		    else continue;
X		    *++currentmove = c;
X		    prefix(*l, lim-1);
X		    currentmove--;
X		    rack[d]++;
X	    } while (!last (*l++));
X   }
X}
X
Xextend (loc, col) register unsigned loc, col;
X{
X    register unsigned  *l,
X                        c,
X                        d;
X    if (fillrow[col] && ptr (loc)) {
X	l = dawg + ptr (loc);
X	do 
X	   if (chr (*l) >= chr (fillrow[col]))
X		if (chr (*l) == chr (fillrow[col]))
X		    extend (*l, col + 1);
X		else
X		    return;
X	while (!last (*l++));
X    }
X    else {
X	if (term (loc) && !fillrow[col])
X	    eval (fill, trans, row, col);
X	if (ptr (loc)) {
X	    l = dawg + ptr (loc);
X	    do {
X		c = chr (*l);
X		if (checkrow[col] & (1 << c)) {
X		    if (rack[c])
X			rack[d = c]--;
X		    else if (rack[BLANK]) {
X			c |= BLANKBIT;
X			rack[d = BLANK]--;
X		    }
X		    else continue;
X		    *++currentmove = c;
X		    extend (*l, col + 1);
X		    currentmove--;
X		    rack[d]++;
X		}
X	    } while (!last (*l++));
X	}
X    }
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'globals.c'
then
	echo shar: will not over-write existing file "'globals.c'"
else
sed 's/^X//' << \SHAR_EOF > 'globals.c'
X#include "globals.h"
X
Xint atrans[17][17], dtrans[17][17];
Xunsigned acheck[17][17], dcheck[17][17];
Xchar afill[17][17], dfill[17][17];
X
Xstruct goodmove bestmove;
X
Xint myscore,yourscore;
Xchar rack[28], yourrack[28];
Xint consecutivepasses, anyrackempty;
Xchar sock[28]; int socksize;
X
Xint cursorx, cursory, computermoving;
X
Xchar lettervalue[64] = 
X/*  a b c d  e f g h i j k l m n o p  q r s t u v w x y  z # */
X {0,1,3,3,2, 1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10,0};
X
Xchar letterquantity[28] =
X/*  a b c d  e f g h i j k l m n o p  q r s t u v w x y  z # */
X {0,9,2,2,4,12,2,3,2,9,1,1,4,2,6,8,2, 1,6,4,6,4,2,2,1,2, 1,2};
X
Xchar wordmult[17][17] =
X{{0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 },
X{ 0 , 3 , 1 , 1 , 1 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 1 , 1 , 1 , 3 , 0 },
X{ 0 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 0 },
X{ 0 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 3 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 3 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 0 },
X{ 0 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 0 },
X{ 0 , 3 , 1 , 1 , 1 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 1 , 1 , 1 , 3 , 0 },
X{ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 }};
X
Xchar lettermult[17][17] =
X{{0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 },
X{ 0 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 0 },
X{ 0 , 1 , 1 , 2 , 1 , 1 , 1 , 2 , 1 , 2 , 1 , 1 , 1 , 2 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 2 , 1 , 1 , 1 , 2 , 1 , 2 , 1 , 1 , 1 , 2 , 1 , 1 , 0 },
X{ 0 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 3 , 1 , 1 , 1 , 1 , 1 , 0 },
X{ 0 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 , 1 , 1 , 1 , 0 },
X{ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 }};
SHAR_EOF
fi # end of overwriting check
if test -f 'globals.h'
then
	echo shar: will not over-write existing file "'globals.h'"
else
sed 's/^X//' << \SHAR_EOF > 'globals.h'
Xextern int atrans[17][17], dtrans[17][17];
Xextern unsigned acheck[17][17], dcheck[17][17];
Xextern char afill[17][17], dfill[17][17];
X
Xextern struct goodmove {
X    char word[8];
X    unsigned r, c;
X    char (*fill)[17];
X    int score, value;
X} bestmove;
X
Xextern int myscore, yourscore;
Xextern char rack[28], yourrack[28];
Xextern int consecutivepasses, anyrackempty;
Xextern char sock[28]; extern int socksize;
X
Xextern int cursorx,cursory,computermoving;
Xextern char lettervalue[64], letterquantity[28];
Xextern char wordmult[17][17], lettermult[17][17];
SHAR_EOF
fi # end of overwriting check
if test -f 'graphics.c'
then
	echo shar: will not over-write existing file "'graphics.c'"
else
sed 's/^X//' << \SHAR_EOF > 'graphics.c'
X#include "graphics.h"
X#include "globals.h"
X
X#define CMDHELP 1
X#define KEYHELP 2
X#define TILEHELP 3
X 
Xposition (y, x) int y, x;
X{
X    move (Ypos (y), Xpos (x));
X}
X
Xmark (y, x, s) int y, x; char *s;
X{
X    position (y, x);
X    addstr (s);
X}
X
Xremoveletter ()
X{
X    int     y,
X            x;
X    getyx (stdscr, y, x);
X    y = y - BOARDLINE;
X    x = (x - BOARDCOL) >> 1;
X    addch (BOARDCHAR (y, x));
X}
X
Xplaceletter (c) char c;
X{
X    addch ((c & 077) + '@');
X}
X
X/* Clear line l of the screen */
Xclearline (l) int   l;
X{
X    move (l, 0);
X    clrtoeol ();
X}
X
X/* Print string s centered on line l */
Xcenterprint (l, s) int  l;
Xchar   *s; {
X    clearline (l);
X    mvaddstr (l, (COLS - strlen (s)) / 2, s);
X}
X
X/* Draw a horizontal line on screen row y from xmin to xmax.
X   Use '-' in the middle of the line and '+' at the ends. */
X
Xhoriz (y, xmin, xmax) int   y, xmin, xmax;
X{
X    int     x;
X    standout ();
X    for (x = xmin; x <= xmax; x++)
X	mvaddch (y, x, (x == xmin || x == xmax) ? '+' : '-');
X    standend ();
X}
X
X/* Draw a vertical line on screen column x from ymin to ymax.
X   Use '|' in the middle of the lines and '+' at the ends. */
Xvert (x, ymin, ymax) int    x, ymin, ymax;
X{
X    int     y;
X    standout ();
X    for (y = ymin; y <= ymax; y++)
X	mvaddch (y, x, (y == ymin || y == ymax) ? '+' : '|');
X    standend ();
X}
X
Xshowset (line, set) unsigned line, set;
X{
X    char    c = 'a' - 1;
X    clearline (line);
X    move (line, 10);
X    while (set) {
X	if (set & 1)
X	    addch (c);
X	set >>= 1;
X	c++;
X    }
X}
X
Xposit (fill, r, c) char fill[17][17]; unsigned r, c;
X{
X    if (fill == afill)
X	position (r, c);
X    else
X	position (c, r);
X}
X
Xbeep ()
X{
X    putchar ('\007');
X}
X
Xerrortell (s) char *s;
X{
X    centerprint (ERRORLINE, s);
X}
X
Xtell (s) char *s;
X{
X    centerprint (MSGLINE, s);
X}
X
Xstatic int helpline;
Xstatic int whichhelp = 0;
X
Xpicture ()
X{
X    centerprint (BOARDLINE - 1, "CRAB 1.3 - Jacoppel Enterprises");
X /* Draw a box around the board */
X    horiz (Ypos (0), Xpos (0), Xpos (LEN + 1));
X    horiz (Ypos (LEN + 1), Xpos (0), Xpos (LEN + 1));
X    vert (Xpos (0), Ypos (0), Ypos (LEN + 1));
X    vert (Xpos (LEN + 1), Ypos (0), Ypos (LEN + 1));
X    whichhelp = 0;
X    givehelp ();
X}
X
X
Xstarthelp ()
X{
X    helpline = HELPWLINE;
X}
X
Xhelps (r, s) char *r, *s;
X{
X    move (helpline, HELPWCOL);
X    clrtoeol ();
X    addstr (r);
X    mvaddstr (helpline++, HELPWCOL2, s);
X}
X
Xhelpc (c, s) char c, *s;
X{
X    move (helpline, HELPWCOL);
X    clrtoeol ();
X    addch (c);
X    mvaddstr (helpline++, HELPWCOL2, s);
X}
X
Xhelpt (s) char *s;
X{
X    move (helpline++, HELPWCOL2 - 3);
X    clrtoeol ();
X    standout ();
X    addstr (s);
X    standend ();
X    addch (' ');
X    clrtoeol ();
X}
X
Xhelpx ()
X{
X    move (helpline++, HELPWCOL);
X    clrtoeol ();
X}
X
Xendhelp ()
X{
X    int     dummy;
X    getyx (stdscr, helpline, dummy);
X    helpline++;
X    while (helpline < LINES)
X	helpx ();
X}
X
Xgivehelp ()
X{
X    int     i;
X    starthelp ();
X    switch (++whichhelp) {
X	default: 
X	    whichhelp = CMDHELP;
X	case CMDHELP: 
X	    helpt (" Commands ");
X	    helpx ();
X	    helps ("0-9", "Move Cursor");
X	    helps ("a-z", "Place Letter");
X	    helpc ('#', "Place Blank");
X	    helps ("space", "Remove Tile");
X	    helpx ();
X	    helpc ('.', "Make Move");
X	    helpc (':', "Make Bogus Move");
X	    helpc ('-', "Exchange Tiles");
X	    helpc ('=', "Pass");
X	    helpc ('+', "Quit Game");
X	    helpc ('~', "Suggest Move");
X	    helpx ();
X	    helpc ('?', "Get More Help");
X	    break;
X	case KEYHELP: 
X	    helpt ("    Key   ");
X	    helpx ();
X	    helps ("A-Z", "Normal Tile");
X	    helps ("a-z", "Blank on Board");
X	    helpc ('#', "Blank in Rack");
X	    helpc (TILEBACK, "Back of Tile");
X	    helpx ();
X	    helpc (LETx2, "Double Letter");
X	    helpc (LETx3, "Triple Letter");
X	    helpc (WORDx2, "Double Word");
X	    helpc (WORDx3, "Triple Word");
X	    break;
X	case TILEHELP: 
X	    helpt ("   Tiles  ");
X	    helpx ();
X	    helps ("Value", " #Unaccounted");
X	    helpx ();
X	    for (i = 1; i < 28; ++i)
X		showtilecount (i);
X	    break;
X    }
X    endhelp ();
X}
X
X#define HELPMID		((HELPWCOL + COLS) / 2)
X
Xshowtilecount (k) int k;
X{
X    int     x,
X            y;
X    if (whichhelp != TILEHELP)
X	return;
X    if (k < 14) {
X	move (HELPWLINE + 3 + k, HELPWCOL);
X	prtile (k);
X	getyx (stdscr, y, x);
X	while (x++ < HELPMID)
X	    addch (' ');
X    }
X    else
X	if (k < 27) {
X	    move (HELPWLINE - 10 + k, HELPMID);
X	    clrtoeol ();
X	    prtile (k);
X	}
X	else {
X	    move (HELPWLINE + 17, HELPWCOL);
X	    clrtoeol ();
X	    printw ("    Blank[0] %d", rack[k] + sock[k]);
X	}
X}
X
Xprtile (k) int k;
X{
X    register    value = lettervalue[k];
X    register    unaccounted = rack[k] + sock[k];
X    if (unaccounted > 9 || value > 9)
X	printw ("%c[%d] %d", '@' + k, value, unaccounted);
X    else
X	printw ("%c[%d]  %d", '@' + k, value, unaccounted);
X}
X
Xthinking (amI)
X{
X    mvprintw (MYLINE - 1, RACKCOL, amI ? "THINKING" : "        ");
X}
X
Xshowsock ()
X{
X    int     i;
X    mvprintw (SOCKLINE - 1, SOCKCOL, " Tiles Remaining: %2d", socksize);
X    for (i = socksize; i >= 0; i--) {
X	sockposition (i);
X	if (inch () == TILEBACK)
X	    break;
X	addch (TILEBACK);
X    }
X
X    for (i = socksize; i < 100; i++) {
X	sockposition (i);
X	if (inch () == ' ')
X	    break;
X	addch (' ');
X    }
X}
X
Xsockposition (i) int i;
X{
X    move (SOCKLINE + i % 5, SOCKCOL + i / 5 + (i / 5 > 9));
X}
X
Xshowstuff ()
X{
X    int     i,
X            j;
X
X    showsock ();
X
X    mvprintw (MYLINE, RACKCOL, "CRAB's score: %3d", myscore);
X    showrack (MYLINE + 1, rack, FALSE);
X
X    mvprintw (YOURLINE, RACKCOL, "Your score: %3d", yourscore);
X    showrack (YOURLINE + 1, yourrack, TRUE);
X}
X
Xshowrack (y, rak, visible) int y, visible; char *rak;
X#define V(x) (visible ? (x) : TILEBACK)
X{
X    int     i,
X            j;
X    move (y, RACKCOL);
X    for (i = 1; i < 27; i++)
X	for (j = 0; j < rak[i]; j++) {
X	    addch (V (i | '@'));
X	    addch (' ');
X	}
X    for (j = 0; j < rak[27]; j++) {
X	addch (V ('#'));
X	addch (' ');
X    }
X    getyx (stdscr, i, j);
X    while (j++ < RACKCOL + 15)
X	addch (' ');
X}
X	
Xint showpoints (y, rak) int y; char *rak;
X{
X    int     i,
X            j;
X    move (y, RACKCOL);
X    for (i = 1; i < 28; i++)
X	for (j = 0; j < rak[i]; j++)
X	    printw ("%d ", lettervalue[i]);
X    getyx (stdscr, i, j);
X    while (j < RACKCOL + 15) {
X	addch (' ');
X	j++;
X    }
X    printw ("= %2d", pointrack (rak));
X}
X
Xint pointrack (rak) char *rak;
X{
X    int     i,
X            tot = 0;
X    for (i = 1; i < 28; i++)
X	tot += rak[i] * lettervalue[i];
X    return (tot);
X}
X
Xendgame ()
X{
X    int     mytot,
X            yourtot;
X    thinking (0);
X    yourtot = pointrack (yourrack);
X    mytot = pointrack (rack);
X    myscore -= mytot;
X    yourscore -= yourtot;
X    if (anyrackempty) {
X	myscore += yourtot;
X	yourscore += mytot;
X    }
X    showstuff ();
X    showrack (MYLINE + 1, rack, TRUE);
X    showpoints (MYLINE + 2, rack);
X    showpoints (YOURLINE + 2, yourrack);
X    if (myscore > yourscore)
X	tell ("The game is over.  CRAB wins.");
X    else
X	if (yourscore > myscore)
X	    tell ("The game is over.  You win.");
X	else
X	    tell ("The game is a draw.");
X}
X
Xquit ()
X{
X    char    c;
X    beep ();
X    errortell ("Play again?");
X    refresh ();
X    while ((c = getch ()) != 'n' && c != 'y')
X	beep ();
X    if (c == 'y') restart ();
X /* Quit - Move cursor to bottom of screen and fix up funny terminal modes
X    we set */
X    move (LINES - 1, 0);
X    refresh ();
X    noraw ();
X    echo ();
X    endwin ();
X    exit ();
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'graphics.h'
then
	echo shar: will not over-write existing file "'graphics.h'"
else
sed 's/^X//' << \SHAR_EOF > 'graphics.h'
X#include <curses.h>
X
X#define LEN		15
X
X#define BOARDLINE	3
X#define BOARDCOL	(COLS/2 - LEN - 2)
X#define MSGLINE		20
X#define ERRORLINE	21
X#define HELPWLINE	2
X#define HELPWCOL	59
X#define HELPWCOL2	65
X#define MYLINE		4
X#define YOURLINE	17
X#define SOCKLINE	10
X#define SOCKCOL		1
X#define RACKCOL		3
X#define HELPLINE	(LINES-6)
X
X#define RV(x)		((x) | 0200)
X
X#define REG		' '
X#define LETx2		'.'
X#define LETx3		':'
X#define WORDx2		'-'
X#define WORDx3		'='
X
X#define TILEBACK	RV ('#')
X#define BOARDCHAR(y,x)	(wordmult[y][x] > 1 ?\
X			     wordmult[y][x] > 2 ? WORDx3 : WORDx2\
X			:lettermult[y][x] > 1 ?\
X			     lettermult[y][x] > 2 ? LETx3 : LETx2\
X			:REG)
X
X
X#define Xpos(x) 	(BOARDCOL  + 2 * (x))
X#define Ypos(y) 	(BOARDLINE + (y))
SHAR_EOF
fi # end of overwriting check
if test -f 'list.c'
then
	echo shar: will not over-write existing file "'list.c'"
else
sed 's/^X//' << \SHAR_EOF > 'list.c'
X#include <stdio.h>
X#include "trie.h"
X
Xstatic char buf[80];
Xstatic char *string;
X
X/* Listdictionary prints out all words in the dictionary
X   begining with a given prefix.
X*/
X
Xlistdictionary(prefix) char *prefix;
X{
X    unsigned long   wseek ();
X
X    string = buf;
X    while (*string++ = *prefix++);
X    string--;
X
X /* Wseek to the start node and call print */
X    print (string, wseek (buf, root));
X}
X
X/* Wseek takes a string s and a start edge i and follows the edges of
X   the dawg pointed to by i labelled by chars from s.  It returns an edge
X   into the dawg.
X*/
X
Xstatic unsigned long wseek (s, i) register char *s; unsigned long i;
X{
X    if (*s) {
X    /* not the null string */
X	register unsigned long *p = dawg + ptr(i);
X	do {
X	    if (chr(*p) == chr(*s))/* Look for an edge */
X		return wseek (s + 1, *p);/* Found the edge */
X	} while (!last(*p++));
X	return 0;		/* No edge - dead state */
X    }
X    else			/* null string */
X	return i;		/* return this edge */
X}
X
X/* Print takes a pointer into stringbuf s and a start edge i and prints
X   all strings represented by the sub-dawg pointed to by i.
X*/
X
Xstatic print (s,i) char *s; register unsigned long i;
X{
X    if (term(i)) {		/* edge points at a complete word */
X	*s = '\0';
X	printf ("%s\n", buf);	/* so print the word */
X    }
X    if (ptr(i))	{		/* Compute index: is it non-zero ? */
X        register unsigned long *p = dawg + ptr(i);
X	do {			/* for each edge out of this node */
X	    *s = chr(*p) + 'a' - 1;
X	    print (s + 1, *p);/* recur */
X	}
X	while (!last(*p++));
X    }
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'main.c'
then
	echo shar: will not over-write existing file "'main.c'"
else
sed 's/^X//' << \SHAR_EOF > 'main.c'
X#include <setjmp.h>
X#include "graphics.h"
X#include "trie.h"
X#include "globals.h"
X
Xstatic jmp_buf top;
X
Xmain (argc,argv) int argc; char *argv[];
X{
X    srand (time (0));
X    parseargs (argc, argv);
X
X /* Set up for doing screen output with no echoing of typein */
X    initscr ();
X    raw ();
X    noecho ();
X
X /* Initialize the screen and the variables */
X    setjmp (top);		/* Mark the stack */
X    erase ();
X    picture ();
X    initboard ();
X    initcommand ();
X
X}
X
Xrestart() {
X    longjmp(top,0);
X}
X
Xstatic parseargs(ac, av) int ac; char *av[];
X{
X    int     i;
X
X    for (i = 1; i < ac; i++) {
X	if (*av[i] == '-')
X	    switch (av[i][1]) {
X		case 'l': 
X		/* list words instead of playing scrabble */
X		    i++;
X		    listdictionary (i == ac ? "" : av[i]);
X		    exit (0);
X		case 's': 
X		/* set random seed */
X		    i++;
X		    srand (atoi (av[i]));
X		    break;
X		default: 
X		    usage (*av);
X	    }
X	else
X	    usage (*av);
X    }
X}
X
Xstatic usage (prog) char *prog;
X{
X    fprintf (stderr, "Usage: %s [-l [prefix]]\n", prog);
X    exit (1);
X}
X
X
X/* Initialize the board to be empty */
Xstatic initboard ()
X{
X    int     i,
X            j;
X    for (i = 1; i <= LEN; ++i)
X	for (j = 1; j <= LEN; ++j) {
X	    position (i, j);
X	    removeletter ();
X	    afill[i][j] = dfill[i][j] = 0;
X	}
X    fillsock ();
X    drawtiles (rack);
X    drawtiles (yourrack);
X    consecutivepasses = myscore = yourscore = 0;
X    computermoving = anyrackempty = 0;
X    for (i = 0; i < 17; i++)
X	acheck[i][0] = acheck[i][16] = acheck[0][i] = acheck[16][i] = 0;
X    dcheck[i][0] = dcheck[i][16] = dcheck[0][i] = dcheck[16][i] = 0;
X    computechecks (dfill, acheck, atrans);
X    computechecks (afill, dcheck, dtrans);
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'manager.c'
then
	echo shar: will not over-write existing file "'manager.c'"
else
sed 's/^X//' << \SHAR_EOF > 'manager.c'
X#include <stdio.h>
X#include "graphics.h"
X#include "trie.h"
X#include "globals.h"
X
Xchar tellbuf[80];
X
Xfillsock ()
X{
X    register int    i;
X    for (i = 0, socksize = 0; i < 28; i++) {
X	socksize += (sock[i] = letterquantity[i]);
X	yourrack[i] = rack[i] = 0;
X    }
X}
X
Xdrawtiles (r) char r[28];
X{
X    register int    i,
X                    j,
X                    k,
X                    c;
X    for (i = 1, c = 7; i < 28; i++)
X	c -= r[i];
X    if (c == 7 && socksize == 0)
X	anyrackempty = 1;
X    if (socksize < c)
X	c = socksize;
X    for (i = 0; i < c; i++) {
X	j = rand () % socksize;
X	k = 0;
X	while (j >= 0)
X	    j -= sock[++k];
X	drawtile (k, r);
X    }
X}
X
Xdrawtile (k, r) int k; char r[28];
X{
X    r[k]++;
X    sock[k]--;
X    socksize--;
X    showtilecount (k);
X}
X
Xmakemove (m, rr, bits) struct goodmove *m; bool rr; int bits;
X{
X    register unsigned   r,
X                        c;
X    register char  *w;
X    char    (*xfill)[17];
X    r = m -> r;
X    c = m -> c;
X    if (m -> fill == afill)
X	xfill = dfill;
X    else
X	xfill = afill;
X    for (w = m -> word, c--; *w; c--)
X	if (!m -> fill[r][c]) {
X	    m -> fill[r][c] = xfill[c][r] = ((*w) & 077) | bits;
X	    posit (m -> fill, r, c);
X	    if (rr) {
X		standout ();
X		placeletter (*w);
X		standend ();
X	    }
X	    else
X		placeletter (*w);
X	    showtilecount ((*w & BLANKBIT) ? BLANK : chr (*w));
X	    w++;
X	}
X}
X
Xzapmove ()
X{
X    register unsigned   c;
X    for (c = 1; c < 16; c++) {
X	posit (bestmove.fill, bestmove.r, c);
X	addch (127 & inch ());
X    }
X}
X
Xsuggestmove ()
X{
X    char   *w;
X    int     i,
X            j;
X    char    saverack[28];
X
X    bestmove.value = -1000;
X    for (i = 0; i < 28; ++i)
X	saverack[i] = rack[i];
X    for (i = 0; i < 28; ++i)
X	rack[i] = yourrack[i];
X    if (afill[8][8]) {
X	putp (acheck, afill, atrans);
X	putp (dcheck, dfill, dtrans);
X    }
X    else
X	firstmove ();
X    if (bestmove.value > -1000) {
X	for (w = bestmove.word; *w; w++)
X	    if (BLANKBIT & (*w))
X		rack[BLANK]--;
X	    else
X		rack[chr (*w)]--;
X	computechecks (dfill, acheck, atrans);
X	computechecks (afill, dcheck, dtrans);
X	makemove (&bestmove, TRUE, NEWBIT);
X
X	sprintf (tellbuf, "(for %d points)", bestmove.score);
X	tell (tellbuf);
X    }
X    else
X	tell ("I can't think of any moves for you!");
X    for (i = 0; i < 28; ++i)
X	yourrack[i] = rack[i];
X    for (i = 0; i < 28; ++i)
X	rack[i] = saverack[i];
X}
X
Xcomputermove ()
X{
X    char   *w;
X    computechecks (dfill, acheck, atrans);
X    computechecks (afill, dcheck, dtrans);
X    bestmove.value = -1000;
X    if (afill[8][8]) {
X	putp (acheck, afill, atrans);
X	putp (dcheck, dfill, dtrans);
X    }
X    else
X	firstmove ();
X    if (bestmove.value > -1000) {
X	for (w = bestmove.word; *w; w++)
X	    if (BLANKBIT & (*w))
X		rack[BLANK]--;
X	    else
X		rack[chr (*w)]--;
X	makemove (&bestmove, TRUE, 0);
X	consecutivepasses = 0;
X	drawtiles (rack);
X	myscore += bestmove.score;
X	sprintf (tellbuf, "I get %d points.", bestmove.score);
X	tell (tellbuf);
X    }
X    else {
X	tell ("I can't think of a good move -- your turn.");
X	consecutivepasses++;
X    }
X    computechecks (dfill, acheck, atrans);
X    computechecks (afill, dcheck, dtrans);
X}
X
Xint humanmove (bogus) char bogus;
X{
X    int     minr = 16,
X            maxr = 0,
X            minc = 16,
X            maxc = 0;
X    int     xscore = 0,
X            fscore = 0,
X            factor = 1,
X            t,
X            l;
X    int     r,
X            c,
X            count;
X    char    new,
X            (*fill)[17], (*xfill)[17];
X    int     (*trans)[17];
X    for (r = 1; r < 16; r++)
X	for (c = 1; c < 16; c++)
X	    if (afill[r][c] & NEWBIT) {
X		if (r < minr)
X		    minr = r;
X		if (r > maxr)
X		    maxr = r;
X		if (c < minc)
X		    minc = c;
X		if (c > maxc)
X		    maxc = c;
X	    }
X    if (afill[8][8] == 0) {
X	errortell ("The first move must cover the center square");
X	return (0);
X    }
X    if (minr != maxr && minc != maxc) {
X	errortell (
X		maxr > 0 ? "Your word must be all in the same row or column."
X		: "Use = if you want to pass without playing a word.");
X	return (0);
X    }
X    if (minr == maxr && (maxc > minc || afill[maxr][maxc - 1] || afill[maxr][maxc + 1])) {
X	fill = afill;
X	xfill = dfill;
X	trans = atrans;
X    }
X    else {
X	fill = dfill;
X	xfill = afill;
X	trans = dtrans;
X	minc = minr;
X	minr = maxc;
X	maxc = maxr;
X	maxr = minr;
X    }
X    r = minr;
X    for (c = minc; c <= maxc; c++)
X	if (!fill[r][c]) {
X	    errortell ("Your word must be contiguous.");
X	    return (0);
X	}
X    t = (fill[8][8] & NEWBIT) | fill[r][minc - 1] | fill[r][maxc + 1];
X    for (c = minc; c <= maxc; c++)
X	t |= fill[r - 1][c] | fill[r + 1][c];
X    if (!t) {
X	errortell ("Your word must be adjacent to one already on the board.");
X	return (0);
X    }
X    while (fill[r][c])
X	c++;
X    if ((!bogus) && !checkmove (fill, r, c - 1))
X	return (0);
X    bestmove.r = r;
X    bestmove.c = c;
X    bestmove.fill = fill;
X    for (count = 0, c--; new = fill[r][c]; c--)
X	if (NEWBIT & new) {
X	    l = lettermult[r][c] * lettervalue[new & 077];
X	    t = trans[r][c];
X	    if (t >= 0)
X		xscore += (t + l) * wordmult[r][c];
X	    fscore += l;
X	    factor *= wordmult[r][c];
X	    fill[r][c] = 0;
X	    xfill[c][r] = 0;
X	    bestmove.word[count++] = new;
X	}
X	else
X	    fscore += lettervalue[new];
X    bestmove.word[count] = 0;
X    bestmove.score = fscore * factor + xscore + 50 * (count == 7);
X    makemove (&bestmove, FALSE, 0);
X    consecutivepasses = 0;
X    zapmove ();
X    yourscore += bestmove.score;
X    sprintf (tellbuf, "You get %d points.", bestmove.score);
X    tell (tellbuf);
X    drawtiles (yourrack);
X    return (1);
X}
X
Xunsigned checkword (t, s) unsigned t; char *s;
X{
X    register unsigned  *p;
X    if (!*s)
X	return (t);
X    if (!ptr (t))
X	return (0);
X    p = dawg + ptr (t);
X    do {
X	if (chr (*p) == chr (*s))
X	    return (checkword (*p, s + 1));
X    }
X    while (!last (*p++));
X    return (0);
X}
X
Xint checkmove (fill, r, c) char (*fill)[17]; unsigned r, c;
X{
X    unsigned    (*check)[17];
X    if (fill == afill)
X	check = acheck;
X    else
X	check = dcheck;
X    for (; fill[r][c]; c--)
X	if ((fill[r][c] & NEWBIT) && !((1 << chr (fill[r][c])) & check[r][c])) {
X	    errortell ("One of your cross words isn't!");
X	    return (0);
X	}
X    if (!term (checkword (root, fill[r] + c + 1))) {
X	errortell ("Your word is bogus.");
X	return (0);
X    }
X    return (1);
X}
X
Xint exchange()
X{
X    register unsigned   r,
X                        c,
X                        count = 0;
X    for (r = 1; r < 16; r++)
X	for (c = 1; c < 16; c++)
X	    if (afill[r][c] & NEWBIT)
X		count++;
X    if (count == 0) {
X	tell ("Put the tiles you want to trade in anywhere on the board, then press -.");
X	return (0);
X    }
X    if (count > socksize) {
X	errortell ("You're trying to trade in more tiles than there are left!");
X	return (0);
X    }
X    drawtiles (yourrack);
X    for (r = 1; r < 16; r++)
X	for (c = 1; c < 16; c++)
X	    if (afill[r][c] & NEWBIT) {
X		char    let = afill[r][c] & BLANKBIT ? BLANK
X						     : chr (afill[r][c]);
X		sock[let]++;
X		socksize++;
X		showtilecount (let);
X		position (r, c);
X		removeletter ();
X		afill[r][c] = dfill[c][r] = 0;
X	    }
X    return (1);
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'trie.h'
then
	echo shar: will not over-write existing file "'trie.h'"
else
sed 's/^X//' << \SHAR_EOF > 'trie.h'
X#define last(var)	((var) & 0x80)
X#define term(var)	((var) & 0x40)
X#define blank(var) 	((var) & 0x20)
X#define chr(var)	((var) & 0x1F)
X#define ptr(var)	((var) >> 8)
X
X#define unterm(var)  ((var) & ~0x40)
X
Xextern unsigned long dawg[], root;
X
X#define BLANKBIT	0x20
X#define NEWBIT		0x40
X
X#define BLANK		27
SHAR_EOF
fi # end of overwriting check
if test -f 'Makefile'
then
	echo shar: will not over-write existing file "'Makefile'"
else
sed 's/^X//' << \SHAR_EOF > 'Makefile'
XCFLAGS = -O
X
XDICTDIR = ./dictionary
XDICTOBJS = ${DICTDIR}/dict.o
XOBJECTS = main.o manager.o command.o graphics.o genmove.o eval.o \
X	  checks.o list.o globals.o ${DICTOBJS}
X
Xcrab: ${OBJECTS}
X	${CC} ${CFLAGS} -s -o crab ${OBJECTS} -lcurses -ltermlib
X
Xmain.o: trie.h globals.h graphics.h
X
Xmanager.o: trie.h globals.h graphics.h
X
Xcommand.o: globals.h graphics.h
X
Xgraphics.o: trie.h globals.h graphics.h
X
Xgenmove.o: trie.h globals.h
X
Xeval.o: trie.h globals.h graphics.h
X
Xchecks.o: trie.h globals.h
X
Xlist.o: trie.h
X
Xglobals.o: globals.h
X
X${DICTOBJS}:
X	cd ${DICTDIR}; make
X
Xclean:
X	rm -f *.o
X	cd ${DICTDIR}; make clean
SHAR_EOF
fi # end of overwriting check
if test -f 'README'
then
	echo shar: will not over-write existing file "'README'"
else
sed 's/^X//' << \SHAR_EOF > 'README'
XHere it is, the amazing Scrabble playing crab program.
XThere aren't any special instructions.  All the stuff relating
Xto the wordlist is in the subdirectory dictionary.  See the README
Xthere for more details.
SHAR_EOF
fi # end of overwriting check
if test ! -d 'dictionary'
then
	mkdir 'dictionary'
fi
cd 'dictionary'
if test -f 'Makefile'
then
	echo shar: will not over-write existing file "'Makefile'"
else
sed 's/^X//' << \SHAR_EOF > 'Makefile'
XCRAB = ../crab
XCFLAGS = -O -DSUN4
X
Xdict.o:	compdict dict
X	compdict dict > dawgstats
X
Xcompdict: compdict.o vgrab.o
X	${CC} ${CFLAGS} -o compdict compdict.o vgrab.o
X
Xcompdict.o: dawg.h
X
Xdict:
X	${CRAB} -l > dict
X
Xclean:
X	rm -f dict compdict dawgstats vgrab.o compdict.o
SHAR_EOF
fi # end of overwriting check
if test -f 'README'
then
	echo shar: will not over-write existing file "'README'"
else
sed 's/^X//' << \SHAR_EOF > 'README'
XThis directory maintains the wordlist for crab.  The program compdict
Xcompiles the dictionary file dict into dict.o, which is linked into
X../crab.  You can delete the wordlist dict (and dict.o too) to save
Xspace once you have built crab, because it can be regenerated by
X"../crab -l > dict".  You can also add or delete words from the
Xdictionary if you like (or evern use an entirely different one) as
Xlong as you heed the proviso at the beginning of compdict for the
Xformat of the file dict.  If you like the wordlist the way it is, you
Xnever have to grovel around down here at all.
X
XSince the program compdict builds an executable file, it isn't entirely
Xportable as written.  I know it works with suns and vaxes, though.
SHAR_EOF
fi # end of overwriting check
if test -f 'compdict.c'
then
	echo shar: will not over-write existing file "'compdict.c'"
else
sed 's/^X//' << \SHAR_EOF > 'compdict.c'
X/* compdict - a program to construct the load file dict.o for scrabble
X
X   Use:
X	compdict wordlist
X   creates the file dict.o, the load module for scrabble containing
X   the dictionary database.  Two global symbols "dawg" and "root" are
X   defined in dict.o.  dawg is of type unsigned long [] (in the text
X   segment since it's read only), and root is unsigned long.
X   Statistics about nodes and edges in the dawg are reported on
X   standard output.
X
X   See the file dawg.h for the format of the dawg data structure.
X
X   The wordlist MUST be in the form ([a-z]*\n)* and in STRICTLY
X   increasing lexicographic order, or compdict will weird out.
X*/
X
X#include <stdio.h>
X#include "dawg.h"
X
X#define SCALE	0.25	/* Ratio of file size to hash table size */
X
Xchar stringbuf[80];	/* Space for current string */
Xchar *string;		/* Marks END of current string */
X
Xunsigned long nodesused, nodessaved,	/* Used for accounting */
X	      edgesused, edgessaved;
X
Xchar *input, *endofinput, *snarf();	/* input stuff */
X
XFILE *outfile;				/* output stuff */
X
Xstruct node {
X    struct node *next;		/* Next node with same hash key */
X    unsigned long index;	/* Index of this node */
X    int numedges;		/* Number of edges */
X} **table, *hash();
X/* The edges of a node structure are stored in the numedges following
X    words of memory */
X
Xunsigned long hashsize;		/* Number of hash buckets allocated */
X
Xmain(ac,av) int ac; char *av[];
X{
X    char  *calloc ();
X    unsigned long   size,	/* ... of input file */
X                    makenode ();
X
X    size = flength (av[1]);	/* Get size of dictionary */
X    input = snarf (av[1], size);
X    endofinput = input + size;	/* Remember end of input */
X
X /* Allocate the hash table */
X    hashsize = size * SCALE;
X    table = (struct node  **)
X               calloc (hashsize, sizeof (struct node *));
X
X    outfile = fopen ("dict.o","w");
X    skipheader();		/* Reserve space for .o header */
X    putw (0, outfile);		/* Special node zero */
X
X /* Initialize accounting */
X    nodesused = edgesused = 1;
X    nodessaved = edgessaved = 0;
X
X /* Call makenode with null (relative to stringbuf) prefix;
X    Initialize string to null; Put index of start node on output */
X    putstab(makenode (string = stringbuf));	/* Put out symbol table */
X    fixheader();		/* Fix up .o header */
X    
X    fclose (outfile);
X    printf ("%d+%d nodes;  %d+%d edges.\n",
X	    nodesused, nodessaved, edgesused, edgessaved);
X    exit (0);
X}
X
X/* Makenode takes a prefix (as postion relative to stringbuf) and
X   returns an index of the start node of a dawg that recognizes all
X   words beginning with that prefix.  String is a pointer (relative
X   to stringbuf) indicating how much of prefix is matched in the
X   input.
X*/
X  
Xunsigned long makenode(prefix) char *prefix;
X{
X    unsigned long   edges[26];
X    register unsigned long *edge = edges;
X    register struct node  *n;
X    register int    numedges;
X
X    while (prefix == string) {			/* More edges out of node */
X	*edge++ = (*string++ = *input++) & CHAR;
X	if (*input == '\n') {			/* End of a word */
X	    edge[-1] |= WORD;			/* Mark edge */
X	    *string++ = *input++;		/* Skip \n */
X	    if (input == endofinput)		/* At end of input? */
X		break;
X	    for (string = stringbuf; *string++ == *input++;);
X	    --string;				/* Reset string */
X	    --input;
X	}
X	edge[-1] |= makenode (prefix + 1);	/* make dawg pointed to
X						   by this edge */
X    }
X
X    numedges = edge - edges;
X    if (numedges == 0)
X	return 0;		/* Special node zero - no edges */
X
X    edge[-1] |= LAST;		/* Mark the last edge */
X
X    n = hash (edges, numedges);	/* Look up node in hash table */
X    if (n -> index) {		/* same as an existing node */
X	edgessaved += numedges;
X	nodessaved++;
X    }
X    else {			/* a new node */
X	n -> index = edgesused;	/* enter node's index into table */
X	edgesused += numedges;
X	nodesused++;
X
X     /* Output the edges of this node */
X	fwrite (edges, sizeof (edge), numedges, outfile);
X    }
X
X    return (n -> index << INDEX);
X}
X
X/* Hash takes an array of edges (with a count) and maps it to a pointer
X   to a node, filling in the edge info if needed.  It uses simple
X   bucket chaining to keep a list of all nodes which hash to the same key.
X*/
X
Xstruct node *hash(e,n) unsigned *e; int n;
X{
X    register unsigned long  key = 0;
X    register unsigned long  i;
X    register unsigned long *slot_edges;
X    register struct node   *slot;
X    char   *small_alloc ();
X
X /* Cheesy signature method */
X    for (i = 0; i < n; i++)
X	key ^= (key << 3) ^ (key >> 1) ^ e[i];
X    key %= hashsize;
X
X /* Look for identical node in hash table */
X    for (slot = table[key]; slot; slot = slot -> next)
X	if (n == slot -> numedges) {
X	 /* Same number of edges ... */
X	    slot_edges = (unsigned long *) (slot + 1);
X	    for (i = 0; i < n; i++)
X		if (slot_edges[i] != e[i])
X	     /* Some edge is different. */
X		    break;
X	    if (i == n)		/* All edges were the same ... */
X		return slot;	/* Just return a pointer */
X	}
X
X /* Found an empty position; allocate and copy in edge info */
X    slot = (struct node *) small_alloc (sizeof (struct node)
X	                                 + n * sizeof (unsigned long));
X    slot -> numedges = n;
X    slot_edges = (unsigned long *) (slot + 1);
X    for (i = 0; i < n; i++)
X	slot_edges[i] = e[i];
X
X /* Link this node into the bucket */
X    slot -> next = table[key];
X    table[key] = slot;
X    return slot;
X}
X
X/* Small_alloc doles out zeroed, aligned memory in small pieces, calling
X   calloc to get a new CHUNK.  I do this because malloc is a pig when
X   allocating small blocks.
X*/
X
X/* ALIGN rounds up to a multiple of 4 (machine dependant!) */
X#define ALIGN(char_offset) (char_offset = (char_offset + 3) & ~3)
X
X/* number of bytes calloc'ed in a CHUNK */
X#define CHUNK 10236
X
Xchar *small_alloc(nbytes) int nbytes;
X{
X    static char *buf;
X    static int  used = CHUNK + 1;
X /* CHUNK + 1 to force allocation on first call */
X    int     i;
X
X    if (used + nbytes > CHUNK) {
X     /* No room, start a new CHUNK */
X	used = 0;
X	buf = calloc (1, CHUNK);
X    }
X    i = used;
X    used += nbytes;
X    ALIGN (used);		/* Align the offset */
X    return buf + i;
X}
X
X/* Routines to build .o format stuff */
X
X#include <a.out.h>
X#include <stab.h>
X
X/* Reserve room for .o header in outfile */
Xskipheader ()
X{
X    struct exec junk;
X
X    fwrite (&junk, sizeof junk, 1, outfile);
X}
X
X
X/* Fill in .o header in outfile */
Xfixheader()
X{
X    struct exec header;
X
X#ifdef SUN4
X    header.a_dynamic = 0;
X    header.a_toolversion = TV_SUN4;
X    header.a_machtype = M_SPARC;
X#endif
X /* OMAGIC - magic # for loader .o files */
X    header.a_magic = OMAGIC;
X /* Put dawg in text segment to make it shared and r/o */
X    header.a_text = edgesused * sizeof (unsigned long);
X    header.a_data = sizeof (unsigned long);
X    header.a_bss = 0;
X /* Defining two symbols */
X    header.a_syms = 2 * sizeof (struct nlist);
X    header.a_entry = 0;
X    header.a_trsize = 0;
X    header.a_drsize = 0;
X
X /* Write out header info at beginning of outfile */
X    rewind (outfile);
X    fwrite (&header, sizeof header, 1, outfile);
X}
X
X
X/* Two global symbols to be defined in dict.o: */
Xchar s_dawg[] = "_dawg", s_root[] = "_root";
X
X/*
X   Putstab puts out the single word in the data segment giving the
X   value of the root edge, then writes symbol table and string table
X   info into outfile. e is an edge pointing to the root of the dawg.
X*/
X
Xputstab(e) unsigned long e;
X{
X    struct nlist    sym;	/* Symbol table entry */
X
X /* Output data segment ... */
X    putw (e, outfile);		/* Value of edge into dawg root */
X
X /* Symbol table entry for "unsigned long dawg[]" */
X    sym.n_un.n_strx = sizeof (long);
X				/* First offset into string table just
X				   past longword holding string table size
X				   */
X    sym.n_type = N_TEXT | N_EXT;/* Externally visible in text segment */
X    sym.n_desc = N_GSYM;	/* Global symbol */
X    sym.n_value = 0;		/* offset 0 in text segment */
X    fwrite (&sym, sizeof sym, 1, outfile);/* output symbol (_dawg) */
X
X /* Symbol table entry for "unsigned long root" */
X    sym.n_un.n_strx += sizeof s_dawg;/* Next offset into string table */
X    sym.n_type = N_DATA | N_EXT;/* Externally visible in data segment */
X    sym.n_desc = N_GSYM;	/* Global symbol */
X    sym.n_value += edgesused * sizeof (unsigned long);
X    fwrite (&sym, sizeof sym, 1, outfile);/* output symbol (_root) */
X
X    putw (sizeof (long) + sizeof s_dawg + sizeof s_root, outfile);
X				/* output size of string table */
X
X    fwrite (s_dawg, sizeof s_dawg, 1, outfile);/* _dawg string */
X    fwrite (s_root, sizeof s_root, 1, outfile);/* _root string */
X}
SHAR_EOF
fi # end of overwriting check
if test -f 'dawg.h'
then
	echo shar: will not over-write existing file "'dawg.h'"
else
sed 's/^X//' << \SHAR_EOF > 'dawg.h'
X/*
X	Description of the dawg data structure
X
X    The dawg is stored as an array of edges, each edge stored in an
X    unsigned longword. Each node is represented by the index into
X    this array of the first edge leaving that node; subsequent edges
X    leaving the same node occupy successive locations in the array.
X    The last edge leaving a node is flagged by a bit. Edges leading
X    to terminal nodes (those which are completed words) are marked
X    with another bit.  The edges are labelled with character numbers
X    from 1:26 (1=a) and occupy one 32 bit word each.  The node with
X    index 0 is the special node with no edges leaving it.
X
X	Bits in format of edges in unsigned 32-bit word:
X
X    | . . . : . . . | . . . : . . . | . . . : . . . | . . . : . . . |
X     <---------------------------------------------> ! !   <------->
X            Index of edge pointed to in array        L W     label
X
X    L: this is the LAST edge out of this node
X    W: this edge points to a node that completes a WORD
X*/
X
X#define LAST	0x80
X#define WORD	0x40
X#define CHAR	0x1F
X#define INDEX	8
SHAR_EOF
fi # end of overwriting check
if test -f 'vgrab.c'
then
	echo shar: will not over-write existing file "'vgrab.c'"
else
sed 's/^X//' << \SHAR_EOF > 'vgrab.c'
X#include <stdio.h>
X#include <sys/types.h>
X#include <sys/stat.h>
X
Xstatic	char *savep;
Xstatic	int  savefd;
X
Xchar *snarf (fname, hominy) char *fname; unsigned hominy;
X{
X    char   *malloc ();
X
X    savefd = open (fname, 0);
X    if (savefd < 0)
X	return 0;
X    savep = malloc (hominy);
X    if (read (savefd, savep, hominy) != hominy) {
X	unsnarf ();
X	return 0;
X    }
X    return savep;
X}
X
Xunsnarf ()
X{
X    free (savep);
X    close (savefd);
X}
X
Xlong flength(fname) char *fname;
X{
X    struct stat buf;
X    if (stat (fname, &buf) < 0)
X	return - 1;
X    return (long) buf.st_size;
X}
SHAR_EOF
fi # end of overwriting check
cd ..
if test -f 'crab.6'
then
	echo shar: will not over-write existing file "'crab.6'"
else
sed 's/^X//' << \SHAR_EOF > 'crab.6'
X.TH CRAB 6 10/5/86
X.UC 4
X.SH NAME
Xcrab \- play Scrabble
X.SH SYNOPSIS
X.B crab
X[ 
X.B -l
X.I prefix
X]
X.SH DESCRIPTION
X.I Crab
Xplays the Scrabble Brand Crossword game against you.  The game is
Xscreen-oriented and should be fairly self-explanatory.  Try typing a
X.B ?
Xto toggle the help window, if you are confused.  You can move the cursor
Xwith a numeric keypad, or using the commands
X.B ^B
X\,
X.B ^F
X\,
X.B ^P
Xand
X.B ^N
Xa la Emacs.
X.br
XIf you want to know
Xthe rules of Scrabble (which is a trademark of Selchow and Righter,
Xby the way) you'll have to look on the inside of the box that the
Xgame comes in.
X.SH OPTIONS
XIf you specify the
X.B -l
Xflag, the program will print all acceptable words beginning with
X.I prefix
Xto the standard output (instead of playing the game).  If
X.I prefix
Xis null, you get the entire wordlist.
X.SH DIAGNOSTICS
XWhen
X.I crab
Xdoesn't like what you're trying to do, it issues a corrective message.
XIf you are unable to figure out what's wrong, it probably indicates
Xthat you should be playing the game
X.I fish
Xinstead of Scrabble.
X.SH BUGS
XThe program is a strategic moron since it always picks the move with
Xthe hightest score.
X.PP
XThe inclusion of a large number of uncommon words in
X.I crab
X\'s wordlist is
X.B not
Xa bug; it's a feature.
X.SH AUTHORS
XGuy Jacobson and Andrew Appel
SHAR_EOF
fi # end of overwriting check
#	End of shell archive
exit 0
