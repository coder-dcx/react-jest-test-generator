import React from 'react';

const TestComponent = ({ title, onClick, disabled = false }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onClick} disabled={disabled}>
        Click me
      </button>
    </div>
  );
};

export default TestComponent;