import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import useRefMounted from "util/useRefMounted";
import "./ProgressBarShaderMaterial";
import { imagesArr, IMAGE_GAP_SMALL, IMAGE_WIDTH_SMALL } from "util/utilFormat";
const PROGRESS_BAR_HEIGHT = 0.03;
const ProgressBar = ({ scrollPosRef }) => {
  const { viewport } = useThree();
  const { width, height } = viewport;
  const progressBarRef = useRef();
  const numImages = imagesArr.length;
  const mounted = useRefMounted();
  const updateProgressBar = useCallback(() => {
    const progressBarMaterial = progressBarRef.current.material;
    const scrollLimit = (numImages - 1) * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
    const percentage = Math.abs(scrollPosRef.current.current) / scrollLimit;
    const currentProgressBarRightValue = width * percentage - width / 2;
    progressBarMaterial.uniforms.left.value = -width / 2;
    progressBarMaterial.uniforms.right.value = currentProgressBarRightValue;
  }, [numImages, scrollPosRef, width]);
  useFrame(() => {
    if (!mounted.current) return;
    const { current, target } = scrollPosRef.current;
    if (current !== target) {
      updateProgressBar();
    }
  });
  return (
    <mesh
      ref={progressBarRef}
      position={[0, height / 2 - PROGRESS_BAR_HEIGHT / 2, 0]}
    >
      <planeBufferGeometry args={[width, PROGRESS_BAR_HEIGHT, 2048, 2048]} />
      <progressBarShaderMaterial left={-width / 2} right={-width / 2} />
    </mesh>
  );
};

export default ProgressBar;
