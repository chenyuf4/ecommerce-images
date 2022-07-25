import create from "zustand";
import React from "react";
const useStore = create((set) => ({
  mode: "list", //default is list, other one is grid
  setMode: (mode) => set({ mode: mode }),
  // set((state) => {
  // const numImages = imagesArr.length;
  // const mainViewGroupRef = state.mainViewGroupRef;
  // const activeListViewImage = state.activeListViewImage;
  // const animatedImages = mainViewGroupRef.current.children.slice(
  //   activeListViewImage,
  //   Math.min(numImages, activeListViewImage + 4)
  // );
  // console.log(animatedImages);
  // animatedImages.forEach((item) => {
  //   gsap.to(item.position, {
  //     x: 15,
  //     duration: 0.9,
  //     onStart: () => invalidate(),
  //     onUpdate: () => invalidate(),
  //   });
  // });
  // gsap.to(animatedImages, { position: { x: 15 }, duration: 0.5 });

  // console.log(activeListViewImage);
  // return { mode: mode };
  // }),

  mainViewGroupRef: React.createRef(),
  activeListViewImage: 0,
  setActiveListViewImage: (index) =>
    set({
      activeListViewImage: index,
    }),

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
