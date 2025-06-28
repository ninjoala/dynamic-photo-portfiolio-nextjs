'use client';

import { useState } from 'react';
import { FaPhone, FaEnvelope, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatus('loading');
      setErrorMessage('');
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Let&apos;s discuss your photography needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-light mb-6 text-gray-900">Send a Message</h2>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                Message sent successfully!
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-gray-900"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-light mb-6 text-gray-900">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <FaPhone className="text-xl text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+1 (678) 850-6600</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <FaEnvelope className="text-xl text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">nick@nickdobosmedia.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-light mb-6 text-gray-900">Follow Us</h2>
              <div className="flex space-x-6">
                <a href="https://www.instagram.com/nickdobos_photo/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  <FaInstagram className="text-3xl" />
                </a>
                <a href="https://www.facebook.com/p/Nicholas-Dobos-Photography-61550320203022/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  <FaFacebook className="text-3xl" />
                </a>
                <a href="https://www.tiktok.com/@nickdobosphotography" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  <FaTiktok className="text-3xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
