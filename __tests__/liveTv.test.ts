import {
  INDIAN_LIVE_CHANNELS,
  ALL_LIVE_CHANNELS,
  CHANNEL_CATEGORIES,
  CHANNEL_REGIONS,
} from "@/constants/liveChannels";
import { generateLiveTvSchema } from "@/utility/seo";

describe("Global & Indian Live TV Infrastructure & SEO", () => {
  it("has a valid and populated list of Indian FTA channels", () => {
    expect(INDIAN_LIVE_CHANNELS.length).toBeGreaterThanOrEqual(10);

    INDIAN_LIVE_CHANNELS.forEach((channel) => {
      expect(channel.id).toBeDefined();
      expect(channel.channelNumber).toMatch(/^\d{2}$/);
      expect(channel.name.trim().length).toBeGreaterThan(0);
      expect(channel.hindiName.trim().length).toBeGreaterThan(0);
      expect(channel.category).toBeDefined();
      expect(channel.streamUrl).toContain(".m3u8");
      expect(channel.broadcaster.trim().length).toBeGreaterThan(0);
      expect(channel.language.length).toBeGreaterThan(0);
      expect(channel.country).toBe("India");
      expect(channel.countryCode).toBe("IN");
      expect(channel.countryFlag).toBe("🇮🇳");
    });
  });

  it("includes flagship Doordarshan channels (National, News, Sports)", () => {
    const ids = INDIAN_LIVE_CHANNELS.map((c) => c.id);
    expect(ids).toContain("dd-national");
    expect(ids).toContain("dd-news");
    expect(ids).toContain("dd-sports");
    expect(ids).toContain("dd-india");
    expect(ids).toContain("sansad-tv-loksabha");
  });

  it("has a valid and diverse lineup of Worldwide Free-To-Air (FTA) channels", () => {
    expect(ALL_LIVE_CHANNELS.length).toBeGreaterThanOrEqual(25);

    const countryCodes = new Set(ALL_LIVE_CHANNELS.map((c) => c.countryCode));
    expect(countryCodes.has("IN")).toBe(true);
    expect(countryCodes.has("US")).toBe(true);
    expect(countryCodes.has("GB")).toBe(true);
    expect(countryCodes.has("EU")).toBe(true);
    expect(countryCodes.has("JP")).toBe(true);
    expect(countryCodes.has("KR")).toBe(true);

    ALL_LIVE_CHANNELS.forEach((channel) => {
      expect(channel.id).toBeDefined();
      expect(channel.channelNumber).toMatch(/^\d{2}$/);
      expect(channel.name.trim().length).toBeGreaterThan(0);
      expect(channel.streamUrl).toContain(".m3u8");
      expect(channel.country.trim().length).toBeGreaterThan(0);
      expect(channel.countryCode.trim().length).toBeGreaterThan(0);
      expect(channel.countryFlag.trim().length).toBeGreaterThan(0);
      expect(channel.category).toBeDefined();
    });
  });

  it("contains comprehensive category definitions with Hindi translations", () => {
    expect(CHANNEL_CATEGORIES.length).toBeGreaterThanOrEqual(8);
    const categoryIds = CHANNEL_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain("ALL");
    expect(categoryIds).toContain("NATIONAL");
    expect(categoryIds).toContain("NEWS");
    expect(categoryIds).toContain("SPORTS");
    expect(categoryIds).toContain("ENTERTAINMENT");
    expect(categoryIds).toContain("DOCUMENTARY");
    expect(categoryIds).toContain("MUSIC");
    expect(categoryIds).toContain("KIDS");

    CHANNEL_CATEGORIES.forEach((cat) => {
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.hindiLabel.length).toBeGreaterThan(0);
    });
  });

  it("contains proper worldwide region definitions with country flags", () => {
    expect(CHANNEL_REGIONS.length).toBeGreaterThanOrEqual(6);
    const regionIds = CHANNEL_REGIONS.map((r) => r.id);
    expect(regionIds).toContain("ALL");
    expect(regionIds).toContain("IN");
    expect(regionIds).toContain("US");
    expect(regionIds).toContain("GB");
    expect(regionIds).toContain("EU");
    expect(regionIds).toContain("JP");

    CHANNEL_REGIONS.forEach((region) => {
      expect(region.name.length).toBeGreaterThan(0);
      expect(region.flag.length).toBeGreaterThan(0);
      expect(region.hindiName.length).toBeGreaterThan(0);
    });
  });

  it("generates Google-compliant BroadcastService and BroadcastEvent Schema", () => {
    const ddNational = INDIAN_LIVE_CHANNELS.find((c) => c.id === "dd-national")!;
    const schema = generateLiveTvSchema(ddNational, "https://buzzclips.app");

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@graph"]).toBeInstanceOf(Array);
    expect(schema["@graph"].length).toBe(2);

    const broadcastService = schema["@graph"].find(
      (item) => item["@type"] === "BroadcastService"
    );
    expect(broadcastService).toBeDefined();
    expect(broadcastService?.areaServed).toEqual({
      "@type": "Country",
      name: "India",
    });
    expect(broadcastService?.isLiveBroadcast).toBe(true);

    const broadcastEvent = schema["@graph"].find(
      (item) => item["@type"] === "BroadcastEvent"
    );
    expect(broadcastEvent).toBeDefined();
    expect(broadcastEvent?.isLiveBroadcast).toBe(true);
    expect(broadcastEvent?.video?.["@type"]).toBe("VideoObject");
    expect(broadcastEvent?.video?.contentUrl).toBe(ddNational.streamUrl);
  });

  it("generates Schema.org ItemList directory for Channel Guide", () => {
    const { generateChannelListSchema } = require("@/utility/seo");
    const listSchema = generateChannelListSchema(
      ALL_LIVE_CHANNELS,
      "https://buzzclips.app"
    );

    expect(listSchema["@context"]).toBe("https://schema.org");
    expect(listSchema["@type"]).toBe("ItemList");
    expect(listSchema.numberOfItems).toBe(ALL_LIVE_CHANNELS.length);
    expect(listSchema.itemListElement[0].position).toBe(1);
    expect(listSchema.itemListElement[0].url).toContain("/tv?channel=dd-national");
  });

  it("generates Schema.org FAQPage for BuzzClips TV SEO", () => {
    const { generateLiveTvFaqSchema } = require("@/utility/seo");
    const faqSchema = generateLiveTvFaqSchema("https://buzzclips.app");

    expect(faqSchema["@context"]).toBe("https://schema.org");
    expect(faqSchema["@type"]).toBe("FAQPage");
    expect(faqSchema.mainEntity.length).toBeGreaterThanOrEqual(4);
    expect(faqSchema.mainEntity[0].name).toContain("BuzzClips TV");
    expect(faqSchema.mainEntity[0].acceptedAnswer.text).toContain("BuzzClips TV");
  });
});
