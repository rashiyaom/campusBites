"use client";

import React, { useState, useMemo } from 'react';
import { 
  BusinessType, 
  Product, 
  MealTime,
  ProductUnit,
  CATEGORY_MAP,
  PRODUCT_FORM_FIELDS,
  BUSINESS_UI_CONFIG,
  getBusinessTypeLabel,
  ProductFormField
} from '@/types/business';

// ============================================
// TYPES
// ============================================

interface ProductFormProps {
  businessId: string;
  businessType: BusinessType;
  initialData?: Partial<Product>;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

// ============================================
// HELPER DATA
// ============================================

const MEAL_TIME_OPTIONS: { value: MealTime; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'all-day', label: 'All Day' }
];

// ============================================
// COMPONENT
// ============================================

export default function ProductForm({
  businessId,
  businessType,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}: ProductFormProps) {
  // Get field configuration for this business type
  const formFields = PRODUCT_FORM_FIELDS[businessType];
  const uiConfig = BUSINESS_UI_CONFIG[businessType];
  const categories = CATEGORY_MAP[businessType];
  
  // ==========================================
  // STATE
  // ==========================================
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: categories[0] || '',
    image: '',
    isAvailable: true,
    isVeg: true,
    unit: 'piece',
    businessId: businessId,
    tags: [],
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedMealTimes, setSelectedMealTimes] = useState<MealTime[]>(
    initialData?.mealTimes || ['all-day']
  );
  const [ingredientsInput, setIngredientsInput] = useState<string>(
    initialData?.ingredients?.join(', ') || ''
  );
  const [allergensInput, setAllergensInput] = useState<string>(
    initialData?.allergens?.join(', ') || ''
  );
  const [customizationInput, setCustomizationInput] = useState<string>(
    initialData?.customizationOptions?.join(', ') || ''
  );

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'date') {
      setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleMealTimeChange = (mealTime: MealTime) => {
    setSelectedMealTimes(prev => {
      if (prev.includes(mealTime)) {
        return prev.filter(mt => mt !== mealTime);
      } else {
        return [...prev, mealTime];
      }
    });
  };
  
  const handleToggle = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name as keyof Product] }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields based on field config
    formFields.forEach(field => {
      if (field.required) {
        const value = formData[field.name as keyof Product];
        if (value === undefined || value === '' || value === null) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });
    
    // Price validation
    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    // Stock validation for non-food
    if (businessType !== 'food' && formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = 'Stock must be a non-negative number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Parse comma-separated inputs
    const ingredients = ingredientsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const allergens = allergensInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const customizationOptions = customizationInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData as any,
      businessId,
      mealTimes: businessType === 'food' ? selectedMealTimes : undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
      customizationOptions: customizationOptions.length > 0 ? customizationOptions : undefined,
      rating: formData.rating || 0,
      reviewCount: formData.reviewCount || 0
    };
    
    onSubmit(productData);
  };

  // ==========================================
  // RENDER FIELD
  // ==========================================
  
  const renderField = (field: ProductFormField) => {
    const baseInputClass = `w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 
      ${errors[field.name] 
        ? 'border-red-500 focus:ring-red-200' 
        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-200 focus:border-orange-500'
      }
      bg-white dark:bg-gray-800 text-gray-900 dark:text-white`;
    
    // Special handling for category - inject options from CATEGORY_MAP
    const fieldOptions = field.name === 'category' 
      ? categories.map(cat => ({ value: cat, label: cat }))
      : field.options;
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name as keyof Product] as string || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            rows={3}
            className={baseInputClass}
          />
        );
        
      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name as keyof Product] as string || ''}
            onChange={handleChange}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {fieldOptions?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
        
      case 'multiselect':
        if (field.name === 'mealTimes') {
          return (
            <div className="flex flex-wrap gap-2">
              {MEAL_TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleMealTimeChange(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedMealTimes.includes(opt.value)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          );
        }
        return null;
        
      case 'toggle':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => handleToggle(field.name)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData[field.name as keyof Product] ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData[field.name as keyof Product] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              {formData[field.name as keyof Product] ? 'Yes' : 'No'}
            </span>
          </label>
        );
        
      case 'date':
        const dateValue = formData[field.name as keyof Product];
        const formattedDate = dateValue instanceof Date 
          ? dateValue.toISOString().split('T')[0]
          : '';
        return (
          <input
            type="date"
            name={field.name}
            value={formattedDate}
            onChange={handleChange}
            className={baseInputClass}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={formData[field.name as keyof Product] as number ?? ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            min={0}
            step={field.name === 'price' || field.name === 'mrp' ? 0.01 : 1}
            className={baseInputClass}
          />
        );
        
      default: // text type
        // Handle comma-separated input fields
        if (field.name === 'ingredients') {
          return (
            <input
              type="text"
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClass}
            />
          );
        }
        if (field.name === 'allergens') {
          return (
            <input
              type="text"
              value={allergensInput}
              onChange={(e) => setAllergensInput(e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClass}
            />
          );
        }
        if (field.name === 'customizationOptions') {
          return (
            <input
              type="text"
              value={customizationInput}
              onChange={(e) => setCustomizationInput(e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClass}
            />
          );
        }
        
        return (
          <input
            type="text"
            name={field.name}
            value={formData[field.name as keyof Product] as string || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  
  const productLabel = businessType === 'food' ? 'Item' : 'Product';
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit' : 'Add New'} {productLabel}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-2">{uiConfig.icon}</span>
          {uiConfig.label} • Fill in the details below
        </p>
      </div>
      
      {/* Image Preview & Upload */}
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
          {formData.image ? (
            <img 
              src={formData.image} 
              alt="Product" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
              {uiConfig.icon}
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="text"
            name="image"
            value={formData.image || ''}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste an image URL from the web
          </p>
        </div>
      </div>
      
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map(field => (
          <div 
            key={field.name}
            className={`
              ${field.type === 'textarea' ? 'md:col-span-2' : ''}
              ${field.type === 'multiselect' ? 'md:col-span-2' : ''}
            `}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {renderField(field)}
            
            {field.helperText && field.type !== 'toggle' && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {field.helperText}
              </p>
            )}
            
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2.5 rounded-lg bg-gradient-to-r ${uiConfig.gradientFrom} ${uiConfig.gradientTo} text-white font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg`}
        >
          {isEditing ? 'Update' : 'Add'} {productLabel}
        </button>
      </div>
    </form>
  );
}
