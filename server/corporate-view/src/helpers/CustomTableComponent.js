import React, { Component } from "react";

let initialState = {
  selectedRows: null,
  selectAll: false,
};

class CustomTable extends Component {
  constructor(props) {
    super(props);

    const data = props.data;
    const columns = props.columns;
  }

  renderHead() {
    return columns.map(({ name }) => {
      return <th>{name}</th>;
    });
  }

  renderBody() {
    return data.map(({ value }) => {
      return <td>{value}</td>;
    });
  }

  render() {
    return (
      <div className="table-one">
        <table>
          <thead>{renderHead()}</thead>
          <tbody></tbody>
        </table>
      </div>
    );
  }
}
