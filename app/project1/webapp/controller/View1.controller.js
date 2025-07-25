sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, ODataModel, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            const oODataModel = new ODataModel("/odata/v2/my/");
            this.getView().setModel(oODataModel, "odata");

            const oJSONModel = new JSONModel({
                resignation: [],
                filteredResignation: [],
                paginatedResignation: [],
                currentPage: 1,
                pageSize: 10
            });
            this.getView().setModel(oJSONModel, "view");

            oODataModel.read("/resignation", {
                success: (oData) => {
                    oJSONModel.setProperty("/resignation", oData.results);
                    oJSONModel.setProperty("/filteredResignation", oData.results);
                    this.updatePagination();
                },
                error: (err) => {
                    console.error("Failed to load resignation data", err);
                }
            });
        },

        updatePagination: function () {
            const oModel = this.getView().getModel("view");
            const allData = oModel.getProperty("/filteredResignation");
            const pageSize = oModel.getProperty("/pageSize");
            const currentPage = oModel.getProperty("/currentPage");

            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const pageData = allData.slice(start, end);

            oModel.setProperty("/paginatedResignation", pageData);
            this.renderPageNumbers();

        },

        onPageSelect: function (iPage) {
            const oModel = this.getView().getModel("view");
            oModel.setProperty("/currentPage", iPage);
            this.updatePagination();
        },
        

        onNextPage: function () {
            const oModel = this.getView().getModel("view");
            const total = oModel.getProperty("/filteredResignation").length;
            const pageSize = oModel.getProperty("/pageSize");
            let currentPage = oModel.getProperty("/currentPage");

            if ((currentPage * pageSize) < total) {
                oModel.setProperty("/currentPage", ++currentPage);
                this.updatePagination();
            }
        },


        onPreviousPage: function () {
            const oModel = this.getView().getModel("view");
            let currentPage = oModel.getProperty("/currentPage");

            if (currentPage > 1) {
                oModel.setProperty("/currentPage", --currentPage);
                this.updatePagination();
            }
        },

        renderPageNumbers: function () {
            const oModel = this.getView().getModel("view");
            const currentPage = oModel.getProperty("/currentPage");
            const pageSize = oModel.getProperty("/pageSize");
            const totalItems = oModel.getProperty("/filteredResignation").length;
            const totalPages = Math.ceil(totalItems / pageSize);
        
            const oPageBox = this.byId("pageNumbersBox");
            oPageBox.removeAllItems();
        
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, currentPage + 2);
        
            for (let i = start; i <= end; i++) {
                const oButton = new sap.m.Button({
                    text: i.toString(),
                    press: this.onPageSelect.bind(this, i)
                });
        
                if (i === currentPage) {
                    oButton.addStyleClass("current-page");
                }
        
                oPageBox.addItem(oButton);
            }
        },
        

        onDateFilterChange: function () {
            const startDate = this.byId("startDatePicker").getDateValue();
            let endDate = this.byId("endDatePicker").getDateValue();
            if (endDate) {
                endDate.setHours(23, 59, 59, 999);
            }

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
                if (endDate && itemDate > endDate) return false;
                return true;
            });

            oJSONModel.setProperty("/filteredResignation", aFilteredData);
            oJSONModel.setProperty("/currentPage", 1);
            this.updatePagination();
        },

        onClearFilters: function () {
            this.byId("startDatePicker").setDateValue(null);
            this.byId("endDatePicker").setDateValue(null);
            const oJSONModel = this.getView().getModel("view");
            const aAllData = oJSONModel.getProperty("/resignation") || [];
            oJSONModel.setProperty("/filteredResignation", aAllData);
            oJSONModel.setProperty("/currentPage", 1);
            this.updatePagination();
        },

        formatTime: function (oTime) {
            if (!oTime) return "";
        
            // Handle object with milliseconds
            if (typeof oTime === "object" && oTime.ms !== undefined) {
                const date = new Date(oTime.ms);
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            }
        
            // Handle ISO 8601 duration string like "PT09H00M00S"
            if (typeof oTime === "string") {
                const match = oTime.match(/PT(\\d{2})H(\\d{2})M/);
                if (match) {
                    return `${match[1]}:${match[2]}`;
                }
            }
        
            // Fallback: try parsing as time string
            try {
                const date = new Date(`1970-01-01T${oTime}`);
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            } catch (e) {
                return String(oTime);
            }
        },
        

        formatStatusColor: function (sStatus) {
            if (sStatus === "Completed") {
                return "Success";
            } else if (sStatus === "Skipped") {
                return "Error";
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
            const oModel = this.getView().getModel("view");
            const aData = oModel.getProperty("/filteredResignation");
        
            if (!aData || !aData.length) {
                MessageToast.show("No data available to download.");
                return;
            }
        
            const aHeaders = [
                "Job ID", "Date", "Resignation Entries", "Separation Postings", "Future Dated Entries",
                "Upper Manager Updates", "Separation Start", "Separation End", "Separation Status",
                "Upper Manager Start", "Upper Manager End", "Upper Manager Status"
            ];
        
            const formatTime = this.formatTime.bind(this);
            const formatDate = this.formatDate.bind(this);
        
            const aRows = aData.map(item => [
                item.Jobid,
                formatDate(item.Date),
                item.resignationEntries,
                item.seperationPostings,
                item.futureDatedEntries,
                item.upperManagerUpdates,
                formatTime(item.seperationJobStartTime),
                formatTime(item.seperationJobEndTime),
                item.ueperationJobStatus,
                formatTime(item.upperManagerJobStartTime),
                formatTime(item.upperManagerJobEndTime),
                item.upperManagerJobStatus
            ]);
        
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
