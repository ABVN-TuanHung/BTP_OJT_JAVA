sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        async createUserModel() {
			// bind action
			const oModel = new sap.ui.model.odata.v4.ODataModel({
				serviceUrl: "/odata/v4/OJT/EmpSrv/",
				synchronizationMode: "None",
				operationMode: "Server",
			});
			// get current user
			let oAction = oModel.bindContext("/getUser(...)");
			let isAdmin = false;
			await oAction
				.invoke()

				.catch((err) => {
					console.log(err);
				});
			const oResult = oAction.getBoundContext().getObject();
			isAdmin = oResult.roles.includes("Admin_JAV");
			return new JSONModel({ isAdmin });
		},
		async createTokenModel() {
			// bind action
			const oModel = new sap.ui.model.odata.v4.ODataModel({
				serviceUrl: "/odata/v4/OJT/EmpSrv/",
				synchronizationMode: "None",
				operationMode: "Server",
			});
			// get current user
			let oAction = oModel.bindContext("/getUser(...)");
			await oAction
				.invoke()

				.catch((err) => {
					console.log(err);
				});
			const oResult = oAction.getBoundContext().getObject();
			const jwt = oResult.jwt;
			return new JSONModel({ jwt });
		}
    };

});