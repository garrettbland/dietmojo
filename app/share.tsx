import { CARD_RATIO, ShareCard } from '@/components/ShareCard'
import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SheetHeader } from '@/components/ui/SheetHeader'
import { Colors, Shadow, Spacing } from '@/constants/theme'
import { formatDayTitle, toDayKey } from '@/lib/date'
import { getEntriesByDate } from '@/lib/entries'
import { haptic } from '@/lib/haptics'
import { useDate } from '@/providers/DateProvider'
import { FoodEntry } from '@/types/types'
import { File, Paths } from 'expo-file-system'
import { useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    useWindowDimensions,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { captureRef } from 'react-native-view-shot'

/** The preview never needs to be bigger than this to look sharp. */
const MAX_CARD_WIDTH = 360

const Share = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { date } = useDate()
    const { width: screenWidth, height: screenHeight } =
        useWindowDimensions()

    const cardRef = useRef<View>(null)
    const [entries, setEntries] = useState<FoodEntry[] | null>(null)
    const [ready, setReady] = useState(false)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let alive = true
        getEntriesByDate(date)
            .then((rows) => {
                if (alive) setEntries(rows)
            })
            .catch((error) => {
                console.error(error)
                if (alive) setEntries([])
            })
        return () => {
            alive = false
        }
    }, [date])

    // Fit the card to whichever dimension runs out first
    const widthLimit = Math.min(
        screenWidth - Spacing.lg * 2,
        MAX_CARD_WIDTH
    )
    const heightLimit =
        (screenHeight - insets.top - insets.bottom - 240) / CARD_RATIO
    const cardWidth = Math.max(
        220,
        Math.floor(Math.min(widthLimit, heightLimit))
    )

    const share = async () => {
        if (busy || !entries?.length) return
        setBusy(true)
        try {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert(
                    'Sharing unavailable',
                    'This device cannot open the share sheet.'
                )
                return
            }

            const captured = await captureRef(cardRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile',
            })

            // Rename it so Messages and Photos show something sensible
            // rather than a random temp filename.
            const target = new File(
                Paths.cache,
                `dietmojo-${toDayKey(date)}.png`
            )
            if (target.exists) target.delete()
            // move() has been async since SDK 56
            await new File(captured).move(target)

            haptic.success()
            await Sharing.shareAsync(target.uri, {
                mimeType: 'image/png',
                UTI: 'public.png',
                dialogTitle: `${formatDayTitle(date)} on Diet Mojo`,
            })
        } catch (error) {
            console.error(error)
            haptic.warning()
            Alert.alert(
                "Couldn't create the image",
                'Something went wrong building the collage. Please try again.'
            )
        } finally {
            setBusy(false)
        }
    }

    const loading = entries === null
    const empty = !loading && entries.length === 0

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <SheetHeader
                title="Share this day"
                subtitle={formatDayTitle(date)}
                onClose={() => router.back()}
            />

            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: Spacing.lg,
                }}
            >
                {loading && (
                    <ActivityIndicator color={Colors.coral} />
                )}

                {empty && (
                    <EmptyState
                        emoji="📷"
                        title="Nothing to share yet"
                        message="Add a meal to this day and it will show up in the collage."
                        action={
                            <Button
                                title="Close"
                                variant="secondary"
                                onPress={() => router.back()}
                            />
                        }
                    />
                )}

                {!loading && !empty && (
                    <View
                        style={[
                            {
                                borderRadius: 18,
                                overflow: 'hidden',
                                backgroundColor: Colors.white,
                            },
                            Shadow.card,
                        ]}
                    >
                        <ShareCard
                            ref={cardRef}
                            date={date}
                            entries={entries}
                            width={cardWidth}
                            onReady={() => setReady(true)}
                        />
                    </View>
                )}
            </View>

            {!loading && !empty && (
                <View
                    style={{
                        paddingHorizontal: Spacing.lg,
                        paddingTop: Spacing.sm,
                        paddingBottom: Math.max(
                            insets.bottom,
                            Spacing.md
                        ),
                        gap: 6,
                    }}
                >
                    <Button
                        title="Share image"
                        icon="share-outline"
                        size="lg"
                        loading={busy || !ready}
                        onPress={share}
                    />
                    <AppText
                        variant="caption"
                        align="center"
                        color={Colors.gray500}
                    >
                        Choose Save Image in the share sheet to keep
                        it in your photos.
                    </AppText>
                </View>
            )}
        </View>
    )
}

export default Share
