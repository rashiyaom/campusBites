"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, PlusCircle, BarChart3, Settings } from 'lucide-react';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

const ActionButton = ({ icon, label, description, color, onClick }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all text-left group"
    >
      <div className={`p-3 rounded-xl ${color} mb-4 inline-block group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
        {label}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </button>
  );
};

const QuickActions = () => {
  const router = useRouter();

  const actions = [
    {
      icon: <Menu size={24} className="text-blue-600" strokeWidth={2.5} />,
      label: 'Manage Menu',
      description: 'Add, edit, or remove menu items',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: () => router.push('/partner/menu')
    },
    {
      icon: <PlusCircle size={24} className="text-green-600" strokeWidth={2.5} />,
      label: 'Add New Item',
      description: 'Quickly add a new dish to your menu',
      color: 'bg-green-50 dark:bg-green-900/20',
      onClick: () => router.push('/partner/menu/new')
    },
    {
      icon: <BarChart3 size={24} className="text-purple-600" strokeWidth={2.5} />,
      label: 'View Analytics',
      description: 'Check detailed business insights',
      color: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: () => router.push('/partner/analytics')
    },
    {
      icon: <Settings size={24} className="text-gray-600" strokeWidth={2.5} />,
      label: 'Settings',
      description: 'Manage your account and preferences',
      color: 'bg-gray-50 dark:bg-gray-800',
      onClick: () => router.push('/partner/settings')
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <ActionButton key={index} {...action} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
