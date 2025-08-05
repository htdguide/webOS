// Wherever your AppsList is defined (e.g., src/configs/AppsList.jsx or similar),
// add the Logger terminal entry. Example:

import StateEditor from "../apps/StateEditor/StateEditor";
import TerminalSettingsEditor from "../apps/TerminalSettingsEditor/TerminalSettingsEditor";
import LoggerTerminal from "../apps/Logger/LoggerTerminal";

export const apps = [
  {
    name: "Terminal Settings Editor",
    description: "Edit terminal font, color, and design settings.",
    commands: ["terminal settings editor", "tse"],
    component: TerminalSettingsEditor,
  },
  {
    name: "State Editor",
    description: "Edit states and state groups.",
    commands: ["state editor", "stedit"],
    component: StateEditor,
  },
  {
    name: "Logger",
    description: "Inspect and control the logger—view registered components/groups, mute/unmute, toggle global logging.",
    commands: ["logger", "logapp"],
    component: LoggerTerminal,
  },
];
