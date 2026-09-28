import { Colors } from '@/constants/theme'
import { migrateDbIfNeeded } from '@/database/migrate'
import { DateProvider } from '@/providers/DateProvider'
import {
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
} from '@expo-google-fonts/nunito'
import {
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans'
import { useFonts } from 'expo-font'
// expo-router ships its own copy of these since SDK 56; it no longer
// depends on @react-navigation/*.
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { SQLiteProvider } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'

SplashScreen.preventAutoHideAsync().catch(() => {})
SplashScreen.setOptions({ duration: 250, fade: true })

const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: Colors.coral,
        background: Colors.background,
        card: Colors.white,
        text: Colors.text,
        border: Colors.border,
    },
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Nunito_600SemiBold,
        Nunito_700Bold,
        Nunito_800ExtraBold,
        Nunito_900Black,
        NunitoSans_400Regular,
        NunitoSans_600SemiBold,
        NunitoSans_700Bold,
    })

    const ready = fontsLoaded || !!fontError

    useEffect(() => {
        if (ready) SplashScreen.hideAsync().catch(() => {})
    }, [ready])

    if (!ready) return null

    return (
        <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: Colors.background }}
        >
            <SQLiteProvider
                databaseName="dietmojo.db"
                onInit={migrateDbIfNeeded}
            >
                <DateProvider>
                    <ThemeProvider value={navTheme}>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: {
                                    backgroundColor:
                                        Colors.background,
                                },
                            }}
                        >
                            <Stack.Screen name="index" />
                            <Stack.Screen
                                name="calendar"
                                options={{
                                    presentation: 'formSheet',
                                    sheetAllowedDetents: [0.72],
                                    sheetGrabberVisible: true,
                                    sheetCornerRadius: 24,
                                    contentStyle: {
                                        backgroundColor: Colors.white,
                                    },
                                }}
                            />
                            <Stack.Screen
                                name="addfood"
                                options={{ presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="editfood"
                                options={{ presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="takephoto"
                                options={{
                                    presentation: 'fullScreenModal',
                                    animation: 'fade',
                                    contentStyle: {
                                        backgroundColor: '#000',
                                    },
                                }}
                            />
                            <Stack.Screen
                                name="measurements"
                                options={{ presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="weight"
                                options={{
                                    presentation: 'formSheet',
                                    sheetAllowedDetents: [0.6],
                                    sheetGrabberVisible: true,
                                    sheetCornerRadius: 24,
                                    contentStyle: {
                                        backgroundColor: Colors.white,
                                    },
                                }}
                            />
                            <Stack.Screen
                                name="settings"
                                options={{ presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="share"
                                options={{ presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="database"
                                options={{
                                    headerShown: true,
                                    title: 'Database',
                                }}
                            />
                        </Stack>
                    </ThemeProvider>
                </DateProvider>
                <StatusBar style="dark" />
            </SQLiteProvider>
        </GestureHandlerRootView>
    )
}
