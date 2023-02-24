import Window from 'components/Window'
import TopMenu from 'components/TopMenu'

import style from './style.module.scss'

const Home = () => {
  return (
    <Window className={style.Home}>
      <TopMenu />
      Olá
    </Window>
  )
}

export default Home
