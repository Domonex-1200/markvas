import vm from "node:vm";
import type { PluginRunResult } from "@markdown-canvas/shared";

const FORBIDDEN_GLOBALS = ["require", "process", "Buffer", "global", "module", "exports"];

export async function runPluginInSandbox(code: string, input: unknown): Promise<PluginRunResult> {
  const logs: string[] = [];
  const sandbox = vm.createContext({
    input: structuredClone(input),
    console: {
      log: (...args: unknown[]) => logs.push(args.map(String).join(" "))
    },
    result: undefined
  });

  for (const name of FORBIDDEN_GLOBALS) {
    Object.defineProperty(sandbox, name, {
      value: undefined,
      writable: false,
      configurable: false
    });
  }

  const script = new vm.Script(
    `"use strict";
    const plugin = (() => {
      ${code}
    })();
    result = typeof plugin === "function" ? plugin(input) : plugin;`
  );

  script.runInContext(sandbox, { timeout: 750, breakOnSigint: false });
  return { output: sandbox.result, logs };
}
