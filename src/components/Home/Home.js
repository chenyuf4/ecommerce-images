import styles from "./Home.module.scss";
import Icon from "components/Icon/Icon";
import clsx from "clsx";
import useStore from "store/useStore";
const Home = () => {
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
            onClick={() => mode !== "list" && setMode("list")}
          >
            <Icon iconType="slide" />
          </div>
          <div
            className={clsx(
              styles["mode-logo-container"],
              mode === "list" && styles["mode-inactive"],
              "ms-3 d-flex justify-content-center align-items-center cursor-pointer"
            )}
            onClick={() => mode !== "grid" && setMode("grid")}
          >
            <Icon iconType="grid" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
