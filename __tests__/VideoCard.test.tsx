import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import VideoCard from "@/components/video/VideoCard";
import { VideoDTO } from "@/types/video";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("VideoCard Component", () => {
  const baseVideo: VideoDTO = {
    videoId: 101,
    video_title: "Introduction to Antigravity",
    slug: "introduction-to-antigravity",
    video_uploadDate: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
    video_views: 4500,
    video_duration: "12:34",
    thumbnail_url: "https://example.com/thumb.jpg",
    videoStatus: "COMPLETED",
    video_uploader: {
      userId: "user_123",
      user_name: "Tech Guru",
      avatar_url: "https://example.com/avatar.jpg",
    },
  };

  it("renders video title, uploader name, and duration", () => {
    render(<VideoCard video={baseVideo} />);

    expect(screen.getByText("Introduction to Antigravity")).toBeInTheDocument();
    expect(screen.getByText("Tech Guru")).toBeInTheDocument();
    expect(screen.getByText("12:34")).toBeInTheDocument();
    expect(screen.getByText(/4\.5K views/i)).toBeInTheDocument();
  });

  it("links to /watch/[slug] when slug is present", () => {
    render(<VideoCard video={baseVideo} />);

    const links = screen.getAllByRole("link");
    const watchLink = links.find((link) =>
      link.getAttribute("href")?.includes("/watch/introduction-to-antigravity")
    );
    expect(watchLink).toBeDefined();
  });

  it("falls back to /video/[id]/view when slug is missing", () => {
    const videoWithoutSlug: VideoDTO = {
      ...baseVideo,
      slug: undefined,
      videoId: 202,
    };

    render(<VideoCard video={videoWithoutSlug} />);

    const links = screen.getAllByRole("link");
    const legacyLink = links.find((link) =>
      link.getAttribute("href")?.includes("/video/202/view")
    );
    expect(legacyLink).toBeDefined();
  });

  it("copies shareable link on clicking share button", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<VideoCard video={baseVideo} />);

    const shareButton = screen.getByRole("button", { name: /share video/i });
    fireEvent.click(shareButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/watch/introduction-to-antigravity")
    );
  });

  it("handles share button failure gracefully with toast error", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error("Clipboard denied")),
      },
    });

    render(<VideoCard video={baseVideo} />);
    const shareButton = screen.getByRole("button", { name: /share video/i });
    fireEvent.click(shareButton);

    const { toast } = await import("sonner");
    expect(toast.error).toHaveBeenCalledWith("Failed to copy link.");
  });

  it("formats views for millions, small view counts, and falls back to default creator", () => {
    const videoWithMillionViews: VideoDTO = {
      ...baseVideo,
      video_views: 2500000,
      video_uploader: undefined,
    };

    const { rerender } = render(<VideoCard video={videoWithMillionViews} />);
    expect(screen.getByText(/25\.0L views/i)).toBeInTheDocument();
    expect(screen.getByText("Creator")).toBeInTheDocument();

    const videoWithFewViews: VideoDTO = {
      ...baseVideo,
      video_views: 42,
    };
    rerender(<VideoCard video={videoWithFewViews} />);
    expect(screen.getByText(/42 views/i)).toBeInTheDocument();
  });

  it("triggers mouseenter and mouseleave on card wrapper", () => {
    window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = jest.fn();

    const { container } = render(<VideoCard video={baseVideo} />);
    const card = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
  });

  it("renders trending rank badge alongside category without overlapping", () => {
    render(<VideoCard video={{ ...baseVideo, category: "TECH" }} rank={1} />);
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("TECH")).toBeInTheDocument();
  });
});
