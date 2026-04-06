import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";

vi.mock("@/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        orderBy: () => [
          {
            id: 1,
            clerkId: "user_123",
            email: "alice@example.com",
            createdAt: new Date("2026-04-06T10:00:00.000Z"),
          },
        ],
      }),
    }),
  }),
}));

describe("HomePage", () => {
  it("renders the public users table, email form and auth links", async () => {
    render(await HomePage());

    expect(
      screen.getByRole("heading", { name: "skeleton-app" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("user_123")).toBeInTheDocument();
    expect(screen.getByLabelText("Recipient email")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
  });
});
