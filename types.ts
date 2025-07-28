
export enum DeliveryStatus {
  SinDiferencias = 'Sin Diferencias',
  Faltante = 'Faltante',
  Sobrante = 'Sobrante',
  DañoMecanico = 'Daño Mecanico',
  ProductoVencido = 'Producto Vencido',
}

export interface Delivery {
  id: string;
  zonal: string;
  sku: string;
  quantity: number;
  receptionDate: string;
  status: DeliveryStatus;
  invoice: string;
}