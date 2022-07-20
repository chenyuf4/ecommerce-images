import { useTexture } from "@react-three/drei";
import {
  imagesArr,
  IMAGE_GAP_SMALL,
  IMAGE_HEIGHT_SMALL,
  IMAGE_WIDTH_SMALL,
  IMAGE_Z_GAP_CENTER,
  IMAGE_Y_GAP_CENTER,
  IMAGE_HEIGHT_CENTER,
  IMAGE_WIDTH_CENTER,
  IMAGE_DIMENSION,
} from "util/utilFormat";
import useRefMounted from "util/useRefMounted";
import { useThree } from "@react-three/fiber";
import "./ImageShaderMaterial";
import { useCallback, useRef, useEffect, useState } from "react";
const CENTER_IMAGE_LERP_SLOW = 0.18;
const CENTER_IMAGE_LERP_FAST = 0.3;
const SmallImageBlock = ({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  return (
    <mesh
      position={[index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL), 0, 0]}
      scale={[IMAGE_WIDTH_SMALL, IMAGE_HEIGHT_SMALL, 1]}
    >
      <planeBufferGeometry args={[1, 1, 64, 64]} />
      <imageShaderMaterial
        planeDimension={[
          1,
          (IMAGE_HEIGHT_SMALL / IMAGE_WIDTH_SMALL) *
            (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
        ]}
        mode={0.0}
        tex={imgTexture}
        index={index}
      />
    </mesh>
  );
};

const CenterImageBlock = ({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  return (
    <mesh
      position={[0, index * IMAGE_Y_GAP_CENTER, -index * IMAGE_Z_GAP_CENTER]}
      scale={[IMAGE_WIDTH_CENTER, IMAGE_HEIGHT_CENTER, 1]}
    >
      <planeBufferGeometry args={[1, 1, 64, 64]} />
      <imageShaderMaterial
        gap={IMAGE_Z_GAP_CENTER}
        planeDimension={[
          1,
          (IMAGE_HEIGHT_CENTER / IMAGE_WIDTH_CENTER) *
            (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
        ]}
        tex={imgTexture}
        activeImage={0}
        index={index}
        mode={1.0}
      />
    </mesh>
  );
};

const ListView = ({ scrollPosRef, isScrolling, setIsScrolling }) => {
  const { viewport } = useThree();
  const { width, height } = viewport;
  const listViewGroupRef = useRef();
  const mainViewGroupRef = useRef();
  const animationRef = useRef(null);
  const mounted = useRefMounted();
  const activeImageRef = useRef(0);
  const centerAnimationRef = useRef(null);
  const centerImagePosRef = useRef({
    targetZ: 0,
    currentZ: 0,
  });
  const [activeUpdating, setActiveUpdating] = useState(false);
  const update = useCallback(() => {
    const { current, target } = scrollPosRef.current;
    const lerpValue = scrollPosRef.current.scrollSpeed >= 45 ? 0.1 : 0.2;
    let newCurrentPos = current + (target - current) * lerpValue;
    if (Math.abs(newCurrentPos - target) <= 0.01) {
      newCurrentPos = target;
    }
    // update images view at the bottom
    const imagesGroup = listViewGroupRef.current.children;
    let newActiveImage = -1;
    imagesGroup.forEach((imageMesh, index) => {
      const defaultPos = index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
      const newPos = defaultPos + newCurrentPos;
      if (newActiveImage === -1 && newPos >= -IMAGE_WIDTH_SMALL / 2) {
        newActiveImage = index;
      }
      imageMesh.position.x = newPos;
    });

    // update main images at the center
    const centerImagesGroup = mainViewGroupRef.current.children;
    const prevActiveImage = activeImageRef.current;
    // update only when active image is changed
    if (prevActiveImage !== newActiveImage) {
      centerImagesGroup.forEach((imageMesh) => {
        imageMesh.material.uniforms.activeImage.value = newActiveImage;
      });
      imagesGroup.forEach((imageMesh) => {
        imageMesh.material.uniforms.activeImage.value = newActiveImage;
      });
      centerImagePosRef.current.targetZ = newActiveImage * IMAGE_Z_GAP_CENTER;
      setActiveUpdating(true);
    }

    activeImageRef.current = newActiveImage;
    scrollPosRef.current.current = newCurrentPos;

    if (newCurrentPos === target) {
      setIsScrolling(false);
    } else {
      animationRef.current = window.requestAnimationFrame(update);
    }
  }, [scrollPosRef, setIsScrolling]);

  const updateCenterImages = useCallback(() => {
    const { currentZ, targetZ } = centerImagePosRef.current;
    const lerpValue =
      scrollPosRef.current.scrollSpeed >= 50
        ? CENTER_IMAGE_LERP_FAST
        : CENTER_IMAGE_LERP_SLOW;
    let newCurrentPosZ = currentZ + (targetZ - currentZ) * lerpValue;
    let newCurrentPosY =
      (currentZ + (targetZ - currentZ) * lerpValue) *
      (IMAGE_Y_GAP_CENTER / IMAGE_Z_GAP_CENTER);
    if (Math.abs(newCurrentPosZ - targetZ) <= 0.01) {
      newCurrentPosZ = targetZ;
      newCurrentPosY = (targetZ * 4) / 7;
    }
    const centerImagesGroup = mainViewGroupRef.current.children;
    centerImagesGroup.forEach((imageMesh, index) => {
      // position={[0, index * IMAGE_Y_GAP_CENTER, -index * IMAGE_Z_GAP_CENTER]}
      const defaultPosY = index * IMAGE_Y_GAP_CENTER;
      const defaultPosZ = -index * IMAGE_Z_GAP_CENTER;
      imageMesh.position.y = defaultPosY - newCurrentPosY;
      imageMesh.position.z = defaultPosZ + newCurrentPosZ;
    });

    centerImagePosRef.current.currentY = newCurrentPosY;
    centerImagePosRef.current.currentZ = newCurrentPosZ;

    // if (newCurrentPosZ !== targetZ) {
    centerAnimationRef.current =
      window.requestAnimationFrame(updateCenterImages);
  }, [scrollPosRef]);

  useEffect(() => {
    if (!mounted.current) return;
    if (!isScrolling) {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      if (!animationRef.current)
        animationRef.current = window.requestAnimationFrame(update);
    }
    return () => {
      animationRef.current && window.cancelAnimationFrame(animationRef.current);
    };
  }, [isScrolling, mounted, update]);

  useEffect(() => {
    if (!mounted.current) return;
    if (!activeUpdating) {
      if (centerAnimationRef.current) {
        window.cancelAnimationFrame(centerAnimationRef.current);
        centerAnimationRef.current = null;
      }
    } else {
      if (!centerAnimationRef.current)
        centerAnimationRef.current =
          window.requestAnimationFrame(updateCenterImages);
    }
    return () => {
      centerAnimationRef.current &&
        window.cancelAnimationFrame(centerAnimationRef.current);
    };
  }, [activeUpdating, mounted, updateCenterImages]);

  const imgListGroupPadding = 0.35;
  return (
    <>
      <group ref={mainViewGroupRef}>
        {imagesArr.map((url, index) => (
          <CenterImageBlock url={url} index={index} key={`center-${url}`} />
        ))}
      </group>
      <group
        ref={listViewGroupRef}
        position={[
          -width / 2 + IMAGE_WIDTH_SMALL / 2 + imgListGroupPadding,
          -height / 2 + IMAGE_HEIGHT_SMALL / 2 + imgListGroupPadding,
          0,
        ]}
      >
        {imagesArr.map((url, index) => (
          <SmallImageBlock url={url} index={index} key={`small-${url}`} />
        ))}
      </group>
    </>
  );
};

export default ListView;
