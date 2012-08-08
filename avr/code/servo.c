#include <avr/io.h>
#include <avr/interrupt.h>
#include "wiring.h"
#include "pins_arduino.h"

#include "servo.h"

typedef struct
{
	uint16_t current; //0
	uint16_t period; //2
}Servo;

Servo servos[SERVO_NUM];

void set_servo(uint8_t channel, uint8_t deg)
{
	servos[channel].period = usToTicks(map(deg, 0, 180, MIN_PULSE_WIDTH, MAX_PULSE_WIDTH));
	pinMode(channel, OUTPUT);
}

uint8_t servo_to_substract = 0;

void servo_timer1()
{
	uint16_t next = 65000;
	for(uint8_t i=0; i<SERVO_NUM; i++)
	{
		Servo* s = &(servos[i]);
		if(s->period != 0xffff){
			s->current -= servo_to_substract;
			if(s->current<5){
				if(digitalRead(i)){
					digitalWrite(i, LOW);
					s->current = usToTicks(SERVO_FREQ);
				}else{
					digitalWrite(i, HIGH);
					s->current = servos[i].period;
				}
			}
			next = (next > s->current ? s->current : next);
		}
	}
	if(next<2)
		digitalWrite(2, !digitalRead(2));

	if(next == 65000){
		OCR0B += 250;
		return;
	}	
	if(next < 200){
		servo_to_substract = next;
		if(next < 2)
			OCR0B = TCNT0 + next + 2;
		else
			OCR0B += next;
	}else{
	 	servo_to_substract = 200;
	 	OCR0B += 200;
	}
}

void init_servos()
{
	for(uint8_t i=0; i<SERVO_NUM; i++)
	{
		servos[i].current = SERVO_FREQ;
		servos[i].period = 0xffff;
	}	
}
