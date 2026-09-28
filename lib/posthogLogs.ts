import { posthog } from '@/lib/posthog'

type LogAttributes = Record<string, string | number | boolean>

/**
 * Sends only purpose-written application logs through PostHog's native
 * React Native log pipeline. Existing console output is intentionally not
 * forwarded.
 */
export const posthogLogger = {
    info: (message: string, attributes: LogAttributes = {}) => {
        posthog?.logger.info(message, attributes)
    },
}
