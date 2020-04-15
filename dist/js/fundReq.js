let globalPendingDT, globalApprovedDT;

$(document).ready(() => {
  getFMDAllData();
});

function getFMDAllData(update) {
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
        console.log("Current Request Data: ", currentRequestData);

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
            <td>${currDate.getDate()}/${
              currDate.getMonth() + 1
            }/${currDate.getFullYear()} ${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}</td>
            <td>${
              currData.userName
            }</td>                                                
            <td><button type="button" class="btn btn-outline-primary" onclick="renderRequestModal('${
              currData.userName
            }','${currData.requestUrlShort}','${currData.requestUrlLong}','${
              currData.description.replace(/'/g,"\\'")
            }','${currData.receiveAddr}','${currData.fundId}', '${
              currData.status
            }','${currData.amountGoal}')">View Description</button></td><td>`;

            for (let z = 0; z < currData.courseId.length; z++) {
              retDataPending += `<span class="courseName">${getCourseName(
                currData.courseId[z]
              )}</span>`;
            }
            retDataPending += `</td>             
            <td>$ ${currData.amountGoal}</td>
            <td><button type="button" onclick="renderPaymentMethodModal('${currData.receiveAddr}', '${currData.fundId}', ${currData.amountGoal})" class="btn btn-primary">Fund Now</button></td>
          </tr>`;
          } else if (currData.status === "completed") {
            retDataApproved += `<tr>
            <td>${currDate.getDate()}/${
              currDate.getMonth() + 1
            }/${currDate.getFullYear()} ${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}</td>
            <td>${
              currData.userName
            }</td>                                                
            <td><button type="button" class="btn btn-outline-primary" onclick="renderRequestModal('${
              currData.userName
            }','${currData.requestUrlShort}','${currData.requestUrlLong}','${
              currData.description.replace(/\'/g,"\\'")
            }','${currData.receiveAddr}','${currData.fundId}','${
              currData.status
            }','${currData.amountGoal}')">View Description</button></td><td>`;
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
        if (update !== true) {
          globalPendingDT = $("#pendingFund").DataTable({
            paging: true,
            pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
          });
          globalApprovedDT = $("#approvedFund").DataTable({
            paging: true,
            pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
          });
        }
        renderRequestedModal(data);
      }
    })
    .catch((e) => {
      console.log(`exception at ajax.get: `, e);
    });
}

// var copyToClipboard = function (text) {
//   console.log("called copyToClipboard: ", text)
//   var $body = document.getElementsByTagName('body')[0];
//   var $tempInput = document.createElement("INPUT");
//   $body.appendChild($tempInput);
//   $tempInput.setAttribute("value", text);
//   $tempInput.select();
//   document.execCommand("copy");
//   $body.removeChild($tempInput);
// };

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

function renderPaymentMethodModal(addr, fundId, amountGoal) {
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

                  <button type="button" data-dismiss="modal" class="btn-payment" onclick="submitMetamask('${addr}','${fundId}', '${amountGoal}')"
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
  let formNew = document.createElement("form");
  formNew.style.display = "none";
  formNew.action = "/fmd-pay-paypal";
  formNew.method = "post";
  formNew.style.display = "none";
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
        if (resp.requestPending === true) {
          $.notify(
            "Request submitted, we'll notify once its status is updated",
            { type: "warning", duration: 5000 }
          );
        } else {
          $.notify("Successfully submitted the request", { type: "success" });
        }
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
  requestUrlLong,
  description,
  addr,
  fundId,
  type,
  amountGoal
) {
  console.log(addr, fundId);
  const whatsappText = `Help Fund My Degree at Blockdegree, link ${requestUrlShort}`;
  const linkedinTitle = "Help Fund My Degree at Blockdegree";
  const encodedStr = encodeURIComponent(requestUrlShort);
  const twitterText = encodeURIComponent("link: " + requestUrlShort);
  const linkedinText = `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    requestUrlLong
  )}&source=blockdegree.org`;
  const retHtml =
    `<div class="modal fade" id="requestModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
                  aria-hidden="true">

                  <div class="modal-dialog modal-dialog-centered" role="document">


                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="requestModal--title">Request By <strong>${userName}</strong></h5>
                              <button type="button" class="btn btn-outline-primary" onclick="copyToClipboard('${requestUrlShort}')" >Copy Link</button>

                          </div>` +
    `
                          <div class="modal-body" id="requestModal--body">
                              ${description.replace("")}
                          </div>` +
    `<div class="modal-footer">` +
    `${
      type === "completed"
        ? ""
        : `
        <button
          class="btn btn-secondary fund-btn-close"
          data-dismiss="modal"

        >
          Close
        </button>
        <button
          class="btn btn-primary fund-btn"
          data-dismiss="modal"
          onclick="renderPaymentMethodModal('${addr}','${fundId}', '${amountGoal}')"
        >
          Fund
        </button>
      `
    }
                               Share On&nbsp;
                               <a target="_blank" href="${
                                 isMobile() === true
                                   ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
                                       whatsappText
                                     )}`
                                   : `https://web.whatsapp.com/send?text=${encodeURIComponent(
                                       whatsappText
                                     )}`
                               }">
                               <i class="fa fa-whatsapp"></i>
                             </a>&nbsp;                               
                               <a target="_blank" href="${linkedinText}">
                                <i class="fa fa-linkedin"></i>
                              </a>&nbsp;
                              <a target="_blank" href="https://twitter.com/intent/tweet?text=${twitterText}">
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

function submitMetamask(addr, fundId, amountGoal) {
  console.log(`received address ${addr} at submitMetamask ${amountGoal}`);
  if (typeof web3 == "undefined") {
    // no web3 provider is available, ask to install XinPay

    if (
      !!window.chrome &&
      (!!window.chrome.webstore || !!window.chrome.runtime)
    ) {
      $.notify(
        "Please install <strong><a target='_blank' href='https://chrome.google.com/webstore/detail/xinpay/bocpokimicclpaiekenaeelehdjllofo'>XinPay</a></strong> and login & setup your wallet to continue, if already did please <a onclick='window.location.reload()'>refresh</a>",
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

    const xdcPriceResponse = await $.get("/api/wrapCoinMarketCap");
    const xdcPrice = xdcPriceResponse.data;
    console.log("xdc price: ", xdcPrice);
    // 1 - Mainnet
    // 4 - Rinkeby
    // 50 - XDC mainnet
    if (providerNetworkId == 50) {
      console.log(
        "on rinkeby ",
        web3.toWei(
          String(parseFloat(amountGoal) / parseFloat(xdcPrice)),
          "ether"
        )
      );
      if (web3.eth.defaultAccount == undefined) {
        $.notify(
          "Please login & setup your <strong>XinPay</strong> web-extension to continue, if already did please <a onclick='window.location.reload()'>refresh</a>"
        );
        return;
      }
      const tx = {
        from: web3.eth.defaultAccount,
        to: addr.replace("xdc", "0x"),
        value:
          Math.round(
            web3.toWei(
              String(parseFloat(amountGoal) / parseFloat(xdcPrice)),
              "ether"
            )
          ) + "",
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
          allData[i].requestUrlLong,
          allData[i].description.replce(/\'/g,"\\'"),
          allData[i].receiveAddr,
          allData[i].fundId,
          allData[i].status,
          allData[i].amountGoal
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

var copyToClipboard = function (secretInfo) {
  console.log("called copyToClipboard");
  var $body = document.getElementById("requestModal--title");
  var $tempInput = document.createElement("INPUT");
  $body.appendChild($tempInput);
  $tempInput.setAttribute("value", secretInfo);
  $tempInput.select();
  document.execCommand("copy");
  $body.removeChild($tempInput);
  $.notify("Request link Copied!", { type: "info", z_index: 2000 });
};

function isMobile() {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}
