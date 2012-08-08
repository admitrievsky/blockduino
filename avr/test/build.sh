#!/bin/bash
avr-g++ -c -mmcu=at90usb162 -DF_CPU=16000000UL -gdwarf-2 -Os -w -fno-exceptions -ffunction-sections -fdata-sections -I../dferreyra-avr-threads-42172f917c3f/avr-threads/src/ z.cpp &&
avr-gcc -c -mmcu=at90usb162 -DF_CPU=16000000UL -gdwarf-2 -Os -w -fno-exceptions -ffunction-sections -fdata-sections  wiring_digital.c &&
avr-gcc -c -mmcu=at90usb162 -DF_CPU=16000000UL -gdwarf-2 -Os -w -fno-exceptions -ffunction-sections -fdata-sections  pins_arduino.c &&
avr-gcc -c -mmcu=at90usb162 -DF_CPU=16000000UL -std=gnu99 -gdwarf-2 -Os -w -fno-exceptions -ffunction-sections -fdata-sections  servo.c &&
avr-gcc -c -mmcu=at90usb162 -DF_CPU=16000000UL servo_asm.S &&
avr-ar rcs z.a z.o &&
avr-ar rcs wiring_digital.a wiring_digital.o &&
avr-ar rcs pins_arduino.a pins_arduino.o &&
avr-ar rcs servo.a servo.o &&
avr-ar rcs servo_asm.a servo_asm.o &&
avr-gcc -Os -Wl,--gc-sections -mmcu=at90usb162 -o z.elf z.a wiring_digital.a pins_arduino.a servo.a servo_asm.a -lm -L../dferreyra-avr-threads-42172f917c3f/avr-threads/src/avr35 -lavr-thread &&
avr-objcopy -j .text -j .data -j .bss -O ihex z.elf z.hex && 
dfu-programmer at90usb162 erase &&
dfu-programmer at90usb162 flash z.hex &&
dfu-programmer at90usb162 start


#avrdude -c arduino -P /dev/ttyUSB0 -b 38400 -p m644p -U flash:w:z.hex