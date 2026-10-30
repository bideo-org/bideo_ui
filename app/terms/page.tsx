import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service | BuzzClips",
  description:
    "Review the terms and conditions governing the use of the BuzzClips video streaming platform and creator services.",
};

export default function TermsPage() {
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
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Terms of Service
              </h1>
              <p className="text-sm text-muted-foreground">
                Last updated: October 2026 • Effective immediately
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground bg-card/60 border border-border/50 backdrop-blur-md p-6 sm:p-10 rounded-2xl">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or using the <strong>BuzzClips</strong> platform (&ldquo;Service&rdquo;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use or access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. User Accounts & Responsibilities</h2>
            <p>
              To upload videos, leave comments, or create channels, you may be required to create an account. You agree to provide accurate, current, and complete information and maintain the security of your authentication credentials.
            </p>
            <p>
              You are solely responsible for all activities that occur under your account. Notify us immediately if you suspect any unauthorized use or security compromise.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. User Content & Intellectual Property</h2>
            <p>
              You retain all ownership rights in the original videos and content you upload to BuzzClips. By submitting content to the platform, you grant BuzzClips a worldwide, non-exclusive, royalty-free license to host, transcode, adaptively stream (HLS), display, and distribute the content solely in connection with operating and promoting the Service.
            </p>
            <p>
              You represent and warrant that you own or have obtained all necessary licenses, rights, consents, and permissions to publish the content you upload.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Prohibited Conduct</h2>
            <p>When using BuzzClips, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Upload content that infringes upon copyright, trademark, or intellectual property rights.</li>
              <li>Publish harmful, abusive, harassing, defamatory, or unlawful materials.</li>
              <li>Attempt to scrape, reverse engineer, or disrupt the streaming infrastructure or API services.</li>
              <li>Distribute spam, unauthorized advertising, or automated bot-generated traffic.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Termination & Content Removal</h2>
            <p>
              We reserve the right to suspend or terminate accounts and remove any video content that violates these Terms, our Community Guidelines, or applicable laws, without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Contact & Inquiries</h2>
            <p>
              BuzzClips is an open-source, community-driven platform built by independent developers. We do not claim registered trademarks or operate a corporate legal department. If you have questions or inquiries regarding these terms or the service, reach out directly to our team at{" "}
              <a href="mailto:contact@buzzclips.app" className="text-primary hover:underline font-mono">
                contact@buzzclips.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
