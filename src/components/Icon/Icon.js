import { ReactComponent as GridLogo } from "static/svg/grid.svg";
import { ReactComponent as SlideLogo } from "static/svg/slide.svg";
import { ReactComponent as Logo } from "static/svg/logo.svg";
const logoMap = {
  logo: Logo,
  slide: SlideLogo,
  grid: GridLogo,
};

const Icon = ({ iconType = "logo" }) => {
  const LogoComponent = logoMap[iconType];
  return <LogoComponent />;
};

export default Icon;
