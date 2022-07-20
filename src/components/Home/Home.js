import styles from "./Home.module.scss";
import Icon from "components/Icon/Icon";
const Home = () => {
  return (
    <div className={styles["home-container"]}>
      <div className="p-5">
        <div className={styles["logo-container"]}>
          <Icon />
        </div>
      </div>
    </div>
  );
};

export default Home;
