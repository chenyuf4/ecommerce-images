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
  IMAGE_GRID_GAP_X,
  imgListGroupPadding,
  IMAGE_GRID_WIDTH,
} from "util/utilFormat";
import useRefMounted from "util/useRefMounted";
import { useFrame, useThree } from "@react-three/fiber";
import "./ImageShaderMaterial";
import React, { useCallback, useEffect } from "react";
import * as THREE from "three";
import useStore from "store/useStore";
const CENTER_IMAGE_LERP_SLOW = 0.075;
const CENTER_IMAGE_LERP_FAST = 0.12;

const planeGeo = new THREE.PlaneBufferGeometry(1, 1);
const SmallImageBlock = React.memo(({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  return (
    <mesh
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
});

const CenterImageBlock = React.memo(({ url, index }) => {
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
        index={index}
        mode={1.0}
      />
    </mesh>
  );
});

const ListView = ({
  scrollPosRef,
  centerImagePosRef,
  activeListViewImageRef,
  modeRef,
}) => {
  const { viewport, invalidate } = useThree();
  const { width, height } = viewport;
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
        modeRef.current === "list"
          ? defaultPosX + index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL)
          : defaultPosY -
            Math.floor(index / 3) * (IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y);
      const newPos =
        modeRef.current === "list"
          ? defaultPos + newCurrentPos
          : defaultPos - newCurrentPos;
      if (
        modeRef.current === "list" &&
        newActiveImage === -1 &&
        newPos >= defaultPosX - IMAGE_WIDTH_SMALL / 2
      ) {
        newActiveImage = index;
      }
      if (
        modeRef.current === "grid" &&
        newActiveImage === -1 &&
        index % 3 === 0 &&
        (newPos <= IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y ||
          Math.floor(index / 3) === Math.floor((imagesArr.length - 1) / 3))
      ) {
        newActiveImage = index;
      }

      if (modeRef.current === "list") imageMesh.position.x = newPos;
      if (modeRef.current === "grid") imageMesh.position.y = newPos;
    });

    // update main images at the center
    const prevActiveImage = activeListViewImageRef.current;
    // update only when active image is changed
    if (prevActiveImage !== newActiveImage) {
      imagesGroup.forEach((imageMesh, index) => {
        imageMesh.material.uniforms.listViewImageProgress.value =
          index === newActiveImage || modeRef.current === "grid" ? 1.0 : 0.0;
      });
    }

    activeListViewImageRef.current = newActiveImage;
    scrollPosRef.current.current = newCurrentPos;
    if (newCurrentPos !== scrollPosRef.current.target) invalidate();
  }, [
    activeListViewImageRef,
    invalidate,
    listViewGroupRef,
    modeRef,
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
    modeRef.current === "list" &&
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
  }, [centerImagePosRef, mainViewGroupRef, modeRef, scrollPosRef]);

  const resizeHandler = useCallback(() => {
    const isList = modeRef.current === "list";
    const defaultPosX =
      -width / 2 + IMAGE_WIDTH_SMALL / 2 + imgListGroupPadding;
    const topLeftX = width / 2 - 2.5 * IMAGE_GRID_WIDTH - 3 * IMAGE_GRID_GAP_X;
    const topLeftY = IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y;
    listViewGroupRef.current.children.forEach((item, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const activeRow = Math.floor(activeListViewImageRef.current / 3);
      item.position.x = isList
        ? defaultPosX +
          (index - activeListViewImageRef.current) *
            (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL)
        : topLeftX + col * (IMAGE_GRID_WIDTH + IMAGE_GRID_GAP_X);
      item.position.y = isList
        ? -height / 2 + IMAGE_HEIGHT_SMALL / 2 + imgListGroupPadding
        : topLeftY - (row - activeRow) * (IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y);
      item.position.z = 0;
      item.scale.x = isList ? IMAGE_WIDTH_SMALL : IMAGE_GRID_WIDTH;
      item.scale.y = isList ? IMAGE_HEIGHT_SMALL : IMAGE_GRID_HEIGHT;

      item.material.uniforms.listViewImageProgress.value =
        !isList || index === activeListViewImageRef.current ? 1 : 0;
      item.material.uniforms.planeDimension.value = [
        1,
        (IMAGE_HEIGHT_SMALL / IMAGE_WIDTH_SMALL) *
          (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
      ];
      item.material.uniforms.listViewImageProgress.value =
        !isList || index === activeListViewImageRef.current ? 1 : 0;
    });

    //
    mainViewGroupRef.current.children.forEach((item, index) => {
      item.position.x = isList
        ? 0
        : width / 2 +
          IMAGE_WIDTH_CENTER * 2 +
          Math.abs(index - activeListViewImageRef.current);
      item.position.y =
        (index - activeListViewImageRef.current) * IMAGE_Y_GAP_CENTER;
      item.position.z =
        -(index - activeListViewImageRef.current) * IMAGE_Z_GAP_CENTER;

      item.scale.x = isList ? IMAGE_WIDTH_CENTER : IMAGE_WIDTH_CENTER * 0.5;
      item.scale.y = IMAGE_HEIGHT_CENTER;

      item.material.uniforms.planeDimension.value = isList
        ? [
            1,
            (IMAGE_HEIGHT_CENTER / IMAGE_WIDTH_CENTER) *
              (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
          ]
        : [
            0.5,
            (IMAGE_HEIGHT_CENTER / IMAGE_WIDTH_CENTER) *
              (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
          ];
    });
  }, [
    activeListViewImageRef,
    height,
    listViewGroupRef,
    mainViewGroupRef,
    modeRef,
    width,
  ]);

  useEffect(() => {
    if (mounted.current && modeRef.current === "list") {
      listViewGroupRef.current.children.forEach((item, index) => {
        const defaultPosX =
          -width / 2 + IMAGE_WIDTH_SMALL / 2 + imgListGroupPadding;
        item.position.x =
          defaultPosX +
          (index - activeListViewImageRef.current) *
            (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL);
        item.position.y =
          -height / 2 + IMAGE_HEIGHT_SMALL / 2 + imgListGroupPadding;
      });
    }
  }, [
    activeListViewImageRef,
    height,
    listViewGroupRef,
    modeRef,
    mounted,
    width,
  ]);

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [resizeHandler]);

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
