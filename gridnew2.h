/********************************************************************************
 * This program has motoGT and ultimate tic-tac-toe game developed for recreational purpose
 * and as a part of project.
 * Copyright (C) 2016 Rishabh Chitlangia rishabh.chitlangia96@gmail.com
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
***********************************************************************************









typedef enum {VALID, SPACE_OCCUPIED, OUT_OF_BOUNDS} MoveStatus;
int big[3][3];
void init(int board[9][3][3]);
void initb();
int checksmall(int board[9][3][3], int k);
int checkbig();
int checkfull(int board[9][3][3], int k);
int check[9];
void main_ultimate();
void instructions_ultimate();
MoveStatus validmove(int board[9][3][3], int k, int r, int c) ;
