import React from "react";
import { useBagStore } from "../store/bagStore";

export const ProductList: React.FC = () => {
  const {
    products,
    pocketInstances,
    placements,
    removeProductInstance,
    bag,
    addPackingCube,
    addPackingCubeMedium,
    addPackingCubeLarge,
  } = useBagStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h3 style={{ margin: "0 0 15px 0" }}>Product Selection</h3>

      {/* Available Pockets buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={addPackingCube}
          style={{
            padding: "10px 15px",
            border: "1px solid #c678dd",
            background: "#fdf6ff",
            color: "#7c3a96",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            width: "100%",
            transition: "background 0.2s",
          }}
        >
          Packing Cube (Small)
        </button>
        <button
          onClick={addPackingCubeMedium}
          style={{
            padding: "10px 15px",
            border: "1px solid #61afef",
            background: "#f0f7ff",
            color: "#2c78c7",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            width: "100%",
            transition: "background 0.2s",
          }}
        >
          Packing Cube (Medium)
        </button>
        <button
          onClick={addPackingCubeLarge}
          style={{
            padding: "10px 15px",
            border: "1px solid #98c379",
            background: "#f5fbf0",
            color: "#3e781e",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            width: "100%",
            transition: "background 0.2s",
          }}
        >
          Packing Cube (Large)
        </button>
      </div>

      {/* Fitted instances list */}
      <h4 style={{ margin: "0 0 10px 0" }}>Selected Pockets (Fitted)</h4>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "15px",
        }}
      >
        {pocketInstances.filter(
          (inst) => placements.find((p) => p.id === inst.id)?.fitted,
        ).length === 0 ? (
          <div
            style={{ color: "#888", fontStyle: "italic", padding: "10px 0" }}
          >
            No pockets fitted in the bag yet.
          </div>
        ) : (
          pocketInstances
            .filter((inst) => placements.find((p) => p.id === inst.id)?.fitted)
            .map((instance) => {
              const product = products.find((p) => p.id === instance.pocketId)!;
              const placement = placements.find((pl) => pl.id === instance.id)!;

              return (
                <div
                  key={instance.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#f9f9f9",
                    border: "1px solid #eee",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "30px",
                        height: "20px",
                        objectFit: "contain",
                      }}
                    />
                    <div style={{ color: "#222" }}>
                      <span style={{ fontWeight: 600 }}>{product.name}</span>
                      <div
                        style={{
                          fontSize: "0.8em",
                          color: "#555",
                          marginTop: "2px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <div>
                          Size: {product.widthCm}x{product.heightCm} cm
                        </div>
                        {(() => {
                          const leftBin = bag?.packingAreasCm[0];
                          const rightBin = bag?.packingAreasCm[1] || leftBin;
                          const bin = placement.xCm < 35.0 ? leftBin : rightBin;
                          const offsetX = bin ? placement.xCm - bin.x : 0;
                          const offsetY = bin ? placement.yCm - bin.y : 0;

                          return (
                            <>
                              <div
                                style={{
                                  color:
                                    placement.xCm < 35.0
                                      ? "#2e7d32"
                                      : "#1565c0",
                                  fontWeight: 600,
                                }}
                              >
                                Placed:{" "}
                                {placement.xCm < 35.0
                                  ? "Left Side"
                                  : "Right Side"}
                              </div>
                              <div>
                                Offset: x: {offsetX.toFixed(1)}cm, y:{" "}
                                {offsetY.toFixed(1)}cm
                              </div>
                              <div>
                                Box: {placement.widthCm.toFixed(1)}x
                                {placement.heightCm.toFixed(1)} cm
                              </div>
                              <div>Rotation: {placement.rotation}°</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeProductInstance(instance.id)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#d32f2f",
                      cursor: "pointer",
                      fontSize: "1.2em",
                      padding: "4px",
                    }}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              );
            })
        )}
      </div>

      {/* Unfitted instances alert panel */}
      {(() => {
        const unfitted = pocketInstances.filter((inst) => {
          const placement = placements.find((p) => p.id === inst.id);
          return placement ? !placement.fitted : true;
        });

        if (unfitted.length === 0) return null;

        return (
          <div
            style={{
              background: "#fff2f2",
              border: "1px solid #ffcdd2",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "160px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                color: "#d32f2f",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.9em",
              }}
            >
              <span>⚠️</span>
              <span>Unfitted Items Alert ({unfitted.length})</span>
            </div>
            <div style={{ fontSize: "0.8em", color: "#555" }}>
              These items cannot fit in the compartments:
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {unfitted.map((instance) => {
                const product = products.find(
                  (p) => p.id === instance.pocketId,
                )!;
                return (
                  <div
                    key={instance.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fff",
                      border: "1px solid #ffebee",
                      padding: "6px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85em",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      {product.name} ({product.widthCm}x{product.heightCm} cm)
                    </span>
                    <button
                      onClick={() => removeProductInstance(instance.id)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#d32f2f",
                        cursor: "pointer",
                        fontSize: "1.1em",
                        padding: "2px",
                      }}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
