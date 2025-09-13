import React from 'react';

interface TestButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const TestButton: React.FC<TestButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn btn-primary"
    >
      {label}
    </button>
  );
};

export default TestButton;