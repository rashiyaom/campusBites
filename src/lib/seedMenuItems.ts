/**
 * Seed Menu Items - Add diverse products to each cafeteria
 * Run this in browser console or create a seed page
 */

import { MenuItem } from '@/types';

export const SEED_MENU_ITEMS: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ============================================
  // THE GRILL (cafe-1) - American Classics
  // ============================================
  {
    name: 'Classic Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, pickles, and special sauce on a toasted bun',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    category: 'Burgers',
    cafeteriaId: 'cafe-1',
    prepTime: '10-12 min',
    calories: 650,
    rating: 4.7,
    reviewCount: 156,
    available: true,
    ingredients: ['beef patty', 'lettuce', 'tomato', 'pickles', 'special sauce', 'sesame bun'],
    allergens: ['gluten', 'dairy']
  },
  {
    name: 'BBQ Bacon Burger',
    description: 'Beef patty topped with crispy bacon, cheddar cheese, onion rings, and smoky BBQ sauce',
    price: 11.49,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    category: 'Burgers',
    cafeteriaId: 'cafe-1',
    prepTime: '12-15 min',
    calories: 890,
    rating: 4.9,
    reviewCount: 203,
    available: true,
    ingredients: ['beef patty', 'bacon', 'cheddar', 'onion rings', 'BBQ sauce', 'brioche bun'],
    allergens: ['gluten', 'dairy']
  },
  {
    name: 'Crispy Chicken Sandwich',
    description: 'Buttermilk fried chicken breast with coleslaw, pickles, and spicy mayo',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
    category: 'Sandwiches',
    cafeteriaId: 'cafe-1',
    prepTime: '10-12 min',
    calories: 720,
    rating: 4.8,
    reviewCount: 178,
    available: true,
    ingredients: ['chicken breast', 'coleslaw', 'pickles', 'spicy mayo', 'potato bun'],
    allergens: ['gluten', 'dairy', 'eggs']
  },
  {
    name: 'Loaded Cheese Fries',
    description: 'Crispy fries topped with melted cheddar, bacon bits, sour cream, and green onions',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80',
    category: 'Fries',
    cafeteriaId: 'cafe-1',
    prepTime: '8-10 min',
    calories: 580,
    rating: 4.6,
    reviewCount: 142,
    available: true,
    ingredients: ['french fries', 'cheddar cheese', 'bacon', 'sour cream', 'green onions'],
    allergens: ['dairy']
  },
  {
    name: 'Grilled Veggie Burger',
    description: 'House-made veggie patty with avocado, sprouts, tomato, and herb aioli',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a729002a?auto=format&fit=crop&w=800&q=80',
    category: 'Burgers',
    cafeteriaId: 'cafe-1',
    prepTime: '10-12 min',
    calories: 420,
    rating: 4.5,
    reviewCount: 89,
    available: true,
    ingredients: ['veggie patty', 'avocado', 'sprouts', 'tomato', 'herb aioli', 'whole wheat bun'],
    allergens: ['gluten', 'soy']
  },

  // ============================================
  // SUSHI CORNER (cafe-2) - Japanese Cuisine
  // ============================================
  {
    name: 'Dragon Roll',
    description: 'Shrimp tempura, avocado, topped with eel and eel sauce',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
    category: 'Sushi',
    cafeteriaId: 'cafe-2',
    prepTime: '12-15 min',
    calories: 450,
    rating: 4.9,
    reviewCount: 267,
    available: true,
    ingredients: ['shrimp tempura', 'avocado', 'eel', 'eel sauce', 'sushi rice', 'nori'],
    allergens: ['shellfish', 'gluten', 'soy']
  },
  {
    name: 'California Roll (8pc)',
    description: 'Classic roll with imitation crab, avocado, cucumber, and sesame seeds',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1617196035722-7c4f8c6bc1fc?auto=format&fit=crop&w=800&q=80',
    category: 'Sushi',
    cafeteriaId: 'cafe-2',
    prepTime: '6-8 min',
    calories: 320,
    rating: 4.7,
    reviewCount: 198,
    available: true,
    ingredients: ['imitation crab', 'avocado', 'cucumber', 'sesame seeds', 'sushi rice', 'nori'],
    allergens: ['shellfish', 'soy']
  },
  {
    name: 'Salmon Sashimi (6pc)',
    description: 'Fresh cuts of premium Atlantic salmon served with wasabi and soy sauce',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1617196034796-ca11cd0ba5a8?auto=format&fit=crop&w=800&q=80',
    category: 'Sushi',
    cafeteriaId: 'cafe-2',
    prepTime: '5-7 min',
    calories: 240,
    rating: 5.0,
    reviewCount: 312,
    available: true,
    ingredients: ['Atlantic salmon', 'wasabi', 'soy sauce', 'pickled ginger'],
    allergens: ['fish', 'soy']
  },
  {
    name: 'Chicken Teriyaki Bowl',
    description: 'Grilled chicken glazed with teriyaki sauce over steamed rice and vegetables',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    category: 'Japanese',
    cafeteriaId: 'cafe-2',
    prepTime: '10-12 min',
    calories: 580,
    rating: 4.8,
    reviewCount: 176,
    available: true,
    ingredients: ['chicken breast', 'teriyaki sauce', 'white rice', 'broccoli', 'carrots', 'sesame seeds'],
    allergens: ['soy', 'gluten']
  },
  {
    name: 'Miso Soup',
    description: 'Traditional Japanese soup with tofu, seaweed, and green onions',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    category: 'Japanese',
    cafeteriaId: 'cafe-2',
    prepTime: '3-5 min',
    calories: 85,
    rating: 4.6,
    reviewCount: 143,
    available: true,
    ingredients: ['miso paste', 'tofu', 'seaweed', 'green onions', 'dashi broth'],
    allergens: ['soy']
  },

  // ============================================
  // COFFEE & CO (cafe-3) - Coffee & Pastries
  // ============================================
  {
    name: 'Cappuccino',
    description: 'Rich espresso with velvety steamed milk and foam',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    category: 'Coffee',
    cafeteriaId: 'cafe-3',
    prepTime: '3-5 min',
    calories: 120,
    rating: 4.8,
    reviewCount: 421,
    available: true,
    ingredients: ['espresso', 'steamed milk', 'milk foam'],
    allergens: ['dairy']
  },
  {
    name: 'Iced Mocha',
    description: 'Cold espresso with chocolate syrup, milk, and whipped cream',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=800&q=80',
    category: 'Coffee',
    cafeteriaId: 'cafe-3',
    prepTime: '4-6 min',
    calories: 290,
    rating: 4.9,
    reviewCount: 356,
    available: true,
    ingredients: ['espresso', 'chocolate syrup', 'milk', 'ice', 'whipped cream'],
    allergens: ['dairy']
  },
  {
    name: 'Blueberry Muffin',
    description: 'Freshly baked muffin bursting with juicy blueberries and a crumbly top',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
    category: 'Pastries',
    cafeteriaId: 'cafe-3',
    prepTime: '2-3 min',
    calories: 380,
    rating: 4.7,
    reviewCount: 234,
    available: true,
    ingredients: ['flour', 'blueberries', 'sugar', 'butter', 'eggs', 'milk'],
    allergens: ['gluten', 'dairy', 'eggs']
  },
  {
    name: 'Avocado Toast',
    description: 'Smashed avocado on sourdough with cherry tomatoes, feta, and everything bagel seasoning',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&q=80',
    category: 'Breakfast',
    cafeteriaId: 'cafe-3',
    prepTime: '5-7 min',
    calories: 420,
    rating: 4.8,
    reviewCount: 289,
    available: true,
    ingredients: ['sourdough bread', 'avocado', 'cherry tomatoes', 'feta cheese', 'everything bagel seasoning'],
    allergens: ['gluten', 'dairy']
  },
  {
    name: 'Chocolate Croissant',
    description: 'Buttery, flaky croissant filled with rich dark chocolate',
    price: 4.49,
    image: 'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=80',
    category: 'Pastries',
    cafeteriaId: 'cafe-3',
    prepTime: '2-3 min',
    calories: 410,
    rating: 4.9,
    reviewCount: 467,
    available: true,
    ingredients: ['butter', 'flour', 'dark chocolate', 'sugar', 'yeast'],
    allergens: ['gluten', 'dairy']
  }
];

/**
 * Function to seed menu items into localStorage
 * Call this from browser console or a seed page
 */
export const seedMenuItems = () => {
  const existingItems = localStorage.getItem('menuItems');
  let menuItems: MenuItem[] = [];

  if (existingItems) {
    try {
      menuItems = JSON.parse(existingItems);
    } catch (error) {
      console.error('Failed to parse existing menu items:', error);
      menuItems = [];
    }
  }

  // Add new items with proper IDs and timestamps
  const newItems: MenuItem[] = SEED_MENU_ITEMS.map((item, index) => ({
    ...item,
    id: `item-${Date.now()}-${index}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  // Merge with existing items (avoid duplicates)
  const mergedItems = [...menuItems, ...newItems];
  
  // Save to localStorage
  localStorage.setItem('menuItems', JSON.stringify(mergedItems));
  
  console.log(`✅ Successfully seeded ${newItems.length} menu items!`);
  console.log('Menu items by cafeteria:');
  console.log('- The Grill: 5 items');
  console.log('- Sushi Corner: 5 items');
  console.log('- Coffee & Co: 5 items');
  
  return mergedItems;
};

/**
 * Function to clear all menu items (for testing)
 */
export const clearMenuItems = () => {
  localStorage.removeItem('menuItems');
  console.log('🗑️ All menu items cleared');
};
