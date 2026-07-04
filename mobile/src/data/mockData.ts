// src/data/mockData.ts
// Mock data for BazaarBasket UI development
// Matches the reference React web design

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface MockCategory {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind bg class
  image: string;
  subcategories: string[];
}

export interface MockProduct {
  id: string;
  name: string;
  brand: string;
  weight: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  image: string;
  description: string;
  categoryId: string;
  subcategory: string;
}

export interface MockOrderItem {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
}

export interface MockOrder {
  id: string;
  status: OrderStatus;
  date: string;
  slot: string;
  items: MockOrderItem[];
  address: string;
  total: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryPartner?: {
    name: string;
    phone: string;
  };
}

export interface DeliverySlot {
  id: string;
  date: string;
  dateLabel: string;
  timeWindow: string;
  available: boolean;
  slotsLeft: number;
}

export interface MockAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  landmark: string;
  pincode: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const CATEGORIES: MockCategory[] = [
  {
    id: 'dairy',
    name: 'Dairy & Eggs',
    emoji: '🥛',
    color: 'bg-blue-50',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    subcategories: ['All', 'Milk', 'Curd & Yogurt', 'Butter & Ghee', 'Cheese', 'Eggs'],
  },
  {
    id: 'fruits',
    name: 'Fruits',
    emoji: '🍎',
    color: 'bg-red-50',
    image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
    subcategories: ['All', 'Seasonal', 'Exotic', 'Citrus', 'Dry Fruits'],
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    emoji: '🥬',
    color: 'bg-green-50',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400',
    subcategories: ['All', 'Leafy', 'Root', 'Exotic', 'Fresh Herbs'],
  },
  {
    id: 'atta',
    name: 'Atta & Flour',
    emoji: '🌾',
    color: 'bg-amber-50',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    subcategories: ['All', 'Whole Wheat', 'Multigrain', 'Maida', 'Besan', 'Sooji'],
  },
  {
    id: 'rice',
    name: 'Rice & Pulses',
    emoji: '🍚',
    color: 'bg-yellow-50',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    subcategories: ['All', 'Basmati', 'Non-Basmati', 'Dal', 'Rajma & Chole'],
  },
  {
    id: 'oil',
    name: 'Oil & Ghee',
    emoji: '🫒',
    color: 'bg-lime-50',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    subcategories: ['All', 'Mustard Oil', 'Sunflower', 'Olive', 'Groundnut', 'Ghee'],
  },
  {
    id: 'masala',
    name: 'Masala & Spices',
    emoji: '🌶️',
    color: 'bg-orange-50',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    subcategories: ['All', 'Whole Spices', 'Powdered', 'Blended Masala', 'Salt & Sugar'],
  },
  {
    id: 'snacks',
    name: 'Snacks',
    emoji: '🍿',
    color: 'bg-pink-50',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
    subcategories: ['All', 'Chips', 'Namkeen', 'Biscuits', 'Chocolates'],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    emoji: '🍵',
    color: 'bg-teal-50',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
    subcategories: ['All', 'Tea', 'Coffee', 'Juices', 'Soft Drinks'],
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    emoji: '🧹',
    color: 'bg-cyan-50',
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400',
    subcategories: ['All', 'Detergent', 'Dishwash', 'Floor Cleaner', 'Bathroom'],
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const PRODUCTS: MockProduct[] = [
  // Dairy
  { id: 'p1', name: 'Amul Taaza Toned Milk', brand: 'Amul', weight: '1 L', price: 58, originalPrice: 62, inStock: true, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', description: 'Fresh toned milk with 3% fat content. Pasteurized and homogenized for your family.', categoryId: 'dairy', subcategory: 'Milk' },
  { id: 'p2', name: 'Amul Gold Full Cream Milk', brand: 'Amul', weight: '1 L', price: 72, inStock: true, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', description: 'Rich full cream milk with 6% fat. Perfect for tea, coffee & sweets.', categoryId: 'dairy', subcategory: 'Milk' },
  { id: 'p3', name: 'Mother Dairy Curd', brand: 'Mother Dairy', weight: '400 g', price: 40, originalPrice: 45, inStock: true, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', description: 'Fresh and creamy set curd made from toned milk.', categoryId: 'dairy', subcategory: 'Curd & Yogurt' },
  { id: 'p4', name: 'Amul Butter', brand: 'Amul', weight: '500 g', price: 270, originalPrice: 290, inStock: true, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', description: 'Utterly butterly delicious. Made from fresh cream.', categoryId: 'dairy', subcategory: 'Butter & Ghee' },

  // Fruits
  { id: 'p5', name: 'Fresh Bananas', brand: 'Farm Fresh', weight: '1 dozen', price: 50, inStock: true, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', description: 'Ripe and sweet Cavendish bananas. Rich in potassium.', categoryId: 'fruits', subcategory: 'Seasonal' },
  { id: 'p6', name: 'Shimla Apples', brand: 'Himalayan', weight: '1 kg', price: 180, originalPrice: 220, inStock: true, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', description: 'Fresh Shimla apples. Crisp and juicy.', categoryId: 'fruits', subcategory: 'Seasonal' },
  { id: 'p7', name: 'Imported Kiwi', brand: 'Zespri', weight: '3 pcs', price: 150, originalPrice: 180, inStock: true, image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=300', description: 'Sweet and tangy green kiwis. Rich in Vitamin C.', categoryId: 'fruits', subcategory: 'Exotic' },
  { id: 'p8', name: 'Almonds California', brand: 'Happilo', weight: '200 g', price: 320, originalPrice: 399, inStock: true, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=300', description: 'Premium California almonds. Great for snacking.', categoryId: 'fruits', subcategory: 'Dry Fruits' },

  // Vegetables
  { id: 'p9', name: 'Fresh Tomatoes', brand: 'Farm Fresh', weight: '1 kg', price: 40, inStock: true, image: 'https://images.unsplash.com/photo-1546470427-1ec9e9e11e2e?w=300', description: 'Ripe red tomatoes. Essential for every Indian kitchen.', categoryId: 'vegetables', subcategory: 'Root' },
  { id: 'p10', name: 'Green Palak (Spinach)', brand: 'Farm Fresh', weight: '250 g', price: 25, inStock: true, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300', description: 'Fresh organic spinach leaves. Rich in iron.', categoryId: 'vegetables', subcategory: 'Leafy' },
  { id: 'p11', name: 'Baby Potatoes', brand: 'Farm Fresh', weight: '1 kg', price: 35, originalPrice: 40, inStock: true, image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber3c0?w=300', description: 'Small and tender baby potatoes. Great for curries.', categoryId: 'vegetables', subcategory: 'Root' },
  { id: 'p12', name: 'Broccoli', brand: 'Farm Fresh', weight: '300 g', price: 80, inStock: false, image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300', description: 'Fresh green broccoli florets. Superfood for health.', categoryId: 'vegetables', subcategory: 'Exotic' },

  // Atta & Flour
  { id: 'p13', name: 'Aashirvaad Whole Wheat Atta', brand: 'Aashirvaad', weight: '5 kg', price: 265, originalPrice: 310, inStock: true, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300', description: 'India\'s most trusted atta. Makes soft rotis.', categoryId: 'atta', subcategory: 'Whole Wheat' },
  { id: 'p14', name: 'Pillsbury Multigrain Atta', brand: 'Pillsbury', weight: '5 kg', price: 290, originalPrice: 340, inStock: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300', description: '4 grain atta for healthy living. Rich in fiber.', categoryId: 'atta', subcategory: 'Multigrain' },
  { id: 'p15', name: 'Rajdhani Besan', brand: 'Rajdhani', weight: '1 kg', price: 120, inStock: true, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300', description: 'Fine gram flour for pakoras, laddu and more.', categoryId: 'atta', subcategory: 'Besan' },
  { id: 'p16', name: 'Saffola Sooji', brand: 'Saffola', weight: '1 kg', price: 85, inStock: true, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300', description: 'Fine semolina for upma, halwa and rava dosa.', categoryId: 'atta', subcategory: 'Sooji' },

  // Rice & Pulses
  { id: 'p17', name: 'India Gate Basmati Rice', brand: 'India Gate', weight: '5 kg', price: 450, originalPrice: 520, inStock: true, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300', description: 'Extra long grain basmati rice. Perfect for biryani.', categoryId: 'rice', subcategory: 'Basmati' },
  { id: 'p18', name: 'Tata Sampann Toor Dal', brand: 'Tata', weight: '1 kg', price: 155, originalPrice: 175, inStock: true, image: 'https://images.unsplash.com/photo-1613758947307-f3d35e6c3015?w=300', description: 'Unpolished toor dal. Rich in protein and fiber.', categoryId: 'rice', subcategory: 'Dal' },
  { id: 'p19', name: 'Tata Moong Dal', brand: 'Tata', weight: '1 kg', price: 140, inStock: true, image: 'https://images.unsplash.com/photo-1613758947307-f3d35e6c3015?w=300', description: 'Split moong dal. Easy to cook, easy to digest.', categoryId: 'rice', subcategory: 'Dal' },
  { id: 'p20', name: 'Rajma Chitra', brand: 'Farm Fresh', weight: '1 kg', price: 160, originalPrice: 190, inStock: true, image: 'https://images.unsplash.com/photo-1515543904598-2af57b8db41a?w=300', description: 'Premium Chitra Rajma. Makes the best rajma chawal.', categoryId: 'rice', subcategory: 'Rajma & Chole' },

  // Oil & Ghee
  { id: 'p21', name: 'Fortune Sunflower Oil', brand: 'Fortune', weight: '5 L', price: 620, originalPrice: 750, inStock: true, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300', description: 'Refined sunflower oil. Light and healthy cooking.', categoryId: 'oil', subcategory: 'Sunflower' },
  { id: 'p22', name: 'Amul Cow Ghee', brand: 'Amul', weight: '1 L', price: 580, originalPrice: 650, inStock: true, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', description: 'Pure cow ghee. Made from fresh cream using traditional method.', categoryId: 'oil', subcategory: 'Ghee' },
  { id: 'p23', name: 'P Mark Mustard Oil', brand: 'P Mark', weight: '1 L', price: 195, inStock: true, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300', description: 'Kachi ghani mustard oil. Strong aroma, authentic taste.', categoryId: 'oil', subcategory: 'Mustard Oil' },
  { id: 'p24', name: 'Figaro Olive Oil', brand: 'Figaro', weight: '500 ml', price: 340, originalPrice: 399, inStock: true, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300', description: 'Pure olive oil for salads and light cooking.', categoryId: 'oil', subcategory: 'Olive' },

  // Masala & Spices
  { id: 'p25', name: 'MDH Garam Masala', brand: 'MDH', weight: '100 g', price: 75, inStock: true, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300', description: 'Asli masale sach sach. Perfect blend of spices.', categoryId: 'masala', subcategory: 'Blended Masala' },
  { id: 'p26', name: 'Everest Red Chilli Powder', brand: 'Everest', weight: '200 g', price: 85, originalPrice: 95, inStock: true, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300', description: 'Pure Kashmiri red chilli powder. Rich color.', categoryId: 'masala', subcategory: 'Powdered' },
  { id: 'p27', name: 'Catch Turmeric Powder', brand: 'Catch', weight: '200 g', price: 52, inStock: true, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300', description: 'Pure haldi powder. Essential for Indian cooking.', categoryId: 'masala', subcategory: 'Powdered' },
  { id: 'p28', name: 'Tata Salt', brand: 'Tata', weight: '1 kg', price: 24, inStock: true, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300', description: 'Desh ka namak. Vacuum evaporated iodized salt.', categoryId: 'masala', subcategory: 'Salt & Sugar' },

  // Snacks
  { id: 'p29', name: 'Lays Classic Salted Chips', brand: 'Lays', weight: '130 g', price: 40, inStock: true, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300', description: 'Crispy potato chips. No one can eat just one.', categoryId: 'snacks', subcategory: 'Chips' },
  { id: 'p30', name: 'Haldiram Aloo Bhujia', brand: 'Haldiram', weight: '400 g', price: 120, originalPrice: 140, inStock: true, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300', description: 'Classic aloo bhujia namkeen. Perfect tea-time snack.', categoryId: 'snacks', subcategory: 'Namkeen' },
  { id: 'p31', name: 'Parle-G Biscuits', brand: 'Parle', weight: '800 g', price: 55, originalPrice: 60, inStock: true, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300', description: 'G maane Genius. India\'s favorite glucose biscuit.', categoryId: 'snacks', subcategory: 'Biscuits' },
  { id: 'p32', name: 'Cadbury Dairy Milk', brand: 'Cadbury', weight: '130 g', price: 105, inStock: true, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300', description: 'Kuch meetha ho jaaye. Smooth milk chocolate.', categoryId: 'snacks', subcategory: 'Chocolates' },

  // Beverages
  { id: 'p33', name: 'Tata Gold Tea', brand: 'Tata', weight: '500 g', price: 290, originalPrice: 340, inStock: true, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', description: 'Premium long leaf tea for a strong cup.', categoryId: 'beverages', subcategory: 'Tea' },
  { id: 'p34', name: 'Nescafe Classic Coffee', brand: 'Nescafe', weight: '200 g', price: 405, originalPrice: 460, inStock: true, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300', description: 'Instant coffee for a quick caffeine fix.', categoryId: 'beverages', subcategory: 'Coffee' },
  { id: 'p35', name: 'Real Mango Juice', brand: 'Real', weight: '1 L', price: 110, originalPrice: 125, inStock: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=300', description: 'Made with Alphonso mangoes. No added preservatives.', categoryId: 'beverages', subcategory: 'Juices' },
  { id: 'p36', name: 'Coca Cola', brand: 'Coca Cola', weight: '2 L', price: 95, inStock: true, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300', description: 'Open happiness. Ice cold refreshment.', categoryId: 'beverages', subcategory: 'Soft Drinks' },

  // Cleaning
  { id: 'p37', name: 'Surf Excel Matic', brand: 'Surf Excel', weight: '2 kg', price: 420, originalPrice: 499, inStock: true, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300', description: 'Top load washing machine detergent. Tough stain removal.', categoryId: 'cleaning', subcategory: 'Detergent' },
  { id: 'p38', name: 'Vim Dishwash Gel', brand: 'Vim', weight: '750 ml', price: 130, originalPrice: 150, inStock: true, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300', description: 'Lemon power for sparkling clean dishes.', categoryId: 'cleaning', subcategory: 'Dishwash' },
  { id: 'p39', name: 'Lizol Floor Cleaner', brand: 'Lizol', weight: '975 ml', price: 195, inStock: true, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300', description: 'Citrus fresh floor cleaner. Kills 99.9% germs.', categoryId: 'cleaning', subcategory: 'Floor Cleaner' },
  { id: 'p40', name: 'Harpic Toilet Cleaner', brand: 'Harpic', weight: '1 L', price: 160, originalPrice: 185, inStock: true, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300', description: 'Power plus. 10x better cleaning. Kills all germs.', categoryId: 'cleaning', subcategory: 'Bathroom' },
];

// ─── Mock Orders ──────────────────────────────────────────────────────────────

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ORD-10045',
    status: 'pending',
    date: '3 Jul 2026',
    slot: 'Today, 6-8 PM',
    items: [
      { productId: 'p1', name: 'Amul Taaza Toned Milk', weight: '1 L', price: 58, quantity: 2, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100' },
      { productId: 'p13', name: 'Aashirvaad Atta', weight: '5 kg', price: 265, quantity: 1, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100' },
    ],
    address: '42 Green Park, Koramangala, Bengaluru 560034',
    subtotal: 381,
    deliveryCharge: 0,
    total: 381,
  },
  {
    id: 'ORD-10042',
    status: 'accepted',
    date: '2 Jul 2026',
    slot: 'Tomorrow, 10-12 PM',
    items: [
      { productId: 'p6', name: 'Shimla Apples', weight: '1 kg', price: 180, quantity: 1, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100' },
      { productId: 'p9', name: 'Fresh Tomatoes', weight: '1 kg', price: 40, quantity: 2, image: 'https://images.unsplash.com/photo-1546470427-1ec9e9e11e2e?w=100' },
      { productId: 'p28', name: 'Tata Salt', weight: '1 kg', price: 24, quantity: 1, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100' },
    ],
    address: '42 Green Park, Koramangala, Bengaluru 560034',
    subtotal: 284,
    deliveryCharge: 25,
    total: 309,
    deliveryPartner: { name: 'Rajesh Kumar', phone: '+919876543210' },
  },
  {
    id: 'ORD-10039',
    status: 'out_for_delivery',
    date: '1 Jul 2026',
    slot: 'Today, 2-4 PM',
    items: [
      { productId: 'p33', name: 'Tata Gold Tea', weight: '500 g', price: 290, quantity: 1, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100' },
      { productId: 'p34', name: 'Nescafe Classic', weight: '200 g', price: 405, quantity: 1, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100' },
    ],
    address: 'B-204, Tech Park, Whitefield, Bengaluru 560066',
    subtotal: 695,
    deliveryCharge: 0,
    total: 695,
    deliveryPartner: { name: 'Suresh Patil', phone: '+919988776655' },
  },
  {
    id: 'ORD-10035',
    status: 'delivered',
    date: '28 Jun 2026',
    slot: '28 Jun, 4-6 PM',
    items: [
      { productId: 'p21', name: 'Fortune Sunflower Oil', weight: '5 L', price: 620, quantity: 1, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100' },
      { productId: 'p37', name: 'Surf Excel Matic', weight: '2 kg', price: 420, quantity: 1, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=100' },
    ],
    address: '42 Green Park, Koramangala, Bengaluru 560034',
    subtotal: 1040,
    deliveryCharge: 0,
    total: 1040,
    deliveryPartner: { name: 'Amit Shah', phone: '+919123456789' },
  },
  {
    id: 'ORD-10030',
    status: 'cancelled',
    date: '25 Jun 2026',
    slot: '25 Jun, 10-12 PM',
    items: [
      { productId: 'p12', name: 'Broccoli', weight: '300 g', price: 80, quantity: 2, image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=100' },
    ],
    address: 'B-204, Tech Park, Whitefield, Bengaluru 560066',
    subtotal: 160,
    deliveryCharge: 25,
    total: 185,
  },
];

// ─── Delivery Slots ───────────────────────────────────────────────────────────

function generateSlots(): DeliverySlot[] {
  const slots: DeliverySlot[] = [];
  const today = new Date();
  const timeWindows = [
    { window: '8:00 AM – 10:00 AM', id: 'morning' },
    { window: '10:00 AM – 12:00 PM', id: 'late-morning' },
    { window: '2:00 PM – 4:00 PM', id: 'afternoon' },
    { window: '6:00 PM – 8:00 PM', id: 'evening' },
  ];
  const dayLabels = ['Today', 'Tomorrow'];

  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const label =
      d < dayLabels.length
        ? dayLabels[d]
        : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    for (const tw of timeWindows) {
      const available = Math.random() > 0.2;
      slots.push({
        id: `${dateStr}-${tw.id}`,
        date: dateStr,
        dateLabel: label,
        timeWindow: tw.window,
        available,
        slotsLeft: available ? Math.floor(Math.random() * 8) + 1 : 0,
      });
    }
  }
  return slots;
}

export const DELIVERY_SLOTS: DeliverySlot[] = generateSlots();

// ─── Addresses ────────────────────────────────────────────────────────────────

export const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: 'addr1',
    label: 'Home',
    fullAddress: '42, Green Park Main Road, Koramangala 4th Block',
    landmark: 'Near Forum Mall',
    pincode: '560034',
  },
  {
    id: 'addr2',
    label: 'Work',
    fullAddress: 'B-204, Prestige Tech Park, Outer Ring Road, Whitefield',
    landmark: 'Opposite Marriott Hotel',
    pincode: '560066',
  },
];

export const VALID_PINCODES = [
  '560034', '560066', '560001', '560008', '560010',
  '560011', '560017', '560025', '560029', '560030',
  '560038', '560041', '560043', '560047', '560048',
  '560050', '560068', '560070', '560078', '560085',
];
