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
 * @fileoverview Utility functions for handling connections.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 */
Blockly.Wiring = {};

Blockly.Wiring.NAME_TYPE = 'connection';

/**
 * Find all user-created procedure definitions.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Wiring.allWiring = function() {
/*  var blocks = Blockly.mainWorkspace.getAllBlocks(false);
  var proceduresReturn = [];
  var proceduresNoReturn = [];
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getProcedureDef;
    if (func) {
      var tuple = func.call(blocks[x]);
      if (tuple) {
        if (tuple[1]) {
          proceduresReturn.push(tuple[0]);
        } else {
          proceduresNoReturn.push(tuple[0]);
        }
      }
    }
  }
  proceduresNoReturn.sort(Blockly.caseInsensitiveComparator);
  proceduresReturn.sort(Blockly.caseInsensitiveComparator);
  return [proceduresNoReturn, proceduresReturn];*/
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Wiring.flyoutCategory = function(blocks, gaps, margin, workspace) {
    var block = new Blockly.Block(workspace, 'nop');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);


/*  if (Blockly.Language.procedures_defnoreturn) {
    var block = new Blockly.Block(workspace, 'procedures_defnoreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }
  if (Blockly.Language.procedures_defreturn) {
    var block = new Blockly.Block(workspace, 'procedures_defreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }

  var tuple = Blockly.Procedures.allProcedures();
  var proceduresNoReturn = tuple[0];
  var proceduresReturn = tuple[1];
  if (Blockly.Language.procedures_callnoreturn) {
    for (var x = 0; x < proceduresNoReturn.length; x++) {
      var block = new Blockly.Block(workspace, 'procedures_callnoreturn');
      block.setTitleText(proceduresNoReturn[x], 'NAME');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }
  if (Blockly.Language.procedures_callreturn) {
    for (var x = 0; x < proceduresReturn.length; x++) {
      var block = new Blockly.Block(workspace, 'procedures_callreturn');
      block.setTitleText(proceduresReturn[x], 'NAME');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }*/
};

/**
 * Refresh the procedure flyout if it is open.
 * Only used if the flyout's autoClose is false.
 */
Blockly.Wiring.refreshFlyoutCategory = function() {
/*  if (Blockly.Toolbox && Blockly.Toolbox.flyout_.isVisible() && Blockly.Toolbox.selectedOption_ &&
      Blockly.Toolbox.selectedOption_.cat == Blockly.MSG_PROCEDURE_CATEGORY) {
    Blockly.Toolbox.flyout_.hide();
    Blockly.Toolbox.flyout_.show(Blockly.MSG_PROCEDURE_CATEGORY);
  }*/
};

/**
 * When a procedure definition is destroyed, find and destroy all its callers.
 * @param {string} name Name of deleted procedure definition.
 * @param {!Blockly.Workspace} workspace The workspace to delete callers from.
 */
Blockly.Wiring.destroyCallers = function(name, workspace) {
/*  name = name.toLowerCase();
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getProcedureCall;
    if (func) {
      var procName = func.call(blocks[x]);
      // Procedure name may be null if the block is only half-built.
      if (procName && procName.toLowerCase() == name) {
        blocks[x].destroy(true);
      }
    }
  }
  window.setTimeout(Blockly.Procedures.refreshFlyoutCategory, 1);*/
};
