#include<stdio.h>
#include<ncurses.h>
#include<stdlib.h>
#define ROWS 9
#define COLS 9

//typedef int Board[ROWS / 3][COLS / 3];
//typedef int SmallBoard[3][3];
typedef enum {VALID, SPACE_OCCUPIED, OUT_OF_BOUNDS} MoveStatus;
int big[3][3];
void init(int board[9][3][3]);
void initb();
int checksmall(int board[9][3][3], int k);
int checkbig();
int checkfull(int board[9][3][3], int k);
int check[9];
void main_ultimate();
void ultimate_menu();
void instructions_ultimate();
MoveStatus validmove(int board[9][3][3], int k, int r, int c) ;



void print(WINDOW* grid[][3][3], WINDOW** biggrid, WINDOW** finalgrid) {
	//int z = 2;
	int i, height = 11, x = 0;
	int width;
	width = 23;
	initscr();
	cbreak();
	int l = 0;
	for(i = 0; i <= 2; i++) {
		move(15, 51 + x);
		biggrid[i] = newwin(height, width, 15, 51 + x);
		box(biggrid[i], 0, 0);
		wrefresh(biggrid[i]);
		wmove(biggrid[i], 0, 0);
		for(int j = 0; j < 3; j++) {
			for(int m = 0; m < 3; m++) {
				grid[l][j][m] = newwin(3, 7, (16 + (j * 3)), (52 + (m * 7 + (l * 23)))); 
				box(grid[l][j][m], 0, 0);
				wrefresh(grid[l][j][m]);
			}
		}
		l = l + 1; 
		x = x + 23;
	}
	x = 0;
	for(i = 3; i <= 5; i++) {
		biggrid[i] = newwin(height, width, 15 + height, 51 + x);
		box(biggrid[i], 0, 0);
		wrefresh(biggrid[i]);	
		for(int j = 0; j < 3; j++) {
			for(int m = 0; m < 3; m++) {
				grid[l][j][m] = newwin(3, 7, (27 + (j * 3)), (52 + (m * 7 + ((l - 3) * 23)))); 
				box(grid[l][j][m], 0, 0);
				wrefresh(grid[l][j][m]);
			}
		}
		l = l + 1; 
		x+=23;
	}
	x = 0;
	for(i = 6; i <= 8; i++) {
		biggrid[i] = newwin(height, width, 15 + (height * 2), 51 + x);
		box(biggrid[i], 0, 0);
		wrefresh(biggrid[i]);	
		for(int j = 0; j < 3; j++) {
			for(int m = 0; m < 3; m++) {
				grid[l][j][m] = newwin(3, 7, (38 + (j * 3)), (52 + (m * 7 + ((l - 6) * 23)))); 
				box(grid[l][j][m], 0, 0);
				wrefresh(grid[l][j][m]);
			}
		}
		l = l + 1; 
		x+=23;
	}
	int o = 0;
	for(int h = 0; h < 3; h++) {
		for(int u = 0; u < 3; u++) {
			finalgrid[o] = newwin(3, 7, (27 +  h * 3), (140 + u * 7 ));
			box(finalgrid[o], 0, 0);
			wrefresh(finalgrid[o]);
			o++;
		}
	}		



	//	box(0,0,0);
	refresh();
}




void main_ultimate() {
	
	clear();
	refresh();
	WINDOW* win[9][3][3];
	WINDOW* bigwin[9];
	WINDOW* finalwin[9];
	initscr();
	start_color();
	init_pair(1, COLOR_WHITE, COLOR_BLUE);
	init_pair(2, COLOR_WHITE, COLOR_RED);
	cbreak();
	keypad(stdscr, TRUE);
	print(win, bigwin, finalwin);
	refresh();
	int board[9][3][3];
	init(board);
	initb();
	int turn;
	int winner = 0;
	int invalid = 0;
	char ch[3], row[3], col[3];
	int r, c, k = -1;
	for(turn = 0; turn < ROWS * COLS && !winner; turn++) {
		
		mvprintw(5, 110, "SUB-BOARDS 0 - 8");
		mvprintw(6, 110, "ROWS 0 - 2");
		mvprintw(7, 110, "COLUMNS 0 - 2"); 
		refresh();
		int player = (turn % 2) + 1;
		static int firstmove = 1;
		if(firstmove) {
			//getch();
			mvprintw(0, 0,"Player 1, enter the smallboard you want to play on : ");
			refresh();
			getstr(ch);
			k = atoi(ch);
			clrtoeol();
			while(k > 8){
				printw("Invalid entry, Renter :");
				getstr(ch);
				k = atoi(ch);
			}
			firstmove = 0;
		} 
		else {
			switch(r) {
				case 0 : switch(c) {
						 case 0: k = 0;
							 break;
						 case 1: k = 1;
							 break;
						 case 2: k = 2;
							 break;
						 default: invalid = 1;
							  break;		
					 }
					 break;
				case 1 : switch(c) {	
						 case 0: k = 3;
							 break;
						 case 1: k = 4;
							 break;
						 case 2: k = 5;
							 break;
						 default: invalid = 1;
							  break;		
					 }
					 break;
				case 2: switch(c) {
						case 0: k = 6;
							break;
						case 1: k = 7;
							break;
						case 2: k = 8;
							break;
						default: invalid = 1;
							 break;		
					}
					break;
				default: invalid = 1;
					 break;
			}
		}
		refresh();

		do {
			clrtoeol();
			mvprintw(0, 0, "Player %d, enter the coordinate x to place %c in Board %d : ", player, (player==1) ? 'X' : 'O', k);
			clrtoeol();
			getstr(row);
			r = atoi(row);
			clrtoeol();
			mvprintw(0, 0, "Player %d, enter the coordinates y to place %c in Board %d : ", player, (player==1) ? 'X' : 'O', k);
			getstr(col);
			clrtoeol();
			c = atoi(col);
			invalid = 0;
			switch (validmove(board, k, r, c)) {
				case SPACE_OCCUPIED:
					printw("This space is already occupied.  Re-enter:");
					invalid = 1;
					break;
				case OUT_OF_BOUNDS:
					printw("Your move is out of bounds.  Re-enter:");
					invalid = 2;
					break;
				default:
					break;
			}
		}while(invalid);

		board[k][r][c] = (player == 1) ? 'X': 'O'; 
		mvwprintw(win[k][r][c], 3/2, 7/2, "%c", board[k][r][c]);
		if(player == 1) {
			wbkgd(win[k][r][c], COLOR_PAIR(1));
		}
		else {
			wbkgd(win[k][r][c], COLOR_PAIR(2));
		}
		wrefresh(win[k][r][c]);
		if(!check[k]) {
			switch(checksmall(board , k)) {
				case 1: if(player == 1)
						wbkgd(finalwin[k], COLOR_PAIR(1));
					else
						wbkgd(finalwin[k], COLOR_PAIR(2));

					if(checkbig()) {
						winner = player;
						clrtoeol();
						wrefresh(finalwin[k]);
						printw("Your %d  board is done.\n", k);
						printw("Game Over. Player %d wins.\n", player);
						getch();
						init(board);
						initb();
						firstmove = 1;
						ultimate_menu();
					}
					else
						printw("your %d board is done\n", k);
						wrefresh(finalwin[k]);
					break;
					/*	case 2: firstmove = 1;
						break;*/
			}
		}
		if(checkfull(board, k)) {
			firstmove = 1;
		}
	}

	if(turn == 81) {
		printw("Game ends in a draw");
		getch();
		endwin();
		ultimate_menu();
	}
	/*getch();
	refresh();
	endwin();
	delwin(stdscr);*/
	

}

int checksmall(int board[9][3][3], int k) {
	int a[ROWS - 1] = {0,  0,  0,  0,  1,  2,  0,  0};
	int b[COLS - 1] = {0,  1,  2,  0,  0,  0,  0,  2};
	int d[ROWS - 1] = {1,  1,  1,  0,  0,  0,  1,  1};
	int e[COLS - 1] = {0,  0,  0,  1,  1,  1,  1,  1};
	int r1, c1, r2, c2;
	init_pair(1, COLOR_WHITE, COLOR_BLUE);
	init_pair(2, COLOR_WHITE, COLOR_RED);

	for (int z = 0; z < ROWS - 1; z++) {

		r1 = a[z];
		r2 = d[z];
		c1 = b[z];
		c2 = e[z];
		// main logic to check if a subboard has a winner
		if (board[k][r1][c1] != 1 &&
				board[k][r1][c1] == board[k][r1 + r2][c1 + c2] &&
				board[k][r1][c1] == board[k][r1 + r2 + r2][c1 + c2 + c2]) { 
			switch(k) {
				case 0: big[0][0] = board[k][r1][c1];
					break;
				case 1: big[0][1] = board[k][r1][c1];
					break;
				case 2: big[0][2] = board[k][r1][c1];
					break;
				case 3: big[1][0] = board[k][r1][c1];
					break;
				case 4: big[1][1] = board[k][r1][c1];
					break;
				case 5: big[1][2] = board[k][r1][c1];
					break;
				case 6: big[2][0] = board[k][r1][c1];
					break;
				case 7: big[2][1] = board[k][r1][c1];
					break;
				case 8: big[2][2] = board[k][r1][c1];
					break;
				default: break;
			}
			check[k] = 1;
			return 1;
		}
	}
	return 0;
}
int checkfull(int board[9][3][3], int k) {

	int flag = 0;
	for (int i = 0; i < 3; i++) {
		for(int j = 0; j < 3; j++) {
			if(board[k][i][j] == 1) {
				flag = 1;
				break;
			}
		}
		if(flag == 1)
			break;
	}

	if(!flag)
		return 1; 

	return 0;
}

int checkbig() {

	int a[ROWS - 1] = {0,  0,  0,  0,  1,  2,  0,  0};
	int b[COLS - 1] = {0,  1,  2,  0,  0,  0,  0,  2};
	int d[ROWS - 1] = {1,  1,  1,  0,  0,  0,  1,  1};
	int e[COLS - 1] = {0,  0,  0,  1,  1,  1,  1,  1};
	int r1, c1, r2, c2;

	for (int z = 0; z < ROWS - 1; z++) {

		r1 = a[z];
		r2 = d[z];
		c1 = b[z];
		c2 = e[z];
		// main logic to check if a subboard has a winner
		if (big[r1][c1] != 1 &&
				big[r1][c1] == big[r1 + r2][c1 + c2] &&
				big[r1][c1] == big[r1 + r2 + r2][r1 + c2 + c2])
			return 1;
	}
	return 0;
}

MoveStatus validmove(int board[9][3][3], int k, int r, int c) {
	if (board[k][r][c] != 1 && r < 3 && c < 3) return SPACE_OCCUPIED; // supplied coordinates are occupied by another character
	else if (r > 3 || c > 3)
		return OUT_OF_BOUNDS; // coordinates aren't within the sub-board specified by the previous move
	else return VALID; // didn't fail anywhere else, so coords are valid
}


void init(int board[9][3][3]) {

	for(int i = 0; i < 9; i++) {
		for(int j = 0; j < 3; j++) {
			for(int m = 0; m < 3; m++) {
				board[i][j][m] = 1;
			}
		}
	}
}

void initb() {

	for(int i = 0; i < 3; i++) {
		for(int j = 0; j < 3; j++) {
			big[i][j] = 1;
		}
	}
}

void instructions_ultimate() {
	clear();
	endwin();
	initscr();
	init_pair(20, COLOR_CYAN, COLOR_BLACK);
	attron(COLOR_PAIR(20));
	box(stdscr, 0, 0);
	attron(A_STANDOUT);
	mvprintw(10, 85, "||    ULTIMATE TIC TAC TOE    ||");
	attroff(A_STANDOUT);
	mvprintw(12, 20, "Like the original Tic-Tac-Toe, Player 1 is represented by X and Player 2 is represented by O. To start the game, Player 1 places an X on any one of the 81 empty squares, and then players \n alternate turns. However, after the initial move, players must play the board that mirrors the square from the previous player. If the next move is to a board that has already been completed, then that player \n may choose an open square on any board for that turn. You win boards as usual, but you win the game when you win three boards together (across rows, columns or diagnols).");
	getch();
	clear();
	refresh();
	//	delwin(stdscr);
	endwin();
	ultimate_menu();
	return;	
}


