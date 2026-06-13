import { test, expect } from "bun:test"
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { detectAgents } from "../core/detect"

const fresh = () => mkdtempSync(join(tmpdir(), "campy-detect-"))

test("detects agents by their config dirs, in order", () => {
  const home = fresh()
  const cwd = fresh()
  mkdirSync(join(home, ".claude"))
  mkdirSync(join(home, ".gemini"))
  mkdirSync(join(home, ".cursor"))
  expect(detectAgents({ home, cwd })).toEqual(["claude-code", "gemini", "cursor"])
})

test("opencode detected from cwd/.opencode", () => {
  const home = fresh()
  const cwd = fresh()
  mkdirSync(join(cwd, ".opencode"))
  expect(detectAgents({ home, cwd })).toEqual(["opencode"])
})

test("aider detected from .aider.conf.yml", () => {
  const home = fresh()
  const cwd = fresh()
  writeFileSync(join(cwd, ".aider.conf.yml"), "")
  expect(detectAgents({ home, cwd })).toEqual(["aider"])
})

test("nothing detected on empty dirs", () => {
  expect(detectAgents({ home: fresh(), cwd: fresh() })).toEqual([])
})
