/**
 * @jest-environment node
 */
import { GET } from "@/app/video-sitemap.xml/route";
import { api_instance } from "@/global";

describe("Video Sitemap XML Route", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("generates valid Google Video Sitemap XML with video items", async () => {
    const mockVideos = {
      content: [
        {
          videoId: 1,
          video_title: "Learn <Next.js> & React",
          slug: "learn-nextjs-react",
          description: "A great video about web dev & more",
          thumbnail_url: "https://buzzclips.app/thumb.jpg",
          video_uploadDate: "2026-02-15T10:00:00Z",
          video_duration: "03:45",
          video_views: 1500,
          videoStatus: "COMPLETED",
          visibility: "PUBLIC",
          tags: ["react", "nextjs"],
          video_uploader: {
            userId: "u123",
            user_name: "John Doe",
          },
          m3u8Url: "https://buzzclips.app/stream/1/master.m3u8",
        },
        {
          videoId: 2,
          video_title: "Private Video",
          slug: "private-video",
          visibility: "PRIVATE",
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVideos,
    });

    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/xml");

    const xml = await response.text();

    expect(xml).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(xml).toContain("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"");
    expect(xml).toContain("https://buzzclips.app/watch/learn-nextjs-react");
    expect(xml).toContain("&lt;Next.js&gt; &amp; React");
    expect(xml).toContain("<video:duration>225</video:duration>");
    expect(xml).toContain("<video:view_count>1500</video:view_count>");
    expect(xml).toContain("<video:tag>react</video:tag>");
    expect(xml).toContain("<video:tag>nextjs</video:tag>");
    expect(xml).toContain("John Doe");

    // Private video must NOT be in the sitemap
    expect(xml).not.toContain("private-video");

    // Live Channels (DD Sports, etc.) must be in the sitemap with <video:live>yes</video:live>
    expect(xml).toContain("https://buzzclips.app/tv/dd-sports");
    expect(xml).toContain("DD Sports Live Streaming (Free FTA)");
    expect(xml).toContain("<video:live>yes</video:live>");
    expect(xml).toContain("<video:tag>dd sports live streaming</video:tag>");
  });

  it("handles ISO-8601 duration and HH:MM:SS format correctly", async () => {
    const mockVideos = {
      content: [
        {
          videoId: 3,
          video_title: "Long Stream",
          slug: "long-stream",
          iso_duration: "PT1H15M30S",
          videoStatus: "COMPLETED",
          visibility: "PUBLIC",
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVideos,
    });

    const response = await GET();
    const xml = await response.text();
    // 1h*3600 + 15m*60 + 30s = 4530
    expect(xml).toContain("<video:duration>4530</video:duration>");
  });

  it("handles backend fetch failure gracefully while still serving live TV channels", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Database offline"));

    const response = await GET();
    expect(response.status).toBe(200);
    const xml = await response.text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("https://buzzclips.app/tv/dd-sports");
    expect(xml).toContain("<video:live>yes</video:live>");
    expect(xml).not.toContain("learn-nextjs-react");
  });
});
