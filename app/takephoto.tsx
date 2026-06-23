import { CameraView, useCameraPermissions } from 'expo-camera'
import { File } from 'expo-file-system'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Button, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TakePhoto = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const cameraRef = useRef<CameraView>(null)
    const [permission, requestPermission] = useCameraPermissions()
    const [uri, setUri] = useState<string | null>(null)
    const currentParams = useLocalSearchParams()
    const { returnToPathName } = currentParams

    if (!permission) {
        // Camera permissions are still loading.
        return (
            <View>
                <Text>Not allowed</Text>
            </View>
        )
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View>
                <Text>
                    We need your permission to show the camera
                </Text>
                <Button
                    onPress={requestPermission}
                    title="grant permission"
                />
            </View>
        )
    }

    const handleTakePhoto = async () => {
        const photo = await cameraRef.current?.takePictureAsync({
            quality: 0, // 0-1, lower = smaller file (0 is smallest)
            base64: false, // Don't include base64 (saves memory)
            exif: false, // Don't include EXIF data
            skipProcessing: true, // Skip additional processing
        })

        if (photo) {
            const resizedImage = await ImageManipulator.manipulate(
                photo!.uri
            )
                .resize({ width: 800 })
                .renderAsync()

            const compressedImage = await resizedImage.saveAsync({
                compress: 0.5, // 0.0 to 1.0 (1 = highest quality, 0 = lowest)
                format: SaveFormat.JPEG,
            })

            console.log({ tempImage: compressedImage.uri })

            // 3. Create destination file
            const filename = `photo_${Date.now()}.jpg`
            //const destination = new File(Paths.document, filename);

            // 4. Copy compressed image to permanent location
            const compressedFile = new File(compressedImage.uri)
            //compressedFile.copy(destination);

            // console.log({ destinationUri: destination.uri });

            //router.dismiss();
            router.dismissTo({
                pathname: returnToPathName as any, // To Do: fix this typing
                params: {
                    ...currentParams,
                    tempPhotoUri: photo.uri,
                },
            })
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 500, width: 500 }}>
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    ref={cameraRef}
                />
            </View>

            {/* Take Photo Button */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '100%',
                    marginBottom: insets.bottom + 50,
                    height: 50,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'green',
                }}
            >
                <Text onPress={handleTakePhoto}>Take Photo</Text>
            </View>
        </View>
    )
}

export default TakePhoto
