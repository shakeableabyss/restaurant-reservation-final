/**
 * Defines the router for table resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./tables.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const cors = require("cors");


router.route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router.route("/:tableId")
    .get(controller.read)
    .all(methodNotAllowed);

router.route("/:tableId/seat")
    .put(controller.update)
    .delete(controller.destroy)
    .all(methodNotAllowed);

module.exports = router;
