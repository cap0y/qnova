# Korean Education Platform (지누켐)

## Overview
This is a comprehensive online education platform built for Korean users, specializing in professional training courses, certificates, and educational seminars. The platform serves individual learners, educational institutions, and businesses with a complete learning management system.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React Context for client state
- **UI Components**: Custom component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Authentication**: Session-based authentication with Passport.js strategies

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local, Google, and Kakao OAuth strategies
- **Real-time Communication**: WebSocket support for live chat
- **File Handling**: Multer for file uploads with type validation

### Build System
- **Frontend**: Vite for development and production builds
- **Backend**: ESBuild for server bundling
- **Development**: Hot module replacement with Vite dev server
- **TypeScript**: Full type safety across frontend and backend

## Key Components

### User Management System
- Multi-tier user roles: individual users, business accounts, and administrators
- Business account approval workflow for institutional partnerships
- Profile management with role-based access control
- Session management with persistent login options

### Course Management
- Comprehensive course catalog with categories, levels, and types
- Support for online, offline, and blended learning formats
- Course approval workflow for business-submitted content
- Instructor profiles and course assignments
- Multimedia content support (videos, documents, interactive materials)

### Learning Management
- Enrollment tracking with progress monitoring
- Certificate generation and management system
- Learning progress tracking per course module
- Assessment and evaluation tools
- Course completion tracking and reporting

### E-commerce Integration
- Shopping cart functionality for course purchases
- Multiple payment method support
- Pricing management with discount capabilities
- Payment processing and order management
- Refund handling system

### Communication System
- Real-time chat support via WebSocket
- Notice and announcement system
- Help center with FAQ management
- User inquiry and support ticket system

## Data Flow

### User Authentication Flow
1. User registers through multi-step form with type selection
2. Business users undergo approval process by administrators
3. Authentication handled through Passport.js with multiple strategies
4. Session persistence with secure cookie management
5. Role-based route protection and API access control

### Course Enrollment Flow
1. Users browse course catalog with filtering and search
2. Add courses to shopping cart for purchase
3. Process payment through integrated payment system
4. Enrollment records created with progress tracking initialization
5. Access to course content and learning materials granted

### Content Management Flow
1. Business users create course content through dashboard
2. Administrator approval required for course publication
3. Course metadata and materials stored in database
4. File uploads processed and validated through Multer
5. Course availability managed through status system

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL database
- **Connection Pooling**: @neondatabase/serverless for serverless compatibility
- **Database Migrations**: Drizzle Kit for schema management

### Authentication Providers
- **Google OAuth**: Google Strategy for social login
- **Kakao OAuth**: Kakao Strategy for Korean social platform integration
- **Local Authentication**: Email/password with secure password hashing

### File Storage
- **Local Storage**: Multer for file upload handling
- **Static File Serving**: Express static middleware for uploaded content
- **File Validation**: Type and size restrictions for security

### UI Framework
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with backend proxy
- **Database**: Direct connection to Neon PostgreSQL
- **Environment Variables**: Local .env file configuration
- **Development Scripts**: Concurrent frontend and backend development

### Production Deployment
- **Build Process**: Separate frontend (Vite) and backend (ESBuild) builds
- **Static Assets**: Frontend built to dist/ directory
- **Server Bundle**: Backend compiled to single ESM file
- **Database**: Production PostgreSQL connection with SSL
- **Process Management**: Node.js server with environment-based configuration

### Database Management
- **Schema Management**: Drizzle migrations for version control
- **Seeding**: Automated database seeding for initial data
- **Backup Strategy**: Database backup through Neon platform
- **Performance**: Connection pooling and query optimization

## Recent Changes
- June 26, 2025: **DEPLOYMENT FIXED** - React app (home-page.tsx) now displays correctly in production
- June 26, 2025: Configured production Vite server to bypass host restrictions while serving full React app
- June 26, 2025: Korean education platform fully operational at decomsoft.replit.app with complete UI
- June 26, 2025: All components, styling, and interactions working in both development and production
- June 26, 2025: Removed custom HTML fallback in favor of actual React application

## Changelog
- June 24, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.