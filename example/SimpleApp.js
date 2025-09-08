import React, { useState } from 'react';

const SimpleComponent = ({ title = "Hello", onClick }) => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      {onClick && <button onClick={onClick}>Custom Action</button>}
    </div>
  );
};

const AnotherComponent = ({ name }) => {
  return (
    <div>
      <span>Hello {name || 'World'}</span>
    </div>
  );
};

export { SimpleComponent, AnotherComponent };