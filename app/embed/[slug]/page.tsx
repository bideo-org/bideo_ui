import { Metadata } from "next";
import { getVideoBySlug, getVideoById } from "@/utility/requests";
import { VideoDTO } from "@/types/video";
import { SITE_URL } from "@/utility/seo";
import { EmbedPlayerClient } from "./EmbedPlayerClient";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let video: VideoDTO | null = null;

  try {
    if (/^\d+$/.test(slug)) {
      video = await getVideoById(slug);
    } else {
      video = await getVideoBySlug(slug);
    }
  } catch {
    // handled in component
  }

  const title = video?.video_title ? `${video.video_title} - BuzzClips Embed Player` : "BuzzClips Embed Player";
  const canonicalUrl = `${SITE_URL}/watch/${slug}`;

  return {
    title,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      type: "video.other",
      url: `${SITE_URL}/embed/${slug}`,
      siteName: "BuzzClips",
      images: video?.thumbnail_url ? [{ url: video.thumbnail_url }] : [],
    },
  };
}

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ autoplay?: string; t?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  let video: VideoDTO | null = null;

  try {
    if (/^\d+$/.test(slug)) {
      video = await getVideoById(slug);
    } else {
      video = await getVideoBySlug(slug);
    }
  } catch {
    // handled below
  }

  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-black flex items-center justify-center">
      <EmbedPlayerClient
        video={video}
        slug={slug}
        initialTime={resolvedSearchParams.t ? parseFloat(resolvedSearchParams.t) : undefined}
      />
    </div>
  );
}
