import { pickFromLibrary } from '@/components/ImageSelector'
import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Colors, Fonts } from '@/constants/theme'
import { haptic } from '@/lib/haptics'
import { setPendingPhoto } from '@/lib/photoStore'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
    CameraType,
    CameraView,
    useCameraPermissions,
} from 'expo-camera'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import {
    ActivityIndicator,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const RoundButton = ({
    icon,
    label,
    onPress,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name']
    label: string
    onPress: () => void
}) => (
    <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={8}
        onPress={() => {
            haptic.light()
            onPress()
        }}
        style={({ pressed }) => ({
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: pressed
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
        })}
    >
        <Ionicons name={icon} size={24} color="white" />
    </Pressable>
)

/**
 * Full-screen camera.
 * - Opened from the food form: hands the photo back and closes.
 * - Opened with ?next=addfood: continues to the Add meal form.
 */
const TakePhoto = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { next } = useLocalSearchParams<{ next?: string }>()
    const cameraRef = useRef<CameraView>(null)
    const [permission, requestPermission] = useCameraPermissions()
    const [facing, setFacing] = useState<CameraType>('back')
    const [flash, setFlash] = useState(false)
    const [ready, setReady] = useState(false)
    const [capturing, setCapturing] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)

    const finish = (uri: string) => {
        setPendingPhoto(uri)
        if (next === 'addfood') {
            router.replace('/addfood')
        } else {
            router.back()
        }
    }

    const capture = async () => {
        if (!ready || capturing) return
        setCapturing(true)
        haptic.medium()
        try {
            const photo = await cameraRef.current?.takePictureAsync({
                quality: 0.8,
                exif: false,
                shutterSound: false,
            })
            if (photo?.uri) setPreview(photo.uri)
        } catch (error) {
            console.error('Capture failed', error)
        } finally {
            setCapturing(false)
        }
    }

    const choose = async () => {
        const uri = await pickFromLibrary()
        if (uri) finish(uri)
    }

    // Permission still loading
    if (!permission) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#000',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator color={Colors.white} />
            </View>
        )
    }

    if (!permission.granted) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: Colors.background,
                    justifyContent: 'center',
                    paddingTop: insets.top,
                }}
            >
                <EmptyState
                    emoji="📷"
                    title="Camera access"
                    message="Diet Mojo uses your camera to snap photos of your meals. Photos stay on your phone."
                    action={
                        <View
                            style={{ gap: 10, alignItems: 'center' }}
                        >
                            {permission.canAskAgain ? (
                                <Button
                                    title="Allow camera"
                                    icon="camera"
                                    onPress={requestPermission}
                                />
                            ) : (
                                <Button
                                    title="Open Settings"
                                    icon="settings-outline"
                                    onPress={() =>
                                        Linking.openSettings()
                                    }
                                />
                            )}
                            <Button
                                title="Choose from library"
                                variant="secondary"
                                onPress={choose}
                            />
                            <Button
                                title="Not now"
                                variant="plain"
                                size="sm"
                                onPress={() => router.back()}
                            />
                        </View>
                    }
                />
            </View>
        )
    }

    // Review captured photo
    if (preview) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <Image
                    source={{ uri: preview }}
                    style={{ flex: 1 }}
                    contentFit="contain"
                />
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        paddingBottom: insets.bottom + 20,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        gap: 12,
                    }}
                >
                    <Button
                        title="Retake"
                        variant="plain"
                        size="lg"
                        icon="refresh"
                        style={{ flex: 1 }}
                        onPress={() => setPreview(null)}
                    />
                    <Button
                        title="Use photo"
                        size="lg"
                        icon="checkmark"
                        style={{ flex: 1.4 }}
                        onPress={() => finish(preview)}
                    />
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing={facing}
                enableTorch={flash}
                onCameraReady={() => setReady(true)}
                onMountError={(e) => console.error(e.message)}
            />

            {/* Top bar */}
            <View
                style={{
                    position: 'absolute',
                    top: insets.top + 8,
                    left: 16,
                    right: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <RoundButton
                    icon="close"
                    label="Close camera"
                    onPress={() => router.back()}
                />
                <View
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontFamily: Fonts.bold,
                            fontSize: 13,
                        }}
                    >
                        Snap your meal
                    </Text>
                </View>
                <RoundButton
                    icon={flash ? 'flash' : 'flash-off'}
                    label={flash ? 'Turn light off' : 'Turn light on'}
                    onPress={() => setFlash((f) => !f)}
                />
            </View>

            {/* Bottom controls */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingBottom: insets.bottom + 24,
                    paddingTop: 20,
                    paddingHorizontal: 32,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                }}
            >
                <RoundButton
                    icon="images"
                    label="Choose from library"
                    onPress={choose}
                />

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Take photo"
                    disabled={!ready || capturing}
                    onPress={capture}
                    style={({ pressed }) => ({
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        borderWidth: 5,
                        borderColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: ready ? 1 : 0.5,
                        transform: [{ scale: pressed ? 0.92 : 1 }],
                    })}
                >
                    <View
                        style={{
                            width: 62,
                            height: 62,
                            borderRadius: 31,
                            backgroundColor: capturing
                                ? Colors.gray300
                                : Colors.coral,
                        }}
                    />
                </Pressable>

                <RoundButton
                    icon="camera-reverse"
                    label="Flip camera"
                    onPress={() =>
                        setFacing((f) =>
                            f === 'back' ? 'front' : 'back'
                        )
                    }
                />
            </View>

            {!ready && (
                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                    ]}
                >
                    <AppText color={Colors.white}>
                        Starting camera…
                    </AppText>
                </View>
            )}
        </View>
    )
}

export default TakePhoto
