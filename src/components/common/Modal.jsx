import React from "react";

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}

                <div>{children}</div>

                <div className="mt-6 flex justify-end gap-3 flex-wrap">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                    >
                        {cancelText}
                    </button>
                    {showConfirmButton && (
                        <button
                            onClick={onConfirm}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
