# ReWear - Community Clothing Exchange

ReWear is a modern, community-driven clothing exchange platform that promotes sustainable fashion by enabling users to swap, share, and discover pre-loved clothing items. Built with Next.js, TypeScript, Tailwind CSS, and Neon serverless Postgres, ReWear provides a seamless experience for both regular users and administrators.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **User Authentication**: Register and log in with email and password. JWT-based authentication.
- **Item Listing**: List clothing items with images, categories, tags, sizes, and conditions.
- **Item Browsing & Search**: Browse, search, and filter items by category and keywords.
- **Swapping System**: Request swaps, offer your own items, and chat with swap partners.
- **Points System**: Earn and spend points for listing and redeeming items.
- **Admin Panel**: Approve, reject, or remove items. Admin-only access.
- **Notifications**: Receive notifications for swap requests, approvals, and other events.
- **Responsive UI**: Modern, mobile-friendly design using Tailwind CSS and Radix UI components.

---

## Tech Stack
- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Backend/API**: Next.js API routes
- **Database**: [Neon Serverless Postgres](https://neon.tech/)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Image Uploads**: [Cloudinary](https://cloudinary.com/) (client-side)
- **Package Manager**: pnpm

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or use npm/yarn, but pnpm is recommended)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ReWear
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values (see [Environment Variables](#environment-variables)).
4. **Run the development server:**
   ```bash
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production
```bash
pnpm build
pnpm start
```

---

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=your_neon_postgres_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

- `DATABASE_URL`: Neon Postgres connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET`: For image uploads

---

## Usage

### User Features
- **Register/Login**: Create an account or log in via the `/auth` page.
- **Browse Items**: Go to `/items` to browse, search, and filter available clothing items.
- **List an Item**: Use `/items/new` to list your own clothing item. Upload images, add details, and submit for admin approval.
- **Swap Items**: On an item page, request a swap by offering one of your own items or redeem via points.
- **Dashboard**: View your uploaded items and swap history at `/dashboard`.
- **Notifications**: Check `/notifications` for updates on swaps and other events.

### Admin Features
- **Admin Login**: Access `/admin/login` with admin credentials.
- **Approve/Reject Items**: Review pending items, approve or reject listings, and manage all items via `/admin`.

---

## Folder Structure
```
.
├── app/                # Next.js app directory (pages, API routes, layouts)
│   ├── api/            # API endpoints (auth, items, swaps, admin, etc.)
│   ├── auth/           # Auth pages
│   ├── dashboard/      # User dashboard
│   ├── items/          # Item listing, detail, and creation pages
│   ├── admin/          # Admin panel and login
│   ├── notifications/  # User notifications
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable React components
├── lib/                # Database, auth, and utility functions
├── hooks/              # Custom React hooks
├── public/             # Static assets
├── styles/             # Additional styles (if any)
├── scripts/            # Utility scripts (if any)
├── package.json        # Project metadata and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── pnpm-lock.yaml      # pnpm lockfile
```

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## License

This project is licensed under the MIT License. 