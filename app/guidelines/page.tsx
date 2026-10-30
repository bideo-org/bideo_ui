import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Community Guidelines | BuzzClips",
  description:
    "Explore BuzzClips's community guidelines designed to ensure a safe, creative, and respectful video sharing environment.",
};

export default function GuidelinesPage() {
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
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Community Guidelines
              </h1>
              <p className="text-sm text-muted-foreground">
                Standards and rules to keep BuzzClips safe, welcoming, and inspiring for everyone
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground bg-card/60 border border-border/50 backdrop-blur-md p-6 sm:p-10 rounded-2xl">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Our Philosophy</h2>
            <p>
              BuzzClips was built to give creators of all sizes an open, high-performance platform to publish original videos and connect with audiences worldwide. To ensure the experience remains constructive and safe, all users and creators must adhere to these standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Respectful Content & Civility</h2>
            <p>
              We encourage expressive, diverse, and authentic perspectives. However, the following are strictly prohibited:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Harassment & Cyberbullying:</strong> Targeted insults, doxxing, impersonation, or malicious hostility toward individuals.</li>
              <li><strong>Hate Speech:</strong> Content attacking or demeaning individuals based on race, ethnicity, religion, disability, gender, or sexual orientation.</li>
              <li><strong>Threats of Violence:</strong> Incitement, promotion, or glorification of physical violence or self-harm.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Safety & Child Protection</h2>
            <p>
              We have a zero-tolerance policy for child sexual abuse material (CSAM), child endangerment, or exploitation of minors. Violations result in immediate permanent account termination and referral to global law enforcement and the National Center for Missing & Exploited Children (NCMEC).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Platform Integrity & Spam</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Do not post repetitive automated spam, misleading metadata, or clickbait thumbnails designed to trick viewers.</li>
              <li>Do not deploy artificial engagement bots, click farms, or deceptive viewer inflation.</li>
              <li>Do not distribute malware, phishing links, or unauthorized software.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Reporting Violations</h2>
            <p>
              If you encounter content or comments that violate our community standards, report it directly or contact our community maintainers at{" "}
              <a href="mailto:safety@buzzclips.app" className="text-primary hover:underline font-mono">
                safety@buzzclips.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
