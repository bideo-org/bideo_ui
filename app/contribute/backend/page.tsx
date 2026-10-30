import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contributing Guide - Spring Boot Backend",
  description: "How to contribute to the backend (Spring Boot) repository",
};

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
    <code>{code}</code>
  </pre>
);

export default function ContributeBackendPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">
        🛠️ Contributing to the Spring Boot Backend
      </h1>
      <p className="text-muted-foreground mb-8">
        Thank you for contributing to the backend! This project is built using{" "}
        <strong>Spring Boot 3.x</strong> and follows a clean RESTful service
        structure.
      </p>

      <Separator className="my-6" />

      <h2 className="text-2xl font-semibold mt-8 mb-2">🧱 Project Structure</h2>
      <Card>
        <CardContent className="font-mono text-sm p-4 whitespace-pre">
          {`
src/
├── main/
│   ├── java/com/example/project/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   └── repository/
│   └── resources/
│       ├── application.yml
│       └── static/
└── test/
    └── java/com/example/project/
`}
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🚀 Getting Started</h2>
      <CodeBlock
        code={`git clone https://github.com/your-org/springboot-backend.git\ncd springboot-backend\n./mvnw spring-boot:run`}
      />

      <h2 className="text-2xl font-semibold mt-8 mb-2">📦 Tech Stack</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Spring Boot 3.x</li>
        <li>Spring Web (REST)</li>
        <li>Spring Data JPA</li>
        <li>JWT-based Security</li>
        <li>PostgreSQL / MySQL</li>
        <li>Maven Wrapper</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        ✅ Contribution Guidelines
      </h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Create a feature branch from <code>main</code>.
        </li>
        <li>Add or modify service/controller logic with clean separation.</li>
        <li>
          Write unit and integration tests in <code>src/test/</code>.
        </li>
        <li>
          Run <code>./mvnw clean install</code> to verify your build.
        </li>
        <li>Ensure meaningful commit messages and clear documentation.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🧪 Testing</h2>
      <CodeBlock code={`./mvnw test`} />

      <h2 className="text-2xl font-semibold mt-8 mb-2">📄 API Documentation</h2>
      <p className="mb-4">
        If Swagger is enabled, navigate to: <br />
        <code>http://localhost:8080/swagger-ui.html</code>
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🔐 Security Notes</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>JWT authentication is applied using a custom filter.</li>
        <li>
          Use role-based access with <code>@PreAuthorize</code> where needed.
        </li>
        <li>Never log or expose credentials in development or production.</li>
      </ul>

      <Separator className="my-6" />

      <p className="text-center text-muted-foreground mt-12">
        🙌 We appreciate your contributions. Feel free to open issues or PRs!
      </p>
    </div>
  );
}
