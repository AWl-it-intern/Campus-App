// import React from 'react'; 
import { X } from 'lucide-react';

/**
 * Reusable Modal Component
 * Generic modal wrapper with header, body, and footer
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Close handler function
 * @param {string} title - Modal title
 * @param {string} subtitle - Optional subtitle
 * @param {ReactNode} children - Modal body content
 * @param {ReactNode} footer - Optional footer content
 * @param {string} headerBgColor - Background color for header
 * @param {string} footerBgColor - Background color for footer
 * @param {string} maxWidth - Max width class (default: max-w-2xl)
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer,
  headerBgColor = '#003329',
  footerBgColor,
  maxWidth = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[80vh] overflow-hidden`}>
        {/* Header */}
        <div 
          className="p-6 text-white"
          style={{ backgroundColor: headerBgColor }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{title}</h3>
              {subtitle && (
                <p className="text-sm opacity-90 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-96">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div 
            className="p-6 border-t border-gray-200"
            style={{ backgroundColor: footerBgColor }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
