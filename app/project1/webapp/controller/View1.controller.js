sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, ODataModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            const oModel = new ODataModel("/odata/v2/my/");
            this.getView().setModel(oModel);
        },

        onDateFilterChange: function () {
            const oTable = this.byId("resignationTable");
            const oBinding = oTable.getBinding("items");

            const oStartDate = this.byId("startDatePicker").getDateValue();
            const oEndDate = this.byId("endDatePicker").getDateValue();

            const aFilters = [];

            const formatDate = function (date) {
                if (!date) return null;
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            };

            const sStartDate = formatDate(oStartDate);
            const sEndDate = formatDate(oEndDate);

            if (sStartDate && sEndDate && sStartDate === sEndDate) {
                // Exact match filter
                aFilters.push(new Filter("Date", FilterOperator.EQ, sStartDate));
            } else {
                // Range filter
                if (sStartDate) {
                    aFilters.push(new Filter("Date", FilterOperator.GE, sStartDate));
                }
                if (sEndDate) {
                    aFilters.push(new Filter("Date", FilterOperator.LE, sEndDate));
                }
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

        formatStatusColor: function (sStatus) {
            if (sStatus === "Completed") {
                return "Success"; // green
            } else if (sStatus === "Skipped") {
                return "Error"; // red
            }
            return "None";
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
            const oTable = this.byId("resignationTable");
            const aItems = oTable.getItems();
        
            if (!aItems.length) {
                sap.m.MessageToast.show("No data available in the table.");
                return;
            }
        
            // Define CSV headers
            const aHeaders = [
                "Job ID", "Date", "Resignation Entries", "Separation Postings", "Future Dated Entries",
                "Upper Manager Updates", "Separation Start", "Separation End", "Separation Status",
                "Upper Manager Start", "Upper Manager End", "Upper Manager Status"
            ];
        
            // Extract row data
            const aRows = aItems.map(oItem => {
                const aCells = oItem.getCells();
                return aCells.map(cell => cell.getText());
            });
        
            // Build CSV content
            let sCsvContent = aHeaders.join(",") + "\n";
            aRows.forEach(row => {
                sCsvContent += row.join(",") + "\n";
            });
        
            // Trigger download
            const blob = new Blob([sCsvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Resignation_Job_Details.csv";
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
         
        
        
    });
});

