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

    const packCompartment = (
      bin: typeof leftBin,
      instancesToPack: typeof pocketInstances,
      allowRotation: boolean
    ) => {
      const placements: Placement[] = [];
      const fittedInstances: { id: string; product: Pocket }[] = [];

      for (const instance of instancesToPack) {
        const product = products.find((p) => p.id === instance.pocketId)!;

        // Reconstruct packer from scratch to prevent internal state issues
        const packer = new MaxRectsPacker(bin.width, bin.height, 0, {
          smart: false,
          pot: false,
          square: false,
          allowRotation,
        });

        for (const prev of fittedInstances) {
          packer.add(prev.product.widthCm, prev.product.heightCm, prev.id);
        }

        const rect = packer.add(
          product.widthCm,
          product.heightCm,
          instance.id
        );

        const fits =
          rect &&
          !rect.oversized &&
          packer.bins.length === 1 &&
          packer.bins[0].rects.includes(rect);

        if (fits) {
          fittedInstances.push({ id: instance.id, product });
          placements.push({
            id: instance.id,
            xCm: bin.x + rect.x,
            yCm: bin.y + rect.y,
            widthCm: rect.width,
            heightCm: rect.height,
            rotation: rect.rot ? 90 : 0,
            fitted: true,
          });
        }
      }

      const occupiedArea = fittedInstances.reduce(
        (sum, inst) => sum + inst.product.widthCm * inst.product.heightCm,
        0
      );

      return {
        placements,
        fittedCount: fittedInstances.length,
        occupiedArea,
      };
    };

    // Sort pocket instances by area (large to small) to improve packing density
    const sortedInstances = [...pocketInstances].sort((a, b) => {
      const pA = products.find((p) => p.id === a.pocketId)!;
      const pB = products.find((p) => p.id === b.pocketId)!;
      return pB.widthCm * pB.heightCm - pA.widthCm * pA.heightCm;
    });

    // 1. Pack Left compartment: try without and with rotation to find the best layout
    const leftNoRotation = packCompartment(leftBin, sortedInstances, false);
    const leftWithRotation = packCompartment(leftBin, sortedInstances, true);

    const useLeftRotated =
      leftWithRotation.fittedCount > leftNoRotation.fittedCount ||
      (leftWithRotation.fittedCount === leftNoRotation.fittedCount &&
        leftWithRotation.occupiedArea > leftNoRotation.occupiedArea);

    const leftResult = useLeftRotated ? leftWithRotation : leftNoRotation;

    // Determine remaining items that didn't fit on the left side
    const leftFittedIds = new Set(leftResult.placements.map((p) => p.id));
    const remainingInstances = sortedInstances.filter(
      (inst) => !leftFittedIds.has(inst.id)
    );

    // 2. Pack Right compartment (if it exists) with remaining items
    const rightPlacements: Placement[] = [];
    let finalRemainingInstances = remainingInstances;

    if (rightBin && remainingInstances.length > 0) {
      const rightNoRotation = packCompartment(rightBin, remainingInstances, false);
      const rightWithRotation = packCompartment(rightBin, remainingInstances, true);

      const useRightRotated =
        rightWithRotation.fittedCount > rightNoRotation.fittedCount ||
        (rightWithRotation.fittedCount === rightNoRotation.fittedCount &&
          rightWithRotation.occupiedArea > rightNoRotation.occupiedArea);

      const rightResult = useRightRotated ? rightWithRotation : rightNoRotation;
      rightPlacements.push(...rightResult.placements);

      const rightFittedIds = new Set(rightResult.placements.map((p) => p.id));
      finalRemainingInstances = remainingInstances.filter(
        (inst) => !rightFittedIds.has(inst.id)
      );
    }

    // 3. Mark items that didn't fit in either compartment
    const unfittedPlacements: Placement[] = finalRemainingInstances.map((instance) => {
      const product = products.find((p) => p.id === instance.pocketId)!;
      return {
        id: instance.id,
        xCm: 0,
        yCm: 0,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
        rotation: 0,
        fitted: false,
      };
    });

    // Combine all placements and set in state
    set({
      placements: [
        ...leftResult.placements,
        ...rightPlacements,
        ...unfittedPlacements,
      ],
    });
  },
}));
