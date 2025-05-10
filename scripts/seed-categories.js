const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Hair Care',
    slug: 'hair-care',
    image: '/images/categories/hair-care.jpg'
  },
  {
    name: 'Skin Care',
    slug: 'skin-care',
    image: '/images/categories/skin-care.jpg'
  },
  {
    name: 'Fragrances',
    slug: 'fragrances',
    image: '/images/categories/fragrances.jpg'
  },
  {
    name: 'Home Care',
    slug: 'home-care',
    image: '/images/categories/home-care.jpg'
  }
];

async function seedCategories() {
  console.log('Starting to seed categories...');
  
  try {
    for (const category of categories) {
      // Check if category already exists
      const existingCategory = await prisma.category.findFirst({
        where: { slug: category.slug }
      });
      
      if (!existingCategory) {
        // Create category if it doesn't exist
        await prisma.category.create({
          data: category
        });
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }
    
    console.log('Categories seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories()
  .catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  });
