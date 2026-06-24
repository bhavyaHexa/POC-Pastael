// Custom hook useDrag placeholder
export function useDrag() {
  const handleDragStart = () => {
    console.log("Drag started");
  };

  const handleDragMove = () => {
    console.log("Dragging");
  };

  const handleDragEnd = () => {
    console.log("Drag ended");
  };

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
