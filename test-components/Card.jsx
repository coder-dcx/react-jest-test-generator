import React from 'react';

const Card = ({ title, content, onClose }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className="card-body">
        {content}
      </div>
    </div>
  );
};

export default Card;