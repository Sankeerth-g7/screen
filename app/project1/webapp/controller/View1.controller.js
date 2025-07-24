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
        },
        onDateFilterChange: function () {
            var oTable = this.byId("resignationTable");
            var oBinding = oTable.getBinding("items");
        
            var oStartDate = this.byId("startDatePicker").getDateValue();
            var oEndDate = this.byId("endDatePicker").getDateValue();
        
            var aFilters = [];
        
            var formatDate = function (date) {
                if (!date) return null;
                var yyyy = date.getFullYear();
                var mm = String(date.getMonth() + 1).padStart(2, '0');
                var dd = String(date.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            };
        
            var sStartDate = formatDate(oStartDate);
            var sEndDate = formatDate(oEndDate);
        
            if (sStartDate) {
                aFilters.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, sStartDate));
            }
        
            if (sEndDate) {
                aFilters.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, sEndDate));
            }
        
            oBinding.filter(aFilters);
        },
        
    });
});
