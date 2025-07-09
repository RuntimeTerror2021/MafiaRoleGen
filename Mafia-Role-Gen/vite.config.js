import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                // login: resolve(__dirname, "auth/login.html"),
                // signup: resolve(__dirname, "auth/signup.html"),
                // about: resolve(__dirname, "about.html"),
                // explore: resolve(__dirname, "explore.html"),
                // trips: resolve(__dirname, "trips.html"),
                // home: resolve(__dirname, "home.html"),
                // saved: resolve(__dirname, "saved.html"),
                // profile: resolve(__dirname, "profile.html"),
            },
        },
    }

})
