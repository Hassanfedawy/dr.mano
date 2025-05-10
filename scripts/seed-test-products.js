const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testProducts = [
  // Hair Care products
  {
    name: 'Nourishing Shampoo',
    mainDescription: 'A gentle, nourishing shampoo for all hair types',
    subDescription: 'Enriched with natural oils and vitamins to strengthen and protect your hair',
    price: 19.99,
    originalPrice: 29.99,
    discountPercentage: 33,
    stock: 100,
    images: '/Images/placeholder.jpg',
    category: 'hair-care'
  },
  {
    name: 'Hydrating Conditioner',
    mainDescription: 'Deep hydration for dry and damaged hair',
    subDescription: 'Restores moisture and shine to your hair with our special formula',
    price: 18.99,
    originalPrice: 24.99,
    discountPercentage: 24,
    stock: 100,
    images: '/Images/placeholder.jpg',
    category: 'hair-care'
  },

  // Skin Care products
  {
    name: 'Facial Cleanser',
    mainDescription: 'Gentle facial cleanser for all skin types',
    subDescription: 'Removes impurities without stripping your skin of natural oils',
    price: 24.99,
    originalPrice: 39.99,
    discountPercentage: 38,
    stock: 100,
    images: '/Images/placeholder.jpg',
    category: 'skin-care'
  },
  {
    name: 'Moisturizing Cream',
    mainDescription: 'Rich moisturizing cream for dry skin',
    subDescription: 'Provides long-lasting hydration and protection',
    price: 29.99,
    stock: 100,
    images: '/Images/placeholder.jpg',
    category: 'skin-care'
  },

  // Fragrances
  {
    name: 'Citrus Burst Perfume',
    mainDescription: 'Fresh and invigorating citrus scent',
    subDescription: 'A blend of lemon, orange, and grapefruit for a refreshing experience',
    price: 49.99,
    stock: 50,
    images: '/Images/placeholder.jpg',
    category: 'fragrances'
  },
  {
    name: 'Floral Elegance',
    mainDescription: 'Elegant floral fragrance for women',
    subDescription: 'A sophisticated blend of rose, jasmine, and lily of the valley',
    price: 59.99,
    stock: 50,
    images: '/Images/placeholder.jpg',
    category: 'fragrances'
  },

  // Home Care products
  {
    name: 'Lavender Room Spray',
    mainDescription: 'Calming lavender room spray',
    subDescription: 'Creates a relaxing atmosphere in any room',
    price: 14.99,
    stock: 75,
    images: '/Images/placeholder.jpg',
    category: 'home-care'
  },
  {
    name: 'Linen Freshener',
    mainDescription: 'Fresh linen scent for your home',
    subDescription: 'Keeps your linens smelling fresh and clean',
    price: 12.99,
    stock: 75,
    images: '/Images/placeholder.jpg',
    category: 'home-care'
  }
];

async function seedTestProducts() {
  console.log('Starting to seed test products...');

  try {
    for (const product of testProducts) {
      // Find category
      const category = await prisma.category.findFirst({
        where: { slug: product.category }
      });

      if (!category) {
        console.log(`Category not found: ${product.category}. Skipping product: ${product.name}`);
        continue;
      }

      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });

      if (!existingProduct) {
        // Create product
        await prisma.product.create({
          data: {
            name: product.name,
            mainDescription: product.mainDescription,
            subDescription: product.subDescription,
            price: product.price,
            originalPrice: product.originalPrice,
            discountPercentage: product.discountPercentage,
            stock: product.stock,
            images: product.images,
            categoryId: category.id
          }
        });
        console.log(`Created product: ${product.name} in category: ${product.category}`);
      } else {
        console.log(`Product already exists: ${product.name}`);
      }
    }

    console.log('Test products seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding test products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestProducts()
  .catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  });
