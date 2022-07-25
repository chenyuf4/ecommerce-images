import create from "zustand";
import React from "react";
const useStore = create((set) => ({
  mode: "list", //default is list, other one is grid
  setMode: (mode) => set({ mode: mode }),
  mainViewGroupRef: React.createRef(),

  activeListViewImage: 0,
  setActiveListViewImage: (index) =>
    set({
      activeListViewImage: index,
    }),

  // canvas size
  canvasSize: {
    width: 0,
    height: 0,
  },
  setCanvasSize: (width, height) =>
    set({
      canvasSize: {
        width,
        height,
      },
    }),
}));

export default useStore;
