import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
    test: {
        include: ['src/tests/**/*.spec.js'],
        environment: "jsdom",
        coverage: {
            exclude: ['src/assets/**', 'src/styles/**'],
            reporter: ['text']
        }
    }
}))