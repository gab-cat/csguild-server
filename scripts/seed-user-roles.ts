/* eslint-disable max-len */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const userRoles = [
  // Development Roles
  {
    name: 'Frontend Developer',
    slug: 'frontend-developer',
    description:
      'Responsible for developing user interfaces and user experiences using modern frontend technologies like React, Vue, or Angular.',
  },
  {
    name: 'Backend Developer',
    slug: 'backend-developer',
    description:
      'Develops server-side logic, APIs, and database integrations using technologies like Node.js, Python, Java, or .NET.',
  },
  {
    name: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description:
      'Works on both frontend and backend development, capable of handling end-to-end application development.',
  },
  {
    name: 'Mobile Developer',
    slug: 'mobile-developer',
    description:
      'Specializes in developing mobile applications for iOS and Android using native or cross-platform technologies.',
  },
  {
    name: 'DevOps Engineer',
    slug: 'devops-engineer',
    description:
      'Manages deployment pipelines, infrastructure, cloud services, and ensures smooth CI/CD processes.',
  },

  // Design & UX Roles
  {
    name: 'UI/UX Designer',
    slug: 'ui-ux-designer',
    description:
      'Creates user interface designs and user experience flows, ensuring applications are intuitive and visually appealing.',
  },
  {
    name: 'Graphic Designer',
    slug: 'graphic-designer',
    description:
      'Creates visual content, logos, illustrations, and branding materials for digital and print media.',
  },

  // Data & Analytics Roles
  {
    name: 'Data Scientist',
    slug: 'data-scientist',
    description:
      'Analyzes complex data to extract insights, builds predictive models, and creates data-driven solutions.',
  },
  {
    name: 'Data Analyst',
    slug: 'data-analyst',
    description:
      'Processes and analyzes data to create reports, dashboards, and business intelligence insights.',
  },
  {
    name: 'Machine Learning Engineer',
    slug: 'machine-learning-engineer',
    description:
      'Develops and deploys machine learning models and AI solutions for various applications.',
  },

  // Management & Leadership Roles
  {
    name: 'Project Manager',
    slug: 'project-manager',
    description:
      'Coordinates project activities, manages timelines, resources, and ensures project goals are met.',
  },
  {
    name: 'Tech Lead',
    slug: 'tech-lead',
    description:
      'Provides technical leadership, makes architectural decisions, and mentors development team members.',
  },
  {
    name: 'Product Manager',
    slug: 'product-manager',
    description:
      'Defines product strategy, manages feature requirements, and coordinates between stakeholders and development teams.',
  },

  // Quality & Security Roles
  {
    name: 'QA Tester',
    slug: 'qa-tester',
    description:
      'Tests applications for bugs, ensures quality standards, and validates functionality across different scenarios.',
  },
  {
    name: 'Security Analyst',
    slug: 'security-analyst',
    description:
      'Identifies security vulnerabilities, implements security measures, and ensures applications meet security standards.',
  },

  // Content & Marketing Roles
  {
    name: 'Content Writer',
    slug: 'content-writer',
    description:
      'Creates written content for applications, documentation, marketing materials, and user guides.',
  },
  {
    name: 'Marketing Specialist',
    slug: 'marketing-specialist',
    description:
      'Develops marketing strategies, manages social media presence, and promotes products or services.',
  },

  // Research & Documentation Roles
  {
    name: 'Research Analyst',
    slug: 'research-analyst',
    description:
      'Conducts market research, competitive analysis, and user research to inform product decisions.',
  },
  {
    name: 'Technical Writer',
    slug: 'technical-writer',
    description:
      'Creates technical documentation, API documentation, and user manuals for software applications.',
  },

  // Specialized Roles
  {
    name: 'Business Analyst',
    slug: 'business-analyst',
    description:
      'Analyzes business requirements, processes, and translates them into technical specifications.',
  },
  {
    name: 'System Administrator',
    slug: 'system-administrator',
    description:
      'Manages servers, networks, and IT infrastructure to ensure system reliability and performance.',
  },
];

async function seedUserRoles() {
  console.log('🌱 Seeding user roles...');

  try {
    // Create roles using createMany for better performance
    const result = await prisma.userRole.createMany({
      data: userRoles,
      skipDuplicates: true, // Skip if slug already exists
    });

    console.log(`✅ Successfully seeded ${result.count} user roles`);

    // Display created roles
    const createdRoles = await prisma.userRole.findMany({
      orderBy: { name: 'asc' },
    });

    console.log('\n📋 Available User Roles:');
    createdRoles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} (${role.slug})`);
    });
  } catch (error) {
    console.error('❌ Error seeding user roles:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedUserRoles();
    console.log('\n🎉 User roles seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  main();
}

export { seedUserRoles, userRoles };
