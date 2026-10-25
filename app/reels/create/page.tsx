import { Metadata } from "next";
import { ReelsStudioClient } from "./ReelsStudioClient";

export const metadata: Metadata = {
  title: "BuzzClips Reels Studio - Create & Edit Vertical Reels | Built in India",
  description:
    "Edit Instagram-style vertical 9:16 reels on BuzzClips. Add viral filters, trending soundtracks, draggable text overlays, stickers, and export directly to BuzzClips Reels.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReelsCreatePage() {
  return (
    <div className="flex-1 w-full min-h-screen bg-background py-4 sm:py-8">
      <ReelsStudioClient />
    </div>
  );
}
