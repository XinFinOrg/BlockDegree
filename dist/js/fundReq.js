let globalPendingDT, globalApprovedDT;
let loginLinkedin = false,
  loginTwitter = false,
  twitterFunder = false,
  linkedinFunder = false,
  linkedinfundId = "",
  twitterFundId = "";

let showRazorpay = false;
let validCountry = ["IN"];
// let validCountry = [""];

$(document).ready(() => {
  /**
   * Validations for 2-step apply
   */
  $("#fs-select-course input").change((e) => {
    // check if atleast one selected
    console.log(`FS_SELECT_COURSE_CHANGE: `, e.target.id);
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
    const computingCourse = document.getElementById("computing-course").checked;
    if (computingCourse)
      courseIds.push(document.getElementById("computing-course").value);

    if (courseIds.length > 0) {
      $("#fs-select-course .next").removeAttr("disabled");
      $("#fs-select-course .next").removeClass("disabled");
    } else {
      $("#fs-select-course .next").attr("disabled", "true");
      $("#fs-select-course .next").addClass("disabled");
    }
  });
  $("#fs-add-desc textarea").on('keyup',(e) => {
    // check text limit
    const desc = document.getElementById("req-description").value;
    
    if (desc && desc.trim()!=="" && desc.trim().length > 10 && desc.trim().length < 250 ){
      $("#fs-add-desc .err").html("&nbsp;");
      $("#fs-add-desc .next").removeAttr("disabled");
      $("#fs-add-desc .next").removeClass("disabled");
    }else{
      if (desc.trim().length < 10 ){
        $("#fs-add-desc .err").html("description too short");
      } else if (desc.trim().length > 250) {
        $("#fs-add-desc .err").html("description too long");
      }
      $("#fs-add-desc .next").attr("disabled", "true");
      $("#fs-add-desc .next").addClass("disabled");
    }
  });

  $("#images-apply").change((e) => {
    // atleast one banner active
    const templateNo = document.getElementById("images-apply").value;
    console.log("template no: ", templateNo);
    
    if (templateNo && ["1","2","3"].includes(templateNo)){
      $("#fs-select-banner .next").removeAttr("disabled");
      $("#fs-select-banner .next").removeClass("disabled");
    }else{
      $("#fs-select-banner .next").attr("disabled", "true");
      $("#fs-select-banner .next").addClass("disabled");
    }
  });

  console.log(window.location.pathname);
  if (window.location.pathname != "/profile") getFMDAllData();

  $("#xdc-modal-copy-btn").click(() => {
    copyToClipboard($("#xdc-addr-value-modal").val(), "xdc-qr-img", "Address");
  });

  $("#req-claim-fund").click(() => {
    claimFund($("#xdc-addr-claim-fund-id").val());
  });

  window.addEventListener("message", function (event) {
    if (
      event.origin == "https://www.blockdegree.org" ||
      event.origin == "https://blockdegree.org"
    ) {
      if (event.data == "share") {
        console.log("message from popup.");
        // toggle linkedin modal
        if (loginLinkedin === true) {
          if (linkedinFunder === true) {
            $("#funder-certi-link").attr(
              "src",
              `/img/funder-certi/${linkedinfundId}.png`
            );
            $("#togglePostLinkedinFunder").click();
            linkedinFunder = false;
          } else {
            $("#togglePostLinkedin").click();
          }
          loginLinkedin = false;
        }

        // toggle twitter modal
        if (loginTwitter === true) {
          if (twitterFunder) {
            $("#funder-certi-twit").attr(
              "src",
              `/img/funder-certi/${twitterFundId}.png`
            );
            $("#togglePostTwitterFunder").click();
            twitterFunder = false;
          } else {
            $("#togglePostTwitter").click();
          }

          loginTwitter = false;
        }
      }
    }
  });
});

async function getFMDAllData(update) {
  let currentRequestData = [];
  // $('#pendingFund').DataTable();

  const xdcPriceResponse = await $.get("/api/wrapCoinMarketCap");
  const xdcPrice = xdcPriceResponse.data;

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
        let country = result.country;
        let userEmail = result.userEmail;
        if (validCountry.includes(country)) {
          showRazorpay = true;
        }
        console.log("showrazorpay inside getAllFunds ", showRazorpay);

        const data = result.data;
        currentRequestData = result.data;
        let pendingFundsUsd = 0,
          approvedFundsUsd = 0,
          pendingFundsCnt = 0,
          approvedFundsCnt = 0;

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
            pendingFundsCnt++;
            pendingFundsUsd += parseFloat(currData.amountGoal);
            retDataPending += `<tr>
            <td>${currDate.getDate()}/${
              currDate.getMonth() + 1
            }/${currDate.getFullYear()} ${currDate.getHours()}:${currDate.getMinutes()}</td>
            <td>${
              currData.userName
            }</td>                                                
            <td><button type="button" class="btn btn-outline-primary" onclick="renderRequestModal('${
              currData.userName
            }','${currData.requestUrlShort}','${
              currData.requestUrlLong
            }','${escape(currData.description)}','${currData.receiveAddr}','${
              currData.fundId
            }', '${currData.status}','${currData.amountGoal}', '${
              currData.donerName
            }','${
              userEmail === currData.email
            }')">View Description</button></td><td>`;

            for (let z = 0; z < currData.courseId.length; z++) {
              retDataPending += `<span class="courseName">${getCourseName(
                currData.courseId[z]
              )}</span>`;
            }
            retDataPending += `</td>             
            <td>$ ${currData.amountGoal}</td>
            <td><button type="button" onclick="renderPaymentMethodModal('${
              currData.receiveAddr
            }', '${currData.fundId}', ${currData.amountGoal})" ${
              userEmail === currData.email ? "disabled" : ""
            } class="btn btn-primary">Fund Now</button></td>
          </tr>`;
          } else if (currData.status === "completed") {
            const completionDate = new Date(
              parseFloat(currData.completionDate)
            );
            approvedFundsCnt++;
            approvedFundsUsd += parseFloat(currData.amountGoal);
            retDataApproved += `<tr>
            <td>${currDate.getDate()}/${
              currDate.getMonth() + 1
            }/${currDate.getFullYear()} ${currDate.getHours()}:${currDate.getMinutes()}</td>
            <td>${completionDate.getDate()}/${
              completionDate.getMonth() + 1
            }/${completionDate.getFullYear()} ${completionDate.getHours()}:${completionDate.getMinutes()}</td>
            <td>${
              currData.userName
            }</td>                                                
            <td><button type="button" class="btn btn-outline-primary" onclick="renderRequestModal('${
              currData.userName
            }','${currData.requestUrlShort}','${
              currData.requestUrlLong
            }','${escape(currData.description)}','${currData.receiveAddr}','${
              currData.fundId
            }','${currData.status}','${currData.amountGoal}', '${
              currData.donerName
            }'
            )">View Description</button></td><td>`;
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
            // pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
          });
          globalApprovedDT = $("#approvedFund").DataTable({
            paging: true,
            // pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
          });
        }

        document.getElementById(
          "totPendFundReqUsd"
        ).innerHTML = addDelimitation(Math.round(pendingFundsUsd * 100) / 100);
        document.getElementById(
          "totPendFundReqXdc"
        ).innerHTML = addDelimitation(
          Math.round((pendingFundsUsd * 100) / parseFloat(xdcPrice)) / 100
        );

        // totAlreadyFundReqUsd
        document.getElementById(
          "totApprFundReqUsd"
        ).innerHTML = addDelimitation(Math.round(approvedFundsUsd * 100) / 100);
        document.getElementById(
          "totApprFundReqXdc"
        ).innerHTML = addDelimitation(
          Math.round((approvedFundsUsd * 100) / parseFloat(xdcPrice)) / 100
        );
        document.getElementById("totFmdCntPend").innerHTML = addDelimitation(
          pendingFundsCnt
        );
        document.getElementById("totFmdCntAppr").innerHTML = addDelimitation(
          approvedFundsCnt
        );

        renderRequestedModal(data, userEmail);
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

                  <button type="button" data-dismiss="modal" class="btn-payment" onclick="renderQRCode('${addr}','${amountGoal}', '${fundId}')"
                      data-dismiss="modal"> Pay Via XDC </button>

                  <button type="button" data-dismiss="modal" class="btn-payment" onclick="submitMetamask('${addr}', '${fundId}','${amountGoal}')"
                      data-dismiss="modal"> Pay Via XinPay </button>

                  <button type="button" data-dismiss="modal" class="btn-payment" onclick="payByPaypal('${fundId}')"
                      data-dismiss="modal">
                      Pay Via PayPal </button>

                  ${
                    showRazorpay == true
                      ? `<button type="button" data-dismiss="modal" class="btn-payment" onclick="payRazorpay('${fundId}','${amountGoal}')"
                      data-dismiss="modal"> Pay Via CARD/NetBanking/UPI </button>`
                      : ""
                  }
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
  const computingCourse = document.getElementById("computing-course").checked;
  if (computingCourse)
    courseIds.push(document.getElementById("computing-course").value);
  const templateNumber = document.getElementById("images-apply").value;
  const message = document.getElementById("apply-msg").value;
  const socialPostPlatform = twitterAuthStatus===true?"twitter":"linkedin";
  $.notify("Submitting the <strong>Funding Request</strong> . . .", {
    type: "info", allow_dismiss: false, delay: Date.now(), placement: {
      from: 'bottom',
      align: 'right'
    }
  });

  $.ajax({
    method: "post",
    url: "/api/requestNewFund",
    data: {
      desc: desc,
      courseId: JSON.stringify(courseIds),
      message, socialPostPlatform,
      templateNumber
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
          $.notify(
            "Successfully submitted the request and posted on social media !!",
            { type: "success", z_index: 2000 }
          );
          renderRequestModal(
            resp.data.userName,
            resp.data.shortUrl,
            resp.data.longUrl,
            escape(resp.data.description),
            resp.data.addr,
            resp.data.fundId,
            "uninitiated",
            resp.data.amountGoal,
            "",
            "true"
          );
        }
      } else {
        $.notify(resp.error, { type: "danger" });
      }
      $.notifyClose("bottom-right");
      $("#applyNow").modal("hide");
      document.getElementById("req-description").value = "";
      document.getElementById("basic-course").checked = false;
      document.getElementById("advanced-course").checked = false;
      document.getElementById("professional-course").checked = false;
      document.getElementById("computing-course").checked = false;
    })
    .catch((e) => {
      console.log("exception : ", e);
      $.notify("Some error occured", { type: "danger" });
      $("#applyNow").modal("hide");
      document.getElementById("req-description").value = "";
      document.getElementById("basic-course").checked = false;
      document.getElementById("advanced-course").checked = false;
      document.getElementById("professional-course").checked = false;
      document.getElementById("computing-course").checked = false;
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
  amountGoal,
  funderName,
  fundDisabled
) {
  console.log(addr, fundId);
  description = unescape(description);
  const whatsappText = `Check the new function of #Blockdegree, where students can apply for funding to give exams for free. Funders can fund any student and get their name on a student's certificate as a sponsor.\nLink: ${requestUrlShort}\n`;
  const linkedinTitle = "Help Fund My Degree at Blockdegree";
  const encodedStr = encodeURIComponent(requestUrlShort);
  const twitterText = `Check the new function of #Blockdegree, where students can apply for funding to give exams for free. Funders can fund any student and get their name on a student\'s certificate as a sponsor.Link: ${requestUrlShort} #onlinelearning #FundMyDegree`;
  const funderTextMsg = "";
  const linkedinText = `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    requestUrlShort
  )}&source=blockdegree.org`;
  const funderMessage =
    "Sponsored a student's degree at Blockdegree.org! #blockdegree #fundmydegree #onlineeducation";
  const fundeeMessage = `Thank you <b>${
    funderName == undefined ||
    funderName == "undefined" ||
    funderName === null ||
    funderName === ""
      ? "Anonymous person"
      : funderName
  }</b> for sponsoring a degree! Appreciate it!<br/> <b>#blockdegree #fundmydegree #onlineeducation </b>`;
  let retHtml = "";

  if (type === "completed") {
    // show funder's modal
    retHtml =
      `<div class="modal fade" id="requestModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
                  aria-hidden="true">

                  <div class="modal-dialog modal-dialog-centered" role="document">


                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title align-self-center" id="requestModal--title">Request By <strong>${userName}</strong></h5>
                              ${`<span class="funded-by">Funded By ${
                                funderName == "undefined" ||
                                funderName == "" ||
                                funderName == null
                                  ? `Anonymous ( <span class="claim-fund" data-dismiss="modal" onclick="claimFund('${fundId}')">claim</span> )`
                                  : funderName
                              }</span>`}                              
                              <button type="button" class="btn btn-outline-primary" onclick="copyToClipboard('${requestUrlShort}','requestModal--title', 'Request Link' )" >Copy Link</button>

                          </div>` +
      `
      
                          <div class="form-control" id="funder-certi-msg">Test</div>
                          ${
                            funderName == "undefined" ||
                            funderName == "" ||
                            funderName == null
                              ? ""
                              : `<div class="modal-body" id="requestModal--body"><img src="/img/funder-certi/${fundId}.png"></div>`
                          }
                          ` +
      `<div class="modal-footer">` +
      `${`<button
        class="btn btn-secondary fund-btn-close"
        data-dismiss="modal"

      >
        Close
      </button><div class='badge badge-success funded'>FUNDED <i class="fa fa-check" aria-hidden="true"></i></div>`}
                               Share On&nbsp;
                               <a target="_blank" href="${
                                 isMobile() === true
                                   ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
                                       funderMessage
                                     )}`
                                   : `https://web.whatsapp.com/send?text=${encodeURIComponent(
                                       funderMessage
                                     )}`
                               }">
                               <i class="fa fa-whatsapp fa-lg"></i>
                             </a>&nbsp;                               
                               <div data-dismiss="modal" onclick="handleShareLinkdedin('Sponsored a student\\'s degree at Blockdegree.org! #blockdegree #fundmydegree #onlineeducation','true','${fundId}')">
                                <i class="fa fa-linkedin fa-lg"></i>
                              </div>&nbsp;
                              <div data-dismiss="modal" onclick="handleShareTwitter('Sponsored a student\\'s degree at Blockdegree.org! #blockdegree #fundmydegree #onlineeducation','true','${fundId}')">
                                  <i class="fa fa-twitter fa-lg"></i>
                              </div>&nbsp;
                              <div class="fb-share-button" data-href="${requestUrlShort}" data-layout="button" data-size="small"><a
  target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encodedStr}"
  class="fb-xfbml-parse-ignore"><i class="fa fa-facebook fa-lg"></i></a></div>
                          </div>` +
      `</div>
</div>
</div>`;
    document.getElementById("requestModalWrapper").innerHTML = retHtml;
    document.getElementById("funder-certi-msg").innerHTML = fundeeMessage;
  } else {
    retHtml =
      `<div class="modal fade" id="requestModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
                  aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered" role="document">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="requestModal--title">Request By <strong>${userName}</strong></h5>
                              ${
                                type == "completed"
                                  ? `<span class="funded-by text-success">Funded By ${
                                      funderName == "undefined"
                                        ? `Anonymous ( <span class="claim-fund" data-dismiss="modal" onclick="claimFund('${fundId}')">claim</span> )`
                                        : funderName
                                    }</span>`
                                  : ""
                              }
                              <div class="btn-block"> <button type="button" class="btn btn-outline-primary" onclick="copyToClipboard('${requestUrlShort}','requestModal--title', 'Request Link' )" >Copy Link</button></div>
                          </div>` +
      `<div class="modal-body" id="requestModal--body">                            
                          </div>` +
      `<div class="modal-footer">` +
      `${
        type === "completed"
          ? `<button
        class="btn btn-secondary fund-btn-close"
        data-dismiss="modal"
      >
        Close
      </button><div class='badge badge-success funded'>FUNDED <i class="fa fa-check" aria-hidden="true"></i></div>`
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
          ${fundDisabled === "true" ? "disabled" : ""}
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
                               <i class="fa fa-whatsapp fa-lg"></i>
                             </a>&nbsp;                               
                               <div data-dismiss="modal" onclick="handleShareLinkdedin('Check the new function of #Blockdegree, where students can apply for funding to give exams for free.\\nFunders can fund any student and get their name on a student\\'s certificate as a sponsor.\\nLink: ${requestUrlShort}\\n#onlinelearning #FundMyDegree')">
                                <i class="fa fa-linkedin fa-lg"></i>
                              </div>&nbsp;
                              <div data-dismiss="modal" onclick="handleShareTwitter('Check the new function of #Blockdegree, where students can apply for funding to give exams for free.\\nFunders can fund any student and get their name on a student\\'s certificate as a sponsor.\\nLink: ${requestUrlShort}\\n#onlinelearning #FundMyDegree')">
                                  <i class="fa fa-twitter fa-lg"></i>
                              </div>&nbsp;
                              <div class="fb-share-button" data-href="${requestUrlShort}" data-layout="button" data-size="small"><a
  target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encodedStr}"
  class="fb-xfbml-parse-ignore"><i class="fa fa-facebook fa-lg"></i></a></div>
                          </div>` +
      `</div>
</div>
</div>`;
    document.getElementById("requestModalWrapper").innerHTML = retHtml;
    document.getElementById("requestModal--body").innerHTML = description;
    console.log("rendered new modal");
  }

  setTimeout(() => $("#requestModal").modal("toggle"), 0);

  if (typeof web3 != "undefined") {
    web3.version.getNetwork(async (err, providerNetworkId) => {
      // await ethereum.enable();
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
    case "course_4":
      return "Cloud Computing";
    case "course_5":
      return "Blockchain Wallet";
    case "course_6":
        return "Blockchain Basic 2";
    default:
      return "";
  }
}

async function submitMetamask(addr, fundId, amountGoal) {
  await ethereum.enable();
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

function renderRequestedModal(allData, userEmail) {
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
          escape(allData[i].description),
          allData[i].receiveAddr,
          allData[i].fundId,
          allData[i].status,
          allData[i].amountGoal,
          allData[i].donerName,
          String(allData[i].email === userEmail)
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

var copyToClipboard = function (secretInfo, innerElemId, name) {
  console.log("called copyToClipboard");
  var $body = document.getElementById(innerElemId);
  var $tempInput = document.createElement("INPUT");
  $body.appendChild($tempInput);
  $tempInput.setAttribute("value", secretInfo);
  $tempInput.select();
  document.execCommand("copy");
  $body.removeChild($tempInput);
  $.notify(` ${name} Copied!`, { type: "info", z_index: 2000 });
};

async function renderQRCode(addr, price, fundId) {
  try {
    const xdcPrice = await $.ajax({
      method: "get",
      url: "/api/WrapCoinMarketCap",
    });
    console.log(xdcPrice, addr);

    $("#xdc-value-modal").html(
      String(
        Math.round(
          Math.pow(10, 6) * (parseFloat(price) / parseFloat(xdcPrice.data))
        ) / Math.pow(10, 6)
      )
    );
    $("#xdc-qr-img").html("");
    $("#xdc-qr-img").qrcode({ text: addr, width: 250, height: 250 });
    $("#xdc-addr-value-modal").val(addr);
    $("#xdc-addr-claim-fund-id").val(fundId);
    $("#xdcQRCode").modal("show");
  } catch (e) {
    console.log(`exception at renderQRCode: `, e);
  }
}

function submitClaimFund(fundId) {
  const hash = $("#claimTx").val();
  if (hash.trim() == "" || !/^0x([A-Fa-f0-9]{64})$/.test(hash)) {
    $.notify("Enter Valid Hash", { type: "warning", z_index: 2000 });
    return;
  }
  $.ajax({
    method: "post",
    url: "/api/claimFund",
    data: { fundId: fundId, hash: hash },
    success: (resp) => {
      if (resp.status == true) {
        $.notify("Successfully completed the fund claim", {
          type: "success",
          z_index: 2000,
        });
        $("#claimTxModal").modal("hide");
      } else {
        $.notify("Fund claim failed", { type: "warning", z_index: 2000 });
        $("#claimTxModal").modal("hide");
      }
    },
    error: (e) => {},
  });
}

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

function handleShareLinkdedin(seedMsg, funder, fundId) {
  console.log(funder, fundId);

  if (funder == "true") {
    linkedinFunder = true;
    linkedinfundId = fundId;
  }
  document.getElementById("postMSGLinkedin").innerHTML = seedMsg;

  $.ajax({
    method: "post",
    url: "/api/getAuthStatus",
    data: {},
    success: (result) => {
      let popUpWin;
      // if (!result.linkedinAuth) {
      // has not linked its linkedin account,  first link the account and then continue.
      popUpWin = handleAuthLinkedinShare();
      // } else {
      //   $("#togglePostLinkedin").click();
      // }
    },
    error: (err) => {
      $.notify(
        "Oops looks like some error occurred, please try again after sometime.",
        { type: "danger" }
      );
    },
  });
}

function handleShareTwitter(seedMsg, funder, fundId) {
  if (funder == "true") {
    twitterFunder = true;
    twitterFundId = fundId;
  }
  document.getElementById("postMSGTwitter").innerHTML = seedMsg;

  $.ajax({
    method: "post",
    url: "/api/getAuthStatus",
    data: {},
    success: (result) => {
      let popUpWin;
      // if (!result.twitterAuth) {
      // has not linked its linkedin account,  first link the account and then continue.
      popUpWin = handleAuthTwitterShare();
      // } else {
      //   $("#togglePostTwitter").click();
      // }
    },
    error: (err) => {
      $.notify(
        `Oops, some error has occured, please try again after sometime`,
        { type: "danger" }
      );
    },
  });
}

function handleAuthTwitterShare() {
  loginTwitter = true;
  loginLinkedin = false;
  return window.open(
    "https://www.blockdegree.org/auth/twitter?close=true&share=true",
    "newwin",
    "height=600px,width=600px"
  );
}
function handleAuthLinkedinShare() {
  loginTwitter = false;
  loginLinkedin = true;
  return window.open(
    "https://www.blockdegree.org/auth/linkedin?close=true&share=true",
    "newwin",
    "height=600px,width=600px"
  );
}

function claimFund(fundId) {
  console.log("called claim fund for ID: ", fundId);
  document.getElementById("claimTxModalWrapper").innerHTML = `
  <!-- Modal -->
  <div class="modal fade" id="claimTxModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLongTitle">Claim Fund</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <label for="claimTx">TX HASH</label>
          <input type="text" id="claimTx" class="form-control">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" onclick="submitClaimFund('${fundId}')" class="btn btn-primary">Claim</button>
        </div>
      </div>
    </div>
  </div>`;
  $("#claimTxModal").modal("show");
}

function postTweet(funder) {
  let templateNumber = null;
  if (funder != true)
    templateNumber = document.getElementById("images-twitter").value;
  if (funder != true && templateNumber === "") {
    $.notify("Please select atleast one banner", {
      type: "warning",
      z_index: 2000,
    });
    return;
  }
  console.log(`select the image: `, templateNumber, "funder: ", funder);
  let msg = document.getElementById("postMSGTwitter").value;
  if (funder === true) {
    msg = document.getElementById("postMSGTwitterFunder").value;
  }
  $("#postTwitter").modal("hide");
  $.notify("The tweet in being posted, please wait...", { type: "info" });
  let data = { msg: msg, templateNumber: templateNumber };
  if (funder == true) {
    data["funder"] = funder;
    data["fundId"] = twitterFundId;
  }
  $.ajax({
    method: "post",
    url: "/api/shareOnTwitterFMD",
    data: data,
    success: (resp) => {
      console.log(resp);
      if (resp.uploaded == true) {
        $("#postTwitter").modal("hide");
        $.notify("Shared on Twitter", { type: "success" });
      } else {
        $.notify(resp.error, { type: "danger" });
      }
    },
    error: (err) => {
      console.log(err);
    },
  });
}

function postLinkedin(funder) {
  console.log("called postLinkedin");

  let templateNumber = null;
  if (funder != true)
    templateNumber = document.getElementById("images-linkedin").value;
  if (funder != true && templateNumber === "") {
    $.notify("Please select atleast one banner", {
      type: "warning",
      z_index: 2000,
    });
    return;
  }
  let msg = document.getElementById("postMSGLinkedin").value;
  if (funder === true) {
    msg = document.getElementById("postMSGLinkedinFunder").value;
  }
  $("#postLinkedin").modal("hide");
  $.notify("The post in being sent, please wait...", { type: "info" });
  let data = { msg: msg, templateNumber: templateNumber };
  if (funder == true) {
    data["funder"] = funder;
    data["fundId"] = linkedinfundId;
  }
  $.ajax({
    method: "post",
    url: "/api/shareOnLinkedinFMD",
    data: data,
    success: (resp) => {
      console.log(resp);
      if (resp.uploaded == true) {
        $("#postLinkedin").modal("hide");
        $.notify("Shared on Linkedin", { type: "success" });
      } else {
        $.notify(resp.error, { type: "danger" });
      }
    },
    error: (err) => {
      console.log(err);
    },
  });
}

// Image selector Script starts //
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor))
    throw new TypeError("Cannot call a class as a function");
}
var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      (descriptor.enumerable = descriptor.enumerable || !1),
        (descriptor.configurable = !0),
        "value" in descriptor && (descriptor.writable = !0),
        Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    return (
      protoProps && defineProperties(Constructor.prototype, protoProps),
      staticProps && defineProperties(Constructor, staticProps),
      Constructor
    );
  };
})();
(function () {
  var ImagePicker,
    ImagePickerOption,
    both_array_are_equal,
    sanitized_options,
    indexOf = [].indexOf;
  jQuery.fn.extend({
    imagepicker: function () {
      var opts =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      return this.each(function () {
        var select;
        if (
          ((select = jQuery(this)).data("picker") &&
            select.data("picker").destroy(),
          select.data("picker", new ImagePicker(this, sanitized_options(opts))),
          null != opts.initialized)
        )
          return opts.initialized.call(select.data("picker"));
      });
    },
  }),
    (sanitized_options = function (opts) {
      var default_options;
      return (
        (default_options = {
          hide_select: !0,
          show_label: !1,
          initialized: void 0,
          changed: void 0,
          clicked: void 0,
          selected: void 0,
          limit: void 0,
          limit_reached: void 0,
          font_awesome: !1,
        }),
        jQuery.extend(default_options, opts)
      );
    }),
    (both_array_are_equal = function (a, b) {
      var i, j, len, x;
      if (!a || !b || a.length !== b.length) return !1;
      for (
        a = a.slice(0),
          b = b.slice(0),
          a.sort(),
          b.sort(),
          i = j = 0,
          len = a.length;
        j < len;
        i = ++j
      )
        if (((x = a[i]), b[i] !== x)) return !1;
      return !0;
    }),
    (ImagePicker = (function () {
      function ImagePicker(select_element) {
        var opts1 =
          arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        _classCallCheck(this, ImagePicker),
          (this.sync_picker_with_select = this.sync_picker_with_select.bind(
            this
          )),
          (this.opts = opts1),
          (this.select = jQuery(select_element)),
          (this.multiple = "multiple" === this.select.attr("multiple")),
          null != this.select.data("limit") &&
            (this.opts.limit = parseInt(this.select.data("limit"))),
          this.build_and_append_picker();
      }
      return (
        _createClass(ImagePicker, [
          {
            key: "destroy",
            value: function () {
              var j, len, ref;
              for (
                j = 0, len = (ref = this.picker_options).length;
                j < len;
                j++
              )
                ref[j].destroy();
              return (
                this.picker.remove(),
                this.select.off("change", this.sync_picker_with_select),
                this.select.removeData("picker"),
                this.select.show()
              );
            },
          },
          {
            key: "build_and_append_picker",
            value: function () {
              return (
                this.opts.hide_select && this.select.hide(),
                this.select.on("change", this.sync_picker_with_select),
                null != this.picker && this.picker.remove(),
                this.create_picker(),
                this.select.after(this.picker),
                this.sync_picker_with_select()
              );
            },
          },
          {
            key: "sync_picker_with_select",
            value: function () {
              var j, len, option, ref, results;
              for (
                results = [], j = 0, len = (ref = this.picker_options).length;
                j < len;
                j++
              )
                (option = ref[j]).is_selected()
                  ? results.push(option.mark_as_selected())
                  : results.push(option.unmark_as_selected());
              return results;
            },
          },
          {
            key: "create_picker",
            value: function () {
              return (
                (this.picker = jQuery(
                  "<ul class='thumbnails image_picker_selector'></ul>"
                )),
                (this.picker_options = []),
                this.recursively_parse_option_groups(this.select, this.picker),
                this.picker
              );
            },
          },
          {
            key: "recursively_parse_option_groups",
            value: function (scoped_dom, target_container) {
              var container,
                j,
                k,
                len,
                len1,
                option,
                option_group,
                ref,
                ref1,
                results;
              for (
                j = 0, len = (ref = scoped_dom.children("optgroup")).length;
                j < len;
                j++
              )
                (option_group = ref[j]),
                  (option_group = jQuery(option_group)),
                  (container = jQuery("<ul></ul>")).append(
                    jQuery(
                      "<li class='group_title'>" +
                        option_group.attr("label") +
                        "</li>"
                    )
                  ),
                  target_container.append(
                    jQuery("<li class='group'>").append(container)
                  ),
                  this.recursively_parse_option_groups(option_group, container);
              for (
                ref1 = function () {
                  var l, len1, ref1, results1;
                  for (
                    results1 = [],
                      l = 0,
                      len1 = (ref1 = scoped_dom.children("option")).length;
                    l < len1;
                    l++
                  )
                    (option = ref1[l]),
                      results1.push(
                        new ImagePickerOption(option, this, this.opts)
                      );
                  return results1;
                }.call(this),
                  results = [],
                  k = 0,
                  len1 = ref1.length;
                k < len1;
                k++
              )
                (option = ref1[k]),
                  this.picker_options.push(option),
                  option.has_image() &&
                    results.push(target_container.append(option.node));
              return results;
            },
          },
          {
            key: "has_implicit_blanks",
            value: function () {
              var option;
              return (
                function () {
                  var j, len, ref, results;
                  for (
                    results = [],
                      j = 0,
                      len = (ref = this.picker_options).length;
                    j < len;
                    j++
                  )
                    (option = ref[j]).is_blank() &&
                      !option.has_image() &&
                      results.push(option);
                  return results;
                }.call(this).length > 0
              );
            },
          },
          {
            key: "selected_values",
            value: function () {
              return this.multiple
                ? this.select.val() || []
                : [this.select.val()];
            },
          },
          {
            key: "toggle",
            value: function (imagepicker_option, original_event) {
              var new_values, old_values, selected_value;
              if (
                ((old_values = this.selected_values()),
                (selected_value = imagepicker_option.value().toString()),
                this.multiple
                  ? indexOf.call(this.selected_values(), selected_value) >= 0
                    ? ((new_values = this.selected_values()).splice(
                        jQuery.inArray(selected_value, old_values),
                        1
                      ),
                      this.select.val([]),
                      this.select.val(new_values))
                    : null != this.opts.limit &&
                      this.selected_values().length >= this.opts.limit
                    ? null != this.opts.limit_reached &&
                      this.opts.limit_reached.call(this.select)
                    : this.select.val(
                        this.selected_values().concat(selected_value)
                      )
                  : this.has_implicit_blanks() &&
                    imagepicker_option.is_selected()
                  ? this.select.val("")
                  : this.select.val(selected_value),
                !both_array_are_equal(old_values, this.selected_values()) &&
                  (this.select.change(), null != this.opts.changed))
              )
                return this.opts.changed.call(
                  this.select,
                  old_values,
                  this.selected_values(),
                  original_event
                );
            },
          },
        ]),
        ImagePicker
      );
    })()),
    (ImagePickerOption = (function () {
      function ImagePickerOption(option_element, picker) {
        var opts1 =
          arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
        _classCallCheck(this, ImagePickerOption),
          (this.clicked = this.clicked.bind(this)),
          (this.picker = picker),
          (this.opts = opts1),
          (this.option = jQuery(option_element)),
          this.create_node();
      }
      return (
        _createClass(ImagePickerOption, [
          {
            key: "destroy",
            value: function () {
              return this.node.find(".thumbnail").off("click", this.clicked);
            },
          },
          {
            key: "has_image",
            value: function () {
              return null != this.option.data("img-src");
            },
          },
          {
            key: "is_blank",
            value: function () {
              return !(null != this.value() && "" !== this.value());
            },
          },
          {
            key: "is_selected",
            value: function () {
              var select_value;
              return (
                (select_value = this.picker.select.val()),
                this.picker.multiple
                  ? jQuery.inArray(this.value(), select_value) >= 0
                  : this.value() === select_value
              );
            },
          },
          {
            key: "mark_as_selected",
            value: function () {
              return this.node.find(".thumbnail").addClass("selected");
            },
          },
          {
            key: "unmark_as_selected",
            value: function () {
              return this.node.find(".thumbnail").removeClass("selected");
            },
          },
          {
            key: "value",
            value: function () {
              return this.option.val();
            },
          },
          {
            key: "label",
            value: function () {
              return this.option.data("img-label")
                ? this.option.data("img-label")
                : this.option.text();
            },
          },
          {
            key: "clicked",
            value: function (event) {
              if (
                (this.picker.toggle(this, event),
                null != this.opts.clicked &&
                  this.opts.clicked.call(this.picker.select, this, event),
                null != this.opts.selected && this.is_selected())
              )
                return this.opts.selected.call(this.picker.select, this, event);
            },
          },
          {
            key: "create_node",
            value: function () {
              var image, imgAlt, imgClass, thumbnail;
              return (
                (this.node = jQuery("<li/>")),
                this.option.data("font_awesome")
                  ? (image = jQuery("<i>")).attr(
                      "class",
                      "fa-fw " + this.option.data("img-src")
                    )
                  : (image = jQuery("<img class='image_picker_image'/>")).attr(
                      "src",
                      this.option.data("img-src")
                    ),
                (thumbnail = jQuery("<div class='thumbnail'>")),
                (imgClass = this.option.data("img-class")) &&
                  (this.node.addClass(imgClass),
                  image.addClass(imgClass),
                  thumbnail.addClass(imgClass)),
                (imgAlt = this.option.data("img-alt")) &&
                  image.attr("alt", imgAlt),
                thumbnail.on("click", this.clicked),
                thumbnail.append(image),
                this.opts.show_label &&
                  thumbnail.append(jQuery("<p/>").html(this.label())),
                this.node.append(thumbnail),
                this.node
              );
            },
          },
        ]),
        ImagePickerOption
      );
    })());
}.call(void 0));

function payRazorpay(fundId, amount) {
  console.log("called payRazorpay: ", fundId, amount);
  $.ajax({
    method: "post",
    url: "/api/initiateRazorpay",
    data: { amount: amount, fundId: fundId },
    success: (resp) => {
      if (resp.status == true) {
        const { orderId, key, amnt, email, userName } = resp.data;
        const newOrder = {
          key: key, // Enter the Key ID generated from the Dashboard
          amount: `${amnt}`, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency: "INR",
          name: userName,
          description: "Online Education",
          image: "https://www.blockdegree.org/img/brand/blockdegree_dark.png?v=2",
          order_id: orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
          handler: function (response) {
            const {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            } = response;
            $.ajax({
              url: "/api/completeRazorpayFMD",
              method: "post",
              data: {
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
              },
              success: (resp) => {
                if (resp.status == true) {
                  $.notify("Payment Completed Successfully!", {
                    type: "success",
                  });
                } else {
                  $.notify(resp.error, { type: "danger" });
                }
              },
              error: (err) => {
                $.notify(
                  "Some error occured please contact <b>info@blockdegree.org</b>",
                  { type: "danger" }
                );
              },
            });
          },
          prefill: {
            name: userName,
            email: email,
          },
          theme: {
            color: "#2073d4",
          },
        };
        let rzp1 = new Razorpay(newOrder);
        rzp1.open();
      } else {
        $.notify(resp.error, { type: "danger" });
      }
    },
    error: (err) => {
      $.notify("Failed to send request", { type: "danger" });
    },
  });
}

$("select").imagepicker();
// Image selector Script ends //

// Stepped form script starts //
$(document).ready(function () {
  var current_fs, next_fs, previous_fs; //fieldsets
  var opacity;

  $(".next").click(function () {
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    //Add Class Active
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          next_fs.css({ opacity: opacity });
        },
        duration: 600,
      }
    );
  });

  $(".previous").click(function () {
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //Remove class active
    $("#progressbar li")
      .eq($("fieldset").index(current_fs))
      .removeClass("active");

    //show the previous fieldset
    previous_fs.show();

    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          previous_fs.css({ opacity: opacity });
        },
        duration: 600,
      }
    );
  });

  $(".radio-group .radio").click(function () {
    $(this).parent().find(".radio").removeClass("selected");
    $(this).addClass("selected");
  });

  $(".submit").click(function () {
    return false;
  });
});
// Stepped form script ends //
