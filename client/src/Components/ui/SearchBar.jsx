export default function SearchBar({
  value,
  onChange,
  placeholder = "Search something",
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className="search-bar"
    />
  );
}
