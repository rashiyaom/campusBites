"use client";

import React from 'react';
import { Utensils, ChevronRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-20 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-red-500 p-2 rounded-xl text-white">
                <Utensils size={24} strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-black tracking-tighter">
                Campus<span className="text-red-500">Bite</span>
              </span>
            </div>
            <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
              Feeding the minds of tomorrow. We bridge the gap between "I'm hungry" and "I have a deadline".
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'Facebook', 'TikTok'].map((social) => (
                <a key={social} href="#" className="w-12 h-12 rounded-full bg-gray-800 hover:bg-red-600 transition-all flex items-center justify-center group">
                  <span className="text-sm font-bold group-hover:scale-110 transition-transform">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Explore</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Cafeterias</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Today's Specials</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Meal Plans</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Group Orders</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Support</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-red-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Become a Runner</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Suggest a Restaurant</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div>© {new Date().getFullYear()} CampusBite Inc. Made with ❤️ and 🍕.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-white">Privacy</a>
             <a href="#" className="hover:text-white">Terms</a>
             <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
      
      {/* Decorative Footer Elements */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
    </footer>
  );
};

export default Footer;
