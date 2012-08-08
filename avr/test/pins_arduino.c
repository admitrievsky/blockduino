/*
  pins_arduino.c - pin definitions for the Arduino board
  Part of Arduino / Wiring Lite

  Copyright (c) 2005 David A. Mellis

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General
  Public License along with this library; if not, write to the
  Free Software Foundation, Inc., 59 Temple Place, Suite 330,
  Boston, MA  02111-1307  USA

  $Id: pins_arduino.c 804 2009-12-18 16:05:52Z dmellis $
*/

#include <avr/io.h>
//#include "wiring_private.h"
#include "pins_arduino.h"

#define PA 1
#define PB 2
#define PC 3
#define PD 4
#define PE 5
#define PF 6
#define PG 7
#define PH 8
#define PJ 10
#define PK 11
#define PL 12

#define REPEAT8(x) x, x, x, x, x, x, x, x
#define BV0TO7 _BV(0), _BV(1), _BV(2), _BV(3), _BV(4), _BV(5), _BV(6), _BV(7)
#define BV7TO0 _BV(7), _BV(6), _BV(5), _BV(4), _BV(3), _BV(2), _BV(1), _BV(0)




// these arrays map port names (e.g. port B) to the
// appropriate addresses for various functions (e.g. reading
// and writing)
const uint8_t PROGMEM port_to_mode_PGM[] = {
	NOT_A_PORT,
	NOT_A_PORT,
	&DDRB,
	&DDRC,
	&DDRD,
};

const uint8_t PROGMEM port_to_output_PGM[] = {
	NOT_A_PORT,
	NOT_A_PORT,
	&PORTB,
	&PORTC,
	&PORTD,
};

const uint8_t PROGMEM port_to_input_PGM[] = {
	NOT_A_PORT,
	NOT_A_PORT,
	&PINB,
	&PINC,
	&PIND,
};

const uint8_t PROGMEM digital_pin_to_port_PGM[] = {
	PD, /* 0 */
	PC, /* 1 */
	PD, /* 2 */
	PD, /* 3 */
	PD, /* 4 */
	PD, /* 5 */
	PD, /* 6 */
	PD, /* 7 */
	PB, /* 8 */
	PB, /* 9 */
	PB, /* 10 */
	PB, /* 11 */
	PC, /* 12 */
	PC, /* 13 */
	PC, /* 14 */
	PC /* 15 */
};

const uint8_t PROGMEM digital_pin_to_bit_mask_PGM[] = {
	_BV(0), /* 0 */
	_BV(2), /* 1 */
	_BV(1), /* 2 */
	_BV(2), /* 3 */
	_BV(3), /* 4 */
	_BV(4), /* 5 */
	_BV(5), /* 6 */
	_BV(6), /* 7 */
	_BV(4), /* 8 */
	_BV(5), /* 9 */
	_BV(6),  /* 10 */
	_BV(7), /* 11 */
	_BV(6), /* 12 */
	_BV(5), /* 13 */
	_BV(4), /* 14 */
	_BV(7)  /* 15 */
};
