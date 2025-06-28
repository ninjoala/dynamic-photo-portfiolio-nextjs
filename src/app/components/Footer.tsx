'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaFacebook, FaTiktok, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const socialLinks = [
    {
      href: 'https://www.instagram.com/nickdobos_photo/',
      icon: FaInstagram,
      label: 'Instagram',
      ariaLabel: 'Visit our Instagram profile'
    },
    {
      href: 'https://www.facebook.com/p/Nicholas-Dobos-Photography-61550320203022/',
      icon: FaFacebook,
      label: 'Facebook',
      ariaLabel: 'Visit our Facebook page'
    },
    {
      href: 'https://www.tiktok.com/@nickdobosphotography',
      icon: FaTiktok,
      label: 'TikTok',
      ariaLabel: 'Visit our TikTok profile'
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image 
                src="/logo.png" 
                alt="Nick Dobos Media Logo" 
                width={40} 
                height={40}
              />
              <span className="ml-3 text-xl font-semibold">Nick Dobos Media</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Capturing life&apos;s precious moments through professional photography. 
              Specializing in real estate, events, family portraits, and sports photography.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                    aria-label={social.ariaLabel}
                  >
                    <IconComponent className="text-2xl" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-gray-400 text-sm" />
                <a 
                  href="tel:+16788506600"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  +1 (678) 850-6600
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-gray-400 text-sm" />
                <a 
                  href="mailto:nick@nickdobosmedia.com"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  nick@nickdobosmedia.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-gray-400 text-sm" />
                <span className="text-gray-300">
                  Newnan, Georgia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} Nick Dobos Media. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}