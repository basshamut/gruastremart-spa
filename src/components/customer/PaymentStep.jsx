import React, { useState, useEffect } from 'react';
import { usePriceCalculation } from '../../hooks/data/usePriceCalculation';

export default function PaymentStep({ formData, onBack, onPaymentSubmit }) {
  const [paymentData, setPaymentData] = useState({
    reference: '',
    amount: 0,
    image: null
  });

  const { calculateAutomaticPrice, formatPrice, isReady } = usePriceCalculation();
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Calcular precio automáticamente al montar
  useEffect(() => {
    if (isReady && formData) {
      const priceCalc = calculateAutomaticPrice({
        currentLocation: formData.currentLocation,
        destinationLocation: formData.destinationLocation,
        // Nota: vehicleWeight puede no estar disponible
      });

      if (priceCalc) {
        setCalculatedPrice(priceCalc);
        setPaymentData(prev => ({
          ...prev,
          amount: priceCalc.totalPrice
        }));
      }
    }
  }, [isReady, formData, calculateAutomaticPrice]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.');
        return;
      }

      // Validar formato
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Formato no válido. Usa JPG, PNG o WEBP.');
        return;
      }

      setPaymentData({ ...paymentData, image: file });

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!paymentData.reference || !paymentData.image || !paymentData.amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (paymentData.reference.length < 4) {
      alert('La referencia de pago debe tener al menos 4 caracteres');
      return;
    }

    onPaymentSubmit(paymentData);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Pago del Servicio de Grúa</h2>

      {/* Resumen de la solicitud */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-green-500">
        <h3 className="font-semibold mb-3 text-gray-800">Resumen de tu solicitud</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Desde:</span>
            <p className="text-gray-900">{formData.currentLocation?.name || 'Ubicación actual'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Hasta:</span>
            <p className="text-gray-900">{formData.destinationLocation?.name || 'Destino'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Vehículo:</span>
            <p className="text-gray-900">
              {formData.vehicleBrand} {formData.vehicleModel} ({formData.vehicleYear})
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Placa:</span>
            <p className="text-gray-900">{formData.vehiclePlate}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Contacto:</span>
            <p className="text-gray-900">{formData.customerName} - {formData.customerPhone}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Tipo de avería:</span>
            <p className="text-gray-900">{formData.breakdown}</p>
          </div>
        </div>

        {calculatedPrice && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="text-center">
              <span className="text-sm text-gray-600">Precio estimado del servicio:</span>
              <div className="text-3xl font-bold text-green-600 mt-1">
                {formatPrice(calculatedPrice.totalPrice)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Distancia: {calculatedPrice.distance?.toFixed(2)} km
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instrucciones de Pago Móvil */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold mb-2 text-blue-900 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
          Instrucciones de Pago Móvil
        </h3>
        <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
          <li>Realiza tu pago por <strong>Pago Móvil</strong> al siguiente número</li>
          <li className="ml-6 text-lg font-bold text-blue-900">0424-1234567 (Banco Venezuela)</li>
          <li>Monto a pagar: <strong className="text-green-600">
            {calculatedPrice ? formatPrice(calculatedPrice.totalPrice) : 'Calculando...'}
          </strong></li>
          <li>Captura una foto clara del comprobante de pago</li>
          <li>Completa el formulario abajo con la referencia y comprobante</li>
        </ol>
      </div>

      {/* Formulario de comprobante */}
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Referencia de Pago Móvil *
          </label>
          <input
            type="text"
            value={paymentData.reference}
            onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: 123456789"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Ingresa el número de referencia que te proporcionó tu banco
          </p>
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Monto Pagado *
          </label>
          <input
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            step="0.01"
            min="0"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Verifica que coincida con el precio estimado
          </p>
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Comprobante de Pago *
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos aceptados: JPG, PNG, WEBP. Máximo 5MB
          </p>

          {imagePreview && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 mb-2">Vista previa:</p>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs max-h-48 border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de advertencia */}
      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Importante:</strong> Tu pago será verificado por nuestro equipo. Una vez aprobado,
          tu solicitud de grúa se activará automáticamente y un operador podrá tomarla.
          Este proceso puede tomar unos minutos.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded transition-colors"
        >
          ← Volver al Formulario
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded transition-colors shadow-md"
        >
          Enviar Pago →
        </button>
      </div>
    </div>
  );
}
