import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import lang from "lang";

import Window from "components/Window";
import Image from "components/Image";

import style from "./style.module.scss";
import DownloadChapterList from "components/DownloadChapterList/list";

const DownloadManga = () => {
  const { slug } = useParams();

  const [mangaData, setMangaData] = useState(null);
  const [downloadQueue, setDownloadQueue] = useState([]);

  const handleClick = (data) => {
    const found = downloadQueue.findIndex((val) => val.num === data.num);
    if (found < 0) {
      setDownloadQueue((downloadQueue) => [...downloadQueue, data]);
    } else {
      setDownloadQueue(downloadQueue.filter((val) => val.num !== data.num));
    }
  };

  useMemo(() => {
    window.electron.ipcRenderer.invoke("getMangaData", slug).then((res) => {
      setMangaData(res);
    });
  }, []);

  return (
    !!mangaData && (
      <Window close to={"/"} className={style.downloadManga}>
        <div className={style.header}>
          <div className={style.container}>
            <div className={style.title}>
              <h1>{mangaData.chapter_name}</h1>
              <div className={style.chapter}>
                {mangaData.genres.map((val) => (
                  <div key={val}>{val}</div>
                ))}
              </div>
            </div>
            <Image className={style.cover} src={mangaData.cover} />
            <p className={style.description}>{mangaData.description}</p>
          </div>
        </div>

        <div className={style.chapters}>
          <h1>{lang.DownloadManga.chaptersTitle}</h1>
          <DownloadChapterList
            list={mangaData.allposts}
            onClick={handleClick}
            queue={downloadQueue}
          />
        </div>
      </Window>
    )
  );
};

export default DownloadManga;
