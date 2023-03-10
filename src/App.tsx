import { useEffect, useState, useCallback, ChangeEvent } from 'react';

import './assets/base.scss';
import { useFetch } from './hooks/useFetch';
import useKeyPress from './hooks/useKeyPress';
import { debounce } from './utils';

function App() {
  const [focus, setFocus] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState({ sickCd: '', sickNm: '' });
  const downPress = useKeyPress('ArrowDown');
  const upPress = useKeyPress('ArrowUp');
  const enterPress = useKeyPress('Enter');
  const [cursor, setCursor] = useState<number>(-1);
  const [hovered, setHovered] = useState({ sickCd: '', sickNm: '' });

  const MemoizedHandleChange = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      const pattern = /([^가-힣\x20])/i;
      if (pattern.test(e.target.value.slice(-1))) {
        return;
      }
      setKeyword(e.target.value);
    }, 500),
    []
  );

  const handleInputValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      MemoizedHandleChange(e);
    },
    [inputValue]
  );

  const url =
    keyword && `${process.env.REACT_APP_SERVER_URL}/sick?q=${keyword}`;
  const { data: searchResult } = useFetch(url);

  useEffect(() => {
    if (searchResult?.length && downPress) {
      setCursor((prevState) =>
        prevState < searchResult.length - 1 ? prevState + 1 : prevState
      );
    }
  }, [downPress]);
  useEffect(() => {
    if (searchResult?.length && upPress) {
      setCursor((prevState) => (prevState > 0 ? prevState - 1 : prevState));
    }
  }, [upPress]);
  useEffect(() => {
    if (searchResult?.length) {
      setSelected(searchResult[cursor]);
    }
  }, [cursor, enterPress]);
  useEffect(() => {
    if (!hovered.sickCd) return;
    if (searchResult?.length && hovered) {
      setCursor(searchResult.indexOf(hovered));
    }
  }, [hovered]);
  useEffect(() => {
    setInputValue(selected?.sickNm);
  }, [selected]);

  return (
    <div className="App">
      <div className="main-contents">
        <h1 className="title">{`국내 모든 임상시험 검색하고\n온라인으로 참여하기`}</h1>
        <div className={!focus ? 'search-contents' : 'search-contents focus'}>
          <input
            type="text"
            value={inputValue}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={handleInputValueChange}
            className={!keyword ? 'search-input' : 'search-input keyword'}
            placeholder={!focus ? '질환명을 입력해 주세요' : ''}
          />
          <button className="search-cancel" />
          <button onClick={() => useFetch(url)} className="search-handler" />
        </div>
      </div>
      {focus && keyword.trim() && (
        <div className="keyword-contents">
          <p className="keyword-sub-title">추천 검색어</p>
          {searchResult?.length === 0 && (
            <p className="keyword-none">검색어 없음</p>
          )}
          {searchResult && (
            <ul className="keyword-list">
              {searchResult.map((result: any, index: any) => (
                <li
                  key={result.sickCd}
                  className="keyword-item"
                  style={index === cursor ? { backgroundColor: '#ededed' } : {}}
                  onClick={() => setSelected(result)}
                  onMouseEnter={() => setHovered(result)}
                  onMouseLeave={() => setHovered({ sickCd: '', sickNm: '' })}
                >
                  <img
                    src="images/icon_search.png"
                    alt="search-icon"
                    className="search-icon"
                  />
                  <span>
                    {result.sickNm.split(keyword)[0]}
                    <strong>{keyword}</strong>
                    {result.sickNm.split(keyword)[1]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
