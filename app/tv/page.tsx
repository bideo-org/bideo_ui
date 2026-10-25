import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LiveTvClient } from "@/components/tv/LiveTvClient";
import { INDIAN_LIVE_CHANNELS } from "@/constants/liveChannels";
import { SEO_KEYWORD_GROUPS } from "@/constants/seoKeywords";
import {
  SITE_URL,
  generateLiveTvSchema,
  generateBreadcrumbSchema,
  generateChannelListSchema,
  generateLiveTvFaqSchema,
} from "@/utility/seo";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Tv, ShieldCheck, Zap, Sparkles } from "lucide-react";

export const revalidate = 60;

interface LiveTvPageProps {
  searchParams: Promise<{ channel?: string }>;
}

export async function generateMetadata({
  searchParams,
}: LiveTvPageProps): Promise<Metadata> {
  const { channel: channelId } = await searchParams;
  const channel =
    INDIAN_LIVE_CHANNELS.find((c) => c.id === channelId) ||
    INDIAN_LIVE_CHANNELS[0];

  const isSpecificChannel = Boolean(channelId);
  const title = isSpecificChannel
    ? `${channel.name} (${channel.hindiName}) Live Stream - BuzzClips TV | Free Indian TV Online`
    : `Free Indian TV - Watch Live Indian TV Online Free HD | BuzzClips TV`;

  const description = isSpecificChannel
    ? `Watch ${channel.name} (${channel.hindiName}) live stream online free in HD on BuzzClips TV. Official Indian Free-To-Air TV broadcasting Doordarshan national, sports, news, and culture with zero buffering.`
    : `Watch free Indian TV live online in HD on BuzzClips TV. Stream official Doordarshan channels including DD Sports live cricket, DD National, DD News, Sansad TV Lok Sabha & Rajya Sabha with zero login and zero lag.`;

  const canonicalUrl = `${SITE_URL}/tv${isSpecificChannel ? `?channel=${channel.id}` : ""}`;

  return {
    title,
    description,
    keywords: [
      // Top Intent High-Volume Keywords
      "free indian tv",
      "indian tv",
      "indian live tv",
      "watch indian tv online free",
      "indian tv channels live stream",
      "live indian tv",
      "free live tv india",
      "hindi live tv",
      "dd sports live streaming",
      "dd national live stream",
      "dd news live streaming",
      "dd free dish online",
      "free tv streaming india",
      "sansad tv lok sabha live",
      "sansad tv rajya sabha live stream",
      // Channel-Specific Keywords
      `${channel.name} live`,
      `${channel.name} live stream`,
      `${channel.name} online free`,
      `${channel.hindiName} लाइव`,
      // BuzzClips Brand Variations & Permutations
      "buzzclips tv",
      "buzz clips tv",
      "buzzclip tv",
      "buzz clip tv",
      "buzzclips live tv",
      "buzz clips live tv",
      "buzzclip live tv",
      "buzz clips live",
      "buzzclip live",
      "buzzclips tv streaming",
      "buzz clips tv streaming",
      "watch buzzclips tv",
      "watch buzz clips tv",
      "buzzclips free tv",
      "buzz clips free tv",
      "buzzclip free tv",
      "buzzclips live channels",
      "buzz clips live channels",
      ...SEO_KEYWORD_GROUPS.HINDI_REGIONAL,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "video.other",
      locale: "en_IN",
      siteName: "BuzzClips TV",
      images: [
        {
          url: channel.logo || `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${channel.name} Live on BuzzClips TV`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [channel.logo || `${SITE_URL}/opengraph-image`],
    },
  };
}

export default async function LiveTvPage({ searchParams }: LiveTvPageProps) {
  const { channel: channelId } = await searchParams;
  const activeChannel =
    INDIAN_LIVE_CHANNELS.find((c) => c.id === channelId) ||
    INDIAN_LIVE_CHANNELS[0];

  const liveTvSchema = generateLiveTvSchema(activeChannel, SITE_URL);
  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "BuzzClips TV (लाइव टीवी)", url: `${SITE_URL}/tv` },
    { name: activeChannel.name, url: `${SITE_URL}/tv?channel=${activeChannel.id}` },
  ]);
  const channelListSchema = generateChannelListSchema(INDIAN_LIVE_CHANNELS, SITE_URL);
  const faqSchema = generateLiveTvFaqSchema(SITE_URL);

  return (
    <>
      <script
        id="livetv-broadcast-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(liveTvSchema),
        }}
      />
      <script
        id="livetv-breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsSchema),
        }}
      />
      <script
        id="livetv-channellist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(channelListSchema),
        }}
      />
      <script
        id="livetv-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <Suspense
        fallback={
          <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Skeleton className="lg:col-span-7 aspect-video rounded-2xl" />
              <Skeleton className="lg:col-span-5 h-[400px] rounded-2xl" />
            </div>
          </div>
        }
      >
        <LiveTvClient initialChannelId={activeChannel.id} />
      </Suspense>

      {/* Crawlable Semantic SEO Guide Section for Indian TV & Free Streaming Rankings */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-10 border-t border-border/40 mt-10 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Watch Free Indian TV Online • 12+ Official HD Live Streams
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Welcome to <strong>BuzzClips TV</strong>, your complete guide to <strong>free Indian TV</strong> streaming online. Watch official, legal public broadcasts from Prasar Bharati (Doordarshan) and the Parliament of India, including <strong>DD National</strong>, <strong>DD Sports</strong> (live cricket, hockey, and Olympic events), <strong>DD News</strong>, and <strong>Sansad TV</strong>. All streams are broadcast in high-definition (HD) adaptive bitrate HLS with zero registration, zero fees, and zero buffering.
          </p>
        </div>

        {/* Popular SEO Keyword Topic Pills */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Trending Free Indian TV Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Free Indian TV", href: "/tv" },
              { label: "DD Sports Live Cricket", href: "/tv?channel=dd-sports" },
              { label: "DD National Live Stream", href: "/tv?channel=dd-national" },
              { label: "DD News 24x7", href: "/tv?channel=dd-news" },
              { label: "Sansad TV Lok Sabha Live", href: "/tv?channel=sansad-tv-loksabha" },
              { label: "Sansad TV Rajya Sabha", href: "/tv?channel=sansad-tv-rajyasabha" },
              { label: "DD India Live Stream", href: "/tv?channel=dd-india" },
              { label: "DD Kisan Live", href: "/tv?channel=dd-kisan" },
              { label: "DD Bharati Culture", href: "/tv?channel=dd-bharati" },
              { label: "DD Retro Classics", href: "/tv?channel=dd-retro" },
              { label: "DD Urdu Live", href: "/tv?channel=dd-urdu" },
              { label: "Watch Indian TV Online Free", href: "/tv" },
              { label: "Hindi Live TV", href: "/tv" },
              { label: "DD Free Dish Online", href: "/tv" },
              { label: "Free Video Streaming", href: "/" },
            ].map((topic) => (
              <Link
                key={topic.label}
                href={topic.href}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-card/80 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/50 transition-colors"
              >
                {topic.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-border/50 bg-card/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <Tv className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">100% Free Public TV</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official Free-To-Air (FTA) broadcasts with zero hidden subscriptions, paywalls, or mandatory sign-ups.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Fast Buffer-Free HLS</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adaptive bitrate streaming adjusts dynamically between 1080p, 720p, and 480p on any mobile or WiFi network.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Authorized Legal Streams</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Legitimate public service streams provided directly by national broadcasters and parliamentary networks.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

