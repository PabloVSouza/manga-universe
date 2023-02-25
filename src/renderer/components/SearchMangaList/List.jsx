import { useState } from "react";
import ReactPaginate from "react-paginate";
import MangaListItem from "./Item/Item";

import style from "./style.module.scss";

const SearchMangaList = ({ list, itemsPerPage = 50 }) => {
  const [offset, setOffset] = useState(0);
  const endOffset = offset + itemsPerPage;
  const currentItems = list.slice(offset, endOffset);
  const totalPages = Math.ceil(list.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % list.length;
    setOffset(newOffset);
  };

  return (
    <div className={style.searchMangaList}>
      <ul className={style.list}>
        {currentItems.map((manga) => {
          return <MangaListItem data={manga} key={manga.title} />;
        })}
      </ul>
      <ReactPaginate
        breakLabel="..."
        className={style.pagination}
        previousClassName={style.previous}
        breakClassName={style.break}
        nextClassName={style.next}
        pageClassName={style.page}
        activeClassName={style.active}
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={totalPages}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default SearchMangaList;
