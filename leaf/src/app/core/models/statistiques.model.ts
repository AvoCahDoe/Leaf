export interface CityFinancialData {
  totalTurnover: number;
  markerCount: number;
}

export interface FormEmployeeData { // Assume similar structure exists for Turnover/Clients if needed for radar
  totalEmployees: number;
  markerCount: number;
}

export interface YearlyCreationData {
  year: string;
  count: number;
}

// Assuming structures for Radar Chart calculations if not derived directly
export interface FormComparisonData {
  form: string;
  avgEmployees: number;
  avgTurnover: number; // Potentially normalized for radar
  avgClients: number;
}

export interface CityClientData {
  city: string;
  totalClients: number;
}

export interface BoursePresenceData {
  hasBourse: string; // 'Avec Identifiant' ou 'Sans Identifiant'
  count: number;
}

export interface YearlyTurnoverData {
  year: string;
  totalTurnover: number;
}
