import React from 'react'
import CustDxTreeDataV1 from './CustDxTreeDataV1'
import rowsData from './rowsData.json'

function DataGrid() {

    const columns = [
        { name: 'rowId', title: 'Param ID' },
        { name: 'rowDesc', title: 'Param Description' },
        { name: 'moduleDesc', title: 'Module Description' },
        { name: 'formulaType', title: 'Formula Type' },
        { name: 'uom', title: 'UOM' },
        { name: 'standardMhUom', title: 'Standard MH/UOM' },
        { name: 'operation', title: 'Operation' },
        { name: 'formula', title: 'Formula' },
        { name: 'if', title: 'IF' },
        { name: 'leftValueType', title: 'Left Value Type' },
        { name: 'leftTypeValue', title: 'Left Type Value' },
        { name: 'ifOperator', title: 'IF Operator' },
        { name: 'rightValueType', title: 'Right Value Type' },
        { name: 'rightTypeValue', title: 'Right Type Value' },
    ];

    // Generate dropdown options for rowId
    const rowIdOptions = [
        { value: 'P001', label: 'P001', description: 'Param Description 1' },
        { value: 'P002', label: 'P002', description: 'Param Description 2' },
        { value: 'P003', label: 'P003', description: 'Param Description 3' },
        { value: 'P004', label: 'P004', description: 'Param Description 4' },
        { value: 'P005', label: 'P005', description: 'Param Description 5' },
        { value: 'P006', label: 'P006', description: 'Param Description 6' },
        { value: 'P007', label: 'P007', description: 'Param Description 7' },
        { value: 'P008', label: 'P008', description: 'Param Description 8' },
        { value: 'P009', label: 'P009', description: 'Param Description 9' },
        { value: 'P010', label: 'P010', description: 'Param Description 10' },
        // Add more as needed based on your data
    ];

    // Generate dropdown options for cell references
    const cellOptions = [
        { value: 'QTY', label: 'QTY' },
        { value: 'WEIGHT', label: 'WEIGHT' },
        { value: 'LENGTH', label: 'LENGTH' },
        { value: 'WIDTH', label: 'WIDTH' },
        { value: 'HEIGHT', label: 'HEIGHT' },
        { value: 'AREA', label: 'AREA' },
        { value: 'VOLUME', label: 'VOLUME' },
        { value: 'DENSITY', label: 'DENSITY' },
        { value: 'SPEED', label: 'SPEED' },
        { value: 'TEMP', label: 'TEMP' },
    ];

    // Handle row changes from the grid
    const handleRowChange = (updatedRow) => {
        console.log('Row changed:', updatedRow);
        // Here you can implement additional logic when a row changes
        // such as validation, API calls, etc.
    };

    return (
        <div>
            <h2>Manufacturing Parameters Data Grid</h2>
            <CustDxTreeDataV1 
                initialRows={rowsData} 
                columns={columns}
                rowIdOptions={rowIdOptions}
                cellOptions={cellOptions}
                onRowChange={handleRowChange}
            />
        </div>
    );
}

export default DataGrid
