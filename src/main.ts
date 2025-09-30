import * as vscode from "vscode";

const WHEN_CMD = "relativeMoveInputRead";

const READ_CMD = "relative-move.readInput";
const CANCEL_READ_CMD = "relative-move.cancelReadInput";
const MOVE_UP_CMD = "relative-move.moveUp";
const MOVE_DOWN_CMD = "relative-move.moveDown";

let number = "";
let isInput = false;
let isStatus: vscode.StatusBarItem;

function status() {
  if (!isStatus) return;

  if (isInput) {
    isStatus.text = `Move: ${number || "…"}`;
    isStatus.show();
  } else {
    isStatus.hide();
  }
}

async function moveCursor(direction: "up" | "down") {
  const count = parseInt(number || "1", 10);
  number = "";
  isInput = false;
  status();

  vscode.commands.executeCommand("setContext", WHEN_CMD, false);

  await vscode.commands.executeCommand("cursorMove", {
    to: direction,
    by: "line",
    value: count,
  });
}

export function activate(context: vscode.ExtensionContext) {
  isStatus = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  context.subscriptions.push(isStatus);

  context.subscriptions.push(
    vscode.commands.registerCommand(READ_CMD, () => {
      number = "";
      isInput = true;
      status();
      vscode.commands.executeCommand("setContext", WHEN_CMD, isInput);
    })
  );

  for (let i = 0; i <= 9; i++) {
    context.subscriptions.push(
      vscode.commands.registerCommand(`relative-move.type${i}`, () => {
        if (isInput) {
          number += i.toString();
          status();
        } else {
          vscode.commands.executeCommand("default:type", {
            text: i.toString(),
          });
        }
      })
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(MOVE_UP_CMD, () => moveCursor("up"))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(MOVE_DOWN_CMD, () => moveCursor("down"))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CANCEL_READ_CMD, () => deactivate())
  );
}

function deactivate() {
  if (!isInput) return;

  number = "";
  isInput = false;
  status();

  vscode.commands.executeCommand("setContext", WHEN_CMD, false);
}
