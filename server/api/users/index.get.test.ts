import { describe, it, expect, vi, beforeEach } from "vitest";
import type { H3Event } from "h3";

// Mock Prisma
vi.mock("../../database", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

import handler from "./index.get";
import { prisma } from "../../database";

describe("ユーザー一覧取得API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ユーザー一覧を正常に取得できる", async () => {
    const mockUsers = [
      {
        id: 1,
        email: "test1@example.com",
        name: "User 1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: 2,
        email: "test2@example.com",
        name: "User 2",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
      },
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

    const mockEvent = {} as H3Event;

    global.getMethod = vi.fn().mockReturnValue("GET");

    const result = await handler(mockEvent);

    expect(result.success).toBe(true);
    expect(result.users).toHaveLength(2);
    expect(result.users[0]).toEqual({
      id: 1,
      email: "test1@example.com",
      name: "User 1",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.count).toBe(2);
    expect(result.message).toBe("ユーザーリストの取得に成功しました");
  });

  it("非GETメソッドの場合は405エラーを返す", async () => {
    const mockEvent = {} as H3Event;

    global.getMethod = vi.fn().mockReturnValue("POST");
    global.createError = vi.fn().mockImplementation((options) => {
      throw new Error(`${options.statusCode}: ${options.statusMessage}`);
    });

    await expect(handler(mockEvent)).rejects.toThrow("405: Method Not Allowed");
  });

  it("データベースエラーが発生した場合は500エラーを返す", async () => {
    const mockEvent = {} as H3Event;

    global.getMethod = vi.fn().mockReturnValue("GET");
    global.createError = vi.fn().mockImplementation((options) => {
      throw new Error(`${options.statusCode}: ${options.statusMessage}`);
    });

    vi.mocked(prisma.user.findMany).mockRejectedValue(
      new Error("Database connection failed")
    );

    await expect(handler(mockEvent)).rejects.toThrow(
      "500: ユーザーリスト取得でエラーが発生しました"
    );
  });

  it("名前がないユーザーを正常に処理できる", async () => {
    const mockUsers = [
      {
        id: 1,
        email: "test1@example.com",
        name: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: 2,
        email: "test2@example.com",
        name: "",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
      },
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

    const mockEvent = {} as H3Event;

    global.getMethod = vi.fn().mockReturnValue("GET");

    const result = await handler(mockEvent);

    expect(result.success).toBe(true);
    expect(result.users[0].name).toBe(null);
    expect(result.users[1].name).toBe("");
  });
});
