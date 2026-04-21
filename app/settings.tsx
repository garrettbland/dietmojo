import { TABLE_NAMES } from '@/constants'
import { useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useEffect, useState } from 'react'
import { Alert, Button, ScrollView, Text, View } from 'react-native'
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

const Settings = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()

    const db = useSQLiteContext()
    const [recordCount, setRecordCount] = useState(0)
    const [dbVersion, setDbVersion] = useState(0)
    const [tableName, setTableName] = useState(
        TABLE_NAMES.FOOD_ENTRIES
    )

    useEffect(() => {
        loadInfo()
    }, [])

    const loadInfo = async () => {
        const version = await db.getFirstAsync('PRAGMA user_version')
        setDbVersion(version.user_version)

        const count = await db.getFirstAsync(
            `SELECT COUNT(*) as count FROM ${tableName}`
        )
        setRecordCount(count.count)
    }

    const clearAllData = async () => {
        Alert.alert(
            'Clear All Data',
            `Delete all ${recordCount} records? Tables and schema remain.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await db.execAsync(
                            `DELETE FROM ${TABLE_NAMES.FOOD_ENTRIES}`
                        )
                        await loadInfo()
                        Alert.alert('Success', 'All records deleted')
                    },
                },
            ]
        )
    }

    const resetDatabase = async () => {
        Alert.alert(
            'Reset Database',
            'Drop all tables and reset migrations? Requires app restart.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const tables = await db.getAllAsync(
                                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
                            )

                            for (const table of tables) {
                                await db.execAsync(
                                    `DROP TABLE IF EXISTS ${table.name}`
                                )
                            }

                            await db.execAsync(
                                'PRAGMA user_version = 0'
                            )

                            Alert.alert(
                                'Success',
                                'Database reset. Please restart the app.'
                            )
                        } catch (error) {
                            Alert.alert('Error', error.message)
                        }
                    },
                },
            ]
        )
    }

    const devAddFoodEntry = async () => {
        try {
            await db.execAsync(`
        INSERT INTO $ (name, calories, protein, carbs, fat, date)
        VALUES ('Test Food', 100, 5, 10, 2, date('now'));
      `)

            // Refresh stats after adding entry
            loadInfo()
        } catch (error) {
            console.error('Error adding food entry:', error)
        }
    }

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <SafeAreaView
                style={{
                    flex: 1,
                    padding: 15,
                }}
            >
                <View>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '500',
                        }}
                    >
                        Settings
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <View>
                        <Text>
                            Dexterity for add meal and buttons on
                            right or left
                        </Text>
                        <Text>Notifications for reminders</Text>
                        <Text>
                            Food list view. (Like larger items vs more
                            compact)
                        </Text>
                        <Text>Custom macros</Text>
                        <Text>Light or dark mode</Text>
                        <Text>Export data</Text>
                        <Text>Import data?</Text>
                        <Text>Apple health integration</Text>
                        <Text>Erase all data (images and data)</Text>
                    </View>
                </View>
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: 'lightgray',
                        padding: 10,
                        marginTop: 50,
                    }}
                >
                    <Text
                        style={{
                            fontWeight: 'bold',
                            fontSize: 20,
                            marginBottom: 5,
                        }}
                    >
                        Dev Stuff
                    </Text>

                    <Text>Table Name: {tableName}</Text>
                    <Text>Table Version: {dbVersion}</Text>
                    <Text>Number of entries: {recordCount}</Text>
                    <Text
                        style={{
                            fontWeight: 'bold',
                            fontSize: 20,
                            marginTop: 5,
                            marginBottom: 5,
                        }}
                    >
                        Actions
                    </Text>
                    <Button
                        title="Explore Database"
                        onPress={() => router.push('/database')}
                    />
                </View>
            </SafeAreaView>
        </ScrollView>
    )
}

export default Settings
