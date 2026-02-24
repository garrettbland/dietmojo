import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
// import { Host, Button } from '@expo/ui/swift-ui';
import { migrateDbIfNeeded } from "@/database/migrate";
import { migrations } from "@/database/migrations";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DateProvider } from "@/providers/DateProvider";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// export const unstable_settings = {
//   anchor: "(tabs)",
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  return (
    <SQLiteProvider databaseName="food.db" onInit={migrateDbIfNeeded}>
      <DateProvider>
        {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
        <GestureHandlerRootView>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="calendar"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.6],
                sheetGrabberVisible: true,
                title: "Date",
                headerShown: true,
                // headerRight: () => (
                //   // <Button title="Close" onPress={() => router.dismiss()} />
                //   <Pressable
                //     onPress={() => router.dismiss()}
                //     style={{
                //       height: 36, // somethiing about a height and width of 36 centers
                //       width: 36,
                //       display: "flex",
                //       justifyContent: "center",
                //       alignItems: "center",
                //     }}
                //   >
                //     <IconSymbol size={26} name="checkmark" color={"black"} />
                //   </Pressable>
                // ),
              }}
            />
            <Stack.Screen
              name="progress"
              options={{
                presentation: "modal",
                title: "Progress",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="weight"
              options={{
                presentation: "modal",
                title: "Weight",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="addfood"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.6, 1],
                title: "Add Food",
                headerTransparent: true,
                sheetGrabberVisible: true,
                contentStyle: {
                  backgroundColor: "#fff", // This removes the glow
                },
                // headerRight: () => (
                //   // <Button title="Close" onPress={() => router.dismiss()} />
                //   <Pressable
                //     onPress={() => router.dismiss()}
                //     style={{
                //       height: 36, // somethiing about a height and width of 36 centers
                //       width: 36,
                //       display: "flex",
                //       justifyContent: "center",
                //       alignItems: "center",
                //     }}
                //   >
                //     {/* <IconSymbol size={26} name="xmark" color={"black"} /> */}
                //     <IconSymbol size={26} name="checkmark" color={"black"} />
                //   </Pressable>
                // ),
              }}
            />
            <Stack.Screen
              name="takephoto"
              options={{
                presentation: "modal",
                title: "Take Photo",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                // headerShown: true,
                // headerTransparent: true,
                headerTitle: "Settings",
                headerLargeTitleEnabled: true,
                headerBackButtonDisplayMode: "minimal",
                headerTransparent: true,
                //headerBlurEffect: "systemMaterial",
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </DateProvider>
      <StatusBar style="auto" />
    </SQLiteProvider>
  );
}

// Initialize database schema
async function oldmigrateDbIfNeeded(db) {
  // Increment this for each migration
  const TOTAL_MIGRATIONS = migrations.length;

  console.log(`Latest migration version: ${TOTAL_MIGRATIONS}`);

  /**
   * Have to use user_version to track the users current migration version.
   */
  let { user_version: USERS_CURRENT_MIGRATION } = await db.getFirstAsync(
    "PRAGMA user_version",
  );

  console.log(`Users current migration version: ${USERS_CURRENT_MIGRATION}`);

  if (USERS_CURRENT_MIGRATION >= TOTAL_MIGRATIONS) {
    console.log("No migration needed, user has latest migration changes");
    return;
  }

  // Run pending migrations
  for (let i = USERS_CURRENT_MIGRATION; i < TOTAL_MIGRATIONS; i++) {
    console.log(`Running migration ${i}: ${migrations[i].name}`);

    try {
      // Start transaction
      await db.execAsync("BEGIN TRANSACTION");

      // Run migration
      await migrations[i].run(db);

      // Update version within transaction
      await db.execAsync(`PRAGMA user_version = ${i + 1}`);

      // Commit
      await db.execAsync("COMMIT");

      console.log(`✓ Migration ${i} completed`);
    } catch (error) {
      // Rollback on error
      await db.execAsync("ROLLBACK");
      console.error(`✗ Migration ${i} failed:`, error);
      throw error;
    }
  }

  // V1: Initial schema
  // if (currentDbVersion === 0) {
  //   console.log("Running migration: V1 - Initial schema");
  //   await db.execAsync(`
  //     CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.FOOD_ENTRIES} (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       name TEXT NOT NULL,
  //       date TEXT NOT NULL,
  //       photo_uri TEXT,
  //       notes TEXT,
  //       created_at INTEGER DEFAULT (strftime('%s', 'now'))
  //     );

  //     CREATE INDEX IF NOT EXISTS idx_food_date ON ${TABLE_NAMES.FOOD_ENTRIES}(date);
  //   `);

  //   currentDbVersion = 1;
  // }

  // migration 3: Add nutrition columns
  // if (currentDbVersion < 3) {
  //   console.log("Running migration: V2 - Add nutrition columns");
  //   await db.execAsync(`
  //     ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN calories INTEGER;
  //     ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN protein INTEGER;
  //     ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN carbs INTEGER;
  //     ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN fat INTEGER;
  //   `);
  //   currentDbVersion = 4;
  // }

  // Set the user_version to the latest
  console.log(`Database migrated to version ${TOTAL_MIGRATIONS}`);
}
