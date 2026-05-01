// EnYi Hou (261165635)

import { useEffect, useState } from "react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search something",
}) {
  const [inputValue, setInputValue] = useState(value);
  const DELAY = 100;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(inputValue);
    }, DELAY);

    return () => clearTimeout(timeout);
  }, [inputValue, onChange]);

  return (
    <input
      type="search"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      className="search-bar"
      maxLength={150}
    />
  );
}
