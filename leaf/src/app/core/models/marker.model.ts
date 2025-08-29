
export interface Marker {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  activity?: string;
  address?: string;
  city?: string;
  phone?: string;
  fax?: string;
  email?: string;
  rc?: string;
  ice?: string;
  form?: string;
  addr_housenumber?: string;
  addr_street?: string;
  addr_postcode?: string;
  addr_province?: string;
  addr_place?: string;
  nombreEmployes?: number;
  chiffreAffaires?: number;
  dateCreation?: string; // Format YYYY-MM-DD ou Date
  identifiantBourse?: string;
  nombreClientsActifs?: number;
}
