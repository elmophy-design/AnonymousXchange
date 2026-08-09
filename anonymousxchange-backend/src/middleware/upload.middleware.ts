import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${unique}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const originalName = file.originalname.toLowerCase()
    const allowedExt = /\.(jpe?g|png|gif|webp)$/i
    const allowedMime = /^image\/(jpeg|png|gif|webp)$/i
    const ok = allowedExt.test(originalName) && allowedMime.test(file.mimetype)
    if (!ok) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  },
})
