# Event Planner

A modern, web-based event planning application built with TypeScript, Vite, and SCSS. This application provides a beautiful calendar interface for managing events with full CRUD functionality.

## 🚀 Features

- **📅 Interactive Calendar**: Monthly calendar view with event display
- **➕ Event Management**: Create, edit, and delete events
- **🎯 Event Categories**: Organize events by type (Meeting, Personal, Work, Social, Holiday, Appointment, Other)
- **⚡ Priority Levels**: Set priority levels (Low, Medium, High, Urgent)
- **💾 Local Storage**: Events are stored locally as JSON data
- **📱 Responsive Design**: Works great on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, gradient-based design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: TypeScript, HTML5, SCSS
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Runtime**: Node.js
- **Storage**: Browser localStorage (simulating JSON file storage)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd EventPlanner
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
EventPlanner/
├── src/
│   ├── components/          # UI Components
│   │   ├── Calendar.ts      # Calendar component
│   │   ├── Dashboard.ts     # Main dashboard
│   │   └── EventForm.ts     # Event creation/editing form
│   ├── models/              # Data models and types
│   │   └── Event.ts         # Event interface and enums
│   ├── services/            # Business logic and API
│   │   └── EventStorage.ts  # Event storage service
│   ├── styles/              # SCSS stylesheets
│   │   ├── main.scss        # Base styles and utilities
│   │   ├── calendar.scss    # Calendar-specific styles
│   │   └── components.scss  # Component styles
│   ├── utils/               # Utility functions
│   │   ├── dateUtils.ts     # Date manipulation utilities
│   │   └── sampleData.ts    # Sample data generator
│   └── main.ts              # Application entry point
├── data/                    # JSON storage directory (simulated)
├── public/                  # Static assets
├── index.html               # HTML entry point
├── package.json             # Project configuration
└── README.md               # This file
```

## 🎯 Usage

### Creating Events

1. Click the "New Event" button in the top-right corner
2. Fill out the event form with title, description, dates, and other details
3. Select a category and priority level
4. Click "Create Event" to save

### Viewing Events

- Navigate through months using the Previous/Next buttons
- Click on any date to see events for that day
- Events appear as colored indicators on calendar days
- The sidebar shows detailed event information for the selected date

### Editing Events

- Click on any event in the calendar or event list
- Modify the event details in the form
- Click "Update Event" to save changes
- Use the "Delete" button to remove events

### Sample Data

For testing purposes, you can generate sample events by opening the browser console and running:

```javascript
window.createSampleData()
```

This will populate the calendar with sample events to demonstrate the application's features.

## 🔧 Development

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

### Code Structure

The application follows a component-based architecture:

- **Dashboard**: Main application orchestrator
- **Calendar**: Handles calendar display and interaction
- **EventForm**: Manages event creation and editing
- **EventStorage**: Handles data persistence
- **Models**: TypeScript interfaces and types

### Styling

The application uses SCSS with a modular approach:

- CSS custom properties for theming
- Component-specific stylesheets
- Responsive design patterns
- Modern animations and transitions

## 🌟 Features in Detail

### Event Categories

- **Meeting**: Business meetings and conferences
- **Personal**: Personal tasks and activities
- **Work**: Work-related events and deadlines
- **Social**: Social gatherings and parties
- **Holiday**: Holidays and time off
- **Appointment**: Medical, professional appointments
- **Other**: Miscellaneous events

### Priority Levels

- **Low**: Nice-to-have events
- **Medium**: Standard importance
- **High**: Important events
- **Urgent**: Critical, time-sensitive events (with visual indicators)

### Data Storage

Currently uses browser localStorage to simulate file-based storage. Each event is stored as a separate JSON object, with a master index file tracking all event IDs. This approach simulates the requested "generating/saving and loading JSON files for each event" requirement.

## 🚧 Future Enhancements

- Backend API integration
- Real file-based storage
- Event sharing and collaboration
- Recurring events
- Email notifications
- Export to calendar formats (ICS)
- Dark mode theme
- Multiple calendar views (week, day)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using modern web technologies
