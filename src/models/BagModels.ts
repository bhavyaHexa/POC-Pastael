import type { BagTemplate, Pocket, PackingArea } from "../types";
import rawConfig from "../config/bagConfig.json";

export class Bag implements BagTemplate {
  public id: string;
  public name: string;
  public imageUrl: string;
  public widthCm: number;
  public heightCm: number;
  public depthCm: number;
  public packingAreasCm: PackingArea[];

  constructor(data: BagTemplate) {
    this.id = data.id;
    this.name = data.name;
    this.imageUrl = data.imageUrl;
    this.widthCm = data.widthCm;
    this.heightCm = data.heightCm;
    this.depthCm = data.depthCm;
    this.packingAreasCm = data.packingAreasCm;
  }

  // Get total usable area of all compartments in cm2
  public getTotalUsableAreaCm2(): number {
    return this.packingAreasCm.reduce((sum, area) => sum + area.width * area.height, 0);
  }

  // Check if a point (x, y) in cm is within any compartment
  public isInsideAnyCompartment(x: number, y: number, width: number, height: number): boolean {
    return this.packingAreasCm.some(
      (area) =>
        x >= area.x &&
        y >= area.y &&
        x + width <= area.x + area.width &&
        y + height <= area.y + area.height
    );
  }
}

export class PocketPouch implements Pocket {
  public id: string;
  public name: string;
  public imageUrl: string;
  public widthCm: number;
  public heightCm: number;
  public canRotate: boolean;

  constructor(data: Pocket) {
    this.id = data.id;
    this.name = data.name;
    this.imageUrl = data.imageUrl;
    this.widthCm = data.widthCm;
    this.heightCm = data.heightCm;
    this.canRotate = data.canRotate;
  }

  // Get area in cm2
  public getAreaCm2(): number {
    return this.widthCm * this.heightCm;
  }
}

export class BagConfigManager {
  private static instance: BagConfigManager;
  private bags: Bag[] = [];
  private products: PocketPouch[] = [];

  private constructor() {
    this.loadConfig();
  }

  public static getInstance(): BagConfigManager {
    if (!BagConfigManager.instance) {
      BagConfigManager.instance = new BagConfigManager();
    }
    return BagConfigManager.instance;
  }

  private loadConfig() {
    this.bags = rawConfig.bags.map((b) => new Bag(b));
    this.products = rawConfig.products.map((p) => new PocketPouch(p));
  }

  public getBags(): Bag[] {
    return this.bags;
  }

  public getProducts(): PocketPouch[] {
    return this.products;
  }

  public getBagById(id: string): Bag | null {
    return this.bags.find((b) => b.id === id) || null;
  }

  public getProductById(id: string): PocketPouch | null {
    return this.products.find((p) => p.id === id) || null;
  }
}
