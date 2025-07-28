import React, { useState, useEffect, useCallback } from 'react';
import { Delivery } from './types';
import Header from './components/Header';
import DeliveryForm from './components/DeliveryForm';
import DeliveryTable from './components/DeliveryTable';
import Card from './components/ui/Card';

type View = 'form' | 'table';

const App: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [view, setView] = useState<View>('form');

  useEffect(() => {
    try {
      const storedDeliveries = localStorage.getItem('deliveries');
      if (storedDeliveries) {
        setDeliveries(JSON.parse(storedDeliveries));
      }
    } catch (error) {
      console.error("Failed to load deliveries from local storage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('deliveries', JSON.stringify(deliveries));
    } catch (error) {
      console.error("Failed to save deliveries to local storage:", error);
    }
  }, [deliveries]);

  const addDelivery = useCallback((newDelivery: Omit<Delivery, 'id'>) => {
    const deliveryWithId: Delivery = { ...newDelivery, id: new Date().toISOString() };
    setDeliveries(prevDeliveries => [deliveryWithId, ...prevDeliveries]);
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800">
      <Header currentView={view} setView={setView} />

      <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        {view === 'form' && (
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrar Nueva Recepción</h2>
              <p className="text-gray-500 mb-6">Complete todos los campos para registrar la recepción de mercancía.</p>
              <DeliveryForm onAddDelivery={addDelivery} />
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800">Almacenamiento Centralizado</h4>
                  <p className="text-sm text-green-700">
                    ¡Conectado! Cada registro que envíes ahora se guarda directamente en una hoja de cálculo de Google Sheets para su análisis centralizado. Los datos también se guardan en este navegador para una consulta rápida sin conexión.
                  </p>
              </div>
            </div>
          </Card>
        )}
        
        {view === 'table' && <DeliveryTable deliveries={deliveries} />}
      </main>

      <footer className="text-center p-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Reporte T1 para CiAL. Una herramienta para simplificar la logística.
      </footer>
    </div>
  );
};

export default App;