'use client';

import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">Let's discuss your photography needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-light mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-light mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <FaPhone className="text-xl text-gray-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <FaEnvelope className="text-xl text-gray-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contact@yourphotography.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <FaMapMarkerAlt className="text-xl text-gray-600" />
                  <div>
                    <p className="font-medium">Studio Location</p>
                    <p className="text-gray-600">123 Photography Street</p>
                    <p className="text-gray-600">New York, NY 10001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-light mb-6">Follow Us</h2>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-black transition-colors duration-300">
                  <FaInstagram className="text-3xl" />
                </a>
                <a href="#" className="text-gray-600 hover:text-black transition-colors duration-300">
                  <FaFacebook className="text-3xl" />
                </a>
                <a href="#" className="text-gray-600 hover:text-black transition-colors duration-300">
                  <FaTwitter className="text-3xl" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-light mb-6">Business Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 