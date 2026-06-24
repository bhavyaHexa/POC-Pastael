// Custom hook usePacking placeholder
export function usePacking() {
  const packItems = () => {
    console.log("usePacking: packItems called");
  };

  return {
    packItems,
  };
}
