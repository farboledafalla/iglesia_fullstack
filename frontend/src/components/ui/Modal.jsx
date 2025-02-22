import React from 'react';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children }) => {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
         <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div
               className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
               onClick={onClose}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
               <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                     type="button"
                     className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                     onClick={onClose}
                  >
                     <span className="sr-only">Cerrar</span>
                     <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
               </div>

               <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                     <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {title}
                     </h3>
                     <div className="mt-4">{children}</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Modal; 