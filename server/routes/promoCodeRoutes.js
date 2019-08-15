const promoCodeServices = require("../services/promoCodes");
const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");

module.exports = app => {
    app.post("/admin/newPromoCode",requireLogin,requireAdmin,promoCodeServices.addPromoCode);
    app.post("/admin/activatePromoCode",requireLogin,requireAdmin,promoCodeServices.activatePromoCode);
    app.post("/admin/deactivatePromoCode",requireLogin,requireAdmin,promoCodeServices.deactivatePromoCode);
    app.post("/admin/restrictPromoCode",requireLogin,requireAdmin,promoCodeServices.restrictPromoCode);
    app.post("/admin/unrestrictPromoCode",requireLogin,requireAdmin,promoCodeServices.unrestrictPromoCode);
    app.post("/admin/deactivatePromoCode",requireLogin,requireAdmin,promoCodeServices.addAllowedUser);
    // user uses promo code
    app.post("/api/usePromoCode",requireLogin,promoCodeServices.usePromoCode);
}