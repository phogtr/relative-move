import * as vscode from "vscode";

const WHEN_CMD = "relativeMoveInputRead";

const MOVE_CMD = "relative-move.moveInput";
const SELECT_CMD = "relative-move.moveAndSelectInput";

const CANCEL_READ_CMD = "relative-move.cancelReadInput";
const MOVE_UP_CMD = "relative-move.moveUp";
const MOVE_DOWN_CMD = "relative-move.moveDown";

enum Mode {
  move = "Move",
  select = "Select",
}

let number = "";
let isInput = false;
let isSelect = false;
let isStatus: vscode.StatusBarItem;

function updateStatus(mode: Mode | null) {
  if (!isStatus) return;

  if (isInput || isSelect) {
    isStatus.text = `${mode}: ${number || "…"}`;
    isStatus.show();
  } else {
    isStatus.hide();
  }
}

async function moveCursor(direction: "up" | "down", withSelect: boolean) {
  const count = parseInt(number || "1", 10);

  deactivate(); // reset after cursor moved

  vscode.commands.executeCommand("setContext", WHEN_CMD, false);

  await vscode.commands.executeCommand("cursorMove", {
    to: direction,
    by: "line",
    value: withSelect ? count + 1 : count,
    select: withSelect,
  });
}

export function activate(context: vscode.ExtensionContext) {
  isStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  context.subscriptions.push(isStatus);

  // only move
  context.subscriptions.push(
    vscode.commands.registerCommand(MOVE_CMD, () => {
      number = "";
      isInput = true;
      isSelect = false;
      updateStatus(Mode.move);
      vscode.commands.executeCommand("setContext", WHEN_CMD, true);
    })
  );

  // move and select
  context.subscriptions.push(
    vscode.commands.registerCommand(SELECT_CMD, () => {
      number = "";
      isInput = false;
      isSelect = true;
      updateStatus(Mode.select);
      vscode.commands.executeCommand("setContext", WHEN_CMD, true);
    })
  );

  for (let i = 0; i <= 9; i++) {
    context.subscriptions.push(
      vscode.commands.registerCommand(`relative-move.type${i}`, () => {
        if (isInput || isSelect) {
          number += i.toString();
          updateStatus(isSelect ? Mode.select : Mode.move);
        } else {
          vscode.commands.executeCommand("default:type", {
            text: i.toString(),
          });
        }
      })
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(MOVE_UP_CMD, () =>
      moveCursor("up", isSelect)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(MOVE_DOWN_CMD, () =>
      moveCursor("down", isSelect)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CANCEL_READ_CMD, () => deactivate())
  );
}

function deactivate() {
  number = "";
  isInput = false;
  isSelect = false;
  updateStatus(null);

  vscode.commands.executeCommand("setContext", WHEN_CMD, false);
}
