import type { AppUser, Booking, Proof, Resource } from "@/types";

export const seedUsers: AppUser[] = [
  { id: "u_admin", email: "admin@example.com", fullName: "Alex Admin", role: "admin" },
  { id: "u_user", email: "user@example.com", fullName: "Uma User", role: "user" },
];

export const seedResources: Resource[] = [
  {
    id: "r_room_1",
    type: "room",
    name: "Aurora Meeting Room",
    description: "Bright meeting room with a projector and whiteboard.",
    photoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    isAvailable: true,
    location: "Floor 2 · Wing A",
    capacity: 10,
    equipment: ["Projector", "Whiteboard", "Conference phone"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "r_room_2",
    type: "room",
    name: "Nimbus Conference Room",
    description: "Large boardroom suitable for 20 people.",
    photoUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800",
    isAvailable: true,
    location: "Floor 3 · Wing B",
    capacity: 20,
    equipment: ["TV", "Video conferencing"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "r_car_1",
    type: "car",
    name: "Tesla Model 3",
    description: "Company electric car for short trips.",
    photoUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    isAvailable: true,
    licensePlate: "EV-123-AA",
    fuelType: "electric",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r_car_2",
    type: "car",
    name: "Toyota Corolla",
    description: "Reliable hybrid sedan.",
    photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
    isAvailable: false,
    licensePlate: "HY-456-BB",
    fuelType: "hybrid",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r_bike_1",
    type: "bike",
    name: "Honda Vario 160",
    description: "Skutik kantor untuk perjalanan singkat dalam kota.",
    photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
    isAvailable: true,
    licensePlate: "MT-789-CC",
    fuelType: "gasoline",
    engineCc: 160,
    createdAt: new Date().toISOString(),
  },
];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const plus = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

export const seedBookings: Booking[] = [
  {
    id: "b_1", resourceId: "r_room_1", userId: "u_user",
    date: plus(1), startTime: "09:00", endTime: "10:30",
    status: "approved", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "b_2", resourceId: "r_car_1", userId: "u_user",
    date: plus(2), startTime: "13:00", endTime: "16:00",
    status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "b_3", resourceId: "r_room_2", userId: "u_admin",
    date: plus(-2), startTime: "10:00", endTime: "11:00",
    status: "completed", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "b_4", resourceId: "r_car_1", userId: "u_user",
    date: plus(5), startTime: "08:00", endTime: "12:00",
    status: "approved", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

// extra seeds so the public calendar feels alive
seedBookings.push(
  {
    id: "b_5", resourceId: "r_room_2", userId: "u_user",
    date: plus(0), startTime: "14:00", endTime: "15:30",
    status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "b_6", resourceId: "r_room_1", userId: "u_admin",
    date: plus(3), startTime: "11:00", endTime: "12:00",
    status: "approved", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "b_7", resourceId: "r_car_2", userId: "u_user",
    date: plus(4), startTime: "09:30", endTime: "11:00",
    status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
);

export const seedProofs: Proof[] = [];