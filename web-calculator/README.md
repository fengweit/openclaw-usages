# OpenClaw Cost Calculator

**A visual calculator to compare AI API costs across Claude, GPT-4, and Gemini.**

Built with React + Vite. Dark theme, responsive, no tracking.

---

## Features

- 🔢 **Interactive Calculator** — Adjust usage with sliders and dropdowns
- 📊 **Visual Comparison** — Bar chart showing costs across all providers
- 💰 **Savings Display** — See exactly how much you could save
- ⭐ **Quality Ratings** — See quality scores for your specific use case
- 🎯 **Smart Recommendations** — Get personalized provider suggestions
- 📱 **Responsive** — Works on desktop, tablet, and mobile

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
web-calculator/
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main app component
    ├── App.css             # Global styles & CSS variables
    ├── components/
    │   ├── Calculator.jsx  # Input form
    │   ├── Calculator.css
    │   ├── Results.jsx     # Results panel
    │   ├── Results.css
    │   ├── ProviderCard.jsx # Individual provider cards
    │   ├── ProviderCard.css
    │   ├── CostChart.jsx   # Horizontal bar chart
    │   └── CostChart.css
    └── lib/
        └── calculator.js   # Pricing data & calculations
```

---

## Pricing Data

Current pricing as of April 2026 (per 1M tokens):

| Provider | Model | Input | Output |
|----------|-------|-------|--------|
| Anthropic | Claude Opus | $15.00 | $75.00 |
| Anthropic | Claude Sonnet | $3.00 | $15.00 |
| Anthropic | Claude Haiku | $0.25 | $1.25 |
| OpenAI | GPT-4o | $2.50 | $10.00 |
| OpenAI | GPT-4o-mini | $0.15 | $0.60 |
| OpenAI | GPT-4 Turbo | $10.00 | $30.00 |
| Google | Gemini Pro | $1.25 | $5.00 |
| Google | Gemini Flash | $0.075 | $0.30 |
| Google | Gemini Flash-8B | $0.0375 | $0.15 |

---

## Customization

### Color Palette

CSS variables are defined in `App.css`:

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: #1a1a2e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0b0;
  --accent-green: #00d4aa;
  --accent-yellow: #ffd700;
  --accent-red: #ff4757;
  --accent-blue: #4a9eff;
}
```

### Adding Providers

Edit `src/lib/calculator.js`:

```javascript
export const PROVIDERS = {
  // Add new provider here
  newProvider: {
    name: 'New Provider',
    models: {
      'new-model': {
        name: 'New Model',
        inputPrice: 1.00,
        outputPrice: 5.00,
        quality: { coding: 4, chat: 4, analysis: 4, creative: 4 },
        description: 'Description here',
      },
    },
  },
}
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Drag & drop the `dist` folder to Netlify
```

### Static Hosting

```bash
# Build
npm run build

# Upload contents of `dist/` to any static host
```

---

## Environment Variables

None required. The calculator runs entirely client-side with no API calls.

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT © 2026 Rist (Fengwei Tian)

---

## Related

- **CLI Tool:** [openclaw-usage on npm](https://npmjs.com/package/openclaw-usage)
- **GitHub:** [openclaw-usage](https://github.com/openclaw-usage)

---

*Built in response to the OpenClaw pricing crisis of April 2026.*
