
import React, { useState, useEffect } from 'react';
import { ZONALES } from '../constants';
import { DeliveryStatus, Delivery } from '../types';
import { analyzeDelivery } from '../services/geminiService';
import Spinner from './ui/Spinner';

interface DeliveryFormProps {
  onAddDelivery: (delivery: Omit<Delivery, 'id'>) => void;
}

const LAST_USED_ZONAL_KEY = 'lastUsedZonal';

const DeliveryForm: React.FC<DeliveryFormProps> = ({ onAddDelivery }) => {
  const [zonal, setZonal] = useState<string>(() => {
    try {
      const savedZonal = localStorage.getItem(LAST_USED_ZONAL_KEY);
      return savedZonal && ZONALES.includes(savedZonal) ? savedZonal : ZONALES[0];
    } catch {
      return ZONALES[0];
    }
  });
  const [sku, setSku] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [receptionDate, setReceptionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<DeliveryStatus>(DeliveryStatus.SinDiferencias);
  const [invoice, setInvoice] = useState<string>('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionMessage, setSubmissionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAnhuGypP96NCCcCkg48jMhUx-id2KoOjHwm-GP3iJIUgQ_8DglYG5iggjHud2opJRwQ/exec';

  const isSinDiferencias = status === DeliveryStatus.SinDiferencias;

  useEffect(() => {
    if (isSinDiferencias) {
      setSku('');
      setQuantity('');
      setInvoice('');
      // Clear any existing errors for these fields
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sku;
        delete newErrors.quantity;
        delete newErrors.invoice;
        return newErrors;
      });
    }
  }, [status]);


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!receptionDate) newErrors.receptionDate = "La fecha es obligatoria.";

    if (!isSinDiferencias) {
        if (!invoice.trim() && status !== DeliveryStatus.DañoMecanico && status !== DeliveryStatus.ProductoVencido) newErrors.invoice = "El número de factura es obligatorio.";
        if (!sku.trim()) newErrors.sku = "El SKU es obligatorio.";
        if (!quantity.trim()) {
            newErrors.quantity = "La diferencia es obligatoria.";
        } else if (isNaN(Number(quantity))) {
            newErrors.quantity = "La diferencia debe ser un número válido.";
        } else if (status !== DeliveryStatus.DañoMecanico && status !== DeliveryStatus.ProductoVencido && Number(quantity) === 0) {
            newErrors.quantity = "La diferencia no puede ser cero para este estado.";
        } else if (status === DeliveryStatus.Faltante && Number(quantity) >= 0) {
            newErrors.quantity = "Para 'Faltante', la diferencia debe ser un número negativo (ej: -5).";
        } else if (status === DeliveryStatus.Sobrante && Number(quantity) <= 0) {
            newErrors.quantity = "Para 'Sobrante', la diferencia debe ser un número positivo (ej: 5).";
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleZonalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newZonal = e.target.value;
    setZonal(newZonal);
    try {
      localStorage.setItem(LAST_USED_ZONAL_KEY, newZonal);
    } catch (error) {
      console.error("Failed to save last used zonal to local storage:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    const newDelivery: Omit<Delivery, 'id'> = {
      zonal,
      sku,
      quantity: Number(quantity || '0'),
      receptionDate,
      status,
      invoice,
    };

    try {
      const formData = new FormData();
      Object.entries(newDelivery).forEach(([key, value]) => {
          formData.append(key, String(value));
      });

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      }).catch(err => {
        console.error("Network error while attempting to send to Google Sheets:", err);
      });
      
      const analysis = await analyzeDelivery(newDelivery);
      
      onAddDelivery(newDelivery);
      localStorage.setItem(LAST_USED_ZONAL_KEY, newDelivery.zonal);
      
      setSubmissionMessage({ type: 'success', text: `${analysis} Además, se envió el registro a la planilla central.` });

      setSku('');
      setQuantity('');
      setInvoice('');
      setStatus(DeliveryStatus.SinDiferencias);
      setReceptionDate(new Date().toISOString().split('T')[0]);
      setErrors({});

    } catch (error) {
      console.error("Error during submission process (likely Gemini):", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar la recepción.";
      setSubmissionMessage({ type: 'error', text: `Error: ${errorMessage}` });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const baseInputClasses = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-shadow";
  const disabledInputClasses = "disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400";
  const inputClasses = `${baseInputClasses} ${disabledInputClasses}`;
  const labelClasses = "block text-sm font-medium text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="receptionDate" className={labelClasses}>Fecha de Recepción</label>
          <input type="date" id="receptionDate" value={receptionDate} onChange={e => setReceptionDate(e.target.value)} className={inputClasses} />
          {errors.receptionDate && <p className="text-red-500 text-xs mt-1">{errors.receptionDate}</p>}
        </div>
        <div>
          <label htmlFor="zonal" className={labelClasses}>Zonal</label>
          <select id="zonal" value={zonal} onChange={handleZonalChange} className={inputClasses}>
            {ZONALES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label className={labelClasses}>Estado de la Recepción</label>
        <div className="flex flex-wrap gap-2 rounded-lg bg-gray-200 p-1">
          {Object.values(DeliveryStatus).map(s => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={`flex-grow py-2 px-3 rounded-md text-xs sm:text-sm font-semibold transition-colors text-center ${status === s ? 'bg-white text-green-800 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sku" className={labelClasses}>SKU (Código de producto)</label>
          <input type="text" id="sku" value={sku} onChange={e => setSku(e.target.value)} disabled={isSinDiferencias} aria-disabled={isSinDiferencias} className={inputClasses} placeholder={isSinDiferencias ? 'N/A' : 'Ej: 12345-ABC'} />
          {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
        </div>
        <div>
          <label htmlFor="quantity" className={labelClasses}>Diferencia Recibida</label>
          <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} disabled={isSinDiferencias} aria-disabled={isSinDiferencias} className={inputClasses} placeholder={isSinDiferencias ? '0' : 'Ej: -5, 10'} />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="invoice" className={labelClasses}>Número de Factura SAP</label>
        <input type="text" id="invoice" value={invoice} onChange={e => setInvoice(e.target.value)} disabled={isSinDiferencias} aria-disabled={isSinDiferencias} className={inputClasses} placeholder={isSinDiferencias ? 'N/A' : 'Ej: 900123456'} />
        {errors.invoice && <p className="text-red-500 text-xs mt-1">{errors.invoice}</p>}
      </div>

      <div>
        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-3 bg-green-700 text-white font-bold text-lg py-4 px-6 rounded-lg hover:bg-green-800 disabled:bg-gray-400 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          {isSubmitting ? <><Spinner/> Verificando y Registrando...</> : "Registrar Recepción"}
        </button>
      </div>

      {submissionMessage && (
        <div className={`p-4 rounded-lg text-center ${submissionMessage.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`}>
          <p className="font-semibold">{submissionMessage.text}</p>
        </div>
      )}
    </form>
  );
};

export default DeliveryForm;