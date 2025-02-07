<h1 align="center">
  Overwolf React Dota 2 Overlay App
</h1>

## Dota 2 Real-Time Stats Overlay

A React-based Overwolf application that provides real-time game statistics overlay for Dota 2 players. Built with modern web technologies and designed for smooth integration with the game.

### Main Components

- `src/screens/desktop/components/Screen.tsx`
- `src/screens/background/components/Screen.tsx`

### Project Scope

This overlay provides real-time game statistics including:
- Match duration timer
- Kill/Death/Assist (KDA) ratio
- Current hero information
- Gold and net worth tracking
- Last hit counter
- Level progression
- Interactive stats display with toggle functionality


## Prerequisites

- Node.js 18+
- TypeScript 5.3.3
- Create React App

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

Note: If you encounter any issues with the `ajv` package, you may need to reinstall it:
```bash
npm uninstall ajv
npm install ajv
```

3. Build the Overwolf package:
```bash
npm run build:overwolf
```

## Development

1. Start the development server:
```bash
npm start
```

2. For hot-reload development with Overwolf:
```bash
npm run dev
```

## Testing

### Local Development Testing
The application includes a mock data system that simulates game events in the development environment:

1. Run the development server:
```bash
npm start
```
2. Open http://localhost:3000 in your browser
3. You'll see the overlay with simulated game statistics

### Testing in Game Environment

1. Launch the Overwolf Developer Client
2. Load the built package from the `dist` folder
3. Start Dota 2
4. Join a game (or watch one) to see real-time statistics

## Technical Details

### Tech Stack
- React 18
- TypeScript 5.3.3
- Overwolf SDK
- Create React App

### Key Features
- Real-time game event processing
- Automatic stats calculations (KDA ratio, etc.)
- Development/Production environment detection
- Mock data system for development
- Responsive overlay design

### Trade-offs and Design Decisions

1. **Mock Data System**: 
   - Implemented to facilitate development without requiring a running game
   - Simulates realistic game scenarios with random variations
   - May not perfectly match all game scenarios

2. **Development vs Production**:
   - Development environment uses mock data
   - Production environment uses actual Overwolf API
   - Different initialization paths based on environment

3. **Performance Considerations**:
   - Minimal re-renders through React's useCallback
   - Efficient state updates for real-time stats
   - Light-weight UI to prevent game performance impact

## Known Issues and Solutions

1. **Overwolf API Initialization**:
   - Issue: Overwolf object may not be immediately available
   - Solution: Added initialization checks and event listeners

2. **TypeScript Version**:
   - Required Version: 5.3.3
   - Reason: Compatibility with Create React App and modern type definitions

3. **ajv Package**:
   - Issue: May require reinstallation for proper functionality
   - Solution: Uninstall and reinstall if you encounter related errors