# Anoing Backend

The TypeScript API and real-time gateway for the [Anoing Minecraft community platform](https://github.com/MohamedSamirMoussa/anioying_app). It powers authentication, player leaderboards, server status, blogs, donations, notifications, editable page content, and administrative workflows.

## Features

- Email registration, OTP confirmation, login, refresh, and logout
- Password recovery
- Google and Discord authentication
- Role-based authorization and user blocking
- Secure cookie-based token flows
- Minecraft leaderboard retrieval and search
- Scheduled leaderboard updates
- RCON and server-status integrations
- Real-time server and notification events with Socket.IO
- Blog CRUD operations
- Editable dashboard page content
- PayPal and Stripe payment integrations
- Cloudinary media uploads
- Rate limiting, Helmet, CORS, and centralized error handling
- Repository-based MongoDB data access

## Tech Stack

- Node.js and Express 5
- TypeScript
- MongoDB and Mongoose
- Socket.IO
- Zod
- JSON Web Tokens and bcrypt
- Cloudinary and Multer
- Nodemailer
- RCON Client
- PayPal and Stripe
- Helmet and Express Rate Limit

## API Overview

| Base path | Responsibility |
| --- | --- |
| /api/v1/auth | Authentication and user administration |
| /api/v1/leaderboard | Player leaderboard and search |
| /api/v1/blog | Blog management |
| /api/v1/checkout | Donation and payment flows |
| /api/v1/dashboard | Editable page content |
| /api/v1/notification | User notifications |
| /health | Health check |

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB
- Accounts or credentials for the integrations you enable

### Installation

~~~bash
git clone https://github.com/MohamedSamirMoussa/BE.git
cd BE
npm install
~~~

For local development, create config/.env.development.

### Core Configuration

~~~env
NODE_ENV=development
PORT=5000
APP_NAME=Anoing
FE_URL=http://localhost:3000
DB_HOST=
ACCESS_USER_TOKEN_SIGNATURE=
ACCESS_TOKEN_TIME_OUT=
REFRESH_TOKEN_TIME_OUT=
SECRET_KEY=
SALT=
~~~

### Optional Integrations

~~~env
APP_EMAIL=
APP_PASS=
CLOUD_NAME=
API_KEY=
API_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_ID_CLIENT=
DISCORD_AUTH_URL=
DISCORD_CLIENT_ID=
DISCORD_SECRET_ID=
DISCORD_REDIRECT_URI=
DISCORD_URL_REDIRECT=
REDIRECT_URL=

PAYPAL_BASE_URL=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET_ID=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_CLIENT_URL=

PTERO_URL=
PTERO_API_KEY=
RCON_HOST=
RCON_PASS=
RCON_TIMEOUT=
RCON_PORT_4=
RCON_PORT_5=
RCON_PORT_6=
RCON_PORT_ALL_THE_MOON=
RCON_PORT_ATM=
RCON_PORT_SB4=

LEADERBOARD_UPDATE_INTERVAL=
NEXT_PHASE=
~~~

Run the API directly with ts-node:

~~~bash
npm run dev
~~~

Or run the TypeScript compiler and Node watcher together:

~~~bash
npm run start:dev
~~~

## Available Scripts

~~~bash
npm run dev
npm run start:dev
npm run type-check
npm run build
npm run start
npm run rebuild
~~~

## Security

Do not commit environment files or real service credentials. Configure CORS for the deployed front end, use strong signing keys, and rotate any credential that has previously been exposed.

## Author

[Mohamed Samir Moussa](https://github.com/MohamedSamirMoussa)
