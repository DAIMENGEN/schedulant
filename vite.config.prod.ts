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
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/schedulant.ts"),
            formats: ["es"],
            fileName: "schedulant",
        },
        rollupOptions: {
            external: ["react", "react-dom"],
        },
        copyPublicDir: false,
    },
    resolve: {
        alias: {
            "@schedulant": resolve(__dirname, "src")
        }
    }
})
