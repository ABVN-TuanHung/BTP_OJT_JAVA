sap.ui.define([
    "sap/ui/core/UIComponent",
    "employeemgm/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("employeemgm.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        async init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            // enable routing
            this.getRouter().initialize();
            const user = await models.createUserModel();
			const token = await models.createTokenModel();
            this.setModel(user,'userInfo');
            this.setModel(token,'token');
        }
    });
});