$("document").ready(() => {
  console.log("on ready called statistics");
  setTimeout(() => {
    $.notify("Stats are <strong>loading</strong> . . .", {
      type: "info",
      allow_dismiss: false,
      delay: Date.now(),
      placement: {
        from: "bottom",
        align: "right"
      }
    });
  }, 2000);

  // $.ajax({
  //   url: "/api/getSiteStats",
  //   method: "get",
  //   success: res => {
  //     if (res.status === true) {
  //       // all ok
  //       console.log("Response: ", res);
  //       animateNumberIncrease(0, res.userCnt, "stat-certiIssued");
  //       animateNumberIncrease(0, res.visitCnt, "stat-userRegistrations");
  //       animateNumberIncrease(0, res.caCnt, "stat-courseVisits");
  //       animateNumberIncrease(0, res.totCertis, "stat-campAmbas"); // monthlyRewards
  //     } else {
  //       $.notify(resp.error || "Oops, some error occured", {
  //         type: "danger"
  //       });
  //     }
  //   },
  //   error: err => {
  //     console.error("some error occured while making the get request: ", err);
  //     $.notify("Oops, some error occured", {
  //       type: "danger"
  //     });
  //   }
  // });

  // burning xdc = https://explorerapi.xinfin.network/totalBurntValue
  // masternode count = https://explorerapi.xinfin.network/totalMasterNodes
  // masternode xdc staked = https://explorerapi.xinfin.network/totalStakedValue
  // total xdc = https://explorerapi.xinfin.network/publicAPI?module=balance&action=totalXDC&apikey=YourApiKeyToken
  // rewards = https://explorer.xinfin.network/todayRewards

  $.ajax({
    url: "/api/getXinFinStats",
    method: "get",
    success: res => {
      console.log("Response get/getXinFinStats: ", res);
      if (res.status === true) {
        // all ok
        console.log("Response: ", res);
        const stakedMillUsd = res.totalStaked.split(" ")[0];
        document.getElementById("burnTokenAmnt").innerHTML = res.burnTokenValue; //marketCap
        document.getElementById("marketCap").innerHTML = rndDeci3(
          parseFloat(res.totalXdc) * parseFloat(res.priceUsd)
        );
        document.getElementById("currXDCPrice").innerHTML = rndDeci3(
          res.priceUsd
        );
        // document.getElementById("lockedTokensXDC").innerHTML = stakedMillUsd;
        /**
         * masterLiveCnt
         * lockedTokensXDC
         * lockedTokenFiat
         * rewardsXDC
         * rewardsFIAT
         * returnAppr
         * dailyVol
         * returnApprMonth
         * returnApprAnnual
         */
        animateNumberIncrease(0, res.userCnt, "stat-userRegistrations");
        animateNumberIncrease(0, res.visitCnt, "stat-courseVisits");
        animateNumberIncrease(0, res.caCnt, "stat-campAmbas");
        animateNumberIncrease(0, res.totCertis, "stat-certiIssued");
        animateNumberIncrease(0, stakedMillUsd, "lockedTokensXDC");
        animateNumberIncrease(0, res.masterNodeCount, "masterLiveCnt");
        animateNumberIncrease(0, rndDeci3(res.dailyVolume), "dailyVol");
        animateNumberIncrease(0, res.monthlyRewardPer, "returnApprMonth");
        animateNumberIncrease(0, res.yearlyRewardPer, "returnApprAnnual");
        animateNumberIncrease(
          0,
          Math.round(stakedMillUsd * 1000000 * res.priceUsd),
          "lockedTokenFiat"
        );
        animateNumberIncrease(0, parseFloat(res.monthlyRewards), "rewardsXDC"); // rewardsFIAT
        animateNumberIncrease(
          0,
          rndDeci3(res.monthlyRewards * res.priceUsd),
          "rewardsFIAT"
        );
        // animateNumberIncrease(0, )
        // animateNumberIncrease(0,res.rewardsXDC, "")
      } else {
        $.notify(res.error || "Oops, some error occured", {
          type: "danger"
        });
      }
      $.notifyClose("bottom-right");
    },
    error: err => {
      console.log("Error from api/getXinFinStats: ", err);
      $.notifyClose("bottom-right");
    }
  });
});

function animateNumberIncrease(currVal, desiredVal, elemId) {
  const interval = setInterval(() => {
    let exisVal = parseInt(document.getElementById(elemId).innerHTML);
    if (exisVal != NaN)
      if (exisVal >= desiredVal) {
        document.getElementById(elemId).innerHTML = desiredVal;
        clearInterval(interval);
        return;
      }
    let incr = Math.floor((30 * (desiredVal - currVal)) / 1000)
      ? Math.floor((30 * (desiredVal - currVal)) / 1000)
      : Math.ceil((30 * (desiredVal - currVal)) / 1000);
    document.getElementById(elemId).innerHTML = exisVal + incr;
  }, 30);
}

function rndDeci3(n) {
  return Math.round(parseFloat(n) * 1000) / 1000;
}
