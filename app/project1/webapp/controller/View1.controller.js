sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v4/ODataModel"
], function (Controller, ODataModel) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            const oModel = new ODataModel({
                serviceUrl: "/odata/v4/my/",
                synchronizationMode: "None"
            });

            this.getView().setModel(oModel);
        }
    });
});
