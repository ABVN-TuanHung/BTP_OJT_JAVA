sap.ui.define(["./BaseController", "sap/m/MessageBox"], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("employeemgm.controller.Main", {
		onSeeListView: function () {
			const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("List");
		}
	});
});
