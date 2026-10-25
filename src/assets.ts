export const B = import.meta.env.BASE_URL
export const asset = (name: string) => `${B}assets/${encodeURIComponent(name)}`
export const EMAIL = 'aditya1729maurya@gmail.com'
export type Meta = { apkBytes: number; shots: number; hasLogo: boolean; hasQr: boolean; hasVideo: boolean; hasPoster: boolean }
