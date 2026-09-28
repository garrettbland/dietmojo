# Diet Mojo

Snap photos of what you eat, track calories/macros and weight.
_Your food, your mood, your mojo._

## Setup after pulling these changes

New native dependencies were added (fonts, gradients, SVG charts,
notifications, sharing), so install and rebuild the dev client:

```bash
npm install
npx expo install --check      # align versions with the SDK
npx expo prebuild --clean     # regenerates ios/ and android/ with new permissions
npx expo run:ios              # or: npm run ios
```

Useful scripts: `npm run typecheck`, `npm run lint`.

## Project map

- `app/` – screens (expo-router). `index` home, `addfood`/`editfood` meal form,
  `takephoto` camera, `calendar`, `measurements` (progress), `weight`, `settings`.
- `components/ui/` – brand primitives (AppText, Button, Card, TextField, Chip,
  Segmented, IconButton, SheetHeader, Toast, EmptyState).
- `constants/theme.ts` – brand tokens from the brand guide.
- `lib/` – data access (`entries`, `measurements`), `photos` (persistent
  storage), `settings` (kv-store), `notifications`, `dataTools` (export/erase),
  `date` (local-time helpers).
- `database/` – migrations (run on launch via `SQLiteProvider`).

### Data conventions

- Timestamps are **local time** strings: `YYYY-MM-DDTHH:mm:ss`.
  Query by day with `substr(col, 1, 10)`.
- Photos are stored in `<documents>/photos`, and the DB keeps the relative path.
  Use `resolvePhotoUri()` to display one.
- Weight is stored in **kg** and converted for display.

---

## Expo notes

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. Start the app

    ```bash
    npx expo start
    ```

Press "shift + m" in the running proccess in terminal to open sqlite tools

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
