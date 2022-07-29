import create from "zustand";
import React from "react";
const useStore = create((set) => ({
  mainViewGroupRef: React.createRef(),
  listViewGroupRef: React.createRef(),
  // mode: "list",
  // setMode: (mode) => set({ mode }),
}));

export default useStore;
