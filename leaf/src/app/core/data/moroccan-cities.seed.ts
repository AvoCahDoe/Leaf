import { Marker } from '../models/marker.model';

const FORMS = ['COOPERATIVE', 'ENTREPRISE', 'ASSOCIATION'] as const;

const CITIES: Array<{ name: string; lat: number; lng: number; province: string }> = [
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898, province: 'Casablanca-Settat' },
  { name: 'Rabat', lat: 34.0209, lng: -6.8416, province: 'Rabat-Salé-Kénitra' },
  { name: 'Fès', lat: 34.0181, lng: -5.0078, province: 'Fès-Meknès' },
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811, province: 'Marrakech-Safi' },
  { name: 'Tanger', lat: 35.7595, lng: -5.8340, province: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'Agadir', lat: 30.4278, lng: -9.5981, province: 'Souss-Massa' },
  { name: 'Meknès', lat: 33.8935, lng: -5.5473, province: 'Fès-Meknès' },
  { name: 'Oujda', lat: 34.6867, lng: -1.9114, province: 'Oriental' },
  { name: 'Kénitra', lat: 34.2610, lng: -6.5802, province: 'Rabat-Salé-Kénitra' },
  { name: 'Tétouan', lat: 35.5889, lng: -5.3626, province: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'Safi', lat: 32.2994, lng: -9.2372, province: 'Marrakech-Safi' },
  { name: 'Mohammedia', lat: 33.6866, lng: -7.3830, province: 'Casablanca-Settat' },
  { name: 'Khouribga', lat: 32.8848, lng: -6.9061, province: 'Béni Mellal-Khénifra' },
  { name: 'Béni Mellal', lat: 32.3373, lng: -6.3498, province: 'Béni Mellal-Khénifra' },
  { name: 'Nador', lat: 35.1681, lng: -2.9335, province: 'Oriental' },
  { name: 'Taza', lat: 34.2139, lng: -4.0086, province: 'Fès-Meknès' },
  { name: 'El Jadida', lat: 33.2316, lng: -8.5007, province: 'Casablanca-Settat' },
  { name: 'Larache', lat: 35.1871, lng: -6.1557, province: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'Khemisset', lat: 33.8243, lng: -6.0661, province: 'Rabat-Salé-Kénitra' },
  { name: 'Guelmim', lat: 28.9870, lng: -10.0574, province: 'Guelmim-Oued Noun' },
  { name: 'Laâyoune', lat: 27.1536, lng: -13.2033, province: 'Laâyoune-Sakia El Hamra' },
  { name: 'Settat', lat: 33.0019, lng: -7.6169, province: 'Casablanca-Settat' },
  { name: 'Berrechid', lat: 33.2655, lng: -7.5875, province: 'Casablanca-Settat' },
  { name: 'Errachidia', lat: 31.9315, lng: -4.4246, province: 'Drâa-Tafilalet' },
  { name: 'Essaouira', lat: 31.5085, lng: -9.7595, province: 'Marrakech-Safi' },
  { name: 'Dakhla', lat: 23.6848, lng: -15.9580, province: 'Dakhla-Oued Ed-Dahab' },
  { name: 'Ifrane', lat: 33.5228, lng: -5.1106, province: 'Fès-Meknès' },
  { name: 'Al Hoceïma', lat: 35.2517, lng: -3.9372, province: 'Tanger-Tétouan-Al Hoceïma' },
];

export function createMoroccanCityMarkers(): Marker[] {
  return CITIES.map((city, index) => ({
    id: crypto.randomUUID(),
    name: city.name,
    lat: city.lat,
    lng: city.lng,
    city: city.name,
    addr_province: city.province,
    address: `Centre-ville, ${city.name}`,
    activity: 'Point de référence urbain',
    form: FORMS[index % FORMS.length],
  }));
}
