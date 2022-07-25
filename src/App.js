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
  const scrollLimit = (numImages - 1) * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
  const canvasSize = useStore((state) => state.canvasSize);
  const { width } = canvasSize;
  const onWheelHandler = useCallback(
    (e) => {
      const { pixelY } = normalizeWheel(e);
      const relativeSpeed = Math.min(Math.abs(pixelY), 100);
      const scrollSpeed = relativeSpeed * (relativeSpeed < 40 ? 0.005 : 0.015);
      scrollPosRef.current.scrollSpeed = relativeSpeed;
      const defaultPosX =
        -width / 2 + IMAGE_WIDTH_SMALL / 2 + imgListGroupPadding;
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
        const defaultPos =
          defaultPosX + index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
        const finalTargetPos = defaultPos + target;
        if (
          finalActiveImage === -1 &&
          finalTargetPos >= defaultPosX - IMAGE_WIDTH_SMALL / 2
        ) {
          finalActiveImage = index;
        }
      });

      centerImagePosRef.current.targetZ = finalActiveImage * IMAGE_Z_GAP_CENTER;
      invalidate();
    },
    [scrollLimit, width]
  );

  useEffect(() => {
    window.addEventListener("wheel", onWheelHandler);
    return () => {
      window.removeEventListener("wheel", onWheelHandler);
    };
  }, [onWheelHandler]);
  const setCanvasSize = useStore((state) => state.setCanvasSize);
  return (
    <>
      <Home scrollPosRef={scrollPosRef} />
      <Canvas
        frameloop="demand"
        dpr={Math.max(window.devicePixelRatio, 2)}
        linear={true}
        flat={true}
        gl={{ antialias: true, alpha: true }}
        onCreated={(state) => {
          const { viewport } = state;
          const { width, height } = viewport;
          setCanvasSize(width, height);
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
          />
          <ProgressBar scrollPosRef={scrollPosRef} />
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
