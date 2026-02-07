import * as XLSX from 'xlsx';
import { Order, MenuItem } from '@/types';
import { AnalyticsData, TopSellingItem } from '@/contexts/AnalyticsContext';

interface ExportData {
  cafeteriaName: string;
  orders: Order[];
  menuItems: MenuItem[];
  analytics: AnalyticsData;
  timeRange: number;
}

// Brand colors for CampusBites
const BRAND_COLORS = {
  primary: 'FF6B35', // Orange
  secondary: '004E89', // Blue
  success: '10B981', // Green
  warning: 'F59E0B', // Amber
  danger: 'EF4444', // Red
  gray: '6B7280',
  lightGray: 'F3F4F6',
  white: 'FFFFFF',
  dark: '1F2937'
};

// Helper function to create styled cell
const createStyledCell = (value: any, style?: any) => {
  return {
    v: value,
    t: typeof value === 'number' ? 'n' : 's',
    s: style
  };
};

// Header style - Large, bold, white text on orange
const headerStyle = {
  font: { bold: true, color: { rgb: BRAND_COLORS.white }, sz: 14, name: 'Arial' },
  fill: { fgColor: { rgb: BRAND_COLORS.primary } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
  border: {
    top: { style: 'medium', color: { rgb: BRAND_COLORS.primary } },
    bottom: { style: 'medium', color: { rgb: BRAND_COLORS.primary } },
    left: { style: 'medium', color: { rgb: BRAND_COLORS.primary } },
    right: { style: 'medium', color: { rgb: BRAND_COLORS.primary } }
  }
};

// Title style - Large, bold brand color
const titleStyle = {
  font: { bold: true, sz: 20, color: { rgb: BRAND_COLORS.primary }, name: 'Arial' },
  alignment: { horizontal: 'center', vertical: 'center' }
};

// Subtitle style - Medium, bold secondary color
const subtitleStyle = {
  font: { bold: true, sz: 16, color: { rgb: BRAND_COLORS.secondary }, name: 'Arial' },
  alignment: { horizontal: 'left', vertical: 'center' }
};

// Section header style - Emoji section headers
const sectionHeaderStyle = {
  font: { bold: true, sz: 14, color: { rgb: BRAND_COLORS.primary }, name: 'Arial' },
  fill: { fgColor: { rgb: 'FFF3E0' } }, // Light orange background
  alignment: { horizontal: 'left', vertical: 'center' },
  border: {
    top: { style: 'medium', color: { rgb: BRAND_COLORS.primary } },
    bottom: { style: 'medium', color: { rgb: BRAND_COLORS.primary } },
    left: { style: 'medium', color: { rgb: BRAND_COLORS.primary } },
    right: { style: 'medium', color: { rgb: BRAND_COLORS.primary } }
  }
};

// Data style - Larger, readable
const dataStyle = {
  font: { sz: 12, name: 'Arial' },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } },
    bottom: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } },
    left: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } },
    right: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } }
  }
};

// Data style with alternate row color
const dataStyleAlt = {
  font: { sz: 12, name: 'Arial' },
  fill: { fgColor: { rgb: 'FAFAFA' } }, // Very light gray
  alignment: { horizontal: 'left', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } },
    bottom: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } },
    left: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } },
    right: { style: 'thin', color: { rgb: BRAND_COLORS.lightGray } }
  }
};

// Currency style - Bold numbers
const currencyStyle = {
  ...dataStyle,
  font: { sz: 12, bold: true, name: 'Arial' },
  numFmt: '₹#,##0.00'
};

// Percentage style - Bold
const percentageStyle = {
  ...dataStyle,
  font: { sz: 12, bold: true, name: 'Arial' },
  numFmt: '0.00%'
};

// Date style
const dateStyle = {
  ...dataStyle,
  numFmt: 'dd-mmm-yyyy hh:mm AM/PM'
};

// Number style - Bold
const numberStyle = {
  ...dataStyle,
  font: { sz: 12, bold: true, name: 'Arial' }
};

// Total row style - Bold with background
const totalRowStyle = {
  font: { sz: 13, bold: true, name: 'Arial', color: { rgb: BRAND_COLORS.white } },
  fill: { fgColor: { rgb: BRAND_COLORS.secondary } },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: {
    top: { style: 'medium', color: { rgb: BRAND_COLORS.secondary } },
    bottom: { style: 'medium', color: { rgb: BRAND_COLORS.secondary } },
    left: { style: 'medium', color: { rgb: BRAND_COLORS.secondary } },
    right: { style: 'medium', color: { rgb: BRAND_COLORS.secondary } }
  }
};

export const exportToExcel = (data: ExportData) => {
  const workbook = XLSX.utils.book_new();
  
  // 1. OVERVIEW SHEET
  createOverviewSheet(workbook, data);
  
  // 2. SALES ANALYTICS SHEET
  createSalesAnalyticsSheet(workbook, data);
  
  // 3. TOP SELLING ITEMS SHEET
  createTopSellingItemsSheet(workbook, data);
  
  // 4. ORDERS DETAILS SHEET
  createOrdersDetailsSheet(workbook, data);
  
  // 5. HOURLY ANALYSIS SHEET
  createHourlyAnalysisSheet(workbook, data);
  
  // 6. STATUS BREAKDOWN SHEET
  createStatusBreakdownSheet(workbook, data);
  
  // 7. MENU PERFORMANCE SHEET
  createMenuPerformanceSheet(workbook, data);
  
  // 8. CUSTOMER INSIGHTS SHEET
  createCustomerInsightsSheet(workbook, data);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${data.cafeteriaName.replace(/\s+/g, '_')}_Analytics_${timestamp}.xlsx`;
  
  // Write file
  XLSX.writeFile(workbook, filename);
};

// 1. OVERVIEW SHEET
const createOverviewSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  // Header with branding - Large and prominent
  ws_data.push(['🍔 CAMPUSBITES ANALYTICS REPORT']);
  ws_data.push([]);
  ws_data.push([`Partner: ${data.cafeteriaName}`]);
  ws_data.push([`Report Period: Last ${data.timeRange} Days`]);
  ws_data.push([`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`]);
  ws_data.push([]);
  ws_data.push([]);
  
  // Key Metrics Section
  ws_data.push(['📊 KEY PERFORMANCE INDICATORS']);
  ws_data.push([]);
  ws_data.push(['Metric', 'Current Value', 'Growth vs Previous Period']);
  ws_data.push([
    'Total Revenue',
    data.analytics.totalRevenue,
    `${data.analytics.revenueGrowth >= 0 ? '+' : ''}${data.analytics.revenueGrowth.toFixed(1)}%`
  ]);
  ws_data.push([
    'Total Orders',
    data.analytics.totalOrders,
    `${data.analytics.ordersGrowth >= 0 ? '+' : ''}${data.analytics.ordersGrowth.toFixed(1)}%`
  ]);
  ws_data.push([
    'Average Order Value',
    data.analytics.averageOrderValue,
    'N/A'
  ]);
  ws_data.push([
    'Active Menu Items',
    data.menuItems.filter(m => m.available).length,
    'N/A'
  ]);
  ws_data.push([
    'Total Menu Items',
    data.menuItems.length,
    'N/A'
  ]);
  ws_data.push([]);
  ws_data.push([]);
  
  // Order Status Summary
  ws_data.push(['📦 ORDER STATUS SUMMARY']);
  ws_data.push([]);
  ws_data.push(['Status', 'Order Count', 'Percentage of Total']);
  data.analytics.orderStatusBreakdown
    .sort((a, b) => b.count - a.count)
    .forEach(status => {
      ws_data.push([
        status.status.toUpperCase().replace('_', ' '),
        status.count,
        status.percentage / 100
      ]);
    });
  ws_data.push([]);
  ws_data.push([]);
  
  // Peak Hours Section
  ws_data.push(['⏰ PEAK BUSINESS HOURS']);
  ws_data.push([]);
  ws_data.push(['Busiest Hours:', data.analytics.peakHours.join(' • ')]);
  ws_data.push(['Recommendation:', 'Ensure adequate staffing during these peak hours']);
  ws_data.push([]);
  ws_data.push([]);
  
  // Top 5 Items
  ws_data.push(['🏆 TOP 5 BEST SELLING ITEMS']);
  ws_data.push([]);
  ws_data.push(['Rank', 'Item Name', 'Quantity Sold', 'Total Revenue', 'Category']);
  data.analytics.topSellingItems.slice(0, 5).forEach((item, idx) => {
    ws_data.push([
      `#${idx + 1}`,
      item.itemName,
      item.quantity,
      item.revenue,
      item.category
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Apply styles and set larger column widths
  worksheet['!cols'] = [
    { wch: 35 },  // Column A - wider for labels
    { wch: 25 },  // Column B - values
    { wch: 30 },  // Column C - growth/additional info
    { wch: 20 },  // Column D
    { wch: 20 }   // Column E
  ];
  
  // Set row heights for better readability
  worksheet['!rows'] = [
    { hpt: 30 }, // Title row - extra tall
    { hpt: 10 }, // Space
    { hpt: 20 }, // Subtitle
    { hpt: 20 },
    { hpt: 20 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '📊 Overview');
};

// 2. SALES ANALYTICS SHEET
const createSalesAnalyticsSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  ws_data.push(['📈 DAILY SALES ANALYSIS']);
  ws_data.push([]);
  ws_data.push([`${data.cafeteriaName} • Last ${data.timeRange} Days`]);
  ws_data.push([`Report Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`]);
  ws_data.push([]);
  ws_data.push([]);
  
  // Headers
  ws_data.push(['Date', 'Day of Week', 'Total Orders', 'Total Revenue', 'Avg Order Value', 'Performance']);
  
  // Calculate overall average for comparison
  const avgDailyOrders = data.analytics.salesByDay.reduce((sum, day) => sum + day.orders, 0) / data.analytics.salesByDay.length;
  
  data.analytics.salesByDay.forEach(day => {
    const date = new Date(day.date);
    const avgOrderValue = day.orders > 0 ? day.revenue / day.orders : 0;
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Performance indicator
    let performance = '🔵 Below Average';
    if (day.orders >= avgDailyOrders * 1.2) performance = '🟢 Excellent';
    else if (day.orders >= avgDailyOrders) performance = '🟡 Above Average';
    
    ws_data.push([
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dayOfWeek,
      day.orders,
      day.revenue,
      avgOrderValue,
      performance
    ]);
  });
  
  ws_data.push([]);
  ws_data.push([
    'PERIOD TOTALS',
    '',
    data.analytics.salesByDay.reduce((sum, day) => sum + day.orders, 0),
    data.analytics.salesByDay.reduce((sum, day) => sum + day.revenue, 0),
    data.analytics.averageOrderValue,
    ''
  ]);
  
  ws_data.push([]);
  ws_data.push([]);
  ws_data.push(['💡 INSIGHTS']);
  ws_data.push([]);
  
  // Find best and worst days
  const sortedByRevenue = [...data.analytics.salesByDay].sort((a, b) => b.revenue - a.revenue);
  const bestDay = sortedByRevenue[0];
  const worstDay = sortedByRevenue[sortedByRevenue.length - 1];
  
  ws_data.push([
    '🏆 Best Day:',
    new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    `${bestDay.orders} orders`,
    `₹${bestDay.revenue.toFixed(2)} revenue`
  ]);
  ws_data.push([
    '📉 Slowest Day:',
    new Date(worstDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    `${worstDay.orders} orders`,
    `₹${worstDay.revenue.toFixed(2)} revenue`
  ]);
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 20 },  // Date
    { wch: 18 },  // Day of week
    { wch: 15 },  // Orders
    { wch: 18 },  // Revenue
    { wch: 20 },  // Avg order value
    { wch: 25 }   // Performance
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '📈 Sales Analytics');
};

// 3. TOP SELLING ITEMS SHEET
const createTopSellingItemsSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  ws_data.push(['🏅 TOP SELLING MENU ITEMS']);
  ws_data.push([]);
  ws_data.push([`Analysis Period: Last ${data.timeRange} Days`]);
  ws_data.push([`Total Items Analyzed: ${data.analytics.topSellingItems.length}`]);
  ws_data.push([]);
  ws_data.push([]);
  
  ws_data.push(['Rank', 'Item Name', 'Category', 'Units Sold', 'Total Revenue', 'Avg Price', '% of Revenue', 'Performance']);
  
  const totalRevenue = data.analytics.topSellingItems.reduce((sum, item) => sum + item.revenue, 0);
  const avgItemRevenue = totalRevenue / data.analytics.topSellingItems.length;
  
  data.analytics.topSellingItems.forEach((item, idx) => {
    const avgPrice = item.quantity > 0 ? item.revenue / item.quantity : 0;
    const revenuePercentage = totalRevenue > 0 ? (item.revenue / totalRevenue) : 0;
    
    // Medal indicators for top 3
    let rank = `${idx + 1}`;
    if (idx === 0) rank = '🥇 1st';
    else if (idx === 1) rank = '🥈 2nd';
    else if (idx === 2) rank = '🥉 3rd';
    
    // Performance indicator
    let performance = '⭐';
    if (item.revenue >= avgItemRevenue * 2) performance = '⭐⭐⭐ Star Performer';
    else if (item.revenue >= avgItemRevenue * 1.5) performance = '⭐⭐ Strong';
    else if (item.revenue >= avgItemRevenue) performance = '⭐ Good';
    
    ws_data.push([
      rank,
      item.itemName,
      item.category,
      item.quantity,
      item.revenue,
      avgPrice,
      revenuePercentage,
      performance
    ]);
  });
  
  ws_data.push([]);
  ws_data.push([]);
  ws_data.push(['💡 MENU INSIGHTS']);
  ws_data.push([]);
  ws_data.push(['Top Category:', data.analytics.topSellingItems[0]?.category || 'N/A']);
  ws_data.push(['Most Profitable Item:', data.analytics.topSellingItems[0]?.itemName || 'N/A']);
  ws_data.push(['Total Items Tracked:', data.analytics.topSellingItems.length]);
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 12 },  // Rank
    { wch: 35 },  // Item name
    { wch: 18 },  // Category
    { wch: 15 },  // Units sold
    { wch: 18 },  // Revenue
    { wch: 15 },  // Avg price
    { wch: 15 },  // % of revenue
    { wch: 25 }   // Performance
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '🏅 Top Items');
};

// 4. ORDERS DETAILS SHEET
const createOrdersDetailsSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  ws_data.push(['📋 DETAILED ORDERS REPORT']);
  ws_data.push([]);
  ws_data.push([`Partner: ${data.cafeteriaName}`]);
  ws_data.push([`Total Orders in Report: ${data.orders.length}`]);
  ws_data.push([]);
  ws_data.push([]);
  
  ws_data.push([
    'Order #',
    'Date & Time',
    'Customer',
    'Student ID',
    'Contact',
    'Status',
    'Type',
    'Items',
    'Amount',
    'Payment',
    'Time Est.',
    'Notes'
  ]);
  
  // Sort orders by date (newest first)
  const sortedOrders = [...data.orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  sortedOrders.forEach((order, idx) => {
    // Alternate row coloring will be handled by Excel
    const statusEmoji: Record<string, string> = {
      'pending': '⏳',
      'approved': '✅',
      'payment_pending': '💳',
      'declined': '❌',
      'confirmed': '✓',
      'preparing': '👨‍🍳',
      'ready': '🔔',
      'completed': '✅',
      'cancelled': '❌'
    };
    
    const emoji = statusEmoji[order.status] || '•';
    
    ws_data.push([
      order.orderNumber,
      new Date(order.createdAt).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      }),
      order.studentName || order.customerName,
      order.studentId || 'N/A',
      order.studentPhone || order.customerPhone,
      `${emoji} ${order.status.toUpperCase().replace('_', ' ')}`,
      order.deliveryType.toUpperCase(),
      order.items.length,
      order.total,
      order.paymentMethod?.toUpperCase() || 'N/A',
      order.estimatedTime,
      order.specialInstructions || '-'
    ]);
  });
  
  ws_data.push([]);
  ws_data.push([
    'SUMMARY',
    '',
    '',
    '',
    '',
    '',
    '',
    `${sortedOrders.length} orders`,
    sortedOrders.reduce((sum, o) => sum + o.total, 0),
    '',
    '',
    ''
  ]);
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 15 },  // Order #
    { wch: 20 },  // Date
    { wch: 25 },  // Customer
    { wch: 15 },  // Student ID
    { wch: 18 },  // Contact
    { wch: 18 },  // Status
    { wch: 12 },  // Type
    { wch: 10 },  // Items
    { wch: 15 },  // Amount
    { wch: 15 },  // Payment
    { wch: 15 },  // Time
    { wch: 35 }   // Notes
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '📋 Orders');
};

// 5. HOURLY ANALYSIS SHEET
const createHourlyAnalysisSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  ws_data.push(['⏱️ 24-HOUR BUSINESS ANALYSIS']);
  ws_data.push([]);
  ws_data.push([`Complete Hourly Breakdown • Last ${data.timeRange} Days`]);
  ws_data.push([`Use this data to optimize staffing and inventory`]);
  ws_data.push([]);
  ws_data.push([]);
  
  ws_data.push(['Hour', 'Total Orders', 'Total Revenue', 'Avg Order', '% of Day', 'Business Level', 'Recommendation']);
  
  const totalDailyOrders = data.analytics.hourlyDistribution.reduce((sum, h) => sum + h.orders, 0);
  const maxOrders = Math.max(...data.analytics.hourlyDistribution.map(h => h.orders));
  
  data.analytics.hourlyDistribution.forEach(hourData => {
    const avgOrderValue = hourData.orders > 0 ? hourData.revenue / hourData.orders : 0;
    const orderPercentage = totalDailyOrders > 0 ? hourData.orders / totalDailyOrders : 0;
    
    let businessLevel = '🔵 SLOW';
    let recommendation = 'Minimal staff needed';
    
    if (hourData.orders >= maxOrders * 0.7) {
      businessLevel = '🔴 PEAK';
      recommendation = 'Full staffing required';
    } else if (hourData.orders >= maxOrders * 0.4) {
      businessLevel = '🟡 MODERATE';
      recommendation = 'Standard staffing';
    }
    
    ws_data.push([
      hourData.hour,
      hourData.orders,
      hourData.revenue,
      avgOrderValue,
      orderPercentage,
      businessLevel,
      recommendation
    ]);
  });
  
  ws_data.push([]);
  ws_data.push([]);
  ws_data.push(['💡 STAFFING INSIGHTS']);
  ws_data.push([]);
  ws_data.push(['Peak Hours:', data.analytics.peakHours.join(' • ')]);
  ws_data.push(['Recommendation:', 'Schedule your best staff during peak hours for optimal service']);
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 12 },  // Hour
    { wch: 15 },  // Orders
    { wch: 18 },  // Revenue
    { wch: 15 },  // Avg order
    { wch: 15 },  // % of day
    { wch: 20 },  // Business level
    { wch: 30 }   // Recommendation
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '⏱️ Hourly');
};

// 6. STATUS BREAKDOWN SHEET
const createStatusBreakdownSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  ws_data.push(['📊 ORDER STATUS BREAKDOWN']);
  ws_data.push([]);
  ws_data.push([`Complete Status Analysis • Last ${data.timeRange} Days`]);
  ws_data.push([`Monitor order flow and identify bottlenecks`]);
  ws_data.push([]);
  ws_data.push([]);
  
  ws_data.push(['Status', 'Order Count', 'Percentage', 'Visual Progress', 'Status']);
  
  data.analytics.orderStatusBreakdown
    .sort((a, b) => b.count - a.count)
    .forEach(status => {
      const bars = '█'.repeat(Math.round(status.percentage / 5));
      const statusIcons: Record<string, string> = {
        'pending': '⏳ Awaiting Action',
        'approved': '✅ Approved',
        'payment_pending': '💳 Payment Due',
        'declined': '❌ Declined',
        'confirmed': '✓ Confirmed',
        'preparing': '👨‍🍳 In Kitchen',
        'ready': '🔔 Ready',
        'completed': '✅ Delivered',
        'cancelled': '❌ Cancelled'
      };
      
      ws_data.push([
        status.status.toUpperCase().replace('_', ' '),
        status.count,
        status.percentage / 100,
        bars,
        statusIcons[status.status] || status.status
      ]);
    });
  
  ws_data.push([]);
  ws_data.push(['TOTAL ORDERS', data.analytics.totalOrders, 1, '', '']);
  
  ws_data.push([]);
  ws_data.push([]);
  ws_data.push(['💡 OPERATIONAL INSIGHTS']);
  ws_data.push([]);
  
  const completedOrders = data.analytics.orderStatusBreakdown.find(s => s.status === 'completed');
  const cancelledOrders = data.analytics.orderStatusBreakdown.find(s => s.status === 'cancelled');
  const completionRate = completedOrders ? (completedOrders.count / data.analytics.totalOrders * 100).toFixed(1) : 0;
  const cancellationRate = cancelledOrders ? (cancelledOrders.count / data.analytics.totalOrders * 100).toFixed(1) : 0;
  
  ws_data.push(['Completion Rate:', `${completionRate}%`, completedOrders?.count || 0, 'completed orders']);
  ws_data.push(['Cancellation Rate:', `${cancellationRate}%`, cancelledOrders?.count || 0, 'cancelled orders']);
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 20 },  // Status
    { wch: 15 },  // Count
    { wch: 15 },  // Percentage
    { wch: 35 },  // Visual
    { wch: 25 }   // Status description
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '📊 Status');
};

// 7. MENU PERFORMANCE SHEET
const createMenuPerformanceSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  ws_data.push(['🍽️ COMPLETE MENU PERFORMANCE']);
  ws_data.push([]);
  ws_data.push([`${data.cafeteriaName} • Full Menu Catalog`]);
  ws_data.push([`Total Items: ${data.menuItems.length} | Active: ${data.menuItems.filter(m => m.available).length}`]);
  ws_data.push([]);
  ws_data.push([]);
  
  ws_data.push([
    'Item Name',
    'Category',
    'Price',
    'Status',
    'Rating',
    'Reviews',
    'Prep Time',
    'Calories',
    'Meal Times',
    'Availability'
  ]);
  
  data.menuItems
    .sort((a, b) => b.rating - a.rating)
    .forEach(item => {
      const statusIcon = item.available ? '✅ ACTIVE' : '❌ INACTIVE';
      const ratingStars = '⭐'.repeat(Math.round(item.rating));
      
      ws_data.push([
        item.name,
        item.category,
        item.price,
        statusIcon,
        `${item.rating.toFixed(1)} ${ratingStars}`,
        item.reviewCount,
        item.prepTime,
        item.calories || 'N/A',
        item.mealTimes?.join(', ') || 'All Day',
        item.available ? '✓ Available' : '✗ Out of Stock'
      ]);
    });
  
  ws_data.push([]);
  ws_data.push([]);
  ws_data.push(['📊 MENU STATISTICS']);
  ws_data.push([]);
  ws_data.push(['Total Menu Items:', data.menuItems.length]);
  ws_data.push(['Active Items:', data.menuItems.filter(m => m.available).length]);
  ws_data.push(['Inactive Items:', data.menuItems.filter(m => !m.available).length]);
  ws_data.push(['Average Rating:', (data.menuItems.reduce((sum, m) => sum + m.rating, 0) / data.menuItems.length).toFixed(2)]);
  ws_data.push(['Average Price:', `₹${(data.menuItems.reduce((sum, m) => sum + m.price, 0) / data.menuItems.length).toFixed(2)}`]);
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 35 },  // Item name
    { wch: 18 },  // Category
    { wch: 12 },  // Price
    { wch: 15 },  // Status
    { wch: 20 },  // Rating
    { wch: 12 },  // Reviews
    { wch: 15 },  // Prep time
    { wch: 12 },  // Calories
    { wch: 25 },  // Meal times
    { wch: 18 }   // Availability
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '🍽️ Menu');
};

// 8. CUSTOMER INSIGHTS SHEET
const createCustomerInsightsSheet = (workbook: XLSX.WorkBook, data: ExportData) => {
  const ws_data: any[][] = [];
  
  ws_data.push(['👥 CUSTOMER INSIGHTS & SEGMENTS']);
  ws_data.push([]);
  ws_data.push([`${data.cafeteriaName} • Customer Behavior Analysis`]);
  ws_data.push([`Last ${data.timeRange} Days • ${data.orders.length} Total Orders`]);
  ws_data.push([]);
  ws_data.push([]);
  
  // Aggregate customer data
  const customerMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    orderCount: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrderDate: Date;
  }>();
  
  data.orders.forEach(order => {
    const key = order.studentEmail || order.customerPhone;
    if (!key) return;
    
    const existing = customerMap.get(key) || {
      name: order.studentName || order.customerName,
      email: order.studentEmail || '',
      phone: order.studentPhone || order.customerPhone,
      orderCount: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrderDate: new Date(order.createdAt)
    };
    
    existing.orderCount += 1;
    existing.totalSpent += order.total;
    if (new Date(order.createdAt) > existing.lastOrderDate) {
      existing.lastOrderDate = new Date(order.createdAt);
    }
    
    customerMap.set(key, existing);
  });
  
  // Calculate avg order values
  customerMap.forEach((customer, key) => {
    customer.avgOrderValue = customer.totalSpent / customer.orderCount;
    customerMap.set(key, customer);
  });
  
  ws_data.push(['📊 TOP CUSTOMERS BREAKDOWN']);
  ws_data.push([]);
  ws_data.push(['Customer Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Avg Order', 'Last Order', 'Tier']);
  
  const sortedCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent);
  
  sortedCustomers.forEach((customer, index) => {
    let customerTier = '';
    if (customer.orderCount >= 20) customerTier = '💎 VIP';
    else if (customer.orderCount >= 10) customerTier = '⭐ LOYAL';
    else if (customer.orderCount >= 5) customerTier = '👍 REGULAR';
    else customerTier = '🆕 NEW';
    
    const daysSinceLastOrder = Math.floor((Date.now() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
    const activity = daysSinceLastOrder <= 7 ? ' 🟢' : daysSinceLastOrder <= 30 ? ' 🟡' : ' 🔴';
    
    ws_data.push([
      (index < 3 ? ['🥇', '🥈', '🥉'][index] + ' ' : '') + customer.name,
      customer.email || '-',
      customer.phone,
      customer.orderCount,
      `₹${customer.totalSpent.toFixed(2)}`,
      `₹${customer.avgOrderValue.toFixed(2)}`,
      customer.lastOrderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + activity,
      customerTier
    ]);
  });
  
  ws_data.push([]);
  ws_data.push([]);
  ws_data.push(['💡 CUSTOMER SEGMENT INSIGHTS']);
  ws_data.push([]);
  
  const vipCount = sortedCustomers.filter(c => c.orderCount >= 20).length;
  const loyalCount = sortedCustomers.filter(c => c.orderCount >= 10 && c.orderCount < 20).length;
  const regularCount = sortedCustomers.filter(c => c.orderCount >= 5 && c.orderCount < 10).length;
  const newCount = sortedCustomers.filter(c => c.orderCount < 5).length;
  
  const vipRevenue = sortedCustomers.filter(c => c.orderCount >= 20).reduce((sum, c) => sum + c.totalSpent, 0);
  const totalRevenue = sortedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const vipPercentage = totalRevenue > 0 ? (vipRevenue / totalRevenue * 100) : 0;
  
  const avgLifetimeValue = totalRevenue / customerMap.size;
  const avgOrdersPerCustomer = sortedCustomers.reduce((sum, c) => sum + c.orderCount, 0) / customerMap.size;
  
  const activeCount = sortedCustomers.filter(c => {
    const days = Math.floor((Date.now() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
    return days <= 7;
  }).length;
  
  ws_data.push(['Total Unique Customers:', customerMap.size]);
  ws_data.push([]);
  ws_data.push(['💎 VIP Customers (20+ orders):', vipCount, `${vipPercentage.toFixed(1)}% of revenue`]);
  ws_data.push(['⭐ Loyal Customers (10-19 orders):', loyalCount]);
  ws_data.push(['👍 Regular Customers (5-9 orders):', regularCount]);
  ws_data.push(['🆕 New Customers (1-4 orders):', newCount]);
  ws_data.push([]);
  ws_data.push(['🟢 Active (Last 7 Days):', activeCount]);
  ws_data.push(['Average Lifetime Value:', `₹${avgLifetimeValue.toFixed(2)}`]);
  ws_data.push(['Average Orders per Customer:', avgOrdersPerCustomer.toFixed(1)]);
  ws_data.push([]);
  ws_data.push(['🎯 RECOMMENDATION:', 'Focus on converting Regular customers to Loyal tier with targeted promotions']);
  
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 25 },  // Customer name
    { wch: 30 },  // Email
    { wch: 15 },  // Phone
    { wch: 12 },  // Orders
    { wch: 18 },  // Total spent
    { wch: 18 },  // Avg order
    { wch: 20 },  // Last order
    { wch: 18 }   // Tier
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '👥 Customers');
};
