import style from "./style.module.scss";

const MangaListItem = ({ data }) => {
  return <li className={style.mangaListItem}>{data.title}</li>;
};

export default MangaListItem;
