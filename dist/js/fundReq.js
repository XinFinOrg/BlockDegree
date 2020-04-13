$(document).ready(() => {
  let currentRequestData = [];
  // $('#pendingFund').DataTable();

  const emptyTuple = `<tr>
  <td></td>
  <td></td>                                                
  <td></td>
  <td>No Requests Yet</td>
  <td></td>
  <td></td></tr>`;

  $.ajax({
    method: "get",
    url: "/api/getAllFunds",
  })
    .then((result) => {
      if (result.status === true) {
        const data = result.data;
        currentRequestData = result.data;
        let retDataApproved = "",
          retDataPending = "";

        data.forEach((currData) => {
          const currDate = new Date(parseFloat(currData.createdAt));
          let donerName = "Anonymous";
          if (
            currData.donerName !== undefined &&
            currData.donerName !== null &&
            currData.donerName !== ""
          ) {
            donerName = currData.donerName;
          }
          if (currData.status === "uninitiated") {
            retDataPending += `<tr>
            <td>${currDate.getDate()}-${currDate.getMonth() + 1}-${
              currDate.getFullYear() + 1
            }</td>
            <td>${
              currData.userName
            }</td>                                                
            <td><button type="button" class="btn btn-outline-primary" onclick="renderRequestModal('${
              currData.userName
            }','${currData.requestUrlShort}','${currData.description}','${
              currData.receiveAddr
            }','${currData.fundId}', '${
              currData.status
            }')">View Description</button></td><td>`;

            for (let z = 0; z < currData.courseId.length; z++) {
              retDataPending += `<span class="courseName">${getCourseName(
                currData.courseId[z]
              )}</span>`;
            }
            retDataPending += `</td>             
            <td>$ ${currData.amountGoal}</td>
            <td><button type="button" onclick="renderPaymentMethodModal('${currData.receiveAddr}', '${currData.fundId}')" class="btn btn-primary">Fund Now</button></td>
          </tr>`;
          } else if (currData.status === "completed") {
            retDataApproved += `<tr>
            <td>${currDate.getDate()}-${currDate.getMonth() + 1}-${
              currDate.getFullYear() + 1
            }</td>
            <td>${
              currData.userName
            }</td>                                                
            <td><button type="button" class="btn btn-outline-primary" onclick="renderRequestModal('${
              currData.userName
            }','${currData.requestUrlShort}','${currData.description}','${
              currData.receiveAddr
            }','${currData.fundId}','${
              currData.status
            }')">View Description</button></td><td>`;
            for (let z = 0; z < currData.courseId.length; z++) {
              retDataApproved += `<span class="courseName">${getCourseName(
                currData.courseId[z]
              )}</span>`;
            }
            retDataApproved += `</td>    
            <td>$ ${currData.amountGoal}</td>
            <td>${donerName}</td>
          </tr>`;
          }
        });
        if (retDataApproved !== "") {
          document.getElementById(
            "approvedFund_tuples"
          ).innerHTML = retDataApproved;
        } else {
          document.getElementById("approvedFund_tuples").innerHTML = emptyTuple;
        }

        if (retDataPending !== "") {
          document.getElementById(
            "pendingFund_tuples"
          ).innerHTML = retDataPending;
        } else {
          document.getElementById("pendingFund_tuples").innerHTML = emptyTuple;
        }

        setTimeout(() => {
          $("#pendingFund").DataTable({
            paging: true,
            pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
          });
          $("#approvedFund").DataTable({
            paging: true,
            pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
          });
          renderRequestedModal(data);
        }, 0);
      }
    })
    .catch((e) => {
      console.log(`exception at ajax.get: `, e);
    });
});

// function switchModalTab(evt, socialPlatform) {
//   var i, tabcontent, tablinks;
//   tabcontent = document.getElementsByClassName("tabcontent");
//   for (i = 0; i < tabcontent.length; i++) {
//     if (tabcontent[i].id !== socialPlatform) {
//       document.getElementById(tabcontent[i].id).style = "display:none";
//     }
//   }
//   tablinks = document.getElementsByClassName("tablinks");
//   for (i = 0; i < tablinks.length; i++) {
//     tablinks[i].className = tablinks[i].className.replace(" active", "");
//   }
//   document.getElementById(socialPlatform).style =
//     "display:inline-block;height:70px";
//   evt.currentTarget.className += " active";
// }

function renderPaymentMethodModal(addr, fundId) {
  const modalHtml = `
  <div class="modal fade" id="paymentMethodModal" tabindex="-1" role="dialog"
      aria-labelledby="paymentModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
              <div class="modal-header">
                  <h3 class="modal-title" style="margin-left:17% ;" id="exampleModalLongTitle">Please Select Payment
                      Method</h3>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
              </div>
              <div class="modal-body">

                  <button type="button" data-dismiss="modal" class="btn-payment" onclick="submitMetamask('${addr}','${fundId}')"
                      data-dismiss="modal"> Pay Via XDC </button>

                  <button type="button" data-dismiss="modal" class="btn-payment" onclick="payByPaypal('${fundId}')"
                      data-dismiss="modal">
                      Pay Via PayPal </button>
              </div>

          </div>
      </div>
  </div>`;
  document.getElementById("paymentMethodModalWrapper").innerHTML = modalHtml;
  $("#paymentMethodModal").modal("toggle");
}

/**
 *
 * @param {string} fundId
 */
function payByPaypal(fundId) {
  console.log("called payByPaypal: ", fundId);
  let formNew = document.createElement('form');
  formNew.style.display="none";
  formNew.action = "/fmd-pay-paypal";
  formNew.method = "post";
  formNew.style.display="none";
  let elementFundId = document.createElement("input");
  elementFundId.name = "fundId";
  elementFundId.value = fundId;
  formNew.appendChild(elementFundId);

  document.body.appendChild(formNew);
  formNew.submit();
}

function handleFundRequestSubmit() {
  console.log("called handleFundRequestSubmit");
  const desc = document.getElementById("req-description").value;
  const courseIds = [];
  const basicCourse = document.getElementById("basic-course").checked;
  if (basicCourse)
    courseIds.push(document.getElementById("basic-course").value);
  const advancedCourse = document.getElementById("advanced-course").checked;
  if (advancedCourse)
    courseIds.push(document.getElementById("advanced-course").value);
  const professionalCourse = document.getElementById("professional-course")
    .checked;
  if (professionalCourse)
    courseIds.push(document.getElementById("professional-course").value);
  $.ajax({
    method: "post",
    url: "/api/requestNewFund",
    data: {
      desc: desc,
      courseId: JSON.stringify(courseIds),
    },
  })
    .then((resp) => {
      if (resp.status === true) {
        $.notify("Successfully submitted the request", { type: "success" });
      } else {
        $.notify(resp.error, { type: "danger" });
      }
      $("#applyNow").modal("hide");
      document.getElementById("req-description").value = "";
      document.getElementById("basic-course").checked = false;
      document.getElementById("advanced-course").checked = false;
      document.getElementById("professional-course").checked = false;
    })
    .catch((e) => {
      console.log("exception : ", e);
      $.notify("Some error occured", { type: "danger" });
      $("#applyNow").modal("hide");
      document.getElementById("req-description").value = "";
      document.getElementById("basic-course").checked = false;
      document.getElementById("advanced-course").checked = false;
      document.getElementById("professional-course").checked = false;
      document.getElementById("facebook-prof").value = "";
      document.getElementById("linkedin-prof").value = "";
      document.getElementById("twitter-prof").value = "";
    });
}
// requestUrlShort, username, description
/**
 *
 * @param {string} userName
 * @param {string} requestUrlShort
 * @param {string} description
 * @param {string} addr
 * @param {string} fundId
 */
function renderRequestModal(
  userName,
  requestUrlShort,
  description,
  addr,
  fundId,
  type
) {
  console.log(addr, fundId);

  const encodedStr = encodeURIComponent(requestUrlShort);
  const twitterText = encodeURIComponent("link: " + requestUrlShort);
  const retHtml =
    `<div class="modal fade" id="requestModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
                  aria-hidden="true">

                  <div class="modal-dialog modal-dialog-centered" role="document">


                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="requestModal--title">Req. By <strong>${userName}</strong></h5>
                              <div>Link: <a target="_blank" href="${requestUrlShort}"><div id="requestUrlShort--input" >${requestUrlShort}</div></a></div>

                          </div>` +
    `
                          <div class="modal-body" id="requestModal--body">
                              ${description}
                          </div>` +
    `<div class="modal-footer">` +
    `${
      type === "completed"
        ? ""
        : `
        <button
          class="btn btn-primary fund-btn"
          data-dismiss="modal"
          onclick="renderPaymentMethodModal('${addr}','${fundId}')"
        >
          Fund
        </button>
      `
    }
                               Share On&nbsp;
                              <a target="_blank" class="modal-footter" href="https://twitter.com/intent/tweet?text=${twitterText}">
                                  <i class="fa fa-twitter"></i>
                              </a>&nbsp;
                              <div class="fb-share-button" data-href="${requestUrlShort}" data-layout="button" data-size="small"><a
  target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encodedStr}"
  class="fb-xfbml-parse-ignore"><i class="fa fa-facebook"></i></a></div>
                          </div>` +
    `</div>
</div>
</div>`;

  document.getElementById("requestModalWrapper").innerHTML = retHtml;
  setTimeout(() => $("#requestModal").modal("toggle"), 0);

  if (typeof web3 != "undefined") {
    web3.version.getNetwork(async (err, providerNetworkId) => {
      await ethereum.enable();
    });
  }
}

function copyToClipboard() {
  var copyText = document.getElementById("requestLinkInput");

  /* Select the text field */
  console.log(copyText.value);
  copyText.select();

  /* Copy the text inside the text field */
  document.execCommand("copy");
  $.notify("copied !", { type: "info" });
}

function getCourseName(id) {
  switch (id) {
    case "course_1":
      return "Blockchain Basic";
    case "course_2":
      return "Blockchain Advanced";
    case "course_3":
      return "Blockchain Professional";
    default:
      return "";
  }
}

function submitMetamask(addr, fundId) {
  console.log(`received address ${addr} at submitMetamask`);
  if (typeof web3 == "undefined") {
    // no web3 provider is available, ask to install XinPay

    if (typeof InstallTrigger !== "undefined") {
      $.notify(
        "Please install <strong><a target='_blank' href='https://addons.mozilla.org/en-US/firefox/addon/ether-metamask'>Metamask</a></strong> and login & setup your wallet to continue, if already did please <a onclick='window.location.reload()'>refresh</a>",
        { delay: 5000 }
      );
    } else if (
      !!window.chrome &&
      (!!window.chrome.webstore || !!window.chrome.runtime)
    ) {
      $.notify(
        "Please install <strong><a target='_blank' href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en'>Metamask</a></strong> and login & setup your wallet to continue, if already did please <a onclick='window.location.reload()'>refresh</a>",
        { delay: 5000 }
      );
    } else {
      $.notify(
        "This feature is not available in this browser, please try again using Chrome browser or Firefox",
        { type: "danger" }
      );
    }
  }

  web3.version.getNetwork(async (err, providerNetworkId) => {
    await ethereum.enable();

    if (err) {
      $.notify("Oops, error occurred while getting the network ID");
      return;
    }

    // 1 - Mainnet
    // 4 - Rinkeby
    if (providerNetworkId == 4) {
      console.log("on rinkeby");
      const tx = {
        from: web3.eth.defaultAccount,
        to: addr,
        value: "1000000000000000000",
      };
      web3.eth.sendTransaction(tx, (err, result) => {
        console.log(err, result);
        if (err) {
          return $.notify("Error in making tx", { type: "danger" });
        }
        $.ajax({
          method: "post",
          url: "/api/initiateDonation",
          data: {
            fundId: fundId,
            tx: result,
          },
        })
          .then((resp) => {
            if (resp.status === true) {
              $.notify("Donation initiated", { type: "success" });
            } else {
              return $.notify(resp.error, { type: "danger" });
            }
          })
          .catch((e) => {
            return $.notify("Error in making tx", { type: "danger" });
          });
      });
    } else {
      $.notify("Wrong network", { type: "danger" });
    }
  });
}

function renderRequestedModal(allData) {
  const fundId = getParamValue("fundId");
  console.log("FundId: ", fundId);

  if (fundId !== null) {
    for (let i = 0; i < allData.length; i++) {
      console.log(allData[i].fundId);
      if (allData[i].fundId === fundId) {
        renderRequestModal(
          allData[i].userName,
          allData[i].requestUrlShort,
          allData[i].description,
          allData[i].receiveAddr,
          allData[i].fundId,
          allData[i].status
        );
        return;
      }
    }
  }
}

function getParamValue(param) {
  let currentUrl = window.location.href;
  if (currentUrl.split("?").length > 1) {
    let paramsString = currentUrl.split("?")[1];
    const params = paramsString.split("&");
    for (let i = 0; i < params.length; i++) {
      const key = params[i].split("=")[0];
      const value = params[i].split("=")[1];
      if (key === param) return value;
    }
  }

  return null;
}
