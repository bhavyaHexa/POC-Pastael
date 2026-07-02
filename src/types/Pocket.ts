export interface PocketColor {
  name: string;
  imageUrl: string;
}

export interface Pocket {
  id: string;
  name: string;
  imageUrl: string;
  widthCm: number;
  heightCm: number;
  canRotate: boolean;
  color?: string;
  colors?: PocketColor[];
}
