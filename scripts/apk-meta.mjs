// Build-time asset check: writes public/asset-meta.json (APK size, screenshot count, file presence).
import { statSync, writeFileSync, existsSync } from 'node:fs'
const dir = 'public/assets/'
const size = (n) => (existsSync(dir + n) ? statSync(dir + n).size : 0)
let shots = 0
while (existsSync(`${dir}screenshot${shots + 1}.jpg`)) shots++
const meta = { apkBytes: size('chem-exp.apk'), shots, hasLogo: existsSync(dir + 'logo.png'), hasQr: existsSync(dir + 'qr.jpg'), hasVideo: existsSync(dir + 'vid tutorial.mp4'), hasPoster: existsSync(dir + 'vid-poster.jpg') }
writeFileSync('public/asset-meta.json', JSON.stringify(meta))
const MB = 1e6
for (const f of ['chem-exp.apk', 'vid tutorial.mp4']) {
  const s = size(f)
  if (!s) console.warn(`[assets] MISSING ${f}`)
  else if (s > 100 * MB) { console.error(`[assets] ${f} is ${(s / MB).toFixed(1)} MB, over GitHub's 100 MB limit. See README.`); process.exit(1) }
  else if (s > 50 * MB) console.warn(`[assets] ${f} is over 50 MB (GitHub warns)`)
}
console.log(`[assets] ${shots} screenshots, APK ${(meta.apkBytes / MB).toFixed(1)} MB`)
