"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LiveChannel } from "@/constants/liveChannels";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";

interface ChannelCardProps {
  channel: LiveChannel;
  isActive: boolean;
  onSelect: (channel: LiveChannel) => void;
}

export function ChannelCard({ channel, isActive, onSelect }: ChannelCardProps) {
  const [hasImgError, setHasImgError] = useState(false);

  // Fallback badge gradient based on channel ID or category
  const getBadgeGradient = (id: string, category: string) => {
    if (id.includes("news") || category === "NEWS") return "from-red-600 to-rose-700";
    if (id.includes("sports") || category === "SPORTS") return "from-emerald-600 to-teal-700";
    if (id.includes("sansad") || category === "NATIONAL") return "from-amber-600 to-orange-700";
    if (category === "ENTERTAINMENT") return "from-violet-600 to-purple-700";
    if (category === "DOCUMENTARY") return "from-cyan-600 to-blue-700";
    if (category === "MUSIC") return "from-pink-600 to-rose-700";
    if (category === "KIDS") return "from-amber-500 to-yellow-600";
    if (id.includes("kisan")) return "from-green-600 to-emerald-700";
    if (id.includes("bharati") || category === "CULTURE") return "from-purple-600 to-indigo-700";
    return "from-blue-600 to-indigo-700";
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If not middle-click or cmd-click, intercept to do seamless in-app stream change
    if (!e.metaKey && !e.ctrlKey && e.button === 0) {
      e.preventDefault();
      onSelect(channel);
    }
  };

  return (
    <Link
      href={`/tv?channel=${channel.id}`}
      onClick={handleClick}
      aria-label={`Watch ${channel.name} (${channel.hindiName}) Live TV Stream`}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "group relative w-full text-left rounded-xl p-3 border transition-all duration-200 overflow-hidden flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none cursor-pointer",
        isActive
          ? "bg-primary/10 border-primary shadow-md shadow-primary/10 ring-1 ring-primary/40"
          : "bg-card/70 hover:bg-card border-border/40 hover:border-border/80"
      )}
    >
      {/* 1. Aligned Channel Dial Number */}
      <div
        className={clsx(
          "w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border font-mono select-none transition-all",
          isActive
            ? "bg-red-500 text-white border-red-400 shadow-sm shadow-red-500/20 ring-2 ring-red-500/20"
            : "bg-muted/70 text-muted-foreground border-border/50 group-hover:bg-muted group-hover:text-foreground group-hover:border-border"
        )}
      >
        <span className="text-[8px] font-bold tracking-widest uppercase opacity-80 leading-none">
          CH
        </span>
        <span className="text-sm font-black tracking-tight leading-none mt-0.5">
          {channel.channelNumber}
        </span>
      </div>

      {/* 2. Channel Logo / Fallback Emblem */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-background/90 border border-border/50 shrink-0 flex items-center justify-center shadow-xs">
        {!hasImgError && channel.logo ? (
          <Image
            src={channel.logo}
            alt={`${channel.name} Logo`}
            fill
            unoptimized
            onError={() => setHasImgError(true)}
            sizes="48px"
            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={clsx(
              "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center text-white font-bold p-1 text-center select-none",
              getBadgeGradient(channel.id, channel.category)
            )}
          >
            <span className="text-[10px] font-black tracking-wider leading-none">
              {channel.name.split(" ")[0]}
            </span>
            <span className="text-[8px] opacity-80 font-medium leading-none mt-0.5">
              {channel.name.split(" ").slice(1).join(" ") || "TV"}
            </span>
          </div>
        )}
      </div>

      {/* 3. Channel Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm leading-none shrink-0" title={channel.country}>
              {channel.countryFlag}
            </span>
            <h3
              className={clsx(
                "text-sm font-bold truncate leading-tight transition-colors",
                isActive ? "text-primary" : "text-foreground group-hover:text-primary"
              )}
            >
              {channel.name}
            </h3>
            {channel.hindiName && (
              <span className="text-[11px] text-muted-foreground font-medium shrink-0 truncate max-w-[100px]">
                ({channel.hindiName})
              </span>
            )}
          </div>

          {/* Active Live Indicator or Resolution */}
          {isActive ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider shrink-0 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              <span className="inline-flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-red-500 animate-pulse rounded-full" />
                <span className="w-0.5 h-3 bg-red-500 animate-pulse delay-75 rounded-full" />
                <span className="w-0.5 h-1.5 bg-red-500 animate-pulse delay-150 rounded-full" />
              </span>
              <span>LIVE</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground/80 shrink-0 font-medium px-1.5 py-0.5 rounded bg-muted/40 border border-border/30">
              {channel.resolution || "HD"}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground truncate leading-normal">
          {channel.currentProgram || channel.description}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <Badge
            variant="outline"
            className="text-[9px] py-0 px-1.5 bg-background/50 border-border/40 font-medium"
          >
            {channel.category}
          </Badge>
          <span className="text-[10px] text-muted-foreground/80 truncate max-w-[120px]">
            {channel.country} • {channel.language[0]}
          </span>
          {channel.badgeText && (
            <span className="text-[9px] text-primary/80 font-medium ml-auto hidden sm:inline-block">
              {channel.badgeText}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
export default ChannelCard;
