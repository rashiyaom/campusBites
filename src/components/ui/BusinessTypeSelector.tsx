"use client";

import React from 'react';
import { 
  BusinessType, 
  BUSINESS_UI_CONFIG 
} from '@/types/business';

// ============================================
// TYPES
// ============================================

interface BusinessTypeSelectorProps {
  selectedType: BusinessType | 'all';
  onSelect: (type: BusinessType | 'all') => void;
  showAllOption?: boolean;
  variant?: 'pills' | 'cards' | 'tabs' | 'dropdown';
  className?: string;
}

// ============================================
// ALL BUSINESS TYPES
// ============================================

const BUSINESS_TYPES: BusinessType[] = ['food', 'grocery', 'stationery', 'daily_essentials'];

// ============================================
// COMPONENT
// ============================================

export default function BusinessTypeSelector({
  selectedType,
  onSelect,
  showAllOption = false,
  variant = 'pills',
  className = ''
}: BusinessTypeSelectorProps) {
  
  // ==========================================
  // PILLS VARIANT
  // ==========================================
  
  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {showAllOption && (
          <button
            onClick={() => onSelect('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedType === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            🏪 All Categories
          </button>
        )}
        {BUSINESS_TYPES.map(type => {
          const config = BUSINESS_UI_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedType === type
                  ? `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white shadow-md`
                  : `${config.bgColor} ${config.color} hover:opacity-80`
              }`}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
  
  // ==========================================
  // CARDS VARIANT
  // ==========================================
  
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {showAllOption && (
          <button
            onClick={() => onSelect('all')}
            className={`p-4 rounded-xl text-center transition-all ${
              selectedType === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-102 hover:shadow-md'
            }`}
          >
            <div className="text-3xl mb-2">🏪</div>
            <div className="font-medium">All</div>
            <div className="text-xs opacity-70">Browse everything</div>
          </button>
        )}
        {BUSINESS_TYPES.map(type => {
          const config = BUSINESS_UI_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedType === type
                  ? `bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} text-white shadow-lg scale-105`
                  : `${config.bgColor} ${config.color} hover:scale-102 hover:shadow-md`
              }`}
            >
              <div className="text-3xl mb-2">{config.icon}</div>
              <div className="font-medium">{config.label}</div>
              <div className={`text-xs ${selectedType === type ? 'text-white/80' : 'opacity-70'}`}>
                {config.description.slice(0, 30)}...
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  
  // ==========================================
  // TABS VARIANT
  // ==========================================
  
  if (variant === 'tabs') {
    return (
      <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {showAllOption && (
            <button
              onClick={() => onSelect('all')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                selectedType === 'all'
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              🏪 All
            </button>
          )}
          {BUSINESS_TYPES.map(type => {
            const config = BUSINESS_UI_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  selectedType === type
                    ? `border-current ${config.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  
  // ==========================================
  // DROPDOWN VARIANT
  // ==========================================
  
  if (variant === 'dropdown') {
    const currentConfig = selectedType !== 'all' ? BUSINESS_UI_CONFIG[selectedType] : null;
    
    return (
      <div className={`relative ${className}`}>
        <select
          value={selectedType}
          onChange={(e) => onSelect(e.target.value as BusinessType | 'all')}
          className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 cursor-pointer"
        >
          {showAllOption && (
            <option value="all">🏪 All Categories</option>
          )}
          {BUSINESS_TYPES.map(type => {
            const config = BUSINESS_UI_CONFIG[type];
            return (
              <option key={type} value={type}>
                {config.icon} {config.label}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
  
  return null;
}

// ============================================
// MINI SELECTOR (for compact spaces)
// ============================================

export function BusinessTypeMiniSelector({
  selectedType,
  onSelect,
  className = ''
}: Omit<BusinessTypeSelectorProps, 'variant' | 'showAllOption'>) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {BUSINESS_TYPES.map(type => {
        const config = BUSINESS_UI_CONFIG[type];
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-2 rounded-lg text-xl transition-all ${
              selectedType === type
                ? `${config.bgColor} scale-110`
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={config.label}
          >
            {config.icon}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// CATEGORY BADGE
// ============================================

export function BusinessTypeBadge({ 
  type, 
  size = 'md' 
}: { 
  type: BusinessType; 
  size?: 'sm' | 'md' | 'lg' 
}) {
  const config = BUSINESS_UI_CONFIG[type];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${config.bgColor} ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      <span className="font-medium">{config.label}</span>
    </span>
  );
}
