import React, { useEffect, useState } from 'react';
import PaymentService from '../../services/PaymentService';

export default function PaymentWaitingScreen({ paymentId, onVerified, onRejected }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Polling cada 10 segundos para verificar el estado
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setError(null);
        const response = await PaymentService.getPaymentDetails(paymentId);
        setPayment(response);

        // Si el pago fue verificado, notificar al padre
        if (response.status === 'VERIFIED') {
          onVerified(response);
        }
        // Si el pago fue rechazado, notificar al padre
        else if (response.status === 'REJECTED') {
          onRejected(response);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setError('Error al verificar el estado del pago');
      } finally {
        setLoading(false);
      }
    };

    // Verificar inmediatamente
    checkPaymentStatus();

    // Luego verificar cada 10 segundos mientras esté pendiente
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 10000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [paymentId, onVerified, onRejected]);

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">Error de Conexión</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Spinner animado */}
      <div className="text-center mb-6">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-600 mx-auto"></div>
        </div>
      </div>

      {/* Título y mensaje principal */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Pago Enviado Exitosamente</h2>
        <p className="text-gray-600 text-lg">
          Tu pago está siendo verificado por nuestro equipo
        </p>
      </div>

      {/* Información del pago */}
      {payment && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Referencia:</span>
              <p className="text-gray-900 font-mono">{payment.mobilePaymentReference}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Monto:</span>
              <p className="text-gray-900 font-semibold">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(payment.amount)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Estado:</span>
              <p>
                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Pendiente
                </span>
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha:</span>
              <p className="text-gray-900">
                {new Date(payment.createdAt).toLocaleString('es-CO', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explicación del proceso */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 mb-2">¿Qué sucede ahora?</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. Nuestro equipo revisará tu comprobante de pago</p>
              <p>2. Una vez aprobado, tu solicitud se activará automáticamente</p>
              <p>3. Los operadores podrán ver y aceptar tu solicitud</p>
              <p>4. Recibirás notificación cuando un operador tome tu servicio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tiempo estimado */}
      <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          <strong>Tiempo estimado de verificación:</strong> 5-15 minutos
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Esta pantalla se actualizará automáticamente cuando tu pago sea verificado
        </p>
      </div>

      {/* Indicador de actualización automática */}
      <div className="text-center">
        <div className="inline-flex items-center text-sm text-gray-500">
          <div className="animate-pulse mr-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </div>
          <span>Verificando estado automáticamente...</span>
        </div>
      </div>

      {/* Mensaje de soporte */}
      <div className="mt-6 p-3 bg-gray-100 rounded text-center">
        <p className="text-xs text-gray-600">
          Si tienes alguna duda o el proceso tarda más de lo esperado,
          por favor contacta a nuestro equipo de soporte.
        </p>
      </div>
    </div>
  );
}
