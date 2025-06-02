// src/apps/Logger/Logger.jsx

import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect,
  } from "react";
  import { useStateManager } from "../../../../stores/StateManager/StateManager.jsx";
  import {
    getRegisteredComponents,
    getRegisteredGroups,
    isComponentMuted,
    isGroupMuted,
    muteComponent,
    unmuteComponent,
    muteGroup,
    unmuteGroup,
    getMutedComponents,
    getMutedGroups,
  } from "../../../../components/Logger/Logger.jsx";
  

  const LoggerTerminal = forwardRef(({ output, setAutocompleteCommands }, ref) => {
    const { state, editStateValue } = useStateManager();
  
    // Always read the current global logsEnabled from state manager
    const logsEnabledGlobal =
      state &&
      state.groups &&
      state.groups.developer &&
      state.groups.developer.logsenabled === "true";
  
    // Helper to write a line to terminal
    const writeln = (msg = "") => {
      if (output?.current?.writeln) {
        output.current.writeln(msg);
      }
    };
  
    // Show welcome message once
    useEffect(() => {
      if (output?.current?.writeln) {
        writeln("Welcome to Logger Terminal.");
        writeln("");
        writeln('Type "help" to list available commands.');
        writeln("");
      }
    }, [output]);
  
    /**
     * processInput:
     *   Parses and runs a command. Commands supported:
     *
     *   help
     *   status
     *   listcomponents
     *   listgroups <componentName>
     *   listmuted
     *   mute component <componentName>
     *   unmute component <componentName>
     *   mute group <componentName> <groupName>
     *   unmute group <componentName> <groupName>
     *   set logs <on/off>
     */
    const processInput = (input) => {
      const trimmed = input.trim();
      if (!trimmed) return;
      const tokens = trimmed.split(/\s+/);
      const cmd = tokens[0].toLowerCase();
  
      if (cmd === "help") {
        const boxWidth = 70;
        // Build top and bottom borders
        const topBorder = `+${'-'.repeat(boxWidth - 2)}+`;
        const bottomBorder = topBorder;
  
        // Padding helper
        const padLine = (text = "") => {
          const content = text.slice(0, boxWidth - 4);
          const padding = ' '.repeat(boxWidth - 4 - content.length);
          return `| ${content}${padding} |`;
        };
  
        const lines = [];
        lines.push(topBorder);
        lines.push(padLine("Available Commands"));
        lines.push(topBorder);
  
        lines.push(padLine("  • status"));
        lines.push(padLine("      Show global status & muted lists."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • listcomponents"));
        lines.push(padLine("      List all registered components."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • listgroups <componentName>"));
        lines.push(padLine("      List groups under a component."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • listmuted"));
        lines.push(padLine("      Show muted components & groups."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • mute component <componentName>"));
        lines.push(padLine("      Mute all logs for a component."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • unmute component <componentName>"));
        lines.push(padLine("      Unmute a component."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • mute group <componentName> <groupName>"));
        lines.push(padLine("      Mute logs for a specific group."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • unmute group <componentName> <groupName>"));
        lines.push(padLine("      Unmute a specific group."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • set logs <on/off>"));
        lines.push(padLine("      Toggle global logging."));
        lines.push(padLine(""));
  
        lines.push(padLine("  • help"));
        lines.push(padLine("      Show this help."));
        lines.push(bottomBorder);
  
        lines.forEach((l) => writeln(l));
        writeln("");
        return;
      }
  
      if (cmd === "status") {
        writeln("");
        writeln("Global Logging Status");
        writeln("─────────────────────");
        writeln(`  • Enabled: ${logsEnabledGlobal ? "true" : "false"}`);
        writeln("");
        const mutedComps = getMutedComponents();
        if (mutedComps.length === 0) {
          writeln("  • No components are fully muted.");
        } else {
          writeln("  • Muted components:");
          mutedComps.forEach((c) => writeln(`      – ${c}`));
        }
        writeln("");
        const allComps = getRegisteredComponents();
        allComps.forEach((comp) => {
          const mg = getMutedGroups(comp);
          if (mg.length > 0) {
            writeln(`  • Component "${comp}" muted groups:`);
            mg.forEach((g) => writeln(`      – ${g}`));
          }
        });
        writeln("");
        return;
      }
  
      if (cmd === "listcomponents") {
        writeln("");
        const comps = getRegisteredComponents();
        if (comps.length === 0) {
          writeln("No components have logged anything yet.");
        } else {
          writeln("Registered Components:");
          comps.forEach((c) => writeln(`  • ${c}`));
        }
        writeln("");
        return;
      }
  
      if (cmd === "listgroups") {
        writeln("");
        if (tokens.length < 2) {
          writeln("Usage: listgroups <componentName>");
          writeln("");
          return;
        }
        const compName = tokens[1];
        const groups = getRegisteredGroups(compName);
        if (!groups || groups.length === 0) {
          writeln(`No groups found for component "${compName}".`);
        } else {
          writeln(`Groups under "${compName}":`);
          groups.forEach((g) => writeln(`  • ${g}`));
        }
        writeln("");
        return;
      }
  
      if (cmd === "listmuted") {
        writeln("");
        const compsMuted = getMutedComponents();
        if (compsMuted.length === 0) {
          writeln("No components are fully muted.");
        } else {
          writeln("Muted Components:");
          compsMuted.forEach((c) => writeln(`  • ${c}`));
        }
        writeln("");
        const allComps = getRegisteredComponents();
        let anyMutedGroup = false;
        allComps.forEach((comp) => {
          const mg = getMutedGroups(comp);
          if (mg.length > 0) {
            if (!anyMutedGroup) {
              writeln("Muted Groups:");
              anyMutedGroup = true;
            }
            mg.forEach((g) => writeln(`  • ${comp} / ${g}`));
          }
        });
        if (!anyMutedGroup) {
          writeln("No groups are muted under any component.");
        }
        writeln("");
        return;
      }
  
      // Mute / Unmute Component
      if ((cmd === "mute" || cmd === "unmute") && tokens[1] === "component") {
        writeln("");
        if (tokens.length < 3) {
          writeln(`Usage: ${cmd} component <componentName>`);
          writeln("");
          return;
        }
        const compName = tokens[2];
        const allComps = getRegisteredComponents();
        if (!allComps.includes(compName)) {
          writeln(`Component "${compName}" is not registered.`);
          writeln("");
          return;
        }
        if (cmd === "mute") {
          muteComponent(compName);
          writeln(`Component "${compName}" is now muted.`);
        } else {
          unmuteComponent(compName);
          writeln(`Component "${compName}" is now unmuted.`);
        }
        writeln("");
        return;
      }
  
      // Mute / Unmute Group
      if ((cmd === "mute" || cmd === "unmute") && tokens[1] === "group") {
        writeln("");
        if (tokens.length < 4) {
          writeln(`Usage: ${cmd} group <componentName> <groupName>`);
          writeln("");
          return;
        }
        const compName = tokens[2];
        const groupName = tokens[3];
        const groups = getRegisteredGroups(compName);
        if (!groups.includes(groupName)) {
          writeln(`Group "${groupName}" is not registered under "${compName}".`);
          writeln("");
          return;
        }
        if (cmd === "mute") {
          muteGroup(compName, groupName);
          writeln(`Group "${groupName}" under "${compName}" is now muted.`);
        } else {
          unmuteGroup(compName, groupName);
          writeln(`Group "${groupName}" under "${compName}" is now unmuted.`);
        }
        writeln("");
        return;
      }
  
      // set logs <on/off>
      if (cmd === "set" && tokens[1] === "logs") {
        writeln("");
        if (tokens.length < 3) {
          writeln('Usage: set logs <on/off>');
          writeln("");
          return;
        }
        const val = tokens[2].toLowerCase();
        if (val !== "on" && val !== "off") {
          writeln('Invalid value for logs. Use "on" or "off".');
          writeln("");
          return;
        }
        const newVal = val === "on" ? "true" : "false";
        editStateValue("developer", "logsenabled", newVal);
        writeln(`Global logging is now ${val === "on" ? "ENABLED" : "DISABLED"}.`);
        writeln("");
        return;
      }
  
      writeln("");
      writeln('Unknown command. Type "help" to list available commands.');
      writeln("");
    };
  
    /**
     * getAutocompleteSuggestions(input: string):
     *   Returns an array of possible completions based on current input.
     */
    const getAutocompleteSuggestions = (input) => {
      const trimmedInput = input.trim();
      const tokens = trimmedInput.split(/\s+/);
  
      const staticCommands = [
        "status",
        "listcomponents",
        "listgroups",
        "listmuted",
        "mute component",
        "unmute component",
        "mute group",
        "unmute group",
        "set logs",
        "help",
      ];
  
      // If typing first token, suggest matching static commands
      if (tokens.length === 1) {
        const partial = tokens[0].toLowerCase();
        return staticCommands.filter((cmd) => cmd.startsWith(partial));
      }
  
      const cmd = tokens[0].toLowerCase();
      // Suggest component names for appropriate commands
      if (
        (cmd === "listgroups" && tokens.length === 2) ||
        ((cmd === "mute" || cmd === "unmute") &&
          tokens[1] === "component" &&
          tokens.length === 3) ||
        ((cmd === "mute" || cmd === "unmute") &&
          tokens[1] === "group" &&
          tokens.length === 3)
      ) {
        const partialComp = tokens[tokens.length - 1].toLowerCase();
        const comps = getRegisteredComponents();
        return comps.filter((c) => c.toLowerCase().startsWith(partialComp));
      }
  
      // Suggest group names for mute/unmute group commands
      if (
        (cmd === "mute" || cmd === "unmute") &&
        tokens[1] === "group" &&
        tokens.length === 4
      ) {
        const compName = tokens[2];
        const partialGroup = tokens[3].toLowerCase();
        const groups = getRegisteredGroups(compName);
        return groups.filter((g) => g.toLowerCase().startsWith(partialGroup));
      }
  
      // Suggest "on"/"off" for set logs
      if (cmd === "set" && tokens[1] === "logs" && tokens.length === 3) {
        const partialVal = tokens[2].toLowerCase();
        return ["on", "off"].filter((v) => v.startsWith(partialVal));
      }
  
      return [];
    };
  
    // Register static autocomplete commands on mount
    useEffect(() => {
      if (setAutocompleteCommands) {
        setAutocompleteCommands([
          "status",
          "listcomponents",
          "listgroups",
          "listmuted",
          "mute component",
          "unmute component",
          "mute group",
          "unmute group",
          "set logs",
          "help",
        ]);
      }
    }, [setAutocompleteCommands]);
  
    // Clear autocomplete commands on unmount
    useEffect(() => {
      return () => {
        if (setAutocompleteCommands) {
          setAutocompleteCommands([]);
        }
      };
    }, [setAutocompleteCommands]);
  
    // Expose processInput and getAutocompleteSuggestions via ref
    useImperativeHandle(ref, () => ({
      processInput,
      getAutocompleteSuggestions,
    }));
  
    return (
      <div className="logger-terminal">
        <h3>Logger Terminal</h3>
  
        <div className="logger-terminal-info">
          <p>
            Global logging:{" "}
            <strong>{logsEnabledGlobal ? "ENABLED" : "DISABLED"}</strong>
          </p>
  
          <p>
            Toggle with: <code>set logs &lt;on/off&gt;</code>
          </p>
        </div>
      </div>
    );
  });
  
  export default LoggerTerminal;
  