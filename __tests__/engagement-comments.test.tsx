import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import EngagementButtons from "@/components/video/EngagementButtons";
import CommentsSection from "@/components/video/CommentsSection";
import useResumePlayback from "@/utility/useResumePlayback";
import { useAuth } from "@/store/auth-context";

jest.mock("@/store/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("EngagementButtons & CommentsSection", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      token: "fake-token",
      user: { userId: "u1", user_name: "TestUser" },
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe("EngagementButtons", () => {
    it("renders initial engagement and handles like toggling with optimistic update", async () => {
      global.fetch = jest.fn().mockImplementation((url) => {
        if (typeof url === "string" && url.includes("/engagement")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              videoId: 42,
              likesCount: 15,
              dislikesCount: 2,
              userReaction: "NONE",
            }),
          });
        }
        if (typeof url === "string" && url.includes("/like")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              videoId: 42,
              likesCount: 16,
              dislikesCount: 2,
              userReaction: "LIKE",
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(
        <EngagementButtons
          videoId={42}
          initialEngagement={{
            videoId: 42,
            likesCount: 15,
            dislikesCount: 2,
            userReaction: "NONE",
          }}
        />
      );

      expect(screen.getByText("15")).toBeInTheDocument();

      const likeBtn = screen.getByLabelText("Like video");
      await act(async () => {
        fireEvent.click(likeBtn);
      });

      // Verify optimistic update
      await waitFor(() => {
        expect(screen.getByText("16")).toBeInTheDocument();
      });
    });

    it("requires sign in when clicking like without token", () => {
      const { toast } = require("sonner");
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      render(<EngagementButtons videoId={42} />);

      const likeBtn = screen.getByLabelText("Like video");
      fireEvent.click(likeBtn);

      expect(toast.error).toHaveBeenCalledWith(
        "Please sign in to like this video"
      );
    });
  });

  describe("CommentsSection", () => {
    it("renders comments with clickable timestamps that trigger onSeekTo", async () => {
      const mockComments = {
        content: [
          {
            commentId: 1,
            videoId: 42,
            content: "Check out the intro at 01:23 and the finale at 04:50!",
            createdAt: new Date().toISOString(),
            isPinned: true,
            user: {
              userId: "u2",
              user_name: "Alice",
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockComments,
      });

      const mockSeekTo = jest.fn();

      render(<CommentsSection videoId={42} onSeekTo={mockSeekTo} />);

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
      });

      expect(screen.getByText("Pinned")).toBeInTheDocument();

      // Look for the parsed timestamp button "01:23"
      const timestampBtn = screen.getByRole("button", { name: "01:23" });
      expect(timestampBtn).toBeInTheDocument();

      fireEvent.click(timestampBtn);
      // 01:23 = 83 seconds
      expect(mockSeekTo).toHaveBeenCalledWith(83);
    });

    it("allows submitting a comment when authenticated", async () => {
      global.fetch = jest.fn().mockImplementation((url, opts) => {
        if (opts?.method === "POST") {
          return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ content: [] }),
        });
      });

      render(<CommentsSection videoId={42} />);

      const input = screen.getByPlaceholderText(/Add a comment/i);
      fireEvent.change(input, { target: { value: "Awesome tutorial!" } });

      const submitBtn = screen.getByRole("button", { name: /Comment/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/comments"),
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    it("allows author to edit a comment and updates content", async () => {
      const mockComments = {
        content: [
          {
            commentId: 101,
            videoId: 42,
            content: "Original text before edit",
            createdAt: new Date().toISOString(),
            user: { userId: "u1", user_name: "TestUser" },
          },
        ],
      };

      global.fetch = jest.fn().mockImplementation((url, opts) => {
        if (opts?.method === "PUT") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              commentId: 101,
              content: "Edited text after update",
              updatedAt: new Date().toISOString(),
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<CommentsSection videoId={42} />);

      await waitFor(() => {
        expect(screen.getByText("Original text before edit")).toBeInTheDocument();
      });

      // Click Edit action button
      const editBtn = screen.getByTitle("Edit comment");
      fireEvent.click(editBtn);

      // Edit textarea should now appear
      const textarea = screen.getByPlaceholderText(/Edit your comment/i);
      fireEvent.change(textarea, { target: { value: "Edited text after update" } });

      // Save edit
      const saveBtn = screen.getByRole("button", { name: /Save/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/comments/101"),
          expect.objectContaining({ method: "PUT" })
        );
        expect(screen.getByText("Edited text after update")).toBeInTheDocument();
      });
    });

    it("allows deleting a comment through the confirmation dialog", async () => {
      const mockComments = {
        content: [
          {
            commentId: 102,
            videoId: 42,
            content: "Comment to be removed",
            createdAt: new Date().toISOString(),
            user: { userId: "u1", user_name: "TestUser" },
          },
        ],
      };

      global.fetch = jest.fn().mockImplementation((url, opts) => {
        if (opts?.method === "DELETE") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ message: "Comment deleted successfully", commentId: "102" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<CommentsSection videoId={42} />);

      await waitFor(() => {
        expect(screen.getByText("Comment to be removed")).toBeInTheDocument();
      });

      // Click Delete action button
      const deleteBtn = screen.getByTitle("Delete comment");
      fireEvent.click(deleteBtn);

      // Inline confirmation appears
      expect(screen.getByText("Delete?")).toBeInTheDocument();

      // Click Confirm button
      const confirmDeleteBtn = screen.getByRole("button", { name: /Confirm/i });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/comments/102"),
          expect.objectContaining({ method: "DELETE" })
        );
        expect(screen.queryByText("Comment to be removed")).not.toBeInTheDocument();
      });
    });

    it("allows video owner to pin and unpin a comment", async () => {
      const mockComments = {
        content: [
          {
            commentId: 103,
            videoId: 42,
            content: "Owner can pin this",
            createdAt: new Date().toISOString(),
            isPinned: false,
            user: { userId: "u2", user_name: "OtherUser" },
          },
        ],
      };

      global.fetch = jest.fn().mockImplementation((url, opts) => {
        if (opts?.method === "POST" && String(url).includes("/pin")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ commentId: 103, isPinned: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      // Current user is "u1", pass videoUploaderId="u1"
      render(<CommentsSection videoId={42} videoUploaderId="u1" />);

      await waitFor(() => {
        expect(screen.getByText("Owner can pin this")).toBeInTheDocument();
      });

      // Click Pin action button
      const pinBtn = screen.getByTitle("Pin comment");
      fireEvent.click(pinBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/comments/103/pin"),
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    it("allows replying to a comment", async () => {
      const mockComments = {
        content: [
          {
            commentId: 104,
            videoId: 42,
            content: "Parent comment for reply",
            createdAt: new Date().toISOString(),
            user: { userId: "u2", user_name: "OtherUser" },
          },
        ],
      };

      global.fetch = jest.fn().mockImplementation((url, opts) => {
        if (opts?.method === "POST" && String(url).includes("/replies")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              commentId: 201,
              content: "This is a child reply",
              createdAt: new Date().toISOString(),
              parentCommentId: 104,
              user: { userId: "u1", user_name: "TestUser" },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<CommentsSection videoId={42} />);

      await waitFor(() => {
        expect(screen.getByText("Parent comment for reply")).toBeInTheDocument();
      });

      // Click Reply button
      const replyBtn = screen.getByText("Reply");
      fireEvent.click(replyBtn);

      // Fill in reply input
      const replyInput = screen.getByPlaceholderText(/Reply to OtherUser/i);
      fireEvent.change(replyInput, { target: { value: "This is a child reply" } });

      // Click submit reply button
      const sendReplyBtn = screen.getAllByRole("button", { name: /Reply/i })[1];
      fireEvent.click(sendReplyBtn);

      await waitFor(() => {
        expect(screen.getByText("This is a child reply")).toBeInTheDocument();
      });
    });
  });

  describe("useResumePlayback", () => {
    it("fetches saved progress and seeks player on mount", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          videoId: 42,
          progressSeconds: 45,
          completed: false,
        }),
      });

      const mockPlayerRef = {
        current: {
          seekTo: jest.fn(),
          getCurrentTime: jest.fn().mockReturnValue(50),
          getDuration: jest.fn().mockReturnValue(300),
        },
      };

      const { result } = renderHook(() =>
        useResumePlayback({
          videoId: 42,
          playerRef: mockPlayerRef as any,
          token: "fake-token",
        })
      );

      await waitFor(() => {
        expect(mockPlayerRef.current.seekTo).toHaveBeenCalledWith(
          45,
          "seconds"
        );
      });

      expect(result.current.savedProgress).toBe(45);

      // Trigger time update with arguments
      result.current.onTimeUpdate(55, 300);

      // Trigger onPlay and onPause
      result.current.onPlay(55, 300);
      result.current.onPause(60, 300);
    });
  });
});
