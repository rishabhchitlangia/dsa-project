#include "kbhit.h"
#include <stdio.h>
#include <stddef.h>
#include <termios.h>
#include <sys/ioctl.h>

static int initialized = 0;
static struct termios original_tty;


int kbhit() {
	if(!initialized) {
		kbinit();
	}

	int bytesWaiting;
	ioctl(fileno(stdin), FIONREAD, &bytesWaiting);
	return bytesWaiting;
}

void kbinit() {
	struct termios tty;
	tcgetattr(fileno(stdin), &original_tty);
	tty = original_tty;

	tty.c_lflag &= ~ICANON;
	tty.c_lflag &= ~ECHO;
	tcsetattr(fileno(stdin), TCSANOW, &tty);

	setbuf(stdin, NULL);
	initialized = 1;
}

void kbfini() {
	if(initialized) {
		tcsetattr(fileno(stdin), TCSANOW, &original_tty);
		initialized = 0;
	}
}
