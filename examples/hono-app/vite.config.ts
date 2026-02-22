import devServer from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Inject OPENAI_API_KEY into process.env so the OpenAI SDK can read it
  process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;

  return {
    plugins: [
      react(),
      devServer({
        entry: "src/server/index.ts",
        injectClientScript: false,
        exclude: [/^(?!\/api\/).*/],
      }),
    ],
  };
});
