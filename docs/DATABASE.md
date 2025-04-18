# Database Schema

## Tables

### users
- id: serial primary key
- username: text (unique)
- password: text
- email: text (unique)
- firstName: text
- lastName: text
- role: text
- subscriptionTier: text
- createdAt: timestamp

### portfolioAssets
- id: serial primary key
- userId: integer
- symbol: text
- name: text
- type: text
- quantity: decimal
- purchasePrice: decimal
- currentPrice: decimal
- value: decimal
- changePercent: decimal
- icon: text
- createdAt: timestamp

### aiInsights
- id: serial primary key
- userId: integer
- type: text
- title: text
- content: text
- icon: text
- status: text
- createdAt: timestamp

### tradeJournals
- id: serial primary key
- userId: integer
- symbol: text
- type: text (buy/sell)
- quantity: decimal
- price: decimal
- date: timestamp
- notes: text
- pnl: decimal
- createdAt: timestamp

### marketAlerts
- id: serial primary key
- userId: integer
- symbol: text
- type: text
- condition: text
- value: decimal
- status: text
- createdAt: timestamp

### portfolioRebalancing
- id: serial primary key
- userId: integer
- symbol: text
- currentAllocation: decimal
- targetAllocation: decimal
- lastRebalanced: timestamp
- createdAt: timestamp

### educationalContent
- id: serial primary key
- title: text
- description: text
- category: text
- difficulty: text
- duration: text
- instructor: text
- imageUrl: text
- videoUrl: text
- rating: decimal
- accessTier: text
- createdAt: timestamp

### subscriptionPlans
- id: serial primary key
- name: text
- price: text
- description: text
- features: jsonb
- isPopular: boolean