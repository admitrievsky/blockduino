#include <avr/io.h>
#include <avr/interrupt.h>

#include "servo.h"

extern "C"{
#include <avr-thread.h>
}

#include "wiring.h"

#define CLKSEL0 _SFR_MEM8(0xD0)
#define CLKSTA _SFR_MEM8(0xD2)

// Task switcher
volatile uint32_t switch_count = 0;

// Thread stack
uint8_t fn_stack[80];
// Thread context
avr_thread_context fn_context;
// Thread code
void fn(void)
{
    for (;;) {
    	PORTC = (switch_count ? 255 : 0);
    }
}


// Thread stack
uint8_t fn_stack1[80];
// Thread context
avr_thread_context fn_context1;
// Thread code
void fn1(void)
{
    for (uint8_t z=0;z<5; z++) {
    	avr_thread_sleep(1000);
    	switch_count = 0;
        digitalWrite(2, HIGH);
          set_servo(5, 50);
    	avr_thread_sleep(1000);
        digitalWrite(2, LOW);
          set_servo(5, 100);
    	switch_count = 1;
    }
    for(;;)avr_thread_sleep(1000);
}


int main(void)
{
    pinMode(2, OUTPUT);
    pinMode(15, OUTPUT);

    CLKSEL0 |= _BV(EXTE);
    CLKSEL0 |= (1<<CLKS);
    CLKPR = _BV(CLKPCE);
    CLKPR = 0;

    // Setup port B as all output.
    PORTC = 0;
    DDRC = 128;

    // Setup timer 2 mode.  Include reset on overflow bit.
    // Approximately 1.008 kHz for 4 MHz crystal.
    TCCR0B = _BV(CS01) | _BV(CS00);
    OCR0A = 250;
    OCR0B = 255;
    TIMSK0 |= _BV(OCIE0A) | _BV(OCIE0B);

    // Initialize avr-thread library.
    avr_thread_init();

    init_servos();

    sei();
    // Start new thread
    avr_thread_start(&fn_context,
                     fn, fn_stack, sizeof(fn_stack));

    // Start new thread
    avr_thread_start(&fn_context1,
                     fn1, fn_stack1, sizeof(fn_stack1));
    for (;;) {
        for(int i=0; i<180; i+=2){
            set_servo(6, i);
            avr_thread_sleep(500);
    //        set_servo(5, 180-i);
        }
    }
    return 0;
}


ISR(TIMER0_COMPA_vect, ISR_NAKED)
{
    sei();
    avr_thread_isr_start();
    OCR0A += 250;
    avr_thread_isr_end();
}



ISR(TIMER0_COMPB_vect, ISR_NAKED)
{
//    cli();for(;;);   
    servo_timer();
    asm("reti");
}
