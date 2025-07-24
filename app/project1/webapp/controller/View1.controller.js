sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, ODataModel) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            const oModel = new ODataModel("/odata/v2/my/");
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
        

        formatTime: function (sTime) {
            if (!sTime) return "";
            const match = sTime.match(/PT(\d{2})H(\d{2})M(\d{2})S/);
            if (match) {
                return `${match[1]}:${match[2]}:${match[3]}`;
            }
            return sTime;
        },

        onDownload: function () {
            // Add your download logic here
        }
    });
});
