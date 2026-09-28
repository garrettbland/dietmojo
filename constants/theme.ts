/**
 * Diet Mojo design tokens.
 * Source of truth: brand guide (https://dynamic-jelly-c682d0.netlify.app/).
 * Light theme only for now.
 */

export const Colors = {
    // Brand
    coral: '#FF6169',
    orange: '#FF8C38',
    golden: '#FFDA45',
    lime: '#A8E063',

    // Tints (for ghost / tinted fills)
    coralTint: '#FFE8E9',
    orangeTint: '#FFEEDF',
    goldenTint: '#FFF7D6',
    limeTint: '#EEF8E1',

    // Warm neutrals
    white: '#FFFFFF',
    warmWhite: '#FFF8F4',
    gray50: '#F7F4F2',
    gray100: '#EDE9E6',
    gray300: '#C4BDBA',
    gray500: '#8C8582',
    gray700: '#4A4543',
    gray900: '#1C1A19',

    // Semantic
    background: '#FFF8F4',
    surface: '#FFFFFF',
    text: '#1C1A19',
    textSecondary: '#4A4543',
    textMuted: '#8C8582',
    border: '#EDE9E6',
    danger: '#E5484D',
    success: '#A8E063',
    successText: '#4E7A1E',
} as const

/** Primary brand gradient: Coral → Mojo Orange → Golden at 135° */
export const Gradient = {
    colors: [Colors.coral, Colors.orange, Colors.golden] as const,
    // 135° in CSS terms = top-left → bottom-right
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
}

/** Shorter coral → orange gradient, reads better behind small white text */
export const ButtonGradient = {
    colors: [Colors.coral, Colors.orange] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
}

export const Radius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    card: 20,
    xl: 24,
    full: 9999,
} as const

export const Spacing = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
} as const

/** Font family names registered in app/_layout.tsx */
export const Fonts = {
    black: 'Nunito_900Black',
    extraBold: 'Nunito_800ExtraBold',
    bold: 'Nunito_700Bold',
    semiBold: 'Nunito_600SemiBold',
    body: 'NunitoSans_400Regular',
    bodySemiBold: 'NunitoSans_600SemiBold',
    bodyBold: 'NunitoSans_700Bold',
} as const

export const Type = {
    display: {
        fontFamily: Fonts.black,
        fontSize: 34,
        lineHeight: 40,
    },
    h1: { fontFamily: Fonts.black, fontSize: 28, lineHeight: 34 },
    h2: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 28 },
    h3: { fontFamily: Fonts.semiBold, fontSize: 18, lineHeight: 24 },
    body: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 22 },
    bodyStrong: {
        fontFamily: Fonts.bodyBold,
        fontSize: 16,
        lineHeight: 22,
    },
    caption: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18 },
    label: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 16 },
} as const

export type TypeVariant = keyof typeof Type

/** Soft warm shadow for floating elements */
export const Shadow = {
    card: {
        shadowColor: '#4A2A1A',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    floating: {
        shadowColor: '#FF6169',
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },
} as const

/** Category metadata for food entries */
export const Categories = [
    { key: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { key: 'lunch', label: 'Lunch', emoji: '🥗' },
    { key: 'dinner', label: 'Dinner', emoji: '🍝' },
    { key: 'snack', label: 'Snack', emoji: '🍎' },
    { key: 'drink', label: 'Drink', emoji: '🥤' },
    { key: 'other', label: 'Other', emoji: '🍽️' },
] as const

export type CategoryKey = (typeof Categories)[number]['key']

export const getCategory = (key: string | null | undefined) =>
    Categories.find((c) => c.key === key) ??
    Categories[Categories.length - 1]

/** Suggest a category from the time of day */
export const suggestCategory = (date = new Date()): CategoryKey => {
    const h = date.getHours()
    if (h < 11) return 'breakfast'
    if (h < 15) return 'lunch'
    if (h < 17) return 'snack'
    if (h < 22) return 'dinner'
    return 'snack'
}
