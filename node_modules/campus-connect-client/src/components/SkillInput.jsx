import { useEffect, useState } from "react";

export const SkillInput = ({ label, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value.join(", "));

  useEffect(() => {
    setInputValue(value.join(", "));
  }, [value]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
  };

  const handleBlur = () => {
    const items = inputValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    onChange(items);
    setInputValue(items.join(", "));
  };

  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </label>
  );
};
