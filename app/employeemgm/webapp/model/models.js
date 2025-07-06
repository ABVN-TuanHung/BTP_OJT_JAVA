sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/model/BindingMode", "sap/ui/Device"], function (JSONModel, BindingMode, Device) {
	"use strict";

	return {
		createDeviceModel: function () {
			const oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode(BindingMode.OneWay);
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
