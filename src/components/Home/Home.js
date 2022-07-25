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
} from "util/utilFormat";
import { invalidate } from "@react-three/fiber";
import { Power2 } from "gsap";
const Home = () => {
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const numImages = imagesArr.length;
  const mainViewGroupRef = useStore((state) => state.mainViewGroupRef);
  const activeListViewImage = useStore((state) => state.activeListViewImage);
  const canvasSize = useStore((state) => state.canvasSize);
  const { width, height } = canvasSize;
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
              if (mode !== "list") {
                setMode("list");
                const animatedImages = mainViewGroupRef.current.children.slice(
                  activeListViewImage,
                  Math.min(activeListViewImage + 4, numImages)
                );
                const tl = gsap.timeline({
                  onUpdate: () => invalidate(),
                  onUpdateParams: () => invalidate(),
                  onStart: () => invalidate(),
                  onComplete: () => {
                    mainViewGroupRef.current.children.forEach((item) => {
                      item.position.x = 0;
                      item.scale.x = IMAGE_WIDTH_CENTER;
                      item.material.uniforms.planeDimension.value = [
                        1,
                        (IMAGE_HEIGHT_SMALL / IMAGE_WIDTH_SMALL) *
                          (IMAGE_DIMENSION.width / IMAGE_DIMENSION.height),
                      ];
                    });
                  },
                });
                animatedImages.forEach((item, index) => {
                  tl.fromTo(
                    item.position,
                    {
                      x: width / 2 + (IMAGE_WIDTH_CENTER * 0.5) / 2 + index,
                    },
                    {
                      x: 0,
                      delay: index * 0.035,
                      duration: 0.65,
                      ease: Power2.easeOut,
                    },
                    "start"
                  ).fromTo(
                    item.scale,
                    {
                      x: IMAGE_WIDTH_CENTER * 0.5,
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
              if (mode !== "grid") {
                setMode("grid");
                const animatedImages = mainViewGroupRef.current.children.slice(
                  activeListViewImage,
                  Math.min(activeListViewImage + 4, numImages)
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
                      x: width / 2 + (IMAGE_WIDTH_CENTER * 0.5) / 2 + index,
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
