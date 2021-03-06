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

const RazorPayLogColumns = [
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
        dataField: "paymentId",
        text: "Payment Id",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "orderId",
        text: "Order Id",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "status",
        text: "Status",
        filter: textFilter(),
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "receipt",
        text: "Receipt",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "signature",
        text: "Signature",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "amount",
        text: "Amount",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "promoCode",
        text: "Promo Code",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
    {
        dataField: "referralCode",
        text: "Referral Code",
        filter: textFilter(),
        sort: true,
        headerFormatter: defHeadFormatter,
    },
];

export class RazorPayLog extends Component {
    componentDidMount() {
        this.props.fetchRazorPayLog();
        if (this.props.razorpaylog) this.filterRazorPayLog();
    }
    filterRazorPayLog() {
        let srNo = 1;
        let returnData = [];
        this.props.razorpaylog.data.map(pay => {
            returnData.push({
                srNo: srNo++,
                email: pay.email,
                paymentId: pay.paymentId,
                orderId: pay.orderId,
                status: pay.status,
                receipt: pay.receipt,
                signature: pay.signature,
                amount: pay.amount,
                promoCode: pay.promoCode,
                referralCode: pay.referralCode,
            });
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
                                        Razor Pay Log Table{" "}
                                        <span
                                            onClick={() => {
                                                this.props.fetchRazorPayLog();
                                            }}
                                            className="table-refresh-btn"
                                        >
                                            <i class="fa fa-refresh" aria-hidden="true"></i>
                                        </span>
                                    </h4>
                                    <p>Table with all Razor Pay Log</p>
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
                                        {this.props.razorpaylog ? (
                                            <div className="table-updated right">
                                                <i className="fa fa-history"></i> Updated at{" "}
                                                <strong>
                                                    {new Date(this.props.razorpaylog.fetchedTS).getHours() +
                                                        ":" +
                                                        new Date(
                                                            this.props.razorpaylog.fetchedTS
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
                            {this.props.razorpaylog ? (
                                <div>
                                    <BootstrapTable
                                        keyField="srNo"
                                        data={this.filterRazorPayLog()}
                                        columns={RazorPayLogColumns}
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

function mapsStateToProps({ razorpaylog }) {
    return { razorpaylog };
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

export default connect(mapsStateToProps, actions)(RazorPayLog);