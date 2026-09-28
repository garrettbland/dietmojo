/**
 * Hand-off for a photo captured on the camera screen.
 * The camera screen sets it and goes back; the food form consumes it
 * when it regains focus. Avoids pushing file URIs through route params.
 */
let pending: string | null = null

export const setPendingPhoto = (uri: string) => {
    pending = uri
}

export const takePendingPhoto = (): string | null => {
    const uri = pending
    pending = null
    return uri
}
