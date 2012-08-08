#ifndef _SERVO_H_

#define _SERVO_H_

#ifdef __cplusplus
extern "C"{
#endif

#define SERVO_NUM 16

#define MIN_PULSE_WIDTH       544     // the shortest pulse sent to a servo  
#define MAX_PULSE_WIDTH      2400     // the longest pulse sent to a servo 
#define SERVO_FREQ  30000     // default pulse width when servo is attached

void set_servo(uint8_t channel, uint8_t deg);
void servo_timer();
void init_servos();

#ifdef __cplusplus
}
#endif

#endif