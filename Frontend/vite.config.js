import react from "@vitejs/plugin-react";
import path from "path";
import url from "url";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
	define: {
		global: "globalThis",
	},
	resolve: {
		alias: {
			"./runtimeConfig": "./runtimeConfig.browser",
			"@": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [react({}), compression()],
	server: {
		port: 5100,
		strictPort: true,
		open: true,
	},
	esbuild: {
		loader: "jsx",
	},
	optimizeDeps: {
		force: true,
		esbuildOptions: {
			loader: {
				".js": "jsx",
			},
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						return id
							.toString()
							.split("node_modules/")[1]
							.split("/")[0]
							.toString();
					}
				},
			},
		},
		minify: "esbuild",
		sourcemap: false,
		target: "modules",
	},
});
