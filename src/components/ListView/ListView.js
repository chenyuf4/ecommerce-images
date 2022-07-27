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
  IMAGE_GRID_GAP_Y,
  imgListGroupPadding,
} from "util/utilFormat";
import useRefMounted from "util/useRefMounted";
import { useFrame, useThree } from "@react-three/fiber";
import "./ImageShaderMaterial";
import { useCallback } from "react";
import * as THREE from "three";
import useStore from "store/useStore";
const CENTER_IMAGE_LERP_SLOW = 0.075;
const CENTER_IMAGE_LERP_FAST = 0.12;

const planeGeo = new THREE.PlaneBufferGeometry(1, 1);
const SmallImageBlock = ({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  const { viewport } = useThree();
  const { height, width } = viewport;
  const defaultPosX = -width / 2 + IMAGE_WIDTH_SMALL / 2 + imgListGroupPadding;
  return (
    <mesh
      position={[
        defaultPosX + index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL),
        -height / 2 + IMAGE_HEIGHT_SMALL / 2 + imgListGroupPadding,
        0,
      ]}
      scale={[IMAGE_WIDTH_SMALL, IMAGE_HEIGHT_SMALL, 1]}
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
    </mesh>
  );
};

const CenterImageBlock = ({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  return (
    <mesh
      position={[0, index * IMAGE_Y_GAP_CENTER, -index * IMAGE_Z_GAP_CENTER]}
      scale={[IMAGE_WIDTH_CENTER, IMAGE_HEIGHT_CENTER, 1]}
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
    </mesh>
  );
};

const ListView = ({
  scrollPosRef,
  centerImagePosRef,
  activeListViewImageRef,
}) => {
  const { viewport, invalidate } = useThree();
  const { width } = viewport;
  const mode = useStore((state) => state.mode);
  const mounted = useRefMounted();

  const mainViewGroupRef = useStore((state) => state.mainViewGroupRef);
  const listViewGroupRef = useStore((state) => state.listViewGroupRef);

  const update = useCallback(() => {
    const { current, target } = scrollPosRef.current;
    const lerpValue = scrollPosRef.current.scrollSpeed >= 45 ? 0.08 : 0.12;
    let newCurrentPos = current + (target - current) * lerpValue;
    if (Math.abs(newCurrentPos - target) <= 0.01) {
      newCurrentPos = target;
    }
    // update images view at the bottom
    const imagesGroup = listViewGroupRef.current.children;
    let newActiveImage = -1;
    const defaultPosX =
      -width / 2 + IMAGE_WIDTH_SMALL / 2 + imgListGroupPadding;

    const defaultPosY = IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y;

    imagesGroup.forEach((imageMesh, index) => {
      const defaultPos =
        mode === "list"
          ? defaultPosX + index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL)
          : defaultPosY -
            Math.floor(index / 3) * (IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y);
      const newPos =
        mode === "list"
          ? defaultPos + newCurrentPos
          : defaultPos - newCurrentPos;
      if (
        mode === "list" &&
        newActiveImage === -1 &&
        newPos >= defaultPosX - IMAGE_WIDTH_SMALL / 2
      ) {
        newActiveImage = index;
      }
      if (
        mode === "grid" &&
        newActiveImage === -1 &&
        index % 3 === 0 &&
        (newPos <= IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y ||
          Math.floor(index / 3) === Math.floor((imagesArr.length - 1) / 3))
      ) {
        newActiveImage = index;
      }

      if (mode === "list") imageMesh.position.x = newPos;
      if (mode === "grid") imageMesh.position.y = newPos;
    });

    // update main images at the center
    const prevActiveImage = activeListViewImageRef.current;
    // update only when active image is changed
    if (prevActiveImage !== newActiveImage) {
      imagesGroup.forEach((imageMesh, index) => {
        imageMesh.material.uniforms.listViewImageProgress.value =
          index === newActiveImage || mode === "grid" ? 1.0 : 0.0;
      });
    }

    activeListViewImageRef.current = newActiveImage;
    scrollPosRef.current.current = newCurrentPos;
    if (newCurrentPos !== scrollPosRef.current.target) invalidate();
  }, [
    activeListViewImageRef,
    invalidate,
    listViewGroupRef,
    mode,
    scrollPosRef,
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
    if (Math.abs(newCurrentPosZ - targetZ) <= 0.01) {
      newCurrentPosZ = targetZ;
      newCurrentPosY = (targetZ * 4) / 7;
    }
    const centerImagesGroup = mainViewGroupRef.current.children;
    mode === "list" &&
      centerImagesGroup.forEach((imageMesh, index) => {
        const defaultPosY = index * IMAGE_Y_GAP_CENTER;
        const defaultPosZ = -index * IMAGE_Z_GAP_CENTER;
        imageMesh.material.uniforms.planeDimension.value = [
          1,
          (IMAGE_HEIGHT_CENTER / IMAGE_WIDTH_CENTER) *
            (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
        ];
        imageMesh.scale.x = IMAGE_WIDTH_CENTER;
        imageMesh.position.x = 0;
        imageMesh.position.y = defaultPosY - newCurrentPosY;
        imageMesh.position.z = defaultPosZ + newCurrentPosZ;
      });

    centerImagePosRef.current.currentY = newCurrentPosY;
    centerImagePosRef.current.currentZ = newCurrentPosZ;
    // if (newCurrentPosZ !== centerImagePosRef.current.targetZ) invalidate();
  }, [centerImagePosRef, mainViewGroupRef, mode, scrollPosRef]);

  useFrame(() => {
    if (!mounted.current) return;
    const { current, target } = scrollPosRef.current;
    if (current !== target) update();

    const { currentZ, targetZ } = centerImagePosRef.current;
    if (currentZ !== targetZ) updateCenterImages();
  });

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
        ref={(node) => {
          listViewGroupRef.current = node;
        }}
      >
        {imagesArr.map((url, index) => (
          <SmallImageBlock url={url} index={index} key={`small-${url}`} />
        ))}
      </group>
    </>
  );
};

export default ListView;
