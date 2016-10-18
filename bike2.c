#include<stdio.h>
#include<ncurses.h>
#include<unistd.h>
#include"kbhit.h"
void game();
void img(int );
void imgr(int );
void  obstacle1(int , int );
void track();
void obstacle2(int, int );


	
void main() {

	initscr();
	start_color();
	noecho();
	cbreak();
	keypad(stdscr, TRUE);
	srand(time(NULL));
	init_pair(1, COLOR_BLACK, COLOR_BLACK);
	bkgdset(COLOR_PAIR(1));
	box(stdscr, 10, 10);
	game();
	refresh();
	endwin();

}
void game() {
	int ch;
	static int co = 20, co2;
	srand(time(NULL)); 
	static int lives = 3;
	img(co);
	refresh();
	track();
	int z = 1;
	int y1 = (rand() % 38), x1 = 20;
	int y2 = (rand() % 35), x2 = 28;
	int y3 = (rand() % 40), x3 = 35;
	while(z){
	obstacle1(y1, x1);
	usleep(10000);
	obstacle2(y2, x2);
	usleep(10000);
	obstacle3(y3, x3);
	y1++;
	y2++;
	y3++;
	if(kbhit()) {
	ch = wgetch(stdscr);
		switch(ch) {
			case KEY_LEFT:
				co2 = co;
				co = co - 1;
				imgr(co2); 
				img(co);
				refresh();
				break;
			case KEY_RIGHT:
				co2 = co;
				co = co + 1;
				imgr(co2);
				img(co);
				refresh();
				break;
			case 'e':
				z = 0;
				break;
			default:
				break;
		
		}
         }
		
		if(y1 == LINES){
			y1 = (rand() % 38);
			clear();
			track();
		}
		if(y2 == LINES){
			y2 = (rand() % 38);
			clear();
			track();
		}

		if(y1 == 38 && (co == 20 || co == 21 || co == 22 || co == 23)){
			lives--;
			break;
		}
	
		if(y2 == 36 && (co == 28 || co == 29)){
			lives--;
			break;
		}
	}
	
	if(lives == 0) {
		endwin();
	}
	else{
		clear();
		game();

	}
}

void img(int co1) {
	
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
		init_pair(3, COLOR_WHITE, COLOR_WHITE);
		attron(COLOR_PAIR(3));
		mvprintw(yy, xx, "| |");
		attroff(COLOR_PAIR(3));
		attron(COLOR_PAIR(3));
		mvprintw(yy, xx + 45 , "| |");
		attroff(COLOR_PAIR(3));
		yy++;
		refresh();

	}
}
             
	
void obstacle1(int y1, int x1) {	

	init_pair(5, COLOR_GREEN, COLOR_GREEN);
	attron(COLOR_PAIR(5));
	mvprintw(y1, x1, "    ");
	attroff(COLOR_PAIR(5));
	usleep(20000);
        refresh();
        mvprintw(y1 - 1, x1, "     ");
        refresh();
}

void obstacle2(int y2, int x2) {

	init_pair(6, COLOR_YELLOW, COLOR_YELLOW);
	attron(COLOR_PAIR(6));
	mvprintw(y2, x2, "  ");	
	mvprintw(y2 + 1, x2, "  ");
	mvprintw(y2 + 2, x2, "  ");
	attroff(COLOR_PAIR(6));
	usleep(30000);
	refresh();
	mvprintw(y2 - 2, x2, "  ");
	mvprintw(y2 - 1, x2, "  ");
	mvprintw(y2, x2, "  ");
}

/*void obstacle3(int y3, int x3) {

	init_pair(4, COLOR_BLUE, COLOR_BLUE);
	attron(COLOR_PAIR(4));
	mvprintw(y3, x3, "  ");	
	mvprintw(y3 + 1, x3 - 2, "       ");	
	mvprintw(y3 + 2, x3 - 4, "          ");	
	attroff(COLOR_PAIR(4));
	usleep(50000);
	mvprintw(y3 - 2, x3 - 4, "  ");	
	mvprintw(y3 - 1, x3 - 2, "       ");	
	mvprintw(y3, x3, "          ");	
}*/











