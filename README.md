# POS Frontend - Point of Sale Web Application

Modern, responsive frontend for the POS (Point-of-Sale) system built with React, TypeScript, and Vite. Features a clean Material-UI/Tailwind interface for managing inventory, processing sales, and tracking business operations.

## 🛠️ Tech Stack

**Core:**
- React 18+
- TypeScript
- Vite (Build tool & Dev server)
- React Router v6 (Routing)

**UI & Styling:**
- Material-UI (MUI) / Tailwind CSS
- Responsive Design
- Dark/Light Theme Support

**State Management:**
- React Context API / Redux Toolkit
- React Query (Server state)

**Form Handling:**
- React Hook Form
- Yup / Zod (Validation)

**HTTP Client:**
- Axios

**Deployment:**
- Vercel / Netlify
- Production-ready builds

## ✨ Key Features

- 🖥️ **Dashboard** - Real-time sales overview, revenue charts, inventory status
- 🛍️ **Product Management** - Add, edit, delete products with images
- 🛒 **Sales Processing** - Quick checkout, barcode scanning, receipt generation
- 📦 **Inventory Tracking** - Stock levels, low-stock alerts, supplier management
- 👥 **User Management** - Role-based access control for staff
- 📊 **Reports & Analytics** - Sales reports, top products, revenue trends
- 🔔 **Notifications** - Real-time alerts for important events
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations
- 🔐 **Secure Authentication** - JWT-based login, protected routes

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running (see [pos-system](https://github.com/WhySeriousKaif/pos-system))

### Installation

```bash
# Clone repository
git clone https://github.com/WhySeriousKaif/pos-frontend.git
cd pos-frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL
```

### Development

```bash
# Start dev server
npm run dev
# or
yarn dev
```

App runs on: `http://localhost:5173`

### Build for Production

```bash
# Create optimized build
npm run build
# or
yarn build

# Preview production build
npm run preview
```

## 📱 Features

### Dashboard
- Today's sales summary
- Revenue charts (daily, weekly, monthly)
- Inventory status overview
- Quick actions panel

### Sales Module
- Product search with barcode scanner
- Shopping cart with quantity management
- Multiple payment methods
- Discount/coupon application
- Receipt generation and printing

### Inventory Module
- Product catalog with images
- Stock level management
- Low-stock alerts
- Supplier management
- Bulk import/export

### Reports
- Sales reports by date range
- Top-selling products
- Revenue analysis
- Inventory value
- Staff performance

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Common components (Button, Input, etc.)
│   ├── dashboard/       # Dashboard components
│   ├── products/        # Product management
│   ├── sales/           # Sales/checkout components
│   └── reports/         # Reports & analytics
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── services/            # API service functions
├── utils/               # Utility functions
├── types/               # TypeScript types/interfaces
├── styles/              # Global styles
├── assets/              # Images, icons, fonts
└── App.tsx              # Main app component
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=POS System
VITE_ENABLE_BARCODE_SCANNER=true
```

## 🧪 Testing

```bash
# Run tests
npm run test
# or
yarn test

# Run tests with coverage
npm run test:coverage
```

## 📦 Related Repositories

- [POS Backend](https://github.com/WhySeriousKaif/pos-system) - Java Spring Boot backend

## 🚀 Deployment

Deployed on Vercel with automatic deployments from main branch.

### Live Demo
- Production: [pos-frontend-sage-beta.vercel.app](https://pos-frontend-sage-beta.vercel.app)
- Status: ✅ Active

## 📚 Technologies Used

- **Vite** - Fast build tool with HMR
- **TypeScript** - Type safety and better DX
- **React Router** - Client-side routing
- **Material-UI / Tailwind** - UI component library
- **React Query** - Server state management
- **Axios** - HTTP client
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 💻 Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Keep components small and focused
- Use custom hooks for reusable logic

## 📧 Support

For issues or questions, please open a GitHub issue.

## 📄 License

MIT License - See LICENSE file for details

---

**Built by:** MD Kaif Molla (@WhySeriousKaif)
