# Getting Started Guide

This guide will help you set up the Archive Oracle project on your local machine and get started with development.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (version 20.3.1 or higher)
   - **What it is**: Node.js is a JavaScript runtime that allows you to run JavaScript on your computer outside of a web browser
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - **What it is**: npm (Node Package Manager) is a tool for installing and managing JavaScript packages
   - Verify installation: `npm --version`

3. **Git**
   - **What it is**: Git is a version control system that tracks changes to your code
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Recommended Tools

- **Code Editor**: Visual Studio Code, WebStorm, or your preferred editor
- **Git Client**: GitHub Desktop, SourceTree, or command-line Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/archive-oracle.git
cd archive-oracle
```

### 2. Install Dependencies

```bash
npm install
```

This command installs all the project dependencies listed in `package.json`, including:
- **Next.js** (React framework for building web applications)
- **React** (JavaScript library for building user interfaces)
- **TypeScript** (typed JavaScript that helps catch errors before runtime)
- **Supabase** (backend-as-a-service platform for database and authentication)
- And other required packages

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SERVER_API_KEY=your_server_api_key
DISCORD_BOT_TOKEN=your_discord_bot_token
```

**Where to get these values:**
- **Supabase URL and Anon Key**: From your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
- **Server API Key**: Contact the project maintainer
- **Discord Bot Token**: From [Discord Developer Portal](https://discord.com/developers/applications)

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

### 5. Verify Installation

- The development server should start without errors
- You should see the application homepage at `http://localhost:3000`
- Check the browser console for any errors

## Next Steps

- Read the [Directory Structure Guide](./directory-structure.md) to understand the project organization
- Review the [API Documentation](../api/) to understand available endpoints:
  - [Get Approved Names API](../api/getApprovedNames.md)
  - [Upsert Meeting Summary API](../api/upsertMeetingSummary.md)
- Check out [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines
- Explore the [Architecture Documentation](../architecture/) for system design details

## Common Issues

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Module Not Found Errors

Try deleting `node_modules` and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variable Issues

Ensure your `.env.local` file is in the project root and contains all required variables. Restart the development server after adding new environment variables.

## Getting Help

- Check the [README.md](../../README.md) for project overview
- Review [Architecture Documentation](../architecture/) for system design
- Open an issue on GitHub for bugs or questions
- Contact the project maintainers for access to required API keys
