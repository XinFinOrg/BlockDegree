import React, { useState } from "react";
import { useTable } from "react-table";

function RenderTable(props) {
  const data = React.useMemo(() => props.data, []);
  const columns = React.useMemo(() => props.columns, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  const handleCellClick = (...opts) => {
    console.log("Event : ", opts);
  };

  return (
    <div className="table-one">
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            let id = `${i}`;
            console.log("ID: ", id);
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  if (cell.column.id === "col0") {
                    {
                      /* allOnClickHandlers[i + ""] = function (e, i) {
                      console.log("event checked: ", e.target.checked);
                      console.log(i);
                    }; */
                    }
                    cell.column.name = cell.row.id+"";
                    cell.column.onClick = (e) => {
                      console.log(
                        "event Id: ",
                        e.target,
                        "checked: ",
                        e.target
                      );
                    };
                    console.log("cell: ",cell.row.id+"");
                  }

                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            let rowId = row.id;
            console.log(`rowId: `, rowId);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  if (cell.column.id === "col0") {
                    cell.column.onClick = (e) => {
                      console.log("cell: ", cell);
                      handleCellClick(e.target.checked, rowId);
                    };
                  }
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table> */}
    </div>
  );
}

export default RenderTable;
