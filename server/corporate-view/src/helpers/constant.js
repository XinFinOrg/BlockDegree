import React from "react";

export const GetParamValue = (key) => {
  const pathName = document.location.pathname;
  let allParam = pathName.split("?");
  if (allParam.length > 1) {
    allParam = pathName.split("&");
    for (let i = 0; i < allParam.length; i++) {
      const [currKey, currVal] = allParam.split("=");
      if (currKey === key) return currVal;
    }
  }
  return null;
};

export const BytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

/**
 * will return date in local format
 * @param {Stirng|Number} dateStr
 */
export const GetDateLocalFormat = (dateStr) => {
  let date = new Date(dateStr);
  return `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
};

/**
 * will return anchor tag with truncated value
 * @param {string} txHash transaction hash
 */
export const GetTxLink = (txHash) => {
  return (
    <a target="_blank" href={`https://explorer.xinfin.network/tx/${txHash}`}>
      {txHash.slice(0, 10)}
    </a>
  );
};

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    Showing {from} to {to} of {size} Results
  </span>
);

export const PaginationOption = {
  paginationSize: 4,
  pageStartIndex: 0,
  // alwaysShowAllBtns: true, // Always show next and previous button
  // withFirstAndLast: false, // Hide the going to First and Last page button
  // hideSizePerPage: true, // Hide the sizePerPage dropdown always
  // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
  firstPageText: "First",
  prePageText: "Back",
  nextPageText: "Next",
  lastPageText: "Last",
  nextPageTitle: "First page",
  prePageTitle: "Pre page",
  firstPageTitle: "Next page",
  lastPageTitle: "Last page",
  showTotal: true,
  paginationTotalRenderer: customTotal,
  disablePageTitle: true,
  sizePerPageList: [
    {
      text: "5",
      value: 5,
    },
    {
      text: "10",
      value: 10,
    },
    {
      text: "All",
      value: 20,
    },
  ], // A numeric array is also available. the purpose of above example is custom the text
};
