import { createClient } from "@hey-api/openapi-ts";

await createClient({
  input: "docs/openapi.yaml",
  output: "src/api/generated",
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    {
      name: "@hey-api/sdk",
      operationId: true,
    },
  ],
});
