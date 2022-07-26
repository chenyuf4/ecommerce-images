import styles from "./Home.module.scss";
import Icon from "components/Icon/Icon";
import clsx from "clsx";
import useStore from "store/useStore";
import gsap from "gsap";
import {
  imagesArr,
  IMAGE_WIDTH_CENTER,
  IMAGE_HEIGHT_CENTER,
  IMAGE_DIMENSION,
  IMAGE_HEIGHT_SMALL,
  IMAGE_WIDTH_SMALL,
  IMAGE_GRID_GAP_X,
  IMAGE_GRID_WIDTH,
  IMAGE_GRID_HEIGHT,
  IMAGE_GRID_GAP_Y,
  imgListGroupPadding,
  IMAGE_GAP_SMALL,
  IMAGE_Z_GAP_CENTER,
  IMAGE_Y_GAP_CENTER,
} from "util/utilFormat";
import { invalidate } from "@react-three/fiber";
import { Power2 } from "gsap";
const Home = ({ canvasSizeRef, scrollPosRef, activeListViewImageRef }) => {
  const numImages = imagesArr.length;
  const mainViewGroupRef = useStore((state) => state.mainViewGroupRef);
  const listViewGroupRef = useStore((state) => state.listViewGroupRef);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  return (
    <div className={styles["home-container"]}>
      <div className="p-5 d-flex justify-content-between align-items-center">
        <div
          className={clsx(
            styles["logo-container"],
            "d-flex justify-content-center align-items-center"
          )}
        >
          <Icon />
        </div>
        <div className="d-flex">
          <div
            className={clsx(
              styles["mode-logo-container"],
              mode === "grid" && styles["mode-inactive"],
              "d-flex justify-content-center align-items-center cursor-pointer"
            )}
            onClick={() => {
              if (
                mode !== "list" &&
                scrollPosRef.current.current === scrollPosRef.current.target
              ) {
                setMode("list");
                const animatedImages = mainViewGroupRef.current.children.slice(
                  activeListViewImageRef.current,
                  Math.min(activeListViewImageRef.current + 4, numImages)
                );

                const tl = gsap.timeline({
                  onUpdate: () => invalidate(),
                  onUpdateParams: () => invalidate(),
                  onStart: () => invalidate(),
                });
                animatedImages.forEach((item, index) => {
                  tl.fromTo(
                    item.position,
                    {
                      x:
                        canvasSizeRef.current.width / 2 +
                        IMAGE_WIDTH_CENTER / 2 +
                        index,
                      y: index * IMAGE_Y_GAP_CENTER,
                      z: -index * IMAGE_Z_GAP_CENTER,
                    },
                    {
                      x: 0,
                      y: index * IMAGE_Y_GAP_CENTER,
                      z: -index * IMAGE_Z_GAP_CENTER,
                      delay: index * 0.035,
                      duration: 0.65,
                      ease: Power2.easeOut,
                    },
                    "start"
                  ).fromTo(
                    item.scale,
                    {
                      x: IMAGE_WIDTH_CENTER / 2,
                    },
                    {
                      x: IMAGE_WIDTH_CENTER,
                      delay: index * 0.055,
                      duration: 1.2,
                      ease: Power2.easeOut,
                      onUpdate: function () {
                        const val = this.targets()[0].x / IMAGE_WIDTH_CENTER;
                        item.material.uniforms.planeDimension.value = [
                          val,
                          (IMAGE_HEIGHT_CENTER / IMAGE_WIDTH_CENTER) *
                            (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
                        ];
                      },
                    },
                    "start"
                  );
                });

                const listViewImages = listViewGroupRef.current.children;
                listViewImages.forEach((item, index) => {
                  const defaultPosX =
                    -canvasSizeRef.current.width / 2 +
                    IMAGE_WIDTH_SMALL / 2 +
                    imgListGroupPadding;
                  tl.to(
                    item.position,
                    {
                      x:
                        defaultPosX +
                        (index - activeListViewImageRef.current) *
                          (IMAGE_WIDTH_SMALL + IMAGE_GAP_SMALL),
                      y:
                        -canvasSizeRef.current.height / 2 +
                        IMAGE_HEIGHT_SMALL / 2 +
                        imgListGroupPadding,
                    },
                    "start"
                  ).to(
                    item.scale,
                    {
                      x: IMAGE_WIDTH_SMALL,
                      y: IMAGE_HEIGHT_SMALL,
                      onUpdate: function () {
                        const valX = this.targets()[0].x;
                        const valY = this.targets()[0].y;
                        item.material.uniforms.planeDimension.value = [
                          1,
                          (valY / valX) *
                            (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
                        ];
                      },
                    },
                    "start"
                  );
                });

                scrollPosRef.current.current = scrollPosRef.current.target =
                  -activeListViewImageRef.current *
                  (IMAGE_GAP_SMALL + IMAGE_WIDTH_SMALL);
              }
            }}
          >
            <Icon iconType="slide" />
          </div>
          <div
            className={clsx(
              styles["mode-logo-container"],
              mode === "list" && styles["mode-inactive"],
              "ms-3 d-flex justify-content-center align-items-center cursor-pointer"
            )}
            onClick={() => {
              if (
                mode !== "grid" &&
                scrollPosRef.current.current === scrollPosRef.current.target
              ) {
                setMode("grid");
                const animatedImages = mainViewGroupRef.current.children.slice(
                  activeListViewImageRef.current,
                  Math.min(activeListViewImageRef.current + 4, numImages)
                );
                const tl = gsap.timeline({
                  onUpdate: () => invalidate(),
                  onUpdateParams: () => invalidate(),
                  onStart: () => invalidate(),
                });
                animatedImages.forEach((item, index) => {
                  tl.to(
                    item.position,
                    {
                      x:
                        canvasSizeRef.current.width / 2 +
                        IMAGE_WIDTH_CENTER / 2 +
                        index,
                      delay: index * 0.035,
                      duration: 0.65,
                      ease: Power2.easeOut,
                    },
                    "start"
                  ).to(
                    item.scale,
                    {
                      x: IMAGE_WIDTH_CENTER * 0.5,
                      delay: index * 0.055,
                      duration: 1.2,
                      ease: Power2.easeOut,
                      onUpdate: function () {
                        const val = this.targets()[0].x / IMAGE_WIDTH_CENTER;
                        item.material.uniforms.planeDimension.value = [
                          val,
                          (IMAGE_HEIGHT_CENTER / IMAGE_WIDTH_CENTER) *
                            (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
                        ];
                      },
                    },
                    "start"
                  );
                });

                const listViewImages = listViewGroupRef.current.children;
                const activeImageRow = Math.floor(
                  activeListViewImageRef.current / 3
                );
                listViewImages.forEach((item, index) => {
                  const row = Math.floor(index / 3);
                  const col = index % 3;

                  const topLeftX =
                    canvasSizeRef.current.width / 2 -
                    2.5 * IMAGE_GRID_WIDTH -
                    3 * IMAGE_GRID_GAP_X;
                  const topLeftY = IMAGE_GRID_HEIGHT + IMAGE_GRID_GAP_Y;
                  tl.to(
                    item.position,
                    {
                      x: topLeftX + col * (IMAGE_GRID_GAP_X + IMAGE_GRID_WIDTH),
                      y:
                        topLeftY +
                        (activeImageRow - row) *
                          (IMAGE_GRID_GAP_Y + IMAGE_GRID_HEIGHT),
                    },
                    "start"
                  ).to(
                    item.scale,
                    {
                      x: IMAGE_GRID_WIDTH,
                      y: IMAGE_GRID_HEIGHT,
                      onUpdate: function () {
                        const valX = this.targets()[0].x;
                        const valY = this.targets()[0].y;
                        item.material.uniforms.planeDimension.value = [
                          1,
                          (valY / valX) *
                            (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
                        ];
                      },
                    },
                    "start"
                  );
                });

                scrollPosRef.current.current = scrollPosRef.current.target =
                  -activeImageRow * (IMAGE_GRID_GAP_Y + IMAGE_GRID_HEIGHT);
              }
            }}
          >
            <Icon iconType="grid" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
