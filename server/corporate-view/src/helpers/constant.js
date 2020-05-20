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
