export const LANGUAGES = ["en", "id"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

type Dict = Record<string, string>;

const en: Dict = {
  "app.name": "SILAP Aset",
  "app.fullName": "Sistem Informasi Laporan Pemakaian Aset",
  "app.tagline": "Public booking calendar",

  "nav.dashboard": "Dashboard",
  "nav.resources": "Resources",
  "nav.myBookings": "My Bookings",
  "nav.calendar": "Calendar",
  "nav.admin": "Admin",
  "nav.workspace": "Workspace",

  "action.signIn": "Sign in",
  "action.signOut": "Sign out",
  "action.createAccount": "Create account",
  "action.goHome": "Go home",

  "theme.toggle": "Toggle theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "language.toggle": "Change language",

  "resource.type.room": "Room",
  "resource.type.car": "Car",
  "resource.type.bike": "Bike",
  "resource.types.rooms": "Rooms",
  "resource.types.cars": "Cars",
  "resource.types.bikes": "Bikes",
  "resource.types.all": "All types",
  "resource.availability.any": "Any availability",
  "resource.availability.available": "Available only",
  "resource.available": "Available",
  "resource.unavailable": "Unavailable",
  "resource.search": "Search resources...",
};

const id: Dict = {
  "app.name": "SILAP Aset",
  "app.fullName": "Sistem Informasi Laporan Pemakaian Aset",
  "app.tagline": "Kalender pemesanan publik",

  "nav.dashboard": "Dasbor",
  "nav.resources": "Aset",
  "nav.myBookings": "Pemesanan Saya",
  "nav.calendar": "Kalender",
  "nav.admin": "Admin",
  "nav.workspace": "Ruang Kerja",

  "action.signIn": "Masuk",
  "action.signOut": "Keluar",
  "action.createAccount": "Buat akun",
  "action.goHome": "Ke beranda",

  "theme.toggle": "Ubah tema",
  "theme.light": "Terang",
  "theme.dark": "Gelap",
  "language.toggle": "Ubah bahasa",

  "resource.type.room": "Ruangan",
  "resource.type.car": "Mobil",
  "resource.type.bike": "Motor",
  "resource.types.rooms": "Ruangan",
  "resource.types.cars": "Mobil",
  "resource.types.bikes": "Motor",
  "resource.types.all": "Semua tipe",
  "resource.availability.any": "Semua ketersediaan",
  "resource.availability.available": "Hanya tersedia",
  "resource.available": "Tersedia",
  "resource.unavailable": "Tidak tersedia",
  "resource.search": "Cari aset...",
};

export const dictionaries: Record<Language, Dict> = { en, id };