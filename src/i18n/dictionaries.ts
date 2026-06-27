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

  "status.pending": "Pending",
  "status.approved": "Approved",
  "status.in_use": "In Use",
  "status.finished": "Finished",
  "status.rejected": "Rejected",
  "status.completed": "Completed",
  "status.cancelled": "Cancelled",

  "booking.start": "Start Usage",
  "booking.finish": "Finish Usage",
  "booking.cancel": "Cancel booking",
  "booking.cameraOnlyHint": "Photos must be captured live from the device camera.",
  "booking.beforePhoto": "Before photo",
  "booking.afterPhoto": "After photo",
  "booking.needBeforePhoto": "Upload a 'before' photo to start usage.",
  "booking.needAfterPhoto": "Upload an 'after' photo to finish usage.",
  "booking.closeOnlyFinished": "You can only close bookings that the user has finished.",

  "admin.export": "Export bookings",
  "admin.exportTitle": "Export bookings (CSV)",
  "admin.exportFrom": "From",
  "admin.exportTo": "To",
  "admin.exportDownload": "Download CSV",
  "admin.notify": "Notify user",
  "admin.notifyMessage": "Message (optional)",
  "admin.notifySent": "Notification sent",
  "admin.groupRoom": "Rooms",
  "admin.groupCar": "Cars",
  "admin.groupBike": "Bikes",
  "admin.noneInGroup": "No bookings in this group.",
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

  "status.pending": "Menunggu",
  "status.approved": "Disetujui",
  "status.in_use": "Sedang Dipakai",
  "status.finished": "Selesai Pemakaian",
  "status.rejected": "Ditolak",
  "status.completed": "Selesai",
  "status.cancelled": "Dibatalkan",

  "booking.start": "Mulai Pemakaian",
  "booking.finish": "Selesai Pemakaian",
  "booking.cancel": "Batalkan pemesanan",
  "booking.cameraOnlyHint": "Foto harus diambil langsung dari kamera perangkat.",
  "booking.beforePhoto": "Foto sebelum",
  "booking.afterPhoto": "Foto sesudah",
  "booking.needBeforePhoto": "Unggah foto 'sebelum' untuk memulai pemakaian.",
  "booking.needAfterPhoto": "Unggah foto 'sesudah' untuk menyelesaikan pemakaian.",
  "booking.closeOnlyFinished": "Hanya pemesanan yang telah diselesaikan pengguna yang dapat ditutup.",

  "admin.export": "Ekspor pemesanan",
  "admin.exportTitle": "Ekspor pemesanan (CSV)",
  "admin.exportFrom": "Dari",
  "admin.exportTo": "Sampai",
  "admin.exportDownload": "Unduh CSV",
  "admin.notify": "Beri tahu pengguna",
  "admin.notifyMessage": "Pesan (opsional)",
  "admin.notifySent": "Notifikasi terkirim",
  "admin.groupRoom": "Ruangan",
  "admin.groupCar": "Mobil",
  "admin.groupBike": "Motor",
  "admin.noneInGroup": "Tidak ada pemesanan pada grup ini.",
};

export const dictionaries: Record<Language, Dict> = { en, id };