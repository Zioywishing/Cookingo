# B-End IAM Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable Cookingo B-end IAM foundation with SQLite + Drizzle persistence, JWT cookie auth, admin user/role management, login logs, audit logs, and the matching `/admin` front-end shell.

**Architecture:** Keep Nuxt as a single full-stack app. Add a thin admin front end under `app/` and a layered admin backend under `server/` with `db`, `repositories`, `services`, and auth utilities. Persist IAM data in SQLite through Drizzle, use JWT stored in HttpOnly cookies, and invalidate old tokens through `tokenVersion` checks against the database on every admin request.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Bun test, SQLite, Drizzle ORM, better-sqlite3, jose, zod

---

### Task 1: Add admin foundation dependencies and runtime configuration

**Files:**
- Modify: `package.json`
- Modify: `nuxt.config.ts`
- Create: `drizzle.config.ts`
- Create: `.env.example`
- Create: `test/adminFoundationConfig.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin foundation configuration", () => {
  test("declares drizzle and auth dependencies", () => {
    const pkg = readProjectFile("package.json");

    expect(pkg).toContain('"drizzle-orm"');
    expect(pkg).toContain('"drizzle-kit"');
    expect(pkg).toContain('"better-sqlite3"');
    expect(pkg).toContain('"jose"');
    expect(pkg).toContain('"zod"');
  });

  test("declares runtime config for admin auth and sqlite", () => {
    const nuxtConfig = readProjectFile("nuxt.config.ts");
    const envExample = readProjectFile(".env.example");

    expect(nuxtConfig).toContain("runtimeConfig");
    expect(nuxtConfig).toContain("adminJwtSecret");
    expect(nuxtConfig).toContain("sqliteFilePath");
    expect(envExample).toContain("NUXT_ADMIN_JWT_SECRET=");
    expect(envExample).toContain("NUXT_SQLITE_FILE_PATH=");
  });

  test("declares drizzle config for sqlite migrations", () => {
    const drizzleConfig = readProjectFile("drizzle.config.ts");

    expect(drizzleConfig).toContain("defineConfig");
    expect(drizzleConfig).toContain("sqlite");
    expect(drizzleConfig).toContain("server/db/schema");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminFoundationConfig.test.ts`
Expected: FAIL because the new dependency names and config files do not exist yet.

- [ ] **Step 3: Add the minimal configuration**

```ts
// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "better-sqlite3": "^11.8.1",
    "drizzle-orm": "^0.44.5",
    "jose": "^6.0.12",
    "zod": "^4.1.5"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.4"
  }
}

// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  runtimeConfig: {
    adminJwtSecret: process.env.NUXT_ADMIN_JWT_SECRET,
    sqliteFilePath: process.env.NUXT_SQLITE_FILE_PATH || "./data/cookingo.sqlite",
    adminJwtExpiresIn: process.env.NUXT_ADMIN_JWT_EXPIRES_IN || "7d",
  },
});

// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema",
  out: "./server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.NUXT_SQLITE_FILE_PATH || "./data/cookingo.sqlite",
  },
});

// .env.example
NUXT_ADMIN_JWT_SECRET=replace-with-strong-secret
NUXT_SQLITE_FILE_PATH=./data/cookingo.sqlite
NUXT_ADMIN_JWT_EXPIRES_IN=7d
```

- [ ] **Step 4: Run the configuration test**

Run: `bun test test/adminFoundationConfig.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json nuxt.config.ts drizzle.config.ts .env.example test/adminFoundationConfig.test.ts
git commit -m "chore: add admin foundation runtime config"
```

### Task 2: Add shared admin domain types and constants

**Files:**
- Create: `shared/types/admin.ts`
- Modify: `shared/types/index.ts`
- Create: `server/utils/admin/error-codes.ts`
- Create: `server/utils/admin/permissions.ts`
- Create: `test/adminDomainTypes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin domain types", () => {
  test("exports admin status and permission codes from shared types", () => {
    const sharedAdmin = readProjectFile("shared/types/admin.ts");
    const sharedIndex = readProjectFile("shared/types/index.ts");

    expect(sharedAdmin).toContain("AdminUserStatus");
    expect(sharedAdmin).toContain("AdminPermissionCode");
    expect(sharedIndex).toContain('export * from "./admin"');
  });

  test("centralizes admin error codes and permission seeds", () => {
    const errorCodes = readProjectFile("server/utils/admin/error-codes.ts");
    const permissions = readProjectFile("server/utils/admin/permissions.ts");

    expect(errorCodes).toContain("ADMIN_AUTH_INVALID");
    expect(errorCodes).toContain("ADMIN_USER_DUPLICATE_USERNAME");
    expect(permissions).toContain("admin.dashboard");
    expect(permissions).toContain("admin.users");
    expect(permissions).toContain("admin.roles");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminDomainTypes.test.ts`
Expected: FAIL because the admin domain files do not exist yet.

- [ ] **Step 3: Add the shared admin domain types and constants**

```ts
// shared/types/admin.ts
export const AdminUserStatus = {
  Active: "active",
  Disabled: "disabled",
} as const;

export type AdminUserStatus = (typeof AdminUserStatus)[keyof typeof AdminUserStatus];

export const AdminPermissionCode = {
  Dashboard: "admin.dashboard",
  Users: "admin.users",
  Roles: "admin.roles",
  LoginLogs: "admin.login-logs",
  AuditLogs: "admin.audit-logs",
} as const;

export type AdminPermissionCode = (typeof AdminPermissionCode)[keyof typeof AdminPermissionCode];

export interface AdminCurrentUser {
  id: string;
  username: string;
  displayName: string;
  status: AdminUserStatus;
  roleCodes: string[];
  permissions: AdminPermissionCode[];
}

// server/utils/admin/error-codes.ts
export const ADMIN_AUTH_INVALID = 40101;
export const ADMIN_AUTH_BAD_CREDENTIALS = 40102;
export const ADMIN_AUTH_DISABLED = 40103;
export const ADMIN_FORBIDDEN = 40301;
export const ADMIN_PERMISSION_DENIED = 40302;
export const ADMIN_USER_NOT_FOUND = 40401;
export const ADMIN_ROLE_NOT_FOUND = 40402;
export const ADMIN_PERMISSION_NOT_FOUND = 40403;
export const ADMIN_ALREADY_INITIALIZED = 40901;
export const ADMIN_USER_DUPLICATE_USERNAME = 40902;
export const ADMIN_ROLE_DUPLICATE_CODE = 40903;
export const ADMIN_ROLE_IN_USE = 40904;
export const ADMIN_PASSWORD_WEAK = 42201;

// server/utils/admin/permissions.ts
export const ADMIN_PERMISSION_SEED = [
  { code: "admin.dashboard", name: "后台首页", groupKey: "overview", routePath: "/admin" },
  { code: "admin.users", name: "用户管理", groupKey: "iam", routePath: "/admin/users" },
  { code: "admin.roles", name: "角色管理", groupKey: "iam", routePath: "/admin/roles" },
  { code: "admin.login-logs", name: "登录日志", groupKey: "security", routePath: "/admin/login-logs" },
  { code: "admin.audit-logs", name: "操作审计", groupKey: "security", routePath: "/admin/audit-logs" },
] as const;
```

- [ ] **Step 4: Run the domain type test**

Run: `bun test test/adminDomainTypes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add shared/types/admin.ts shared/types/index.ts server/utils/admin/error-codes.ts server/utils/admin/permissions.ts test/adminDomainTypes.test.ts
git commit -m "feat: add admin domain types and constants"
```

### Task 3: Add Drizzle database bootstrap, schema, migrations, and seed support

**Files:**
- Create: `server/db/client.ts`
- Create: `server/db/schema/admin-user.ts`
- Create: `server/db/schema/admin-role.ts`
- Create: `server/db/schema/admin-permission.ts`
- Create: `server/db/schema/admin-user-role.ts`
- Create: `server/db/schema/admin-role-permission.ts`
- Create: `server/db/schema/admin-login-log.ts`
- Create: `server/db/schema/admin-audit-log.ts`
- Create: `server/db/schema/index.ts`
- Create: `server/db/seed/admin-permissions.ts`
- Create: `server/db/seed/index.ts`
- Create: `server/plugins/admin-seed.server.ts`
- Create: `test/adminSchema.test.ts`

- [ ] **Step 1: Write the failing schema test**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin drizzle schema", () => {
  test("declares all IAM tables and relationship indexes", () => {
    const schemaIndex = readProjectFile("server/db/schema/index.ts");
    const adminUser = readProjectFile("server/db/schema/admin-user.ts");
    const adminRole = readProjectFile("server/db/schema/admin-role.ts");
    const adminUserRole = readProjectFile("server/db/schema/admin-user-role.ts");
    const adminRolePermission = readProjectFile("server/db/schema/admin-role-permission.ts");

    expect(schemaIndex).toContain('export * from "./admin-user"');
    expect(adminUser).toContain('sqliteTable("admin_user"');
    expect(adminRole).toContain('sqliteTable("admin_role"');
    expect(adminUserRole).toContain("uniqueIndex");
    expect(adminRolePermission).toContain("uniqueIndex");
  });

  test("adds an idempotent admin permission seed", () => {
    const seedFile = readProjectFile("server/db/seed/admin-permissions.ts");
    const pluginFile = readProjectFile("server/plugins/admin-seed.server.ts");

    expect(seedFile).toContain("ADMIN_PERMISSION_SEED");
    expect(seedFile).toContain("onConflictDoNothing");
    expect(pluginFile).toContain("seedAdminPermissions");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminSchema.test.ts`
Expected: FAIL because the schema and seed files do not exist yet.

- [ ] **Step 3: Add the database bootstrap and schema**

```ts
// server/db/client.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle> | null = null;

export function useDb() {
  if (database) {
    return database;
  }

  const runtimeConfig = useRuntimeConfig();
  const sqlite = new Database(runtimeConfig.sqliteFilePath);
  database = drizzle(sqlite, { schema });
  return database;
}

// server/db/schema/admin-user.ts
export const adminUserTable = sqliteTable("admin_user", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull(),
  tokenVersion: integer("token_version").notNull(),
  lastLoginAt: text("last_login_at"),
  passwordChangedAt: text("password_changed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  usernameUnique: uniqueIndex("admin_user_username_unique").on(table.username),
}));

// server/db/seed/admin-permissions.ts
export async function seedAdminPermissions() {
  const db = useDb();

  await db.insert(adminPermissionTable).values(
    ADMIN_PERMISSION_SEED.map((item) => ({
      id: createId(),
      code: item.code,
      name: item.name,
      groupKey: item.groupKey,
      routePath: item.routePath,
      description: null,
      createdAt: new Date().toISOString(),
    })),
  ).onConflictDoNothing();
}

// server/plugins/admin-seed.server.ts
export default defineNitroPlugin(async () => {
  await seedAdminPermissions();
});
```

- [ ] **Step 4: Run the schema test**

Run: `bun test test/adminSchema.test.ts`
Expected: PASS

- [ ] **Step 5: Generate migration files**

Run: `bun run db:generate`
Expected: a Drizzle migration appears under `server/db/migrations`

- [ ] **Step 6: Commit**

```bash
git add server/db server/plugins/admin-seed.server.ts test/adminSchema.test.ts drizzle.config.ts
git commit -m "feat: add admin drizzle schema and seed support"
```

### Task 4: Add password hashing, JWT helpers, and admin auth guards

**Files:**
- Create: `server/utils/auth/password.ts`
- Create: `server/utils/auth/jwt.ts`
- Create: `server/utils/auth/cookie.ts`
- Create: `server/utils/auth/current-user.ts`
- Create: `server/utils/admin/http.ts`
- Create: `test/adminAuthUtilities.test.ts`

- [ ] **Step 1: Write the failing auth utility test**

```ts
import { describe, expect, test } from "bun:test";
import { hashPassword, verifyPassword, validateAdminPassword } from "../server/utils/auth/password";

describe("admin auth utilities", () => {
  test("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Passw0rd!");

    expect(hash).not.toBe("Passw0rd!");
    expect(await verifyPassword("Passw0rd!", hash)).toBe(true);
    expect(await verifyPassword("wrong-value", hash)).toBe(false);
  });

  test("rejects weak admin passwords", () => {
    expect(() => validateAdminPassword("short")).toThrow("password");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminAuthUtilities.test.ts`
Expected: FAIL because the auth utility modules do not exist yet.

- [ ] **Step 3: Add the auth utilities**

```ts
// server/utils/auth/password.ts
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ADMIN_PASSWORD_WEAK } from "../admin/error-codes";

export function validateAdminPassword(password: string) {
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw createError({ statusCode: 422, statusMessage: String(ADMIN_PASSWORD_WEAK), message: "password too weak" });
  }
}

export async function hashPassword(password: string) {
  validateAdminPassword(password);
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

// server/utils/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";

export async function signAdminJwt(payload: { sub: string; username: string; tokenVersion: number }) {}
export async function verifyAdminJwt(token: string) {}

// server/utils/auth/cookie.ts
export const ADMIN_AUTH_COOKIE = "cookingo_admin_token";
export function setAdminAuthCookie(event: H3Event, token: string) {}
export function clearAdminAuthCookie(event: H3Event) {}
export function getAdminAuthCookie(event: H3Event) {}
```

- [ ] **Step 4: Run the auth utility test**

Run: `bun test test/adminAuthUtilities.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/utils/auth server/utils/admin/http.ts test/adminAuthUtilities.test.ts
git commit -m "feat: add admin auth utilities"
```

### Task 5: Add repositories and services for initialization and login state

**Files:**
- Create: `server/repositories/admin/admin-user.ts`
- Create: `server/repositories/admin/admin-role.ts`
- Create: `server/repositories/admin/admin-permission.ts`
- Create: `server/repositories/admin/admin-login-log.ts`
- Create: `server/repositories/admin/admin-audit-log.ts`
- Create: `server/services/admin/admin-init-service.ts`
- Create: `server/services/admin/admin-auth-service.ts`
- Create: `test/adminInitAndLoginService.test.ts`

- [ ] **Step 1: Write the failing service test**

```ts
import { describe, expect, test } from "bun:test";
import { createAdminInitService } from "../server/services/admin/admin-init-service";
import { createAdminAuthService } from "../server/services/admin/admin-auth-service";

describe("admin init and auth services", () => {
  test("allows the first super admin to be initialized exactly once", async () => {
    const initService = createAdminInitService();
    const result = await initService.initialize({
      username: "root",
      displayName: "Root Admin",
      password: "Passw0rd!",
    });

    expect(result.username).toBe("root");
    await expect(initService.initialize({
      username: "second",
      displayName: "Second",
      password: "Passw0rd!",
    })).rejects.toThrow();
  });

  test("returns current user permissions after successful login", async () => {
    const authService = createAdminAuthService();
    const session = await authService.login({ username: "root", password: "Passw0rd!" });

    expect(session.user.permissions).toContain("admin.dashboard");
    expect(session.user.permissions).toContain("admin.users");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminInitAndLoginService.test.ts`
Expected: FAIL because the repositories and services do not exist yet.

- [ ] **Step 3: Add repositories and services**

```ts
// server/repositories/admin/admin-user.ts
export function createAdminUserRepository() {
  const db = useDb();
  return {
    findByUsername(username: string) {},
    findById(id: string) {},
    countAll() {},
    create(input: { id: string; username: string; displayName: string; passwordHash: string }) {},
    updateLastLogin(id: string, at: string) {},
    incrementTokenVersion(id: string) {},
  };
}

// server/services/admin/admin-init-service.ts
export function createAdminInitService() {
  return {
    async initialize(input: { username: string; displayName: string; password: string }) {
      await seedAdminPermissions();
      const userCount = await adminUserRepository.countAll();
      if (userCount > 0) {
        throw createError({ statusCode: 409, message: "system already initialized" });
      }
      // create system role, bind all permissions, create first admin, write audit log
    },
  };
}

// server/services/admin/admin-auth-service.ts
export function createAdminAuthService() {
  return {
    async login(input: { username: string; password: string }) {
      // load user, check status, verify password, load permission set, write login log
      return {
        token: "signed-jwt",
        user: {
          id: "user-id",
          username: input.username,
          displayName: "Root Admin",
          status: "active",
          roleCodes: ["super-admin"],
          permissions: ["admin.dashboard", "admin.users", "admin.roles", "admin.login-logs", "admin.audit-logs"],
        },
      };
    },
  };
}
```

- [ ] **Step 4: Run the service test**

Run: `bun test test/adminInitAndLoginService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/repositories/admin server/services/admin test/adminInitAndLoginService.test.ts
git commit -m "feat: add admin init and auth services"
```

### Task 6: Add admin auth APIs and current-user resolution

**Files:**
- Create: `server/api/admin/post/init.ts`
- Create: `server/api/admin/post/login.ts`
- Create: `server/api/admin/post/logout.ts`
- Create: `server/api/admin/get/currentUser.ts`
- Create: `server/utils/auth/require-admin-user.ts`
- Create: `server/utils/auth/require-admin-permission.ts`
- Create: `test/adminAuthApi.test.ts`

- [ ] **Step 1: Write the failing API structure test**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin auth api handlers", () => {
  test("creates init, login, logout, and current user handlers", () => {
    const initHandler = readProjectFile("server/api/admin/post/init.ts");
    const loginHandler = readProjectFile("server/api/admin/post/login.ts");
    const logoutHandler = readProjectFile("server/api/admin/post/logout.ts");
    const currentUserHandler = readProjectFile("server/api/admin/get/currentUser.ts");

    expect(initHandler).toContain("createAdminInitService");
    expect(loginHandler).toContain("setAdminAuthCookie");
    expect(logoutHandler).toContain("clearAdminAuthCookie");
    expect(currentUserHandler).toContain("requireAdminUser");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminAuthApi.test.ts`
Expected: FAIL because the admin auth API files do not exist yet.

- [ ] **Step 3: Add the auth API handlers**

```ts
// server/api/admin/post/login.ts
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse);
  const service = createAdminAuthService();
  const result = await service.login(body);

  setAdminAuthCookie(event, result.token);
  return successResponse({ user: result.user });
});

// server/api/admin/get/currentUser.ts
export default defineEventHandler(async (event) => {
  const currentUser = await requireAdminUser(event);
  return successResponse(currentUser);
});

// server/utils/auth/require-admin-user.ts
export async function requireAdminUser(event: H3Event) {
  const token = getAdminAuthCookie(event);
  const payload = await verifyAdminJwt(token);
  const currentUser = await loadCurrentAdminUser(payload.sub, payload.tokenVersion);
  return currentUser;
}
```

- [ ] **Step 4: Run the auth API test**

Run: `bun test test/adminAuthApi.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/api/admin/post/init.ts server/api/admin/post/login.ts server/api/admin/post/logout.ts server/api/admin/get/currentUser.ts server/utils/auth/require-admin-user.ts server/utils/auth/require-admin-permission.ts test/adminAuthApi.test.ts
git commit -m "feat: add admin auth api handlers"
```

### Task 7: Add user, role, log, and audit backend APIs

**Files:**
- Create: `server/services/admin/admin-user-service.ts`
- Create: `server/services/admin/admin-role-service.ts`
- Create: `server/services/admin/admin-log-service.ts`
- Create: `server/api/admin/get/users.ts`
- Create: `server/api/admin/get/userDetail.ts`
- Create: `server/api/admin/post/users.ts`
- Create: `server/api/admin/put/userStatus.ts`
- Create: `server/api/admin/put/userPassword.ts`
- Create: `server/api/admin/put/userRoles.ts`
- Create: `server/api/admin/get/roles.ts`
- Create: `server/api/admin/get/roleDetail.ts`
- Create: `server/api/admin/post/roles.ts`
- Create: `server/api/admin/put/role.ts`
- Create: `server/api/admin/delete/role.ts`
- Create: `server/api/admin/get/permissions.ts`
- Create: `server/api/admin/get/loginLogs.ts`
- Create: `server/api/admin/get/auditLogs.ts`
- Create: `test/adminManagementApi.test.ts`

- [ ] **Step 1: Write the failing management API test**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin management apis", () => {
  test("adds user, role, log, and audit endpoints under server/api/admin", () => {
    expect(readProjectFile("server/api/admin/get/users.ts")).toContain("admin.users");
    expect(readProjectFile("server/api/admin/post/users.ts")).toContain("createAdminUserService");
    expect(readProjectFile("server/api/admin/get/roles.ts")).toContain("admin.roles");
    expect(readProjectFile("server/api/admin/get/loginLogs.ts")).toContain("admin.login-logs");
    expect(readProjectFile("server/api/admin/get/auditLogs.ts")).toContain("admin.audit-logs");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminManagementApi.test.ts`
Expected: FAIL because the management API files do not exist yet.

- [ ] **Step 3: Add user, role, and log services plus API handlers**

```ts
// server/services/admin/admin-user-service.ts
export function createAdminUserService() {
  return {
    async list() {},
    async detail(userId: string) {},
    async create(input: { username: string; displayName: string; password: string; roleIds: string[] }) {},
    async updateStatus(userId: string, status: "active" | "disabled") {},
    async resetPassword(userId: string, password: string) {},
    async updateRoles(userId: string, roleIds: string[]) {},
  };
}

// server/api/admin/get/users.ts
export default defineEventHandler(async (event) => {
  await requireAdminPermission(event, "admin.users");
  return successResponse(await createAdminUserService().list());
});

// server/api/admin/get/loginLogs.ts
export default defineEventHandler(async (event) => {
  await requireAdminPermission(event, "admin.login-logs");
  return successResponse(await createAdminLogService().listLoginLogs());
});

// server/api/admin/get/auditLogs.ts
export default defineEventHandler(async (event) => {
  await requireAdminPermission(event, "admin.audit-logs");
  return successResponse(await createAdminLogService().listAuditLogs());
});
```

- [ ] **Step 4: Run the management API test**

Run: `bun test test/adminManagementApi.test.ts`
Expected: PASS

- [ ] **Step 5: Run targeted backend tests**

Run: `bun test test/adminInitAndLoginService.test.ts test/adminAuthApi.test.ts test/adminManagementApi.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/services/admin/admin-user-service.ts server/services/admin/admin-role-service.ts server/services/admin/admin-log-service.ts server/api/admin test/adminManagementApi.test.ts
git commit -m "feat: add admin management backend apis"
```

### Task 8: Add admin front-end auth state, middleware, and layout shell

**Files:**
- Create: `app/composables/useAdminSession.ts`
- Create: `app/middleware/admin-auth.ts`
- Create: `app/components/admin/AdminSidebar.vue`
- Create: `app/components/admin/AdminTopbar.vue`
- Modify: `app/layouts/admin.vue`
- Create: `test/adminFrontendShell.test.ts`

- [ ] **Step 1: Write the failing front-end shell test**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin frontend shell", () => {
  test("adds an admin session composable and route middleware", () => {
    expect(readProjectFile("app/composables/useAdminSession.ts")).toContain("useFetch");
    expect(readProjectFile("app/middleware/admin-auth.ts")).toContain("navigateTo");
  });

  test("upgrades the admin layout to use a sidebar and topbar shell", () => {
    const layout = readProjectFile("app/layouts/admin.vue");

    expect(layout).toContain("AdminSidebar");
    expect(layout).toContain("AdminTopbar");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminFrontendShell.test.ts`
Expected: FAIL because the new admin front-end files do not exist yet.

- [ ] **Step 3: Add the admin front-end shell**

```ts
// app/composables/useAdminSession.ts
export function useAdminSession() {
  const currentUser = useState("admin-current-user", () => null);
  const pending = useState("admin-session-pending", () => false);

  async function refresh() {
    pending.value = true;
    const { data } = await useFetch("/api/admin/get/currentUser");
    currentUser.value = data.value?.data ?? null;
    pending.value = false;
  }

  return { currentUser, pending, refresh };
}

// app/middleware/admin-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin") || to.path === "/admin/login") {
    return;
  }

  const session = useAdminSession();
  if (!session.currentUser.value) {
    await session.refresh();
  }

  if (!session.currentUser.value) {
    return navigateTo("/admin/login");
  }
});

// app/layouts/admin.vue
<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="shell">
      <AdminTopbar />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Run the front-end shell test**

Run: `bun test test/adminFrontendShell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAdminSession.ts app/middleware/admin-auth.ts app/components/admin/AdminSidebar.vue app/components/admin/AdminTopbar.vue app/layouts/admin.vue test/adminFrontendShell.test.ts
git commit -m "feat: add admin frontend shell"
```

### Task 9: Add admin login and management pages

**Files:**
- Create: `app/pages/admin/login.vue`
- Modify: `app/pages/admin/index.vue`
- Create: `app/pages/admin/users.vue`
- Create: `app/pages/admin/users/[id].vue`
- Create: `app/pages/admin/roles.vue`
- Create: `app/pages/admin/roles/[id].vue`
- Create: `app/pages/admin/login-logs.vue`
- Create: `app/pages/admin/audit-logs.vue`
- Create: `app/components/admin/AdminPageHeader.vue`
- Create: `app/components/admin/AdminStatCard.vue`
- Create: `app/components/admin/AdminUserTable.vue`
- Create: `app/components/admin/AdminRoleTable.vue`
- Create: `app/components/admin/AdminLogTable.vue`
- Create: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing page structure test**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin pages", () => {
  test("creates login and management route files", () => {
    expect(readProjectFile("app/pages/admin/login.vue")).toContain("admin login");
    expect(readProjectFile("app/pages/admin/users.vue")).toContain("用户管理");
    expect(readProjectFile("app/pages/admin/roles.vue")).toContain("角色管理");
    expect(readProjectFile("app/pages/admin/login-logs.vue")).toContain("登录日志");
    expect(readProjectFile("app/pages/admin/audit-logs.vue")).toContain("操作审计");
  });

  test("keeps admin routes on the admin layout", () => {
    expect(readProjectFile("app/pages/admin/index.vue")).toContain("layout: 'admin'");
    expect(readProjectFile("app/pages/admin/users.vue")).toContain("middleware: 'admin-auth'");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the admin management page files do not exist yet.

- [ ] **Step 3: Add the admin pages**

```vue
<!-- app/pages/admin/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: false });
const form = reactive({ username: "", password: "" });
</script>

<template>
  <section class="admin-login-page">
    <h1>admin login</h1>
    <form>
      <input v-model="form.username" />
      <input v-model="form.password" type="password" />
      <button type="submit">登录后台</button>
    </form>
  </section>
</template>

<!-- app/pages/admin/users.vue -->
<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin-auth" });
</script>

<template>
  <section>
    <AdminPageHeader title="用户管理" description="创建、禁用和授权后台账号。" />
    <AdminUserTable />
  </section>
</template>
```

- [ ] **Step 4: Run the page structure test**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Run all known tests**

Run: `bun test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/pages/admin app/components/admin test/adminPages.test.ts
git commit -m "feat: add admin management pages"
```

### Task 10: Verify the full feature and document follow-up work

**Files:**
- Modify: `docs/b-end/2026-03-28-b-end-iam-backend-technical-design.md`
- Verify only: `bun test`
- Verify only: `bun run build`

- [ ] **Step 1: Run the complete test suite**

Run: `bun test`
Expected: PASS for all existing tests plus new admin foundation tests.

- [ ] **Step 2: Run the production build**

Run: `bun run build`
Expected: PASS with the new admin front-end routes and server handlers included.

- [ ] **Step 3: Manually verify key flows**

```text
1. Start dev server with a fresh SQLite file.
2. Hit the init API once and create the first super admin.
3. Log in through /admin/login and confirm /admin loads.
4. Create a second user, assign roles, and confirm menu visibility changes after re-login.
5. Disable that user and confirm old JWT stops working.
6. Reset a password and confirm the previous token no longer authorizes requests.
7. Confirm login logs and audit logs both show the expected records.
```

- [ ] **Step 4: Commit**

```bash
git add docs/b-end/2026-03-28-b-end-iam-backend-technical-design.md
git commit -m "docs: finalize admin foundation verification notes"
```
