"use client";

import React, { memo, useState } from 'react';
import { ShoppingBag, Truck, Clock, ArrowRight, Zap, MapPin, Calendar } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const DeliveryMethods = memo(() => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const methods = [
    {
      icon: ShoppingBag,
      title: "Pickup",
      desc: "Skip the line, grab & go.",
      detail: "Ready in 5-10 minutes",
      gradient: "from-blue-500 to-cyan-500",
      color: "text-blue-600 dark:text-blue-400",
      bgGlow: "bg-blue-500/10",
      hoverGlow: "group-hover:shadow-blue-500/50",
      badge: "Fastest",
      decorIcon: Zap
    },
    {
      icon: Truck,
      title: "To Building",
      desc: "We bring it to your class.",
      detail: "Delivered to your door",
      gradient: "from-orange-500 to-red-500",
      color: "text-orange-600 dark:text-orange-400",
      bgGlow: "bg-orange-500/10",
      hoverGlow: "group-hover:shadow-orange-500/50",
      badge: "Popular",
      decorIcon: MapPin
    },
    {
      icon: Clock,
      title: "Schedule",
      desc: "Pre-order for break time.",
      detail: "Perfect timing guaranteed",
      gradient: "from-green-500 to-emerald-500",
      color: "text-green-600 dark:text-green-400",
      bgGlow: "bg-green-500/10",
      hoverGlow: "group-hover:shadow-green-500/50",
      badge: "Smart",
      decorIcon: Calendar
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900 overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/5 dark:bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-400/5 to-orange-400/5 dark:from-red-400/10 dark:to-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header with Animation */}
        <div className="text-center mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 rounded-full mb-6 backdrop-blur-sm border border-red-200 dark:border-red-800">
              <Zap size={16} className="text-red-600 dark:text-red-400 animate-pulse" />
              <span className="text-sm font-bold text-red-600 dark:text-red-400">Choose Your Way</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-red-600 to-orange-600 dark:from-white dark:via-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                Choose Your Method
              </span>
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <p className="text-gray-600 dark:text-gray-400 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
              Flexible delivery options that fit your <span className="text-red-600 dark:text-red-400 font-black">schedule</span>
            </p>
          </ScrollReveal>
        </div>
        
        {/* Methods Grid with Enhanced Animations */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {methods.map((method, i) => {
            const Icon = method.icon;
            const DecorIcon = method.decorIcon;
            const isHovered = hoveredIndex === i;
            
            return (
              <ScrollReveal key={i} delay={i * 150}>
                <div 
                  className="group relative h-full"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Card */}
                  <div className={`
                    relative h-full p-8 rounded-[2.5rem] 
                    bg-white dark:bg-gray-800/50 backdrop-blur-sm
                    border-2 border-gray-200 dark:border-gray-700
                    hover:border-transparent
                    shadow-lg hover:shadow-2xl ${method.hoverGlow}
                    transition-all duration-500 ease-out
                    hover:-translate-y-3 hover:scale-[1.02]
                    cursor-pointer overflow-hidden
                  `}>
                    {/* Gradient Border on Hover */}
                    <div className={`
                      absolute inset-0 rounded-[2.5rem] p-[2px] 
                      bg-gradient-to-br ${method.gradient}
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-500
                      -z-10
                    `}>
                      <div className="w-full h-full bg-white dark:bg-gray-800 rounded-[2.4rem]"></div>
                    </div>

                    {/* Badge */}
                    <div className={`
                      absolute top-6 right-6 px-3 py-1 
                      bg-gradient-to-r ${method.gradient}
                      text-white text-xs font-black rounded-full
                      transform translate-x-20 group-hover:translate-x-0
                      opacity-0 group-hover:opacity-100
                      transition-all duration-500
                    `}>
                      {method.badge}
                    </div>

                    {/* Decorative Icon */}
                    <div className={`
                      absolute top-6 left-6 
                      ${method.color}
                      transform -translate-x-20 group-hover:translate-x-0
                      opacity-0 group-hover:opacity-20
                      transition-all duration-500
                    `}>
                      <DecorIcon size={80} strokeWidth={1} />
                    </div>

                    {/* Main Icon with Animation */}
                    <div className="relative mb-8 flex justify-center">
                      <div className={`
                        relative w-24 h-24 rounded-3xl 
                        bg-gradient-to-br ${method.gradient}
                        flex items-center justify-center
                        transform group-hover:rotate-[360deg] group-hover:scale-110
                        transition-all duration-700 ease-out
                        shadow-lg group-hover:shadow-2xl
                      `}>
                        {/* Pulse Effect */}
                        <div className={`
                          absolute inset-0 rounded-3xl 
                          bg-gradient-to-br ${method.gradient}
                          animate-ping
                          opacity-0 group-hover:opacity-30
                        `}></div>
                        
                        <Icon 
                          size={40} 
                          className="text-white relative z-10 transform group-hover:scale-110 transition-transform duration-300" 
                          strokeWidth={2.5}
                        />
                      </div>

                      {/* Orbiting Dots */}
                      <div className={`
                        absolute inset-0 
                        ${isHovered ? 'animate-spin' : ''}
                        transition-all duration-1000
                      `} style={{ animationDuration: '3s' }}>
                        <div className={`absolute top-0 left-1/2 w-2 h-2 bg-gradient-to-r ${method.gradient} rounded-full -translate-x-1/2`}></div>
                        <div className={`absolute bottom-0 left-1/2 w-2 h-2 bg-gradient-to-r ${method.gradient} rounded-full -translate-x-1/2`}></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center space-y-4">
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                        {method.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                        {method.desc}
                      </p>

                      {/* Detail Text with Slide Animation */}
                      <div className={`
                        flex items-center justify-center gap-2 text-sm font-bold
                        ${method.color}
                        transform translate-y-4 opacity-0
                        group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-500 delay-100
                      `}>
                        <div className="w-1 h-1 rounded-full bg-current animate-pulse"></div>
                        <span>{method.detail}</span>
                        <div className="w-1 h-1 rounded-full bg-current animate-pulse"></div>
                      </div>

                      {/* CTA Button */}
                      <div className={`
                        pt-4
                        transform translate-y-4 opacity-0
                        group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-500 delay-200
                      `}>
                        <button className={`
                          inline-flex items-center gap-2 px-6 py-3 
                          bg-gradient-to-r ${method.gradient}
                          text-white font-bold rounded-2xl
                          hover:shadow-lg hover:scale-105
                          transition-all duration-300
                        `}>
                          Select
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>

                    {/* Animated Background Glow */}
                    <div className={`
                      absolute -bottom-10 -right-10 w-40 h-40 
                      ${method.bgGlow}
                      rounded-full blur-3xl
                      transform scale-0 group-hover:scale-150
                      transition-transform duration-700
                    `}></div>
                    
                    <div className={`
                      absolute -top-10 -left-10 w-40 h-40 
                      ${method.bgGlow}
                      rounded-full blur-3xl
                      transform scale-0 group-hover:scale-150
                      transition-transform duration-700 delay-100
                    `}></div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
});

DeliveryMethods.displayName = 'DeliveryMethods';

export default DeliveryMethods;
