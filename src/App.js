import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import "./App.scss";
import ListView from "./components/ListView/ListView";
import normalizeWheel from "normalize-wheel";
import { useRef, useCallback, useEffect } from "react";
import { imagesArr, IMAGE_GAP_SMALL, IMAGE_WIDTH_SMALL } from "util/utilFormat";
import ProgressBar from "components/ProgressBar/ProgressBar";
import Home from "components/Home/Home";
import { invalidate } from "@react-three/fiber";
function App() {
  const scrollPosRef = useRef({
    current: 0,
    target: 0,
    scrollSpeed: 0,
  });
  const numImages = imagesArr.length;
  const scrollLimit = (numImages - 1) * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
  const onWheelHandler = useCallback(
    (e) => {
      const { pixelY } = normalizeWheel(e);
      const relativeSpeed = Math.min(Math.abs(pixelY), 100);
      const scrollSpeed = relativeSpeed * (relativeSpeed < 40 ? 0.005 : 0.018);
      scrollPosRef.current.scrollSpeed = relativeSpeed;
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
      invalidate();
    },
    [scrollLimit]
  );

  useEffect(() => {
    window.addEventListener("wheel", onWheelHandler);
    return () => {
      window.removeEventListener("wheel", onWheelHandler);
    };
  }, [onWheelHandler]);

  return (
    <>
      <Home />
      <Canvas
        frameloop="demand"
        dpr={Math.max(window.devicePixelRatio, 2)}
        linear={true}
        flat={true}
        gl={{ antialias: true, alpha: true }}
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
          <ListView scrollPosRef={scrollPosRef} />
          <ProgressBar scrollPosRef={scrollPosRef} />
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
