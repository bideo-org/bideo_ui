/**
 * Comprehensive SEO Keywords & Buzzwords Catalog for BuzzClips & BuzzClips TV.
 * Curated for search engine dominance across Google, Bing, Yahoo, and DuckDuckGo for:
 * 1. Indian TV & Free Live TV Streaming ("indian tv", "free indian tv", "dd sports", "live tv india")
 * 2. Video Streaming Websites & OTT ("free video streaming", "video streaming website", "buffer-free HLS")
 * 3. Short Videos, Viral Reels & Entertainment ("viral video clips", "watch reels online free", "shorts")
 * 4. Technical Platform Capabilities ("adaptive bitrate streaming", "fast video player", "creator hub")
 */

export const SEO_KEYWORD_GROUPS = {
  INDIAN_TV: [
    "indian tv",
    "free indian tv",
    "indian live tv",
    "watch indian tv online free",
    "indian tv channels live stream",
    "live indian tv",
    "free live tv india",
    "hindi live tv",
    "punjabi live tv",
    "dd free dish online",
    "dd sports live streaming",
    "dd national live stream",
    "dd news live streaming",
    "sansad tv lok sabha live",
    "sansad tv rajya sabha live stream",
    "dd india live",
    "dd bharati live stream",
    "free tv streaming india",
    "indian news channels live",
    "cricket live stream free india",
    "prasar bharati live streaming",
    "bharat live tv",
    "free to air tv channels india",
    "indian entertainment channels",
    "doordarshan live stream online",
    "live tv app free india",
    "indian tv serials and shows free",
    "official indian live streaming",
  ],

  HINDI_REGIONAL: [
    "फ्री इंडियन टीवी",
    "लाइव टीवी भारत",
    "डीडी नेशनल लाइव",
    "डीडी स्पोर्ट्स लाइव क्रिकेट",
    "डीडी न्यूज़ लाइव",
    "संसद टीवी लाइव",
    "फ्री वीडियो स्ट्रीमिंग",
    "ऑनलाइन टीवी देखें",
    "भारतीय टीवी चैनल लाइव",
    "मुफ्त टीवी स्ट्रीमिंग",
  ],

  VIDEO_STREAMING_PLATFORM: [
    "video streaming website",
    "free video streaming",
    "free video streaming website",
    "watch videos online free",
    "best video streaming platform",
    "free streaming sites",
    "free ott platform",
    "ott streaming website",
    "online video player",
    "video on demand free",
    "buffer free video streaming",
    "adaptive hls video player",
    "hd video streaming free",
    "4k video player online",
    "video sharing website",
    "creator video sharing platform",
    "video community web platform",
    "youtube alternative web",
    "fastest video player",
    "video hosting platform",
    "web video streaming service",
    "instant playback video",
  ],

  VIRAL_SHORTS_AND_REELS: [
    "viral videos",
    "viral video clips",
    "trending video shorts",
    "watch reels online free",
    "reels online",
    "short video platform",
    "youtube shorts alternative",
    "instagram reels viewer web",
    "tiktok alternative web",
    "funny video clips",
    "comedy clips and sketches",
    "gaming highlights and gameplay",
    "tech tutorials and coding guides",
    "music videos and beats free",
    "sports highlights free",
    "lifestyle vlogs online",
  ],

  BRAND_AND_OFFICIAL: [
    "buzzclips",
    "buzzclips tv",
    "buzzclips live tv",
    "buzzclips app",
    "buzzclips streaming",
    "buzzclips video platform",
    "buzzclips official",
    "watch buzzclips tv",
    "buzzclips free tv",
    "buzzclips video player",
    "buzzclips creator hub",
    "buzzclips online tv",
  ],
} as const;

/**
 * Complete, flattened, de-duplicated array of all top-tier SEO buzzwords
 * used across site-wide metadata, OpenGraph, Twitter Cards, and Schema.org.
 */
export const ALL_SEO_BUZZWORDS: string[] = Array.from(
  new Set([
    ...SEO_KEYWORD_GROUPS.BRAND_AND_OFFICIAL,
    ...SEO_KEYWORD_GROUPS.INDIAN_TV,
    ...SEO_KEYWORD_GROUPS.VIDEO_STREAMING_PLATFORM,
    ...SEO_KEYWORD_GROUPS.VIRAL_SHORTS_AND_REELS,
    ...SEO_KEYWORD_GROUPS.HINDI_REGIONAL,
  ])
);

export interface SeoTopicItem {
  name: string;
  url: string;
  badge?: string;
  category: "tv" | "streaming" | "reels" | "category";
}

/**
 * Curated list of crawlable internal link topics for footer, sitemaps, and discovery hubs.
 * Provides high-intent anchor text that reinforces search engine authority for target queries.
 */
export const POPULAR_SEO_TOPICS: SeoTopicItem[] = [
  // Indian TV & Free Channels
  { name: "Free Indian TV", url: "/tv", badge: "Live", category: "tv" },
  { name: "DD National Live", url: "/tv?channel=dd-national", category: "tv" },
  { name: "DD Sports Live", url: "/tv?channel=dd-sports", badge: "Live Cricket", category: "tv" },
  { name: "DD News 24x7", url: "/tv?channel=dd-news", category: "tv" },
  { name: "Sansad TV Lok Sabha", url: "/tv?channel=sansad-tv-loksabha", category: "tv" },
  { name: "Sansad TV Rajya Sabha", url: "/tv?channel=sansad-tv-rajyasabha", category: "tv" },
  { name: "DD India English", url: "/tv?channel=dd-india", category: "tv" },
  { name: "DD Kisan Agriculture", url: "/tv?channel=dd-kisan", category: "tv" },
  { name: "DD Bharati Culture", url: "/tv?channel=dd-bharati", category: "tv" },
  { name: "DD Retro Classics", url: "/tv?channel=dd-retro", category: "tv" },
  { name: "DD Urdu", url: "/tv?channel=dd-urdu", category: "tv" },

  // Video Streaming & OTT
  { name: "Free Video Streaming", url: "/", category: "streaming" },
  { name: "Trending Videos", url: "/trending", badge: "Hot", category: "streaming" },
  { name: "Reels & Shorts", url: "/reels", badge: "New", category: "reels" },
  { name: "Viral Video Clips", url: "/category/entertainment", category: "streaming" },
  { name: "Gaming Highlights", url: "/category/gaming", category: "streaming" },
  { name: "Tech & Coding Tutorials", url: "/category/tech", category: "streaming" },
  { name: "Music & Beats", url: "/category/music", category: "streaming" },
  { name: "Education & Guides", url: "/category/education", category: "streaming" },
  { name: "Lifestyle & Vlogs", url: "/category/lifestyle", category: "streaming" },
];
