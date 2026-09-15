function Checkbox({ checked, onChange, label, ariaLabel, className }) {
  return (
    <label className={`checkbox-wrapper-46 ${className ?? ''}`}>
      <input
        type="checkbox"
        className="inp-cbx"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span className="cbx">
        <span>
          <svg viewBox="0 0 12 10" height="10px" width="12px">
            <polyline points="1.5 6 4.5 9 10.5 1" />
          </svg>
        </span>
        {label ? <span>{label}</span> : null}
      </span>
    </label>
  );
}

export default Checkbox;