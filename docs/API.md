
# API Documentation

## Authentication

### POST /api/auth/login
Login with username and password

### POST /api/auth/register
Register new user

### POST /api/auth/logout
Logout current user

## Portfolio

### GET /api/portfolio
Get user's portfolio

### POST /api/portfolio/asset
Add new asset to portfolio

### PUT /api/portfolio/asset/:id
Update portfolio asset

## Wallets

### GET /api/wallets
Get user's wallets

### POST /api/wallets
Create new wallet

### PUT /api/wallets/:id
Update wallet

## AI Insights

### GET /api/insights
Get AI-generated insights

### POST /api/insights/generate
Generate new insight

## Social Trading

### GET /api/social/traders
Get list of traders

### POST /api/social/follow/:id
Follow a trader

## Education

### GET /api/education/content
Get educational content

### GET /api/education/tutorials
Get tutorials list
