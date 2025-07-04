sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: employeemgm",
		defaults: {
			page: "ui5://test-resources/employeemgm/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "employeemgm/",
				never: "test-resources/employeemgm/"
			},
			loader: {
				paths: {
					"employeemgm": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for employeemgm"
			},
			"integration/opaTests": {
				title: "Integration tests for employeemgm"
			}
		}
	};
});
