import create from "zustand";
import React from "react";
const useStore = create((set) => ({
  mainViewGroupRef: React.createRef(),
  listViewGroupRef: React.createRef(),
}));

export default useStore;
