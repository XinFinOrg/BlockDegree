import React, { Component } from "react";
import { connect } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import * as actions from "../../actions";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {
    textFilter
} from "react-bootstrap-table2-filter";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

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
const referalsColumns = [
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
        dataField: "referralCode",
        text: "Referral Code",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "longUrl",
        text: "Long Url",
        filter: textFilter(),
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "registrations",
        text: "Registrations",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
];

export class Referal extends Component {
    componentDidMount() {
        this.props.fetchReferals();
        if (this.props.referals) this.filterUserReferals();
    }

    filterUserReferals() {
        let srNo = 1;
        let returnData = [];
        this.props.referals.data.map(ref => {
            if (ref.length < 0) {
                return <span>No Data Available</span>;
            } else {
                returnData.push({
                    srNo: srNo++,
                    email: ref.email,
                    referralCode: ref.referralCode,
                    longUrl: ref.longUrl,
                    registrations: ref.registrations
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
        return (
            <div className="table-container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="header">
                            <div className="row">
                                <div className="col-md-6">
                                    <h4>
                                        User Referals Table{" "}
                                        <span
                                            onClick={() => {
                                                this.props.fetchReferals();
                                            }}
                                            className="table-refresh-btn"
                                        >
                                            <i class="fa fa-refresh" aria-hidden="true"></i>
                                        </span>
                                    </h4>
                                    <p>Table with all User Referral</p>
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
                                        {this.props.referals ? (
                                            <div className="table-updated right">
                                                <i className="fa fa-history"></i> Updated at{" "}
                                                <strong>
                                                    {new Date(this.props.referals.fetchedTS).getHours() +
                                                        ":" +
                                                        new Date(
                                                            this.props.referals.fetchedTS
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
                            {this.props.referals ? (
                                <div>
                                    <BootstrapTable
                                        keyField="srNo"
                                        data={this.filterUserReferals()}
                                        columns={referalsColumns}
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

function mapsStateToProps({ referals }) {
    return { referals };
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

export default connect(mapsStateToProps, actions)(Referal);