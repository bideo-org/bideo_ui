"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LiveChannel, ALL_LIVE_CHANNELS } from "@/constants/liveChannels";
import { LiveTvPlayer } from "./LiveTvPlayer";
import { ChannelGuide } from "./ChannelGuide";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, ShieldCheck, Zap, Sparkles, Tv, Globe } from "lucide-react";
import clsx from "clsx";

interface LiveTvClientProps {
  initialChannelId?: string;
}

export function LiveTvClient({ initialChannelId }: LiveTvClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Find initial channel
  const channelParam = searchParams.get("channel") || initialChannelId;
  const initialChannel =
    ALL_LIVE_CHANNELS.find((c) => c.id === channelParam) ||
    ALL_LIVE_CHANNELS[0];

  const [activeChannel, setActiveChannel] = useState<LiveChannel>(initialChannel);

  // Sync state if URL query param changes
  useEffect(() => {
    const param = searchParams.get("channel");
    if (param && param !== activeChannel.id) {
      const match = ALL_LIVE_CHANNELS.find((c) => c.id === param);
      if (match) {
        setActiveChannel(match);
      }
    }
  }, [searchParams, activeChannel.id]);

  const handleSelectChannel = (channel: LiveChannel) => {
    setActiveChannel(channel);
    router.replace(`/tv?channel=${channel.id}`, { scroll: false });
  };

  const currentIndex = ALL_LIVE_CHANNELS.findIndex((c) => c.id === activeChannel.id);
  const handlePrevChannel = () => {
    const prevIdx = (currentIndex - 1 + ALL_LIVE_CHANNELS.length) % ALL_LIVE_CHANNELS.length;
    handleSelectChannel(ALL_LIVE_CHANNELS[prevIdx]);
  };
  const handleNextChannel = () => {
    const nextIdx = (currentIndex + 1) % ALL_LIVE_CHANNELS.length;
    handleSelectChannel(ALL_LIVE_CHANNELS[nextIdx]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Sleek Global FTA Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-orange-500/10 via-background to-emerald-500/10 border border-border/50 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                <Globe className="w-3.5 h-3.5" />
                <span>Worldwide Free-To-Air TV</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Free &amp; Legal Public TV
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Global Free-To-Air Live TV &amp; World Broadcasts
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Stream official FTA national, news, sports, entertainment, and documentary channels from India, USA, UK, Europe, Japan, and worldwide with zero login and adaptive HLS playback.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/40 backdrop-blur-xs">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                <p className="text-xs font-semibold text-foreground">{ALL_LIVE_CHANNELS.length} Channels Live</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Player & Channel Guide Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Active Player (Col 7 on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <LiveTvPlayer
            channel={activeChannel}
            onPrevChannel={handlePrevChannel}
            onNextChannel={handleNextChannel}
          />

          {/* Mobile Quick-Dial Carousel (Visible only on mobile/tablet) */}
          <div className="block lg:hidden space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold px-0.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-primary" />
                Quick Dial Channels
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Swipe ➔
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {ALL_LIVE_CHANNELS.map((ch) => {
                const isCur = activeChannel.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 text-left transition-all active:scale-95 cursor-pointer",
                      isCur
                        ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold ring-1 ring-primary/40"
                        : "bg-card/80 hover:bg-card text-foreground border-border/50"
                    )}
                  >
                    <span
                      className={clsx(
                        "w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-black shrink-0",
                        isCur
                          ? "bg-primary-foreground text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {ch.channelNumber}
                    </span>
                    <span className="text-sm shrink-0 leading-none">{ch.countryFlag}</span>
                    <div className="truncate max-w-[110px]">
                      <p className="text-xs truncate leading-tight font-bold">
                        {ch.name}
                      </p>
                      <p
                        className={clsx(
                          "text-[10px] truncate leading-tight",
                          isCur ? "opacity-80" : "text-muted-foreground"
                        )}
                      >
                        {ch.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Channel Guide (Col 5 on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border/50 bg-card/75 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/5">
            <CardContent className="p-0">
              <ChannelGuide
                channels={ALL_LIVE_CHANNELS}
                activeChannel={activeChannel}
                onSelectChannel={handleSelectChannel}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Value Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
        <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Zap className="w-4 h-4" />
            <span>Buffer-Free HLS Streaming</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Direct adaptive bitrate switching ensures instant connection without lag on both 4G/5G mobile and broadband.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Official &amp; Legal FTA Channels</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Broadcasting authorized Free-To-Air public feeds from national broadcasters and international news networks.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-1.5">
          <div className="flex items-center gap-2 text-purple-500 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>No Subscription, No Sign-In</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Completely free to watch for everyone worldwide. Tap any channel and start streaming immediately.
          </p>
        </div>
      </div>

      {/* Semantic SEO & Discovery Guide for BuzzClips TV */}
      <article
        aria-labelledby="about-buzzclips-tv-title"
        className="mt-10 pt-8 border-t border-border/40 space-y-6 text-foreground"
      >
        <div className="space-y-2">
          <h2
            id="about-buzzclips-tv-title"
            className="text-lg sm:text-xl font-bold tracking-tight text-foreground"
          >
            About BuzzClips TV — Free Worldwide &amp; Indian Live TV Streaming
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            BuzzClips TV is a premier web-first live television streaming portal offering instant, unrestricted access to official Free-To-Air (FTA) national broadcasts, international breaking news, sports networks, movies, music, and cultural channels from across the globe. Powered by ultra-low latency adaptive HLS, BuzzClips TV delivers crisp Full HD playback with zero buffering and zero login requirements.
          </p>
        </div>

        {/* Channel Directory Grid for SEO Indexing */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Official Free-To-Air Live TV Lineup ({ALL_LIVE_CHANNELS.length} Channels)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {ALL_LIVE_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch)}
                className="text-left p-2.5 rounded-xl border border-border/40 bg-card/40 hover:bg-card hover:border-primary/40 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs leading-none">{ch.countryFlag}</span>
                  <span className="font-mono text-[10px] font-bold text-muted-foreground group-hover:text-primary">
                    CH {ch.channelNumber}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />
                </div>
                <p className="text-xs font-bold text-foreground truncate mt-1">
                  {ch.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {ch.country} • {ch.category}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ Section) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Frequently Asked Questions about BuzzClips TV
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>What is BuzzClips TV?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                BuzzClips TV is a free online streaming service by BuzzClips providing live television channels worldwide, including Doordarshan national, DD Sports, Bloomberg Originals, France 24, DW English, Al Jazeera, NHK World Japan, Red Bull TV, and regional public broadcasts, directly in your browser.
              </p>
            </details>

            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>Is BuzzClips TV free and legal to watch?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Yes, 100%. All channels featured on BuzzClips TV are official Free-To-Air (FTA) public broadcasts transmitted by recognized national public broadcasters and authorized networks. No paid subscription, account registration, or payment is ever required.
              </p>
            </details>

            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>What channels and countries are available?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                BuzzClips TV features over 30 live channels from India, United States, United Kingdom, France, Germany, Japan, South Korea, Singapore, Qatar, and Turkey across categories like News, Sports, Movies, Science, Kids, Music, and Culture.
              </p>
            </details>

            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>Does BuzzClips TV work on mobile devices?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Yes! BuzzClips TV is fully responsive and optimized for mobile smartphones (iOS &amp; Android), tablets, laptops, and desktop screens with full-screen theater viewing and native touch controls.
              </p>
            </details>
          </div>
        </div>
      </article>
    </div>
  );
}
export default LiveTvClient;
