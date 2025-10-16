import React, { useState } from 'react';
import Modal from './Modal';

export default function PaymentModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    requestData,
    isLoading = false 
}) {
    const [formData, setFormData] = useState({
        mobilePaymentReference: '',
        paymentImage: null
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    paymentImage: 'Solo se permiten archivos de imagen (JPG, PNG, WEBP)'
                }));
                return;
            }

            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setErrors(prev => ({
                    ...prev,
                    paymentImage: 'La imagen no puede ser mayor a 5MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                paymentImage: file
            }));

            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Limpiar error si había uno
            if (errors.paymentImage) {
                setErrors(prev => ({
                    ...prev,
                    paymentImage: ''
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.mobilePaymentReference.trim()) {
            newErrors.mobilePaymentReference = 'La referencia de pago móvil es obligatoria';
        } else if (formData.mobilePaymentReference.trim().length < 4) {
            newErrors.mobilePaymentReference = 'La referencia debe tener al menos 4 caracteres';
        }

        if (!formData.paymentImage) {
            newErrors.paymentImage = 'Debe adjuntar una imagen del comprobante de pago';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const paymentData = {
            demandId: requestData.id,
            mobilePaymentReference: formData.mobilePaymentReference.trim(),
            paymentImage: formData.paymentImage
        };

        onSubmit(paymentData);
    };

    const handleClose = () => {
        // Resetear formulario al cerrar
        setFormData({
            mobilePaymentReference: '',
            paymentImage: null
        });
        setErrors({});
        setImagePreview(null);
        onClose();
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            paymentImage: null
        }));
        setImagePreview(null);
        // Limpiar el input file
        const fileInput = document.getElementById('paymentImage');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Registrar Pago"
            showConfirmButton={true}
            confirmText={isLoading ? "Registrando..." : "Registrar Pago"}
            cancelText="Cancelar"
            onConfirm={handleSubmit}
            confirmDisabled={isLoading}
        >
            <div className="space-y-6">
                {/* Información de la solicitud */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">📋 Información de la solicitud</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Origen:</span>
                            <p className="text-gray-800">{requestData?.origin || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Tipo de vehículo:</span>
                            <p className="text-gray-800">{requestData?.carType || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Formulario de pago */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Referencia de pago móvil */}
                    <div>
                        <label htmlFor="mobilePaymentReference" className="block text-sm font-medium text-gray-700 mb-2">
                            📱 Referencia de Pago Móvil *
                        </label>
                        <input
                            type="text"
                            id="mobilePaymentReference"
                            name="mobilePaymentReference"
                            value={formData.mobilePaymentReference}
                            onChange={handleInputChange}
                            placeholder="Ej: 1234567890, REF-ABC123, etc."
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                errors.mobilePaymentReference ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.mobilePaymentReference && (
                            <p className="mt-1 text-sm text-red-600">{errors.mobilePaymentReference}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Ingrese la referencia o número de confirmación del pago móvil
                        </p>
                    </div>

                    {/* Imagen del comprobante */}
                    <div>
                        <label htmlFor="paymentImage" className="block text-sm font-medium text-gray-700 mb-2">
                            🖼️ Comprobante de Pago *
                        </label>
                        
                        {!imagePreview ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                                <input
                                    type="file"
                                    id="paymentImage"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                                <label 
                                    htmlFor="paymentImage" 
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="text-4xl mb-2">📷</div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Haga clic para seleccionar una imagen
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        JPG, PNG o WEBP (máx. 5MB)
                                    </p>
                                </label>
                            </div>
                        ) : (
                            <div className="relative">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview del comprobante" 
                                    className="w-full max-h-64 object-contain border rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    disabled={isLoading}
                                >
                                    ✕
                                </button>
                                <p className="mt-2 text-sm text-gray-600 text-center">
                                    {formData.paymentImage?.name}
                                </p>
                            </div>
                        )}
                        
                        {errors.paymentImage && (
                            <p className="mt-1 text-sm text-red-600">{errors.paymentImage}</p>
                        )}
                    </div>

                    {/* Información adicional */}
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <div className="flex items-start">
                            <span className="text-yellow-600 mr-2">ℹ️</span>
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Importante:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Asegúrese de que la imagen sea clara y legible</li>
                                    <li>La referencia debe coincidir con la del comprobante</li>
                                    <li>El pago será verificado antes de ser aprobado</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}