import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Actions, GITHUB_REPOSITORY is "owner/repo" -> base "/repo/".
// Locally it falls back to "/". Override with VITE_BASE if needed (e.g. custom domain: "/").
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.VITE_BASE ?? (repo ? `/${repo}/` : '/')

export default defineConfig({ base, plugins: [react()] })
