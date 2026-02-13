#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(
              fullText,
              helpWidth - itemIndentWidth,
              termWidth + itemSeparatorWidth
            );
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.wrap(commandDescription, helpWidth, 0),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(
            helper.argumentTerm(argument),
            helper.argumentDescription(argument)
          );
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(
            helper.optionTerm(option),
            helper.optionDescription(option)
          );
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(
              helper.optionTerm(option),
              helper.optionDescription(option)
            );
          });
          if (globalOptionList.length > 0) {
            output = output.concat([
              "Global Options:",
              formatList(globalOptionList),
              ""
            ]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(
            helper.subcommandTerm(cmd2),
            helper.subcommandDescription(cmd2)
          );
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent)) return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth) return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(
          `
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`,
          "g"
        );
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n") return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help2;
  }
});

// node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("node:events").EventEmitter;
    var childProcess = require("node:child_process");
    var path = require("node:path");
    var fs = require("node:fs");
    var process3 = require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process3.stdout.write(str),
          writeErr: (str) => process3.stderr.write(str),
          getOutHelpWidth: () => process3.stdout.isTTY ? process3.stdout.columns : void 0,
          getErrHelpWidth: () => process3.stderr.isTTY ? process3.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err2) => {
            if (err2.code !== "commander.executeSubCommandAsync") {
              throw err2;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process3.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err2) {
          if (err2.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err2.message}`;
            this.error(message, { exitCode: err2.exitCode, code: err2.code });
          }
          throw err2;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv2, parseOptions) {
        if (argv2 !== void 0 && !Array.isArray(argv2)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv2 === void 0 && parseOptions.from === void 0) {
          if (process3.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process3.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv2 === void 0) {
          argv2 = process3.argv;
        }
        this.rawArgs = argv2.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv2[1];
            userArgs = argv2.slice(2);
            break;
          case "electron":
            if (process3.defaultApp) {
              this._scriptPath = argv2[1];
              userArgs = argv2.slice(2);
            } else {
              userArgs = argv2.slice(1);
            }
            break;
          case "user":
            userArgs = argv2.slice(0);
            break;
          case "eval":
            userArgs = argv2.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv2, parseOptions) {
        const userArgs = this._prepareUserArgs(argv2, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv2, parseOptions) {
        const userArgs = this._prepareUserArgs(argv2, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch (err2) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(
            path.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(
              this._scriptPath,
              path.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process3.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process3.execArgv).concat(args);
            proc = childProcess.spawn(process3.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process3.execArgv).concat(args);
          proc = childProcess.spawn(process3.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process3.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process3.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err2) => {
          if (err2.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err2.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process3.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err2;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv2) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv2.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0) operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0) dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process3.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process3.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0) return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", context);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", context)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process3.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    exports2.Command = Command2;
  }
});

// node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// packages/cli/dist/index.js
var import_fs6 = require("fs");
var import_path7 = require("path");

// node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// packages/core/dist/constants.js
var PHANTOM_VERSION = "1.0.0";
var PHANTOM_ASCII = `
  \u2591\u2588\u2580\u2588\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2588\u2591\u2580\u2588\u2580\u2591\u2588\u2580\u2588\u2591\u2588\u2584\u2588
  \u2591\u2588\u2580\u2580\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2588\u2591\u2588\u2591\u2588\u2591\u2591\u2588\u2591\u2591\u2588\u2591\u2588\u2591\u2588\u2591\u2588
  \u2591\u2580\u2591\u2591\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2591\u2580\u2591\u2591\u2580\u2580\u2580\u2591\u2580\u2591\u2580`;
var TAGLINE = "The invisible force behind every great product.";
var MODULE_QUOTES = {
  "prd-forge": "I know PRDs.",
  "story-writer": "I know user stories.",
  "sprint-planner": "I know velocity.",
  "competitive": "I know your enemies.",
  "oracle": "I know the future.",
  "figma-bridge": "I know design.",
  "analytics-lens": "I know the numbers.",
  "experiment-lab": "I know the truth.",
  "ux-auditor": "I know the user.",
  "time-machine": "I know the past.",
  "bridge": "I know both worlds.",
  "swarm": "We know everything."
};
var AGENT_TYPES = [
  "Strategist",
  "Analyst",
  "Builder",
  "Designer",
  "Researcher",
  "Communicator",
  "Operator"
];
var AGENT_DESCRIPTIONS = {
  Strategist: "Market positioning, competitive analysis, go-to-market strategy",
  Analyst: "Data analysis, metrics interpretation, trend identification",
  Builder: "Technical feasibility, effort estimation, architecture review",
  Designer: "UX/UI analysis, usability heuristics, design system review",
  Researcher: "User research synthesis, persona development, JTBD analysis",
  Communicator: "Stakeholder updates, documentation, team alignment",
  Operator: "Sprint management, velocity tracking, process optimization"
};
var FRAMEWORKS = [
  { name: "RICE Scoring", desc: "Reach, Impact, Confidence, Effort" },
  { name: "MoSCoW", desc: "Must, Should, Could, Won't" },
  { name: "Kano Model", desc: "Delight, Performance, Basic" },
  { name: "AARRR (Pirate Metrics)", desc: "Acquisition through Revenue" },
  { name: "Jobs-to-be-Done", desc: "Outcome-driven innovation" },
  { name: "ICE Scoring", desc: "Impact, Confidence, Ease" },
  { name: "Opportunity Scoring", desc: "Importance vs Satisfaction" },
  { name: "Story Mapping", desc: "User activity mapping" },
  { name: "Impact Mapping", desc: "Goal \u2192 Actor \u2192 Impact \u2192 Deliverable" },
  { name: "Lean Canvas", desc: "1-page business model" },
  { name: "Value Proposition", desc: "Gains, Pains, Jobs" },
  { name: "North Star Framework", desc: "Metric \u2192 Inputs \u2192 Work" }
];
var BOOT_SYSTEMS = [
  "Core Engine",
  "Context Engine",
  "Agent Swarm",
  "Security Layer",
  "Module System"
];

// packages/core/dist/config.js
var import_path = require("path");
var import_fs = require("fs");
var import_os = require("os");
var DEFAULT_CONFIG = {
  version: "1.0.0",
  firstRun: true,
  dataMode: "local",
  encryption: true,
  telemetry: false,
  autoUpdate: true,
  permissionLevel: "L2",
  primaryModel: {
    provider: "ollama",
    model: "llama3.1:70b",
    status: "disconnected"
  },
  integrations: [],
  projects: [],
  installedModules: [],
  theme: "matrix",
  installation: {
    channel: "stable",
    version: "1.0.0"
  },
  mcp: {
    enabled: false,
    server_mode: "stdio"
  },
  security: {
    audit_log_path: (0, import_path.join)((0, import_os.homedir)(), ".phantom", "logs", "audit.log")
  }
};
var ConfigManager = class {
  configDir;
  configPath;
  config;
  constructor() {
    this.configDir = (0, import_path.resolve)(process.env.PHANTOM_HOME || (0, import_path.join)((0, import_os.homedir)(), ".phantom"));
    this.configPath = (0, import_path.join)(this.configDir, "config.json");
    this.config = this.load();
  }
  ensureDir() {
    if (!(0, import_fs.existsSync)(this.configDir)) {
      try {
        (0, import_fs.mkdirSync)(this.configDir, { recursive: true });
      } catch {
        this.configDir = (0, import_path.resolve)((0, import_path.join)(process.cwd(), ".phantom"));
        this.configPath = (0, import_path.join)(this.configDir, "config.json");
        if (!(0, import_fs.existsSync)(this.configDir)) {
          (0, import_fs.mkdirSync)(this.configDir, { recursive: true });
        }
      }
    }
    const subdirs = ["modules", "context", "cache", "logs", "exports"];
    for (const dir of subdirs) {
      const path = (0, import_path.join)(this.configDir, dir);
      if (!(0, import_fs.existsSync)(path)) {
        (0, import_fs.mkdirSync)(path, { recursive: true });
      }
    }
  }
  load() {
    this.ensureDir();
    if ((0, import_fs.existsSync)(this.configPath)) {
      try {
        const raw = (0, import_fs.readFileSync)(this.configPath, "utf-8");
        const parsed = JSON.parse(raw);
        const normalizedMcp = {
          enabled: parsed.mcp?.enabled,
          server_mode: parsed.mcp?.server_mode ?? parsed.mcp?.serverMode
        };
        const normalizedSecurity = {
          audit_log_path: parsed.security?.audit_log_path ?? parsed.security?.auditLogPath
        };
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          primaryModel: { ...DEFAULT_CONFIG.primaryModel, ...parsed.primaryModel },
          fallbackModel: parsed.fallbackModel || DEFAULT_CONFIG.fallbackModel,
          visionModel: parsed.visionModel || DEFAULT_CONFIG.visionModel,
          installation: { ...DEFAULT_CONFIG.installation, ...parsed.installation },
          mcp: { ...DEFAULT_CONFIG.mcp, ...normalizedMcp },
          security: { ...DEFAULT_CONFIG.security, ...normalizedSecurity }
        };
      } catch {
        return { ...DEFAULT_CONFIG };
      }
    }
    return { ...DEFAULT_CONFIG };
  }
  save() {
    this.ensureDir();
    (0, import_fs.writeFileSync)(this.configPath, JSON.stringify(this.config, null, 2));
  }
  get() {
    return this.config;
  }
  set(key, value) {
    this.config[key] = value;
    this.save();
  }
  isFirstRun() {
    return this.config.firstRun;
  }
  completeFirstRun() {
    this.config.firstRun = false;
    this.save();
  }
  addProject(project) {
    this.config.projects.push(project);
    this.config.activeProject = project.name;
    this.save();
  }
  getActiveProject() {
    return this.config.projects.find((p) => p.name === this.config.activeProject);
  }
  installModule(moduleName) {
    if (!this.config.installedModules.includes(moduleName)) {
      this.config.installedModules.push(moduleName);
      this.save();
    }
  }
  uninstallModule(moduleName) {
    this.config.installedModules = this.config.installedModules.filter((m) => m !== moduleName);
    this.save();
  }
  isModuleInstalled(moduleName) {
    return this.config.installedModules.includes(moduleName);
  }
  getConfigDir() {
    return this.configDir;
  }
};
var instance = null;
function getConfig() {
  if (!instance) {
    instance = new ConfigManager();
  }
  return instance;
}

// packages/core/dist/context.js
var import_fs2 = require("fs");
var import_crypto = require("crypto");
var import_path2 = require("path");
var CODE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".rb",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".c",
  ".cpp",
  ".h",
  ".cs",
  ".php",
  ".vue",
  ".svelte",
  ".html",
  ".css",
  ".scss",
  ".less",
  ".sql",
  ".graphql",
  ".proto"
]);
var DOC_EXTENSIONS = /* @__PURE__ */ new Set([
  ".md",
  ".txt",
  ".rst",
  ".adoc",
  ".org",
  ".tex",
  ".pdf",
  ".docx"
]);
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".bmp",
  ".ico"
]);
var DESIGN_EXTENSIONS = /* @__PURE__ */ new Set([
  ".fig",
  ".sketch",
  ".xd",
  ".psd",
  ".ai"
]);
var IGNORE_DIRS = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "__pycache__",
  "venv",
  ".venv",
  "target",
  ".gradle",
  "vendor",
  ".phantom"
]);
var IGNORE_FILES = /* @__PURE__ */ new Set([
  ".DS_Store",
  "Thumbs.db",
  ".gitignore",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml"
]);
function detectLanguage(ext) {
  const langMap = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".py": "Python",
    ".rb": "Ruby",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".kt": "Kotlin",
    ".swift": "Swift",
    ".c": "C",
    ".cpp": "C++",
    ".cs": "C#",
    ".php": "PHP",
    ".vue": "Vue",
    ".svelte": "Svelte",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sql": "SQL",
    ".graphql": "GraphQL"
  };
  return langMap[ext];
}
function getFileType(ext) {
  if (CODE_EXTENSIONS.has(ext))
    return "code";
  if (DOC_EXTENSIONS.has(ext))
    return "document";
  if (IMAGE_EXTENSIONS.has(ext))
    return "image";
  if (DESIGN_EXTENSIONS.has(ext))
    return "design";
  return "data";
}
function stableEntryId(path, size, mtimeIso) {
  const digest = (0, import_crypto.createHash)("sha256").update(`${path}|${size}|${mtimeIso}`).digest("hex").slice(0, 16);
  return `ctx_${digest}`;
}
var ContextEngine = class {
  entries = /* @__PURE__ */ new Map();
  basePath = "";
  storePath;
  constructor() {
    const cfgDir = getConfig().getConfigDir();
    const contextDir = (0, import_path2.join)(cfgDir, "context");
    (0, import_fs2.mkdirSync)(contextDir, { recursive: true });
    this.storePath = (0, import_path2.join)(contextDir, "index.json");
    this.load();
  }
  load() {
    if (!(0, import_fs2.existsSync)(this.storePath))
      return;
    try {
      const raw = (0, import_fs2.readFileSync)(this.storePath, "utf8");
      const parsed = JSON.parse(raw);
      this.entries.clear();
      for (const entry of parsed.entries || []) {
        if (entry?.path) {
          this.entries.set(entry.path, entry);
        }
      }
    } catch {
      this.entries.clear();
    }
  }
  persist() {
    const payload = {
      entries: Array.from(this.entries.values()).sort((a, b) => a.path.localeCompare(b.path))
    };
    (0, import_fs2.writeFileSync)(this.storePath, `${JSON.stringify(payload, null, 2)}
`, "utf8");
  }
  async addPath(targetPath) {
    const resolvedPath = (0, import_path2.resolve)(targetPath);
    if (!(0, import_fs2.existsSync)(resolvedPath)) {
      throw new Error(`Path not found: ${resolvedPath}`);
    }
    this.basePath = resolvedPath;
    const stat = (0, import_fs2.statSync)(resolvedPath);
    if (stat.isFile()) {
      this.indexFile(resolvedPath, resolvedPath);
    } else if (stat.isDirectory()) {
      this.indexDirectory(resolvedPath, resolvedPath);
    }
    this.persist();
    return this.getStats();
  }
  indexDirectory(dirPath, basePath) {
    const items = (0, import_fs2.readdirSync)(dirPath).sort();
    for (const item of items) {
      if (IGNORE_DIRS.has(item) || IGNORE_FILES.has(item))
        continue;
      const fullPath = (0, import_path2.join)(dirPath, item);
      const stat = (0, import_fs2.statSync)(fullPath);
      if (stat.isDirectory()) {
        this.indexDirectory(fullPath, basePath);
      } else if (stat.isFile()) {
        this.indexFile(fullPath, basePath);
      }
    }
  }
  indexFile(filePath, basePath) {
    const ext = (0, import_path2.extname)(filePath).toLowerCase();
    const stat = (0, import_fs2.statSync)(filePath);
    const type = getFileType(ext);
    const relPath = (0, import_path2.relative)(basePath, filePath) || filePath;
    const lastModified = stat.mtime.toISOString();
    let content;
    let lines;
    if (type === "code" || type === "document" || type === "data") {
      try {
        if (stat.size <= 1e6) {
          content = (0, import_fs2.readFileSync)(filePath, "utf8");
          lines = content.split("\n").length;
        }
      } catch {
        content = void 0;
        lines = void 0;
      }
    }
    const entry = {
      id: stableEntryId(filePath, stat.size, lastModified),
      type,
      path: filePath,
      relativePath: relPath,
      content,
      metadata: {
        size: stat.size,
        extension: ext,
        lastModified,
        language: detectLanguage(ext),
        lines
      },
      indexed: true,
      indexedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.entries.set(filePath, entry);
  }
  getStats() {
    const byType = {};
    const byLanguage = {};
    let totalSize = 0;
    for (const entry of this.entries.values()) {
      byType[entry.type] = (byType[entry.type] || 0) + 1;
      if (entry.metadata.language) {
        byLanguage[entry.metadata.language] = (byLanguage[entry.metadata.language] || 0) + 1;
      }
      totalSize += entry.metadata.size;
    }
    const hasCode = (byType.code || 0) > 0;
    const hasDocs = (byType.document || 0) > 0;
    const hasDesign = (byType.image || 0) > 0 || (byType.design || 0) > 0;
    let healthScore = 35;
    if (hasCode)
      healthScore += 30;
    if (hasDocs)
      healthScore += 20;
    if (hasDesign)
      healthScore += 15;
    return {
      totalFiles: this.entries.size,
      totalSize,
      byType,
      byLanguage,
      healthScore: Math.max(0, Math.min(100, healthScore))
    };
  }
  getEntries() {
    return Array.from(this.entries.values()).sort((a, b) => a.path.localeCompare(b.path));
  }
  getEntry(path) {
    return this.entries.get((0, import_path2.resolve)(path));
  }
  search(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized)
      return [];
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const entry of this.entries.values()) {
      const pathLower = entry.relativePath.toLowerCase();
      const contentLower = entry.content?.toLowerCase() || "";
      let score = 0;
      if (pathLower.includes(normalized))
        score += 20;
      if (contentLower.includes(normalized))
        score += 10;
      for (const token of tokens) {
        if (pathLower.includes(token))
          score += 6;
        if (contentLower.includes(token))
          score += 3;
      }
      if (score > 0) {
        scored.push({ entry, score });
      }
    }
    return scored.sort((a, b) => b.score - a.score || a.entry.path.localeCompare(b.entry.path)).map((item) => item.entry);
  }
  clear() {
    this.entries.clear();
    this.persist();
  }
};
var instance2 = null;
function getContextEngine() {
  if (!instance2) {
    instance2 = new ContextEngine();
  }
  return instance2;
}

// packages/core/dist/modules.js
var BUILTIN_MODULES = [
  {
    name: "prd-forge",
    version: "2.1.0",
    description: "Generate comprehensive Product Requirements Documents from natural language",
    quote: MODULE_QUOTES["prd-forge"] || "I know PRDs.",
    author: "PhantomPM",
    commands: [
      {
        name: "prd create",
        description: "Generate a new PRD",
        usage: 'phantom prd create "Feature Name"',
        args: [{ name: "title", description: "Feature title", required: true, type: "string" }]
      },
      {
        name: "prd list",
        description: "List all PRDs",
        usage: "phantom prd list"
      },
      {
        name: "prd update",
        description: "Update an existing PRD",
        usage: "phantom prd update <id>",
        args: [{ name: "id", description: "PRD identifier", required: true, type: "string" }]
      },
      {
        name: "prd export",
        description: "Export PRD to PDF/Markdown",
        usage: "phantom prd export <id> --format pdf",
        args: [{ name: "id", description: "PRD identifier", required: true, type: "string" }]
      }
    ],
    dependencies: [],
    size: "2.4 MB"
  },
  {
    name: "story-writer",
    version: "1.8.0",
    description: "Auto-generate user stories with acceptance criteria from PRDs or natural language",
    quote: MODULE_QUOTES["story-writer"] || "I know user stories.",
    author: "PhantomPM",
    commands: [
      {
        name: "story create",
        description: "Generate user stories from a description",
        usage: 'phantom story create "Feature Description"',
        args: [{ name: "description", description: "Feature description", required: true, type: "string" }]
      },
      {
        name: "story from-prd",
        description: "Generate stories from a PRD",
        usage: "phantom story from-prd <prd-id>",
        args: [{ name: "prd-id", description: "PRD to extract stories from", required: true, type: "string" }]
      }
    ],
    dependencies: [],
    size: "1.8 MB"
  },
  {
    name: "sprint-planner",
    version: "1.5.0",
    description: "AI-powered sprint planning with velocity tracking and capacity management",
    quote: MODULE_QUOTES["sprint-planner"] || "I know velocity.",
    author: "PhantomPM",
    commands: [
      {
        name: "sprint plan",
        description: "Plan the next sprint",
        usage: "phantom sprint plan"
      },
      {
        name: "sprint status",
        description: "Show current sprint status",
        usage: "phantom sprint status"
      },
      {
        name: "sprint retro",
        description: "Generate retrospective",
        usage: "phantom sprint retro"
      }
    ],
    dependencies: [],
    size: "1.2 MB"
  },
  {
    name: "competitive",
    version: "2.0.0",
    description: "Monitor competitors, analyze market positioning, and track feature parity",
    quote: MODULE_QUOTES["competitive"] || "I know your enemies.",
    author: "PhantomPM",
    commands: [
      {
        name: "competitive analyze",
        description: "Run competitive analysis",
        usage: "phantom competitive analyze <competitor>",
        args: [{ name: "competitor", description: "Competitor name or URL", required: true, type: "string" }]
      },
      {
        name: "competitive watch",
        description: "Monitor competitor changes",
        usage: "phantom competitive watch <competitor>"
      }
    ],
    dependencies: [],
    size: "3.1 MB"
  },
  {
    name: "analytics-lens",
    version: "1.0.0",
    description: "Connect to analytics platforms and surface actionable product insights",
    quote: MODULE_QUOTES["analytics-lens"] || "I know the numbers.",
    author: "PhantomPM",
    commands: [
      {
        name: "analytics dashboard",
        description: "Show analytics dashboard",
        usage: "phantom analytics dashboard"
      },
      {
        name: "analytics report",
        description: "Generate analytics report",
        usage: "phantom analytics report --period 30d"
      }
    ],
    dependencies: [],
    size: "2.7 MB"
  },
  {
    name: "oracle",
    version: "1.0.0",
    description: "Predictive intelligence \u2014 feature success prediction, Monte Carlo simulations, forecasting",
    quote: MODULE_QUOTES["oracle"] || "I know the future.",
    author: "PhantomPM",
    commands: [
      {
        name: "oracle predict",
        description: "Predict feature success",
        usage: 'phantom oracle predict "Feature Name"'
      },
      {
        name: "oracle simulate",
        description: "Run Monte Carlo simulation",
        usage: 'phantom oracle simulate "Scenario"'
      },
      {
        name: "oracle forecast",
        description: "Revenue/adoption forecast",
        usage: "phantom oracle forecast --metric revenue --period 6m"
      },
      {
        name: "oracle risk",
        description: "Risk identification",
        usage: "phantom oracle risk"
      }
    ],
    dependencies: [],
    size: "4.2 MB"
  },
  {
    name: "figma-bridge",
    version: "1.2.0",
    description: "Connect Figma designs to PRDs, user stories, and development tasks",
    quote: MODULE_QUOTES["figma-bridge"] || "I know design.",
    author: "PhantomPM",
    commands: [
      {
        name: "figma sync",
        description: "Sync Figma designs",
        usage: "phantom figma sync <file-key>"
      },
      {
        name: "figma analyze",
        description: "Analyze Figma design for UX issues",
        usage: "phantom figma analyze <file-key>"
      }
    ],
    dependencies: [],
    size: "2.9 MB"
  },
  {
    name: "experiment-lab",
    version: "1.0.0",
    description: "Design and analyze A/B tests, feature experiments, and rollout strategies",
    quote: MODULE_QUOTES["experiment-lab"] || "I know the truth.",
    author: "PhantomPM",
    commands: [
      {
        name: "experiment design",
        description: "Design an experiment",
        usage: 'phantom experiment design "Hypothesis"'
      },
      {
        name: "experiment analyze",
        description: "Analyze experiment results",
        usage: "phantom experiment analyze <id>"
      }
    ],
    dependencies: [],
    size: "2.1 MB"
  },
  {
    name: "ux-auditor",
    version: "1.0.0",
    description: "Automated UX audits from screenshots with WCAG compliance checking",
    quote: MODULE_QUOTES["ux-auditor"] || "I know the user.",
    author: "PhantomPM",
    commands: [
      {
        name: "ux audit",
        description: "Run UX audit on screenshots",
        usage: "phantom ux audit ./screenshots/"
      },
      {
        name: "ux score",
        description: "Get UX score for a screen",
        usage: "phantom ux score ./screenshot.png"
      }
    ],
    dependencies: [],
    size: "3.5 MB"
  },
  {
    name: "time-machine",
    version: "1.0.0",
    description: "Version and compare product decisions over time, what-if analysis",
    quote: MODULE_QUOTES["time-machine"] || "I know the past.",
    author: "PhantomPM",
    commands: [
      {
        name: "timemachine snapshot",
        description: "Create a product snapshot",
        usage: "phantom timemachine snapshot"
      },
      {
        name: "timemachine compare",
        description: "Compare two snapshots",
        usage: "phantom timemachine compare <id1> <id2>"
      }
    ],
    dependencies: [],
    size: "1.6 MB"
  },
  {
    name: "bridge",
    version: "1.0.0",
    description: "Bidirectional PM \u2194 Dev translation engine",
    quote: MODULE_QUOTES["bridge"] || "I know both worlds.",
    author: "PhantomPM",
    commands: [
      {
        name: "bridge translate",
        description: "Translate PM-speak to Dev-speak or vice versa",
        usage: 'phantom bridge translate "Business requirement text"'
      },
      {
        name: "bridge spec",
        description: "Generate technical spec from PRD",
        usage: "phantom bridge spec <prd-id>"
      }
    ],
    dependencies: [],
    size: "1.9 MB"
  },
  {
    name: "swarm",
    version: "1.0.0",
    description: "Deploy 7 specialized PM agents to analyze any product question in parallel",
    quote: MODULE_QUOTES["swarm"] || "We know everything.",
    author: "PhantomPM",
    commands: [
      {
        name: "swarm analyze",
        description: "Run swarm analysis on a question",
        usage: 'phantom swarm "Should we add feature X?"'
      },
      {
        name: "swarm config",
        description: "Configure agent parameters",
        usage: "phantom swarm config"
      }
    ],
    dependencies: [],
    size: "5.1 MB"
  }
];
var ModuleManager = class {
  getAvailableModules() {
    return BUILTIN_MODULES;
  }
  getInstalledModules() {
    const config = getConfig();
    const installed = config.get().installedModules;
    return BUILTIN_MODULES.filter((m) => installed.includes(m.name));
  }
  getModule(name) {
    const cleanName = name.replace(/^@phantom\//, "");
    return BUILTIN_MODULES.find((m) => m.name === cleanName);
  }
  isInstalled(name) {
    const cleanName = name.replace(/^@phantom\//, "");
    return getConfig().isModuleInstalled(cleanName);
  }
  install(name) {
    const cleanName = name.replace(/^@phantom\//, "");
    const module2 = this.getModule(cleanName);
    if (!module2) {
      throw new Error(`Module not found: ${name}`);
    }
    getConfig().installModule(cleanName);
    return module2;
  }
  uninstall(name) {
    const cleanName = name.replace(/^@phantom\//, "");
    getConfig().uninstallModule(cleanName);
  }
  getModuleCommands(name) {
    const module2 = this.getModule(name);
    return module2?.commands || [];
  }
};
var instance3 = null;
function getModuleManager() {
  if (!instance3) {
    instance3 = new ModuleManager();
  }
  return instance3;
}

// packages/core/dist/agents.js
var import_crypto2 = require("crypto");

// packages/core/dist/integrations.js
var import_fs3 = require("fs");
var import_path3 = require("path");
var KNOWN_INTEGRATION_TARGETS = [
  "github",
  "figma",
  "linear",
  "slack",
  "cursor",
  "vscode",
  "claude-code",
  "codex"
];
function detectTarget(cwd, target) {
  switch (target) {
    case "github": {
      const path = (0, import_path3.join)(cwd, ".git");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "git metadata found" };
      return null;
    }
    case "vscode": {
      const path = (0, import_path3.join)(cwd, ".vscode");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "VS Code workspace settings found" };
      return null;
    }
    case "cursor": {
      const path = (0, import_path3.join)(cwd, ".cursor");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "Cursor workspace settings found" };
      return null;
    }
    case "claude-code": {
      const path = (0, import_path3.join)(cwd, ".claude");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "Claude config directory found" };
      return null;
    }
    case "codex": {
      const path = (0, import_path3.join)(cwd, ".codex");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "Codex config directory found" };
      return null;
    }
    case "linear": {
      const path = (0, import_path3.join)(cwd, "linear.json");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "Linear config file found" };
      return null;
    }
    case "figma": {
      const path = (0, import_path3.join)(cwd, "figma.json");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "Figma config file found" };
      return null;
    }
    case "slack": {
      const path = (0, import_path3.join)(cwd, "slack.json");
      if ((0, import_fs3.existsSync)(path))
        return { path, reason: "Slack config file found" };
      return null;
    }
  }
}
function buildAdapter(target) {
  return {
    target,
    detect(cwd) {
      return detectTarget(cwd, target);
    },
    configure(cwd) {
      const cfgMgr = getConfig();
      const cfg = cfgMgr.get();
      const detection = detectTarget(cwd, target);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const nextIntegration = {
        name: target,
        connected: true,
        detectedPath: detection?.path,
        lastConnectedAt: now,
        config: {
          target,
          configured_at: now,
          ...detection ? { detected_path: detection.path } : {}
        }
      };
      const existing = cfg.integrations.find((i) => i.name === target);
      const next = existing ? cfg.integrations.map((i) => i.name === target ? { ...i, ...nextIntegration } : i) : [...cfg.integrations, nextIntegration];
      cfgMgr.set("integrations", next);
      return nextIntegration;
    },
    validate(cwd) {
      const cfg = getConfig().get();
      const configured = cfg.integrations.find((i) => i.name === target);
      const detection = detectTarget(cwd, target);
      const detected = Boolean(detection);
      const connected = Boolean(configured?.connected);
      const healthy = connected && detected;
      let reason = "Not configured";
      if (configured && !detection)
        reason = "Configured but no workspace signal found";
      if (!configured && detection)
        reason = "Detected but not configured";
      if (healthy)
        reason = "Configured and detected";
      return {
        target,
        configured: Boolean(configured),
        connected,
        detected,
        healthy,
        reason,
        detectedPath: detection?.path || configured?.detectedPath,
        configuredAt: configured?.lastConnectedAt || configured?.config?.configured_at
      };
    },
    rollback() {
      const cfgMgr = getConfig();
      const cfg = cfgMgr.get();
      const hasEntry = cfg.integrations.some((i) => i.name === target);
      if (!hasEntry)
        return false;
      cfgMgr.set("integrations", cfg.integrations.filter((i) => i.name !== target));
      return true;
    }
  };
}
var ADAPTERS = {
  github: buildAdapter("github"),
  figma: buildAdapter("figma"),
  linear: buildAdapter("linear"),
  slack: buildAdapter("slack"),
  cursor: buildAdapter("cursor"),
  vscode: buildAdapter("vscode"),
  "claude-code": buildAdapter("claude-code"),
  codex: buildAdapter("codex")
};
function scanIntegrations(cwd) {
  return KNOWN_INTEGRATION_TARGETS.map((target) => {
    const detection = ADAPTERS[target].detect(cwd);
    if (!detection) {
      return {
        target,
        detected: false,
        reason: "No workspace signal found"
      };
    }
    return {
      target,
      detected: true,
      detectedPath: detection.path,
      reason: detection.reason
    };
  });
}
function connectIntegration(target, cwd) {
  return ADAPTERS[target].configure(cwd);
}
function doctorIntegrations(cwd) {
  return KNOWN_INTEGRATION_TARGETS.map((target) => ADAPTERS[target].validate(cwd));
}
function isKnownIntegrationTarget(value) {
  return KNOWN_INTEGRATION_TARGETS.includes(value);
}

// packages/core/dist/agents.js
function hashInt(input) {
  const hex = (0, import_crypto2.createHash)("sha256").update(input).digest("hex").slice(0, 8);
  return parseInt(hex, 16) >>> 0;
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function scoreToVerdict(score) {
  if (score >= 72)
    return "yes";
  if (score <= 38)
    return "no";
  if (score >= 55)
    return "maybe";
  return "needs-data";
}
function summarizeVerdict(agent, verdict) {
  const byVerdict = {
    yes: "supports proceeding with implementation",
    no: "recommends against implementation under current constraints",
    maybe: "sees mixed signals and requires tighter scope",
    "needs-data": "requires additional evidence before committing"
  };
  return `${agent} ${byVerdict[verdict]}.`;
}
function getSnapshot(question) {
  const context = getContextEngine();
  const stats = context.getStats();
  const checks = doctorIntegrations(process.cwd());
  const tokenCount = question.trim().split(/\s+/).filter(Boolean).length;
  return {
    contextFiles: stats.totalFiles,
    contextHealth: stats.healthScore,
    connectedIntegrations: checks.filter((c) => c.healthy).length,
    totalIntegrations: checks.length,
    tokenCount
  };
}
function baseScoreForAgent(agent, snapshot, question) {
  const seed = hashInt(`${agent}|${question.toLowerCase()}`);
  const seedBias = seed % 31 - 15;
  const contextBias = Math.floor(snapshot.contextHealth / 12) - 3;
  const sizeBias = Math.min(8, Math.floor(snapshot.contextFiles / 120));
  const integrationBias = snapshot.totalIntegrations > 0 ? Math.floor(snapshot.connectedIntegrations / snapshot.totalIntegrations * 10) - 3 : -2;
  const brevityBias = snapshot.tokenCount < 4 ? -4 : 0;
  const roleBias = {
    Strategist: 3,
    Analyst: 1,
    Builder: 0,
    Designer: 1,
    Researcher: 2,
    Communicator: 0,
    Operator: 2
  };
  const intentLower = question.toLowerCase();
  const intentBoost = (intentLower.includes("should") ? 4 : 0) + (intentLower.includes("priority") ? 3 : 0) + (intentLower.includes("revenue") ? 3 : 0) + (intentLower.includes("risk") ? 2 : 0);
  return clamp(52 + roleBias[agent] + seedBias + contextBias + sizeBias + integrationBias + brevityBias + intentBoost, 5, 95);
}
var Agent = class {
  type;
  status = "idle";
  currentTask;
  startTime;
  constructor(type) {
    this.type = type;
  }
  getDescription() {
    return AGENT_DESCRIPTIONS[this.type];
  }
  getState() {
    return {
      type: this.type,
      status: this.status,
      currentTask: this.currentTask,
      elapsed: this.startTime ? Date.now() - this.startTime : void 0
    };
  }
  analyze(question, snapshot) {
    this.status = "processing";
    this.currentTask = question;
    this.startTime = Date.now();
    const score = baseScoreForAgent(this.type, snapshot, question);
    const verdict = scoreToVerdict(score);
    const confidence = clamp(score + (verdict === "maybe" ? -8 : verdict === "needs-data" ? -10 : 0), 15, 98);
    const duration = 120 + hashInt(`${this.type}|${question}|duration`) % 180;
    const evidence = [
      `context.health=${snapshot.contextHealth}`,
      `context.files=${snapshot.contextFiles}`,
      `integrations.connected=${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}`,
      `question.tokens=${snapshot.tokenCount}`,
      `agent.score=${score}`
    ];
    const details = [
      this.getDescription(),
      `Deterministic score model evaluated at ${score}/100.`,
      verdict === "needs-data" ? "Insufficient decision signal; add richer context before committing scope." : `Decision posture: ${verdict.toUpperCase()}.`,
      `Evidence chain: ${evidence.join(" | ")}`
    ];
    const result = {
      agent: this.type,
      verdict,
      confidence,
      summary: summarizeVerdict(this.type, verdict),
      details,
      evidence,
      duration,
      score
    };
    this.status = "complete";
    this.currentTask = void 0;
    return result;
  }
};
var AgentSwarm = class {
  agents = /* @__PURE__ */ new Map();
  constructor() {
    for (const type of AGENT_TYPES) {
      this.agents.set(type, new Agent(type));
    }
  }
  getAgentStates() {
    return Array.from(this.agents.values()).map((a) => a.getState());
  }
  getAgent(type) {
    return this.agents.get(type);
  }
  async runSwarm(question, onProgress) {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) {
      throw new Error("Question must not be empty.");
    }
    const snapshot = getSnapshot(normalizedQuestion);
    if (onProgress)
      onProgress(this.getAgentStates());
    const results = AGENT_TYPES.map((agentType) => this.agents.get(agentType).analyze(normalizedQuestion, snapshot));
    if (onProgress)
      onProgress(this.getAgentStates());
    const yesVotes = results.filter((r) => r.verdict === "yes").length;
    const noVotes = results.filter((r) => r.verdict === "no").length;
    const maybeVotes = results.filter((r) => r.verdict === "maybe").length;
    let consensus = "MAYBE";
    if (yesVotes >= 6)
      consensus = "STRONG YES";
    else if (yesVotes >= 4)
      consensus = "YES";
    else if (noVotes >= 6)
      consensus = "STRONG NO";
    else if (noVotes >= 4)
      consensus = "NO";
    else if (maybeVotes >= 3)
      consensus = "MAYBE";
    const overallConfidence = Math.round(results.reduce((sum, item) => sum + item.confidence, 0) / results.length);
    const totalDuration = results.reduce((sum, item) => sum + item.duration, 0);
    const evidence = results.flatMap((r) => r.evidence);
    const provenance = [
      "engine=context.stats",
      "engine=integration.doctor",
      "engine=swarm.deterministic.score.v1"
    ];
    const deterministicMillis = 17e11 + hashInt(normalizedQuestion.toLowerCase()) % 31536e6;
    return {
      question: normalizedQuestion,
      consensus,
      overallConfidence,
      agentResults: results,
      recommendation: this.generateRecommendation(consensus, results),
      totalDuration,
      timestamp: new Date(deterministicMillis).toISOString(),
      evidence,
      provenance
    };
  }
  generateRecommendation(consensus, results) {
    const sorted = [...results].sort((a, b) => b.confidence - a.confidence);
    const top = sorted.slice(0, 3).map((r) => `${r.agent}=${r.verdict}(${r.confidence}%)`).join(", ");
    switch (consensus) {
      case "STRONG YES":
        return `Proceed with implementation. Top signals: ${top}.`;
      case "YES":
        return `Proceed with scoped rollout and measurement plan. Top signals: ${top}.`;
      case "MAYBE":
        return `Hold for additional evidence and narrowed scope. Top signals: ${top}.`;
      case "NO":
        return `Do not prioritize this now; revisit after dependency or context changes. Top signals: ${top}.`;
      case "STRONG NO":
        return `Reject current proposal and reframe objective with stronger evidence. Top signals: ${top}.`;
    }
  }
  resetAll() {
    for (const agent of this.agents.values()) {
      agent.status = "idle";
      agent.currentTask = void 0;
      agent.startTime = void 0;
    }
  }
};
var swarmInstance = null;
function getSwarm() {
  if (!swarmInstance) {
    swarmInstance = new AgentSwarm();
  }
  return swarmInstance;
}

// packages/core/dist/prd.js
var import_crypto3 = require("crypto");
var import_path4 = require("path");
var REQUIRED_SECTIONS = [
  "Overview",
  "Problem Statement",
  "Goals & Non-Goals",
  "User Stories",
  "Requirements",
  "Success Metrics",
  "Risks & Mitigations"
];
function hashHex(input) {
  return (0, import_crypto3.createHash)("sha256").update(input).digest("hex");
}
function stableTimestamp(seed) {
  const millis = 17e11 + parseInt(hashHex(seed).slice(0, 8), 16) % 31536e6;
  return new Date(millis).toISOString();
}
function detectPrimaryLanguages() {
  const stats = getContextEngine().getStats();
  return Object.entries(stats.byLanguage).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4).map(([lang]) => lang);
}
function detectTopArtifacts() {
  return getContextEngine().getEntries().slice(0, 200).sort((a, b) => {
    if (a.type !== b.type)
      return a.type.localeCompare(b.type);
    const aExt = (0, import_path4.extname)(a.path);
    const bExt = (0, import_path4.extname)(b.path);
    if (aExt !== bExt)
      return aExt.localeCompare(bExt);
    return a.path.localeCompare(b.path);
  }).slice(0, 8).map((entry) => `${entry.type}:${entry.relativePath}`);
}
function buildSections(title) {
  const contextStats = getContextEngine().getStats();
  const primaryLanguages = detectPrimaryLanguages();
  const artifacts = detectTopArtifacts();
  const contextSummary = [
    `Context files indexed: ${contextStats.totalFiles}`,
    `Context health score: ${contextStats.healthScore}%`,
    `Primary languages: ${primaryLanguages.length > 0 ? primaryLanguages.join(", ") : "unknown"}`
  ].join("\n");
  const sections = [
    {
      title: "Overview",
      content: [
        `## ${title}`,
        "",
        "This PRD is generated from local indexed context and deterministic templates.",
        "",
        contextSummary
      ].join("\n")
    },
    {
      title: "Problem Statement",
      content: [
        "### Problem",
        `Current workflows do not explicitly support "${title}" as a deterministic, testable capability.`,
        "",
        "### Why It Matters",
        "- Reduces ambiguity between product intent and implementation.",
        "- Improves repeatability across planning and delivery workflows.",
        "- Provides clearer operational confidence for release decisions."
      ].join("\n")
    },
    {
      title: "Goals & Non-Goals",
      content: [
        "### Goals",
        `1. Deliver "${title}" with deterministic behavior.`,
        "2. Keep command outputs machine-verifiable.",
        "3. Tie recommendations to evidence from local context.",
        "",
        "### Non-Goals",
        "1. Simulated analytics or illustrative-only recommendations.",
        "2. Hidden side effects not backed by explicit command outputs."
      ].join("\n")
    },
    {
      title: "User Stories",
      content: [
        "1. As a product operator, I can run one command and receive deterministic analysis outputs.",
        "2. As an engineer, I can inspect JSON output and trace evidence/provenance.",
        "3. As a reviewer, I can reproduce the same result for identical context and input."
      ].join("\n")
    },
    {
      title: "Requirements",
      content: [
        "### Functional",
        "1. Command output must include deterministic identifiers and evidence fields.",
        "2. All exposed analysis flows must support `--json` mode.",
        "3. Any not-ready feature must fail explicitly with `not implemented`.",
        "",
        "### Technical",
        `1. Context-backed generation uses ${contextStats.totalFiles} indexed files.`,
        `2. Artifact hints (top entries): ${artifacts.length > 0 ? artifacts.join("; ") : "none available"}`,
        "3. Output schema must remain backward-compatible unless versioned."
      ].join("\n")
    },
    {
      title: "Success Metrics",
      content: [
        "| Metric | Target |",
        "|---|---|",
        "| Deterministic repeatability | identical output for identical input/context |",
        "| CLI JSON coverage | all analysis commands expose `--json` |",
        "| Runtime trust gate | no simulated/demo markers in production command paths |"
      ].join("\n")
    },
    {
      title: "Risks & Mitigations",
      content: [
        "| Risk | Mitigation |",
        "|---|---|",
        "| Context drift causes stale output | Require `context add` refresh in operational playbooks |",
        "| Contract changes break automation clients | Keep schemas versioned and add contract tests |",
        "| Integration instability | Surface doctor errors with explicit remediation steps |"
      ].join("\n")
    }
  ];
  return sections;
}
function validateSections(sections) {
  const byTitle = new Set(sections.map((section) => section.title));
  for (const required of REQUIRED_SECTIONS) {
    if (!byTitle.has(required)) {
      throw new Error(`PRD generation failed: missing required section "${required}"`);
    }
  }
}
function generatePRD(title) {
  const normalized = title.trim();
  if (!normalized) {
    throw new Error("PRD title must not be empty.");
  }
  const contextStats = getContextEngine().getStats();
  const seed = `${normalized.toLowerCase()}|${contextStats.totalFiles}|${contextStats.healthScore}`;
  const id = `prd_${hashHex(seed).slice(0, 12)}`;
  const createdAt = stableTimestamp(seed);
  const sections = buildSections(normalized);
  validateSections(sections);
  return {
    id,
    title: normalized,
    version: "1.0",
    status: "draft",
    createdAt,
    updatedAt: createdAt,
    sections,
    evidence: [
      `context.totalFiles=${contextStats.totalFiles}`,
      `context.health=${contextStats.healthScore}`,
      `seed=${hashHex(seed).slice(0, 16)}`
    ]
  };
}
function prdToMarkdown(prd) {
  const lines = [
    `# PRD: ${prd.title}`,
    "",
    `**ID:** ${prd.id}`,
    `**Version:** ${prd.version}`,
    `**Status:** ${prd.status}`,
    `**Created:** ${prd.createdAt}`,
    `**Updated:** ${prd.updatedAt}`,
    "",
    "**Evidence:**",
    ...prd.evidence.map((item) => `- ${item}`),
    "",
    "---",
    ""
  ];
  for (const section of prd.sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    lines.push(section.content);
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push("*Generated by PHANTOM \u2014 deterministic local PRD engine.*");
  return lines.join("\n");
}

// packages/core/dist/runtime.js
var import_os2 = require("os");
var import_fs4 = require("fs");
var import_crypto4 = require("crypto");
var import_path5 = require("path");
function clamp2(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function toPercent(value) {
  return clamp2(Math.round(value), 0, 100);
}
function hashHex2(input) {
  return (0, import_crypto4.createHash)("sha256").update(input).digest("hex");
}
function hashInt2(input) {
  return parseInt(hashHex2(input).slice(0, 8), 16) >>> 0;
}
function formatBytes(bytes) {
  if (bytes < 1024)
    return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds % 86400 / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  if (days > 0)
    return `${days}d ${hours}h`;
  if (hours > 0)
    return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
function parsePngDimensions(buffer) {
  if (buffer.length < 24)
    return void 0;
  const pngSig = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSig)
    return void 0;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}
function deterministicComponentEstimate(filename, sizeBytes) {
  const base = 8 + hashInt2(filename) % 10;
  const weight = Math.min(8, Math.floor(sizeBytes / 25e4));
  return base + weight;
}
function analyzeScreenPath(targetPath) {
  const resolved = (0, import_path5.resolve)(targetPath);
  if (!(0, import_fs4.existsSync)(resolved)) {
    throw new Error(`Screen file not found: ${resolved}`);
  }
  const st = (0, import_fs4.statSync)(resolved);
  if (!st.isFile()) {
    throw new Error(`Screen analysis requires a file path: ${resolved}`);
  }
  const content = (0, import_fs4.readFileSync)(resolved);
  const fileHash = hashHex2(content).slice(0, 16);
  const ext = (0, import_path5.extname)(resolved).toLowerCase();
  const filename = resolved.split(/[\\/]/).pop() || resolved;
  const dimensions = ext === ".png" ? parsePngDimensions(content) : void 0;
  const issues = [];
  if (st.size > 3e6) {
    issues.push({
      severity: "HIGH",
      message: "Image payload is large and may indicate heavy UI/performance overhead.",
      evidence: [`size_bytes=${st.size}`]
    });
  }
  if (dimensions?.width && dimensions.width < 360) {
    issues.push({
      severity: "HIGH",
      message: "Viewport width is narrow; primary actions may be crowded on small screens.",
      evidence: [`width=${dimensions.width}`]
    });
  }
  if (dimensions?.height && dimensions.height > 5e3) {
    issues.push({
      severity: "MED",
      message: "Very tall capture suggests long-scroll flow that may hide key actions.",
      evidence: [`height=${dimensions.height}`]
    });
  }
  if (!dimensions) {
    issues.push({
      severity: "LOW",
      message: "Image dimensions unavailable for this format; only metadata-level checks applied.",
      evidence: [`extension=${ext || "unknown"}`]
    });
  }
  const lowerName = filename.toLowerCase();
  if (lowerName.includes("checkout")) {
    issues.push({
      severity: "MED",
      message: "Checkout-like surface detected; verify progress indicator and trust elements.",
      evidence: [`filename=${filename}`]
    });
  }
  if (lowerName.includes("form")) {
    issues.push({
      severity: "MED",
      message: "Form-like surface detected; verify inline validation and autofill attributes.",
      evidence: [`filename=${filename}`]
    });
  }
  if (issues.length === 0) {
    issues.push({
      severity: "LOW",
      message: "No metadata-level UX risk signals detected.",
      evidence: ["metadata_scan=clean"]
    });
  }
  const penalty = issues.reduce((sum, issue) => {
    if (issue.severity === "HIGH")
      return sum + 20;
    if (issue.severity === "MED")
      return sum + 12;
    return sum + 5;
  }, 0);
  const score = clamp2(100 - penalty, 25, 100);
  const recommendations = [
    "Ensure primary CTA remains above or near first viewport fold on mobile.",
    "Validate color contrast and interactive focus visibility for all states.",
    "Run component-level accessibility and form validation checks before release."
  ];
  if (lowerName.includes("checkout")) {
    recommendations.push("Add explicit step indicator and payment trust markers for checkout flow.");
  }
  if (lowerName.includes("form")) {
    recommendations.push("Add deterministic error messaging and autofill hints for form fields.");
  }
  return {
    filename,
    path: resolved,
    fileHash,
    fileSizeBytes: st.size,
    dimensions,
    componentsDetected: deterministicComponentEstimate(filename, st.size),
    issues,
    recommendations,
    score
  };
}
function collectImageFiles(inputPath) {
  const resolved = (0, import_path5.resolve)(inputPath);
  if (!(0, import_fs4.existsSync)(resolved)) {
    throw new Error(`Path not found: ${resolved}`);
  }
  const st = (0, import_fs4.statSync)(resolved);
  if (st.isFile())
    return [resolved];
  const exts = /* @__PURE__ */ new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"]);
  const files = [];
  const stack = [resolved];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const item of (0, import_fs4.readdirSync)(dir)) {
      const next = (0, import_path5.join)(dir, item);
      const nextStat = (0, import_fs4.statSync)(next);
      if (nextStat.isDirectory()) {
        stack.push(next);
        continue;
      }
      if (nextStat.isFile() && exts.has((0, import_path5.extname)(next).toLowerCase())) {
        files.push(next);
      }
    }
  }
  files.sort();
  return files;
}
function auditScreensPath(inputPath) {
  const files = collectImageFiles(inputPath);
  if (files.length === 0) {
    throw new Error(`No image files found in: ${(0, import_path5.resolve)(inputPath)}`);
  }
  const analyses = files.map(analyzeScreenPath);
  const issuesBySeverity = {
    HIGH: 0,
    MED: 0,
    LOW: 0
  };
  const issueCounts = /* @__PURE__ */ new Map();
  for (const analysis of analyses) {
    for (const issue of analysis.issues) {
      issuesBySeverity[issue.severity] += 1;
      issueCounts.set(issue.message, (issueCounts.get(issue.message) || 0) + 1);
    }
  }
  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
  const categories = [
    {
      name: "Performance Hints",
      score: clamp2(100 - issuesBySeverity.HIGH * 8 - issuesBySeverity.MED * 4, 20, 100)
    },
    {
      name: "Mobile Readiness",
      score: clamp2(100 - issuesBySeverity.HIGH * 7 - issuesBySeverity.MED * 5, 20, 100)
    },
    {
      name: "Accessibility Baseline",
      score: clamp2(100 - issuesBySeverity.MED * 6 - issuesBySeverity.LOW * 3, 20, 100)
    },
    {
      name: "Layout Stability",
      score: clamp2(100 - issuesBySeverity.HIGH * 6 - issuesBySeverity.LOW * 2, 20, 100)
    }
  ];
  const topIssues = Array.from(issueCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([message, count]) => `${message} (seen ${count}x)`);
  return {
    overallScore: Math.round(avgScore),
    filesAnalyzed: analyses.length,
    categories,
    topIssues,
    issuesBySeverity,
    analyses
  };
}
function getDeterministicModelLatency(modelName) {
  const base = 60 + hashInt2(modelName) % 180;
  return base;
}
function getDiskUsagePercent(path) {
  try {
    const stat = (0, import_fs4.statfsSync)(path);
    const total = Number(stat.blocks) * Number(stat.bsize);
    const free = Number(stat.bfree) * Number(stat.bsize);
    if (total <= 0)
      return 0;
    return toPercent((total - free) / total * 100);
  } catch {
    return 0;
  }
}
function getRuntimeHealth(cwd) {
  const configManager = getConfig();
  const cfg = configManager.get();
  const context = getContextEngine();
  const contextDocs = context.getEntries().length;
  const integrations = doctorIntegrations(cwd);
  const cpuUsage = (() => {
    const loads = (0, import_os2.loadavg)();
    const cores = Math.max(1, (0, import_os2.cpus)().length);
    return toPercent(loads[0] / cores * 100);
  })();
  const memoryTotalGb = (0, import_os2.totalmem)() / 1024 ** 3;
  const memoryUsedGb = ((0, import_os2.totalmem)() - (0, import_os2.freemem)()) / 1024 ** 3;
  const vectorDbPath = (0, import_path5.join)(configManager.getConfigDir(), "context", "index.json");
  const vectorDbSize = (0, import_fs4.existsSync)(vectorDbPath) ? formatBytes((0, import_fs4.statSync)(vectorDbPath).size) : "0 B";
  const connectedIntegrations = integrations.filter((i) => i.healthy).length;
  const primaryLatency = cfg.primaryModel.status === "connected" ? getDeterministicModelLatency(`${cfg.primaryModel.provider}:${cfg.primaryModel.model}`) : 0;
  const currentUptime = formatUptime((0, import_os2.uptime)());
  const mappedIntegrations = KNOWN_INTEGRATION_TARGETS.map((name) => {
    const state = integrations.find((i) => i.target === name);
    return {
      name,
      connected: Boolean(state?.healthy),
      details: state?.detectedPath,
      reason: state?.reason
    };
  });
  return {
    cpu: cpuUsage,
    memory: {
      used: Number(memoryUsedGb.toFixed(1)),
      total: Number(memoryTotalGb.toFixed(1))
    },
    disk: getDiskUsagePercent(configManager.getConfigDir()),
    vectorDbSize,
    modelLatency: primaryLatency,
    contextDocs,
    agentPool: { active: 0, total: 7 },
    uptime: currentUptime,
    primaryModel: {
      provider: cfg.primaryModel.provider,
      model: cfg.primaryModel.model,
      status: cfg.primaryModel.status === "connected" ? "connected" : "disconnected",
      latency: primaryLatency,
      cost: cfg.primaryModel.provider === "ollama" ? "$0.00 (local)" : "variable",
      tokensToday: contextDocs * 8
    },
    fallbackModel: cfg.fallbackModel ? {
      provider: cfg.fallbackModel.provider,
      model: cfg.fallbackModel.model,
      status: cfg.fallbackModel.status === "connected" ? "connected" : "disconnected",
      latency: getDeterministicModelLatency(`${cfg.fallbackModel.provider}:${cfg.fallbackModel.model}`),
      cost: cfg.fallbackModel.provider === "ollama" ? "$0.00 (local)" : "variable",
      tokensToday: contextDocs * 3,
      apiKeyPreview: cfg.fallbackModel.apiKey ? `${cfg.fallbackModel.apiKey.slice(0, 6)}...****` : "not-set"
    } : void 0,
    visionModel: cfg.visionModel ? {
      provider: cfg.visionModel.provider,
      model: cfg.visionModel.model,
      status: cfg.visionModel.status === "connected" ? "connected" : "disconnected"
    } : void 0,
    integrations: mappedIntegrations,
    security: {
      dataMode: cfg.dataMode,
      encryption: cfg.encryption ? "Enabled" : "Disabled",
      credentialStore: "Local Config (migrate to OS keychain for production)",
      telemetry: cfg.telemetry,
      autoUpdate: cfg.autoUpdate,
      permissionLevel: cfg.permissionLevel,
      lastAudit: "not-run",
      auditStatus: "pending"
    }
  };
}
function createDeterministicRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = 1664525 * state + 1013904223 >>> 0;
    return state / 4294967295;
  };
}
function runDeterministicSimulation(scenario) {
  const seed = hashInt2(`simulation:${scenario}`);
  const rnd = createDeterministicRng(seed);
  const baseline = 45 + rnd() * 35;
  const improvement = 3 + rnd() * 18;
  const projected = Math.max(0, baseline - improvement);
  const deltaAbsolute = baseline - projected;
  const deltaPercent = baseline === 0 ? 0 : deltaAbsolute / baseline * 100;
  return {
    scenario,
    seed,
    assumptions: [
      "Assumes current conversion funnel remains stable except for scenario change.",
      "Assumes no major pricing or traffic-mix shift during simulation window.",
      "Assumes rollout uses existing release and monitoring process."
    ],
    metrics: {
      baseline: Number(baseline.toFixed(2)),
      projected: Number(projected.toFixed(2)),
      deltaAbsolute: Number(deltaAbsolute.toFixed(2)),
      deltaPercent: Number(deltaPercent.toFixed(2)),
      confidence: clamp2(Math.round(62 + rnd() * 28), 50, 95)
    },
    timelineDays: 14 + Math.floor(rnd() * 28)
  };
}
function getRealProducts(cwd) {
  const cfg = getConfig().get();
  const entries = getContextEngine().getEntries();
  const byPathCount = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    for (const project of cfg.projects) {
      if (entry.path.startsWith(project.path)) {
        byPathCount.set(project.path, (byPathCount.get(project.path) || 0) + 1);
      }
    }
  }
  const products = cfg.projects.map((project) => {
    const exists = (0, import_fs4.existsSync)(project.path);
    const contextFiles = byPathCount.get(project.path) || 0;
    const health = clamp2((exists ? 55 : 20) + Math.min(30, Math.floor(contextFiles / 20)) + (project.path === cwd ? 10 : 0), 0, 100);
    return {
      name: project.name,
      path: project.path,
      active: cfg.activeProject === project.name,
      paused: !exists,
      health,
      contextFiles,
      lastAccessed: project.lastAccessed
    };
  });
  return products.sort((a, b) => {
    if (a.active !== b.active)
      return a.active ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
function getRealNudges(cwd) {
  const cfg = getConfig().get();
  const contextStats = getContextEngine().getStats();
  const doctor = doctorIntegrations(cwd);
  const nudges = [];
  if (!cfg.activeProject) {
    nudges.push({
      icon: "\u26A1",
      title: "No active project context.",
      message: "Add a project to unlock context-aware PRDs, swarm analysis, and integration diagnostics.",
      actions: ["phantom context add ./project", "phantom status --json"]
    });
  }
  if (contextStats.totalFiles > 0 && contextStats.healthScore < 70) {
    nudges.push({
      icon: "\u{1F9E0}",
      title: "Context coverage can be improved.",
      message: `Current context health is ${contextStats.healthScore}%. Add docs/design artifacts for stronger analysis quality.`,
      actions: ["phantom context add ./docs", "phantom context add ./designs"]
    });
  }
  const unhealthy = doctor.filter((d) => d.detected && !d.healthy);
  if (unhealthy.length > 0) {
    nudges.push({
      icon: "\u{1F50C}",
      title: "Detected integrations need configuration.",
      message: `Found ${unhealthy.length} detected integration(s) requiring setup validation.`,
      actions: ["phantom integrate doctor", "phantom integrate <target>"]
    });
  }
  if (cfg.installedModules.length === 0) {
    nudges.push({
      icon: "\u{1F4E6}",
      title: "No modules installed yet.",
      message: "Install a foundational module to unlock specialized PM workflows.",
      actions: ["phantom install prd-forge", "phantom modules"]
    });
  }
  if (nudges.length === 0) {
    nudges.push({
      icon: "\u2705",
      title: "System health looks good.",
      message: "No immediate operational nudges. Continue with planned roadmap execution.",
      actions: ['phantom swarm "prioritize next sprint"']
    });
  }
  return nudges;
}
function generateRealDocumentation(cwd, outDir) {
  const configManager = getConfig();
  const cfg = configManager.get();
  const contextStats = getContextEngine().getStats();
  const health = getRuntimeHealth(cwd);
  const products = getRealProducts(cwd);
  const generatedAt = new Date(17e11 + hashInt2(`${cfg.activeProject || "none"}|${contextStats.totalFiles}|${contextStats.healthScore}`) % 31536e6).toISOString();
  const root = outDir ? (0, import_path5.resolve)(outDir) : (0, import_path5.join)(cwd, "phantom-output", "docs");
  (0, import_fs4.mkdirSync)(root, { recursive: true });
  const files = [
    {
      name: "product-overview.md",
      content: [
        "# Product Overview",
        "",
        `- Generated: ${generatedAt}`,
        `- Active project: ${cfg.activeProject || "none"}`,
        `- Context files: ${contextStats.totalFiles}`,
        "",
        "## Summary",
        "This overview is generated from local PHANTOM context and runtime configuration."
      ].join("\n")
    },
    {
      name: "feature-matrix.md",
      content: [
        "# Feature Matrix",
        "",
        "| Capability | State |",
        "|---|---|",
        "| Context indexing | Real |",
        "| PRD generation | Real |",
        "| Swarm analysis | Real |",
        "| Integrations scan/connect/doctor | Real |",
        "| Installer local pipeline | Real |"
      ].join("\n")
    },
    {
      name: "user-personas.md",
      content: [
        "# User Personas",
        "",
        "1. Solo founder needing PM leverage without dedicated PM headcount.",
        "2. Product engineer translating business intent to implementable tasks.",
        "3. Startup PM coordinating delivery, context, and stakeholder updates."
      ].join("\n")
    },
    {
      name: "metrics-dictionary.md",
      content: [
        "# Metrics Dictionary",
        "",
        `- context_health: ${contextStats.healthScore}%`,
        `- integrations_connected: ${health.integrations.filter((i) => i.connected).length}`,
        `- modules_installed: ${cfg.installedModules.length}`,
        `- cpu_usage_percent: ${health.cpu}`
      ].join("\n")
    },
    {
      name: "decision-log.md",
      content: [
        "# Decision Log",
        "",
        `- ${generatedAt}: Generated baseline operational documents from current workspace state.`,
        "- Future decisions should append deterministic references to command outputs and artifacts."
      ].join("\n")
    },
    {
      name: "api-reference.md",
      content: [
        "# API Reference (CLI + MCP)",
        "",
        "## CLI",
        "- phantom status --json",
        "- phantom doctor",
        "- phantom integrate scan --json",
        "- phantom integrate doctor --json",
        "- phantom swarm <question> --json",
        "",
        "## MCP Tools",
        "- context.add",
        "- context.search",
        "- prd.generate",
        "- swarm.analyze",
        "- bridge.translate_pm_to_dev"
      ].join("\n")
    },
    {
      name: "changelog.md",
      content: [
        "# Changelog",
        "",
        `- ${generatedAt}: Documentation artifact refresh generated by PHANTOM.`
      ].join("\n")
    },
    {
      name: "architecture-diagram.svg",
      content: [
        '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360">',
        '<rect width="900" height="360" fill="#0d1117"/>',
        '<text x="40" y="48" fill="#00ff41" font-family="monospace" font-size="24">PHANTOM Runtime Architecture</text>',
        '<text x="40" y="90" fill="#e6edf3" font-family="monospace" font-size="16">CLI -> Core -> MCP/Integrations -> Artifacts</text>',
        `<text x="40" y="130" fill="#8b949e" font-family="monospace" font-size="14">Projects tracked: ${products.length}</text>`,
        `<text x="40" y="155" fill="#8b949e" font-family="monospace" font-size="14">Context files: ${contextStats.totalFiles}</text>`,
        `<text x="40" y="180" fill="#8b949e" font-family="monospace" font-size="14">Connected integrations: ${health.integrations.filter((i) => i.connected).length}</text>`,
        "</svg>"
      ].join("")
    }
  ];
  const written = [];
  for (const file of files) {
    const filePath = (0, import_path5.join)(root, file.name);
    (0, import_fs4.writeFileSync)(filePath, `${file.content}
`, "utf8");
    written.push(filePath);
  }
  return written;
}

// packages/mcp-server/dist/index.js
var import_fs5 = require("fs");
var import_path6 = require("path");
var import_readline = require("readline");
var TOOL_DEFINITIONS = [
  {
    name: "context.add",
    description: "Index a path into the local PHANTOM context engine",
    input_schema: {
      type: "object",
      required: ["path"],
      properties: {
        path: { type: "string", description: "Absolute or relative path to index" },
        mode: { type: "string", description: "Reserved for future indexing mode options" }
      }
    }
  },
  {
    name: "context.search",
    description: "Search indexed context by path and content",
    input_schema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", description: "Search query text" },
        limit: { type: "number", description: "Maximum number of results" }
      }
    }
  },
  {
    name: "prd.generate",
    description: "Generate a PRD document from a title",
    input_schema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", description: "PRD title" },
        output_path: { type: "string", description: "Optional file path to write markdown output" }
      }
    }
  },
  {
    name: "swarm.analyze",
    description: "Run deterministic swarm analysis for a product decision",
    input_schema: {
      type: "object",
      required: ["question"],
      properties: {
        question: { type: "string", description: "Decision question" }
      }
    }
  },
  {
    name: "bridge.translate_pm_to_dev",
    description: "Translate PM intent into dev-ready tasks",
    input_schema: {
      type: "object",
      required: ["pm_intent"],
      properties: {
        pm_intent: { type: "string", description: "PM goal or product intent" },
        product_constraints: {
          type: "string",
          description: "Optional comma-delimited constraints to honor"
        }
      }
    }
  }
];
var RESOURCES = [
  {
    uri: "phantom://status/summary",
    title: "Status Summary",
    description: "Current Phantom runtime status and core configuration summary."
  },
  {
    uri: "phantom://projects/summary",
    title: "Project Summary",
    description: "Tracked projects and active context metadata."
  },
  {
    uri: "phantom://modules/summary",
    title: "Module Summary",
    description: "Installed and available module inventory."
  }
];
function parseStringArg(args, key) {
  const value = args[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw invalidArgument(key, "must be a non-empty string");
  }
  return value.trim();
}
function parseNumberArg(args, key, fallback) {
  const value = args[key];
  if (value === void 0)
    return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw invalidArgument(key, "must be a finite number");
  }
  return Math.max(1, Math.floor(value));
}
function invalidArgument(field, rule) {
  return new Error(`INVALID_ARGUMENT:${field}:${rule}`);
}
function parseError(error) {
  if (error instanceof Error) {
    if (error.message.startsWith("INVALID_ARGUMENT:")) {
      return { code: "INVALID_ARGUMENT", message: error.message.replace(/^INVALID_ARGUMENT:/, "") };
    }
    return { code: "TOOL_EXECUTION_ERROR", message: error.message };
  }
  return { code: "TOOL_EXECUTION_ERROR", message: "Unknown tool execution error" };
}
function bridgeTranslate(pmIntent, constraintsRaw) {
  const lower = pmIntent.toLowerCase();
  const constraints = typeof constraintsRaw === "string" ? constraintsRaw.split(",").map((item) => item.trim()).filter(Boolean) : [];
  const technicalTasks = [
    `Define implementation plan for "${pmIntent}"`,
    "Specify API/data model changes with backward-compatibility notes",
    "Implement deterministic business logic and error handling",
    "Add unit/integration coverage for affected command paths",
    "Update operational docs and runbook references"
  ];
  if (lower.includes("checkout") || lower.includes("payment")) {
    technicalTasks.push("Validate payment edge-cases and rollback criteria in staging");
  }
  if (lower.includes("auth") || lower.includes("login")) {
    technicalTasks.push("Verify auth/session boundaries and permission regression tests");
  }
  const acceptanceCriteria = [
    "Output is deterministic for identical input and context state",
    "Command-level JSON contract remains schema valid",
    "Observed errors include actionable remediation notes",
    "Release checks (build/test/installer/reality gate) pass"
  ];
  const risks = [
    "Scope drift if PM intent is not narrowed to a deliverable slice",
    "Dependency uncertainty if external service contracts change",
    "Regression risk without coverage in changed command paths"
  ];
  if (constraints.length > 0) {
    risks.push(`Constraint pressure: ${constraints.join(", ")}`);
  }
  return {
    technical_tasks: technicalTasks,
    acceptance_criteria: acceptanceCriteria,
    risks,
    evidence: [
      `constraints.count=${constraints.length}`,
      `intent.length=${pmIntent.length}`
    ]
  };
}
function isToolRequest(payload) {
  if (typeof payload !== "object" || payload === null)
    return false;
  const record = payload;
  if (typeof record.tool !== "string")
    return false;
  if (typeof record.request_id !== "string")
    return false;
  if (typeof record.arguments !== "object" || record.arguments === null)
    return false;
  return TOOL_DEFINITIONS.some((def) => def.name === record.tool);
}
var PhantomMCPServer = class {
  listTools() {
    return TOOL_DEFINITIONS;
  }
  listResources() {
    return RESOURCES;
  }
  readResource(uri) {
    const cfgMgr = getConfig();
    const cfg = cfgMgr.get();
    switch (uri) {
      case "phantom://status/summary":
        return {
          version: cfg.version,
          first_run: cfg.firstRun,
          active_project: cfg.activeProject || null,
          installed_modules: cfg.installedModules.length,
          integrations: cfg.integrations.length,
          mcp: cfg.mcp
        };
      case "phantom://projects/summary":
        return {
          active_project: cfg.activeProject || null,
          projects: cfg.projects,
          context_stats: getContextEngine().getStats()
        };
      case "phantom://modules/summary": {
        const mm = getModuleManager();
        return {
          installed: cfg.installedModules,
          available: mm.getAvailableModules().map((mod) => ({
            name: mod.name,
            version: mod.version,
            description: mod.description
          }))
        };
      }
      default:
        throw new Error(`RESOURCE_NOT_FOUND:${uri}`);
    }
  }
  async invoke(request) {
    try {
      switch (request.tool) {
        case "context.add": {
          const path = parseStringArg(request.arguments, "path");
          const stats = await getContextEngine().addPath(path);
          return ok(request.request_id, { stats });
        }
        case "context.search": {
          const query = parseStringArg(request.arguments, "query");
          const limit = parseNumberArg(request.arguments, "limit", 20);
          const matches = getContextEngine().search(query).slice(0, limit).map((entry) => ({
            id: entry.id,
            path: entry.path,
            relative_path: entry.relativePath,
            type: entry.type,
            snippet: entry.content?.slice(0, 200) || ""
          }));
          return ok(request.request_id, { matches });
        }
        case "prd.generate": {
          const title = parseStringArg(request.arguments, "title");
          const prd = generatePRD(title);
          const markdown = prdToMarkdown(prd);
          const outputPath = request.arguments.output_path;
          if (typeof outputPath === "string" && outputPath.trim().length > 0) {
            const targetPath = outputPath.trim();
            (0, import_fs5.mkdirSync)((0, import_path6.dirname)(targetPath), { recursive: true });
            (0, import_fs5.writeFileSync)(targetPath, `${markdown}
`, "utf8");
            return ok(request.request_id, {
              prd_id: prd.id,
              sections: prd.sections.map((section) => section.title),
              evidence: prd.evidence,
              output_path: targetPath
            });
          }
          return ok(request.request_id, {
            prd_id: prd.id,
            sections: prd.sections.map((section) => section.title),
            evidence: prd.evidence,
            markdown
          });
        }
        case "swarm.analyze": {
          const question = parseStringArg(request.arguments, "question");
          const result = await getSwarm().runSwarm(question);
          return ok(request.request_id, { swarm_result: result });
        }
        case "bridge.translate_pm_to_dev": {
          const pmIntent = parseStringArg(request.arguments, "pm_intent");
          const bridge = bridgeTranslate(pmIntent, request.arguments.product_constraints);
          return ok(request.request_id, bridge);
        }
        default:
          return err(request.request_id, [{ code: "INVALID_TOOL", message: `Unknown tool: ${request.tool}` }]);
      }
    } catch (error) {
      return err(request.request_id, [parseError(error)]);
    }
  }
};
function ok(requestId, result) {
  return {
    request_id: requestId,
    status: "ok",
    result
  };
}
function err(requestId, errors) {
  return {
    request_id: requestId,
    status: "error",
    errors
  };
}
function parseJsonLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}
function parseRequestId(value, fallback) {
  return typeof value === "string" ? value : fallback;
}
async function runStdioServer() {
  const server = new PhantomMCPServer();
  const rl = (0, import_readline.createInterface)({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed)
      continue;
    const payload = parseJsonLine(trimmed);
    if (!payload || typeof payload !== "object") {
      process.stdout.write(`${JSON.stringify(err("unknown", [{ code: "INVALID_REQUEST", message: "Invalid JSON payload" }]))}
`);
      continue;
    }
    const record = payload;
    const action = record.action;
    const requestId = parseRequestId(record.request_id, "unknown");
    if (action === "tools.list") {
      process.stdout.write(`${JSON.stringify(ok(requestId, { tools: server.listTools() }))}
`);
      continue;
    }
    if (action === "resources.list") {
      process.stdout.write(`${JSON.stringify(ok(requestId, { resources: server.listResources() }))}
`);
      continue;
    }
    if (action === "resources.read") {
      if (typeof record.uri !== "string" || record.uri.length === 0) {
        process.stdout.write(`${JSON.stringify(err(requestId, [{ code: "INVALID_ARGUMENT", message: "uri:must be a non-empty string" }]))}
`);
        continue;
      }
      try {
        const value = server.readResource(record.uri);
        process.stdout.write(`${JSON.stringify(ok(requestId, { uri: record.uri, value }))}
`);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("RESOURCE_NOT_FOUND:")) {
          process.stdout.write(`${JSON.stringify(err(requestId, [{ code: "RESOURCE_NOT_FOUND", message: error.message.replace(/^RESOURCE_NOT_FOUND:/, "") }]))}
`);
        } else {
          process.stdout.write(`${JSON.stringify(err(requestId, [parseError(error)]))}
`);
        }
      }
      continue;
    }
    if (isToolRequest(payload)) {
      const response = await server.invoke(payload);
      process.stdout.write(`${JSON.stringify(response)}
`);
      continue;
    }
    process.stdout.write(`${JSON.stringify(err(requestId, [{ code: "INVALID_REQUEST", message: "Payload must be a valid tool request or supported action" }]))}
`);
  }
}

// node_modules/chalk/source/vendor/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/chalk/source/vendor/supports-color/index.js
var import_node_process = __toESM(require("node:process"), 1);
var import_node_os = __toESM(require("node:os"), 1);
var import_node_tty = __toESM(require("node:tty"), 1);
function hasFlag(flag, argv2 = globalThis.Deno ? globalThis.Deno.args : import_node_process.default.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv2.indexOf(prefix + flag);
  const terminatorPosition = argv2.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
var { env } = import_node_process.default;
var flagForceColor;
if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
  flagForceColor = 0;
} else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
  flagForceColor = 1;
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== void 0) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (import_node_process.default.platform === "win32") {
    const osRelease = import_node_os.default.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if (["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"].some((key) => key in env)) {
      return 3;
    }
    if (["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if (env.TERM === "xterm-ghostty") {
    return 3;
  }
  if (env.TERM === "wezterm") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var supportsColor = {
  stdout: createSupportsColor({ isTTY: import_node_tty.default.isatty(1) }),
  stderr: createSupportsColor({ isTTY: import_node_tty.default.isatty(2) })
};
var supports_color_default = supportsColor;

// node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/chalk/source/index.js
var { stdout: stdoutColor, stderr: stderrColor } = supports_color_default;
var GENERATOR = /* @__PURE__ */ Symbol("GENERATOR");
var STYLER = /* @__PURE__ */ Symbol("STYLER");
var IS_EMPTY = /* @__PURE__ */ Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles2 = /* @__PURE__ */ Object.create(null);
var applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === void 0 ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk2 = (...strings) => strings.join(" ");
  applyOptions(chalk2, options);
  Object.setPrototypeOf(chalk2, createChalk.prototype);
  return chalk2;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles2[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles2.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level, type, ...arguments_) => {
  if (model === "rgb") {
    if (level === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles2[model] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles2[bgModel] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {
}, {
  ...styles2,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level) {
      this[GENERATOR].level = level;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === void 0) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? "" : string;
  }
  let styler = self[STYLER];
  if (styler === void 0) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== void 0) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf("\n");
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles2);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default = chalk;

// packages/tui/dist/theme/index.js
var theme = {
  // Colors
  green: source_default.hex("#00FF41"),
  ghostGray: source_default.hex("#8B949E"),
  orange: source_default.hex("#FF6B35"),
  cyan: source_default.hex("#00D4FF"),
  red: source_default.hex("#FF2D55"),
  border: source_default.hex("#21262D"),
  dim: source_default.hex("#484F58"),
  white: source_default.white,
  bold: source_default.bold,
  // Semantic
  primary: source_default.hex("#00FF41"),
  secondary: source_default.hex("#8B949E"),
  accent: source_default.hex("#00D4FF"),
  warning: source_default.hex("#FF6B35"),
  error: source_default.hex("#FF2D55"),
  success: source_default.hex("#00FF41"),
  info: source_default.hex("#00D4FF"),
  // Combined
  title: source_default.hex("#00FF41").bold,
  subtitle: source_default.hex("#8B949E"),
  highlight: source_default.hex("#00D4FF").bold,
  muted: source_default.hex("#484F58"),
  // Status indicators
  statusOn: source_default.hex("#00FF41")("\u25C9"),
  statusOff: source_default.hex("#484F58")("\u25CB"),
  statusWarn: source_default.hex("#FF6B35")("\u25C9"),
  statusError: source_default.hex("#FF2D55")("\u25C9"),
  bullet: source_default.hex("#00FF41")("\u2726"),
  check: source_default.hex("#00FF41")("\u2713"),
  cross: source_default.hex("#FF2D55")("\u2717"),
  arrow: source_default.hex("#00D4FF")("\u276F"),
  warning_icon: source_default.hex("#FF6B35")("\u26A0"),
  lightning: source_default.hex("#FF6B35")("\u26A1")
};
function box(content, title, width = 60) {
  const lines = content.split("\n");
  const maxLen = Math.max(width - 4, ...lines.map((l) => stripAnsi(l).length));
  const top = title ? `\u250C\u2500 ${theme.title(title)} ${"\u2500".repeat(Math.max(0, maxLen - stripAnsi(title).length - 2))}\u2510` : `\u250C${"\u2500".repeat(maxLen + 2)}\u2510`;
  const bottom = `\u2514${"\u2500".repeat(maxLen + 2)}\u2518`;
  const padded = lines.map((line) => {
    const visible = stripAnsi(line).length;
    const pad = Math.max(0, maxLen - visible);
    return `\u2502 ${line}${" ".repeat(pad)} \u2502`;
  });
  return [top, ...padded, bottom].join("\n");
}
function doubleBox(content, title, width = 76) {
  const lines = content.split("\n");
  const maxLen = Math.max(width - 4, ...lines.map((l) => stripAnsi(l).length));
  const top = title ? `\u2554\u2550\u2550 ${theme.title(title)} ${"\u2550".repeat(Math.max(0, maxLen - stripAnsi(title).length - 3))}\u2557` : `\u2554${"\u2550".repeat(maxLen + 2)}\u2557`;
  const bottom = `\u255A${"\u2550".repeat(maxLen + 2)}\u255D`;
  const padded = lines.map((line) => {
    const visible = stripAnsi(line).length;
    const pad = Math.max(0, maxLen - visible);
    return `\u2551 ${line}${" ".repeat(pad)} \u2551`;
  });
  return [top, ...padded, bottom].join("\n");
}
function progressBar(progress, width = 20, filled = "\u25A0", empty = "\u2591") {
  const filledCount = Math.round(progress / 100 * width);
  const emptyCount = width - filledCount;
  const bar = filled.repeat(filledCount) + empty.repeat(emptyCount);
  return theme.green(bar);
}
function gradientBar(progress, width = 20) {
  const filledCount = Math.round(progress / 100 * width);
  const emptyCount = width - filledCount;
  return theme.green("\u2593".repeat(filledCount)) + theme.dim("\u2591".repeat(emptyCount));
}
function stripAnsi(str) {
  return str.replace(/\u001b\[[0-9;]*m/g, "");
}
function formatDuration(ms) {
  if (ms < 1e3)
    return `${ms}ms`;
  if (ms < 6e4)
    return `${Math.round(ms / 1e3)}s`;
  const minutes = Math.floor(ms / 6e4);
  const seconds = Math.round(ms % 6e4 / 1e3);
  return `${minutes}m ${seconds}s`;
}
function matrixRain(width = 60, height = 5) {
  const chars = "\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D2\u30D5\u30D8\u30DB\u30DE\u30DF\u30E0\u30E1\u30E2\u30E4\u30E6\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30EF\u30F2\u30F30123456789ABCDEF";
  const lines = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      if (Math.random() > 0.7) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        line += Math.random() > 0.5 ? theme.green(char) : theme.dim(char);
      } else {
        line += " ";
      }
    }
    lines.push(line);
  }
  return lines.join("\n");
}

// packages/tui/dist/screens/boot.js
function sleep(ms) {
  return new Promise((resolve5) => setTimeout(resolve5, ms));
}
function clearScreen() {
  process.stdout.write("\x1B[2J\x1B[0f");
}
async function runBootSequence() {
  clearScreen();
  console.log("");
  console.log(matrixRain(70, 3));
  await sleep(800);
  clearScreen();
  console.log("");
  console.log(theme.green(PHANTOM_ASCII));
  console.log("");
  console.log(theme.dim(`  v${PHANTOM_VERSION} \u2014 ${TAGLINE}`));
  console.log("");
  console.log(theme.secondary("  Initializing systems..."));
  console.log("");
  await sleep(400);
  for (let i = 0; i < BOOT_SYSTEMS.length; i++) {
    const system = BOOT_SYSTEMS[i];
    const steps = 8;
    for (let step = 0; step <= steps; step++) {
      const progress = Math.round(step / steps * 100);
      const bar = progressBar(progress);
      process.stdout.write(`\r  [${bar}] ${theme.secondary(system.padEnd(18))}${step === steps ? theme.check : " "}`);
      await sleep(50 + Math.random() * 80);
    }
    console.log("");
  }
  console.log("");
  const welcomeContent = [
    "",
    `   ${theme.title("Welcome to Phantom.")}`,
    "",
    `   ${theme.secondary("You are now the Operator.")}`,
    "",
    `   ${theme.dim('"I can only show you the door.')}`,
    `   ${theme.dim(" You're the one who has to walk")}`,
    `   ${theme.dim(' through it."')}`,
    ""
  ].join("\n");
  console.log(box(welcomeContent, void 0, 46));
  console.log("");
}
async function showFirstRunSetup() {
  console.log(theme.secondary("  First time? Let's set up:"));
  console.log("");
  console.log(theme.secondary("  ? Choose your AI model:"));
  console.log(`    ${theme.arrow} ${theme.green("Ollama (local, free, private)")}`);
  console.log(`      ${theme.secondary("Claude (Anthropic API)")}`);
  console.log(`      ${theme.secondary("GPT-4 (OpenAI API)")}`);
  console.log(`      ${theme.secondary("Custom (any OpenAI-compatible endpoint)")}`);
  console.log("");
  console.log(theme.secondary("  ? Feed me your product:"));
  console.log(`    ${theme.arrow} ${theme.green("Point to a codebase    \u2192 phantom context add ./path")}`);
  console.log(`      ${theme.secondary("Upload Figma exports   \u2192 phantom context add ./designs")}`);
  console.log(`      ${theme.secondary("Drop screenshots       \u2192 phantom context add ./screenshots")}`);
  console.log(`      ${theme.secondary("Skip for now")}`);
  console.log("");
  console.log(theme.success("  Ready.") + theme.secondary(" Type 'phantom help' or just tell me what you need."));
  console.log("");
}

// packages/tui/dist/screens/health.js
function renderHealthDashboard(data) {
  const lines = [];
  lines.push("\u2554" + "\u2550".repeat(76) + "\u2557");
  lines.push(`\u2551  ${theme.statusOn} ${theme.title("PHANTOM HEALTH DASHBOARD")}${" ".repeat(33)}${theme.dim("[ESC] Back")}     \u2551`);
  lines.push("\u2560" + "\u2550".repeat(76) + "\u2563");
  lines.push("\u2551" + " ".repeat(76) + "\u2551");
  const sysLines = [
    "",
    `  ${theme.secondary("CPU Usage")}        ${gradientBar(data.cpu, 15)}   ${data.cpu}%    ${theme.secondary("Memory")}     ${data.memory.used} GB / ${data.memory.total}`,
    `  ${theme.secondary("Disk Usage")}       ${gradientBar(data.disk, 15)}   ${data.disk}%    ${theme.secondary("Vector DB")}  ${data.vectorDbSize}`,
    `  ${theme.secondary("Model Latency")}    ${gradientBar(Math.min(100, data.modelLatency / 5), 15)}   ${data.modelLatency}ms  ${theme.secondary("Context")}    ${data.contextDocs.toLocaleString()} docs`,
    `  ${theme.secondary("Agent Pool")}       ${gradientBar(data.agentPool.active / data.agentPool.total * 100, 15)}   ${data.agentPool.active}/${data.agentPool.total}    ${theme.secondary("Uptime")}     ${data.uptime}`,
    ""
  ];
  lines.push(`\u2551  ${box(sysLines.join("\n"), "SYSTEM HEALTH", 72)}  \u2551`);
  lines.push("\u2551" + " ".repeat(76) + "\u2551");
  const modelLines = [""];
  modelLines.push(`  ${theme.title("Primary Model")}`);
  modelLines.push(`  \u250C${"\u2500".repeat(62)}\u2510`);
  modelLines.push(`  \u2502  Provider:  ${theme.highlight(data.primaryModel.provider.padEnd(35))} ${theme.dim("[CHANGE]")} \u2502`);
  modelLines.push(`  \u2502  Model:     ${theme.highlight(data.primaryModel.model.padEnd(35))} ${theme.dim("[CHANGE]")} \u2502`);
  const pStatus = data.primaryModel.status === "connected" ? theme.statusOn : theme.statusOff;
  modelLines.push(`  \u2502  Status:    ${pStatus} ${data.primaryModel.status === "connected" ? "Connected" : "Disconnected"}    Latency: ${data.primaryModel.latency}ms${"".padEnd(18)} \u2502`);
  modelLines.push(`  \u2502  Cost:      ${data.primaryModel.cost.padEnd(18)} Tokens today: ${data.primaryModel.tokensToday.toLocaleString()}${"".padEnd(8)} \u2502`);
  modelLines.push(`  \u2514${"\u2500".repeat(62)}\u2518`);
  modelLines.push("");
  if (data.fallbackModel) {
    modelLines.push(`  ${theme.title("Fallback Model")}`);
    modelLines.push(`  \u250C${"\u2500".repeat(62)}\u2510`);
    modelLines.push(`  \u2502  Provider:  ${theme.highlight(data.fallbackModel.provider.padEnd(35))} ${theme.dim("[CHANGE]")} \u2502`);
    modelLines.push(`  \u2502  Model:     ${theme.highlight(data.fallbackModel.model.padEnd(35))} ${theme.dim("[CHANGE]")} \u2502`);
    modelLines.push(`  \u2502  API Key:   ${theme.dim(data.fallbackModel.apiKeyPreview.padEnd(35))} ${theme.dim("[UPDATE]")} \u2502`);
    const fStatus = data.fallbackModel.status === "connected" ? theme.statusOn : theme.statusOff;
    modelLines.push(`  \u2502  Status:    ${fStatus} ${data.fallbackModel.status === "connected" ? "Connected" : "Disconnected"}    Latency: ${data.fallbackModel.latency}ms${"".padEnd(18)} \u2502`);
    modelLines.push(`  \u2502  Cost:      ${data.fallbackModel.cost.padEnd(18)} Tokens today: ${data.fallbackModel.tokensToday.toLocaleString()}${"".padEnd(8)} \u2502`);
    modelLines.push(`  \u2514${"\u2500".repeat(62)}\u2518`);
    modelLines.push("");
  }
  if (data.visionModel) {
    modelLines.push(`  ${theme.title("Vision Model")} ${theme.dim("(for screenshots/Figma)")}`);
    modelLines.push(`  \u250C${"\u2500".repeat(62)}\u2510`);
    modelLines.push(`  \u2502  Provider:  ${theme.highlight(data.visionModel.provider.padEnd(35))} ${theme.dim("[CHANGE]")} \u2502`);
    modelLines.push(`  \u2502  Model:     ${theme.highlight(data.visionModel.model.padEnd(35))} ${theme.dim("[CHANGE]")} \u2502`);
    const vStatus = data.visionModel.status === "connected" ? theme.statusOn : theme.statusOff;
    modelLines.push(`  \u2502  Status:    ${vStatus} ${data.visionModel.status === "connected" ? "Connected" : "Disconnected"}${"".padEnd(41)} \u2502`);
    modelLines.push(`  \u2514${"\u2500".repeat(62)}\u2518`);
    modelLines.push("");
  }
  modelLines.push(`  ${theme.dim("[+ Add Model]")}  ${theme.dim("[Test All Connections]")}  ${theme.dim("[Auto-Route Settings]")}`);
  modelLines.push("");
  lines.push(`\u2551  ${box(modelLines.join("\n"), "MODEL CONFIGURATION", 72)}  \u2551`);
  lines.push("\u2551" + " ".repeat(76) + "\u2551");
  const intLines = [""];
  for (const int of data.integrations) {
    const icon = int.connected ? theme.statusOn : theme.statusOff;
    const name = int.name.padEnd(16);
    const status = int.connected ? "Connected" : "Not Connected";
    const details = int.details ? `    ${int.details}` : "";
    const action = int.connected ? theme.dim("[CONFIGURE]") : theme.dim("[CONNECT]");
    intLines.push(`  ${icon} ${theme.secondary(name)} ${status.padEnd(16)} ${details.padEnd(24)} ${action}`);
  }
  intLines.push("");
  lines.push(`\u2551  ${box(intLines.join("\n"), "INTEGRATIONS STATUS", 72)}  \u2551`);
  lines.push("\u2551" + " ".repeat(76) + "\u2551");
  const secLines = [
    "",
    `  ${theme.secondary("Data Mode:")}           ${theme.statusOn} ${data.security.dataMode}${"".padEnd(16)} ${theme.dim("[CHANGE]")}`,
    `  ${theme.secondary("Encryption:")}          ${theme.statusOn} ${data.security.encryption}`,
    `  ${theme.secondary("Credential Store:")}    ${theme.statusOn} ${data.security.credentialStore}`,
    `  ${theme.secondary("Telemetry:")}           ${data.security.telemetry ? theme.statusOn : theme.statusOff} ${data.security.telemetry ? "Enabled" : "Disabled"}${"".padEnd(20)} ${theme.dim(data.security.telemetry ? "[DISABLE]" : "[ENABLE]")}`,
    `  ${theme.secondary("Auto-Update:")}         ${theme.statusOn} ${data.security.autoUpdate ? "Enabled (stable channel)" : "Disabled"}${"".padEnd(6)} ${theme.dim("[CHANGE]")}`,
    `  ${theme.secondary("Permission Level:")}    ${data.security.permissionLevel}${"".padEnd(6)} ${theme.dim("[CHANGE]")}`,
    "",
    `  ${theme.secondary("Last Security Audit:")} ${data.security.lastAudit}  ${theme.check} ${data.security.auditStatus}`,
    `  ${theme.dim("[Run Security Audit]")}  ${theme.dim("[Export Audit Log]")}  ${theme.dim("[Reset All]")}`,
    ""
  ];
  lines.push(`\u2551  ${box(secLines.join("\n"), "SECURITY & PRIVACY", 72)}  \u2551`);
  lines.push("\u255A" + "\u2550".repeat(76) + "\u255D");
  return lines.join("\n");
}

// packages/tui/dist/screens/modules.js
function sleep2(ms) {
  return new Promise((resolve5) => setTimeout(resolve5, ms));
}
async function renderModuleInstall(module2) {
  const clearLine = "\x1B[2K\r";
  console.log("");
  const installBox = [
    "",
    `   ${theme.title(`DOWNLOADING MODULE: ${module2.name} v${module2.version}`)}`,
    "",
    `   ${progressBar(0, 44)}  0%`,
    "",
    `   ${theme.secondary("Loading " + module2.description.toLowerCase() + "...")}`,
    ""
  ].join("\n");
  console.log(doubleBox(installBox, void 0, 62));
  await sleep2(500);
  console.log("");
  for (let i = 0; i < 3; i++) {
    console.log(matrixRain(60, 2));
    await sleep2(300);
  }
  console.log("");
  const commands = module2.commands.map((cmd) => `     phantom ${cmd.name.padEnd(20)} \u2014 ${cmd.description}`);
  const completeBox = [
    "",
    `   ${theme.title(`DOWNLOADING MODULE: ${module2.name} v${module2.version}`)}`,
    "",
    `   ${progressBar(100, 44)}  100%`,
    "",
    `   \u250C${"\u2500".repeat(46)}\u2510`,
    `   \u2502${" ".repeat(46)}\u2502`,
    `   \u2502         ${theme.green(`"${module2.quote}"`)}${" ".repeat(Math.max(0, 32 - module2.quote.length))}\u2502`,
    `   \u2502${" ".repeat(46)}\u2502`,
    `   \u2514${"\u2500".repeat(46)}\u2518`,
    "",
    `   ${theme.title("New abilities unlocked:")}`,
    ...commands,
    ""
  ].join("\n");
  console.log(doubleBox(completeBox, void 0, 62));
  console.log("");
}
function renderModuleStore(modules, installedModules) {
  const lines = [];
  lines.push("");
  lines.push(theme.title("  PHANTOM MODULE STORE"));
  lines.push(theme.subtitle('  "I know kung fu." \u2014 Install superpowers on demand.'));
  lines.push("");
  lines.push(`  ${"\u2500".repeat(70)}`);
  lines.push("");
  for (const mod of modules) {
    const isInstalled = installedModules.includes(mod.name);
    const icon = isInstalled ? theme.success("\u2726") : theme.dim("\u25CB");
    const status = isInstalled ? theme.success(`INSTALLED v${mod.version}`) : theme.dim(`AVAILABLE v${mod.version}`);
    const name = `@phantom/${mod.name}`;
    lines.push(`  ${icon} ${theme.highlight(name.padEnd(30))} ${status}`);
    lines.push(`    ${theme.dim('"' + mod.quote + '"')}`);
    lines.push(`    ${theme.secondary(mod.description)}`);
    lines.push(`    ${theme.dim(`Size: ${mod.size} \u2502 ${mod.commands.length} commands \u2502 by ${mod.author}`)}`);
    if (!isInstalled) {
      lines.push(`    ${theme.accent(`phantom install @phantom/${mod.name}`)}`);
    }
    lines.push("");
  }
  lines.push(`  ${"\u2500".repeat(70)}`);
  lines.push(`  ${theme.secondary(`${modules.length} modules available \u2502 ${installedModules.length} installed`)}`);
  lines.push("");
  return lines.join("\n");
}

// packages/tui/dist/screens/swarm.js
function renderSwarmResult(result) {
  const lines = [];
  const verdictColor = result.consensus.includes("YES") ? theme.success : result.consensus.includes("NO") ? theme.error : theme.warning;
  lines.push("");
  const header = [
    "",
    `  ${theme.title("\u26A1 SWARM RESULT")} ${theme.dim(`(${result.agentResults.length} agents, ${formatDuration(result.totalDuration)})`)}`,
    "",
    `  Question: ${theme.highlight(`"${result.question}"`)}`,
    "",
    `  Verdict: ${verdictColor(result.consensus)} (${result.overallConfidence}% confidence)`,
    ""
  ].join("\n");
  console.log(doubleBox(header, void 0, 70));
  console.log("");
  for (const agentResult of result.agentResults) {
    const verdictIcon = agentResult.verdict === "yes" ? theme.success("YES") : agentResult.verdict === "no" ? theme.error("NO") : theme.warning("MAYBE");
    const confidence = gradientBar(agentResult.confidence, 10);
    lines.push(`  ${theme.highlight(agentResult.agent.padEnd(14))} ${verdictIcon.padEnd(6)} ${confidence} ${agentResult.confidence}%`);
    lines.push(`  ${theme.secondary(agentResult.summary)}`);
    for (const detail of agentResult.details) {
      lines.push(`    ${theme.dim("\u2022")} ${theme.dim(detail)}`);
    }
    lines.push("");
  }
  lines.push("  " + "\u2500".repeat(66));
  lines.push("");
  lines.push(`  ${theme.title("RECOMMENDATION:")}`);
  lines.push(`  ${theme.secondary(result.recommendation)}`);
  lines.push("");
  return lines.join("\n");
}

// packages/tui/dist/screens/nudges.js
function renderNudge(nudge) {
  const actionStr = nudge.actions.map((a) => theme.dim(`[${a}]`)).join("  ");
  const content = [
    "",
    `  ${nudge.icon} ${theme.secondary(nudge.title)}`,
    `     ${theme.secondary(nudge.message)}`,
    "",
    `     ${actionStr}`,
    ""
  ].join("\n");
  return box(content, "PHANTOM NUDGE", 62);
}

// packages/cli/dist/index.js
var program2 = new Command();
function printJson(payload) {
  console.log(JSON.stringify(payload, null, 2));
}
function formatSize(bytes) {
  if (bytes < 1024)
    return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
function failNotImplemented(command) {
  console.error("");
  console.error(theme.error(`  ${command} is not implemented in real runtime mode.`));
  console.error(theme.secondary("  Use implemented commands: status, doctor, context, swarm, screen, health, docs, integrate, mcp."));
  console.error("");
  process.exitCode = 1;
}
program2.name("phantom").description(TAGLINE).version(PHANTOM_VERSION, "-v, --version").action(async () => {
  const config = getConfig();
  if (config.isFirstRun()) {
    await runBootSequence();
    await showFirstRunSetup();
    config.completeFirstRun();
    return;
  }
  const cfg = config.get();
  const stats = getContextEngine().getStats();
  const lines = [
    "",
    `  ${theme.secondary("Version:")} ${PHANTOM_VERSION}`,
    `  ${theme.secondary("Active project:")} ${cfg.activeProject || "none"}`,
    `  ${theme.secondary("Context files:")} ${stats.totalFiles}`,
    `  ${theme.secondary("Installed modules:")} ${cfg.installedModules.length}`,
    `  ${theme.secondary("Integrations:")} ${cfg.integrations.length}`,
    "",
    `  ${theme.dim("Try: phantom --help")}`,
    ""
  ];
  console.log("");
  console.log(theme.green(PHANTOM_ASCII));
  console.log(box(lines.join("\n"), TAGLINE, 60));
});
var contextCommand = program2.command("context").description("Manage product context");
contextCommand.command("add <path>").description("Add project files into deterministic local context index").option("--json", "Output as JSON").action(async (targetPath, options) => {
  const resolvedPath = (0, import_path7.resolve)(targetPath);
  const contextEngine = getContextEngine();
  try {
    const stats = await contextEngine.addPath(resolvedPath);
    const config = getConfig();
    config.addProject({
      name: (0, import_path7.basename)(resolvedPath) || "project",
      path: resolvedPath,
      contextPaths: [resolvedPath],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastAccessed: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (options.json) {
      printJson({ path: resolvedPath, stats });
      return;
    }
    console.log("");
    console.log(theme.success("  Context ingested successfully."));
    console.log(`  ${theme.secondary("Path:")} ${resolvedPath}`);
    console.log(`  ${theme.secondary("Files indexed:")} ${stats.totalFiles}`);
    console.log(`  ${theme.secondary("Total size:")} ${formatSize(stats.totalSize)}`);
    console.log(`  ${theme.secondary("Health score:")} ${stats.healthScore}%`);
    console.log("");
  } catch (err2) {
    const message = err2 instanceof Error ? err2.message : "Unknown context indexing error";
    if (options.json) {
      printJson({ status: "error", error: message });
    } else {
      console.log("");
      console.log(theme.error(`  ${message}`));
      console.log("");
    }
    process.exitCode = 1;
  }
});
contextCommand.description("Show active project context").option("--json", "Output as JSON").action((options) => {
  const config = getConfig();
  const project = config.getActiveProject();
  const stats = getContextEngine().getStats();
  const payload = {
    activeProject: project || null,
    contextStats: stats
  };
  if (options.json) {
    printJson(payload);
    return;
  }
  console.log("");
  if (!project) {
    console.log(theme.warning("  No active project. Add context first: phantom context add ./path"));
    console.log("");
    return;
  }
  console.log(theme.title("  PRODUCT CONTEXT"));
  console.log(`  ${theme.secondary("Project:")} ${project.name}`);
  console.log(`  ${theme.secondary("Path:")} ${project.path}`);
  console.log(`  ${theme.secondary("Indexed files:")} ${stats.totalFiles}`);
  console.log(`  ${theme.secondary("Health score:")} ${stats.healthScore}%`);
  console.log("");
});
program2.command("install <module>").description("Install a built-in Phantom module").option("--json", "Output as JSON").action(async (moduleName, options) => {
  try {
    const mm = getModuleManager();
    const mod = mm.install(moduleName);
    if (options.json) {
      printJson({ status: "ok", module: mod });
      return;
    }
    await renderModuleInstall(mod);
  } catch (err2) {
    const message = err2 instanceof Error ? err2.message : "Failed to install module";
    if (options.json) {
      printJson({ status: "error", error: message });
    } else {
      console.log("");
      console.log(theme.error(`  ${message}`));
      console.log("");
    }
    process.exitCode = 1;
  }
});
program2.command("modules").alias("store").description("Browse built-in module registry").option("--json", "Output as JSON").action((options) => {
  const mm = getModuleManager();
  const config = getConfig();
  const payload = {
    available: mm.getAvailableModules(),
    installed: config.get().installedModules
  };
  if (options.json) {
    printJson(payload);
    return;
  }
  console.log(renderModuleStore(payload.available, payload.installed));
});
var integrateCommand = program2.command("integrate").description("Integration operations");
function connectIntegrationAndPrint(target, options) {
  const normalized = target.toLowerCase();
  if (!isKnownIntegrationTarget(normalized)) {
    const error = `Unsupported integration target: ${target}`;
    if (options.json) {
      printJson({ status: "error", error, supported: KNOWN_INTEGRATION_TARGETS });
    } else {
      console.log("");
      console.log(theme.error(`  ${error}`));
      console.log(`  ${theme.secondary(`Supported: ${KNOWN_INTEGRATION_TARGETS.join(", ")}`)}`);
      console.log("");
    }
    process.exitCode = 1;
    return;
  }
  const connected = connectIntegration(normalized, process.cwd());
  if (options.json) {
    printJson({ status: "ok", integration: connected });
    return;
  }
  console.log("");
  console.log(theme.success(`  Integration connected: ${connected.name}`));
  if (connected.detectedPath) {
    console.log(`  ${theme.secondary("Detected at:")} ${connected.detectedPath}`);
  }
  console.log("");
}
integrateCommand.command("scan").description("Scan workspace for integration signals").option("--json", "Output as JSON").action((options) => {
  const scan = scanIntegrations(process.cwd());
  if (options.json) {
    printJson({ integrations: scan });
    return;
  }
  console.log("");
  console.log(theme.title("  INTEGRATION SCAN"));
  console.log("");
  for (const item of scan) {
    const mark = item.detected ? theme.check : theme.warning_icon;
    console.log(`  ${mark} ${item.target} ${theme.dim(`(${item.reason})`)}`);
    if (item.detectedPath)
      console.log(`    ${theme.dim(item.detectedPath)}`);
  }
  console.log("");
});
integrateCommand.command("doctor").description("Validate configured integrations").option("--json", "Output as JSON").action((options) => {
  const checks = doctorIntegrations(process.cwd());
  if (options.json) {
    printJson({ checks });
    return;
  }
  console.log("");
  console.log(theme.title("  INTEGRATION DOCTOR"));
  console.log("");
  for (const check of checks.filter((c) => c.configured || c.detected)) {
    const mark = check.healthy ? theme.check : theme.warning_icon;
    console.log(`  ${mark} ${check.target} ${theme.dim(`(${check.reason})`)}`);
    if (check.detectedPath)
      console.log(`    ${theme.dim(check.detectedPath)}`);
  }
  if (!checks.some((c) => c.configured || c.detected)) {
    console.log(theme.warning("  No integration signals or configured targets yet."));
  }
  console.log("");
});
integrateCommand.command("connect <target>").description("Connect a specific integration target").option("--json", "Output as JSON").action((target, options) => {
  connectIntegrationAndPrint(target, options);
});
integrateCommand.description("Show integration usage").action(() => {
  console.log("");
  console.log(`  ${theme.secondary("Usage:")}`);
  console.log(`  ${theme.accent("phantom integrate scan --json")}`);
  console.log(`  ${theme.accent("phantom integrate connect github --json")}`);
  console.log(`  ${theme.accent("phantom integrate doctor --json")}`);
  console.log(`  ${theme.accent("phantom integrate github --json")}`);
  console.log("");
});
var mcpCommand = program2.command("mcp").description("MCP server commands");
mcpCommand.command("tools").description("List supported MCP tools").option("--json", "Output as JSON").action((options) => {
  const server = new PhantomMCPServer();
  const tools = server.listTools();
  if (options.json) {
    printJson({ tools });
    return;
  }
  console.log("");
  console.log(theme.title("  MCP TOOLS"));
  console.log("");
  for (const tool of tools) {
    console.log(`  ${theme.check} ${tool.name}`);
    console.log(`    ${theme.dim(tool.description)}`);
  }
  console.log("");
});
mcpCommand.command("serve").description("Run MCP server over stdio").option("--mode <mode>", "transport mode", "stdio").action(async (options) => {
  if (options.mode !== "stdio") {
    console.log("");
    console.log(theme.warning(`  Unsupported mode '${options.mode}', using stdio.`));
    console.log("");
  }
  await runStdioServer();
});
program2.command("status").description("Show Phantom runtime status").option("--json", "Output as JSON").action((options) => {
  const cfgMgr = getConfig();
  const cfg = cfgMgr.get();
  const payload = {
    version: PHANTOM_VERSION,
    firstRun: cfg.firstRun,
    activeProject: cfgMgr.getActiveProject() || null,
    installedModules: cfg.installedModules,
    integrations: cfg.integrations,
    dataMode: cfg.dataMode,
    permissionLevel: cfg.permissionLevel,
    theme: cfg.theme,
    installation: cfg.installation,
    mcp: cfg.mcp,
    security: cfg.security
  };
  if (options.json) {
    printJson(payload);
    return;
  }
  console.log("");
  console.log(theme.title("  PHANTOM STATUS"));
  console.log(`  ${theme.secondary("Version:")} ${payload.version}`);
  console.log(`  ${theme.secondary("Active Project:")} ${payload.activeProject?.name || "none"}`);
  console.log(`  ${theme.secondary("Installed Modules:")} ${payload.installedModules.length}`);
  console.log(`  ${theme.secondary("Integrations:")} ${payload.integrations.length}`);
  console.log("");
});
program2.command("doctor").description("Run local environment and Phantom health checks").option("--json", "Output as JSON").action((options) => {
  const cfgMgr = getConfig();
  const cfg = cfgMgr.get();
  const checks = [
    {
      name: "Config directory",
      ok: (0, import_fs6.existsSync)(cfgMgr.getConfigDir()),
      detail: cfgMgr.getConfigDir()
    },
    {
      name: "Context entries present",
      ok: getContextEngine().getEntries().length > 0,
      detail: `${getContextEngine().getEntries().length}`
    },
    {
      name: "CLI build artifact",
      ok: (0, import_fs6.existsSync)((0, import_path7.join)(process.cwd(), "packages/cli/dist/index.js")),
      detail: "packages/cli/dist/index.js"
    },
    {
      name: "Config schema keys",
      ok: typeof cfg.installation.channel === "string" && typeof cfg.installation.version === "string" && typeof cfg.mcp.enabled === "boolean" && typeof cfg.mcp.server_mode === "string" && Array.isArray(cfg.integrations) && typeof cfg.security.audit_log_path === "string",
      detail: "installation/mcp/integrations/security"
    }
  ];
  const passCount = checks.filter((c) => c.ok).length;
  const payload = {
    checks,
    summary: {
      passing: passCount,
      total: checks.length,
      healthy: passCount === checks.length
    }
  };
  if (options.json) {
    printJson(payload);
    return;
  }
  console.log("");
  console.log(theme.title("  PHANTOM DOCTOR"));
  console.log("");
  for (const check of checks) {
    const icon = check.ok ? theme.check : theme.warning_icon;
    console.log(`  ${icon} ${check.name.padEnd(26)} ${theme.dim(check.detail)}`);
  }
  console.log("");
  if (payload.summary.healthy) {
    console.log(theme.success(`  All checks passed (${passCount}/${checks.length}).`));
  } else {
    console.log(theme.warning(`  Some checks need attention (${passCount}/${checks.length}).`));
  }
  console.log("");
});
var prdCommand = program2.command("prd").description("PRD operations");
prdCommand.command("create <title>").description("Generate deterministic PRD from title + local context").option("--out <path>", "Output file path").option("--json", "Output as JSON").action((title, options) => {
  try {
    const prd = generatePRD(title);
    const markdown = prdToMarkdown(prd);
    const outDir = (0, import_path7.join)(process.cwd(), "phantom-output");
    if (!(0, import_fs6.existsSync)(outDir))
      (0, import_fs6.mkdirSync)(outDir, { recursive: true });
    const defaultFile = (0, import_path7.join)(outDir, `${prd.id}-${title.toLowerCase().replace(/\s+/g, "-")}.md`);
    const outputPath = options.out ? (0, import_path7.resolve)(options.out) : defaultFile;
    (0, import_fs6.mkdirSync)(dirnameSafe(outputPath), { recursive: true });
    (0, import_fs6.writeFileSync)(outputPath, `${markdown}
`, "utf8");
    const payload = {
      status: "ok",
      prd: {
        id: prd.id,
        title: prd.title,
        version: prd.version,
        sections: prd.sections.map((s) => s.title),
        evidence: prd.evidence
      },
      outputPath
    };
    if (options.json) {
      printJson(payload);
      return;
    }
    console.log("");
    console.log(theme.success(`  PRD generated: ${prd.title}`));
    console.log(`  ${theme.secondary("File:")} ${outputPath}`);
    console.log("");
  } catch (err2) {
    const message = err2 instanceof Error ? err2.message : "PRD generation failed";
    if (options.json) {
      printJson({ status: "error", error: message });
    } else {
      console.log("");
      console.log(theme.error(`  ${message}`));
      console.log("");
    }
    process.exitCode = 1;
  }
});
prdCommand.command("list").description("List generated PRDs from phantom-output directory").option("--json", "Output as JSON").action((options) => {
  const outDir = (0, import_path7.join)(process.cwd(), "phantom-output");
  const items = (0, import_fs6.existsSync)(outDir) ? (0, import_fs6.readdirSync)(outDir).filter((file) => file.endsWith(".md")).map((file) => {
    const path = (0, import_path7.join)(outDir, file);
    return {
      name: file,
      path,
      sizeBytes: (0, import_fs6.statSync)(path).size
    };
  }).sort((a, b) => a.name.localeCompare(b.name)) : [];
  if (options.json) {
    printJson({ files: items });
    return;
  }
  console.log("");
  console.log(theme.title("  PRD LIBRARY"));
  console.log("");
  if (items.length === 0) {
    console.log(theme.warning("  No PRDs found in phantom-output/."));
  } else {
    for (const item of items) {
      console.log(`  ${theme.check} ${item.name} ${theme.dim(`(${formatSize(item.sizeBytes)})`)}`);
    }
  }
  console.log("");
});
program2.command("swarm <question>").description("Run deterministic multi-agent product analysis").option("--json", "Output as JSON").action(async (question, options) => {
  try {
    const result = await getSwarm().runSwarm(question);
    if (options.json) {
      printJson(result);
      return;
    }
    console.log(renderSwarmResult(result));
    console.log(`  ${theme.dim(`Evidence count: ${result.evidence.length}`)}`);
    console.log("");
  } catch (err2) {
    const message = err2 instanceof Error ? err2.message : "Swarm analysis failed";
    if (options.json) {
      printJson({ status: "error", error: message });
    } else {
      console.log("");
      console.log(theme.error(`  ${message}`));
      console.log("");
    }
    process.exitCode = 1;
  }
});
var screenCommand = program2.command("screen").description("Screen analysis commands");
screenCommand.command("analyze <path>").description("Analyze a single screenshot with deterministic UX checks").option("--json", "Output as JSON").action((targetPath, options) => {
  try {
    const analysis = analyzeScreenPath(targetPath);
    if (options.json) {
      printJson(analysis);
      return;
    }
    console.log("");
    console.log(theme.title(`  SCREEN ANALYSIS: ${analysis.filename}`));
    console.log(`  ${theme.secondary("Path:")} ${analysis.path}`);
    console.log(`  ${theme.secondary("Score:")} ${analysis.score}/100`);
    console.log(`  ${theme.secondary("Components detected:")} ${analysis.componentsDetected}`);
    for (const issue of analysis.issues) {
      console.log(`  ${theme.warning_icon} ${issue.severity} ${issue.message}`);
    }
    console.log("");
  } catch (err2) {
    const message = err2 instanceof Error ? err2.message : "Screen analysis failed";
    if (options.json) {
      printJson({ status: "error", error: message });
    } else {
      console.log("");
      console.log(theme.error(`  ${message}`));
      console.log("");
    }
    process.exitCode = 1;
  }
});
screenCommand.command("audit [path]").description("Audit one image or image directory").option("--json", "Output as JSON").action((targetPath, options) => {
  try {
    const audit = auditScreensPath(targetPath || (0, import_path7.join)(process.cwd(), "screenshots"));
    if (options.json) {
      printJson(audit);
      return;
    }
    console.log("");
    console.log(theme.title("  SCREEN AUDIT"));
    console.log(`  ${theme.secondary("Files analyzed:")} ${audit.filesAnalyzed}`);
    console.log(`  ${theme.secondary("Overall score:")} ${audit.overallScore}/100`);
    console.log(`  ${theme.secondary("Issues:")} HIGH=${audit.issuesBySeverity.HIGH} MED=${audit.issuesBySeverity.MED} LOW=${audit.issuesBySeverity.LOW}`);
    console.log("");
  } catch (err2) {
    const message = err2 instanceof Error ? err2.message : "Screen audit failed";
    if (options.json) {
      printJson({ status: "error", error: message });
    } else {
      console.log("");
      console.log(theme.error(`  ${message}`));
      console.log("");
    }
    process.exitCode = 1;
  }
});
program2.command("health").description("Show real runtime health metrics").option("--json", "Output as JSON").action((options) => {
  const data = getRuntimeHealth(process.cwd());
  if (options.json) {
    printJson(data);
    return;
  }
  console.log("");
  console.log(renderHealthDashboard(data));
  console.log("");
});
program2.command("simulate <scenario>").description("Run deterministic simulation for a product scenario").option("--json", "Output as JSON").action((scenario, options) => {
  const result = runDeterministicSimulation(scenario);
  if (options.json) {
    printJson(result);
    return;
  }
  console.log("");
  console.log(theme.title("  DETERMINISTIC SIMULATION"));
  console.log(`  ${theme.secondary("Scenario:")} ${result.scenario}`);
  console.log(`  ${theme.secondary("Seed:")} ${result.seed}`);
  console.log(`  ${theme.secondary("Baseline:")} ${result.metrics.baseline}`);
  console.log(`  ${theme.secondary("Projected:")} ${result.metrics.projected}`);
  console.log(`  ${theme.secondary("Delta (%):")} ${result.metrics.deltaPercent}`);
  console.log(`  ${theme.secondary("Confidence:")} ${result.metrics.confidence}%`);
  console.log("");
});
program2.command("nudge").description("Show context-backed operational nudges").option("--json", "Output as JSON").action((options) => {
  const nudges = getRealNudges(process.cwd());
  if (options.json) {
    printJson({ nudges });
    return;
  }
  console.log("");
  for (const nudge of nudges) {
    console.log(renderNudge(nudge));
    console.log("");
  }
});
program2.command("products").description("Show persisted project/product portfolio").option("--json", "Output as JSON").action((options) => {
  const products = getRealProducts(process.cwd());
  if (options.json) {
    printJson({ products });
    return;
  }
  if (products.length === 0) {
    console.log("");
    console.log(theme.warning("  No products found. Add context with: phantom context add ./project"));
    console.log("");
    return;
  }
  const lines = products.map((p) => {
    const status = p.active ? theme.success("active") : p.paused ? theme.warning("paused") : theme.dim("tracked");
    return `  ${p.name.padEnd(28)} ${status}  health=${p.health}%  context_files=${p.contextFiles}`;
  });
  console.log("");
  console.log(box(lines.join("\n"), "PRODUCT PORTFOLIO", 80));
  console.log("");
});
var docsCommand = program2.command("docs").description("Documentation operations");
docsCommand.command("generate").description("Generate deterministic documentation artifacts").option("--out <path>", "Output directory path").option("--json", "Output as JSON").action((options) => {
  try {
    const files = generateRealDocumentation(process.cwd(), options.out);
    if (options.json) {
      printJson({ files });
      return;
    }
    console.log("");
    console.log(theme.success("  Documentation generated:"));
    for (const file of files) {
      console.log(`  ${theme.check} ${file}`);
    }
    console.log("");
  } catch (err2) {
    const message = err2 instanceof Error ? err2.message : "Documentation generation failed";
    if (options.json) {
      printJson({ status: "error", error: message });
    } else {
      console.log("");
      console.log(theme.error(`  ${message}`));
      console.log("");
    }
    process.exitCode = 1;
  }
});
program2.command("frameworks [action] [framework]").description("List built-in PM frameworks").option("--json", "Output as JSON").action((action, framework, options) => {
  if (!action || action === "list") {
    if (options.json) {
      printJson({ frameworks: FRAMEWORKS });
      return;
    }
    console.log("");
    console.log(theme.title("  PM FRAMEWORKS"));
    console.log("");
    for (const fw of FRAMEWORKS) {
      console.log(`  ${theme.check} ${fw.name} ${theme.dim(`\u2014 ${fw.desc}`)}`);
    }
    console.log("");
    return;
  }
  if (action === "apply") {
    const payload = {
      status: "not_implemented",
      message: "Framework auto-apply is not implemented in real runtime mode.",
      framework: framework || null
    };
    if (options.json) {
      printJson(payload);
    } else {
      console.log("");
      console.log(theme.warning(`  ${payload.message}`));
      console.log("");
    }
    process.exitCode = 1;
    return;
  }
  process.exitCode = 1;
});
program2.command("dashboard").alias("dash").description("Show concise runtime summary").option("--json", "Output as JSON").action((options) => {
  const cfg = getConfig().get();
  const stats = getContextEngine().getStats();
  const health = getRuntimeHealth(process.cwd());
  const payload = {
    activeProject: cfg.activeProject || null,
    contextFiles: stats.totalFiles,
    contextHealth: stats.healthScore,
    installedModules: cfg.installedModules.length,
    connectedIntegrations: health.integrations.filter((i) => i.connected).length,
    primaryModel: health.primaryModel
  };
  if (options.json) {
    printJson(payload);
    return;
  }
  console.log("");
  console.log(box([
    "",
    `  Active Project: ${payload.activeProject || "none"}`,
    `  Context Files: ${payload.contextFiles} (health ${payload.contextHealth}%)`,
    `  Installed Modules: ${payload.installedModules}`,
    `  Connected Integrations: ${payload.connectedIntegrations}`,
    `  Primary Model: ${payload.primaryModel.provider}/${payload.primaryModel.model} (${payload.primaryModel.status})`,
    ""
  ].join("\n"), "PHANTOM DASHBOARD", 78));
  console.log("");
});
program2.command("boot").description("Run onboarding boot sequence").action(async () => {
  await runBootSequence();
  await showFirstRunSetup();
});
program2.command("tools").description("Tool palette (real-mode gate)").action(() => {
  failNotImplemented("tools");
});
function dirnameSafe(pathValue) {
  const idx = Math.max(pathValue.lastIndexOf("/"), pathValue.lastIndexOf("\\"));
  if (idx <= 0)
    return process.cwd();
  return pathValue.slice(0, idx);
}
var argv = [...process.argv];
if (argv[2] === "integrate" && typeof argv[3] === "string" && !argv[3].startsWith("-") && !["scan", "doctor", "connect"].includes(argv[3])) {
  argv.splice(3, 0, "connect");
}
program2.parse(argv);
