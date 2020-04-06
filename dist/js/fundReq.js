$(document).ready(() => {
  $.ajax({
    method: "get",
    url: "/api/getUninitiatedFund",
  })
    .then((result) => {
      if (result.status === true) {
        const data = result.data;
        let retData = "";
        console.log(`data: `, data);
        if (data.length === 0) {
          return (document.getElementById("card-wrapper-fmd").innerHTML =
            "no requests yet");
        }
        data.forEach((currData) => {
          retData += `
          <div class="card">
            <div class="card-header">${currData.email}</div>
            <div class="card-body">
              <h5 class="card-title">${getCourseName(currData.courseId)}</h5>
              <p class="card-text">
                ${currData.description}
              </p>
              <button onclick="submitMetamask('${currData.receiveAddr}', '${
            currData.fundId
          }')" class="btn btn-primary">
                Fund
              </button>
            </div>
            <div class="card-footer text-muted">${new Date(
              parseFloat(currData.createdAt)
            ).getDate()}/${
            new Date(parseFloat(currData.createdAt)).getMonth() + 1
          }/${new Date(parseFloat(currData.createdAt)).getFullYear()}</div>
          </div>`;
        });
        document.getElementById("card-wrapper-fmd").innerHTML = retData;
      } else {
        log("error : ", result);
      }
    })
    .catch((e) => {
      console.log(`exception at ajax.get: `, e);
    });
});

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

  web3.version.getNetwork((err, providerNetworkId) => {
    if (err) {
      $.notify("Oops, error occurred while getting the network ID");
      return;
    }

    // 1 - Mainnet
    // 4 - Rinkeby
    if (providerNetworkId == 4) {
      console.log("on rinkeby");
      const tx = {
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
              return $.notify("Donation initiated", { type: "success" });
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
