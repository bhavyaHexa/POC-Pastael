export interface PackingArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BagTemplate {
  id: string;
  name: string;
  imageUrl: string;
  widthCm: number;
  heightCm: number;
  packingAreasCm: PackingArea[];
}
