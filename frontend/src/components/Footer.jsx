import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="container mx-auto text-center">
        <p>© {new Date().getFullYear()} Ichigo. All rights reserved.</p>
        <p className="text-gray-400 text-sm mt-2">
          Built with ❤️ using React & Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
