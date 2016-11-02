#include<stdio.h>
#include<time.h>
#include<ncurses.h>
#include<unistd.h>
#include<stdlib.h>
#include"kbhit.h"
#include"gridnew2.h"
#include <menu.h>
#define ARRAY_SIZE(a) (sizeof(a) / sizeof(a[0]))
#define CTRLD 4

char *choices[] = {
	"PLAY",
	"INSTRUCTIONS",
	"EXIT",
};

char *main_choices[] = {
	"MotoGT",
	"ULTIMATE Tic-Tac-Toe",
	"EXIT",
};

char *ultimate_choices[] = {
	"PLAY",
	"INSTRUCTIONS",
	"EXIT",
};

void menu();
void ultimate_menu();
void main_menu();
void game();
void img(int );
void imgr(int );
void obstacle1(int , int );
void track();
void obstacle2(int, int );
void obstacle3(int, int );
void nitros(int, int );
void obstacle6(int, int );
void hearts(int, int, int);
int moto();	
void instructions_moto();
void stop();
void score1(int );

int main() {

	initscr();
	curs_set(0);
	start_color();
	cbreak();
	keypad(stdscr, TRUE);
	main_menu();
	srand(time(NULL));
	init_pair(1, COLOR_BLACK, COLOR_BLACK);
	bkgdset(COLOR_PAIR(1));
	box(stdscr, 10, 10);
	refresh();
	endwin();
	delwin(stdscr);

}
void game() {

	refresh();
	clear();
	int ch;
	static int d = 0, score = 0;
	static int co = 20, co2;
	srand(time(NULL)); 
	static int lives = 3;
	img(co);
	track();
	refresh();
	int y1 = 0, x1 = 20;
	int y2 = 0, x2 = 38;
	int y4 = 5, x4 = 52;
	int y6 = 0, x6 = 47;
	while(lives){
		img(co);
		moto();
		hearts(4, 100, lives);
		obstacle1(y1, x1);
		obstacle2(y2, x2);
		obstacle6(y6, x6);
		nitros(y4, x4);
		mvprintw(8, 110, "%d", score);
		usleep(100000 - d);
		y1++;
		y2++;
		y4++;
		y6++;
		if(kbhit()){         /* Checking for input */
			ch = wgetch(stdscr);
			switch(ch) {
				case KEY_LEFT:
					if(co >= 20) {  //boundary condition
						co2 = co;
						co = co - 1;
						imgr(co2); 
						img(co);
						refresh();
					}
					else{
						img(19);
					}
					break;
				case KEY_RIGHT:
					if(co <= 57) {  //boundary condition
						co2 = co;
						co = co + 1;
						imgr(co2);
						img(co);
						refresh();
					}
					else{ 
						img(58);
					}
					break;
				case 'p':
					break;
				default:
					break;

			}
		}

		if(y1 == LINES){                        //Generating Obstacles at Randomly
			y1 = (rand() % 20);
			if(rand() % 2 == 0)
				x1 = 20;
			else
				x1 = 40;
			score+= 2;
			clear();
			track();
		}
		if(y2 == LINES){
			y2 = (rand() % 23);
			if(rand() % 4 == 0)
				x2 = 38;
			else
				x2 = 58;
			score+= 2;
			clear();
			track();
		}
		if(y4 == LINES){
			if(d == 0) {	
				y4 = 0;
				if(rand() % 3 == 0)
					x4 = 52;
				else
					x4 = 33;
				score-= 5;
				clear();
				track();
			}
		}
		if(y6 == LINES) {
			y6 = (rand() % 18);
			if(rand() % 5 == 0)
				x6 = 47;
			else
				x6 = 35;
			score+= 2;
			clear();
			track();
		}
						//Collisions
		if(y1 == 38 && x1 == 20 && (co == 20 || co == 21 || co == 22 || co == 23 || co == 24 || co == 25 || co == 26 || co == 27 || co == 28 || co == 29 || co == 30 || co == 31 || co == 32)){
			lives--;
			break;
		}
		if(y1 == 39 && x1 == 20 && (co == 19 || co == 33)) {
			lives--;
			break;
		}

		if(y1 == 38 && x1 == 40 && (co == 40 || co == 41 || co == 42 || co == 43 || co == 44 || co == 45 || co == 46 || co == 47 || co == 48 || co == 49 || co == 50 || co == 51 || co == 52)){
			lives--;
			break;
		}

		if(y1 == 39 && x1 == 40 && (co == 39 || co == 53 )) {
			lives--;
			break;
		}


		if(((y2 == 34 || y2 == 35 || y2 == 36 || y2 == 37 || y2 == 38) && x2 == 38 && (co == 38 || co == 39 || co == 37 || co == 40)) || (y2 == 33 && x2 == 38 && (co == 38 || co == 39))){
			lives--;
			break;
		}

		if((y2 == 33 && x2 == 58 && (co == 58 || co == 59)) || ((y2 == 34 || y2 == 35 || y2 == 36 || y2 == 37 || y2 == 38) && x2 == 58 && (co == 57 || co == 58 || co == 59 || co == 60))) {
			lives--;
			break;
		}

		if((y6 == 35 && x6 == 35 && (co == 35 || co == 36 || co == 37)) || (y6 == 36 && x6 == 35 && (co == 34 || co == 38)))  {
			lives--;
			break;
		}
		if((y6 == 35 && x6 == 47 && (co == 47 || co == 48 || co == 49)) || (y6 == 36 && x6 == 47 && (co == 46 || co == 50)))  {
			lives--;
			break;
		}
		if(y4 == 38 && x4 == 52 && (co == 52 || co == 53 || co == 54 || co == 55 || co == 56 || co == 57)) {
			d = 100000;
			score+= 20;
		} 
		if(y4 == 38 && x4 == 33 && (co == 33 || co == 34 || co == 35 || co == 36 || co == 37 || co == 38)) {
			d = 100000;
			score+= 20;
		} 

	}

	if(lives == 0) {    //checking for lives
		endwin();
		refresh();
		lives = 3;
		score1(score);

	}
	else{
		clear();
		d = 0;
		game();

	}

}

void img(int co1) {   //bike

	init_pair(8,COLOR_RED,COLOR_RED);
	attron(COLOR_PAIR(8));
	move(40, co1);
	printw(" ");			
	move(39, co1 - 1);
	printw("   ");
	move(38, co1);
	printw(" ");
	attroff(COLOR_PAIR(8));
}


void imgr(int co1) {

	move(40, co1);
	printw(" ");			
	move(39, co1 - 1);
	printw("   ");
	move(38, co1);
	printw(" ");
}

void track() {
	int yy = 0, xx = 15;
	while(yy < LINES) {
		init_pair(13, COLOR_WHITE, COLOR_WHITE);
		attron(COLOR_PAIR(13));
		mvprintw(yy, xx, "| |");
		attroff(COLOR_PAIR(13));
		attron(COLOR_PAIR(13));
		mvprintw(yy, xx + 45 , "| |");
		attroff(COLOR_PAIR(13));
		yy++;
		refresh();

	}
}


void obstacle1(int y1, int x1) {  //obstacles

	init_pair(15, COLOR_BLACK, COLOR_YELLOW);
	attron(COLOR_PAIR(15));
	mvprintw(y1, x1, "             ");
	attroff(COLOR_PAIR(15));
	usleep(50000/5);
	refresh();
	mvprintw(y1 - 1, x1, "             ");
	refresh();
}

void obstacle2(int y2, int x2) {

	init_pair(6, COLOR_BLACK, COLOR_YELLOW);
	attron(COLOR_PAIR(6));
	mvprintw(y2, x2, "  ");	
	mvprintw(y2 + 1, x2, "  ");
	mvprintw(y2 + 2, x2, "  ");
	mvprintw(y2 + 3, x2, "  ");
	mvprintw(y2 + 4, x2, "  ");
	mvprintw(y2 + 5, x2, "  ");
	attroff(COLOR_PAIR(6));
	usleep(50000/5);
	refresh();
	//	mvprintw(y2 - 2, x2, "  ");
	//	mvprintw(y2 - 1, x2, "  ");
	mvprintw(y2, x2, "  ");
}

void obstacle6(int y6, int x6) {

	init_pair(6, COLOR_BLACK, COLOR_YELLOW);
	attron(COLOR_PAIR(6));
	mvprintw(y6, x6, "  ");	
	mvprintw(y6 + 1, x6, "   ");
	mvprintw(y6 + 2, x6, "   ");
	mvprintw(y6 + 3, x6, "   ");
	attroff(COLOR_PAIR(6));
	usleep(50000/5);
	refresh();
	//	mvprintw(y6 - 2, x6, "   ");
	//	mvprintw(y6 - 1, x6, "   ");
	mvprintw(y6, x6, "   ");
}

void nitros(int y4, int x4) {

	init_pair(4, COLOR_BLACK, COLOR_BLUE);
	attron(COLOR_PAIR(4));
	mvprintw(y4, x4, " ");
	mvprintw(y4 - 1, x4, " ");
	mvprintw(y4 - 2, x4, " ");
	mvprintw(y4 -2, x4 + 1, " ");
	mvprintw(y4 - 1, x4 +2, " ");
	mvprintw(y4, x4+ 3, " ");
	mvprintw(y4, x4 + 4, " ");
	mvprintw(y4 - 1, x4 + 4, " ");
	mvprintw(y4 -2, x4 + 4, " ");
	attroff(COLOR_PAIR(4));
	refresh();
	usleep(50000/2);
	mvprintw(y4, x4, " ");
	mvprintw(y4 - 1, x4, " ");
	mvprintw(y4 - 2, x4, " ");
	mvprintw(y4 -2, x4 + 1, " ");
	mvprintw(y4 - 1, x4 +2, " ");
	mvprintw(y4, x4+ 3, " ");
	mvprintw(y4, x4 + 4, " ");
	mvprintw(y4 - 1, x4 + 4, " ");
	mvprintw(y4 -2, x4 + 4, " ");
}

void extralife(int y5, int x5) {

	init_pair(12, COLOR_BLACK, COLOR_WHITE);
	attron(COLOR_PAIR(12));	
	mvprintw(y5, x5, " ");
	mvprintw(y5 - 1, x5, " ");
	mvprintw(y5 - 2, x5, " ");
	mvprintw(y5, x5 + 1, " ");
	mvprintw(y5, x5 + 2, " ");
	//mvprintw(y5, x5 , " ");	
	attroff(COLOR_PAIR(12));
	refresh();
	usleep(50000/2);
	mvprintw(y5, x5, " ");
	mvprintw(y5 - 1, x5, " ");
	mvprintw(y5 - 2, x5, " ");
	mvprintw(y5, x5 + 1, " ");
	mvprintw(y5, x5 + 2, " ");
}


void hearts(int y, int x, int lives) {
	init_pair(9, COLOR_BLACK, COLOR_RED);
	while(lives > 0){
		attron(COLOR_PAIR(9));
		mvprintw(y-3, x, " ");
		mvprintw(y-2, x, " ");
		mvprintw(y-2, x+1, " ");
		mvprintw(y-3, x+1, " ");
		mvprintw(y-1, x+2, " ");
		mvprintw(y-2, x+2, " ");
		mvprintw(y-1, x+3, " ");
		mvprintw(y, x+2, " ");
		mvprintw(y-1, x+1, " ");
		mvprintw(y-3, x+3, " ");
		mvprintw(y-2, x+3, " ");
		mvprintw(y-2, x+4, " ");
		mvprintw(y-3, x+4, " ");
		x+=8;
		attroff(COLOR_PAIR(1));
		refresh();
		lives--;		
	}
}

void main_menu() {

	endwin();
	clear();
	refresh();
	ITEM **my_items;
	int c;
	MENU *my_menu;
	WINDOW *my_menu_win;
	int n_main_choices, i;
	//ITEM *cur_item;
	/* Initialize curses */
	initscr();
	start_color();
	cbreak();
	//noecho();
	keypad(stdscr, TRUE);
	init_pair(1, COLOR_RED, COLOR_BLACK);
	init_pair(2, COLOR_GREEN, COLOR_BLACK);
	init_pair(3, COLOR_MAGENTA, COLOR_BLACK);
	/* Initialize items */
	n_main_choices = ARRAY_SIZE(main_choices);
	my_items = (ITEM **)calloc(n_main_choices + 1, sizeof(ITEM *));
	for(i = 0; i < n_main_choices; ++i)
	{
		my_items[i] = new_item(main_choices[i], NULL);
		/* Set the user pointer */
		if(i == 0) {
			/* Set the user pointer */
			//		wclear(my_menu_win);
			//endwin();
			//wrefresh(my_menu_win);
			set_item_userptr(my_items[i], menu);
		}
		else if(i == 1)
			set_item_userptr(my_items[i], ultimate_menu);
		else if(i == 2)
			set_item_userptr(my_items[i], stop);
	}
	my_items[n_main_choices] = (ITEM *)NULL;
	/* Create menu */
	my_menu = new_menu((ITEM **)my_items);

	my_menu_win = newwin(10, 30, 15, 70);
	keypad(my_menu_win, TRUE);

	set_menu_win(my_menu, my_menu_win);
	set_menu_sub(my_menu, derwin(my_menu_win, 7, 26, 3, 1));
	/* Set menu mark to the string " * " */
	set_menu_mark(my_menu, "--> ");

	/* Print a border around the main window and print a title */
	box(my_menu_win, 0, 0);
	mvwaddch(my_menu_win, 2, 0, ACS_LTEE);
	mvwhline(my_menu_win, 2, 1, ACS_HLINE, 29);
	mvwaddch(my_menu_win, 2, 29, ACS_RTEE);
	/* Post the menu */
	mvprintw(LINES - 3, 1, "Press <ENTER> to see the option selected");
	mvprintw(LINES - 2, 1, "Up and Down arrow keys to navigate");
	post_menu(my_menu);
	refresh();
	post_menu(my_menu);
	wrefresh(my_menu_win);

	while((c = getch()) != KEY_F(1))
	{
		switch(c)
		{
			case KEY_DOWN:
				menu_driver(my_menu, REQ_DOWN_ITEM);
				break;
			case KEY_UP:
				menu_driver(my_menu, REQ_UP_ITEM);
				break;
			case 10: /* Enter */
				{
					ITEM *cur;
					void (*p)(char *);
					cur = current_item(my_menu);
					p = item_userptr(cur);
					p((char *)item_name(cur));
					pos_menu_cursor(my_menu);
					endwin();
					wclear(my_menu_win);
					wrefresh(my_menu_win);
					break;
				}
				break;
		}
		wrefresh(my_menu_win);
	}
	unpost_menu(my_menu);
	for(i = 0; i < n_main_choices; ++i)
		free_item(my_items[i]);
	free_menu(my_menu);
	endwin();
	wrefresh(my_menu_win);
	delwin(my_menu_win);
	return;
}

void ultimate_menu() {
	endwin();
	clear();
	refresh();
	ITEM **my_items;
	int c;
	MENU *my_menu;
	WINDOW *my_menu_win;
	int n_choices_ultimate, i;
	//ITEM *cur_item;
	/* Initialize curses */
	initscr();
	start_color();
	cbreak();
	keypad(stdscr, TRUE);
	init_pair(1, COLOR_RED, COLOR_BLACK);
	init_pair(2, COLOR_GREEN, COLOR_BLACK);
	init_pair(3, COLOR_MAGENTA, COLOR_BLACK);
	/* Initialize items */
	n_choices_ultimate = ARRAY_SIZE(ultimate_choices);
	my_items = (ITEM **)calloc(n_choices_ultimate + 1, sizeof(ITEM *));
	for(i = 0; i < n_choices_ultimate; ++i)
	{
		my_items[i] = new_item(ultimate_choices[i], NULL);
		/* Set the user pointer */
		if(i == 0) {
			/* Set the user pointer */
			/*			wclear(my_menu_win);
						endwin();
						wrefresh(my_menu_win);*/
			set_item_userptr(my_items[i], main_ultimate);
		}
		else if(i == 1)
			set_item_userptr(my_items[i], instructions_ultimate);
		else if(i == 2)
			set_item_userptr(my_items[i], main_menu);
	}
	my_items[n_choices_ultimate] = (ITEM *)NULL;
	/* Create menu */
	my_menu = new_menu((ITEM **)my_items);

	my_menu_win = newwin(10, 30, 15, 70);
	keypad(my_menu_win, TRUE);

	set_menu_win(my_menu, my_menu_win);
	set_menu_sub(my_menu, derwin(my_menu_win, 7, 26, 3, 1));
	/* Set menu mark to the string " * " */
	set_menu_mark(my_menu, "--> ");

	/* Print a border around the main window and print a title */
	box(my_menu_win, 0, 0);
	mvwaddch(my_menu_win, 2, 0, ACS_LTEE);
	mvwhline(my_menu_win, 2, 1, ACS_HLINE, 29);
	mvwaddch(my_menu_win, 2, 29, ACS_RTEE);
	/* Post the menu */
	mvprintw(LINES - 3, 1, "Press <ENTER> to see the option selected");
	mvprintw(LINES - 2, 1, "Up and Down arrow keys to navigate");
	post_menu(my_menu);
	refresh();
	post_menu(my_menu);
	wrefresh(my_menu_win);

	while((c = getch()) != KEY_F(1))
	{
		switch(c)
		{
			case KEY_DOWN:
				menu_driver(my_menu, REQ_DOWN_ITEM);
				break;
			case KEY_UP:
				menu_driver(my_menu, REQ_UP_ITEM);
				break;
			case 10: /* Enter */
				{
					ITEM *cur;
					void (*p)(char *);
					cur = current_item(my_menu);
					p = item_userptr(cur);
					p((char *)item_name(cur));
					pos_menu_cursor(my_menu);
					endwin();
					wclear(my_menu_win);
					wrefresh(my_menu_win);
					break;		
				}
				break;
		}
		wrefresh(my_menu_win);
	}
	unpost_menu(my_menu);
	for(i = 0; i < n_choices_ultimate; ++i)
		free_item(my_items[i]);
	free_menu(my_menu);
	endwin();
	wrefresh(my_menu_win);
	return;
}



void menu() {
	endwin();
	clear();
	refresh();
	ITEM **my_items;
	int c;
	MENU *my_menu;
	WINDOW *my_menu_win;
	int n_choices, i;
	//ITEM *cur_item;
	/* Initialize curses */
	initscr();
	start_color();
	cbreak();
	//noecho();
	keypad(stdscr, TRUE);
	init_pair(1, COLOR_RED, COLOR_BLACK);
	init_pair(2, COLOR_GREEN, COLOR_BLACK);
	init_pair(3, COLOR_MAGENTA, COLOR_BLACK);
	/* Initialize items */
	n_choices = ARRAY_SIZE(choices);
	my_items = (ITEM **)calloc(n_choices + 1, sizeof(ITEM *));
	for(i = 0; i < n_choices; ++i)
	{
		my_items[i] = new_item(choices[i], NULL);
		/* Set the user pointer */
		if(i == 0) {
			/* Set the user pointer */
			/*			wclear(my_menu_win);
						endwin();
						wrefresh(my_menu_win);*/
			set_item_userptr(my_items[i], game);
		}
		else if(i == 1)
			set_item_userptr(my_items[i], instructions_moto);
		else if(i == 2)
			set_item_userptr(my_items[i], main_menu);
	}
	my_items[n_choices] = (ITEM *)NULL;
	/* Create menu */
	my_menu = new_menu((ITEM **)my_items);

	my_menu_win = newwin(10, 30, 15, 70);
	keypad(my_menu_win, TRUE);

	set_menu_win(my_menu, my_menu_win);
	set_menu_sub(my_menu, derwin(my_menu_win, 7, 26, 3, 1));
	/* Set menu mark to the string " * " */
	set_menu_mark(my_menu, "--> ");

	/* Print a border around the main window and print a title */
	box(my_menu_win, 0, 0);
	mvwaddch(my_menu_win, 2, 0, ACS_LTEE);
	mvwhline(my_menu_win, 2, 1, ACS_HLINE, 29);
	mvwaddch(my_menu_win, 2, 29, ACS_RTEE);
	/* Post the menu */
	mvprintw(LINES - 3, 1, "Press <ENTER> to see the option selected");
	mvprintw(LINES - 2, 1, "Up and Down arrow keys to navigate");
	post_menu(my_menu);
	refresh();
	post_menu(my_menu);
	wrefresh(my_menu_win);

	while((c = getch()) != KEY_F(1))
	{
		switch(c)
		{
			case KEY_DOWN:
				menu_driver(my_menu, REQ_DOWN_ITEM);
				break;
			case KEY_UP:
				menu_driver(my_menu, REQ_UP_ITEM);
				break;
			case 10: /* Enter */
				{
					ITEM *cur;
					void (*p)(char *);
					cur = current_item(my_menu);
					p = item_userptr(cur);
					p((char *)item_name(cur));
					pos_menu_cursor(my_menu);
					endwin();
					wclear(my_menu_win);
					wrefresh(my_menu_win);
					break;
				}
				break;
		}
		wrefresh(my_menu_win);
	}
	unpost_menu(my_menu);
	for(i = 0; i < n_choices; ++i)
		free_item(my_items[i]);
	free_menu(my_menu);
	endwin();
	wrefresh(my_menu_win);
	delwin(my_menu_win);
	return;
}



int moto() { // printing motogt logo 

	start_color();
	init_pair(1,1,7);
	init_pair(3,1,COLOR_BLACK);
	init_pair(4, COLOR_BLACK, COLOR_RED);
	init_pair(5, COLOR_BLACK, COLOR_BLUE);
	int x  = 100;
	int y = 15;
	init_pair(2,7,1);
	attrset(COLOR_PAIR(2));

	mvprintw(y+1,x-4, " ");
	mvprintw(y+1,x-5, " ");
	mvprintw(y+1,x-6, " ");
	mvprintw(y-3,x-4, " ");
	mvprintw(y-3,x-5, " ");
	mvprintw(y-3, x-6, " ");
	mvprintw(y,x-6, " ");
	mvprintw(y-1,x-6 ," ");
	mvprintw(y-2,x-6, " ");
	mvprintw(y-2,x-5, " ");
	mvprintw(y,x-5, " ");
	mvprintw(y-1, x-5, " ");
	mvprintw(y,x-4, " ");
	mvprintw(y-1,x-4, " ");
	mvprintw(y-2,x-4, " ");
	mvprintw(y+1,x-1, " ");//
	mvprintw(y+1,x-2, " ");
	mvprintw(y+1,x-3, " ");
	mvprintw(y-3,x-1, " ");
	mvprintw(y-3,x-2, " ");
	mvprintw(y-3, x-3, " ");//
	mvprintw(y,x-3, " ");
	mvprintw(y-1,x-3 ," ");
	mvprintw(y-2,x-3, " ");
	mvprintw(y-2,x-2, " ");
	mvprintw(y,x-2, " ");
	mvprintw(y-1, x-2, " ");
	mvprintw(y,x-1, " ");
	mvprintw(y-1,x-1, " ");
	mvprintw(y-2,x-1, " ");

	x = 106; 
	y = 20;

	
	mvprintw(y+1,x-4, " ");
	mvprintw(y+1,x-5, " ");
	mvprintw(y+1,x-6, " ");
	mvprintw(y-3,x-4, " ");
	mvprintw(y-3,x-5, " ");
	mvprintw(y-3, x-6, " ");
	mvprintw(y,x-6, " ");
	mvprintw(y-1,x-6 ," ");
	mvprintw(y-2,x-6, " ");
	mvprintw(y-2,x-5, " ");
	mvprintw(y,x-5, " ");
	mvprintw(y-1, x-5, " ");
	mvprintw(y,x-4, " ");
	mvprintw(y-1,x-4, " ");
	mvprintw(y-2,x-4, " ");
	mvprintw(y+1,x-1, " ");
	mvprintw(y+1,x-2, " ");
	mvprintw(y+1,x-3, " ");
	mvprintw(y-3,x-1, " ");
	mvprintw(y-3,x-2, " ");
	mvprintw(y-3, x-3, " ");
	mvprintw(y,x-3, " ");
	mvprintw(y-1,x-3 ," ");
	mvprintw(y-2,x-3, " ");
	mvprintw(y-2,x-2, " ");
	mvprintw(y,x-2, " ");
	mvprintw(y-1, x-2, " ");
	mvprintw(y,x-1, " ");
	mvprintw(y-1,x-1, " ");
	mvprintw(y-2,x-1, " ");
	
	mvprintw(y+4,x, " ");
	mvprintw(y+3,x, " ");
	mvprintw(y+2,x, " ");
	mvprintw(y+2,x+1, " ");
	mvprintw(y+3,x+1, " ");
	mvprintw(y+4, x+1, " ");
	mvprintw(y+2,x+2, " ");
	mvprintw(y+3,x+2, " ");
	mvprintw(y+4,x+2, " ");
	
	mvprintw(y-4,x, " ");
	mvprintw(y-5,x, " ");
	mvprintw(y-6,x, " ");
	mvprintw(y-6,x+1, " ");
	mvprintw(y-5,x+1, " ");
	mvprintw(y-4, x+1, " ");
	mvprintw(y-6,x+2, " ");
	mvprintw(y-5,x+2, " ");
	
	mvprintw(y-4,x+2, " ");
	mvprintw(y-7,x+3, " ");
	mvprintw(y-8,x+3, " ");
	mvprintw(y-7,x+4, " ");
	mvprintw(y-8,x+4, " ");

	attrset(COLOR_PAIR(1));

	mvprintw(y,x+1, " ");
	mvprintw(y-1,x+1, " ");
	mvprintw(y-2,x+1, " ");
	mvprintw(y-2,x+2, "V");
	mvprintw(y-1,x+2, "V");
	mvprintw(y-2,x+3, " ");
	mvprintw(y-1,x+3, " ");
	mvprintw(y,x+3, " ");


	mvprintw(y,x+5, " ");
	mvprintw(y-1,x+5 ," ");
	mvprintw(y-2,x+5, " ");
	mvprintw(y-2,x+6, " ");
	mvprintw(y,x+6, " ");
	mvprintw(y,x+7, " ");
	mvprintw(y-1,x+7, " ");
	mvprintw(y-2,x+7, " ");


	mvprintw(y-2,x+9, " ");
	mvprintw(y-2,x+10, " ");
	mvprintw(y-1,x+10, " ");
	mvprintw(y,x+10, " ");
	mvprintw(y-2,x+11, " ");


	mvprintw(y,x+13, " ");
	mvprintw(y-1,x+13, " ");
	mvprintw(y-2,x+13, " ");
	mvprintw(y-2,x+14, " ");
	mvprintw(y,x+14, " ");
	mvprintw(y,x+15, " ");
	mvprintw(y-1,x+15, " ");
	mvprintw(y-2,x+15, " ");


	attrset(COLOR_PAIR(4));

	mvprintw(y,x+17, " ");
	mvprintw(y,x+18, " ");
	mvprintw(y,x+19, " ");
	mvprintw(y,x+20, " ");
	mvprintw(y-1,x+17, " ");
	mvprintw(y-1,x+19, " ");
	mvprintw(y-1,x+20, " ");
	mvprintw(y-2,x+17, " ");
	mvprintw(y-3,x+18, " ");
	mvprintw(y-3,x+19, " ");
	mvprintw(y-3,x+20, " ");
	mvprintw(y-3,x+17, " ");

	mvprintw(y,x+24, " ");
	mvprintw(y-1,x+24, " ");
	mvprintw(y-2,x+24, " ");
	mvprintw(y-3,x+24, " ");
	mvprintw(y-3,x+24, " ");
	mvprintw(y-3,x+25, " ");
	mvprintw(y-3,x+26, " ");
	mvprintw(y-3,x+23, " ");
	mvprintw(y-3,x+22, " ");

	attrset(COLOR_PAIR(5));



	return 0;
}

void instructions_moto() {
	clear();
	endwin();
	initscr();
	init_pair(20, COLOR_CYAN, COLOR_BLACK);
	attron(COLOR_PAIR(20));
	box(stdscr, 0, 0);
	attron(A_STANDOUT);
	mvprintw(10, 85, "||    MOTO GT    ||");
	attroff(A_STANDOUT);
	mvprintw(12, 20, "MotoGT is a single player obstacle dodging game. Press the left and right arrow keys to move your bike as you dodge the incoming obstacles to gain points.");
	mvprintw(13, 20, " Don't forget to collide with the NITROS to experience some real speed. PLAY SAFE");
	getch();
	clear();
	refresh();
	//	delwin(stdscr);
	endwin();
	menu();
	return;	
}

void stop() {

	endwin();
	clear();
	delwin(stdscr);
	exit(0);
	//	refresh();
}

void score1(int score) {

	clear();
	endwin();
	initscr();
	init_pair(20, COLOR_CYAN, COLOR_BLACK);
	attron(COLOR_PAIR(20));
	box(stdscr, 0, 0);
	attron(A_STANDOUT);
	mvprintw(10, 95, "||    SCORE    ||");
	attroff(A_STANDOUT);
	mvprintw(12, 103, "%d", score);
	mvprintw(LINES - 2, 1, "PRESS ANY KEY TO EXIT");
	getch();
	attroff(COLOR_PAIR(20));
	clear();
	endwin();
	main_menu();
	//	delwin(stdscr);

}






