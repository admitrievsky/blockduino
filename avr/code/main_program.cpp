#include <avr/io.h>
#include <avr/interrupt.h>

#include "servo.h"

extern "C"{
#include "avr-thread.h"
}

#include "wiring.h"

#define CLKSEL0 _SFR_MEM8(0xD0)
#define CLKSTA _SFR_MEM8(0xD2)

@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

int main(void)
{
    CLKSEL0 |= _BV(EXTE);
    CLKSEL0 |= (1<<CLKS);
    CLKPR = _BV(CLKPCE);
    CLKPR = 0;

    // Setup timer 2 mode.  Include reset on overflow bit.
    // Approximately 1.008 kHz for 4 MHz crystal.
    TCCR0B = _BV(CS01) | _BV(CS00);
    OCR0A = 250;
    OCR0B = 255;
    TIMSK0 |= _BV(OCIE0A) | _BV(OCIE0B);

    // Initialize avr-thread library.
    avr_thread_init();

    init();

    init_servos();

    sei();

    for (;;) {
        thread_0();
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
