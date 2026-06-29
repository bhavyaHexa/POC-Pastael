import React, { useEffect, useRef } from "react";
import {
  Canvas,
  FabricImage,
  Rect,
  Control,
  FabricObject,
  controlsUtils,
} from "fabric";
import { useBagStore } from "../store/bagStore";
import { cmToPx, pxToCm } from "../utils/scaling";
import { intersects } from "../utils/collision";
import { isInside } from "../utils/geometry";

interface CustomFabricObject extends FabricObject {
  data?: {
    type: "pouch" | "packingArea" | "bagBackground" | "boundaryLine";
    id?: string;
    productId?: string;
  };
}

// Define custom delete control outside the component
const deleteControl = new Control({
  x: 0.5,
  y: -0.5,
  offsetX: 12,
  offsetY: -12,
  cursorStyle: "pointer",
  mouseUpHandler: (eventData, transformData) => {
    void eventData;
    const target = transformData.target;
    const targetData = target ? (target as CustomFabricObject).data : null;
    if (targetData && targetData.id) {
      useBagStore.getState().removeProductInstance(targetData.id);
    }
    return true;
  },
  render: (ctx, left, top) => {
    ctx.save();
    ctx.translate(left, top);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(50, 40, 40, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw X
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(4, 4);
    ctx.moveTo(-4, 4);
    ctx.lineTo(4, -4);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  },
});

// Define custom rotate control
const rotateControl = new Control({
  x: -0.5,
  y: -0.5,
  offsetX: -12,
  offsetY: -12,
  cursorStyle: "alias",
  actionName: "rotate",
  actionHandler: controlsUtils.rotationWithSnapping,
  mouseUpHandler: (eventData, transformData) => {
    void eventData;
    const target = transformData.target;
    const targetData = target ? (target as CustomFabricObject).data : null;
    if (target && targetData && targetData.id) {
      const currentAngle = target.angle || 0;
      // Toggle rotation between 0 and 90
      const snapped =
        currentAngle % 180 === 90 || currentAngle % 180 === -90 ? 0 : 90;

      const storeState = useBagStore.getState();
      const instance = storeState.pocketInstances.find(
        (i) => i.id === targetData.id,
      );
      const product = instance
        ? storeState.products.find((p) => p.id === instance.pocketId)
        : null;
      if (product) {
        const newWidthCm = snapped === 90 ? product.heightCm : product.widthCm;
        const newHeightCm = snapped === 90 ? product.widthCm : product.heightCm;

        storeState.updatePlacement(targetData.id, {
          rotation: snapped as 0 | 90,
          widthCm: newWidthCm,
          heightCm: newHeightCm,
        });

        target.set({
          angle: snapped,
        });
        target.setCoords();
        target.canvas?.renderAll();
      }
    }
    return true;
  },
  render: (ctx, left, top) => {
    ctx.save();
    ctx.translate(left, top);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(40, 40, 50, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw rotation curved arrow
    ctx.beginPath();
    ctx.arc(-1, 1, 4, -Math.PI / 2, Math.PI, false);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.lineTo(-1, -2);
    ctx.lineTo(-3, 2);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore();
  },
});

export const BagCanvas: React.FC = () => {
  const {
    bag,
    placements,
    products,
    pocketInstances,
    updatePlacement,
    mode,
    removeProductInstance,
  } = useBagStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  // Use a ref to access the latest state in Fabric.js event handlers without stale closures
  const stateRef = useRef({
    placements,
    bag,
    products,
    pocketInstances,
    mode,
    updatePlacement,
    removeProductInstance,
  });

  useEffect(() => {
    stateRef.current = {
      placements,
      bag,
      products,
      pocketInstances,
      mode,
      updatePlacement,
      removeProductInstance,
    };
  }, [
    placements,
    bag,
    products,
    pocketInstances,
    mode,
    updatePlacement,
    removeProductInstance,
  ]);

  // Helper to validate a pouch's placement (inside compartments and no overlaps)
  const validatePlacement = (obj: FabricObject) => {
    const {
      bag: currentBag,
      placements: currentPlacements,
      products: currentProducts,
      pocketInstances: currentInstances,
    } = stateRef.current;

    const objData = (obj as CustomFabricObject).data;
    if (!currentBag || !objData?.id)
      return { isValid: false, xCm: 0, yCm: 0, rotation: 0 };

    const angle = obj.angle || 0;
    // Snap rotation: snap to 90 degrees if close, otherwise 0
    const snappedRotation =
      angle % 180 === 90 || angle % 180 === -90 || Math.abs(angle % 180) >= 135
        ? 90
        : 0;

    const instance = currentInstances.find((i) => i.id === objData.id);
    const product = instance
      ? currentProducts.find((p) => p.id === instance.pocketId)
      : null;
    if (!product) return { isValid: false, xCm: 0, yCm: 0, rotation: 0 };

    const newWidthCm =
      snappedRotation === 90 ? product.heightCm : product.widthCm;
    const newHeightCm =
      snappedRotation === 90 ? product.widthCm : product.heightCm;

    const cx = obj.left!;
    const cy = obj.top!;

    const proposedWidthPx = cmToPx(newWidthCm);
    const proposedHeightPx = cmToPx(newHeightCm);

    const proposedXPx = cx - proposedWidthPx / 2;
    const proposedYPx = cy - proposedHeightPx / 2;

    const newXCm = pxToCm(proposedXPx);
    const newYCm = pxToCm(proposedYPx);

    const proposedRect = {
      x: Number(newXCm.toFixed(2)),
      y: Number(newYCm.toFixed(2)),
      width: newWidthCm,
      height: newHeightCm,
    };

    // 1. Check inside container/compartments
    let insideBin = false;
    for (const bin of currentBag.packingAreasCm) {
      if (isInside(proposedRect, bin)) {
        insideBin = true;
        break;
      }
    }

    // 2. Check overlap with other fitted placements
    let overlaps = false;
    if (insideBin) {
      for (const pl of currentPlacements) {
        if (pl.id === objData.id || !pl.fitted) continue;
        const otherRect = {
          x: pl.xCm,
          y: pl.yCm,
          width: pl.widthCm,
          height: pl.heightCm,
        };
        if (intersects(proposedRect, otherRect)) {
          overlaps = true;
          break;
        }
      }
    }

    return {
      isValid: insideBin && !overlaps,
      insideBin,
      overlaps,
      xCm: proposedRect.x,
      yCm: proposedRect.y,
      rotation: snappedRotation,
    };
  };

  // Effect 1: Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const initialBag = stateRef.current.bag;
    const initialMode = stateRef.current.mode;
    if (!initialBag) return;

    const canvas = new Canvas(canvasRef.current, {
      width: cmToPx(initialBag.widthCm + 35),
      height: cmToPx(initialBag.heightCm),
      backgroundColor: "#f5f5f5",
      selection: initialMode === "manual",
      enableRetinaScaling: false,
    });

    fabricCanvasRef.current = canvas;

    // Register event listeners
    canvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj || (obj as CustomFabricObject).data?.type !== "pouch") return;

      const { insideBin, overlaps } = validatePlacement(obj);
      let color = "#007af5"; // Blue for staging / outside the bag
      if (insideBin) {
        color = overlaps ? "#f44336" : "#4CAF50"; // Red for overlap, Green for valid fit inside bag
      }
      obj.borderColor = color;
      obj.cornerColor = color;
      canvas.requestRenderAll();
    });

    canvas.on("object:rotating", (e) => {
      const obj = e.target;
      if (!obj || (obj as CustomFabricObject).data?.type !== "pouch") return;

      const { insideBin, overlaps } = validatePlacement(obj);
      let color = "#007af5";
      if (insideBin) {
        color = overlaps ? "#f44336" : "#4CAF50";
      }
      obj.borderColor = color;
      obj.cornerColor = color;
      canvas.requestRenderAll();
    });

    canvas.on("object:modified", (e) => {
      const obj = e.target;
      const objData = obj ? (obj as CustomFabricObject).data : null;
      if (!obj || objData?.type !== "pouch" || !objData.id) return;

      const { insideBin, overlaps, xCm, yCm, rotation } = validatePlacement(obj);
      const { placements: currentPlacements, updatePlacement: performUpdate } =
        stateRef.current;

      const placement = currentPlacements.find((p) => p.id === objData.id);

      if (placement) {
        const instance = stateRef.current.pocketInstances.find(
          (i) => i.id === objData.id,
        );
        const product = instance
          ? stateRef.current.products.find((p) => p.id === instance.pocketId)
          : null;

        if (product) {
          const newWidthCm =
            rotation === 90 ? product.heightCm : product.widthCm;
          const newHeightCm =
            rotation === 90 ? product.widthCm : product.heightCm;

          if (insideBin && !overlaps) {
            // Dropped inside a compartment, no overlap -> Fitted inside the bag
            performUpdate(objData.id, {
              xCm,
              yCm,
              rotation: rotation as 0 | 90,
              widthCm: newWidthCm,
              heightCm: newHeightCm,
              fitted: true,
            });
            obj.borderColor = "#007af5";
            obj.cornerColor = "#007af5";
          } else if (!insideBin) {
            // Dropped outside the compartments -> Unfitted, but allowed to stay outside the bag
            performUpdate(objData.id, {
              xCm,
              yCm,
              rotation: rotation as 0 | 90,
              widthCm: newWidthCm,
              heightCm: newHeightCm,
              fitted: false,
            });
            obj.borderColor = "#007af5";
            obj.cornerColor = "#007af5";
          } else {
            // Dropped inside a compartment but overlaps -> Revert position
            const cx = cmToPx(placement.xCm) + cmToPx(placement.widthCm) / 2;
            const cy = cmToPx(placement.yCm) + cmToPx(placement.heightCm) / 2;

            obj.set({
              left: cx,
              top: cy,
              angle: placement.rotation,
            });
            obj.setCoords();

            obj.borderColor = "#007af5";
            obj.cornerColor = "#007af5";

            console.log("Invalid placement (overlaps inside compartment): Reverted pouch position.");
          }
        }
      }

      canvas.requestRenderAll();
    });

    // Keyboard event listener for deleting selected pouch
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        stateRef.current.mode === "manual" &&
        (event.key === "Delete" || event.key === "Backspace")
      ) {
        const activeObject = canvas.getActiveObject();
        if (
          activeObject &&
          (activeObject as CustomFabricObject).data?.type === "pouch"
        ) {
          const objId = (activeObject as CustomFabricObject).data?.id;
          if (objId) {
            stateRef.current.removeProductInstance(objId);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Effect 2: Update canvas dimensions, background image, and packing area guides when bag changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !bag) return;

    const currentWidth = cmToPx(bag.widthCm);
    const currentHeight = cmToPx(bag.heightCm);
    const stagingWidth = cmToPx(bag.widthCm + 35);

    canvas.setDimensions({ width: stagingWidth, height: currentHeight });

    // Clear existing background image object if it exists
    const existingBg = canvas
      .getObjects()
      .find(
        (obj) => (obj as CustomFabricObject).data?.type === "bagBackground",
      );
    if (existingBg) {
      canvas.remove(existingBg);
    }

    // Clear existing boundary lines
    const existingBoundaries = canvas
      .getObjects()
      .filter(
        (obj) => (obj as CustomFabricObject).data?.type === "boundaryLine",
      );
    existingBoundaries.forEach((obj) => canvas.remove(obj));

    // Draw vertical boundary line between suitcase and staging area
    const borderLine = new Rect({
      left: currentWidth,
      top: 0,
      width: 2,
      height: currentHeight,
      fill: "#cccccc",
      selectable: false,
      evented: false,
      data: { type: "boundaryLine" },
    });
    canvas.add(borderLine);

    // Load background image as a standard non-selectable canvas object starting at top-left
    FabricImage.fromURL(bag.imageUrl)
      .then((img) => {
        if (!fabricCanvasRef.current) return;

        img.set({
          left: 0,
          top: 0,
          originX: "left",
          originY: "top",
          scaleX: currentWidth / img.width!,
          scaleY: currentHeight / img.height!,
          selectable: false,
          evented: false,
          hoverCursor: "default",
          data: { type: "bagBackground" },
        });

        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.renderAll();
      })
      .catch((err) =>
        console.error("Error loading bag background image:", err),
      );

    // Clear existing packing area rects
    const existingRects = canvas
      .getObjects()
      .filter(
        (obj) => (obj as CustomFabricObject).data?.type === "packingArea",
      );
    existingRects.forEach((obj) => canvas.remove(obj));

    // Draw packing areas
    bag.packingAreasCm.forEach((area) => {
      const rect = new Rect({
        left: cmToPx(area.x),
        top: cmToPx(area.y),
        width: cmToPx(area.width),
        height: cmToPx(area.height),
        originX: "left",
        originY: "top",
        fill: "transparent",
        stroke: "red",
        strokeDashArray: [4, 4],
        strokeWidth: 2,
        selectable: false,
        evented: false,
        data: { type: "packingArea" },
      });
      canvas.add(rect);
    });

    canvas.renderAll();
  }, [bag]);

  // Effect 3: Synchronize placements layer (all pouches)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !bag) return;

    canvas.selection = mode === "manual";

    const placementIds = placements.map((p) => p.id);

    // Remove pouch objects no longer in the placements list
    const existingPouches = canvas
      .getObjects()
      .filter((obj) => (obj as CustomFabricObject).data?.type === "pouch");
    existingPouches.forEach((obj) => {
      const objId = (obj as CustomFabricObject).data?.id;
      if (objId && !placementIds.includes(objId)) {
        canvas.remove(obj);
      }
    });

    // Update coordinates or add new ones
    placements.forEach((pl) => {
      const existingObj = existingPouches.find(
        (obj) => (obj as CustomFabricObject).data?.id === pl.id,
      );

      const instance = pocketInstances.find((i) => i.id === pl.id);
      const product = instance
        ? products.find((p) => p.id === instance.pocketId)
        : null;
      if (!product) return;

      const cx = cmToPx(pl.xCm) + cmToPx(pl.widthCm) / 2;
      const cy = cmToPx(pl.yCm) + cmToPx(pl.heightCm) / 2;

      if (existingObj) {
        // If not actively being dragged/modified by the user, synchronize its coordinates
        if (canvas.getActiveObject() !== existingObj) {
          existingObj.set({
            left: cx,
            top: cy,
            angle: pl.rotation,
          });

          existingObj.selectable = mode === "manual";
          existingObj.evented = mode === "manual";
          existingObj.hoverCursor = mode === "manual" ? "move" : "default";

          if (existingObj.controls.deleteControl) {
            existingObj.controls.deleteControl.visible = mode === "manual";
          }
          if (existingObj.controls.rotateControl) {
            existingObj.controls.rotateControl.visible = mode === "manual";
          }
          existingObj.setControlsVisibility({
            tl: false,
            tr: false,
            bl: false,
            br: false,
            ml: false,
            mr: false,
            mt: false,
            mb: false,
            mtr: false, // Hide standard rotate handle
          });

          existingObj.setCoords();
        }
      } else {
        // Load the pouch image dynamically
        FabricImage.fromURL(product.imageUrl)
          .then((img) => {
            if (!fabricCanvasRef.current) return;
            const imgW = cmToPx(product.widthCm);
            const imgH = cmToPx(product.heightCm);

            img.set({
              left: cx,
              top: cy,
              originX: "center",
              originY: "center",
              angle: pl.rotation,
              scaleX: imgW / img.width!,
              scaleY: imgH / img.height!,
              lockScalingX: true,
              lockScalingY: true,
              snapAngle: 90,
              snapThreshold: 45,
              borderColor: "#007af5",
              borderScaleFactor: 2.5,
              cornerColor: "#007af5",
              cornerSize: 8,
              transparentCorners: false,
              selectable: mode === "manual",
              evented: mode === "manual",
              hoverCursor: mode === "manual" ? "move" : "default",
              data: { type: "pouch", id: pl.id, productId: product.id },
            });

            // Assign controls and override visibility
            img.controls.deleteControl = deleteControl;
            img.controls.rotateControl = rotateControl;
            img.setControlsVisibility({
              tl: false,
              tr: false,
              bl: false,
              br: false,
              ml: false,
              mr: false,
              mt: false,
              mb: false,
              mtr: false, // Hide standard rotate handle
            });
            img.controls.deleteControl.visible = mode === "manual";
            img.controls.rotateControl.visible = mode === "manual";

            canvas.add(img);
            canvas.renderAll();
          })
          .catch((err) => console.error("Error loading pouch image:", err));
      }
    });

    // Make sure packing area rectangle guides stay behind pouches (but on top of background)
    const packingAreas = canvas
      .getObjects()
      .filter(
        (obj) => (obj as CustomFabricObject).data?.type === "packingArea",
      );
    packingAreas.forEach((obj) => canvas.sendObjectToBack(obj));

    // Ensure the background image stays at the absolute bottom layer (index 0) using moveObjectTo
    const bgImg = canvas
      .getObjects()
      .find(
        (obj) => (obj as CustomFabricObject).data?.type === "bagBackground",
      );
    if (bgImg) {
      canvas.moveObjectTo(bgImg, 0);
    }

    const bLine = canvas
      .getObjects()
      .find(
        (obj) => (obj as CustomFabricObject).data?.type === "boundaryLine",
      );
    if (bLine) {
      canvas.moveObjectTo(bLine, 1);
    }

    canvas.renderAll();
  }, [placements, mode, pocketInstances, products, bag]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>Interactive Fabric.js Layout</h3>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#f0f0f0",
          padding: "10px",
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
