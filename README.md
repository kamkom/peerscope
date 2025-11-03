# Peerscope

[![Project Status: MVP Development](https://img.shields.io/badge/status-in%20progress-yellow.svg)](https://github.com/your-username/peerscope)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An innovative web application designed to help users gain a deeper, more objective understanding of their interpersonal relationships through AI-powered analysis.

## Table of Contents

- [Peerscope](#peerscope)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
  - [Tech Stack](#tech-stack)
  - [Getting Started Locally](#getting-started-locally)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Available Scripts](#available-scripts)
  - [Project Scope](#project-scope)
    - [Key Features (MVP)](#key-features-mvp)
    - [Out of Scope (for now)](#out-of-scope-for-now)
  - [Project Status](#project-status)
  - [License](#license)

## Project Description

Peerscope is a tool for anyone looking to improve their understanding of social interactions. At its core, the application allows you to create detailed profiles for friends, family, and colleagues. You can then log and analyze real or hypothetical interactions (called "Events") with them.

The key feature is an AI analysis module that provides different perspectives on these events, helping you to better understand the motivations and viewpoints of others. This can aid in resolving conflicts, making more informed decisions in relationships, and building stronger connections. The app also includes features like AI-powered gift suggestions based on a person's profile.

The primary problem Peerscope aims to solve is the inherent subjectivity of relationship analysis. By offering a structured platform for reflection and AI-driven insights, it empowers users to cultivate empathy and enhance their communication skills.

## Tech Stack

The project is built with a modern, robust, and scalable tech stack:

| Category     | Technology/Service                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | [Astro](https://astro.build/) 5, [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/) 5, [Tailwind CSS](https://tailwindcss.com/) 4, [Shadcn/ui](https://ui.shadcn.com/) |
| **Backend**  | [Supabase](https://supabase.com/) (PostgreSQL, Authentication, BaaS)                                                                                                                              |
| **AI**       | [OpenRouter.ai](https://openrouter.ai/) (API for various language models)                                                                                                                         |
| **Testing**  | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Playwright](https://playwright.dev/)                                      |
| **DevOps**   | [GitHub Actions](https://github.com/features/actions) for CI/CD, [DigitalOcean](https://www.digitalocean.com/) for hosting                                                                        |

## Getting Started Locally

To set up and run the project on your local machine, follow these steps.

### Prerequisites

- **Node.js**: Version `22.14.0`. We recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm).
- **Package Manager**: [npm](https://www.npmjs.com/) (comes with Node.js).
- **Supabase Account**: You will need a Supabase project to connect to the database and authentication.
- **OpenRouter API Key**: An API key from OpenRouter.ai is required for the AI features.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/peerscope.git
    cd peerscope
    ```

2.  **Set up the Node.js version:**
    If you are using `nvm`, run this command in the project root:

    ```bash
    nvm use
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Now, fill in the `.env` file with your credentials from Supabase and OpenRouter:

    ```env
    # Supabase
    PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

    # OpenRouter AI
    OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on [http://localhost:4321](http://localhost:4321).

## Available Scripts

The following scripts are available in the `package.json`:

- `npm run dev`: Starts the Astro development server with hot-reloading.
- `npm run build`: Builds the application for production.
- `npm run preview`: Starts a local server to preview the production build.
- `npm run lint`: Lints the codebase using ESLint to find and report issues.
- `npm run lint:fix`: Lints the codebase and automatically fixes fixable issues.
- `npm run format`: Formats all project files using Prettier.

## Project Scope

This project is currently focused on delivering a Minimum Viable Product (MVP) with the core functionalities.

### Key Features (MVP)

- **User Authentication**: Secure registration and login via email and password.
- **Character Management**: Create, view, edit, and soft-delete profiles for yourself and others.
- **Event Management**: Log past or hypothetical interactions with multiple participants.
- **AI-Powered Analysis**:
  - "Mediation" analysis to see an event from multiple perspectives.
  - "Gift Suggestion" analysis based on a character's profile.
- **Daily Usage Limits**: A daily cap on AI analyses to manage costs.
- **User-Friendly Interface**: A clean dashboard and clear calls-to-action for a smooth onboarding experience.

### Out of Scope (for now)

- Native mobile applications (iOS/Android).
- Integrations with external platforms (e.g., social media, calendars).
- Advanced UI/UX personalization features.
- Community or social features like sharing profiles or events.
- Complex user roles and permissions systems.

## Project Status

**Status:** In active development.

The project is currently focused on building out the MVP. Core features like user authentication, character management, and event creation are implemented. The immediate focus is on refining the AI analysis module, improving the user interface, and ensuring robust error handling throughout the application.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
