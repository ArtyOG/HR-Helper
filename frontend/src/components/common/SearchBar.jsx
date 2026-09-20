function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SearchBar({ value, onChange, placeholder = 'Search', className = '', fluid = false, label }) {
  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={`search-bar ${fluid ? 'search-bar--fluid' : ''} ${className}`}
    >
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="input"
      />
      <button
        type="button"
        aria-label="Clear search"
        className="reset"
        onClick={() => onChange('')}
      >
        <ResetIcon />
      </button>
    </form>
  );
}

export default SearchBar;