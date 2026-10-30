import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy | BuzzClips",
  description:
    "Learn how BuzzClips collects, protects, and handles your data across our video streaming platform.",
};

export default function PrivacyPage() {
  return (
    <div className="w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Privacy Policy
              </h1>
              <p className="text-sm text-muted-foreground">
                Last updated: October 2026 • Your privacy matters to us
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground bg-card/60 border border-border/50 backdrop-blur-md p-6 sm:p-10 rounded-2xl">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p>
              When you use <strong>BuzzClips</strong>, we collect information necessary to provide video streaming, personalized recommendations, and creator tools:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Information:</strong> Email address, username, display name, and avatar URL provided upon registration.</li>
              <li><strong>Video & Content Data:</strong> Videos uploaded, titles, descriptions, categories, tags, and thumbnails.</li>
              <li><strong>Usage Analytics:</strong> Video watch duration, view counts, playback resolution changes, and interaction metrics.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and HLS streaming performance metrics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
            <p>We use collected data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Deliver smooth adaptive HLS video streaming and media transcoding.</li>
              <li>Enable creator channels, profile management, and comment systems.</li>
              <li>Prevent fraud, abusive activity, and copyright violations.</li>
              <li>Improve platform performance, indexing, and recommendation accuracy.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Data Sharing & Third Parties</h2>
            <p>
              We do not sell, rent, or trade your personal data. We only share data with essential infrastructure providers (such as cloud hosting, transcode pipelines, and CDN networks) under strict confidentiality agreements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Cookies & Local Storage</h2>
            <p>
              BuzzClips uses standard session cookies and browser local storage to maintain your authentication state, remember player volume/playback preferences, and theme selections.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Your Privacy Rights</h2>
            <p>
              You have the right to request access to your personal data, update your profile details, or delete your account and associated uploaded videos at any time. BuzzClips is an open-source platform maintained by independent developers without a corporate legal department. To exercise your rights or request account/data removal, contact our maintainers at{" "}
              <a href="mailto:privacy@buzzclips.app" className="text-primary hover:underline font-mono">
                privacy@buzzclips.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
