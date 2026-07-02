import { create } from "zustand";
import { MaxRectsPacker } from "maxrects-packer";
import type { BagTemplate, Pocket, Placement } from "../types";
import { findValidPlacement } from "../utils/placement";
import { BagConfigManager } from "../models/BagModels";

export interface BagState {
  bags: BagTemplate[];
  bag: BagTemplate | null;
  products: Pocket[];
  // Selected pocket instances (can contain duplicates of the same pocket template)
  pocketInstances: { id: string; pocketId: string; color?: string }[];
  // Current placement coordinates in cm
  placements: Placement[];
  mode: "auto" | "manual";
  zoom: number;

  // Actions
  setBag: (bagId: string) => void;
  addProductInstance: (pocketId: string) => void;
  updatePocketInstanceColor: (instanceId: string, color: string) => void;
  removeProductInstance: (instanceId: string) => void;
  updatePlacement: (placementId: string, updates: Partial<Placement>) => void;
  setMode: (mode: "auto" | "manual") => void;
  setZoom: (zoom: number) => void;
  reset: () => void;
  runAutoArrange: () => void;
  addPackingCube: () => void;
  addPackingCubeMedium: () => void;
  addPackingCubeLarge: () => void;
}

const configManager = BagConfigManager.getInstance();
const DEFAULT_BAGS = configManager.getBags();
const DEFAULT_PRODUCTS = configManager.getProducts();

const getDefaultColor = (product: Pocket): string | undefined =>
  product.colors?.[0]?.name ?? product.color;

const getManualPlacement = (
  product: Pocket,
  bag: BagTemplate,
  currentPlacements: Placement[]
): Placement => {
  const placementResult = findValidPlacement(
    product.widthCm,
    product.heightCm,
    currentPlacements,
    bag
  );

  if (placementResult.fitted) {
    return {
      id: "", // will be filled by caller
      xCm: placementResult.xCm,
      yCm: placementResult.yCm,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
      rotation: 0,
      fitted: true,
    };
  } else {
    // Position it in the staging area
    const unfittedPlacements = currentPlacements.filter((p) => !p.fitted);
    let currentX = bag.widthCm + 2;
    let currentY = 2;
    let colWidth = 0;

    for (const pl of unfittedPlacements) {
      if (pl.xCm >= currentX) {
        if (pl.yCm + pl.heightCm > currentY) {
          currentY = pl.yCm + pl.heightCm + 2;
        }
        colWidth = Math.max(colWidth, pl.widthCm);
      }
      if (currentY + product.heightCm > bag.heightCm - 2) {
        currentX += Math.max(colWidth, 15) + 2;
        currentY = 2;
        colWidth = 0;
      }
    }

    return {
      id: "",
      xCm: Number(currentX.toFixed(2)),
      yCm: Number(currentY.toFixed(2)),
      widthCm: product.widthCm,
      heightCm: product.heightCm,
      rotation: 0,
      fitted: false,
    };
  }
};

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
    const newInstance = {
      id: instanceId,
      pocketId,
      color: getDefaultColor(product),
    };

    set((state) => ({
      pocketInstances: [...state.pocketInstances, newInstance],
    }));

    if (mode === "auto") {
      get().runAutoArrange();
    } else {
      const placement = getManualPlacement(product, bag, placements);
      placement.id = instanceId;
      set((state) => ({
        placements: [...state.placements, placement],
      }));
    }
  },

  addPackingCube: () => {
    const { products, bag, placements, mode } = get();
    if (!bag) return;

    const largeProduct = products.find(p => p.id === 'pouch-S');
    const smallProduct = products.find(p => p.id === 'pouch-XS');
    if (!largeProduct || !smallProduct) return;

    const largeInstanceId = `pouch-S-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const smallInstanceId = `pouch-XS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newInstances = [
      {
        id: largeInstanceId,
        pocketId: 'pouch-S',
        color: getDefaultColor(largeProduct),
      },
      {
        id: smallInstanceId,
        pocketId: 'pouch-XS',
        color: getDefaultColor(smallProduct),
      },
    ];

    set((state) => ({
      pocketInstances: [...state.pocketInstances, ...newInstances]
    }));

    if (mode === 'auto') {
      get().runAutoArrange();
    } else {
      const currentPlacements = [...placements];

      const largePlacement = getManualPlacement(largeProduct, bag, currentPlacements);
      largePlacement.id = largeInstanceId;
      currentPlacements.push(largePlacement);

      const smallPlacement = getManualPlacement(smallProduct, bag, currentPlacements);
      smallPlacement.id = smallInstanceId;

      set((state) => ({
        placements: [...state.placements, largePlacement, smallPlacement],
      }));
    }
  },

  addPackingCubeMedium: () => {
    const { products, bag, placements, mode } = get();
    if (!bag) return;

    const mProduct = products.find((p) => p.id === "pouch-M");
    const lProduct = products.find((p) => p.id === "pouch-L");
    if (!mProduct || !lProduct) return;

    const mInstanceId = `pouch-M-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const lInstanceId = `pouch-L-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newInstances = [
      {
        id: mInstanceId,
        pocketId: "pouch-M",
        color: getDefaultColor(mProduct),
      },
      {
        id: lInstanceId,
        pocketId: "pouch-L",
        color: getDefaultColor(lProduct),
      },
    ];

    set((state) => ({
      pocketInstances: [...state.pocketInstances, ...newInstances],
    }));

    if (mode === "auto") {
      get().runAutoArrange();
    } else {
      const currentPlacements = [...placements];

      const mPlacement = getManualPlacement(mProduct, bag, currentPlacements);
      mPlacement.id = mInstanceId;
      currentPlacements.push(mPlacement);

      const lPlacement = getManualPlacement(lProduct, bag, currentPlacements);
      lPlacement.id = lInstanceId;

      set((state) => ({
        placements: [...state.placements, mPlacement, lPlacement],
      }));
    }
  },

  addPackingCubeLarge: () => {
    const { products, bag, placements, mode } = get();
    if (!bag) return;

    const xlProduct = products.find((p) => p.id === "pouch-XL");
    const xxlProduct = products.find((p) => p.id === "pouch-XXL");
    if (!xlProduct || !xxlProduct) return;

    const xlInstanceId = `pouch-XL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const xxlInstanceId = `pouch-XXL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newInstances = [
      {
        id: xlInstanceId,
        pocketId: "pouch-XL",
        color: getDefaultColor(xlProduct),
      },
      {
        id: xxlInstanceId,
        pocketId: "pouch-XXL",
        color: getDefaultColor(xxlProduct),
      },
    ];

    set((state) => ({
      pocketInstances: [...state.pocketInstances, ...newInstances],
    }));

    if (mode === "auto") {
      get().runAutoArrange();
    } else {
      const currentPlacements = [...placements];

      const xlPlacement = getManualPlacement(xlProduct, bag, currentPlacements);
      xlPlacement.id = xlInstanceId;
      currentPlacements.push(xlPlacement);

      const xxlPlacement = getManualPlacement(xxlProduct, bag, currentPlacements);
      xxlPlacement.id = xxlInstanceId;

      set((state) => ({
        placements: [...state.placements, xlPlacement, xxlPlacement],
      }));
    }
  },

  updatePocketInstanceColor: (instanceId, color) => {
    set((state) => ({
      pocketInstances: state.pocketInstances.map((inst) =>
        inst.id === instanceId ? { ...inst, color } : inst
      ),
    }));
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

    // 3. Mark items that didn't fit in either compartment and arrange them in the staging area
    let stagingX = bag.widthCm + 2;
    let stagingY = 2;
    let stagingColWidth = 0;

    const unfittedPlacements: Placement[] = finalRemainingInstances.map((instance) => {
      const product = products.find((p) => p.id === instance.pocketId)!;
      const width = product.widthCm;
      const height = product.heightCm;

      if (stagingY + height > bag.heightCm - 2 && stagingY > 2) {
        stagingX += stagingColWidth + 2;
        stagingY = 2;
        stagingColWidth = 0;
      }

      const placement = {
        id: instance.id,
        xCm: Number(stagingX.toFixed(2)),
        yCm: Number(stagingY.toFixed(2)),
        widthCm: width,
        heightCm: height,
        rotation: 0 as const,
        fitted: false,
      };

      stagingColWidth = Math.max(stagingColWidth, width);
      stagingY += height + 2;

      return placement;
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
