import React, { useState } from 'react';
import {
    Grid,
    Table,
    TableHeaderRow,
    Toolbar,
    VirtualTable,
    TableFilterRow,
    SearchPanel,
    TableTreeColumn,
} from '@devexpress/dx-react-grid-material-ui';

import {
    TreeDataState,
    CustomTreeData,
    FilteringState,
    SearchState,
    SortingState,
} from '@devexpress/dx-react-grid';

import Paper from '@material-ui/core/Paper';
import {
    Select,
    MenuItem,
    TextField,
    Checkbox,
    ButtonGroup,
    Button,
    FormControl,
    makeStyles,
} from '@material-ui/core';
import './CustDxTreeDataV1.css';

const useStyles = makeStyles((theme) => ({
    tableTreeColumn: {
        '& .TableTreeColumn-expandButton': {
            marginRight: theme.spacing(1),
            minWidth: '24px',
            flexShrink: 0,
        },
        '& .TableTreeColumn-content': {
            paddingLeft: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        },
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    cellInput: {
        width: '100%',
        minWidth: '120px',
    },
    numberInput: {
        width: '100px',
    },
    dropdownCell: {
        minWidth: '140px',
    },
    buttonGroup: {
        '& .MuiButton-root': {
            minWidth: '30px',
            padding: '4px 8px',
        },
    },
    disabledCell: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    // Hide expand buttons from non-tree columns
    hideExpandButton: {
        '& .dx-treelist-icon-container': {
            display: 'none !important',
        },
        '& .dx-treelist-cell-expandButton': {
            display: 'none !important',
        },
        '& .TableTreeColumn-expandButton': {
            display: 'none !important',
        },
        '& .dx-icon-expand': {
            display: 'none !important',
        },
        '& .dx-icon-collapse': {
            display: 'none !important',
        },
    },
}));

// ✅ Safe child accessor
const getChildRows = (row, rootRows) => {
    if (row) return Array.isArray(row.children) ? row.children : [];
    return rootRows;
};

const CustDxTreeDataV1 = ({ 
    columns, 
    initialRows, 
    rowIdOptions = [],
    cellOptions = [],
    onRowChange 
}) => {
    const [rows, setRows] = useState(initialRows);
    const classes = useStyles();

    console.log('CustDxTreeDataV1', columns, initialRows);

    // Dropdown options
    const formulaTypeOptions = ['Standard', 'Basic', 'Advanced'];
    const uomOptions = ['SEC', 'MIN', 'HRS'];
    const operationOptions = ['+', '-', '*', '/'];
    const valueTypeOptions = ['Cell', 'Number', 'Text'];
    const operatorOptions = ['==', '>', '<', '<>'];

    // Update row data
    const updateRowData = (rowId, field, value) => {
        const updatedRows = [...rows];
        const updateRow = (list) => {
            for (let i = 0; i < list.length; i++) {
                if (list[i].id === rowId) {
                    list[i][field] = value;
                    
                    // Handle dependent field updates
                    if (field === 'rowId') {
                        // Update rowDesc based on rowId selection
                        const selectedOption = rowIdOptions.find(opt => opt.value === value);
                        if (selectedOption) {
                            list[i].rowDesc = selectedOption.description;
                        }
                    } else if (field === 'standardMhUom' || field === 'operation') {
                        // Update formula based on standardMhUom and operation
                        const mh = list[i].standardMhUom || 0;
                        const op = list[i].operation || '*';
                        list[i].formula = `${mh} ${op} QTY`;
                    }
                    
                    if (onRowChange) {
                        onRowChange(list[i]);
                    }
                    return true;
                }

                if (list[i].children && list[i].children.length) {
                    const found = updateRow(list[i].children);
                    if (found) return true;
                }
            }
            return false;
        };

        updateRow(updatedRows);
        setRows(updatedRows);
    };


    // Toggle IF checkbox and dynamically add/remove children
    const handleIfToggle = (row) => {
        const updatedRows = [...rows];
        const updateRow = (list) => {
            for (let i = 0; i < list.length; i++) {
                if (list[i].id === row.id) {
                    const checked = !list[i].if;
                    list[i].if = checked;

                    if (checked && (!list[i].children || list[i].children.length === 0)) {
                        const baseId = list[i].id * 100;
                        list[i].children = [
                            {
                                ...list[i],
                                id: baseId + 1,
                                rowId: `${list[i].rowId}_TRUE`,
                                branch: 'TRUE',
                                if: false,
                                children: [],
                            },
                            {
                                ...list[i],
                                id: baseId + 2,
                                rowId: `${list[i].rowId}_FALSE`,
                                branch: 'FALSE',
                                if: false,
                                children: [],
                            },
                        ];
                    }

                    if (!checked) {
                        list[i].children = [];
                    }

                    return true;
                }

                if (list[i].children && list[i].children.length) {
                    const found = updateRow(list[i].children);
                    if (found) return true;
                }
            }
            return false;
        };

        updateRow(updatedRows);
        setRows(updatedRows);
    };

    // Custom cell renderer
    const tableBodyCell = (props) => {
        const { column, row } = props;
        const isIfChecked = !!row.if;
        const isTreeColumn = column.name === treeColumn;

        // For non-tree columns, ensure expand buttons are hidden
        const cellClassName = !isTreeColumn ? classes.hideExpandButton : '';

        // Render dropdown cell
        const renderDropdown = (options, value, disabled = false) => (
            <Table.Cell {...props} className={`${disabled ? classes.disabledCell : ''} ${cellClassName}`}>
                <FormControl className={classes.dropdownCell} disabled={disabled}>
                    <Select
                        value={value || ''}
                        onChange={(e) => updateRowData(row.id, column.name, e.target.value)}
                        className={classes.cellInput}
                        variant="outlined"
                        size="small"
                    >
                        {options.map((option) => (
                            <MenuItem key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
                                {typeof option === 'string' ? option : option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Table.Cell>
        );

        // Render text input cell
        const renderTextInput = (value, disabled = false, type = 'text') => (
            <Table.Cell {...props} className={`${disabled ? classes.disabledCell : ''} ${cellClassName}`}>
                <TextField
                    value={value || ''}
                    onChange={(e) => updateRowData(row.id, column.name, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    className={type === 'number' ? classes.numberInput : classes.cellInput}
                    variant="outlined"
                    size="small"
                    type={type}
                    disabled={disabled}
                />
            </Table.Cell>
        );

        // Render read-only cell
        const renderReadOnly = (value) => (
            <Table.Cell {...props} className={`${classes.disabledCell} ${cellClassName}`}>
                <TextField
                    value={value || ''}
                    className={classes.cellInput}
                    variant="outlined"
                    size="small"
                    disabled
                    InputProps={{ readOnly: true }}
                />
            </Table.Cell>
        );

        // Column-specific rendering for all columns including tree column
        switch (column.name) {
            case 'rowId':
                // For tree column, don't override - let TableTreeColumn handle it
                if (isTreeColumn) {
                    return undefined; // Let TableTreeColumn handle this
                }
                return renderDropdown(rowIdOptions, row.rowId);

            case 'rowDesc':
                return renderReadOnly(row.rowDesc);

            case 'moduleDesc':
                return renderTextInput(row.moduleDesc);

            case 'formulaType':
                return renderDropdown(formulaTypeOptions, row.formulaType);

            case 'uom':
                return renderDropdown(uomOptions, row.uom);

            case 'standardMhUom':
                return renderTextInput(row.standardMhUom, isIfChecked, 'number');

            case 'operation':
                return (
                    <Table.Cell {...props} className={`${isIfChecked ? classes.disabledCell : ''} ${cellClassName}`}>
                        <ButtonGroup className={classes.buttonGroup} disabled={isIfChecked}>
                            {operationOptions.map((op) => (
                                <Button
                                    key={op}
                                    variant={row.operation === op ? 'contained' : 'outlined'}
                                    color={row.operation === op ? 'primary' : 'default'}
                                    onClick={() => updateRowData(row.id, 'operation', op)}
                                    size="small"
                                >
                                    {op}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Table.Cell>
                );

            case 'formula':
                return renderReadOnly(row.formula);

            case 'if':
                return (
                    <Table.Cell {...props} className={cellClassName}>
                        <Checkbox
                            checked={!!row.if}
                            onChange={() => handleIfToggle(row)}
                            color="primary"
                        />
                    </Table.Cell>
                );

            case 'leftValueType':
            case 'rightValueType':
                return renderDropdown(valueTypeOptions, row[column.name], !isIfChecked);

            case 'ifOperator':
                return renderDropdown(operatorOptions, row.ifOperator, !isIfChecked);

            case 'leftTypeValue':
            case 'rightTypeValue':
                const valueType = column.name === 'leftTypeValue' ? row.leftValueType : row.rightValueType;
                
                if (!isIfChecked) {
                    return renderTextInput(row[column.name], true);
                }

                switch (valueType) {
                    case 'Cell':
                        return renderDropdown(cellOptions, row[column.name]);
                    case 'Number':
                        return renderTextInput(row[column.name], false, 'number');
                    case 'Text':
                        return renderTextInput(row[column.name], false, 'text');
                    default:
                        return renderTextInput(row[column.name], true);
                }

            default:
                return (
                    <Table.Cell {...props} className={cellClassName}>
                        {props.value || ''}
                    </Table.Cell>
                );
        }
    };

    const treeColumn = columns[0]?.name || 'rowId';

    // Custom tree column component to fix overlap and add dropdown functionality
    const CustomTreeColumn = (props) => {
        const { column, row, children, ...restProps } = props;
        
        // Only render tree functionality for the designated tree column
        if (column.name !== treeColumn) {
            return null;
        }
        
        return (
            <TableTreeColumn.Cell
                {...restProps}
                column={column}
                row={row}
                className={classes.tableTreeColumn}
            >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {/* Render the tree expand/collapse button first */}
                    {children}
                    {/* Then render our custom dropdown */}
                    <FormControl className={`${classes.dropdownCell} tree-column-dropdown`} style={{ flex: 1, marginLeft: '8px' }}>
                        <Select
                            value={row.rowId || ''}
                            onChange={(e) => updateRowData(row.id, 'rowId', e.target.value)}
                            className={classes.cellInput}
                            variant="outlined"
                            size="small"
                        >
                            {rowIdOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </TableTreeColumn.Cell>
        );
    };

    return (
        <Paper>
            <Grid rows={rows} columns={columns}>
                <TreeDataState />
                <CustomTreeData getChildRows={getChildRows} />
                <SearchState />
                <FilteringState />
                <SortingState />
                <VirtualTable 
                    cellComponent={tableBodyCell}
                />
                <TableHeaderRow showSortingControls />
                <TableFilterRow />
                <TableTreeColumn 
                    for={treeColumn} 
                    cellComponent={CustomTreeColumn}
                    showSelectAll={false}
                />
                <Toolbar />
                <SearchPanel />
            </Grid>
        </Paper>
    );
};

export default CustDxTreeDataV1;
