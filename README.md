# Among Us Log Viewer

A comprehensive analytics dashboard for Among Us game logs, featuring 10 interactive charts built with Next.js and Highcharts.

## 🎯 Features

### 10 Interactive Charts

1. **Faction Win Rate** - Pie chart showing win distribution across factions
2. **Player×Faction Heatmap** ⭐ - Win rates & play counts by player and faction
3. **Player×Role Heatmap** ⭐ - Win rates & play counts for top 15 roles
4. **Player Win Rate** - Stacked percentage column chart
5. **Role Performance** - Bar chart of average tasks completed
6. **Game Duration** - Histogram of game lengths
7. **Player Radar** - Polar chart of individual performance metrics
8. **Task Timeline** - Area chart of task completion progress
9. **Event Density** - Line chart of event frequency over time
10. **Movement with Events** - Spline chart with event markers

### Data Processing

- **JSONL Parser** - Proper line-by-line parsing with error handling
- **Role Mapping** - 150+ custom roles across 5 factions
- **Event Icons** - Visual representation using Lucide React icons
- **Multi-Game Analysis** - Aggregate statistics across multiple games

### UI/UX

- **Game Selector** - Switch between different games
- **Responsive Design** - Mobile and desktop friendly
- **Dark Mode** - Automatic dark mode support
- **Static Export** - No server required

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Output will be in ./out directory
```

## 📊 Data Format

The application reads JSONL (JSON Lines) format where each line is a complete JSON object representing one game.

**Schema Version:** 2.0.0

Place your `game_history_sample.jsonl` file in the `public/` directory.

## 🎨 Faction Colors

- **Crewmate**: `#00e272` (Green)
- **Impostor**: `#fe6a35` (Orange)
- **Madmate**: `#9d4edd` (Purple)
- **Neutral**: `#ffd60a` (Yellow)
- **Other**: `#6c757d` (Gray)

## 🛠 Tech Stack

- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript 5
- **Charts**: Highcharts 12.4.0
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React 0.554.0

## 📁 Project Structure

```
among-us-log-viewer/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Dashboard page
├── components/
│   ├── GameSelector.tsx    # Game selection
│   └── charts/             # 10 chart components
├── lib/
│   ├── jsonl-parser.ts     # JSONL parser
│   ├── role-mapping.ts     # Role classification
│   ├── event-icons.ts      # Icon mapping
│   └── data-transformers/  # 10 data transformers
├── types/
│   └── game-data.types.ts  # Type definitions
└── public/
    └── game_history_sample.jsonl  # Sample data
```

## 🌐 Deployment

This project is configured for static export and can be deployed to GitHub Pages or any static hosting service.

### GitHub Pages

The included GitHub Actions workflow automatically deploys to GitHub Pages on push to `main` or `feature/ui-update` branches.

**Live Demo**: https://kuro-water.github.io/among-us-log-viewer/

## 📝 License

This project follows the same license as the Among Us mod it analyzes.

## 🙏 Acknowledgments

- Built for Town of Host Enhanced (TOHE) mod
- Uses Highcharts for data visualization
- Inspired by the Among Us community
