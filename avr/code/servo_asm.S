.global servo_timer
.global servos
.global servo_to_substract
.global digital_pin_to_bit_mask_PGM
.global digital_pin_to_port_PGM
.global port_to_output_PGM

#include <avr/io.h>

#define SERVO_NUM 16


servo_timer:
	push r16
	in r16, 0x3f
	push r16
	push r17
	push r18
	push r24
	push r25
	push YL
	push YH
	push ZL
	push ZH

	; Занято r16, 17, r18, ZL, ZH

	ldi r16, 0xff ; next
	ldi r17, 0xff

	ldi YL, lo8(servos)
	ldi YH, hi8(servos)

	ldi r18, 0
loop:
	ldd r24, Y + 2 ; //if(s->period != 0xffff){
	ldd r25, Y + 3
	adiw r24, 1
	brne enabled
	rjmp not_enabled
enabled:

	ldd r24, Y + 0 ; //s->current -= servo_to_substract;
	ldd r25, Y + 1
	lds ZL, servo_to_substract
	eor ZH, ZH
	sub r24, ZL
	sbc r25, ZH
	std Y + 0, r24
	std Y + 1, r25

	sbiw r24, 5 ; //if(s->current<5){
	brcs not_next
	rjmp next
not_next:

;; digitalRead(pin) from output
	mov r24, r18 ; port number
	ldi ZL, lo8(digital_pin_to_port_PGM)
	ldi ZH, hi8(digital_pin_to_port_PGM)
	add ZL, r24
	ldi r24, 0
	adc ZH, r24
	lpm	 r24, Z

	mov r25, r18 ; mask
	ldi ZL, lo8(digital_pin_to_bit_mask_PGM)
	ldi ZH, hi8(digital_pin_to_bit_mask_PGM)
	add ZL, r25
	ldi r25, 0
	adc ZH, r25
	lpm	 r25, Z

	ldi ZL, lo8(port_to_output_PGM) ; output
	ldi ZH, hi8(port_to_output_PGM)
	add ZL, r24
	ldi r24, 0
	adc ZH, r24
	lpm ZL, Z
	ldi ZH, 0

	ldd r24, Z + 0
	and r24, r25
	brne turn_off
;;





;	ldd r24, Y + 4 ; // if(s->state){
;	and r24, r24
	brne turn_off

turn_on:
;; digitalWrite(pin, HIGH)
	mov r24, r18 ; port number
	ldi ZL, lo8(digital_pin_to_port_PGM)
	ldi ZH, hi8(digital_pin_to_port_PGM)
	add ZL, r24
	ldi r24, 0
	adc ZH, r24
	lpm	 r24, Z

	mov r25, r18 ; mask
	ldi ZL, lo8(digital_pin_to_bit_mask_PGM)
	ldi ZH, hi8(digital_pin_to_bit_mask_PGM)
	add ZL, r25
	ldi r25, 0
	adc ZH, r25
	lpm	 r25, Z

	ldi ZL, lo8(port_to_output_PGM) ; output
	ldi ZH, hi8(port_to_output_PGM)
	add ZL, r24
	ldi r24, 0
	adc ZH, r24
	lpm ZL, Z
	ldi ZH, 0

	ldd r24, Z + 0
	or r24, r25
	std Z + 0, r24
;;

	ldd r24, Y+2 ; // s->current = s->period
	ldd r25, Y+3
	std Y+0, r24
	std Y+1, r25
	rjmp next

turn_off:			; //else
;; digitalWrite(pin, LOW)
	mov r24, r18 ; port number
	ldi ZL, lo8(digital_pin_to_port_PGM)
	ldi ZH, hi8(digital_pin_to_port_PGM)
	add ZL, r24
	ldi r24, 0
	adc ZH, r24
	lpm	 r24, Z

	mov r25, r18 ; mask
	ldi ZL, lo8(digital_pin_to_bit_mask_PGM)
	ldi ZH, hi8(digital_pin_to_bit_mask_PGM)
	add ZL, r25
	ldi r25, 0
	adc ZH, r25
	lpm	 r25, Z

	ldi ZL, lo8(port_to_output_PGM) ; output
	ldi ZH, hi8(port_to_output_PGM)
	add ZL, r24
	ldi r24, 0
	adc ZH, r24
	lpm ZL, Z
	ldi ZH, 0

	ldd r24, Z + 0
	com r25
	and r24, r25
	std Z + 0, r24
;;

	ldi r24, lo8(10000) ; // s->current = 40000
	ldi r25, hi8(10000)
	std Y+0, r24
	std Y+1, r25
next:
	ldd r24, Y + 0 ; //next = (next > s->current ? s->current : next);
	ldd r25, Y + 1
	sub r24, r16
	sbc r25, r17
	brsh not_enabled
	ldd r16, Y + 0
	ldd r17, Y + 1


not_enabled:
	adiw YL, 4 ; 
	subi r18, 255
	ldi r24, SERVO_NUM
	sub r24, r18
	breq cont
	rjmp loop

cont:
	mov r24, r16 ; // if(next == 65000)
	mov r25, r17
	adiw r24, 1
	brne at_least_one_servo
	in r24, 0x28 ; OCR0B
	subi r24,6
	out 0x28, r24 ; OCR0B
	rjmp exit

at_least_one_servo:
	ldi ZL, 201 ; //if(next < 200){
	eor ZH, ZH
	sub r24, ZL
	sbc r25, ZH
	brcc too_high
	sts servo_to_substract, r16 ; //servo_to_substract = next;
	in r24, 0x28 ; //OCR0B += next;
	add r24, r16
	out 0x28, r24

	rjmp exit
too_high:
	ldi r25, 200
	sts servo_to_substract, r25
	in r24, 0x28 ; //OCR0B += 200;
	add r24, r25
	out 0x28, r24


exit:
	pop ZH
	pop ZL
	pop YH
	pop YL
	pop r25
	pop r24
	pop r18
	pop r17
	pop r16
	out 0x3f, r16
	pop r16
	/*uint16_t next = 65000;
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
	}*/

	ret