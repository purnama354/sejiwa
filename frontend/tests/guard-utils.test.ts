import { describe, it, expect } from "bun:test"
import { computeRedirect } from "@/router/guard-utils"

describe("computeRedirect", () => {
  it("returns /login when no role", () => {
    expect(computeRedirect(undefined, ["user"]).toString()).toContain("/login")
  })

  it("returns default route for role when not allowed (admin -> /admin)", () => {
    const redirect = computeRedirect("admin", ["user"]) as string
    expect(redirect).toBe("/admin")
  })

  it("returns null when allowed", () => {
    expect(computeRedirect("moderator", ["moderator"])).toBeNull()
  })
})
