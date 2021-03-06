import React, { Component } from "react";
import { connect } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import * as actions from "../../actions";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {
    textFilter,
    dateFilter,
    numberFilter
} from "react-bootstrap-table2-filter";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { Button, Modal } from "react-bootstrap";


function createdPostFilter(filterVal, data) {
    if (filterVal.date != null && filterVal.comparator !== "") {
        return data.filter(row => {
            if (!isNaN(Date.parse(row.issueDate)) && Date.parse(row.issueDate) > 0) {
                return evaluateDateExpression(
                    row.issueDate,
                    filterVal.date,
                    filterVal.comparator
                );
            }
            return false;
        });
    }
    return data;
}

function expiryDatePostFilter(filterVal, data) {
    if (filterVal.date != null && filterVal.comparator !== "") {
        return data.filter(row => {
            if (
                !isNaN(Date.parse(row.expiryDate)) &&
                Date.parse(row.expiryDate) > 0
            ) {
                return evaluateDateExpression(
                    row.expiryDate,
                    filterVal.date,
                    filterVal.comparator
                );
            }
            return false;
        });
    }
    return data;
}

function defHeadFormatter(column, colIndex, { sortElement, filterElement }) {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div>{filterElement}</div>
            <div>
                {column.text}
                {sortElement}
            </div>
        </div>
    );
}
const fundMyDegreeColumns = [
    {
        dataField: "srNo",
        text: "Sr.No",
        sort: true,
    },
    {
        dataField: "email",
        text: "User Email",
        sort: true,
        filter: textFilter(),
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "userName",
        text: "User Name",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "courseId",
        text: "Course ID",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "requestUrlShort",
        text: "Request Url",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "donerEmail",
        text: "Donor Email",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "donerName",
        text: "Donor Name",
        filter: textFilter(),
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "description",
        text: "Description",
        // sort: true,
        headerFormatter: defHeadFormatter,
    },
];

export class FundMyDegree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
        this.modeler = this.modeler.bind(this);
    }

    showDesc() {
        this.setState({ showModal: !this.state.showModal });
    }

    componentDidMount() {
        this.props.fetchFundMyDegree();
        if (this.props.fundmydegree) this.filterFundMyDegree();
    }

    filterFundMyDegree() {
        let srNo = 1;
        let returnData = [];
        this.props.fundmydegree.data.map(userFund => {
            if (!userFund.length) return <span>Data Not Available</span>;
            else {
                returnData.push({
                    srNo: srNo++,
                    email: userFund.email,
                    userName: userFund.userName,
                    courseId: userFund.courseId,
                    requestUrlShort: <a href={userFund.requestUrlShort}>{userFund.requestUrlShort}</a>,
                    donerEmail: userFund.donerEmail,
                    donerName: userFund.donerName,
                    description: <Button onClick={() => this.showDesc(), this.modeler(userFund.description)}></Button>,
                });
            }
        });

        if (document.getElementById("currDataCount"))
            document.getElementById("currDataCount").innerHTML = returnData.length;
        return returnData;
    }

    handleDataChange = data => {
        document.getElementById("currDataCount").innerHTML = data.dataSize;
    };


    render() {
        function modeler(modelData) {
            return (
                <Modal show={this.state.showModal} keyboard={true} centered animation={true} onHide={() => { this.setState({ showModal: !this.state.showModal }); }} size="lg" aria-labelledby="contained-modal-title-vcenter"
                    dialogClassName="description-modal blockdegree-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>Description</Modal.Title>
                        <Modal.Body>
                            {modelData}
                        </Modal.Body>
                    </Modal.Header>
                </Modal>
            );
        }

        return (
            <div className="table-container">
                {modeler()}
                <div className="row">
                    <div className="col-md-12">
                        <div className="header">
                            <div className="row">
                                <div className="col-md-6">
                                    <h4>
                                        Fund My Degree Table{" "}
                                        <span
                                            onClick={() => {
                                                this.props.fetchFundMyDegree();
                                            }}
                                            className="table-refresh-btn"
                                        >
                                            <i class="fa fa-refresh" aria-hidden="true"></i>
                                        </span>
                                    </h4>
                                    <p>Table with all Fund My Degree</p>
                                </div>
                                <div className="col-md-6">
                                    <div
                                        id="currRowCount"
                                        className="right table-row-count-wrapper"
                                    >
                                        <span>
                                            <span className="table-row-count-label">
                                                Current Row Count&nbsp;
                        <i class="fa fa-arrow-right"></i>
                        &nbsp;
                      </span>
                                            <span id="currDataCount" className="table-row-count">
                                                {" "}
                                                <i
                                                    className="fa fa-cogs"
                                                    style={{ color: "black" }}
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </span>
                                        <br />
                                        {this.props.fundmydegree ? (
                                            <div className="table-updated right">
                                                <i className="fa fa-history"></i> Updated at{" "}
                                                <strong>
                                                    {new Date(this.props.fundmydegree.fetchedTS).getHours() +
                                                        ":" +
                                                        new Date(
                                                            this.props.fundmydegree.fetchedTS
                                                        ).getMinutes()}
                                                </strong>{" "}
                        Hours
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            {this.props.fundmydegree ? (
                                <div>
                                    <BootstrapTable
                                        keyField="srNo"
                                        data={this.filterFundMyDegree()}
                                        columns={fundMyDegreeColumns}
                                        filter={filterFactory()}
                                        pagination={paginationFactory({
                                            hideSizePerPage: true
                                        })}
                                        onDataSizeChange={this.handleDataChange}
                                    />
                                </div>
                            ) : (
                                <div className="chart-preload">
                                    <div>
                                        <i className="fa fa-cogs fa-5x" aria-hidden="true" />
                                    </div>
                  Loading
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


function mapsStateToProps({ fundmydegree }) {
    return { fundmydegree };
}

function evaluateDateExpression(a, b, comparator) {
    const a_date = new Date(a);
    const b_date = new Date(b);
    b_date.setHours(0, 0, 0, 0);
    switch (comparator) {
        case "=": {
            if (
                a_date.getDate() === b_date.getDate() &&
                a_date.getMonth() === b_date.getMonth() &&
                a_date.getFullYear() === b_date.getFullYear()
            ) {
                return true;
            }
            return false;
        }
        case ">=": {
            if (a_date.getTime() >= b_date.getTime()) {
                return true;
            }
            return false;
        }
        case "<=": {
            if (a_date.getTime() <= b_date.getTime()) {
                return true;
            }
            return false;
        }
        case ">": {
            if (a_date.getTime() > b_date.getTime()) {
                return true;
            }
            return false;
        }
        case "<": {
            if (a_date.getTime() < b_date.getTime()) {
                return true;
            }
            return false;
        }
        default: {
        }
    }
}

export default connect(mapsStateToProps, actions)(FundMyDegree);
