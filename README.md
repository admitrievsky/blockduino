Blockduino
==========

An attempt to use Google Blockly as a language for Arduino and compatibles.

Features
--------

* An easy to learn visual programming language to program microcontrollers

* Multithreading
* A graphical dialog for pins configuration 
* Load and save operations
* The servo library wastes only one timer
* Server side is written in Python
* You can teach your children to program cool staff with mouse only

### Blink
![Blink](https://raw.github.com/admitrievsky/blockduino/master/README.md.images/blink.png)

#Wiring panel
![Wiring panel](https://raw.github.com/admitrievsky/blockduino/master/README.md.images/blockduino.png)

### Multithreading
![Multithreading](https://raw.github.com/admitrievsky/blockduino/master/README.md.images/mt.png)

Current board support
----------------------

The project supports simple board based on AT90USB162 controllers. It is not nesessary to have such board to play with Blockduino. You can build blocks, see the compiled code etc. The only thing you can't do without the board is to burn compiled code to it. See schematics in the board directory.

Installation
------------

You will need the following packages: gcc-avr, dfu-programmer. So:

 sudo apt-get install gcc-avr binutils-avr avr-libc dfu-programmer

To start server cd into the Blockduino folder and issue the command

 python app.py

Point your browser to http://localhost:8000/ and have a fun!

Tested with Chromium browser.

Sketches are saved into ~/blockly-sketchbook folder.

Operation
---------

The magic is done by turning blocks into C code. Then the code compile by standard gcc-avr toolchain and burn by dfu-programmer.
The default type for variables is int. The _float prefix in a variable name changes this behaviour.
The multithreading staff is made by avr-threads library. Thanks to Dean Ferreyra from Bourbon Street Software. With AT90USB162 no more than 3 threads are available.

TODO
----

* Add other boards support. Arduino, STM32, ...
* Correct spelling. I can see my English skills.
* Make Math section to work.
* Restore Lists and Strings sections.