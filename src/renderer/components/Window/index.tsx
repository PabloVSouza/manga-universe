import style from './style.module.scss'
import classNames from 'classnames'

const Window = ({ children, className, ...props }) => {
  return (
    <div className={classNames(style.Window, className)} {...props}>
      {children}
    </div>
  )
}

export default Window
