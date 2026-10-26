"use client";

import React, { useState, useMemo } from "react";
import {
  LiveChannel,
  ChannelCategory,
  CHANNEL_CATEGORIES,
  CHANNEL_REGIONS,
} from "@/constants/liveChannels";
import { ChannelCard } from "./ChannelCard";
import { Input } from "@/components/ui/input";
import { Search, Tv, X, Radio, Globe } from "lucide-react";
import clsx from "clsx";

interface ChannelGuideProps {
  channels: LiveChannel[];
  activeChannel: LiveChannel;
  onSelectChannel: (channel: LiveChannel) => void;
}

export function ChannelGuide({
  channels,
  activeChannel,
  onSelectChannel,
}: ChannelGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory>("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      // Region / Country filter
      if (selectedRegion !== "ALL" && channel.countryCode !== selectedRegion) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "ALL" && channel.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = channel.name.toLowerCase().includes(query);
        const matchesHindi = channel.hindiName.toLowerCase().includes(query);
        const matchesNumber = channel.channelNumber.includes(query);
        const matchesDesc = channel.description.toLowerCase().includes(query);
        const matchesBroadcaster = channel.broadcaster.toLowerCase().includes(query);
        const matchesCountry = channel.country.toLowerCase().includes(query);
        const matchesLang = channel.language.some((l) =>
          l.toLowerCase().includes(query)
        );
        return (
          matchesName ||
          matchesHindi ||
          matchesNumber ||
          matchesDesc ||
          matchesBroadcaster ||
          matchesCountry ||
          matchesLang
        );
      }
      return true;
    });
  }, [channels, selectedRegion, selectedCategory, searchQuery]);

  // Compute region counts
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: channels.length };
    channels.forEach((ch) => {
      counts[ch.countryCode] = (counts[ch.countryCode] || 0) + 1;
    });
    return counts;
  }, [channels]);

  // Compute category counts within selected region (or overall)
  const categoryCounts = useMemo(() => {
    const regionFiltered =
      selectedRegion === "ALL"
        ? channels
        : channels.filter((c) => c.countryCode === selectedRegion);

    const counts: Record<string, number> = { ALL: regionFiltered.length };
    regionFiltered.forEach((ch) => {
      counts[ch.category] = (counts[ch.category] || 0) + 1;
    });
    return counts;
  }, [channels, selectedRegion]);

  return (
    <section aria-labelledby="live-channel-guide-title" className="space-y-3.5">
      {/* 1. Header: Title + Live Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Tv className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                id="live-channel-guide-title"
                className="text-base font-bold text-foreground leading-tight whitespace-nowrap"
              >
                Channel Guide
              </h2>
              <span className="whitespace-nowrap shrink-0 inline-flex flex-row items-center gap-1.5 text-[10px] font-mono font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span>{filteredChannels.length} Live</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
              Official Worldwide &amp; Indian Free-To-Air Broadcasts
            </p>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Search Bar */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search channels, country, genres, languages..."
          className="pl-8 pr-8 h-8 text-xs bg-card/60 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Country / Region Selector Strip */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-primary" />
            <span>Country &amp; Region</span>
          </span>
          {selectedRegion !== "ALL" && (
            <button
              onClick={() => setSelectedRegion("ALL")}
              className="text-[10px] text-primary hover:underline cursor-pointer"
            >
              Show all
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {CHANNEL_REGIONS.map((region) => {
            const isSelected = selectedRegion === region.id;
            const count = regionCounts[region.id] || 0;
            if (region.id !== "ALL" && count === 0) return null;

            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={clsx(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 cursor-pointer select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border/40"
                )}
              >
                <span>{region.flag}</span>
                <span>{region.name}</span>
                <span
                  className={clsx(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Category Filter Pills */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
          <span>Categories &amp; Genres</span>
          {selectedCategory !== "ALL" && (
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="text-[10px] text-primary hover:underline cursor-pointer"
            >
              Reset category
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {CHANNEL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            // Only show category pill if channels exist in that category for selected region
            if (cat.id !== "ALL" && count === 0) return null;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 cursor-pointer select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border/40"
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={clsx(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Vertical Channels List */}
      <div
        role="list"
        aria-label="Free-To-Air Live TV Channels List"
        className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-border/50"
      >
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <div key={channel.id} role="listitem">
              <ChannelCard
                channel={channel}
                isActive={activeChannel.id === channel.id}
                onSelect={onSelectChannel}
              />
            </div>
          ))
        ) : (
          <div className="py-12 text-center space-y-2 rounded-xl bg-card/40 border border-border/40">
            <Radio className="w-8 h-8 text-muted-foreground/60 mx-auto animate-pulse" />
            <p className="text-sm font-semibold text-foreground">
              No channels match your filter
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Try switching country, category, or clear your search term.
            </p>
            <button
              onClick={() => {
                setSelectedRegion("ALL");
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-primary font-semibold hover:underline mt-2 inline-block cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
export default ChannelGuide;
