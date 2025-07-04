sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "sap/m/MessageToast"],
    function (BaseController, JSONModel, MessageBox, MessageToast) {
        "use strict";

        return BaseController.extend("employeemgm.controller.List", {
            async onInit() {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("List").attachPatternMatched(this._onObjectMatched, this)
            },
            _onObjectMatched: async function (oEvent) {
                // Get Employees Data
                let oResponse = await fetch('/OJT/EmpSrv/Employees')
                    .then(response => response.json())
                if (oResponse.error) {
                    MessageBox.error(oResponse.error.message);
                    return;
                }
                let aEmpList = oResponse.value;
    
                // Get Roles, Departments master data
                oResponse = await fetch('/OJT/EmpSrv/Roles')
                    .then(response => response.json())
                const aRoles = oResponse.value;
    
                oResponse = await fetch('/OJT/EmpSrv/Departments')
                    .then(response => response.json())
                const aDepartmens = oResponse.value;
    
                // Map employees's role and department
                aEmpList = aEmpList.map((emp) => {
                    let role = aRoles?.find(role => role.ID === emp.role_ID)
                    let dept = aDepartmens?.find(dept => dept.ID === emp.department_ID)
                    emp.role = role?.name || "";
                    emp.department = dept?.name || "";
                    return emp;
                });
                const oModel = new JSONModel({
                    rows: aEmpList
                });
                const oModelRole = new JSONModel({
                    rows: aRoles
                });
                const oModelDept = new JSONModel({
                    rows: aDepartmens
                })
                //   const oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oEmpList");
                this.getView().setModel(oModel, "oEmpListFixed");
                this.getView().setModel(oModelRole, "oRoleList");
                this.getView().setModel(oModelDept, "oDeptList");
                this.getOwnerComponent().setModel(oModel, "oEmpList");
                this.getOwnerComponent().setModel(oModelRole, "oRoleList");
                this.getOwnerComponent().setModel(oModelDept, "oDeptList");
                this.getView().getModel("oEmpList").refresh(true);
            },
            onComboChange: function () {
                // Get Filter options
                const oCBDept = this.byId("View2CBDept").getSelectedItem();
                const vCBDept = oCBDept?.getText() || "";
                // console.log('vCBDept', vCBDept);
                const oCBRole = this.byId("View1CBRole").getSelectedItem();
                const vCBRole = oCBRole?.getText() || "";
                // Get Employee List
                const oModel = this.getView().getModel("oEmpListFixed");
                const json = oModel?.getData();
                const rows = json?.rows;
                let newRows = [];
                // Filtering
                if (vCBDept && vCBRole) {
                    rows?.map((emp) => {
                        if (emp.department === vCBDept && emp.role === vCBRole) newRows.push(emp);
                    })
                } else if (!vCBDept && vCBRole) {
                    rows?.map((emp) => {
                        if (emp.role === vCBRole) newRows.push(emp);
                    })
                } else if (vCBDept && !vCBRole) {
                    rows?.map((emp) => {
                        if (emp.department === vCBDept) newRows.push(emp);
                    })
                } else {
                    newRows = rows;
                }
                // Reload model
                const filteredModel = new JSONModel({
                    rows: newRows
                })
                this.getView().setModel(filteredModel, "oEmpList");
                this.getView().getModel("oEmpList").refresh(true);
            },
            onSelectEmployee: function (oEvent) {
                // Nagivate to Detail page
                const sPath1 = oEvent.getSource().getBindingContext("oEmpList").getPath();
                const oEmpPress = this.getView().getModel("oEmpList").getProperty(sPath1);
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("DetailId", {
                    id: oEmpPress.ID
                });
                //
            },
            onDeleteRow: function (oEvent) {
                //Get row data
                const oListItem = oEvent.getParameter("listItem");
                const oContext = oListItem.oBindingContexts;
                const sPath = oContext?.oEmpList?.sPath;
                const oEmpPress = this.getView().getModel("oEmpList").getProperty(sPath);
                // GEt model to reload later
                const oModel = this.getView().getModel("oEmpListFixed");
                const json = oModel?.getData();
                let rows = json?.rows;
                const oView = this.getView();
                MessageBox.confirm("Are you sure, deleted employee can not be restored?", {
                    title: "Confirm Deletion",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            // Call API to delete employee
                            fetch(`/OJT/EmpSrv/Employees('${oEmpPress.ID}')`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then(res => {
                                    if (res.ok) {
                                        console.log('Deleted successfully');
                                    } else {
                                        res.text().then(text => {
                                            console.error('Failed to delete:', res.status, text);
                                        });
                                    }
                                })
                                .catch(err => console.error('Network or server error:', err));
    
                            //Reload model
                            rows = rows?.filter(item => item.ID !== oEmpPress.ID);
                            console.log('rows', rows);
                            oView.setModel(new JSONModel({ rows: rows }), "oEmpList");
                            oView.getModel("oEmpList").refresh(true);
                            console.log('Reloaded Overview Page...');
                        } else {
                            console.log('Cancel deletion...');
                        }
                    }
                });
    
            },
            onSeeDetail: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                console.log('Navigating to Detail...');
                oRouter.navTo("Detail");
            }
        });
    });
