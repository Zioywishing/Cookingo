import { describe, expect, test } from "bun:test";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dir, "..");

function createExecutable(dir: string, name: string, content: string) {
  const filePath = join(dir, name);
  writeFileSync(filePath, content, "utf8");
  chmodSync(filePath, 0o755);
}

function setupFakeCommands() {
  const tempRoot = mkdtempSync(join(tmpdir(), "vibe-termux-test-"));
  const binDir = join(tempRoot, "bin");
  const logPath = join(tempRoot, "tmux.log");

  writeFileSync(logPath, "", "utf8");
  mkdirSync(binDir, { recursive: true });

  createExecutable(
    binDir,
    "tmux",
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "$TMUX_LOG"

if [[ "$1" == "has-session" ]]; then
  exit 1
fi

exit 0
`,
  );

  for (const commandName of ["bun", "codex", "claude"]) {
    createExecutable(
      binDir,
      commandName,
      `#!/usr/bin/env bash
exit 0
`,
    );
  }

  return { binDir, logPath, tempRoot };
}

function runVibeTermux({
  args,
  input,
}: {
  args?: string[];
  input?: string;
}) {
  const { binDir, logPath, tempRoot } = setupFakeCommands();
  const result = spawnSync(
    "bash",
    [
      "-c",
      input
        ? `printf '${input}' | script -qfec './vibe-termux.sh ${args?.join(" ") ?? ""}' /dev/null`
        : `script -qfec './vibe-termux.sh ${args?.join(" ") ?? ""}' /dev/null`,
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ""}`,
        TMUX_LOG: logPath,
        VIBE_TMUX_SESSION: "vibe-termux-test",
      },
    },
  );

  const log = readFileSync(logPath, "utf8");

  rmSync(tempRoot, { force: true, recursive: true });

  return { log, result };
}

describe("vibe-termux.sh", () => {
  test("interactive codex selection enables yolo by default", () => {
    const { log, result } = runVibeTermux({
      input: "\\n\\n",
    });

    expect(result.status).toBe(0);
    expect(log).toContain("new-window");
    expect(log).toContain("codex --yolo");
  });

  test("interactive codex selection can disable yolo mode", () => {
    const { log, result } = runVibeTermux({
      input: "\\n\\033[B\\n",
    });

    expect(result.status).toBe(0);
    expect(log).toContain("new-window");
    expect(log).toContain(" codex");
    expect(log).not.toContain("codex --yolo");
  });

  test("explicit codex argument keeps the original non-yolo command", () => {
    const { log, result } = runVibeTermux({
      args: ["codex"],
    });

    expect(result.status).toBe(0);
    expect(log).toContain("new-window");
    expect(log).toContain(" codex");
    expect(log).not.toContain("codex --yolo");
  });
});
