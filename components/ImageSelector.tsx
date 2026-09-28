import { Colors, Radius } from '@/constants/theme'
import { haptic } from '@/lib/haptics'
import { resolvePhotoUri } from '@/lib/photos'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { ComponentProps } from 'react'
import { Alert, Linking, Pressable, View } from 'react-native'
import { AppText } from './ui/AppText'

export const pickFromLibrary = async (): Promise<string | null> => {
    const perm =
        await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted && perm.accessPrivileges !== 'limited') {
        Alert.alert(
            'Photo access needed',
            'Allow photo access in Settings to choose meal photos.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => Linking.openSettings(),
                },
            ]
        )
        return null
    }
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
    })
    return result.canceled ? null : result.assets[0].uri
}

const Option = ({
    icon,
    label,
    onPress,
}: {
    icon: ComponentProps<typeof Ionicons>['name']
    label: string
    onPress: () => void
}) => (
    <Pressable
        accessibilityRole="button"
        onPress={() => {
            haptic.light()
            onPress()
        }}
        style={({ pressed }) => ({
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: Radius.lg,
            backgroundColor: pressed
                ? Colors.coralTint
                : Colors.white,
        })}
    >
        <View
            style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: Colors.coralTint,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Ionicons name={icon} size={24} color={Colors.coral} />
        </View>
        <AppText variant="label" color={Colors.gray700}>
            {label}
        </AppText>
    </Pressable>
)

/**
 * Photo area for the food form: take/choose a photo, or preview it
 * with replace/remove controls.
 */
export const ImageSelector = ({
    photo,
    onChange,
}: {
    /** Stored relative path or a temporary file URI */
    photo: string | null
    onChange: (uri: string | null) => void
}) => {
    const router = useRouter()

    const openCamera = () => router.push('/takephoto')

    const choose = async () => {
        const uri = await pickFromLibrary()
        if (uri) onChange(uri)
    }

    const uri = resolvePhotoUri(photo)

    if (!uri) {
        return (
            <View
                style={{
                    height: 170,
                    flexDirection: 'row',
                    gap: 8,
                    padding: 8,
                    borderRadius: Radius.xl,
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: Colors.gray300,
                    backgroundColor: Colors.gray50,
                }}
            >
                <Option
                    icon="camera"
                    label="Take photo"
                    onPress={openCamera}
                />
                <Option
                    icon="images"
                    label="Choose photo"
                    onPress={choose}
                />
            </View>
        )
    }

    return (
        <View
            style={{
                aspectRatio: 4 / 3,
                borderRadius: Radius.xl,
                overflow: 'hidden',
                backgroundColor: Colors.gray100,
            }}
        >
            <Image
                source={{ uri }}
                style={{ flex: 1 }}
                contentFit="cover"
                transition={200}
                accessibilityLabel="Meal photo"
            />
            <View
                style={{
                    position: 'absolute',
                    right: 10,
                    bottom: 10,
                    flexDirection: 'row',
                    gap: 8,
                }}
            >
                {(
                    [
                        {
                            icon: 'camera',
                            label: 'Retake',
                            onPress: openCamera,
                        },
                        {
                            icon: 'images',
                            label: 'Replace',
                            onPress: choose,
                        },
                        {
                            icon: 'trash',
                            label: 'Remove photo',
                            onPress: () => onChange(null),
                        },
                    ] as const
                ).map((b) => (
                    <Pressable
                        key={b.label}
                        accessibilityRole="button"
                        accessibilityLabel={b.label}
                        onPress={() => {
                            haptic.light()
                            b.onPress()
                        }}
                        style={({ pressed }) => ({
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: pressed
                                ? 'rgba(0,0,0,0.7)'
                                : 'rgba(0,0,0,0.5)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        })}
                    >
                        <Ionicons
                            name={b.icon}
                            size={18}
                            color="white"
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    )
}
