export type Trip = {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  date: string;
  title: string;
  description: string;
  photos: string[];
};

export const trips: Trip[] = [];
