export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
])

const MAX_IMAGE_PX = 1600
const IMAGE_QUALITY = 0.8
const MAX_IMAGE_BYTES_AFTER = 1 * 1024 * 1024   // hard reject above 1 MB
const MAX_PDF_BYTES = 5 * 1024 * 1024            // 5 MB

export type CompressResult = {
  blob: Blob
  mimeType: string
  name: string
  size: number
  width: number | null
  height: number | null
}

export async function prepareAttachment(file: File): Promise<CompressResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP, GIF, PDF."
    )
  }

  if (file.type === "application/pdf") {
    if (file.size > MAX_PDF_BYTES) {
      throw new Error(
        `Le PDF dépasse la limite de 5 Mo (${(file.size / 1024 / 1024).toFixed(1)} Mo).`
      )
    }
    return {
      blob: file,
      mimeType: "application/pdf",
      name: sanitizeName(file.name),
      size: file.size,
      width: null,
      height: null,
    }
  }

  const { blob, width, height } = await compressImage(file)

  if (blob.size > MAX_IMAGE_BYTES_AFTER) {
    throw new Error(
      `Image trop volumineuse même après compression (${(blob.size / 1024).toFixed(0)} Ko). Limite : 1 Mo.`
    )
  }

  const baseName = file.name.replace(/\.[^.]+$/, "")
  return {
    blob,
    mimeType: "image/webp",
    name: sanitizeName(`${baseName}.webp`),
    size: blob.size,
    width,
    height,
  }
}

async function compressImage(
  file: File
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { naturalWidth: w, naturalHeight: h } = img
      if (w > MAX_IMAGE_PX || h > MAX_IMAGE_PX) {
        if (w >= h) {
          h = Math.round((h / w) * MAX_IMAGE_PX)
          w = MAX_IMAGE_PX
        } else {
          w = Math.round((w / h) * MAX_IMAGE_PX)
          h = MAX_IMAGE_PX
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas non disponible sur cet appareil."))
        return
      }

      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Échec de la compression de l'image.")); return }
          resolve({ blob, width: w, height: h })
        },
        "image/webp",
        IMAGE_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Impossible de lire l'image."))
    }

    img.src = objectUrl
  })
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128)
}
