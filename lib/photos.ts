import { PHOTO_DIR } from '@/constants'
import { Directory, File, Paths } from 'expo-file-system'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

/**
 * Meal photos are resized, compressed and copied into
 * <documents>/photos. The database stores the RELATIVE path
 * ("photos/meal_123.jpg") because the absolute app container path on
 * iOS changes between app updates.
 *
 * Before this, photos were stored straight from the camera/cache
 * directory, which the OS is free to purge at any time.
 */

const photoDir = () => new Directory(Paths.document, PHOTO_DIR)

const ensureDir = () => {
    const dir = photoDir()
    if (!dir.exists)
        dir.create({ intermediates: true, idempotent: true })
    return dir
}

const isStored = (value: string) => value.startsWith(`${PHOTO_DIR}/`)

/** Turn whatever is in the DB into something <Image> can load. */
export const resolvePhotoUri = (
    value: string | null | undefined
): string | null => {
    if (!value) return null
    if (isStored(value)) {
        return new File(Paths.document, value).uri
    }
    return value // legacy absolute URI
}

/**
 * Compress + copy a temporary image into permanent storage.
 * If `uri` is already a stored photo, it is returned untouched.
 */
export const persistPhoto = async (uri: string): Promise<string> => {
    if (isStored(uri)) return uri

    const context = ImageManipulator.manipulate(uri)
    context.resize({ width: 1080 })
    const image = await context.renderAsync()
    const saved = await image.saveAsync({
        compress: 0.7,
        format: SaveFormat.JPEG,
    })

    const dir = ensureDir()
    const name = `meal_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`
    const source = new File(saved.uri)
    // move() is async since SDK 56 — awaiting matters, otherwise the
    // path is returned before the file is actually there.
    await source.move(new File(dir, name))
    return `${PHOTO_DIR}/${name}`
}

/** Delete a stored photo. Silently ignores missing/legacy files. */
export const deletePhoto = (value: string | null | undefined) => {
    if (!value || !isStored(value)) return
    try {
        const file = new File(Paths.document, value)
        if (file.exists) file.delete()
    } catch (error) {
        console.warn('Could not delete photo', value, error)
    }
}

export const deleteAllPhotos = () => {
    try {
        const dir = photoDir()
        if (dir.exists) dir.delete()
    } catch (error) {
        console.warn('Could not delete photo folder', error)
    }
}
