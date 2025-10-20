/** @type {import('tailwindcss').Config} */
module.exports = {
      content: [
            "./app/**/*.{js,jsx,ts,tsx}",
            "./components/**/*.{js,jsx,ts,tsx}",
      ],
      presets: [require("nativewind/preset")],
      theme: {
            extend: {
                  colors: {
                        dark: '#121212',
                        darker: '#1E1E1E',
                        primary: '#006ee6',
                  },
            },
            plugins: [],
      }
}