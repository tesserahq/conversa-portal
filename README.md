<p align="center">
  <img width="200px" src="./public/images/logo.png">
  
  <h2 align="center">Conversa Portal</h2>
  <p align="center">
    The conversational interface service for the Tessera platform
  </p>
</p>

---

## Why "Convesa"?

**Conversa** is the conversational interface service for the Tessera platform.

It acts as a channel adapter and orchestration layer that enables users to interact with Tessera resources through conversational platforms (Telegram initially, later WhatsApp, web chat, voice, etc.), while keeping Tessera API- and MCP-centric.

Conversa does not own business data and does not implement domain logic.
All reasoning and data access are delegated to Tessera via APIs and MCP.

## Getting Started

### Prerequisites

- **Node.js**: Version 22.21.1
- **Package Manager**: bun 1.3.5

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd conversa-portal
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Auth0 Configuration
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_AUDIENCE=your_auth0_audience
   AUTH0_ORGANIZATION_ID=your_auth0_organization_id

   # Application Configuration
   HOST_URL=http://localhost:3000
   NODE_ENV=development
   API_URL=https://api.example.com
   IDENTIES_API_URL=https://example.com/api
   IDENTIES_HOST=https://example.com/api
   ```

3. **Run the development server**

   ```bash
   bun install
   ```

   ```bash
   bun run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Run with docker

1. Build the image

   ```bash
   docker build -t conversa-portal .
   ```

2. Run the container

   ```bash
   docker run -p 3000:3000 conversa-portal:latest
   ```

### Production Build

1. **Build the application**

   ```bash
   bun run build
   ```

2. **Start the production server**
   ```bash
   bun run start
   ```

### Available Scripts

- `dev` - Start the development server
- `build` - Build the application for production
- `start` - Start the production server
- `lint` - Run ESLint for code linting
- `typecheck` - Run TypeScript type checking
- `format` - Format code with Prettier

### Development Notes

- The application uses Vite for fast development builds and hot module replacement
- TypeScript is configured for strict type checking
- ESLint and Prettier are configured for consistent code formatting
- The app includes internationalization support with i18next
- Authentication is handled through Auth0 integration
