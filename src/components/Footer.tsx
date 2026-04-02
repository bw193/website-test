import React from 'react';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-amber-600" />
              <span className="font-bold text-xl tracking-wide">BOLEN</span>
            </div>
            <p className="text-stone-400 text-sm">
              Jiaxing Chengtai Mirror Co., Ltd.<br/>
              Premium mirror manufacturer and exporter. Supplying high-quality, modern vanity mirrors to businesses worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-amber-500">Contact</h3>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> sales@bolen.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Jiaxing, Zhejiang, China</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-amber-500">Quick Links</h3>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li><a href="/products" className="hover:text-white transition-colors">Product Catalog</a></li>
              <li><a href="/#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Export</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-800 pt-8 text-center text-sm text-stone-500">
          &copy; {new Date().getFullYear()} Jiaxing Chengtai Mirror Co., Ltd. (Brand: BOLEN). All rights reserved.
        </div>
      </div>
    </footer>
  );
}
