export type CountryOption = {
  code: string;
  name: string;
  nativeName?: string;
  defaultLat: number;
  defaultLng: number;
};

export type CityOption = {
  id: string;
  countryCode: string;
  name: string;
  lat: number;
  lng: number;
  adminName?: string;
  aliases?: string[];
};

export const countryOptions: CountryOption[] = [
  { code: "AF", name: "Afganistan", defaultLat: 33.9391, defaultLng: 67.71 },
  { code: "DE", name: "Almanya", defaultLat: 51.1657, defaultLng: 10.4515 },
  { code: "US", name: "Amerika Birleşik Devletleri", defaultLat: 39.8283, defaultLng: -98.5795 },
  { code: "AZ", name: "Azerbaycan", defaultLat: 40.1431, defaultLng: 47.5769 },
  { code: "BD", name: "Bangladeş", nativeName: "বাংলাদেশ", defaultLat: 23.685, defaultLng: 90.3563 },
  { code: "BA", name: "Bosna Hersek", defaultLat: 43.9159, defaultLng: 17.6791 },
  { code: "FR", name: "Fransa", defaultLat: 46.2276, defaultLng: 2.2137 },
  { code: "PS", name: "Filistin", nativeName: "فلسطين", defaultLat: 31.9522, defaultLng: 35.2332 },
  { code: "GB", name: "Birleşik Krallık", defaultLat: 55.3781, defaultLng: -3.436 },
  { code: "IQ", name: "Irak", nativeName: "العراق", defaultLat: 33.2232, defaultLng: 43.6793 },
  { code: "JO", name: "Ürdün", nativeName: "الأردن", defaultLat: 30.5852, defaultLng: 36.2384 },
  { code: "LB", name: "Lübnan", nativeName: "لبنان", defaultLat: 33.8547, defaultLng: 35.8623 },
  { code: "EG", name: "Mısır", nativeName: "مصر", defaultLat: 26.8206, defaultLng: 30.8025 },
  { code: "PK", name: "Pakistan", defaultLat: 30.3753, defaultLng: 69.3451 },
  { code: "SO", name: "Somali", defaultLat: 5.1521, defaultLng: 46.1996 },
  { code: "SD", name: "Sudan", nativeName: "السودان", defaultLat: 12.8628, defaultLng: 30.2176 },
  { code: "SY", name: "Suriye", nativeName: "سوريا", defaultLat: 34.8021, defaultLng: 38.9968 },
  { code: "TR", name: "Türkiye", nativeName: "Türkiye", defaultLat: 38.9637, defaultLng: 35.2433 },
  { code: "YE", name: "Yemen", nativeName: "اليمن", defaultLat: 15.5527, defaultLng: 48.5164 }
].sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));

export const cityOptions: CityOption[] = [
  { id: "af-kabul", countryCode: "AF", name: "Kabil", lat: 34.5553, lng: 69.2075, aliases: ["Kabul"] },
  { id: "af-herat", countryCode: "AF", name: "Herat", lat: 34.3529, lng: 62.204 },
  { id: "af-kandahar", countryCode: "AF", name: "Kandahar", lat: 31.6289, lng: 65.7372 },
  { id: "af-mazar", countryCode: "AF", name: "Mezar-ı Şerif", lat: 36.7069, lng: 67.1122, aliases: ["Mazar-i Sharif"] },

  { id: "bd-dhaka", countryCode: "BD", name: "Dakka", lat: 23.8103, lng: 90.4125, aliases: ["Dhaka"] },
  { id: "bd-chittagong", countryCode: "BD", name: "Chittagong", lat: 22.3569, lng: 91.7832, aliases: ["Çittagong", "Chattogram"] },
  { id: "bd-coxs-bazar", countryCode: "BD", name: "Cox's Bazar", lat: 21.4272, lng: 92.0058 },
  { id: "bd-sylhet", countryCode: "BD", name: "Sylhet", lat: 24.8949, lng: 91.8687 },

  { id: "eg-countrywide", countryCode: "EG", name: "Mısır geneli", lat: 28.5, lng: 31.0, adminName: "Ulusal çalışma hattı" },
  { id: "eg-cairo", countryCode: "EG", name: "Kahire", lat: 30.0444, lng: 31.2357, adminName: "Kahire", aliases: ["Cairo"] },
  { id: "eg-alexandria", countryCode: "EG", name: "İskenderiye", lat: 31.2001, lng: 29.9187, adminName: "İskenderiye", aliases: ["Alexandria"] },
  { id: "eg-giza", countryCode: "EG", name: "Gize", lat: 30.0131, lng: 31.2089, adminName: "Gize", aliases: ["Giza"] },
  { id: "eg-port-said", countryCode: "EG", name: "Port Said", lat: 31.2653, lng: 32.3019 },
  { id: "eg-suez", countryCode: "EG", name: "Süveyş", lat: 29.9668, lng: 32.5498, aliases: ["Suez"] },
  { id: "eg-arish", countryCode: "EG", name: "Ariş", lat: 31.1316, lng: 33.7984, adminName: "Kuzey Sina", aliases: ["El-Ariş", "Al Arish"] },
  { id: "eg-aswan", countryCode: "EG", name: "Asvan", lat: 24.0889, lng: 32.8998, aliases: ["Aswan"] },
  { id: "eg-rafah", countryCode: "EG", name: "Refah", lat: 31.282, lng: 34.2387, adminName: "Kuzey Sina", aliases: ["Rafah"] },

  { id: "iq-baghdad", countryCode: "IQ", name: "Bağdat", lat: 33.3152, lng: 44.3661, aliases: ["Baghdad"] },
  { id: "iq-mosul", countryCode: "IQ", name: "Musul", lat: 36.34, lng: 43.13, aliases: ["Mosul"] },
  { id: "iq-erbil", countryCode: "IQ", name: "Erbil", lat: 36.1911, lng: 44.0092 },
  { id: "iq-basra", countryCode: "IQ", name: "Basra", lat: 30.5085, lng: 47.7804 },
  { id: "iq-najaf", countryCode: "IQ", name: "Necef", lat: 32.0259, lng: 44.3462, aliases: ["Najaf"] },

  { id: "jo-amman", countryCode: "JO", name: "Amman", lat: 31.9539, lng: 35.9106 },
  { id: "jo-zarqa", countryCode: "JO", name: "Zerka", lat: 32.0728, lng: 36.0879, aliases: ["Zarqa"] },
  { id: "jo-irbid", countryCode: "JO", name: "İrbid", lat: 32.5556, lng: 35.85, aliases: ["Irbid"] },
  { id: "jo-mafraq", countryCode: "JO", name: "Mafrak", lat: 32.3429, lng: 36.208, aliases: ["Mafraq"] },

  { id: "lb-countrywide", countryCode: "LB", name: "Lübnan geneli", lat: 33.85, lng: 35.85, adminName: "Ulusal çalışma hattı" },
  { id: "lb-beirut", countryCode: "LB", name: "Beyrut", lat: 33.8938, lng: 35.5018, adminName: "Beyrut", aliases: ["Beirut"] },
  { id: "lb-tripoli", countryCode: "LB", name: "Trablus", lat: 34.4367, lng: 35.8497, adminName: "Kuzey Lübnan", aliases: ["Tripoli"] },
  { id: "lb-sidon", countryCode: "LB", name: "Sayda", lat: 33.5571, lng: 35.3729, adminName: "Güney Lübnan", aliases: ["Sidon"] },
  { id: "lb-tyre", countryCode: "LB", name: "Sur", lat: 33.2704, lng: 35.2038, adminName: "Güney Lübnan", aliases: ["Tyre"] },
  { id: "lb-bekaa", countryCode: "LB", name: "Bekaa", lat: 33.8463, lng: 35.902, adminName: "Bekaa", aliases: ["Bekaa Vadisi"] },
  { id: "lb-zahle", countryCode: "LB", name: "Zahle", lat: 33.8467, lng: 35.902 },

  { id: "pk-islamabad", countryCode: "PK", name: "İslamabad", lat: 33.6844, lng: 73.0479, aliases: ["Islamabad"] },
  { id: "pk-karachi", countryCode: "PK", name: "Karaçi", lat: 24.8607, lng: 67.0011, aliases: ["Karachi"] },
  { id: "pk-lahore", countryCode: "PK", name: "Lahor", lat: 31.5204, lng: 74.3587, aliases: ["Lahore"] },
  { id: "pk-peshawar", countryCode: "PK", name: "Peşaver", lat: 34.0151, lng: 71.5249, aliases: ["Peshawar"] },
  { id: "pk-quetta", countryCode: "PK", name: "Ketta", lat: 30.1798, lng: 66.975, aliases: ["Quetta"] },

  { id: "ps-gaza", countryCode: "PS", name: "Gazze", lat: 31.45, lng: 34.39, adminName: "Gazze Şeridi", aliases: ["Gaza"] },
  { id: "ps-jerusalem", countryCode: "PS", name: "Kudüs", lat: 31.7683, lng: 35.2137, adminName: "Kudüs", aliases: ["Jerusalem"] },
  { id: "ps-ramallah", countryCode: "PS", name: "Ramallah", lat: 31.9038, lng: 35.2034, adminName: "Batı Şeria" },
  { id: "ps-nablus", countryCode: "PS", name: "Nablus", lat: 32.2211, lng: 35.2544, adminName: "Batı Şeria" },
  { id: "ps-khan-younis", countryCode: "PS", name: "Han Yunus", lat: 31.3462, lng: 34.3063, adminName: "Gazze Şeridi", aliases: ["Khan Younis"] },
  { id: "ps-rafah", countryCode: "PS", name: "Refah", lat: 31.2969, lng: 34.2435, adminName: "Gazze Şeridi", aliases: ["Rafah"] },
  { id: "ps-jenin", countryCode: "PS", name: "Cenin", lat: 32.4594, lng: 35.3009, adminName: "Batı Şeria", aliases: ["Jenin"] },
  { id: "ps-hebron", countryCode: "PS", name: "El Halil", lat: 31.5326, lng: 35.0998, adminName: "Batı Şeria", aliases: ["Hebron"] },

  { id: "sd-khartoum", countryCode: "SD", name: "Hartum", lat: 15.5007, lng: 32.5599, aliases: ["Khartoum"] },
  { id: "sd-omdurman", countryCode: "SD", name: "Omdurman", lat: 15.6476, lng: 32.4807 },
  { id: "sd-port-sudan", countryCode: "SD", name: "Port Sudan", lat: 19.6158, lng: 37.2164 },
  { id: "sd-nyala", countryCode: "SD", name: "Nyala", lat: 12.05, lng: 24.8833 },

  { id: "so-mogadishu", countryCode: "SO", name: "Mogadişu", lat: 2.0469, lng: 45.3182, aliases: ["Mogadishu"] },
  { id: "so-hargeisa", countryCode: "SO", name: "Hargeisa", lat: 9.5624, lng: 44.077 },
  { id: "so-baidoa", countryCode: "SO", name: "Baidoa", lat: 3.1167, lng: 43.65 },
  { id: "so-kismayo", countryCode: "SO", name: "Kismayo", lat: -0.3582, lng: 42.5454 },

  { id: "sy-damascus", countryCode: "SY", name: "Şam", lat: 33.5138, lng: 36.2765, aliases: ["Damascus"] },
  { id: "sy-aleppo", countryCode: "SY", name: "Halep", lat: 36.2021, lng: 37.1343, aliases: ["Aleppo"] },
  { id: "sy-idlib", countryCode: "SY", name: "İdlib", lat: 35.9306, lng: 36.6339, aliases: ["Idlib"] },
  { id: "sy-homs", countryCode: "SY", name: "Humus", lat: 34.7324, lng: 36.7137, aliases: ["Homs"] },
  { id: "sy-hama", countryCode: "SY", name: "Hama", lat: 35.1318, lng: 36.7578 },

  { id: "tr-countrywide", countryCode: "TR", name: "Türkiye geneli", lat: 38.6, lng: 37.5, adminName: "Ulusal çalışma hattı" },
  { id: "tr-istanbul", countryCode: "TR", name: "İstanbul", lat: 41.0082, lng: 28.9784, adminName: "Marmara" },
  { id: "tr-ankara", countryCode: "TR", name: "Ankara", lat: 39.9334, lng: 32.8597, adminName: "İç Anadolu" },
  { id: "tr-konya", countryCode: "TR", name: "Konya", lat: 37.8746, lng: 32.4932, adminName: "İç Anadolu" },
  { id: "tr-hatay", countryCode: "TR", name: "Hatay", lat: 36.4018, lng: 36.3498, adminName: "Akdeniz" },
  { id: "tr-gaziantep", countryCode: "TR", name: "Gaziantep", lat: 37.0662, lng: 37.3833, adminName: "Güneydoğu Anadolu" },
  { id: "tr-kilis", countryCode: "TR", name: "Kilis", lat: 36.7184, lng: 37.1212, adminName: "Güneydoğu Anadolu" },
  { id: "tr-sanliurfa", countryCode: "TR", name: "Şanlıurfa", lat: 37.1674, lng: 38.7955, adminName: "Güneydoğu Anadolu", aliases: ["Urfa"] },
  { id: "tr-adana", countryCode: "TR", name: "Adana", lat: 37.0, lng: 35.3213, adminName: "Akdeniz" },
  { id: "tr-mersin", countryCode: "TR", name: "Mersin", lat: 36.8121, lng: 34.6415, adminName: "Akdeniz" },
  { id: "tr-kahramanmaras", countryCode: "TR", name: "Kahramanmaraş", lat: 37.5753, lng: 36.9228, adminName: "Akdeniz" },
  { id: "tr-adiyaman", countryCode: "TR", name: "Adıyaman", lat: 37.7648, lng: 38.2786, adminName: "Güneydoğu Anadolu" },
  { id: "tr-malatya", countryCode: "TR", name: "Malatya", lat: 38.3552, lng: 38.3095, adminName: "Doğu Anadolu" },
  { id: "tr-diyarbakir", countryCode: "TR", name: "Diyarbakır", lat: 37.9144, lng: 40.2306, adminName: "Güneydoğu Anadolu" },
  { id: "tr-mardin", countryCode: "TR", name: "Mardin", lat: 37.3122, lng: 40.7351, adminName: "Güneydoğu Anadolu" },
  { id: "tr-van", countryCode: "TR", name: "Van", lat: 38.5012, lng: 43.373, adminName: "Doğu Anadolu" },
  { id: "tr-izmir", countryCode: "TR", name: "İzmir", lat: 38.4237, lng: 27.1428, adminName: "Ege" },
  { id: "tr-bursa", countryCode: "TR", name: "Bursa", lat: 40.1828, lng: 29.0665, adminName: "Marmara" },
  { id: "tr-kayseri", countryCode: "TR", name: "Kayseri", lat: 38.7205, lng: 35.4826, adminName: "İç Anadolu" },
  { id: "tr-erzurum", countryCode: "TR", name: "Erzurum", lat: 39.9043, lng: 41.2679, adminName: "Doğu Anadolu" },
  { id: "tr-trabzon", countryCode: "TR", name: "Trabzon", lat: 41.0027, lng: 39.7168, adminName: "Karadeniz" },

  { id: "ye-sanaa", countryCode: "YE", name: "Sana", lat: 15.3694, lng: 44.191, aliases: ["Sanaa"] },
  { id: "ye-aden", countryCode: "YE", name: "Aden", lat: 12.7855, lng: 45.0187 },
  { id: "ye-taiz", countryCode: "YE", name: "Taiz", lat: 13.5795, lng: 44.0209 },
  { id: "ye-hodeidah", countryCode: "YE", name: "Hudeyde", lat: 14.7978, lng: 42.9545, aliases: ["Hodeidah"] }
];

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function citySearchText(city: CityOption) {
  return normalize([city.name, city.adminName, ...(city.aliases ?? [])].filter(Boolean).join(" "));
}

export function getCountryByCode(countryCode: string) {
  return countryOptions.find((country) => country.code === countryCode);
}

export function getCitiesForCountry(countryCode: string) {
  return cityOptions
    .filter((city) => city.countryCode === countryCode)
    .sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
}

export function searchCountries(query: string) {
  const normalized = normalize(query);
  if (!normalized) return countryOptions;
  return countryOptions.filter((country) => {
    return normalize([country.name, country.nativeName, country.code].filter(Boolean).join(" ")).includes(normalized);
  });
}

export function searchCitiesForCountry(countryCode: string, query: string) {
  const cities = getCitiesForCountry(countryCode);
  const normalized = normalize(query);
  if (!normalized) return cities;
  return cities.filter((city) => citySearchText(city).includes(normalized));
}

export function findCountryByName(name?: string | null) {
  const normalized = normalize(name);
  return countryOptions.find((country) => normalize(country.name) === normalized || normalize(country.nativeName) === normalized);
}

export function findCityById(id?: string | null) {
  return cityOptions.find((city) => city.id === id);
}

export function findCityByName(countryCode: string, name?: string | null) {
  const normalized = normalize(name);
  return getCitiesForCountry(countryCode).find((city) => {
    return normalize(city.name) === normalized || city.aliases?.some((alias) => normalize(alias) === normalized);
  });
}

export function findCityByCoordinates(countryCode: string, lat?: number | string | null, lng?: number | string | null) {
  const latNumber = typeof lat === "string" ? Number(lat) : lat;
  const lngNumber = typeof lng === "string" ? Number(lng) : lng;
  if (!Number.isFinite(latNumber) || !Number.isFinite(lngNumber)) return undefined;

  return getCitiesForCountry(countryCode).find((city) => {
    return Math.abs(city.lat - Number(latNumber)) < 0.08 && Math.abs(city.lng - Number(lngNumber)) < 0.08;
  });
}
