import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteVideoButton from "@/components/video/DeleteVideoButton";
import { useAuth } from "@/store/auth-context";
import { deleteVideo } from "@/utility/requests";
import { toast } from "sonner";
import { MESSAGES } from "@/constants/messages";

jest.mock("@/store/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/utility/requests", () => ({
  deleteVideo: jest.fn(),
}));

const mockInvalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("DeleteVideoButton Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders trigger button with delete icon and label", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-123" },
      token: "token-abc",
    });

    render(<DeleteVideoButton videoId={42} />);
    const button = screen.getByRole("button", { name: /delete video/i });
    expect(button).toBeInTheDocument();
  });

  it("opens confirmation dialog and deletes video on confirm", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-123" },
      token: "token-abc",
    });
    (deleteVideo as jest.Mock).mockResolvedValue("Deleted");

    render(<DeleteVideoButton videoId={42} />);

    // Click trigger to open dialog
    fireEvent.click(screen.getByRole("button", { name: /delete video/i }));

    // Verify dialog content is shown
    expect(screen.getByText("Delete video?")).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/i)
    ).toBeInTheDocument();

    // Click confirm action
    const confirmButton = screen.getByRole("button", { name: "Delete Video" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteVideo).toHaveBeenCalledWith("user-123", 42, "token-abc");
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["userVideos"],
    });
    expect(toast.success).toHaveBeenCalledWith(MESSAGES.DELETED_SUCCESS);
  });

  it("shows error toast when deletion fails", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-123" },
      token: "token-abc",
    });
    (deleteVideo as jest.Mock).mockRejectedValue(new Error("Server error"));

    render(<DeleteVideoButton videoId={42} />);

    fireEvent.click(screen.getByRole("button", { name: /delete video/i }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Video" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(MESSAGES.DELETED_ERROR);
    });
  });

  it("requires typing the video title before enabling delete button", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-123" },
      token: "token-abc",
    });
    (deleteVideo as jest.Mock).mockResolvedValue("Deleted");

    render(<DeleteVideoButton videoId={42} videoTitle="Epic Gaming Highlights" />);

    fireEvent.click(screen.getByRole("button", { name: /delete video/i }));

    const confirmButton = screen.getByRole("button", { name: "Delete Video" });
    // Button is disabled until matching title is typed
    expect(confirmButton).toBeDisabled();

    const input = screen.getByPlaceholderText(/Type "Epic Gaming Highlights" to confirm/i);
    expect(input).toBeInTheDocument();

    // Type wrong title
    fireEvent.change(input, { target: { value: "Wrong Title" } });
    expect(confirmButton).toBeDisabled();

    // Type matching title
    fireEvent.change(input, { target: { value: "Epic Gaming Highlights" } });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteVideo).toHaveBeenCalledWith("user-123", 42, "token-abc");
    });
    expect(toast.success).toHaveBeenCalledWith(MESSAGES.DELETED_SUCCESS);
  });

  it("submits deletion when pressing Enter in input with matching title", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-123" },
      token: "token-abc",
    });
    (deleteVideo as jest.Mock).mockResolvedValue("Deleted");

    render(<DeleteVideoButton videoId={42} videoTitle="My Drone Video" />);

    fireEvent.click(screen.getByRole("button", { name: /delete video/i }));

    const input = screen.getByPlaceholderText(/Type "My Drone Video" to confirm/i);

    // Type title and hit Enter
    fireEvent.change(input, { target: { value: "my drone video" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(deleteVideo).toHaveBeenCalledWith("user-123", 42, "token-abc");
    });
  });

  it("shows error toast if user is unauthenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
    });

    render(<DeleteVideoButton videoId={42} />);

    fireEvent.click(screen.getByRole("button", { name: /delete video/i }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Video" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(MESSAGES.DELETED_ERROR);
    });
    expect(deleteVideo).not.toHaveBeenCalled();
  });
});
