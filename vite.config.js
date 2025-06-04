import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 7476,
    },
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag === "iobio-multi-series",
                },
            },
        }),
    ],
    base: "/sv.iobio/frontend/", //add a base path to the project
});
