import {
    Colors,
    Fonts,
    Gradient,
    getCategory,
    Radius,
} from '@/constants/theme'
import { formatLongDate } from '@/lib/date'
import { resolvePhotoUri } from '@/lib/photos'
import { FoodEntry } from '@/types/types'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ref, useEffect, useMemo, useRef } from 'react'
import { Text, View } from 'react-native'

/** Exported image is 4:5 — fills a phone screen, fits social crops. */
export const CARD_RATIO = 1.25

/** Past this, the last tile becomes a "+N" counter. */
const MAX_TILES = 6

const GUTTER = 4

type Slot =
    | { kind: 'entry'; entry: FoodEntry }
    | { kind: 'more'; count: number }

type Row = { weight: number; slots: Slot[] }

/**
 * How many tiles sit on each row, by how many there are. Three reads
 * best as one hero above a pair; everything else is an even grid.
 */
const patternFor = (n: number): number[] => {
    if (n <= 1) return [1]
    if (n === 2) return [1, 1]
    if (n === 3) return [1, 2]
    if (n === 4) return [2, 2]
    if (n === 5) return [2, 3]
    return [2, 2, 2]
}

const buildRows = (entries: FoodEntry[]): Row[] => {
    const overflow = entries.length > MAX_TILES
    const shown = entries.slice(
        0,
        overflow ? MAX_TILES - 1 : MAX_TILES
    )

    const slots: Slot[] = shown.map((entry) => ({
        kind: 'entry' as const,
        entry,
    }))
    if (overflow) {
        slots.push({
            kind: 'more',
            count: entries.length - shown.length,
        })
    }

    const pattern = patternFor(slots.length)
    const rows: Row[] = []
    let i = 0
    pattern.forEach((count, index) => {
        rows.push({
            // The hero row in the 3-tile layout gets a little more height
            weight:
                pattern.length === 2 && index === 0 && count === 1
                    ? 1.2
                    : 1,
            slots: slots.slice(i, i + count),
        })
        i += count
    })
    return rows
}

/** A meal with no photo still gets a tile, so the day stays complete. */
const PlaceholderTile = ({ entry }: { entry: FoodEntry }) => {
    const category = getCategory(entry.category)
    return (
        <View
            style={{
                flex: 1,
                borderRadius: Radius.md,
                backgroundColor: Colors.gray50,
                borderWidth: 1,
                borderColor: Colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
                gap: 4,
            }}
        >
            <Text style={{ fontSize: 26 }}>{category.emoji}</Text>
            <Text
                numberOfLines={2}
                style={{
                    fontFamily: Fonts.bold,
                    fontSize: 11,
                    lineHeight: 14,
                    textAlign: 'center',
                    color: Colors.gray700,
                }}
            >
                {entry.name}
            </Text>
        </View>
    )
}

const MoreTile = ({ count }: { count: number }) => (
    <LinearGradient
        {...Gradient}
        style={{
            flex: 1,
            borderRadius: Radius.md,
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Text
            style={{
                fontFamily: Fonts.extraBold,
                fontSize: 22,
                color: Colors.white,
            }}
        >
            +{count}
        </Text>
        <Text
            style={{
                fontFamily: Fonts.bold,
                fontSize: 10,
                letterSpacing: 0.6,
                color: 'rgba(255,255,255,0.9)',
            }}
        >
            MORE
        </Text>
    </LinearGradient>
)

/**
 * The image that gets shared: a 4:5 collage of the day's meal photos
 * under a dated header. Rendered on screen as a preview and then
 * rasterised with captureRef, so it is a real view, not a canvas.
 *
 * `onReady` fires once every photo has decoded — capturing before that
 * produces a card full of blank tiles.
 */
export const ShareCard = ({
    date,
    entries,
    width,
    onReady,
    ref,
}: {
    date: Date
    entries: FoodEntry[]
    width: number
    onReady?: () => void
    /** The view captureRef rasterises. React 19 passes this as a prop. */
    ref?: Ref<View>
}) => {
    const rows = useMemo(() => buildRows(entries), [entries])

    const photoCount = useMemo(
        () =>
            entries
                .slice(0, MAX_TILES)
                .filter((e) => !!resolvePhotoUri(e.photo_uri)).length,
        [entries]
    )

    const loaded = useRef(0)
    const done = useRef(false)

    const settle = () => {
        if (done.current) return
        done.current = true
        onReady?.()
    }

    useEffect(() => {
        // Nothing to decode — the card is already final
        if (photoCount === 0) settle()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photoCount])

    const onTileLoaded = () => {
        loaded.current += 1
        if (loaded.current >= photoCount) settle()
    }

    const mealLabel = `${entries.length} ${entries.length === 1 ? 'meal' : 'meals'}`

    return (
        <View
            ref={ref}
            // Android needs this or captureRef returns an empty bitmap
            collapsable={false}
            style={{
                width,
                height: Math.round(width * CARD_RATIO),
                backgroundColor: Colors.white,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingTop: 14,
                    paddingBottom: 10,
                    gap: 10,
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontFamily: Fonts.extraBold,
                            fontSize: 19,
                            color: Colors.text,
                        }}
                    >
                        {date.toLocaleDateString(undefined, {
                            weekday: 'long',
                        })}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontFamily: Fonts.semiBold,
                            fontSize: 12,
                            marginTop: 1,
                            color: Colors.gray500,
                        }}
                    >
                        {formatLongDate(date).replace(
                            /^[^,]+,\s*/,
                            ''
                        )}
                    </Text>
                </View>
                <LinearGradient
                    {...Gradient}
                    style={{
                        paddingHorizontal: 11,
                        paddingVertical: 6,
                        borderRadius: Radius.full,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: Fonts.extraBold,
                            fontSize: 11,
                            color: Colors.white,
                        }}
                    >
                        {mealLabel}
                    </Text>
                </LinearGradient>
            </View>

            {/* Collage */}
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 14,
                    gap: GUTTER,
                }}
            >
                {rows.map((row, r) => (
                    <View
                        key={r}
                        style={{
                            flex: row.weight,
                            flexDirection: 'row',
                            gap: GUTTER,
                        }}
                    >
                        {row.slots.map((slot, c) => {
                            if (slot.kind === 'more') {
                                return (
                                    <MoreTile
                                        key={`more-${c}`}
                                        count={slot.count}
                                    />
                                )
                            }
                            const uri = resolvePhotoUri(
                                slot.entry.photo_uri
                            )
                            if (!uri) {
                                return (
                                    <PlaceholderTile
                                        key={slot.entry.id}
                                        entry={slot.entry}
                                    />
                                )
                            }
                            return (
                                <Image
                                    key={slot.entry.id}
                                    source={{ uri }}
                                    contentFit="cover"
                                    // No fade — a capture mid-fade
                                    // comes out translucent
                                    transition={0}
                                    cachePolicy="memory-disk"
                                    onLoadEnd={onTileLoaded}
                                    style={{
                                        flex: 1,
                                        borderRadius: Radius.md,
                                        backgroundColor:
                                            Colors.gray50,
                                    }}
                                />
                            )
                        })}
                    </View>
                ))}
            </View>

            {/* Footer */}
            <View
                style={{
                    alignItems: 'center',
                    paddingTop: 10,
                    paddingBottom: 9,
                }}
            >
                <Text
                    style={{
                        fontFamily: Fonts.extraBold,
                        fontSize: 10,
                        letterSpacing: 1.6,
                        color: Colors.gray500,
                    }}
                >
                    DIET MOJO
                </Text>
            </View>
            <LinearGradient {...Gradient} style={{ height: 5 }} />
        </View>
    )
}
