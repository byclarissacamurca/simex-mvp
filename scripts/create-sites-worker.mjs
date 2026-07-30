import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const serverDir = join(process.cwd(), "dist", "server");
await mkdir(serverDir, { recursive: true });

await writeFile(
  join(serverDir, "index.js"),
  `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (request.method === "GET" && !url.pathname.includes(".")) {
      return env.ASSETS.fetch(new Request(new URL("/", request.url), request));
    }

    return response;
  },
};

export default worker;
`,
);
