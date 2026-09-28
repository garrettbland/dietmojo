import { TABLE_NAMES } from '@/constants'
import { toLocalTimestamp } from '@/lib/date'
import { useDate } from '@/providers/DateProvider'
import { useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface TableInfo {
    name: string
    schema: any[]
    entries: any[]
}

interface TableRow {
    name: string
}

/**
 * Reads every user table with its schema and most recent rows. Pure
 * data access — it touches no component state, which is what lets the
 * mount effect call it without tripping the cascading-render rule.
 */
const collectTables = async (
    db: ReturnType<typeof useSQLiteContext>
): Promise<TableInfo[]> => {
    const tableList = (await db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )) as TableRow[]

    const tableInfos: TableInfo[] = []
    for (const tableRow of tableList) {
        const schema = await db.getAllAsync(
            `PRAGMA table_info(${tableRow.name})`
        )
        const entries = await db.getAllAsync(
            `SELECT * FROM ${tableRow.name} ORDER BY rowid DESC LIMIT 20`
        )
        tableInfos.push({ name: tableRow.name, schema, entries })
    }
    return tableInfos
}

const Database = () => {
    const router = useRouter()
    const db = useSQLiteContext()
    const { date } = useDate()

    const [tables, setTables] = useState<TableInfo[]>([])
    const [expandedTable, setExpandedTable] = useState<string | null>(
        null
    )
    const [loading, setLoading] = useState(true)

    const loadTables = useCallback(async () => {
        try {
            setTables(await collectTables(db))
        } catch (error) {
            console.error('Error loading tables:', error)
        } finally {
            setLoading(false)
        }
    }, [db])

    // The read is kept out of the effect body: state is only set from
    // the promise callback, after the await, so this never cascades a
    // render. `loading` already starts true, so nothing sets it here.
    useEffect(() => {
        let alive = true
        collectTables(db)
            .then((next) => {
                if (alive) setTables(next)
            })
            .catch((error) => {
                console.error('Error loading tables:', error)
            })
            .finally(() => {
                if (alive) setLoading(false)
            })
        return () => {
            alive = false
        }
    }, [db])

    const addMockData = async () => {
        try {
            const mockFoods = [
                {
                    name: 'Chicken Breast',
                    calories: 165,
                    protein: 31,
                    carbs: 0,
                    fat: 3.6,
                },
                {
                    name: 'Brown Rice',
                    calories: 111,
                    protein: 2.6,
                    carbs: 23,
                    fat: 0.9,
                },
                {
                    name: 'Broccoli',
                    calories: 34,
                    protein: 2.8,
                    carbs: 7,
                    fat: 0.4,
                },
                {
                    name: 'Salmon',
                    calories: 208,
                    protein: 20,
                    carbs: 0,
                    fat: 13,
                },
                {
                    name: 'Sweet Potato',
                    calories: 86,
                    protein: 1.6,
                    carbs: 20,
                    fat: 0.1,
                },
                {
                    name: 'Almonds',
                    calories: 579,
                    protein: 21,
                    carbs: 22,
                    fat: 50,
                },
                {
                    name: 'Eggs',
                    calories: 155,
                    protein: 13,
                    carbs: 1.1,
                    fat: 11,
                },
                {
                    name: 'Greek Yogurt',
                    calories: 59,
                    protein: 10,
                    carbs: 3.3,
                    fat: 0.4,
                },
            ]

            for (const food of mockFoods) {
                // Local time, matching the rest of the app —
                // toISOString() shifts the day across the UTC boundary
                const dateString = toLocalTimestamp(date)
                await db.execAsync(`
          INSERT INTO ${TABLE_NAMES.ENTRIES} (name, calories, protein, carbs, fat, consumed_at)
          VALUES ('${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat}, '${dateString}');
        `)
            }

            Alert.alert(
                'Success',
                `Added ${mockFoods.length} mock food entries`
            )
            await loadTables()
        } catch (error) {
            Alert.alert('Error', `Failed to add mock data: ${error}`)
            console.error('Error adding mock data:', error)
        }
    }

    const clearAllData = async () => {
        Alert.alert(
            'Clear All Data',
            'Delete all records from all tables? Tables and schema remain.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const tableList = await db.getAllAsync(
                                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
                            )

                            for (const table of tableList as TableRow[]) {
                                await db.execAsync(
                                    `DELETE FROM ${table.name}`
                                )
                            }

                            Alert.alert(
                                'Success',
                                'All data cleared from all tables'
                            )
                            await loadTables()
                        } catch (error) {
                            Alert.alert(
                                'Error',
                                `Failed to clear data: ${error}`
                            )
                            console.error(
                                'Error clearing data:',
                                error
                            )
                        }
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
                            const tableList = await db.getAllAsync(
                                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
                            )

                            for (const table of tableList as TableRow[]) {
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
                            Alert.alert(
                                'Error',
                                `Failed to reset database: ${error}`
                            )
                            console.error(
                                'Error resetting database:',
                                error
                            )
                        }
                    },
                },
            ]
        )
    }

    const toggleTable = (tableName: string) => {
        setExpandedTable(
            expandedTable === tableName ? null : tableName
        )
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <SafeAreaView
                style={{
                    flex: 1,
                    padding: 15,
                }}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{ fontSize: 24, fontWeight: 'bold' }}
                    >
                        Database
                    </Text>
                    <Button
                        title="Close"
                        onPress={() => router.dismiss()}
                    />
                </View>

                {/* Refresh Button */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Button
                            title="Refresh"
                            onPress={() => {
                                setLoading(true)
                                loadTables()
                            }}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button
                            title="Add Mock Data"
                            onPress={addMockData}
                            color="#10b981"
                        />
                    </View>
                </View>

                {/* Clear & Reset Buttons */}
                <View
                    style={{
                        flexDirection: 'row',
                        gap: 8,
                        marginTop: 8,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Button
                            title="Clear All Data"
                            onPress={clearAllData}
                            color="#ef4444"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button
                            title="Reset Database"
                            onPress={resetDatabase}
                            color="#dc2626"
                        />
                    </View>
                </View>

                {loading ? (
                    <Text
                        style={{ marginTop: 20, textAlign: 'center' }}
                    >
                        Loading...
                    </Text>
                ) : tables.length === 0 ? (
                    <Text
                        style={{ marginTop: 20, textAlign: 'center' }}
                    >
                        No tables found
                    </Text>
                ) : (
                    <View style={{ marginTop: 20 }}>
                        {tables.map((table) => (
                            <View
                                key={table.name}
                                style={styles.tableContainer}
                            >
                                {/* Table Header */}
                                <View
                                    style={{
                                        padding: 12,
                                        backgroundColor: '#3b82f6',
                                        borderRadius: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text
                                        onPress={() =>
                                            toggleTable(table.name)
                                        }
                                        style={{
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                        }}
                                    >
                                        📊 {table.name}
                                    </Text>
                                    <Text
                                        style={{
                                            color: '#e0e7ff',
                                            fontSize: 12,
                                        }}
                                    >
                                        {table.entries.length} entries
                                        • {table.schema.length}{' '}
                                        columns
                                    </Text>
                                </View>

                                {expandedTable === table.name && (
                                    <View>
                                        {/* Schema Section */}
                                        <View
                                            style={{
                                                marginBottom: 16,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontWeight:
                                                        'bold',
                                                    marginBottom: 8,
                                                }}
                                            >
                                                Schema
                                            </Text>
                                            <View
                                                style={styles.table}
                                            >
                                                {/* Schema Header */}
                                                <View
                                                    style={[
                                                        styles.row,
                                                        styles.headerRow,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.cell,
                                                            styles.headerCell,
                                                            {
                                                                flex: 1.5,
                                                            },
                                                        ]}
                                                    >
                                                        Column
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.cell,
                                                            styles.headerCell,
                                                            {
                                                                flex: 1,
                                                            },
                                                        ]}
                                                    >
                                                        Type
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.cell,
                                                            styles.headerCell,
                                                            {
                                                                flex: 0.8,
                                                            },
                                                        ]}
                                                    >
                                                        Key
                                                    </Text>
                                                </View>

                                                {/* Schema Rows */}
                                                {table.schema.map(
                                                    (
                                                        column,
                                                        index
                                                    ) => (
                                                        <View
                                                            key={
                                                                column.cid
                                                            }
                                                            style={[
                                                                styles.row,
                                                                index %
                                                                    2 ===
                                                                    0 &&
                                                                    styles.evenRow,
                                                            ]}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.cell,
                                                                    {
                                                                        flex: 1.5,
                                                                        fontWeight:
                                                                            '600',
                                                                    },
                                                                ]}
                                                            >
                                                                {
                                                                    column.name
                                                                }
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.cell,
                                                                    {
                                                                        flex: 1,
                                                                        fontFamily:
                                                                            'monospace',
                                                                    },
                                                                ]}
                                                            >
                                                                {
                                                                    column.type
                                                                }
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.cell,
                                                                    {
                                                                        flex: 0.8,
                                                                    },
                                                                ]}
                                                            >
                                                                {column.pk ===
                                                                1
                                                                    ? 'PK'
                                                                    : '-'}
                                                            </Text>
                                                        </View>
                                                    )
                                                )}
                                            </View>
                                        </View>

                                        {/* Data Section */}
                                        <View>
                                            <Text
                                                style={{
                                                    fontWeight:
                                                        'bold',
                                                    marginBottom: 8,
                                                }}
                                            >
                                                Last 20 Entries
                                            </Text>
                                            {table.entries.length ===
                                            0 ? (
                                                <Text
                                                    style={{
                                                        color: '#999',
                                                    }}
                                                >
                                                    No entries
                                                </Text>
                                            ) : (
                                                <ScrollView
                                                    horizontal
                                                    showsHorizontalScrollIndicator={
                                                        true
                                                    }
                                                >
                                                    <View>
                                                        {/* Data Header */}
                                                        <View
                                                            style={[
                                                                styles.row,
                                                                styles.headerRow,
                                                            ]}
                                                        >
                                                            {table.schema.map(
                                                                (
                                                                    column
                                                                ) => (
                                                                    <Text
                                                                        key={
                                                                            column.name
                                                                        }
                                                                        style={[
                                                                            styles.cell,
                                                                            styles.headerCell,
                                                                            {
                                                                                minWidth: 100,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {
                                                                            column.name
                                                                        }
                                                                    </Text>
                                                                )
                                                            )}
                                                        </View>

                                                        {/* Data Rows */}
                                                        {table.entries.map(
                                                            (
                                                                entry,
                                                                idx
                                                            ) => (
                                                                <View
                                                                    key={
                                                                        idx
                                                                    }
                                                                    style={[
                                                                        styles.row,
                                                                        idx %
                                                                            2 ===
                                                                            0 &&
                                                                            styles.evenRow,
                                                                    ]}
                                                                >
                                                                    {table.schema.map(
                                                                        (
                                                                            column
                                                                        ) => (
                                                                            <Text
                                                                                key={
                                                                                    column.name
                                                                                }
                                                                                style={[
                                                                                    styles.cell,
                                                                                    {
                                                                                        minWidth: 100,
                                                                                    },
                                                                                    typeof entry[
                                                                                        column
                                                                                            .name
                                                                                    ] ===
                                                                                        'string' &&
                                                                                    entry[
                                                                                        column
                                                                                            .name
                                                                                    ]
                                                                                        .length >
                                                                                        20
                                                                                        ? {
                                                                                              fontSize: 10,
                                                                                          }
                                                                                        : {},
                                                                                ]}
                                                                                numberOfLines={
                                                                                    2
                                                                                }
                                                                            >
                                                                                {String(
                                                                                    entry[
                                                                                        column
                                                                                            .name
                                                                                    ] ??
                                                                                        ''
                                                                                )}
                                                                            </Text>
                                                                        )
                                                                    )}
                                                                </View>
                                                            )
                                                        )}
                                                    </View>
                                                </ScrollView>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </SafeAreaView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    tableContainer: {
        marginBottom: 24,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    table: {
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
    },
    headerRow: {
        backgroundColor: '#f3f4f6',
    },
    evenRow: {
        backgroundColor: '#f9fafb',
    },
    cell: {
        padding: 10,
        fontSize: 12,
    },
    headerCell: {
        fontWeight: '700',
        color: '#374151',
        backgroundColor: '#f3f4f6',
    },
})

export default Database
