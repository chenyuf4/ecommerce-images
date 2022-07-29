import styles from "./Mobile.module.scss";
import clsx from "clsx";
const MobilePage = () => {
  return (
    <div
      className={clsx(
        styles["mobile-page-container"],
        "d-flex align-items-center justify-content-center s-font font-weight-bold"
      )}
    >
      Please view it on desktop
    </div>
  );
};

export default MobilePage;
