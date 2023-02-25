import { useState, useEffect, useMemo } from "react";

import Window from "components/Window";
import SearchMangaList from "components/SearchMangaList/List";

import style from "./style.module.scss";

const SearchManga = () => {
  const [mangaList, setMangaList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentList, setCurrentList] = useState([]);

  useMemo(() => {
    window.electron.ipcRenderer.invoke("getMangaList").then((res) => {
      setMangaList(res);
      setCurrentList(res);
    });
  }, []);

  useEffect(() => {
    const filteredList = mangaList.filter((val) =>
      val.title.toUpperCase().startsWith(search.toUpperCase())
    );

    setCurrentList(filteredList);
  }, [search]);

  return (
    <Window className={style.SearchManga}>
      <input
        className={style.input}
        type="text"
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={style.result}>
        <SearchMangaList list={currentList} />
      </div>
    </Window>
  );
};

export default SearchManga;