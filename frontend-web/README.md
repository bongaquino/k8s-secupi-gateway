# 🎨 Bong Aquino Frontend Application

> **Modern React application built with cutting-edge technologies for exceptional user experience and developer productivity.**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

## ✨ Features

- **⚡ Lightning Fast** - Built with Vite for instant development server
- **🎨 Modern UI** - Beautiful components with ShadCN/UI and Tailwind CSS
- **🔒 Type Safe** - Full TypeScript support for robust development
- **📱 Responsive** - Mobile-first design for all screen sizes
- **🔄 State Management** - Efficient data handling with React Query
- **🛣️ Routing** - Seamless navigation with React Router
- **🌙 Theme Support** - Light/dark mode with system preference detection

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or pnpm (recommended)

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/bongaquino/frontend-web.git
cd frontend-web

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open in browser
open http://localhost:5173
```

## 🛠️ Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **⚛️ React** | 19.1.0 | UI Framework |
| **📘 TypeScript** | 5.8.3 | Type Safety |
| **⚡ Vite** | 6.3.5 | Build Tool |
| **🎨 Tailwind CSS** | 3.4.1 | Styling |

### UI & Components
| Library | Purpose |
|---------|---------|
| **🧩 ShadCN/UI** | Pre-built accessible components |
| **🎯 Radix UI** | Primitive UI components |
| **🎭 Lucide React** | Beautiful icon library |
| **📊 Recharts** | Data visualization |

### Development Tools
| Tool | Purpose |
|------|---------|
| **🔍 ESLint** | Code linting |
| **🎨 Prettier** | Code formatting |
| **🧪 TypeScript** | Type checking |
| **🔄 React Query** | Data fetching |

## 📁 Project Structure

```
src/
├── 🎨 components/          # Reusable UI components
│   ├── ui/                 # ShadCN base components
│   └── guards/            # Route protection components
├── 📄 pages/              # Application pages
│   ├── Auth/              # Authentication pages
│   ├── Dashboard/         # Main dashboard
│   └── Settings/          # User settings
├── 🔌 api/                # API integration
│   ├── services/          # API service functions
│   └── types/             # TypeScript definitions
├── 🪝 hooks/              # Custom React hooks
├── 🎭 layouts/            # Page layout components
├── 🛠️ lib/               # Utility functions
├── 🎨 assets/             # Static assets
└── 🎯 utils/              # Helper functions
```

## 🎨 Component Library

### Available Components
- **🔘 Buttons** - Primary, secondary, outline variants
- **📝 Forms** - Input fields, select boxes, checkboxes
- **📊 Tables** - Sortable, filterable data tables
- **🃏 Cards** - Content containers with various layouts
- **🚨 Alerts** - Success, error, warning notifications
- **🔄 Loading** - Skeleton loaders and spinners

### Usage Example
```tsx
import { Button, Card, Input } from '@/components/ui'

function LoginForm() {
  return (
    <Card className="w-full max-w-md">
      <form className="space-y-4">
        <Input 
          type="email" 
          placeholder="Email address"
          required 
        />
        <Input 
          type="password" 
          placeholder="Password"
          required 
        />
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Card>
  )
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_VERSION=v1

# Authentication
VITE_AUTH_DOMAIN=auth.example.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Customization
```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## 📱 Responsive Design

### Breakpoint System
```css
/* Mobile First Approach */
.component {
  @apply text-sm;          /* Default: Mobile */
  @apply md:text-base;     /* Tablet: 768px+ */
  @apply lg:text-lg;       /* Desktop: 1024px+ */
  @apply xl:text-xl;       /* Large: 1280px+ */
}
```

### Design Principles
- **📱 Mobile First** - Designed for mobile, enhanced for desktop
- **♿ Accessibility** - WCAG 2.1 AA compliant
- **🎨 Consistent** - Unified design system
- **⚡ Performance** - Optimized loading and interactions

## 🔄 State Management

### React Query Setup
```typescript
// API data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Mutations
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries(['users'])
  }
})
```

## 🚀 Deployment

### Build for Production
```bash
# Build optimized bundle
pnpm build

# Preview production build
pnpm preview

# Deploy to hosting provider
pnpm deploy
```

### Build Optimization
- **📦 Code Splitting** - Automatic route-based chunks
- **🗜️ Asset Optimization** - Minified CSS/JS
- **🖼️ Image Optimization** - WebP conversion
- **🗂️ Bundle Analysis** - Size monitoring

## 🧪 Testing & Quality

### Scripts
```bash
# Linting
pnpm lint

# Type checking
pnpm type-check

# Build verification
pnpm build

# Preview build
pnpm preview
```

## 📊 Performance Metrics

- **⚡ First Contentful Paint**: < 1.5s
- **🎯 Largest Contentful Paint**: < 2.5s
- **📊 Cumulative Layout Shift**: < 0.1
- **🔄 First Input Delay**: < 100ms

## 🤝 Contributing

### Development Workflow
1. **🍴 Fork** the repository
2. **🌿 Create** feature branch: `git checkout -b feature/amazing-feature`
3. **💻 Develop** with hot reload: `pnpm dev`
4. **✅ Test** your changes: `pnpm lint && pnpm type-check`
5. **📝 Commit** changes: `git commit -m 'Add amazing feature'`
6. **🚀 Push** branch: `git push origin feature/amazing-feature`
7. **📬 Submit** pull request

### Code Standards
- **📝 TypeScript** for all new components
- **🎨 Tailwind CSS** for styling
- **♿ Accessibility** considerations required
- **📱 Responsive** design mandatory

## 📞 Support & Resources

- **📖 Documentation**: [Component Storybook](https://storybook.example.com)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/bongaquino/frontend-web/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/bongaquino/frontend-web/discussions)
- **📧 Contact**: admin@example.com

---

<div align="center">

**Crafted with ❤️ by [Bong Aquino](https://github.com/bongaquino)**

*Modern React Development | Fast • Beautiful • Accessible*

</div>