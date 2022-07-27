import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import "./App.scss";
import ListView from "./components/ListView/ListView";
import normalizeWheel from "normalize-wheel";
import { useRef, useCallback, useEffect } from "react";
import {
  imagesArr,
  IMAGE_GAP_SMALL,
  IMAGE_GRID_GAP_Y,
  IMAGE_GRID_HEIGHT,
  IMAGE_WIDTH_SMALL,
  IMAGE_Z_GAP_CENTER,
  imgListGroupPadding,
} from "util/utilFormat";
import ProgressBar from "components/ProgressBar/ProgressBar";
import Home from "components/Home/Home";
import { invalidate } from "@react-three/fiber";
import useStore from "store/useStore";
function App() {
  const scrollPosRef = useRef({
    current: 0,
    target: 0,
    scrollSpeed: 0,
  });
  const centerImagePosRef = useRef({
    targetZ: 0,
    currentZ: 0,
  });
  const numImages = imagesArr.length;
  const numRows = Math.ceil(numImages / 3);
  const canvasSizeRef = useRef({
    width: 0,
    height: 0,
  });
  const mode = useStore((state) => state.mode);
  const activeListViewImageRef = useRef(0);
  const onWheelHandler = useCallback(
    (e) => {
      const scrollLimit =
        mode === "list"
          ? (numImages - 1) * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL)
          : (numRows - 1) * (IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y);
      const { pixelY } = normalizeWheel(e);
      const relativeSpeed = Math.min(Math.abs(pixelY), 100);
      const scrollSpeed = relativeSpeed * (relativeSpeed < 40 ? 0.005 : 0.015);
      scrollPosRef.current.scrollSpeed = relativeSpeed;
      const defaultPosX =
        -canvasSizeRef.current.width / 2 +
        IMAGE_WIDTH_SMALL / 2 +
        imgListGroupPadding;
      let direction = "L";
      if (pixelY < 0) {
        direction = "R";
      } else {
        direction = "L";
      }

      // update target position
      let target =
        scrollPosRef.current.target +
        (direction === "L" ? -scrollSpeed : scrollSpeed);
      target = Math.max(-scrollLimit, Math.min(0, target));
      scrollPosRef.current.target = target;

      let finalActiveImage = -1;
      Array.from({ length: imagesArr.length }).forEach((_, index) => {
        // for list
        const defaultPosList =
          defaultPosX + index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
        const finalTargetPosList = defaultPosList + target;

        // for grid
        const row = Math.floor(index / 3);
        const defaultPosGrid =
          IMAGE_GRID_HEIGHT +
          IMAGE_GRID_GAP_Y -
          row * (IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y);
        const finalTargetPosGrid = defaultPosGrid - target;

        // calculate final active images
        if (
          mode === "list" &&
          finalActiveImage === -1 &&
          finalTargetPosList >= defaultPosX - IMAGE_WIDTH_SMALL / 2
        ) {
          finalActiveImage = index;
        }

        if (
          mode === "grid" &&
          finalActiveImage === -1 &&
          index % 3 === 0 &&
          (finalTargetPosGrid <= IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y ||
            Math.floor(index / 3) === Math.floor((numImages - 1) / 3))
        ) {
          finalActiveImage = index;
        }
      });

      // update center images state, position, scale when scrolling
      if (mode === "grid") {
        // mainViewGroupRef.current.children.forEach((item, index) => {
        //   item.position.x =
        //     canvasSizeRef.current.width / 2 +
        //     IMAGE_WIDTH_CENTER / 2 +
        //     (index - finalActiveImage);
        //   item.position.y = (index - finalActiveImage) * IMAGE_Y_GAP_CENTER;
        //   item.position.z = -(index - finalActiveImage) * IMAGE_Z_GAP_CENTER;
        //   item.scale.x = IMAGE_WIDTH_CENTER / 2;
        // });
        centerImagePosRef.current.targetZ =
          finalActiveImage * IMAGE_Z_GAP_CENTER;
        centerImagePosRef.current.currentZ =
          finalActiveImage * IMAGE_Z_GAP_CENTER;
      } else {
        centerImagePosRef.current.targetZ =
          finalActiveImage * IMAGE_Z_GAP_CENTER;
      }

      invalidate();
    },
    [mode, numImages, numRows]
  );

  useEffect(() => {
    window.addEventListener("wheel", onWheelHandler);
    return () => {
      window.removeEventListener("wheel", onWheelHandler);
    };
  }, [onWheelHandler]);
  return (
    <>
      <Home
        canvasSizeRef={canvasSizeRef}
        scrollPosRef={scrollPosRef}
        activeListViewImageRef={activeListViewImageRef}
      />
      <Canvas
        frameloop="demand"
        dpr={Math.max(window.devicePixelRatio, 2)}
        linear={true}
        flat={true}
        gl={{ antialias: true, alpha: true }}
        onCreated={(state) => {
          const { viewport } = state;
          const { width, height } = viewport;
          canvasSizeRef.current.width = width;
          canvasSizeRef.current.height = height;
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 5]}
            near={0.1}
            far={100}
            fov={75}
          />
          <color attach="background" args={["#ffffff"]} />
          <ListView
            centerImagePosRef={centerImagePosRef}
            scrollPosRef={scrollPosRef}
            activeListViewImageRef={activeListViewImageRef}
          />
          <ProgressBar
            activeListViewImageRef={activeListViewImageRef}
            scrollPosRef={scrollPosRef}
          />
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
