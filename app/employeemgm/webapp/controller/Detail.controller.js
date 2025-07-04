sap.ui.define(["./BaseController", "sap/m/MessageBox"], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("employeemgm.controller.Detail", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("DetailId").attachPatternMatched(this._onObjectMatched, this)
            oRouter.getRoute("Detail").attachPatternMatched(this._onObjectMatched, this)
        },
		onSeeListView: function () {
			const oRouter = this.getOwnerComponent().getRouter();
            console.log('Navigating to Overview...');
            oRouter.navTo("List");
		},
        _onObjectMatched: function (oEvent) {
            const oView = this.getView();
            const role = oView.getModel('role').getData();
            const isAdmin = !!role.Admin;
            console.log('role',role);
            console.log('isAdmin',isAdmin);

            const oInput = this.byId("HomeIPSalary");
            oInput.setValueState("None");
            const sID = oEvent.getParameter("arguments").id;
            if (!sID) {
                this.getView().setModel(new JSONModel({ isEditable: isAdmin }), "oEmpDetail");
                this.getView().getModel("oEmpDetail").refresh(true);
                return;
            }
            const aEmpList = this.getOwnerComponent().getModel("oEmpList").getData().rows;
            const oEmpPress = aEmpList?.find(item => item.ID === sID);
            oEmpPress.isEditable = isAdmin;
            this.getView().setModel(new JSONModel(oEmpPress), "oEmpDetail")
        },
        onSubmit: async function () {
            // Get view
            const oRouter = this.getOwnerComponent().getRouter();
            const oView = this.getView();
            const accessToken = oView.getModel('token').getData();
            const oOwnerComponent = this.getOwnerComponent();
            let oData = {}
            // Get Employee ID
            const oModel = oView.getModel('oEmpDetail');
            const oEmployee = oModel?.getData();
            if (Object.keys(oEmployee).length === 0) {
                // Empty Employee
                MessageBox.error("Empty employee data detected, Submit not allowed!", {
                    title: "Invalid Action"
                });
                return;
            }
            // Get master data
            oData = oOwnerComponent.getModel("oRoleList").getData();
            const aRoleList = oData.rows;
            oData = oOwnerComponent.getModel("oDeptList").getData();
            const aDeptList = oData.rows;
            // oData = oOwnerComponent.getModel("oEmpList").getData();
            // const aEmpList = oData.rows;
            // Map Role and Department
            const oRole = aRoleList.find(r => r.name === oEmployee.role);
            if (oRole) {
                oEmployee.role_ID = oRole.ID;
            }
            const oDept = aDeptList.find(r => r.name === oEmployee.department);
            if (oDept) {
                oEmployee.department_ID = oDept.ID;
                oEmployee.hireDate = new Date(oEmployee.hireDate).toISOString().split('T')[0];
                oEmployee.dateOfBirth = new Date(oEmployee.dateOfBirth).toISOString().split('T')[0];
            }
            const { role, department, ...oNewEmp } = oEmployee;
            // Call API to Update/Insert Employee
            if (!oNewEmp.ID) {
                // New employee -> Create
                const uuid = crypto.randomUUID();
                oNewEmp.ID = uuid.slice(0, 21);
                fetch(`/OJT/EmpSrv/Employees`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-csrf-token': 'Fetch',
                        'Authorization': `Bearer ${accessToken.token}`
                    },
                    body: JSON.stringify(oNewEmp)
                }).then(res => {
                    if (res.ok) {
                        oRouter.navTo("Overview");
                    } else {
                        res.text().then(text => {
                            MessageToast.show(res.status, text);
                        });
                    }
                }).catch(err => MessageToast.show('Network or server error:', err));
            } else {
                // Existing employee -> Update
                fetch(`/OJT/EmpSrv/Employees('${oNewEmp.ID}')`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-csrf-token': 'Fetch',
                        'Authorization': `Bearer ${accessToken.token}`
                    },
                    body: JSON.stringify(oNewEmp),

                }).then(res => {
                    if (res.ok) {
                        oRouter.navTo("Overview");
                    } else {
                        res.text().then(text => {
                            MessageToast.show(text);
                        });
                    }
                }).catch(err => MessageToast.show(`Network or server error:${err}`));
            }
        },
        onCalculateSalary: async function () {
            // Get view
            const oView = this.getView();
            const accessToken = oView.getModel('token').getData();
            let oData = {}
            // Get Employee ID
            const oModel = oView.getModel('oEmpDetail');
            const employee = oModel?.getData();
            if (Object.keys(employee).length === 0) {
                // Empty Employee
                MessageBox.error("Empty employee data detected, Submit not allowed!", {
                    title: "Invalid Action"
                });
                return;
            }
            const { role, department, ...oNewEmp } = employee;
            const body = { employee: oNewEmp }
            const oResponse = await fetch(`/OJT/EmpSrv/calculateSalary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken.token}`
                },
                body: JSON.stringify(body)
            }).then(res => {
                if (res.ok) {
                    MessageToast.show("Salary Calculated");
                    return res.json();
                } else {
                    res.text().then(text => {
                        MessageToast.show(res.status, text);
                    });
                }
            }).catch(err => MessageToast.show('Network or server error:', err));

            //Update salary
            employee.salary = oResponse.value || "";
            const oInput = this.byId("HomeIPSalary");
            oInput.setValueState("Success");
            oView.setModel(new JSONModel(employee), 'oEmpDetail')
            oView.getModel("oEmpDetail").refresh(true);
        }
	});
});
