import PostHog from 'posthog-react-native'

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST

/**
 * Analytics is deliberately off while developing.
 *
 * Left on, every reload would count as an app launch, every fresh
 * simulator install as a new user, and — because errorTracking
 * autocapture is enabled — every red-screen error would land in error
 * tracking as a production $exception.
 *
 * Release builds read these values from EAS environment variables, not
 * from .env: a local .env file never reaches an EAS Build.
 */
if (__DEV__) {
    console.log(
        '[posthog] Analytics disabled in development. Events are only sent from release builds.'
    )
}

if (__DEV__ && !projectToken) {
    console.warn(
        '[posthog] EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is not set. It is unused in development, but a release build without it ships with analytics silently disabled.'
    )
}

if (__DEV__ && !host) {
    console.warn(
        '[posthog] EXPO_PUBLIC_POSTHOG_HOST is not set. It is unused in development, but a release build without it ships with analytics silently disabled.'
    )
}

export const posthog =
    !__DEV__ && projectToken && host
        ? new PostHog(projectToken, {
              host,
              logs: {
                  serviceName: 'dietmojo',
              },
              captureAppLifecycleEvents: true,
              errorTracking: {
                  autocapture: {
                      uncaughtExceptions: true,
                      unhandledRejections: true,
                  },
              },
          })
        : undefined
