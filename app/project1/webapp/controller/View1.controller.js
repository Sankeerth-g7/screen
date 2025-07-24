sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, ODataModel,Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            const oODataModel = new ODataModel("/odata/v2/my/");
            this.getView().setModel(oODataModel, "odata");
            const oJSONModel = new sap.ui.model.json.JSONModel({ resignation: [], filteredResignation: [] });
            this.getView().setModel(oJSONModel, "view"); // Set as named model 'view'
            oODataModel.read("/resignation", {
                success: (oData) => {
                    oJSONModel.setProperty("/resignation", oData.results);
                    oJSONModel.setProperty("/filteredResignation", oData.results);
                },
                error: (err) => {
                    console.error("Failed to load resignation data", err);
                }
            });
        },

       onDateFilterChange: function () {
            const startDate = this.byId("startDatePicker").getDateValue();
            const endDate = this.byId("endDatePicker").getDateValue();
            const oJSONModel = this.getView().getModel("view");
            const aAllData = oJSONModel.getProperty("/resignation") || [];
            const aFilteredData = aAllData.filter(item => {
                let itemDate;
                if (item.Date) {
                    if (typeof item.Date === "string" && item.Date.includes("/Date(")) {
                        const timestamp = parseInt(item.Date.match(/\d+/)[0], 10);
                        itemDate = new Date(timestamp);
                    } else {
                        itemDate = new Date(item.Date);
                    }
                }
                if (!itemDate || isNaN(itemDate)) return false;
                if (startDate && itemDate < startDate) return false;
                if (endDate && itemDate > endDate) return false; // <= includes end date
                return true;
            });
            oJSONModel.setProperty("/filteredResignation", aFilteredData);
            var oTable = this.byId("resignationTable");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").refresh(true);
            }
        },
 
        onClearFilters: function () {
            this.byId("startDatePicker").setDateValue(null);
            this.byId("endDatePicker").setDateValue(null);
            const oTable = this.byId("resignationTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter([]);
        },
 
 
        formatTime: function (oTime) {
            if (!oTime) return "";
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
            let dateObj;
            if (typeof oDate === "object" && oDate.ms !== undefined) {
                dateObj = new Date(oDate.ms);
            } else if (typeof oDate === "string" && oDate.includes("/Date(")) {
                const timestamp = parseInt(oDate.match(/\d+/)[0], 10);
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
                MessageToast.show("No data available in the table.");
                return;
            }

            const aHeaders = [
                "Job ID", "Date", "Resignation Entries", "Separation Postings", "Future Dated Entries",
                "Upper Manager Updates", "Separation Start", "Separation End", "Separation Status",
                "Upper Manager Start", "Upper Manager End", "Upper Manager Status"
            ];

            const aRows = aItems.map(oItem => {
                const aCells = oItem.getCells();
                return aCells.map(cell => cell.getText());
            });

            let sCsvContent = aHeaders.join(",") + "\n";
            aRows.forEach(row => {
                sCsvContent += row.join(",") + "\n";
            });

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

