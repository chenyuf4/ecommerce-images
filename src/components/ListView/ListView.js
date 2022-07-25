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
  IMAGE_GRID_HEIGHT,
  IMAGE_GRID_WIDTH,
  IMAGE_GRID_GAP_X,
  IMAGE_GRID_GAP_Y,
} from "util/utilFormat";
import useRefMounted from "util/useRefMounted";
import { easings } from "@react-spring/three";
import { useFrame, useThree } from "@react-three/fiber";
import "./ImageShaderMaterial";
import { useCallback, useRef } from "react";
import * as THREE from "three";
import useStore from "store/useStore";
import { useSpring, a } from "@react-spring/three";

const CENTER_IMAGE_LERP_SLOW = 0.075;
const CENTER_IMAGE_LERP_FAST = 0.12;
const imgListGroupPadding = 0.35;

const planeGeo = new THREE.PlaneBufferGeometry(1, 1);
const SmallImageBlock = ({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  const mode = useStore((state) => state.mode);
  const meshRef = useRef();
  const { viewport, invalidate } = useThree();
  const activeListViewImage = useStore((state) => state.activeListViewImage);
  const { width, height } = viewport;

  const getGridPosByIndex = () => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    // default top left corner position
    const leftTopX = width / 2 - 2.5 * IMAGE_GRID_WIDTH - 3 * IMAGE_GRID_GAP_X;
    const leftTopY = IMAGE_GRID_GAP_Y + IMAGE_GRID_HEIGHT;
    const currentX = leftTopX + col * (IMAGE_GRID_GAP_X + IMAGE_GRID_WIDTH);
    const activeImageRow = Math.floor(activeListViewImage / 3);
    const currentY =
      leftTopY +
      (activeImageRow - row) * (IMAGE_GRID_GAP_Y + IMAGE_GRID_HEIGHT);
    return { x: currentX, y: currentY };
  };

  const { posX, posY } = useSpring({
    posX:
      mode === "grid"
        ? getGridPosByIndex().x
        : -width / 2 +
          IMAGE_WIDTH_SMALL / 2 +
          imgListGroupPadding +
          (index - activeListViewImage) * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL),
    posY:
      mode === "grid"
        ? getGridPosByIndex().y
        : -height / 2 + IMAGE_HEIGHT_SMALL / 2 + imgListGroupPadding,
    onChange: () => invalidate(),
    onStart: () => invalidate(),
    onProps: () => invalidate(),
    delay: mode === "grid" ? 120 : 0,
    config: {
      precision: 0.001,
      duration: 750,
      easing: easings.easeOutQuart,
    },
  });

  const { scaleX, scaleY } = useSpring({
    scaleX: mode === "grid" ? IMAGE_GRID_WIDTH : IMAGE_WIDTH_SMALL,
    scaleY: mode === "grid" ? IMAGE_GRID_HEIGHT : IMAGE_HEIGHT_SMALL,
    onChange: (e) => {
      const valueX = e.value.scaleX;
      const valueY = e.value.scaleY;
      meshRef.current.material.uniforms.planeDimension.value = [
        1,
        (valueY / valueX) * (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
      ];
      invalidate();
    },
    onStart: () => invalidate(),
    onProps: () => invalidate(),
    delay: mode === "grid" ? 120 : 0,
    config: {
      precision: 0.001,
      duration: 750,
      easing: easings.easeOutQuart,
    },
  });
  return (
    <a.mesh
      ref={meshRef}
      position-x={posX}
      position-y={posY}
      position-z={0}
      // position={[
      //   -width / 2 +
      //     IMAGE_WIDTH_SMALL / 2 +
      //     imgListGroupPadding +
      //     index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL),
      //   -height / 2 + IMAGE_HEIGHT_SMALL / 2 + imgListGroupPadding,
      //   0,
      // ]}
      scale-x={scaleX}
      scale-y={scaleY}
      scale-z={1}
      // scale={[IMAGE_WIDTH_SMALL, IMAGE_HEIGHT_SMALL, 1]}
      geometry={planeGeo}
    >
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
    </a.mesh>
  );
};

const CenterImageBlock = ({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  const mode = useStore((state) => state.mode);
  const meshRef = useRef();
  const { viewport, invalidate } = useThree();
  const activeListViewImage = useStore((state) => state.activeListViewImage);
  const { width } = viewport;
  const { posX } = useSpring({
    posX:
      mode === "grid" &&
      index >= activeListViewImage &&
      index < Math.min(activeListViewImage + 4, imagesArr.length)
        ? width / 2 +
          (IMAGE_WIDTH_CENTER * 0.7) / 2 +
          (index - activeListViewImage)
        : 0,
    onChange: () => invalidate(),
    onStart: () => invalidate(),
    onProps: () => invalidate(),
    delay:
      mode === "grid"
        ? (index - activeListViewImage) * 40
        : (index - activeListViewImage + 5) * 40,
    config: {
      precision: 0.001,
      duration: 900,
      easing: easings.easeOutQuart,
    },
  });

  const { scaleX } = useSpring({
    scaleX:
      mode === "grid" &&
      index >= activeListViewImage &&
      index < Math.min(activeListViewImage + 4, imagesArr.length)
        ? IMAGE_WIDTH_CENTER * 0.6
        : IMAGE_WIDTH_CENTER,
    onChange: (e) => {
      const value = e.value.scaleX;
      meshRef.current.material.uniforms.planeDimension.value = [
        value / IMAGE_WIDTH_CENTER,
        (IMAGE_HEIGHT_CENTER / IMAGE_WIDTH_CENTER) *
          (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
      ];
      invalidate();
    },
    onStart: () => invalidate(),
    onProps: () => invalidate(),
    delay:
      mode === "grid"
        ? (index - activeListViewImage) * 35
        : (index - activeListViewImage + 5) * 35,
    config: {
      precision: 0.001,
      duration: 1000,
      easing: easings.easeOutSine,
    },
  });
  return (
    <a.mesh
      ref={meshRef}
      position-x={posX}
      position-y={index * IMAGE_Y_GAP_CENTER}
      position-z={-index * IMAGE_Z_GAP_CENTER}
      scale-x={scaleX}
      scale-y={IMAGE_HEIGHT_CENTER}
      scale-z={1}
      geometry={planeGeo}
    >
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
    </a.mesh>
  );
};

const ListView = ({ scrollPosRef, centerImagePosRef }) => {
  const { viewport, invalidate } = useThree();
  const { width, height } = viewport;
  const listViewGroupRef = useRef();
  console.log("render");
  const mounted = useRefMounted();
  const activeImageRef = useRef(0);
  const mainViewGroupRef = useStore((state) => state.mainViewGroupRef);
  const setActiveListViewImage = useStore(
    (state) => state.setActiveListViewImage
  );

  const update = useCallback(() => {
    const { current, target } = scrollPosRef.current;
    const lerpValue = scrollPosRef.current.scrollSpeed >= 45 ? 0.08 : 0.12;
    let newCurrentPos = current + (target - current) * lerpValue;
    if (Math.abs(newCurrentPos - target) <= 0.02) {
      newCurrentPos = target;
    }
    // update images view at the bottom
    const imagesGroup = listViewGroupRef.current.children;
    let newActiveImage = -1;
    imagesGroup.forEach((imageMesh, index) => {
      const defaultPos =
        -width / 2 +
        IMAGE_WIDTH_SMALL / 2 +
        imgListGroupPadding +
        index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
      const newPos = defaultPos + newCurrentPos;
      if (newActiveImage === -1 && newPos >= -width / 2 + imgListGroupPadding) {
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
    }

    activeImageRef.current = newActiveImage;
    setActiveListViewImage(newActiveImage);
    scrollPosRef.current.current = newCurrentPos;
    if (newCurrentPos !== scrollPosRef.current.target) invalidate();
  }, [
    invalidate,
    mainViewGroupRef,
    scrollPosRef,
    setActiveListViewImage,
    width,
  ]);

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
    if (Math.abs(newCurrentPosZ - targetZ) <= 0.02) {
      newCurrentPosZ = targetZ;
      newCurrentPosY = (targetZ * 4) / 7;
    }
    const centerImagesGroup = mainViewGroupRef.current.children;
    centerImagesGroup.forEach((imageMesh, index) => {
      const defaultPosY = index * IMAGE_Y_GAP_CENTER;
      const defaultPosZ = -index * IMAGE_Z_GAP_CENTER;
      imageMesh.position.y = defaultPosY - newCurrentPosY;
      imageMesh.position.z = defaultPosZ + newCurrentPosZ;
    });

    centerImagePosRef.current.currentY = newCurrentPosY;
    centerImagePosRef.current.currentZ = newCurrentPosZ;
    if (newCurrentPosZ !== centerImagePosRef.current.targetZ) invalidate();
  }, [centerImagePosRef, invalidate, mainViewGroupRef, scrollPosRef]);

  useFrame(() => {
    if (!mounted.current) return;
    const { current, target } = scrollPosRef.current;
    if (current !== target) update();

    const { currentZ, targetZ } = centerImagePosRef.current;
    if (currentZ !== targetZ) updateCenterImages();
  });

  // improve: use shared image texture instead of create one every time
  return (
    <>
      <group
        ref={(node) => {
          mainViewGroupRef.current = node;
        }}
      >
        {imagesArr.map((url, index) => (
          <CenterImageBlock url={url} index={index} key={`center-${url}`} />
        ))}
      </group>
      <group
        ref={listViewGroupRef}
        // position={[
        //   -width / 2 + IMAGE_WIDTH_SMALL / 2 + imgListGroupPadding,
        //   -height / 2 + IMAGE_HEIGHT_SMALL / 2 + imgListGroupPadding,
        //   0,
        // ]}
      >
        {imagesArr.map((url, index) => (
          <SmallImageBlock url={url} index={index} key={`small-${url}`} />
        ))}
      </group>
    </>
  );
};

export default ListView;
