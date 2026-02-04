# Real-Time Orders System - Testing Guide

## ✅ What Changed

The partner dashboard now shows **ONLY REAL ORDERS** placed by users. No more mock data!

### Key Changes:
1. **Empty State by Default** - Partner dashboard starts with no orders
2. **Real-Time Order Display** - Orders appear instantly when students place them
3. **Cross-Tab Sync** - Works across multiple browser tabs
4. **Complete Student Info** - Shows all student details (name, phone, email, department, etc.)

---

## 🧪 How to Test

### Step 1: Clear Existing Data (Optional)
If you have old mock data, clear it:

**Option A: Browser Console**
```javascript
localStorage.removeItem('orders');
location.reload();
```

**Option B: Application Storage**
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Find `orders` key and delete it
4. Refresh page

### Step 2: Login to Partner Dashboard
1. Go to `http://localhost:3000/login`
2. Use credentials:
   - Email: `admin@thegrill.com`
   - Password: `demo123`
3. You should see **"No Orders Yet"** message

### Step 3: Place an Order as Student

**Option A: Student Login (Recommended)**
1. Open a new tab or incognito window
2. Go to `http://localhost:3000/student/login`
3. Create an account or login
4. Browse menu and add items to cart
5. Go to checkout
6. Fill in delivery details
7. Place order

**Option B: Guest Checkout (If available)**
1. Open new tab
2. Go to `http://localhost:3000`
3. Browse and order without login

### Step 4: Watch Order Appear in Partner Dashboard
1. Go back to partner dashboard tab
2. Order should appear **instantly** (within 5 seconds max)
3. You'll see complete student details:
   - Name
   - Phone number
   - Email
   - Department
   - Institute
   - Student ID
   - Delivery address
   - Order mode (Pickup/Delivery/Dine-in)
   - Special instructions

---

## 🎯 Testing Checklist

### Basic Flow
- [ ] Partner dashboard shows empty state initially
- [ ] Order appears immediately after student places it
- [ ] Order shows complete student information
- [ ] Order mode (Pickup/Delivery/Dine-in) is clearly visible
- [ ] Special instructions are displayed if provided

### Cross-Tab Sync
- [ ] Open partner dashboard in Tab 1
- [ ] Place order in Tab 2
- [ ] Order appears in Tab 1 without refresh

### Order Status Updates
- [ ] Change order status (Pending → Confirmed → Preparing → Ready → Completed)
- [ ] Status updates reflect in all open tabs
- [ ] Order moves to appropriate section (Active/Completed)

### Filters
- [ ] "All Orders" shows all orders
- [ ] "Pending" shows only pending orders
- [ ] "Confirmed" shows only confirmed orders
- [ ] "Preparing" shows only orders being prepared
- [ ] "Ready" shows only ready orders
- [ ] Empty state message changes based on filter

### Multiple Orders
- [ ] Place 5+ orders from different students
- [ ] All orders appear in partner dashboard
- [ ] Each shows unique student information
- [ ] Orders are sorted correctly (newest first)

---

## 📊 Expected Behavior

### Empty State
```
┌─────────────────────────────────┐
│         No Orders Yet           │
│                                 │
│  Orders placed by students will │
│  appear here in real-time       │
│                                 │
│  🟢 Waiting for orders...       │
└─────────────────────────────────┘
```

### With Orders
```
┌─────────────────────────────────┐
│  Order #CB-123456   [Preparing] │
│                                 │
│  Student Details:               │
│  Name: John Doe                 │
│  Phone: +1 555-1234            │
│  Email: john@university.edu     │
│  Department: Computer Science   │
│  Institute: Tech University     │
│  Student ID: STU-2024-001      │
│                                 │
│  Delivery: Library 3F           │
│  Mode: 🚚 Delivery             │
│                                 │
│  Items: 2x Burger (₹500)       │
│                                 │
│  [Confirm] [Cancel]             │
└─────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Orders Not Appearing?

**Check 1: Storage Events**
- Open DevTools Console
- Look for log: `[OrderContext] Saved X orders to storage`
- If missing, order wasn't saved properly

**Check 2: Context Provider**
- Verify `OrderProvider` wraps both checkout and dashboard
- Check `/src/app/layout.tsx`

**Check 3: Cafeteria Mismatch**
- Orders only show for the logged-in partner's cafeteria
- Student must order from the same cafeteria

**Check 4: Browser Storage**
- Open DevTools → Application → Local Storage
- Check if `orders` key exists and has data
- Verify JSON format is correct

### Orders Not Syncing Across Tabs?

**Solution 1: Force Refresh**
- Close all tabs
- Clear localStorage
- Reopen and test again

**Solution 2: Check Console Logs**
- Look for: `[OrderContext] Synced orders from storage`
- If missing, sync mechanism may be failing

---

## 🎨 UI Features

### Order Card Shows:
✅ Order ID (CB-XXXXXX format)  
✅ Status badge with icon  
✅ Order mode badge (Pickup/Delivery/Dine-in)  
✅ Timestamp  
✅ Total amount  
✅ Complete student profile  
✅ Delivery address (if delivery)  
✅ Special instructions (if provided)  
✅ All ordered items with quantities  
✅ Action buttons based on status  

### Empty State Shows:
✅ Large package icon  
✅ "No Orders Yet" heading  
✅ Context-aware message  
✅ Live waiting indicator  
✅ Beautiful gradient background  

---

## 💡 Tips for Best Testing

1. **Use Incognito for Student** - Prevents auth conflicts
2. **Keep Console Open** - Watch real-time logs
3. **Test Multiple Cafeterias** - Each partner sees only their orders
4. **Try Different Order Modes** - Pickup, Delivery, Dine-in
5. **Add Special Instructions** - Verify they display correctly
6. **Test Status Flow** - Go through complete order lifecycle

---

## 📝 Student Information Captured

When a student places an order, the following info is saved:

### From Student Profile:
- `studentName` - Full name
- `studentEmail` - Email address
- `studentPhone` - Phone number
- `studentDepartment` - Academic department
- `studentInstitute` - University/college name
- `studentId` - Student ID number

### From Order Form:
- `deliveryAddress` - Where to deliver/pickup
- `deliveryType` - Pickup, Delivery, or Dine-in
- `specialInstructions` - Kitchen notes
- `items` - Ordered items with quantities
- `total` - Total amount

All this information is displayed to the partner in an organized, easy-to-read format!

---

## 🚀 Quick Test Script

Run this in browser console to simulate an order (for testing only):

```javascript
// Simulate a student order
const testOrder = {
  id: 'CB-' + Math.floor(100000 + Math.random() * 900000),
  orderNumber: 'CB-' + Math.floor(100000 + Math.random() * 900000),
  studentName: 'Test Student',
  studentId: 'STU-2024-TEST',
  studentEmail: 'test@university.edu',
  studentPhone: '+1 555-0000',
  studentDepartment: 'Computer Science',
  studentInstitute: 'Test University',
  customerName: 'Test Student',
  customerPhone: '+1 555-0000',
  deliveryAddress: 'Test Location',
  cafeteriaId: 'cafe-1', // Change based on your cafeteria
  cafeteriaName: 'The Grill',
  items: [{
    name: 'Test Item',
    quantity: 1,
    subtotal: 100
  }],
  total: 100,
  status: 'pending',
  deliveryType: 'pickup',
  estimatedTime: '15-20 mins',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Get existing orders
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
orders.push(testOrder);
localStorage.setItem('orders', JSON.stringify(orders));

// Trigger sync
window.dispatchEvent(new CustomEvent('localStorageUpdate', { detail: { key: 'orders' } }));

console.log('✅ Test order added! Refresh to see it.');
```

---

## ✨ Success Indicators

You'll know everything works when:
1. ✅ Dashboard starts empty (no mock orders)
2. ✅ Orders appear within seconds of being placed
3. ✅ Complete student info is visible
4. ✅ Multiple tabs stay in sync
5. ✅ Status updates work smoothly
6. ✅ Filters show correct results
7. ✅ Empty states display properly

Happy testing! 🎉
