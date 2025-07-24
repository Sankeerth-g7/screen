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
        

        formatTime: function (oTime) {
            if (!oTime) return "";
        
            // If it's an object with .ms property (OData V2 duration), convert to time string
            if (typeof oTime === "object" && oTime.ms !== undefined) {
                const totalSeconds = oTime.ms / 1000;
                const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
                const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`;
            }
        
            // If it's a string like "PT09H00M00S"
            if (typeof oTime === "string") {
                const match = oTime.match(/PT(\d{2})H(\d{2})M(\d{2})S/);
                if (match) {
                    return `${match[1]}:${match[2]}:${match[3]}`;
                }
            }
        
            return String(oTime);
        },

        formatDate: function (oDate) {
            if (!oDate) return "";
        
            // If it's an object with .ms (milliseconds), convert to Date
            let dateObj;
            if (typeof oDate === "object" && oDate.ms !== undefined) {
                dateObj = new Date(oDate.ms);
            } else if (typeof oDate === "string" && oDate.includes("/Date(")) {
                const timestamp = parseInt(oDate.match(/\\d+/)[0], 10);
                dateObj = new Date(timestamp);
            } else {
                dateObj = new Date(oDate);
            }
        
            const day = String(dateObj.getDate()).padStart(2, '0');
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[dateObj.getMonth()];
            const year = String(dateObj.getFullYear()).slice(-2);
        
            return `${day}-${month}-${year}`;
        },        
        
        

        onDownload: function () {
            // Add your download logic here
        }
    });
});
