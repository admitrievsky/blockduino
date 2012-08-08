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
 * @fileoverview Helper functions for generating C for blocks.
 * @author fraser@google.com (Neil Fraser)
 * Due to the frequency of long strings, the 80-column wrap rule need not apply
 * to language files.
 */

Blockly.C = Blockly.Generator.get('C');

Blockly.C.stackSize = 80;

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.C.RESERVED_WORDS_ =
    'auto,const,double,float,int,short,struct,unsigned,break,continue,else,for,long,signed,switch,void,case,default,enum,goto,register,sizeof,typedef,volatile,char,do,extern,if,return,static,union,while,asm,dynamic_cast,namespace,reinterpret_cast,try,bool,explicit,new,static_cast,typeid,catch,false,operator,template,typename,class,friend,private,this,using,const_cast,inline,public,throw,virtual,delete,mutable,protected,true,wchar_t';

/**
 * Initialise the database of variable names.
 */
Blockly.C.init = function() {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.C.definitions_ = {};

  if (Blockly.Variables) {
    if (!Blockly.C.variableDB_) {
      Blockly.C.variableDB_ =
          new Blockly.Names(Blockly.C.RESERVED_WORDS_.split(','));
    } else {
      Blockly.C.variableDB_.reset();
    }

    var defvars = [];
    var variables = Blockly.Variables.allVariables();
    for (var x = 0; x < variables.length; x++) {
      var type = 'int';
      var matches = variables[x].match(/^_([^_]+)/);
      if(matches)
        type = matches[1];

      defvars[x] = type + ' ' +
          Blockly.C.variableDB_.getDistinctName(variables[x],
          Blockly.Variables.NAME_TYPE) + ';';
    }
    Blockly.C.definitions_['variables'] = defvars.join('\n');

    Blockly.C.threads = [];
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.C.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.C.definitions_) {
    definitions.push(Blockly.C.definitions_[name]);
  }

  var ret = '';
  var ps = Blockly.Procedures.allProcedures();
  ps[0].forEach(function(funcName){
    ret += 'void ' + funcName + '();\n';
  });
  ps[1].forEach(function(funcName){
    var type = 'int';
    var matches = funcName.match(/^_([^_]+)/);
    if(matches)
      type = matches[1];
    ret += type + ' ' + funcName + '();\n';
  });
  ret += '\n\n';

  ret += definitions.join('\n') + '\n\n';
  ret +=  code + '\n\n';



  ret += 'void init(){\n';

  for(x in Blockly.mainWorkspace.wiring){
    var type = Blockly.mainWorkspace.wiring[x].type;
    if(type  == 'servo' || type == 'led' || type == 'output')
      ret += 'pinMode(' + x + ', OUTPUT);\n';
    else
      ret += 'pinMode(' + x + ', INPUT);\n';
  }

  for(var i=1; i<Blockly.C.threads.length; i++){
    var t = Blockly.C.threads[i];
    ret += ' avr_thread_start(&' + t + '_context, ' + t + ', ' + t + '_stack, sizeof(' + t + '_stack));\n';
  }
  ret += '}\n';
  if(!Blockly.C.threads.length)
    ret += 'void thread_0(){for(;;);}';

  return ret;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.C.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped C string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} C string.
 * @private
 */
Blockly.C.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating C from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The C code created for this block.
 * @return {string} C code with comments and subsequent blocks added.
 * @private
 */
Blockly.C.scrub_ = function(block, code) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Generator.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].targetBlock();
        if (childBlock) {
          var comment = Blockly.Generator.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Generator.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};



Blockly.C.topBlockInit = function() {
  var thread = 'thread_' + Blockly.C.threads.length;
  Blockly.C.threads.push(thread);

  if(Blockly.C.threads.length-1)
    return 'uint8_t ' + thread + '_stack[80];\navr_thread_context ' + thread + '_context;\nvoid ' + thread + '(){';
  else
    return 'void ' + thread + '(){';    
};

Blockly.C.topBlockFinish = function() {

  return ' for(;;)avr_thread_sleep(1000);\n}\n\n';
};