
import React from 'react';
import { Delivery, DeliveryStatus } from '../types';
import Card from './ui/Card';

interface DeliveryTableProps {
  deliveries: Delivery[];
}

const statusColorMap: Record<DeliveryStatus, string> = {
  [DeliveryStatus.SinDiferencias]: 'bg-green-100 text-green-800',
  [DeliveryStatus.Faltante]: 'bg-yellow-100 text-yellow-800',
  [DeliveryStatus.Sobrante]: 'bg-blue-100 text-blue-800',
  [DeliveryStatus.DañoMecanico]: 'bg-orange-100 text-orange-800',
  [DeliveryStatus.ProductoVencido]: 'bg-red-100 text-red-800',
};

const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries }) => {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Historial de Recepciones</h2>
        <p className="text-gray-500 mb-6">Consulta aquí todos los registros de recepciones. La información es de solo lectura.</p>
      </div>
      
      {deliveries.length === 0 ? (
        <div className="text-center py-16 px-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600">No hay registros aún</h3>
          <p className="text-gray-500 mt-2">Ve a la pestaña "Registrar" para añadir tu primera recepción.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase font-semibold">
              <tr>
                <th scope="col" className="px-6 py-3">Fecha</th>
                <th scope="col" className="px-6 py-3">Zonal</th>
                <th scope="col" className="px-6 py-3">SKU</th>
                <th scope="col" className="px-6 py-3">Factura SAP</th>
                <th scope="col" className="px-6 py-3 text-right">Diferencia</th>
                <th scope="col" className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{delivery.receptionDate}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{delivery.zonal}</td>
                  <td className="px-6 py-4">{delivery.sku || 'N/A'}</td>
                  <td className="px-6 py-4">{delivery.invoice || 'N/A'}</td>
                  <td className="px-6 py-4 text-right font-medium">{delivery.quantity}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorMap[delivery.status]}`}>
                      {delivery.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default DeliveryTable;