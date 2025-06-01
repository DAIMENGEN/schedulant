import fs from "fs";
import {resolve} from "path";
import dts from "vite-plugin-dts";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({
            tsconfigPath: "./tsconfig.app.json",
        }),
        {
            name: "copy-package.json",
            closeBundle() {
                const source = resolve(__dirname, "package.json");
                const dest = resolve(__dirname, "lib/package.json");
                fs.copyFileSync(source, dest);
            }
        }
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: ["react", "react-dom"],
        },
        outDir: "lib/dist",
        copyPublicDir: false,
    },
    resolve: {
        alias: {
            "@schedulant": resolve(__dirname, "src")
        }
    }
})
