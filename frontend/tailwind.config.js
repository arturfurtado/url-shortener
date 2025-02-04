import { fontFamily } from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export const darkMode = ["class"]
export const content = [
    "./src/**/*.{js,ts,jsx,tsx}",
]
export const theme = {
    extend: {
        fontFamily: {
            sans: ["var(--font-sans)", ...fontFamily.sans],
        },
    },
}
export const plugins = [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms")
]