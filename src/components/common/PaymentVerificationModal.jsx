import React, { useState } from 'react';
import Modal from './Modal';

export default function PaymentVerificationModal({
    isOpen,
    onClose,
    onVerify,
    paymentData,
    isLoading = false
}) {
    const [formData, setFormData] = useState({
        status: 'VERIFIED',
        verificationComments: ''
    });
    const [errors, setErrors] = useState({});
    const [showImageViewer, setShowImageViewer] = useState(false);

    const handleStatusChange = (newStatus) => {
        setFormData(prev => ({
            ...prev,
            status: newStatus,
            verificationComments: '' // Limpiar comentarios al cambiar estado
        }));

        if (errors.verificationComments) {
            setErrors(prev => ({ ...prev, verificationComments: '' }));
        }
    };

    const handleCommentsChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            verificationComments: value
        }));

        if (errors.verificationComments) {
            setErrors(prev => ({ ...prev, verificationComments: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar que los comentarios sean obligatorios al rechazar
        if (formData.status === 'REJECTED' && !formData.verificationComments.trim()) {
            newErrors.verificationComments = 'Debe incluir el motivo del rechazo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        onVerify({
            status: formData.status,
            verificationComments: formData.verificationComments.trim()
        });
    };

    const handleClose = () => {
        // Resetear formulario al cerrar
        setFormData({
            status: 'VERIFIED',
            verificationComments: ''
        });
        setErrors({});
        setShowImageViewer(false);
        onClose();
    };

    if (!paymentData) return null;

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { text: '⏳ Pendiente', class: 'bg-yellow-100 text-yellow-800' },
            VERIFIED: { text: '✅ Aprobado', class: 'bg-green-100 text-green-800' },
            REJECTED: { text: '❌ Rechazado', class: 'bg-red-100 text-red-800' }
        };
        const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Verificación de Pago"
                showConfirmButton={paymentData.status === 'PENDING'}
                confirmText={isLoading ? "Procesando..." : formData.status === 'VERIFIED' ? "✅ Aprobar Pago" : "❌ Rechazar Pago"}
                cancelText="Cerrar"
                onConfirm={handleSubmit}
                confirmDisabled={isLoading}
            >
                <div className="space-y-6">
                    {/* Información del pago */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-3">📋 Información del Pago</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Estado actual:</span>
                                <div className="mt-1">{getStatusBadge(paymentData.status)}</div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Referencia:</span>
                                <p className="text-gray-800 font-mono text-xs mt-1">{paymentData.mobilePaymentReference}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Monto:</span>
                                <p className="text-green-700 font-semibold mt-1">${paymentData.amount?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Fecha de registro:</span>
                                <p className="text-gray-800 mt-1">{new Date(paymentData.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Información de la demanda asociada */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-3">🚛 Servicio Asociado</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Origen:</span>
                                <p className="text-gray-800 mt-1">{paymentData.demandOrigin || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Tipo de vehículo:</span>
                                <p className="text-gray-800 mt-1">{paymentData.demandCarType || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Imagen del comprobante */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🖼️ Comprobante de Pago
                        </label>
                        {paymentData.paymentImageUrl ? (
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <img
                                    src={paymentData.paymentImageUrl}
                                    alt="Comprobante de pago"
                                    className="w-full h-auto max-h-64 object-contain bg-white cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => setShowImageViewer(true)}
                                />
                                <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 flex justify-between items-center">
                                    <span>Haz clic para ver en grande</span>
                                    {paymentData.verifiedAt && (
                                        <span>Verificado: {new Date(paymentData.verifiedAt).toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                                <div className="text-4xl mb-2">📷</div>
                                <p>No hay imagen disponible</p>
                            </div>
                        )}
                    </div>

                    {/* Formulario de verificación - Solo si el pago está pendiente */}
                    {paymentData.status === 'PENDING' && (
                        <div className="bg-white border-2 border-blue-200 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-3">🔍 Verificar Pago</h3>

                            {/* Selección de estado */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Decisión *
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChange('VERIFIED')}
                                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                                            formData.status === 'VERIFIED'
                                                ? 'border-green-500 bg-green-50 text-green-800'
                                                : 'border-gray-300 text-gray-600 hover:border-green-300'
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <div className="text-lg mb-1">✅</div>
                                        <div className="font-medium">Aprobar</div>
                                        <div className="text-xs mt-1">El pago es válido</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChange('REJECTED')}
                                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                                            formData.status === 'REJECTED'
                                                ? 'border-red-500 bg-red-50 text-red-800'
                                                : 'border-gray-300 text-gray-600 hover:border-red-300'
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <div className="text-lg mb-1">❌</div>
                                        <div className="font-medium">Rechazar</div>
                                        <div className="text-xs mt-1">El pago no es válido</div>
                                    </button>
                                </div>
                            </div>

                            {/* Comentarios de verificación */}
                            <div>
                                <label htmlFor="verificationComments" className="block text-sm font-medium text-gray-700 mb-2">
                                    Comentarios {formData.status === 'REJECTED' && <span className="text-red-600">*</span>}
                                </label>
                                <textarea
                                    id="verificationComments"
                                    value={formData.verificationComments}
                                    onChange={handleCommentsChange}
                                    placeholder={
                                        formData.status === 'VERIFIED'
                                            ? "Opcional: Agregue comentarios sobre la aprobación..."
                                            : "Obligatorio: Explique el motivo del rechazo..."
                                    }
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formData.status === 'REJECTED'
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-300'
                                    } ${errors.verificationComments ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.verificationComments && (
                                    <p className="mt-1 text-sm text-red-600">{errors.verificationComments}</p>
                                )}
                                {formData.status === 'REJECTED' && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Los comentarios son obligatorios al rechazar un pago.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Información de verificación previa - Si ya fue verificado */}
                    {paymentData.status !== 'PENDING' && (
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                            <h3 className="font-semibold text-purple-800 mb-3">📝 Información de Verificación</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Verificado por:</span>
                                    <p className="text-gray-800">{paymentData.verifiedByUserId || 'N/A'}</p>
                                </div>
                                {paymentData.verifiedAt && (
                                    <div>
                                        <span className="font-medium text-gray-700">Fecha de verificación:</span>
                                        <p className="text-gray-800">{new Date(paymentData.verifiedAt).toLocaleString()}</p>
                                    </div>
                                )}
                                {paymentData.verificationComments && (
                                    <div>
                                        <span className="font-medium text-gray-700">Comentarios:</span>
                                        <p className="text-gray-800 italic">"{paymentData.verificationComments}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Lightbox para ver imagen en grande */}
            {showImageViewer && paymentData.paymentImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                    onClick={() => setShowImageViewer(false)}
                >
                    <div className="relative max-w-5xl max-h-screen">
                        <img
                            src={paymentData.paymentImageUrl}
                            alt="Comprobante de pago - Vista grande"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowImageViewer(false);
                            }}
                            className="absolute top-2 right-2 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
                        >
                            ✕
                        </button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                            Haz clic en cualquier lugar para cerrar
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
