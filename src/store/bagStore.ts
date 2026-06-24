import { create } from "zustand";
import { MaxRectsPacker } from "maxrects-packer";
import type { BagTemplate, Pocket, Placement } from "../types";
import { findValidPlacement } from "../utils/placement";

export interface BagState {
  bags: BagTemplate[];
  bag: BagTemplate | null;
  products: Pocket[];
  // Selected pocket instances (can contain duplicates of the same pocket template)
  pocketInstances: { id: string; pocketId: string }[];
  // Current placement coordinates in cm
  placements: Placement[];
  mode: "auto" | "manual";
  zoom: number;

  // Actions
  setBag: (bagId: string) => void;
  addProductInstance: (pocketId: string) => void;
  removeProductInstance: (instanceId: string) => void;
  updatePlacement: (placementId: string, updates: Partial<Placement>) => void;
  setMode: (mode: "auto" | "manual") => void;
  setZoom: (zoom: number) => void;
  reset: () => void;
  runAutoArrange: () => void;
}

// Initial mock data based on the design document
const DEFAULT_BAGS: BagTemplate[] = [
  {
    id: "bag-default",
    name: "Suitcase",
    imageUrl: "/images/SuitCase.svg",
    widthCm: 80,
    heightCm: 55,
    packingAreasCm: [
      {
        x: 3.5,
        y: 4.0,
        width: 32.0,
        height: 47.0,
      },
      {
        x: 41,
        y: 4.0,
        width: 32.0,
        height: 47.0,
      },
    ],
  },
];

const DEFAULT_PRODUCTS: Pocket[] = [
  {
    id: "pouch-large",
    name: "Large Pouch",
    imageUrl: "/images/BigPouch.svg",
    widthCm: 20.9,
    heightCm: 26.0,
    canRotate: true,
  },
  {
    id: "pouch-small",
    name: "Small Pouch",
    imageUrl: "/images/SmallPouch.svg",
    widthCm: 10.9,
    heightCm: 24.9,
    canRotate: true,
  },
];

export const useBagStore = create<BagState>((set, get) => ({
  bags: DEFAULT_BAGS,
  bag: DEFAULT_BAGS[0],
  products: DEFAULT_PRODUCTS,
  pocketInstances: [],
  placements: [],
  mode: "auto",
  zoom: 1.0,

  setBag: (bagId) => {
    const selectedBag = get().bags.find((b) => b.id === bagId) || null;
    set({ bag: selectedBag });
    // Recalculate layout or reset placements if bag changes
    get().runAutoArrange();
  },

  addProductInstance: (pocketId) => {
    const { products, bag, placements, mode } = get();
    const product = products.find((p) => p.id === pocketId);
    if (!product || !bag) return;

    const instanceId = `${pocketId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newInstance = { id: instanceId, pocketId };

    set((state) => ({
      pocketInstances: [...state.pocketInstances, newInstance],
    }));

    if (mode === "auto") {
      get().runAutoArrange();
    } else {
      // Manual mode: find a valid non-overlapping location without resetting other placements
      const placementResult = findValidPlacement(
        product.widthCm,
        product.heightCm,
        placements,
        bag,
      );
      set((state) => ({
        placements: [
          ...state.placements,
          {
            id: instanceId,
            xCm: placementResult.xCm,
            yCm: placementResult.yCm,
            widthCm: product.widthCm,
            heightCm: product.heightCm,
            rotation: 0,
            fitted: placementResult.fitted,
          },
        ],
      }));
    }
  },

  removeProductInstance: (instanceId) => {
    set((state) => ({
      pocketInstances: state.pocketInstances.filter(
        (inst) => inst.id !== instanceId,
      ),
      placements: state.placements.filter((pl) => pl.id !== instanceId),
    }));

    if (get().mode === "auto") {
      get().runAutoArrange();
    }
  },

  updatePlacement: (placementId, updates) => {
    set((state) => ({
      placements: state.placements.map((pl) =>
        pl.id === placementId ? { ...pl, ...updates } : pl,
      ),
    }));
  },

  setMode: (mode) => {
    set({ mode });
    if (mode === "auto") {
      get().runAutoArrange();
    }
  },

  setZoom: (zoom) => set({ zoom }),

  reset: () => {
    set({
      bag: DEFAULT_BAGS[0],
      pocketInstances: [],
      placements: [],
      mode: "auto",
      zoom: 1.0,
    });
  },

  runAutoArrange: () => {
    const { bag, pocketInstances, products } = get();
    if (!bag || pocketInstances.length === 0) {
      set({ placements: [] });
      return;
    }

    const leftBin = bag.packingAreasCm[0];
    const rightBin =
      bag.packingAreasCm.length > 1 ? bag.packingAreasCm[1] : null;

    const packItems = (allowRotation: boolean) => {
      // Sort pocket instances by area (large to small) to improve packing density
      const sortedInstances = [...pocketInstances].sort((a, b) => {
        const pA = products.find((p) => p.id === a.pocketId)!;
        const pB = products.find((p) => p.id === b.pocketId)!;
        return pB.widthCm * pB.heightCm - pA.widthCm * pA.heightCm;
      });

      const placements: Placement[] = [];
      let allFitted = true;

      // Keep track of which items have successfully been fitted in each compartment
      const leftFitted: { id: string; product: Pocket }[] = [];
      const rightFitted: { id: string; product: Pocket }[] = [];

      for (const instance of sortedInstances) {
        const product = products.find((p) => p.id === instance.pocketId)!;

        // 1. Try packing in Left compartment
        // We reconstruct the left packer from scratch to prevent any internal state corruption
        const leftPacker = new MaxRectsPacker(
          leftBin.width,
          leftBin.height,
          0,
          {
            smart: false,
            pot: false,
            square: false,
            allowRotation,
          },
        );
        for (const prev of leftFitted) {
          leftPacker.add(prev.product.widthCm, prev.product.heightCm, prev.id);
        }
        const rectLeft = leftPacker.add(
          product.widthCm,
          product.heightCm,
          instance.id,
        );

        const fitsInLeft =
          rectLeft &&
          !rectLeft.oversized &&
          leftPacker.bins.length === 1 &&
          leftPacker.bins[0].rects.includes(rectLeft);

        if (fitsInLeft) {
          leftFitted.push({ id: instance.id, product });
          placements.push({
            id: instance.id,
            xCm: leftBin.x + rectLeft.x,
            yCm: leftBin.y + rectLeft.y,
            widthCm: rectLeft.width,
            heightCm: rectLeft.height,
            rotation: rectLeft.rot ? 90 : 0,
            fitted: true,
          });
        } else if (rightBin) {
          // 2. Try packing in Right compartment (if it exists)
          const rightPacker = new MaxRectsPacker(
            rightBin.width,
            rightBin.height,
            0,
            {
              smart: false,
              pot: false,
              square: false,
              allowRotation,
            },
          );
          for (const prev of rightFitted) {
            rightPacker.add(
              prev.product.widthCm,
              prev.product.heightCm,
              prev.id,
            );
          }
          const rectRight = rightPacker.add(
            product.widthCm,
            product.heightCm,
            instance.id,
          );

          const fitsInRight =
            rectRight &&
            !rectRight.oversized &&
            rightPacker.bins.length === 1 &&
            rightPacker.bins[0].rects.includes(rectRight);

          if (fitsInRight) {
            rightFitted.push({ id: instance.id, product });
            placements.push({
              id: instance.id,
              xCm: rightBin.x + rectRight.x,
              yCm: rightBin.y + rectRight.y,
              widthCm: rectRight.width,
              heightCm: rectRight.height,
              rotation: rectRight.rot ? 90 : 0,
              fitted: true,
            });
          } else {
            allFitted = false;
            // Unfitted pouch
            placements.push({
              id: instance.id,
              xCm: 0,
              yCm: 0,
              widthCm: product.widthCm,
              heightCm: product.heightCm,
              rotation: 0,
              fitted: false,
            });
          }
        } else {
          allFitted = false;
          // Unfitted pouch (no right bin available)
          placements.push({
            id: instance.id,
            xCm: 0,
            yCm: 0,
            widthCm: product.widthCm,
            heightCm: product.heightCm,
            rotation: 0,
            fitted: false,
          });
        }
      }
      return { placements, allFitted };
    };

    // Try packing without rotation first
    let result = packItems(false);

    // If some items didn't fit, try with rotation to see if we can pack more
    if (!result.allFitted) {
      const resultWithRotation = packItems(true);
      const fittedWithout = result.placements.filter((p) => p.fitted).length;
      const fittedWith = resultWithRotation.placements.filter(
        (p) => p.fitted,
      ).length;
      if (fittedWith > fittedWithout) {
        result = resultWithRotation;
      }
    }

    set({ placements: result.placements });
  },
}));
