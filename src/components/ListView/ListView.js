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
import { useFrame, useThree } from "@react-three/fiber";
import "./ImageShaderMaterial";
import { useCallback, useRef } from "react";
import * as THREE from "three";
import useStore from "store/useStore";
const CENTER_IMAGE_LERP_SLOW = 0.075;
const CENTER_IMAGE_LERP_FAST = 0.12;

const planeGeo = new THREE.PlaneBufferGeometry(1, 1);
const SmallImageBlock = ({ url, index }) => {
  const [imgTexture] = useTexture([url]);
  return (
    <mesh
      position={[index * (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL), 0, 0]}
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

const ListView = ({ scrollPosRef, centerImagePosRef }) => {
  const { viewport, invalidate } = useThree();
  const { width, height } = viewport;
  console.log("render");
  const mounted = useRefMounted();
  const activeImageRef = useRef(0);
  const mainViewGroupRef = useStore((state) => state.mainViewGroupRef);
  const listViewGroupRef = useStore((state) => state.listViewGroupRef);
  const setActiveListViewImage = useStore(
    (state) => state.setActiveListViewImage
  );

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
    }

    activeImageRef.current = newActiveImage;
    setActiveListViewImage(newActiveImage);
    scrollPosRef.current.current = newCurrentPos;
    if (newCurrentPos !== scrollPosRef.current.target) invalidate();
  }, [
    invalidate,
    listViewGroupRef,
    mainViewGroupRef,
    scrollPosRef,
    setActiveListViewImage,
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

  const imgListGroupPadding = 0.35;
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
