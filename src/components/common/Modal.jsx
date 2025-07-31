import React, { useEffect, useRef } from "react";

export default function Modal({
                                  isOpen,
                                  onClose,
                                  onConfirm,
                                  title,
                                  children,
                                  confirmText = "Confirmar",
                                  showConfirmButton,
                                  cancelText = "Cancelar"
                              }) {
    
    const modalRef = useRef(null);
    
    // Efecto para bloquear/desbloquear el scroll del body
    useEffect(() => {
        if (isOpen) {
            // Guardar la posición actual del scroll
            const scrollY = window.scrollY;
            
            // Bloquear scroll del body usando Tailwind classes
            document.body.classList.add('overflow-hidden', 'fixed', 'inset-0');
            document.body.style.top = `-${scrollY}px`;
            
            // Limpiar al desmontar o cuando se cierre la modal
            return () => {
                document.body.classList.remove('overflow-hidden', 'fixed', 'inset-0');
                document.body.style.top = '';
                // Restaurar la posición del scroll
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Cerrar modal con Escape
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onClose]);

    // Cerrar modal al hacer clic fuera de ella
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                {title && (
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-wrap flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                        {cancelText}
                    </button>
                    {showConfirmButton && (
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
