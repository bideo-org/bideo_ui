export const dynamic = "force-static";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  LayoutDashboard,
  Database,
  ServerCog,
  ShieldCheck,
  CloudLightning,
  Rabbit,
  UserRound,
  Video,
  ListVideo,
  HardDriveDownload,
} from "lucide-react";

const techStack = [
  {
    title: "Frontend",
    icon: <LayoutDashboard className="w-5 h-5 text-primary" />,
    tools: [
      { name: "Next.js", desc: "React-based frontend framework" },
      { name: "ShadCN UI", desc: "Accessible, styled UI components" },
    ],
  },
  {
    title: "Backend",
    icon: <ServerCog className="w-5 h-5 text-primary" />,
    tools: [
      { name: "Spring Boot", desc: "Java-based backend service" },
      { name: "PostgreSQL", desc: "Stores user & video metadata" },
    ],
  },
  {
    title: "Authentication",
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    tools: [{ name: "Firebase Auth", desc: "User sign-up, login & JWT auth" }],
  },
  {
    title: "Infrastructure",
    icon: <CloudLightning className="w-5 h-5 text-primary" />,
    tools: [
      { name: "Redis", desc: "Caches views & metadata for fast access" },
      { name: "RabbitMQ", desc: "Queues videos for encoding" },
    ],
  },
];

const flowSteps = [
  {
    icon: <UserRound className="w-5 h-5 mr-2 text-primary" />,
    title: "1. User Login",
    desc: "Firebase Auth handles user identity",
  },
  {
    icon: <Video className="w-5 h-5 mr-2 text-primary" />,
    title: "2. Upload Video",
    desc: "Next.js frontend sends to Spring Boot backend",
  },
  {
    icon: <Rabbit className="w-5 h-5 mr-2 text-primary" />,
    title: "3. Transcoding Queue",
    desc: "RabbitMQ queues jobs for FFmpeg encoding",
  },
  {
    icon: <Database className="w-5 h-5 mr-2 text-primary" />,
    title: "4. Metadata Storage",
    desc: "Video and user metadata stored in PostgreSQL",
  },
  {
    icon: <ListVideo className="w-5 h-5 mr-2 text-primary" />,
    title: "5. Explore Page",
    desc: "Videos rendered by frontend with cached metadata",
  },
  {
    icon: <HardDriveDownload className="w-5 h-5 mr-2 text-primary" />,
    title: "6. Redis Caching",
    desc: "Visited video pages are cached in Redis",
  },
];

export default function TechStackPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <h1 className="text-4xl font-bold">Technology Stack</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techStack.map((section) => (
          <Card
            key={section.title}
            className="shadow-sm hover:shadow-md transition"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                {section.icon}
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.tools.map((tool) => (
                  <div key={tool.name}>
                    <Badge variant="secondary" className="text-sm mb-1">
                      {tool.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-10" />

      <h2 className="text-3xl font-bold">Architecture Flow</h2>
      <div className="space-y-6">
        {flowSteps.map((step) => (
          <div key={step.title} className="flex gap-4 items-start">
            <div className="pt-1">{step.icon}</div>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
