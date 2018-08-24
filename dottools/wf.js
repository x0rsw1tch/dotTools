var contentManagerIframe = null;
var xWorkflowAction = {};
xWorkflowAction.publish   = "000ec468-0a63-4283-beb7-fcb36c107b2f";
xWorkflowAction.unpublish = "38efc763-d78f-4e4b-b092-59cd8c579b93";
xWorkflowAction.archive   = "4da13a42-5d59-480c-ad8f-94a3adf809fe";
xWorkflowAction.delete    = "777f1c6b-c877-4a37-ba4b-10627316c2cc";
xWorkflowAction.unarchive = "c92f9aa1-9503-4567-ac30-d3242b54d02d";



var xPublishButtonHMTL = '<a class="dijitButton" style="padding: 0.5rem 1rem; margin-right: 1rem; cursor: pointer;" onclick="xBatchWorkflow(xWorkflowAction.publish)">Publish</a>';
var xUnpublishButtonHMTL = '<a class="dijitButton" style="padding: 0.5rem 1rem; margin-right: 1rem; cursor: pointer;" onclick="xBatchWorkflow(xWorkflowAction.unpublish)">Unpublish</a>';
var xArchiveButtonHMTL = '<a class="dijitButton" style="padding: 0.5rem 1rem; margin-right: 1rem; cursor: pointer;" onclick="xBatchWorkflow(xWorkflowAction.archive)">Archive</a>';
var xDeleteButtonHMTL = '<a class="dijitButton" style="padding: 0.5rem 1rem; margin-right: 1rem; cursor: pointer;" onclick="xBatchWorkflow(xWorkflowAction.delete)">Delete</a>';
var xUnarchiveButtonHMTL = '<a class="dijitButton" style="padding: 0.5rem 1rem; margin-right: 1rem; cursor: pointer;" onclick="xBatchWorkflow(xWorkflowAction.unarchive)">Unarchive</a>';

if (window.location.href.indexOf("/c/content") > 0) {
	var contentManagerIframe = window.frames["c0-param2"];
}

function xGetSelectedContentlets () {
	return getSelectedInodes();
}


function xBatchWorkflow(action) {
	var selectedInodes = xGetSelectedContentlets();
	if (Object.prototype.toString.call(selectedInodes).toString() === '[object Array]') {
		for (var i = 0; i < selectedInodes.length; i++) {
			contentAdmin.executeWfAction(action, 'false', 'false', 'false', selectedInodes[i]);
		}
	}
}

function xAddButtons () {
	var wfActionBox = document.querySelector("#workflowActionsDia table tbody");
	var buttonsDiv = document.createElement('tr');
	buttonsDiv.innerHTML = '<td colspan="5"><div style="margin:2rem;text-align:center;">' + xPublishButtonHMTL + xUnpublishButtonHMTL + xArchiveButtonHMTL + xDeleteButtonHMTL + xUnarchiveButtonHMTL + '</div></td>';
	wfActionBox.appendChild(buttonsDiv);
}

document.addEventListener("DOMContentLoaded", function (e) {
	xAddButtons();
	setInterval(function () {
		document.getElementById("workflowActionsDia").style.height = "200px";
	},2000);
});