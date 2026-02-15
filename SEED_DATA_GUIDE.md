# 🌱 How to Load All Shop Data

## ⚠️ IMPORTANT: You must seed the data first!

The new shops and products are not visible because they need to be loaded into localStorage.

## 📋 Steps to Make Everything Visible:

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. Visit the Seed Page
Navigate to: **http://localhost:3000/seed**

### 3. Click "Seed All Business Data" Button
This will load:
- ✅ **10 Partner Accounts** (credentials for login)
- ✅ **10 Businesses** (1 Food + 4 Grocery + 1 Stationery + 4 Essentials)
- ✅ **50+ Products** (5 products per store)

### 4. Verify on Login Page
Go to: **http://localhost:3000/login**

You should now see **10 demo accounts**:

#### 🍔 FOOD (1):
- admin@thegrill.com

#### 🛒 GROCERY (4):
- admin@campusmart.com
- admin@freshbazaar.com
- admin@quickstop.com
- admin@organiccorner.com

#### ✏️ STATIONERY (1):
- admin@penparadise.com

#### 🧴 ESSENTIALS (4):
- admin@dailyneeds.com
- admin@campuscare.com
- admin@hygieneplus.com
- admin@studentstore.com

### 5. Verify on Stores Page
Go to: **http://localhost:3000/stores**

- Click **"Grocery"** tab → Should see 4 grocery stores with products
- Click **"Essentials"** tab → Should see 4 essentials stores with products

---

## 🔐 All Login Credentials

**Email Format**: admin@[storename].com  
**Password**: demo123 (for all accounts)

---

## 🎯 What Each Store Sells:

### 🛒 GROCERY STORES:

1. **Campus Mart** - General groceries
   - Milk, Bread, Noodles, Chips, Energy Drinks, Cheese

2. **Fresh Bazaar** - Fresh produce
   - Tomatoes, Apples, Spinach, Eggs, Orange Juice

3. **Quick Stop Grocery** - Convenience store (24/7)
   - Biscuits, Coca Cola, Chocolate, Kurkure, Coffee

4. **Organic Corner** - Organic & health products
   - Quinoa, Honey, Chia Seeds, Almond Milk, Brown Rice

### 🧴 ESSENTIALS STORES:

1. **Daily Needs Store** - Basic toiletries
   - Toothpaste, Soap, Shampoo, Sanitizer, Razor, Lotion

2. **Campus Care** - Personal care & cosmetics
   - Face Wash, Face Cream, Talcum Powder, Petroleum Jelly, Shampoo

3. **Hygiene Plus** - Cleaning supplies
   - Floor Cleaner, Dishwash Bar, Toilet Cleaner, Fabric Softener, Glass Cleaner

4. **Student Store** - Daily essentials
   - Toothpaste, Mouthwash, Soap, Deodorant, Baby Powder

---

## 🐛 Troubleshooting:

### Products Not Showing?
1. Go to `/seed` page
2. Click "Seed All Business Data"
3. Refresh the `/stores` page

### Login Credentials Not Showing All 10 Accounts?
1. Clear browser localStorage (F12 → Application → Storage → Clear)
2. Go to `/seed` page
3. Click "Seed All Business Data"
4. Go back to `/login` page

### Already Seeded But Want to Refresh?
The seed function checks for existing data and only adds new items, so you can safely click it multiple times.

---

## 📊 Quick Stats:

- **Total Businesses**: 10
- **Total Products**: 50+
- **Business Types**: 4 (Food, Grocery, Stationery, Essentials)
- **Grocery Stores**: 4 (16 products total)
- **Essentials Stores**: 4 (20 products total)

---

## ✅ Success Checklist:

After seeding, you should see:
- [ ] 10 login credentials on `/login` page
- [ ] Products in Cafeterias section on `/stores`
- [ ] Products in Groceries section on `/stores`
- [ ] Products in Essentials section on `/stores`
- [ ] All 4 grocery stores visible when clicking Grocery tab
- [ ] All 4 essentials stores visible when clicking Essentials tab
- [ ] Partner can log in and see their products on dashboard

---

**Need Help?** Make sure you're on the `/seed` page and click the "Seed All Business Data" button! 🚀
