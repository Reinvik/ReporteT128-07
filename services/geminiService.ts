
import { GoogleGenAI } from "@google/genai";
import { Delivery, DeliveryStatus } from '../types';

export const analyzeDelivery = async (deliveryData: Omit<Delivery, 'id'>): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.log("API Key de Gemini no encontrada. Saltando análisis y usando mensaje por defecto.");
    return "✅ Datos registrados correctamente.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { zonal, sku, quantity, status, invoice } = deliveryData;

    const prompt = `
    Actúa como un asistente de logística amigable y profesional para una empresa de distribución llamada CiAL.
    Tu tarea es generar un mensaje de confirmación corto, positivo y útil para el operario que acaba de registrar una recepción.
    El mensaje debe ser solo una frase en texto plano, sin markdown, saltos de línea ni formato especial.

    Aquí están los datos de la recepción registrada:
    - Zonal: ${zonal}
    - SKU: ${sku || 'N/A'}
    - Cantidad afectada: ${quantity}
    - Estado: ${status}
    - Factura SAP: ${invoice || 'N/A'}

    Usa las siguientes directrices para tu respuesta:
    1.  Si el estado es "Sin Diferencias", felicita al operario por el buen trabajo. No menciones SKU o Cantidad.
        Ejemplo: "✅ ¡Excelente! Recepción sin diferencias para la zonal ${zonal} registrada correctamente."
    2.  Si el estado es "Faltante", agradece por notificar la discrepancia, mencionando la cantidad faltante (usa el valor absoluto de la cantidad).
        Ejemplo: "✅ Registro guardado. Se ha notificado un faltante de ${Math.abs(quantity)} unidades del SKU ${sku} en la zonal ${zonal}, ¡gracias por tu atención!"
    3.  Si el estado es "Sobrante", reconoce el registro y la atención al detalle, mencionando la cantidad sobrante.
        Ejemplo: "✅ OK. Se registró un sobrante de ${quantity} unidades del SKU ${sku} en la zonal ${zonal}. Gracias por verificar."
    4.  Si el estado es "Daño Mecanico", confirma el reporte del daño y menciona que se tomarán acciones.
        Ejemplo: "✅ Entendido. Se registró un reporte por daño mecánico para ${quantity} unidad(es) del SKU ${sku} en la zonal ${zonal}."
    5.  Si el estado es "Producto Vencido", genera un mensaje de alerta, indicando la criticidad del evento.
        Ejemplo: "⚠️ ¡Atención! Se registró producto vencido (${quantity} unidades) del SKU ${sku} en la zonal ${zonal}. Se ha generado una alerta para su retiro."
    
    Genera ahora el mensaje de confirmación para los datos proporcionados.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });
    
    const text = response.text;

    if (!text) {
        return "✅ Datos registrados correctamente.";
    }

    return text.trim();
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    return "✅ Datos registrados correctamente.";
  }
};