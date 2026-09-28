import { Colors, Fonts } from '@/constants/theme'
import { formatNumber } from '@/lib/units'
import { haptic } from '@/lib/haptics'
import { useState } from 'react'
import { GestureResponderEvent, Text, View } from 'react-native'
import Svg, {
    Circle,
    Defs,
    Line,
    LinearGradient,
    Path,
    Stop,
} from 'react-native-svg'

export type ChartPoint = { t: number; value: number; label: string }

const PAD = { top: 16, right: 12, bottom: 24, left: 40 }

const niceStep = (range: number) => {
    const raw = range / 3
    const pow = 10 ** Math.floor(Math.log10(raw || 1))
    const n = raw / pow
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

/**
 * Single-series line chart (weight over time).
 * Touch and drag to inspect a point.
 */
export const WeightChart = ({
    points,
    height = 200,
    unit,
}: {
    points: ChartPoint[]
    height?: number
    unit: string
}) => {
    const [width, setWidth] = useState(0)
    const [active, setActive] = useState<number | null>(null)

    const innerW = Math.max(width - PAD.left - PAD.right, 1)
    const innerH = height - PAD.top - PAD.bottom

    const values = points.map((p) => p.value)
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const step = niceStep(Math.max(rawMax - rawMin, 2))
    const min = Math.floor((rawMin - step * 0.25) / step) * step
    const max = Math.ceil((rawMax + step * 0.25) / step) * step
    const ticks: number[] = []
    for (let v = min; v <= max + 1e-9; v += step) ticks.push(v)

    const t0 = points[0]?.t ?? 0
    const t1 = points[points.length - 1]?.t ?? 1
    const span = Math.max(t1 - t0, 1)

    const x = (t: number) =>
        PAD.left +
        (points.length === 1
            ? innerW / 2
            : ((t - t0) / span) * innerW)
    const y = (v: number) =>
        PAD.top + innerH - ((v - min) / (max - min || 1)) * innerH

    const line = points
        .map((p, i) => `${i ? 'L' : 'M'}${x(p.t)},${y(p.value)}`)
        .join(' ')
    const area =
        points.length > 1
            ? `${line} L${x(t1)},${PAD.top + innerH} L${x(t0)},${PAD.top + innerH} Z`
            : ''

    const inspect = (e: GestureResponderEvent) => {
        if (!points.length) return
        const lx = e.nativeEvent.locationX
        let best = 0
        let bestDist = Infinity
        points.forEach((p, i) => {
            const d = Math.abs(x(p.t) - lx)
            if (d < bestDist) {
                bestDist = d
                best = i
            }
        })
        if (best !== active) {
            haptic.selection()
            setActive(best)
        }
    }

    const shown =
        active != null ? points[active] : points[points.length - 1]
    const shownIndex = active ?? points.length - 1

    return (
        <View>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 4,
                    minHeight: 20,
                }}
            >
                <Text
                    style={{
                        fontFamily: Fonts.bodySemiBold,
                        fontSize: 13,
                        color: Colors.gray500,
                    }}
                >
                    {shown ? shown.label : ''}
                </Text>
                <Text
                    style={{
                        fontFamily: Fonts.extraBold,
                        fontSize: 15,
                        color: Colors.text,
                    }}
                >
                    {shown
                        ? `${formatNumber(Number(shown.value.toFixed(1)))} ${unit}`
                        : ''}
                </Text>
            </View>
            <View
                onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
                style={{ height }}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={inspect}
                onResponderMove={inspect}
                onResponderRelease={() => setActive(null)}
                onResponderTerminate={() => setActive(null)}
                accessible
                accessibilityLabel={`Weight chart, ${points.length} entries. Latest ${shown ? `${shown.value.toFixed(1)} ${unit}` : 'none'}.`}
            >
                {width > 0 && (
                    <Svg width={width} height={height}>
                        <Defs>
                            <LinearGradient
                                id="fill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <Stop
                                    offset="0"
                                    stopColor={Colors.coral}
                                    stopOpacity={0.18}
                                />
                                <Stop
                                    offset="1"
                                    stopColor={Colors.coral}
                                    stopOpacity={0}
                                />
                            </LinearGradient>
                        </Defs>

                        {ticks.map((v) => (
                            <Line
                                key={v}
                                x1={PAD.left}
                                x2={width - PAD.right}
                                y1={y(v)}
                                y2={y(v)}
                                stroke={Colors.gray100}
                                strokeWidth={1}
                            />
                        ))}

                        {area ? (
                            <Path d={area} fill="url(#fill)" />
                        ) : null}
                        <Path
                            d={line}
                            stroke={Colors.coral}
                            strokeWidth={2}
                            fill="none"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />

                        {active != null && shown && (
                            <Line
                                x1={x(shown.t)}
                                x2={x(shown.t)}
                                y1={PAD.top}
                                y2={PAD.top + innerH}
                                stroke={Colors.gray300}
                                strokeWidth={1}
                            />
                        )}

                        {shown && (
                            <Circle
                                cx={x(shown.t)}
                                cy={y(shown.value)}
                                r={5}
                                fill={Colors.coral}
                                stroke={Colors.white}
                                strokeWidth={2}
                                key={shownIndex}
                            />
                        )}
                    </Svg>
                )}

                {/* Y labels */}
                {width > 0 &&
                    ticks.map((v) => (
                        <Text
                            key={`l${v}`}
                            style={{
                                position: 'absolute',
                                left: 0,
                                width: PAD.left - 8,
                                textAlign: 'right',
                                top: y(v) - 8,
                                fontFamily: Fonts.body,
                                fontSize: 11,
                                color: Colors.gray500,
                            }}
                        >
                            {formatNumber(v)}
                        </Text>
                    ))}

                {/* X labels: first and last */}
                {width > 0 && points.length > 1 && (
                    <>
                        <Text
                            style={{
                                position: 'absolute',
                                left: PAD.left,
                                bottom: 0,
                                fontFamily: Fonts.body,
                                fontSize: 11,
                                color: Colors.gray500,
                            }}
                        >
                            {points[0].label}
                        </Text>
                        <Text
                            style={{
                                position: 'absolute',
                                right: PAD.right,
                                bottom: 0,
                                fontFamily: Fonts.body,
                                fontSize: 11,
                                color: Colors.gray500,
                            }}
                        >
                            {points[points.length - 1].label}
                        </Text>
                    </>
                )}
            </View>
        </View>
    )
}
