import styles from "./Home.module.scss";
import Icon from "components/Icon/Icon";
import clsx from "clsx";
const Home = () => {
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
              "d-flex justify-content-center align-items-center"
            )}
          >
            <Icon iconType="slide" />
          </div>
          <div
            className={clsx(
              styles["mode-logo-container"],
              styles["mode-inactive"],
              "ms-3 d-flex justify-content-center align-items-center"
            )}
          >
            <Icon iconType="grid" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
