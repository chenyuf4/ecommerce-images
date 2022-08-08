import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import "./App.scss";
import ListView from "./components/ListView/ListView";
import normalizeWheel from "normalize-wheel";
import { useRef, useCallback, useEffect } from "react";
import MobilePage from "components/MobilePage/MobilePage";
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
import { useMediaQuery } from "react-responsive";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import Stats from "components/Stats/Stats";
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
  const isBigScreen = useMediaQuery({ query: "(min-width: 1224px)" });
  const isLandscape = useMediaQuery({ query: "(orientation: landscape)" });
  const modeRef = useRef("list");
  const activeListViewImageRef = useRef(0);
  const onWheelHandler = useCallback(
    (e) => {
      if (!isBigScreen || !isLandscape) return;
      const scrollLimit =
        modeRef.current === "list"
          ? (numImages - 1) * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL)
          : (numRows - 1) * (IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y);
      const { pixelY } = normalizeWheel(e);
      const relativeSpeed = Math.min(Math.abs(pixelY), 100);
      const scrollSpeed = relativeSpeed * 0.01;
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
          modeRef.current === "list" &&
          finalActiveImage === -1 &&
          finalTargetPosList >= defaultPosX - IMAGE_WIDTH_SMALL / 2
        ) {
          finalActiveImage = index;
        }

        if (
          modeRef.current === "grid" &&
          finalActiveImage === -1 &&
          index % 3 === 0 &&
          (finalTargetPosGrid <= IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y ||
            Math.floor(index / 3) === Math.floor((numImages - 1) / 3))
        ) {
          finalActiveImage = index;
        }
      });

      // update center images state, position, scale when scrolling
      if (modeRef.current === "grid") {
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
    [isBigScreen, isLandscape, numImages, numRows]
  );

  useEffect(() => {
    window.addEventListener("wheel", onWheelHandler);
    return () => {
      window.removeEventListener("wheel", onWheelHandler);
    };
  }, [onWheelHandler]);

  return (
    <Router>
      <Routes>
        <Route
          path=""
          element={
            <>
              <Home
                canvasSizeRef={canvasSizeRef}
                scrollPosRef={scrollPosRef}
                activeListViewImageRef={activeListViewImageRef}
                modeRef={modeRef}
              />
              <Outlet />
              {!isBigScreen || !isLandscape ? (
                <MobilePage />
              ) : (
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
                  resize={{ scroll: true }}
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
                      canvasSizeRef={canvasSizeRef}
                      centerImagePosRef={centerImagePosRef}
                      scrollPosRef={scrollPosRef}
                      activeListViewImageRef={activeListViewImageRef}
                      modeRef={modeRef}
                    />
                    <ProgressBar
                      activeListViewImageRef={activeListViewImageRef}
                      scrollPosRef={scrollPosRef}
                      modeRef={modeRef}
                    />
                  </Suspense>
                </Canvas>
              )}
            </>
          }
        >
          <Route path="/debug" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
