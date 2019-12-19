const promoCodeServices = require("../services/promoCodes");
const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");

// prettier-ignore
module.exports = app => {
    app.post("/api/newPromoCode",requireLogin,requireAdmin,promoCodeServices.addPromoCode);
    app.post("/api/activatePromoCode",requireLogin,requireAdmin,promoCodeServices.activatePromoCode);
    app.post("/api/deactivatePromoCode",requireLogin,requireAdmin,promoCodeServices.deactivatePromoCode);
    app.post("/api/restrictPromoCode",requireLogin,requireAdmin,promoCodeServices.restrictPromoCode);
    app.post("/api/unrestrictPromoCode",requireLogin,requireAdmin,promoCodeServices.unrestrictPromoCode);
    app.post("/api/addAllowedUser",requireLogin,requireAdmin,promoCodeServices.addAllowedUser);
    // user uses promo code
    app.post("/api/usePromoCode",requireLogin,promoCodeServices.usePromoCode);
    app.post("/api/checkCode",requireLogin,promoCodeServices.checkCode);
    app.post("/api/setPromoCodeCap",requireLogin, requireAdmin, promoCodeServices.setPromoCodeCap);
    app.post("/api/setPromoCodeUseLimit",requireLogin, requireAdmin,promoCodeServices.setPromoCodeUseLimit);

    app.post("/api/checkReferralCode",requireLogin,promoCodeServices.checkReferralCode);
}
