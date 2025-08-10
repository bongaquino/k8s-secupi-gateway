# Bong Aquino Frontend & Integration Project Template

A modern frontend template with ReactJS, Vite, Tailwind CSS, ShadCN, Axios, React Query, and React Router.

## Tech Stack

- **ReactJS** - A JavaScript library for building user interfaces
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Accessible UI components built with Radix UI and Tailwind
- **Axios** - Promise based HTTP client
- **React Query** - Data fetching and state management library
- **React Router** - Declarative routing for React

## Project Structure

```
src/
├── api/               # API services and utilities
│   ├── client.ts      # Axios client setup
│   └── sampleService.ts # Example API service
├── assets/            # Static assets like images, fonts, etc.
├── components/        # Reusable UI components
│   └── ui/            # ShadCN UI components
├── hooks/             # Custom React hooks
│   └── useFetch.ts    # Data fetching hooks with React Query
├── layouts/           # Page layout components
│   └── MainLayout.tsx # Main application layout
├── lib/               # Utility functions and helpers
│   └── utils.ts       # General utility functions
├── pages/             # Page components
│   └── HomePage.tsx   # Home page
├── App.tsx            # Main app component with routing
├── index.css          # Global styles with Tailwind
└── main.tsx           # Application entry point
```

## Getting Started

1. Clone this repository or use it as a template
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Build for production:
   ```bash
   pnpm build
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=your_api_url
```

## Customization

- **API Integration**: Update or add services in the `api/` directory
- **Components**: Add new components in the `components/` directory
- **Pages**: Create new pages in the `pages/` directory and add them to the router in `App.tsx`
- **Styling**: Modify `index.css` and Tailwind configuration in `tailwind.config.js`

## License

MIT
# ar-frontend-integration-template
