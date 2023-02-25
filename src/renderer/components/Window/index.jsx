import style from "./style.module.scss";
import Button from "components/Button";
import classNames from "classnames";

const Window = ({ children, close = false, to, className, ...props }) => {
  return (
    <div className={classNames(style.Window, className)} {...props}>
      {close && <Button theme="closeButton" to={to} />}
      {children}
    </div>
  );
};

export default Window;
