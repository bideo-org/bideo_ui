import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Copyright & DMCA Policy | BuzzClips",
  description:
    "Learn about BuzzClips's Digital Millennium Copyright Act (DMCA) policy, copyright compliance, and notice-and-takedown procedure.",
};

export default function DmcaPage() {
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
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Copyright & DMCA Policy
              </h1>
              <p className="text-sm text-muted-foreground">
                Notice and Takedown Procedure under the Digital Millennium Copyright Act
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground bg-card/60 border border-border/50 backdrop-blur-md p-6 sm:p-10 rounded-2xl">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Commitment to Copyright Protection</h2>
            <p>
              <strong>BuzzClips</strong> respects the intellectual property rights of creators and copyright holders. In accordance with the Digital Millennium Copyright Act (DMCA) and applicable global copyright laws, we respond promptly to notices of alleged copyright infringement and maintain a policy of terminating repeat infringers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Filing a DMCA Takedown Notice</h2>
            <p>
              If you are a copyright owner or authorized agent and believe that content hosted on BuzzClips infringes your copyright, please send a written notification containing the following details to our designated Copyright Agent:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>A physical or electronic signature of the person authorized to act on behalf of the copyright owner.</li>
              <li>Identification of the copyrighted work claimed to have been infringed (or a representative list of works).</li>
              <li>Identification of the material claimed to be infringing, including the specific BuzzClips URL (e.g., <code>https://buzzclips.app/watch/example-slug</code>).</li>
              <li>Your contact information, including name, physical address, telephone number, and email address.</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, agent, or the law.</li>
              <li>A statement made under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Designated DMCA Contact</h2>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-sm space-y-2">
              <p className="font-semibold text-foreground">BuzzClips Maintainers (Open-Source Project)</p>
              <p className="text-xs text-muted-foreground">
                BuzzClips is an open-source platform maintained by independent developers without a corporate legal department. All notices of claimed infringement are handled directly and promptly by project maintainers.
              </p>
              <p className="flex items-center gap-1.5 text-primary pt-1">
                <Mail className="w-4 h-4" />
                <a href="mailto:dmca@buzzclips.app" className="hover:underline font-mono text-xs">
                  dmca@buzzclips.app
                </a>
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Counter-Notification Procedure</h2>
            <p>
              If your video was removed due to a copyright notice and you believe this was done in error or misidentification, you may submit a formal counter-notification to our copyright agent detailing your identification, the removed URL, and your consent to legal jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Repeat Infringer Policy</h2>
            <p>
              In appropriate circumstances and at our discretion, BuzzClips terminates user accounts and channels that are subject to repeated copyright infringement notices.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
