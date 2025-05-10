const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testProducts = [
  // Hair Care products
  {
    name: 'Nourishing Shampoo',
    originalPrice: 29.99,
    discountPercentage: 33
  },
  {
    name: 'Hydrating Conditioner',
    originalPrice: 24.99,
    discountPercentage: 24
  },
  
  // Skin Care products
  {
    name: 'Facial Cleanser',
    originalPrice: 39.99,
    discountPercentage: 38
  },
  {
    name: 'Moisturizing Cream',
    originalPrice: 49.99,
    discountPercentage: 40
  },
  
  // Fragrances
  {
    name: 'Citrus Burst Perfume',
    originalPrice: 79.99,
    discountPercentage: 38
  },
  {
    name: 'Floral Elegance',
    originalPrice: 89.99,
    discountPercentage: 33
  },
  
  // Home Care products
  {
    name: 'Lavender Room Spray',
    originalPrice: 24.99,
    discountPercentage: 40
  },
  {
    name: 'Linen Freshener',
    originalPrice: 19.99,
    discountPercentage: 35
  }
];

async function updateTestProducts() {
  console.log('Starting to update test products...');
  
  try {
    for (const product of testProducts) {
      // Find product by name
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (existingProduct) {
        // Update product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            originalPrice: product.originalPrice,
            discountPercentage: product.discountPercentage
          }
        });
        console.log(`Updated product: ${product.name}`);
      } else {
        console.log(`Product not found: ${product.name}`);
      }
    }
    
    console.log('Test products update completed successfully!');
  } catch (error) {
    console.error('Error updating test products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTestProducts()
  .catch((error) => {
    console.error('Error running update script:', error);
    process.exit(1);
  });
