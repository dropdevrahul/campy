import { test, expect, beforeEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { rmSync } from "node:fs"

const STATE = join(tmpdir(), `campy-mcp-test-${process.pid}.json`)
process.env.CAMPY_STATE = STATE

import { dispatch } from "../adapters/mcp/server"
import { readState } from "../core/store"

beforeEach(() => {
  try { rmSync(STATE) } catch { /* fresh */ }
})

const call = (name: string, args: Record<string, any> = {}) =>
  dispatch({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) as any

test("initialize advertises protocol + serverInfo", () => {
  const res = dispatch({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }) as any
  expect(res.result.protocolVersion).toBe("2025-06-18")
  expect(res.result.serverInfo.name).toBe("campy")
  expect(res.result.capabilities.tools).toBeDefined()
})

test("notifications return null (no response)", () => {
  expect(dispatch({ jsonrpc: "2.0", method: "notifications/initialized" })).toBeNull()
})

test("tools/list exposes the campy tools", () => {
  const res = dispatch({ jsonrpc: "2.0", id: 2, method: "tools/list" }) as any
  const names = res.result.tools.map((t: any) => t.name)
  expect(names).toContain("campy_status")
  expect(names).toContain("campy_feed")
  expect(names).toContain("campy_switch")
})

test("campy_feed returns text content and raises happiness", () => {
  const before = readState().happiness
  const res = call("campy_feed")
  expect(res.result.content[0].type).toBe("text")
  expect(res.result.content[0].text.length).toBeGreaterThan(0)
  expect(readState().happiness).toBe(before + 15)
})

test("campy_switch to a valid pet updates the store", () => {
  call("campy_switch", { pet: "robot" })
  expect(readState().pet).toBe("robot")
})

test("campy_switch to an unknown pet is an error result", () => {
  const res = call("campy_switch", { pet: "unicorn" })
  expect(res.result.isError).toBe(true)
})

test("unknown method with an id returns -32601", () => {
  const res = dispatch({ jsonrpc: "2.0", id: 9, method: "bogus" }) as any
  expect(res.error.code).toBe(-32601)
})
