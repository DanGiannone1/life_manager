/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', "class"],
  theme: {
  	extend: {
  		colors: {
  			brandPrimary: '#1D4ED8',
  			brandSecondary: '#9333EA',
  			brandAccent: '#F59E0B',
  			brandNeutral: {
  				DEFAULT: '#374151',
  				dark: '#9CA3AF'
  			},
  			status: {
  				notStarted: 'gray.500',
  				workingOnIt: 'yellow.500',
  				complete: 'green.500'
  			},
  			button: {
  				DEFAULT: 'hsl(var(--button))',
  				hover: 'hsl(var(--button-hover))',
  				text: 'hsl(var(--button-text))',
  				secondary: {
  					DEFAULT: 'hsl(var(--button-secondary))',
  					hover: 'hsl(var(--button-secondary-hover))',
  					text: 'hsl(var(--button-secondary-text))'
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'sans-serif'
  			],
  			heading: [
  				'Poppins',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'status-check': 'status-check 0.3s ease-in-out'
  		},
  		keyframes: {
  			'status-check': {
  				'0%': {
  					transform: 'scale(0)'
  				},
  				'50%': {
  					transform: 'scale(1.2)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
