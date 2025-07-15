# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js Express application that demonstrates HubSpot OAuth 2.0 integration. It allows users to authenticate with HubSpot and retrieve contacts from their CRM.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
- `npm run check` - Run Biome linter and formatter checks
- `npm run check:write` - Run Biome linter and formatter with fixes applied

## Architecture

### Core Components

- **src/index.js** - Main Express application with OAuth flow and contact retrieval
- **src/config.js** - Environment configuration loader (dotenv)
- **src/views/** - Pug templates for UI (login, contacts, error pages)
- **src/public/** - Static assets (CSS, JS, favicon)

### OAuth Flow

The application implements the standard OAuth 2.0 authorization code flow:

1. User visits `/` → redirected to `/login` if not authenticated
2. User clicks "Connect to HubSpot" → redirected to `/oauth`
3. `/oauth` generates HubSpot authorization URL and redirects user
4. HubSpot redirects back to `/oauth-callback` with authorization code
5. Application exchanges code for access/refresh tokens
6. Tokens stored in memory (`tokenStore` object)
7. User redirected to `/` to view contacts

### Token Management

- Tokens stored in-memory (not persistent across restarts)
- Automatic token refresh when expired using refresh token
- `isAuthorized()` and `isTokenExpired()` helper functions

### API Integration

- Uses `@hubspot/api-client` for HubSpot API calls
- Contacts API: `/crm/v3/objects/contacts` endpoint
- Retrieves first 30 contacts with firstname, lastname, company properties

## Environment Variables

Required in `.env` file:
- `HUBSPOT_CLIENT_ID` - HubSpot app client ID
- `HUBSPOT_CLIENT_SECRET` - HubSpot app client secret

## Key Files

- **src/index.js:115-140** - Main contacts retrieval logic
- **src/index.js:142-154** - OAuth authorization URL generation
- **src/index.js:156-179** - OAuth callback token exchange
- **src/index.js:62-76** - Token refresh logic