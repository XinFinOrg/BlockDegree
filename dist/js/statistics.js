$("document").ready(() => {
  $.ajax({
    method: "get",
    url: "/api/getSiteStats",
    success: (resp) => {
      if (resp.status === true) {
        animateNumberIncrease(0, resp.userCnt, "stat-userRegistrations");
        animateNumberIncrease(0, resp.visitCnt, "stat-courseVisits");
        animateNumberIncrease(0, resp.caCnt, "stat-campAmbas");
        animateNumberIncrease(0, resp.totCertis, "stat-certiIssued");
      }
    },
  });
  console.log("on ready called statistics");
  $.ajax({
    url: "/api/getXinFinStats",
    method: "GET",
    success: (res) => {
      console.log("Response: ", res);
      // burnTokenAmnt
      animateNumberIncrease(
        0,
        rndDeci3(res.netData.burntBalance),
        "burnTokenAmnt"
      );
      animateNumberIncrease(
        0,
        rndDeci3(res.netData.totalStakedValue),
        "lockedTokensXDC"
      );
      animateNumberIncrease(0, res.netData.totalMasterNodes, "masterLiveCnt");
      animateNumberIncrease(0, rndDeci3(res.netData.xdcVol24HR), "dailyVol");
      animateNumberIncrease(
        0,
        rndDeci3(res.netData.monthlyRewardPer),
        "returnApprMonth"
      );
      animateNumberIncrease(
        0,
        rndDeci3(res.netData.yearlyRewardPer),
        "returnApprAnnual"
      );
      animateNumberIncrease(
        0,
        rndDeci3(res.netData.totalStakedValueFiat),
        "lockedTokenFiat"
      ); //totalXDCFiat
      animateNumberIncrease(
        0,
        rndDeci3(res.netData.monthlyRewards),
        "rewardsXDC"
      ); // rewardsFIAT
      animateNumberIncrease(0, rndDeci3(res.netData.totalXDCFiat), "marketCap"); // rewardsFIAT
      animateNumberIncrease(
        0,
        rndDeci4(res.netData.priceUsd),
        "currXDCPrice",
        true
      );
      animateNumberIncrease(
        0,
        rndDeci3(res.netData.monthlyRewardsFiat),
        "rewardsFIAT"
      );
      $.notifyClose("bottom-right");
    },
    error: (err) => {
      console.log("Error from api/getXinFinStats: ", err);
      $.notifyClose("bottom-right");
    },
  });
});

function animateNumberIncrease(currVal, desiredVal, elemId, skipDelim) {
  if (skipDelim === true) {
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
  } else {
    const interval = setInterval(() => {
      let exisVal = parseInt(
        document.getElementById(elemId).innerHTML.replace(/,/g, "")
      );
      console.log(exisVal);
      if (exisVal != NaN)
        if (exisVal >= desiredVal) {
          document.getElementById(elemId).innerHTML = addDelimitation(
            desiredVal
          );
          clearInterval(interval);
          return;
        }
      let incr = Math.floor((30 * (desiredVal - currVal)) / 1000)
        ? Math.floor((30 * (desiredVal - currVal)) / 1000)
        : Math.ceil((30 * (desiredVal - currVal)) / 1000);
      document.getElementById(elemId).innerHTML = addDelimitation(
        exisVal + incr
      );
    }, 30);
  }
}

function rndDeci3(n) {
  return Math.round(parseFloat(n) * 1000) / 1000;
}

function rndDeci4(n) {
  return Math.round(parseFloat(n) * 10000) / 10000;
}
