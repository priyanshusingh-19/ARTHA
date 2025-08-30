// src/pages/Contact.jsx
import React, { useState } from 'react'; // NEW: useState
import { useTheme } from '../context/ThemeContext';

function Contact() {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState(''); // NEW: state for form fields
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false); // NEW: state for submission status

  const handleSubmit = (e) => {
    e.preventDefault();
    // This is a MOCK submission. In a real app, you'd send this data to a backend API.
    console.log({ name, email, message });
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    // You could also add a timer to hide the submitted message after a few seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"> {/* Enhanced hover effect */}
        <h2 className="text-4xl font-extrabold mb-6 text-center text-blue-600 dark:text-blue-400">Get in Touch!</h2> {/* Enhanced heading */}
        <p className="text-lg leading-relaxed mb-6 text-center font-light">
          We'd love to hear from you! Please fill out the form below or reach us through the provided channels.
        </p>

        {/* Contact Form */}
        <div className="mb-8">
          {submitted ? (
            <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-4 rounded-md text-center text-lg font-semibold animate-pulse">
              Message Sent! We'll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contactName" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Your Name</label>
                <input
                  type="text"
                  id="contactName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Your Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label htmlFor="contactMessage" className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Your Message</label>
                <textarea
                  id="contactMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline resize-y"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transform transition-all duration-200 hover:scale-[1.01]"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Other Contact Channels */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Other Ways to Connect:</h3>
          <p className="text-xl font-semibold">Email Support:</p>
          <a href="mailto:support@artha.com" className="text-blue-600 dark:text-blue-400 hover:underline text-lg mb-4 block">support@artha.com</a>

          <p className="text-xl font-semibold mt-4">Follow Us On:</p>
          <div className="flex justify-center space-x-6 text-blue-600 dark:text-blue-400 text-3xl mt-2"> {/* Larger icons */}
            {/* Note: For actual social media icons, you might need to install a library like FontAwesome. */}
            {/* For now, text links or simple unicode characters can suffice if icons are not installed. */}
            <a href="https://twitter.com/artha_app" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 dark:hover:text-blue-300">
              Twitter
            </a>
            <a href="https://facebook.com/artha_app" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 dark:hover:text-blue-300">
              Facebook
            </a>
            <a href="https://instagram.com/artha_app" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 dark:hover:text-blue-300">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;