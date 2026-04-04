# OpenClaw Usage Calculator — Web App

Interactive web calculator to compare AI provider costs across Claude, GPT-4, and Gemini.

## Setup

```bash
cd web-calculator
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Build & Deploy

```bash
npm run build    # Output in dist/
npm run preview  # Preview production build
```

### Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo at [vercel.com](https://vercel.com) for auto-deploy on push.

## Features

- **Real-time cost comparison** across 9 models from 3 providers
- **Interactive inputs**: messages/day slider, message length, use case, current provider
- **Visual bar charts** (pure CSS, no chart library)
- **Quality scores** per use case (coding, chat, analysis, creative)
- **Provider cards** with savings calculations
- **Hybrid routing preview** (Pro feature upsell)
- **Premium report upsell** ($9 one-time)
- **Dark theme** with responsive design
- **Zero tracking** — all calculations run client-side

## Tech Stack

- React 18
- Vite 5
- Pure CSS (no UI framework)
- Inter font from Google Fonts

## Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # App shell
├── App.css                     # Global styles
├── lib/
│   └── calculator.js           # Pricing data & calculation logic
└── components/
    ├── Calculator.jsx + .css   # Input form
    ├── Results.jsx + .css      # Results container
    ├── ProviderCard.jsx + .css # Individual provider cards
    └── CostChart.jsx + .css    # Bar chart visualization
```

## License

MIT
