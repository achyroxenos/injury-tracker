# 🏥 Injury Tracker

A production-ready Next.js application for tracking and managing injuries with AI-powered analysis, cloud storage, and database persistence.

## ✨ Features

- **AI-Powered Analysis**: Gemini AI provides intelligent injury assessment and healing insights
- **Cloud Image Storage**: UploadThing integration for unlimited photo storage
- **Database Persistence**: Supabase backend for cross-device synchronization
- **Smart Notifications**: Browser notifications for daily logging reminders
- **3D Body Map**: Interactive body visualization for injury location tracking
- **Medical Reports**: Export detailed medical reports for healthcare providers
- **Supply Management**: Track medical supplies and first aid inventory
- **Healing Timeline**: Visual progress tracking and comparison views

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Configure your API keys in `.env.local`:
   - **Gemini API**: Get a free key at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - **UploadThing**: Create account at [https://uploadthing.com](https://uploadthing.com)
   - **Supabase**: Create project at [https://supabase.com](https://supabase.com)

5. Set up Supabase database:
   - Run the SQL from `supabase_setup.sql` in your Supabase SQL Editor

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Required environment variables (see `.env.local.example`):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
UPLOADTHING_SECRET=your_uploadthing_secret_here
UPLOADTHING_APP_ID=your_uploadthing_app_id_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with CSS Variables
- **AI**: Google Gemini API
- **Storage**: UploadThing
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── chat/              # AI chat interface
│   ├── dashboard/         # Dashboard widgets
│   ├── gallery/           # Image gallery
│   ├── injury/            # Injury logging components
│   ├── layout/            # Layout components
│   ├── notifications/     # Notification system
│   ├── report/            # Medical reports
│   ├── supplies/          # Supply management
│   └── tools/             # Utility tools
├── context/               # React context providers
└── lib/                   # Utility libraries
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically build and deploy on every push to main.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using Next.js and Google Gemini AI
