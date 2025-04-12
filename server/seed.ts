
import { db } from './db';
import { subscriptionPlans, users, educationalContent } from '@shared/schema';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    // Seed subscription plans
    await db.insert(subscriptionPlans).values([
      {
        name: 'Basic',
        price: 'Free',
        description: 'Get started with basic trading features',
        features: JSON.stringify(['Portfolio tracking', 'Basic market data', 'Community access']),
        isPopular: false
      },
      {
        name: 'Pro',
        price: '$29/month',
        description: 'Advanced features for serious traders',
        features: JSON.stringify(['All Basic features', 'AI insights', 'Advanced analytics', 'Priority support']),
        isPopular: true
      },
      {
        name: 'Enterprise',
        price: '$99/month',
        description: 'Full suite of professional trading tools',
        features: JSON.stringify(['All Pro features', 'Custom insights', 'API access', 'Dedicated support']),
        isPopular: false
      }
    ]);

    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@profitwise.ai',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      subscriptionTier: 'enterprise'
    });

    // Seed educational content
    await db.insert(educationalContent).values([
      {
        title: 'Getting Started with Trading',
        description: 'Learn the basics of trading and market analysis',
        category: 'Basics',
        difficulty: 'Beginner',
        duration: '30 minutes',
        instructor: 'Jane Smith',
        imageUrl: '/images/courses/trading-basics.jpg',
        accessTier: 'basic'
      },
      {
        title: 'Advanced Technical Analysis',
        description: 'Master technical indicators and chart patterns',
        category: 'Technical Analysis',
        difficulty: 'Advanced',
        duration: '2 hours',
        instructor: 'John Doe',
        imageUrl: '/images/courses/technical-analysis.jpg',
        videoUrl: 'https://example.com/videos/ta-course',
        accessTier: 'pro'
      }
    ]);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
