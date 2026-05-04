const mongoose = require('mongoose');

const { Schema } = mongoose;

// Minimal schemas for seeding
const CategorySchema = new Schema({
  name: String,
  sortOrder: Number,
  image: String,
  parentId: Schema.Types.ObjectId
});

const ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  categoryId: Schema.Types.ObjectId,
  image: String,
  isVeg: Boolean,
  isFeatured: Boolean,
  isBestseller: Boolean,
  isChefSpecial: Boolean,
  variants: [{ label: String, price: Number }]
});

const OfferSchema = new Schema({
  title: String,
  description: String,
  discountType: String,
  discountValue: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  badge: String,
  isActive: Boolean,
  isAutoApply: Boolean
});

const ReservationSchema = new Schema({
  fullName: String,
  phone: String,
  reservationDate: String,
  reservationTime: String,
  guests: Number,
  notes: String,
  status: { type: String, default: 'pending' }
}, { timestamps: true });

const ReviewSchema = new Schema({
  customerName: String,
  rating: Number,
  comment: String,
  approved: Boolean
}, { timestamps: true });

const OrderSchema = new Schema({
  orderNumber: String,
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  items: Array,
  totalAmount: Number,
  status: String
}, { timestamps: true });

const SiteSettingsSchema = new Schema({
  restaurantName: String,
  restaurantPhone: String,
  restaurantAddress: String,
  restaurantInstruction: String,
  paymentQrImage: String
});

const NavbarSettingsSchema = new Schema({
  brand: String,
  tagline: String,
  logoUrl: String,
  phone: String
});

// Models
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
const NavbarSettings = mongoose.models.NavbarSettings || mongoose.model('NavbarSettings', NavbarSettingsSchema);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  // Clear existing data (optional, but good for a fresh start)
  console.log('Clearing old data...');
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Offer.deleteMany({}),
    Reservation.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    SiteSettings.deleteMany({}),
    NavbarSettings.deleteMany({})
  ]);

  // 1. Categories
  console.log('Seeding Categories...');
  const catDocs = await Category.insertMany([
    { name: 'Pizza', sortOrder: 1, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
    { name: 'Burgers', sortOrder: 2, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { name: 'Sides', sortOrder: 3, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400' },
    { name: 'Drinks', sortOrder: 4, image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?w=400' },
    { name: 'Desserts', sortOrder: 5, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400' }
  ]);

  // 2. Products
  console.log('Seeding Products...');
  await Product.insertMany([
    {
      name: 'Margherita Royale',
      description: 'Classic mozzarella, basil, and royal tomato sauce',
      price: 299,
      category: 'Pizza',
      categoryId: catDocs[0]._id,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800',
      isVeg: true,
      isFeatured: true,
      isBestseller: true,
      variants: [{ label: 'Regular', price: 299 }, { label: 'Medium', price: 499 }, { label: 'Large', price: 699 }]
    },
    {
      name: 'Paneer Tikka Pizza',
      description: 'Marinated cottage cheese with bell peppers',
      price: 349,
      category: 'Pizza',
      categoryId: catDocs[0]._id,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      isVeg: true,
      isChefSpecial: true
    },
    {
      name: 'Classic Veg Burger',
      description: 'Crispy patty with fresh lettuce and house sauce',
      price: 149,
      category: 'Burgers',
      categoryId: catDocs[1]._id,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
      isVeg: true,
      isBestseller: true
    },
    {
      name: 'Peri Peri Fries',
      description: 'Golden fries tossed in spicy peri peri mix',
      price: 129,
      category: 'Sides',
      categoryId: catDocs[2]._id,
      image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800',
      isVeg: true
    }
  ]);

  // 3. Offers
  console.log('Seeding Offers...');
  await Offer.insertMany([
    {
      title: 'Welcome 50',
      description: 'Get 50% off on your first royal order',
      discountType: 'percentage',
      discountValue: 50,
      minOrderValue: 200,
      maxDiscount: 150,
      badge: 'HOT',
      isActive: true,
      isAutoApply: false
    },
    {
      title: 'Free Delivery',
      description: 'Zero delivery fee on orders above 500',
      discountType: 'fixed',
      discountValue: 0,
      minOrderValue: 500,
      badge: 'FAST',
      isActive: true,
      isAutoApply: true
    }
  ]);

  // 4. Reservations
  console.log('Seeding Reservations...');
  await Reservation.insertMany([
    {
      fullName: 'John Doe',
      phone: '9876543210',
      reservationDate: '2026-05-10',
      reservationTime: '19:30',
      guests: 4,
      notes: 'Window seat preferred',
      status: 'confirmed'
    },
    {
      fullName: 'Jane Smith',
      phone: '9988776655',
      reservationDate: '2026-05-12',
      reservationTime: '20:00',
      guests: 2,
      status: 'pending'
    }
  ]);

  // 5. Reviews
  console.log('Seeding Reviews...');
  await Review.insertMany([
    { customerName: 'Alice', rating: 5, comment: 'The best pizza I have ever had! The ambience is amazing.', approved: true },
    { customerName: 'Bob', rating: 4, comment: 'Great service and taste. Highly recommended.', approved: true },
    { customerName: 'Charlie', rating: 3, comment: 'It was okay, but the wait time was long.', approved: false }
  ]);

  // 6. Orders
  console.log('Seeding Orders...');
  await Order.insertMany([
    {
      orderNumber: 'AD1001',
      customerName: 'Customer One',
      customerPhone: '9000000001',
      customerAddress: '123 Royal Lane, Palace City',
      items: [{ productId: catDocs[0]._id, name: 'Margherita Royale', quantity: 1, price: 299 }],
      totalAmount: 314,
      status: 'pending'
    },
    {
      orderNumber: 'AD1002',
      customerName: 'Customer Two',
      customerPhone: '9000000002',
      customerAddress: '456 Queen Road, Kingdom',
      items: [{ productId: catDocs[1]._id, name: 'Classic Veg Burger', quantity: 2, price: 149 }],
      totalAmount: 298,
      status: 'accepted'
    }
  ]);

  // 7. Site Settings
  console.log('Seeding Site Settings...');
  await SiteSettings.create({
    restaurantName: 'The Royal Platter',
    restaurantPhone: '+91 98765 43210',
    restaurantAddress: 'Ad Pizza Hub, Main Road, New Delhi',
    restaurantInstruction: 'Please follow the map to reach the basement parking.',
    paymentQrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example'
  });

  // 8. Navbar Settings
  console.log('Seeding Navbar Settings...');
  await NavbarSettings.create({
    brand: 'The Royal Platter',
    tagline: 'Authentic Pure Veg Delicacies',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png',
    phone: '9876543210'
  });

  console.log('All data seeded successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
