const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Product = require('./models/Product');
const { embedText } = require('./services/ai/aiService');

const sampleProducts = [
  {
    name: 'Apple iPhone 15 Pro Max (256GB - Natural Titanium)',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
    price: 134999,
    category: 'Electronics',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 28,
    reviews: [
      { name: 'Aarav Sharma', rating: 5, comment: 'Phenomenal battery life and camera zoom! Titanium feel is lightweight.', createdAt: new Date() },
      { name: 'Priya Patel', rating: 5, comment: 'Best phone display I have ever used. Highly recommended.', createdAt: new Date() }
    ]
  },
  {
    name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    description: 'Industry-leading noise canceling with two processors and 8 microphones. Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback).',
    price: 29990,
    category: 'Audio',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 45,
    reviews: [
      { name: 'Vikram Mehta', rating: 5, comment: 'The active noise cancellation is pure magic during flights and work.', createdAt: new Date() },
      { name: 'Neha Gupta', rating: 4, comment: 'Crisp audio and very comfortable ear cushions for long sessions.', createdAt: new Date() }
    ]
  },
  {
    name: 'MacBook Pro 14" M3 (16GB Unified RAM, 512GB SSD)',
    description: 'Supercharged by the M3 chip with an 8-core CPU and 10-core GPU. Liquid Retina XDR display with 1000 nits sustained brightness and up to 22 hours battery life.',
    price: 169900,
    category: 'Electronics',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 19,
    reviews: [
      { name: 'Rohan Verma', rating: 5, comment: 'Blazing fast for 4K video editing and coding. Completely silent.', createdAt: new Date() }
    ]
  },
  {
    name: 'Nike Air Max 270 React Premium Sneakers',
    description: 'Features Nike’s biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks. Breathable mesh upper with bold modern color blocking.',
    price: 11495,
    category: 'Footwear',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 34,
    reviews: [
      { name: 'Karan Joshi', rating: 5, comment: 'Extremely comfortable for all-day walking and runs. Great cushion.', createdAt: new Date() }
    ]
  },
  {
    name: 'Rolex Submariner Date Automatic Luxury Watch',
    description: 'Cerachrom ceramic bezel insert, black dial with large luminescent hour markers, and solid-link Oyster bracelet with Glidelock extension system.',
    price: 84500,
    category: 'Accessories',
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    numReviews: 12,
    reviews: [
      { name: 'Amitabh Sen', rating: 5, comment: 'Timeless elegance and superb precision craftsmanship.', createdAt: new Date() }
    ]
  },
  {
    name: 'Minimalist Premium Heavyweight Cotton Hoodie',
    description: 'Crafted from 100% French Terry 450 GSM organic cotton. Pre-shrunk with double-stitched seams and a relaxed drop-shoulder silhouette.',
    price: 2499,
    category: 'Fashion',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    numReviews: 52,
    reviews: [
      { name: 'Sneha Roy', rating: 5, comment: 'Super soft, warm, and the fabric thickness is top tier quality.', createdAt: new Date() }
    ]
  },
  {
    name: 'Bose SoundLink Revolve+ II 360 Bluetooth Speaker',
    description: 'Deep, jaw-dropping 360-degree sound with uniform coverage. Durable aluminum body with IP55 water and dust resistance, up to 17 hours battery.',
    price: 19900,
    category: 'Audio',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 23,
    reviews: [
      { name: 'Devendra K.', rating: 5, comment: 'Room-filling audio with deep punchy bass. Easy to carry anywhere.', createdAt: new Date() }
    ]
  },
  {
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    description: '8,000 DPI any-surface tracking (including glass), Quiet Click switches, and MagSpeed electromagnetic scrolling that scrolls 1,000 lines per second.',
    price: 8995,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 61,
    reviews: [
      { name: 'Siddharth M.', rating: 5, comment: 'An absolute productivity beast. The thumb scroll wheel is indispensable.', createdAt: new Date() }
    ]
  },
  {
    name: 'Ray-Ban Aviator Classic Polarized Sunglasses',
    description: 'Originally designed for US aviators in 1937. Legendary crystal green lenses with 100% UV protection and gold-tone lightweight metal frame.',
    price: 9490,
    category: 'Accessories',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 18,
    reviews: [
      { name: 'Ananya D.', rating: 5, comment: 'Classic look, crystal clear polarization reduces glare completely.', createdAt: new Date() }
    ]
  },
  {
    name: 'Adidas Ultraboost Light Running Shoes',
    description: 'The lightest Boost cushioning ever with Continental Natural Performance rubber outsole for superior grip in wet and dry conditions.',
    price: 14999,
    category: 'Footwear',
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 29,
    reviews: [
      { name: 'Mohit Rawat', rating: 5, comment: 'Incredible energy return for marathon training. Looks great casually too.', createdAt: new Date() }
    ]
  },
  {
    name: 'Ember Smart Temperature Control Mug 2 (295ml)',
    description: 'Keep your coffee or tea at your exact chosen drinking temperature (50°C - 62.5°C). 1.5-hour battery life or all day on the included charging coaster.',
    price: 12499,
    category: 'Home & Kitchen',
    stock: 9,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    numReviews: 15,
    reviews: [
      { name: 'Tanvi Shah', rating: 5, comment: 'Never drinking cold coffee again while working at my desk. Love it!', createdAt: new Date() }
    ]
  },
  {
    name: 'Fujifilm X-T5 Mirrorless Camera (Body Only)',
    description: 'Fifth-generation 40.2MP X-Trans CMOS 5 HR sensor with 7.0 stops in-body image stabilization and 6.2K/30p video recording.',
    price: 149999,
    category: 'Electronics',
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 11,
    reviews: [
      { name: 'Kabir N.', rating: 5, comment: 'Fujifilm film simulations produce straight out-of-camera JPEG perfection.', createdAt: new Date() }
    ]
  },
  {
    name: 'Royal Silk Festive Kurta Pajama Set (Maroon & Gold)',
    description: 'Exquisite festive ethnic outfit featuring pure Dupion art silk kurta with intricate gold zari embroidery around the collar, paired with a comfortable churidar.',
    price: 3499,
    category: 'Fashion',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 42,
    reviews: [
      { name: 'Sameer Khan', rating: 5, comment: 'Wore this for Diwali and wedding receptions. Got endless compliments on the rich maroon silk!', createdAt: new Date() }
    ]
  },
  {
    name: 'Festive Embroidered Silk Anarkali Gown & Dupatta Set',
    description: 'Stunning festive ethnic dress crafted in Chanderi silk with delicate mirror work, floral embroidery, and an organza dupatta for festive celebrations.',
    price: 4999,
    category: 'Fashion',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 36,
    reviews: [
      { name: 'Pooja Sharma', rating: 5, comment: 'Gorgeous festive outfit with premium stitching and elegant drape.', createdAt: new Date() }
    ]
  },
  {
    name: 'Jacquard Woven Festive Nehru Jacket (Royal Navy)',
    description: 'Traditional mandarin collar festive waistcoat with woven floral motifs and brass buttons. Perfect pairing over kurtas and shirts.',
    price: 2199,
    category: 'Fashion',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 24,
    reviews: [
      { name: 'Rahul V.', rating: 5, comment: 'Sharp festive styling and high quality fabric texture.', createdAt: new Date() }
    ]
  },
  {
    name: 'Handcrafted Ethnic Mojari Leather Jutti',
    description: 'Traditional handcrafted festive footwear made with genuine leather, cushioned memory insole, and subtle gold thread embroidery.',
    price: 1899,
    category: 'Footwear',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    numReviews: 19,
    reviews: [
      { name: 'Aditya G.', rating: 5, comment: 'Very comfortable ethnic jutti, doesn’t bite at all. Perfect match for festive outfits.', createdAt: new Date() }
    ]
  }
];

const seedData = async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  for (const item of sampleProducts) {
    let embedding = [];
    try {
      embedding = await embedText(`${item.name} ${item.description} ${item.category}`);
    } catch {
      embedding = [];
    }
    const reviewsWithUser = (item.reviews || []).map(r => ({
      ...r,
      user: dummyUserId
    }));

    await Product.create({
      ...item,
      reviews: reviewsWithUser,
      embedding
    });
    console.log(`Seeded: ${item.name} (${item.category})`);
  }
  console.log('\n✅ Successfully seeded demo products with images and AI vector embeddings!');
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cartify-mern';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear old products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    await seedData();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedData, sampleProducts };
