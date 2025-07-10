# WeatherScope

WeatherScope is a modern React + TypeScript weather application that provides real-time weather information and forecasts with beautiful visualizations and a responsive UI.

## Features
- **Live Weather Data:** Get current weather and 5-day forecast for any city using the OpenWeatherMap API.
- **Search & Geolocation:** Search by city or use your device's location.
- **Recent Searches:** Quickly access your last 5 searched locations.
- **Favorites:** Mark cities as favorites for easy access (stored in local storage).
- **Unit Toggle:** Switch between Celsius and Fahrenheit.
- **Dark/Light Mode:** Auto-detects local time for dark mode, with manual toggle.
- **Animated Visuals:** Weather-based background images and animated effects (rain, snow, thunder, etc.).
- **Responsive Design:** Works great on desktop and mobile.

## Screenshots
> _Add screenshots here if desired._

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/matchasai/WeatherScope.git
   cd WeatherScope
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Set up API Key:**
   - Create a `.env` file in the root directory.
   - Add your OpenWeatherMap API key:
     ```env
     VITE_WEATHER_API_KEY=your_api_key_here
     ```

### Running the App
```sh
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173` by default.

## Project Structure
- `src/App.tsx` — Main application logic and UI
- `src/main.tsx` — Entry point
- `src/index.css` — Tailwind CSS styles
- `index.html` — HTML template

## Built With
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)
- [OpenWeatherMap API](https://openweathermap.org/api)

## License
MIT

---

> _WeatherScope - Real-time weather information with beautiful visualizations._ 