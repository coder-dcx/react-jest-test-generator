import React from 'react';

const CustDxTreeDataV1 = ({
  initialRows = [],
  columns = [],
  rowIdOptions = [],
  cellOptions = [],
  onRowChange = () => {}
}) => {
  return (
    <div data-testid="cust-dx-tree-data-v1">
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {initialRows.map((row, index) => (
            <tr key={index}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{row[col.name] || ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustDxTreeDataV1;