/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Control blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 * Due to the frequency of long strings, the 80-column wrap rule need not apply
 * to language files.
 */

if (!Blockly.Language) Blockly.Language = {};

Blockly.Language.led = {
  // Nop.
  category: 'Wiring',
  helpUrl: 'http://en.wikipedia.org/wiki/Led',
  init: function() {
    this.setColour(0);
    this.appendTitle('set led');

    var opts = [];
    for(i in Blockly.mainWorkspace.wiring){
      var o = Blockly.mainWorkspace.wiring[i];
      if(o.type == 'led')
        opts[opts.length] = [o.name, i];
    }
    if(!opts.length)
      opts[opts.length] = ['---', 0];
    var dropdown = new Blockly.FieldDropdown(opts);
    this.appendTitle(dropdown, 'PIN');

    this.appendTitle('to');
    var dropdown = new Blockly.FieldDropdown([['on', 'ON'],['off', 'OFF']]);
    this.appendTitle(dropdown, 'VAL');


    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return 'Does nothing.'
    });
  }
};

Blockly.Language.output = {
  // Nop.
  category: 'Wiring',
  helpUrl: 'http://en.wikipedia.org/wiki/Input/output',
  init: function() {
    this.setColour(0);
    this.appendTitle('set pin');

    var opts = [];
    for(i in Blockly.mainWorkspace.wiring){
      var o = Blockly.mainWorkspace.wiring[i];
      if(o.type == 'output')
        opts[opts.length] = [o.name, i];
    }
    if(!opts.length)
      opts[opts.length] = ['---', 0];
    var dropdown = new Blockly.FieldDropdown(opts);
    this.appendTitle(dropdown, 'PIN');

    this.appendTitle('to');
    var dropdown = new Blockly.FieldDropdown([['high', 'HIGH'],['low', 'LOW']]);
    this.appendTitle(dropdown, 'VAL');


    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return 'Does nothing.'
    });
  }
};

Blockly.Language.input = {
  // Numeric value.
  category: 'Wiring',
  helpUrl: 'http://en.wikipedia.org/wiki/Input/output',
  init: function() {
    this.appendTitle('pin');

    var opts = [];
    for(i in Blockly.mainWorkspace.wiring){
      var o = Blockly.mainWorkspace.wiring[i];
      if(o.type == 'input')
        opts[opts.length] = [o.name, i];
    }
    if(!opts.length)
      opts[opts.length] = ['---', 0];
    var dropdown = new Blockly.FieldDropdown(opts);
    this.appendTitle(dropdown, 'PIN');

    this.appendTitle('is');

    var dropdown = new Blockly.FieldDropdown([['high', 'HIGH'],['low', 'LOW']]);
    this.appendTitle(dropdown, 'VAL');

    this.setColour(120);
    this.setOutput(true, Boolean);
    this.setTooltip('A pin state.');
  }
};

Blockly.Language.servo = {
  // Numeric value.
  category: 'Wiring',
  helpUrl: 'http://en.wikipedia.org/wiki/Servo_drive',
  init: function() {
    this.setColour(0);
    this.appendTitle('set servo');

    var opts = [];
    for(i in Blockly.mainWorkspace.wiring){
      var o = Blockly.mainWorkspace.wiring[i];
      if(o.type == 'servo')
        opts[opts.length] = [o.name, i];
    }
    if(!opts.length)
      opts[opts.length] = ['---', 0];
    var dropdown = new Blockly.FieldDropdown(opts);
    this.appendTitle(dropdown, 'PIN');

    this.appendTitle('to');
    this.appendInput('', Blockly.INPUT_VALUE, 'A', Number);


    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return 'Does nothing.'
    });
  }
};

Blockly.Language.optocoupler = {
  // Numeric value.
  category: 'Wiring',
  helpUrl: 'http://en.wikipedia.org/wiki/Optocoupler',
  init: function() {
    this.appendTitle('optocoupler');

    var opts = [];
    for(i in Blockly.mainWorkspace.wiring){
      var o = Blockly.mainWorkspace.wiring[i];
      if(o.type == 'optocoupler')
        opts[opts.length] = [o.name, i];
    }
    if(!opts.length)
      opts[opts.length] = ['---', 0];
    var dropdown = new Blockly.FieldDropdown(opts);
    this.appendTitle(dropdown, 'PIN');

    this.appendTitle('is');

    var dropdown = new Blockly.FieldDropdown([['active', 'ACTIVE'],['inactive', 'INACTIVE']]);
    this.appendTitle(dropdown, 'VAL');

    this.setColour(120);
    this.setOutput(true, Boolean);
    this.setTooltip('A pin state.');
  }
};