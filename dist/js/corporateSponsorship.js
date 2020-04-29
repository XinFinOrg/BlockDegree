let files = [];
$(document).ready(() => {
  // console.log("called document ready corporate-sponsorship-donation");
  // $("#paymentForm").modal("show");

  $("#req-claim-fund").click(() => {
    claimFund($("#xdc-addr-value-modal").val());
  });

  $("#xdc-modal-copy-btn").click(() => {
    copyToClipboard($("#xdc-addr-value-modal").val(), "xdc-qr-img", "Address");
  });

  let companyLogo = document.getElementById("companyLogo");
  companyLogo.onchange = (e) => {
    files = e.target.files;
  };

  $("#paymentForm").on("hide.bs.modal", () => {
    document.getElementById("companyName").value = "";
    document.getElementById("companyContactEmail").value = "";
    document.getElementById("companyLogo").value = "";
    document.getElementById("inputCourseOne").checked = false;
    document.getElementById("inputCourseTwo").checked = false;
    document.getElementById("inputCourseThree").checked = false;
    files = [];
  });
});

function launchPaymentForm() {
  $("#paymentForm").modal("show");
}

function checkFileSize() {}

async function payCorpSponsorPaypal() {
  const companyName = document.getElementById("companyName").value;
  const companyEmail = document.getElementById("companyContactEmail").value;
  const basic = document.getElementById("inputCourseOne");
  const advanced = document.getElementById("inputCourseTwo");
  const professional = document.getElementById("inputCourseThree");
  const allCourses = [];
  if (companyName.trim() == "") {
    return $.notify("Please enter valid Company Name", { type: "danger" });
  }
  if (
    companyEmail.trim() == "" ||
    !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      companyEmail
    )
  ) {
    return $.notify("Please enter valid Company Email", { type: "danger" });
  }
  console.log(files[0].size);

  if (files.length == 0 || files[0].size > 5120000) {
    return $.notify("Please upload a valid file", { type: "danger" });
  }
  if (!basic.checked && !advanced.checked && !professional.checked) {
    return $.notify("Please select atleast one field", { type: "danger" });
  }
  if (basic.checked) {
    allCourses.push(basic.value);
  }
  if (advanced.checked) {
    allCourses.push(advanced.value);
  }
  if (professional.checked) {
    allCourses.push(professional.value);
  }

  const amountGoal = 10000 * allCourses.length;

  const newForm = new FormData();
  newForm.append("companyName", companyName);
  newForm.append("companyEmail", companyEmail);
  newForm.append("companyLogo", files[0], "companyLogo.png");
  newForm.append("courses", allCourses);
  newForm.append("amountGoal", amountGoal);

  const resp = await $.ajax({
    url: "/api/startCorporateCoursePaymentPaypal",
    method: "post",
    data: newForm,
    enctype: "multipart/form-data",
    contentType: false,
    processData: false,
  });

  if (resp.status === true) {
    window.location.replace(resp.data);
  } else {
    $.notify(resp.error || "Some error occured", { type: "danger" });
  }
}

async function payCorpSponsorXdc() {
  try {
    const companyName = document.getElementById("companyName").value;
    const companyEmail = document.getElementById("companyContactEmail").value;
    const basic = document.getElementById("inputCourseOne");
    const advanced = document.getElementById("inputCourseTwo");
    const professional = document.getElementById("inputCourseThree");
    const allCourses = [];
    if (companyName.trim() == "") {
      return $.notify("Please enter valid Company Name", { type: "danger" });
    }
    if (
      companyEmail.trim() == "" ||
      !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        companyEmail
      )
    ) {
      return $.notify("Please enter valid Company Email", { type: "danger" });
    }
    if (files.length == 0 || files[0].size > 5120000) {
      return $.notify("Please upload a valid file", { type: "danger" });
    }
    if (!basic.checked && !advanced.checked && !professional.checked) {
      return $.notify("Please select atleast one field", { type: "danger" });
    }
    if (basic.checked) {
      allCourses.push(basic.value);
    }
    if (advanced.checked) {
      allCourses.push(advanced.value);
    }
    if (professional.checked) {
      allCourses.push(professional.value);
    }
    const amountGoal = 10000 * allCourses.length;

    const newForm = new FormData();
    newForm.append("companyName", companyName);
    newForm.append("companyEmail", companyEmail);
    newForm.append("companyLogo", files[0], "companyLogo.png");
    newForm.append("courses", allCourses);
    newForm.append("amountGoal", amountGoal);
    // const data = {
    //   companyName: companyName,
    //   companyEmail: companyEmail,
    //   companyLogo: files,
    //   courses: allCourses,
    //   amountGoal: amountGoal,
    // };
    // console.log("Sending data: ", data);

    const resp = await $.ajax({
      url: "/api/startCorporateCoursePaymentXdc",
      method: "post",
      data: newForm,
      enctype: "multipart/form-data",
      contentType: false,
      processData: false,
    });
    console.log("Response from Server", resp);

    const { address, xdcAmnt } = resp.data;

    $("#xdc-value-modal").html(xdcAmnt);
    $("#xdc-qr-img").html("");
    $("#xdc-qr-img").qrcode({ text: address, width: 200, height: 200 });
    $("#xdc-addr-value-modal").val(address);
    $("#xdcQRCode").modal("show");
  } catch (e) {
    console.log(`exception at renderQRCode: `, e);
  }
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
