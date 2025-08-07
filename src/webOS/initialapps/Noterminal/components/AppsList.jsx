// src/configs/AppsList.jsx

/* ====================================================
   Area 1: Imports
   ==================================================== */

// 1.1: Import application components
import Help from "../apps/Help/Help.jsx";
import TerminalSettingsEditor from "../apps/TerminalSettingsEditor/TerminalSettingsEditor";
import StateEditor from "../apps/StateEditor/StateEditor";
import LoggerTerminal from "../apps/Logger/LoggerTerminal";

/* ====================================================
   Area 2: Apps Array
   ==================================================== */

export const apps = [
  // 2.1: Help app invoked by "help", lists all commands
  {
    name: "help",
    description: "List available commands with their descriptions.",
    commands: ["help"],
    component: Help,
  },
  {
    name: "Terminal Settings Editor",
    description: "Edit terminal font, color, and design settings.",
    commands: ["tse"],
    component: TerminalSettingsEditor,
  },
  {
    name: "State Editor",
    description: "Edit states and state groups.",
    commands: ["stedit"],
    component: StateEditor,
  },
  {
    name: "Logger",
    description: "Inspect and control the logs",
    commands: ["logger", "logapp"],
    component: LoggerTerminal,
  },
];
