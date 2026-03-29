import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const projectRoot = resolve(import.meta.dir, "..")

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8")
}

describe("admin message center", () => {
  test("adds a shared admin message center composable", () => {
    const source = readProjectFile("app/composables/useAdminMessageCenter.ts")

    expect(source).toContain('type AdminMessageType = "success" | "error" | "info"')
    expect(source).toContain('useState<AdminMessageItem[]>("admin-message-center"')
    expect(source).toContain("duration: options?.duration ?? 2000")
    expect(source).toContain("setTimeout(() => remove(item.id), item.duration)")
  })

  test("mounts a top-center message component in the admin layout", () => {
    const layout = readProjectFile("app/layouts/admin.vue")
    const messageCenter = readProjectFile("app/components/admin/shell/AdminMessageCenter.vue")

    expect(layout).toContain("<AdminShellAdminMessageCenter />")
    expect(layout).toContain("onErrorCaptured")
    expect(layout).toContain("页面执行出现异常，请稍后重试")
    expect(messageCenter).toContain("<Teleport to=\"body\">")
    expect(messageCenter).toContain("<TransitionGroup")
    expect(messageCenter).toContain("admin-message-center")
    expect(messageCenter).toContain("top: 1.25rem")
    expect(messageCenter).toContain("z-index: 80")
  })

  test("adds request feedback helpers for action and load flows", () => {
    const source = readProjectFile("app/composables/useAdminRequestFeedback.ts")

    expect(source).toContain("function showSuccess(message: string)")
    expect(source).toContain("function showError(message: string)")
    expect(source).toContain("function handleResponse")
    expect(source).toContain("function run")
    expect(source).toContain("function load")
    expect(source).toContain("response.code !== 0")
  })
})
