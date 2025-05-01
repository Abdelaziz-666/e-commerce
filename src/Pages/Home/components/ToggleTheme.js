import React, { useState, useEffect } from "react";

const ToggleTheme = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = checked ? "#333" : "#fff";
    document.body.style.color = checked ? "#fff" : "#000";
  }, [checked]); 
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <label className="switch">
        <input type="checkbox" onChange={() => setChecked(!checked)} />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default ToggleTheme;
