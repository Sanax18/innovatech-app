// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'; // o el preprocesador que uses

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(), // o el preprocesador que estés usando

    kit: {
        adapter: adapter({
            // Opciones por defecto para adapter-static:
            pages: 'build',         // Directorio de salida para las páginas
            assets: 'build',        // Directorio de salida para los assets
            fallback: 'index.html', // O '200.html' o null. Crucial para SPAs.
            precompress: false,
            strict: true
        }),
        // Puede que necesites configurar paths si tu app no se sirve desde la raíz
        // paths: {
        //     base: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
        // }
    }
};

export default config;
