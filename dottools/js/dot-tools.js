/* dotCRUD */

/*
Field Types Ref:
Text		com.dotcms.contenttype.model.field.ImmutableTextField
Textarea	com.dotcms.contenttype.model.field.ImmutableTextAreaField
Date/time	com.dotcms.contenttype.model.field.ImmutableDateTimeField
WYSIWYG		com.dotcms.contenttype.model.field.ImmutableWysiwygField
Radio		com.dotcms.contenttype.model.field.ImmutableRadioField
Select		com.dotcms.contenttype.model.field.ImmutableSelectField
Checkbox	com.dotcms.contenttype.model.field.ImmutableCheckboxField
Folder 		com.dotcms.contenttype.model.field.ImmutableHostFolderField
Image		com.dotcms.contenttype.model.field.ImmutableImageField
Binary		com.dotcms.contenttype.model.field.ImmutableBinaryField
Tags		com.dotcms.contenttype.model.field.ImmutableTagField
Key/Value	com.dotcms.contenttype.model.field.ImmutableKeyValueField
Custom		com.dotcms.contenttype.model.field.ImmutableCustomField
Hidden		com.dotcms.contenttype.model.field.ImmutableHiddenField
*/

var CrudApp = {

	host: "+(conhost:" + dotHostId +" conhost:SYSTEM_HOST)",
	dwrsessionid: null,
	dwrBatchId: 1,
	dotcms: null,
	dotcmsVersion: null,

	getWorkflowId: function (name) {
		switch (name) {
			case 'publish':
				return '000ec468-0a63-4283-beb7-fcb36c107b2f';
			case 'unpublish':
				return '38efc763-d78f-4e4b-b092-59cd8c579b93';
			case 'archive':
				return '4da13a42-5d59-480c-ad8f-94a3adf809fe';
			case 'unarchive':
				return 'c92f9aa1-9503-4567-ac30-d3242b54d02d';
			case 'delete':
				return '777f1c6b-c877-4a37-ba4b-10627316c2cc';
		}
	},

	hasEntityList: function (data) {
		if (data.hasOwnProperty('entity') && data.entity) {
			if (Object.prototype.toString.call(data.entity) === '[object Array]' || Object.prototype.toString.call(data.entity) === '[object Object]') {
				return true;
			}
		}
		return false;
	},

	getStructureDataMerged: function () {
		if (CrudApp.structuresMerged === false && Array.isArray(CrudApp.CT) && Array.isArray(CrudApp.fields)) {

		} else if (Array.isArray(CrudApp.structureData)) {
			return CrudApp.structureData;
		}
		return CrudApp.structureData;
	},

	logout: function () {
		$.ajax({
			url: '/api/v1/logout',
			method: 'GET',
			success: function () {
				location.href = '/';
			},
			error: function () {
				location.href = "login.jsp"
			}
		});
	},

	// Text Manipulation
	textUtils: {
		jsonFields: function (data, stName, enabledFields) {
			var out = '';
			out += "'stName':" + "'" + stName + "'";
			for (var i = 0; i < enabledFields.length; i++) {
				if (typeof data[enabledFields[i]] === 'object') {
					out += ",'" + enabledFields[i] + "':" + "'" + JSON.stringify(data[enabledFields[i]]).replace(/\'/g, '\\\'' ).replace(/\"/g, '\\\'') + "'";
				} else {
					if (typeof data[enabledFields[i]] === 'string') {
						out += ",'" + enabledFields[i] + "':" + "'" + data[enabledFields[i]].replace(/\n/gm, '\\n') + "'";
					} else {
						if (typeof data[enabledFields[i]] === 'undefined') {
							out += ",'" + enabledFields[i] + "':" + 'null';
						} else if (typeof data[enabledFields[i]] === 'number' || typeof data[enabledFields[i]] === 'boolean') {
							out += ",'" + enabledFields[i] + "':" + data[enabledFields[i]];
						}
					}
				}
			}
			return out;
		},

		cURLOutput: function (data, stName, enabledFields) {
			var out = '';
			data.forEach(function (element) {
				out += 'curl -i -v -n -XPUT -H "Content-Type:application/json" -d "{';
				out += CrudApp.textUtils.jsonFields(element, stName, enabledFields);
				out += '};" ';
				out += 'https://' + location.host + '/api/content/publish/1';
				out += "\n";
			});
			return out;
		},

		csvFields: function (data, stName, enabledFields) {
			var out = '';
			out += stName;
			for (var i = 0; i < enabledFields.length; i++) {
				if (typeof data[enabledFields[i]] === 'object') {
					out += ',"' + JSON.stringify(data[enabledFields[i]]).replace(/\"/g,"'") + '"';
				} else {
					if (typeof data[enabledFields[i]] === 'string' && data[enabledFields[i]].indexOf(',') > -1) {
						out += ',"' + data[enabledFields[i]].replace(/\n/gm, '\\n') + '"';
					} else {
						if (typeof data[enabledFields[i]] === 'undefined') {
							out += ',';
						} else {
							if (typeof data[enabledFields[i]] === 'string') {
								out += ',' + data[enabledFields[i]].replace(/\n/gm, '\\n');
							} else {
								out += ',' + data[enabledFields[i]];
							}
						}
					}
				}
			}
			return out;
		},

		csvOutput: function (data, stName, enabledFields) {
			var out = 'stName';
			enabledFields.forEach (function (element) {
				out += ',' + element;
			});
			out += "\n";
			data.forEach(function (element) {
				out += CrudApp.textUtils.csvFields(element, stName, enabledFields);
				out += "\n";
			});
			return out;
		},

		tableFields: function (data, stName, enabledFields) {
			var out = '';
			out +=  '<td>' + stName + '</td>';
			for (var i = 0; i < enabledFields.length; i++) {
				out += '<td>' + data[enabledFields[i]] + '</td>';
			}
			return out;
		},

		tableOutput: function (data, stName, enabledFields) {
			var out = '';
			out += '<table>' + "\n";
			out += '<thead><tr>' + "\n";
			out += '<th>' + 'stName' + '</th>';
			enabledFields.forEach (function (element) {
				out += '<th>' + element + '</th>';
			});
			out += '</tr></thead>' + "\n";
			out += '<tbody>' + "\n";
			data.forEach(function (element) {
				out += '<tr>';
				out += CrudApp.textUtils.tableFields(element, stName, enabledFields);
				out += '</tr>' + "\n";
			});
			out += '</tbody>' + "\n";
			out += '</table>' + "\n";
			return out;
		}

	},

	sessionLog: {
		addEntry: function (text, level) {
			var logWindow = $('#session-log');
			var out = String('<p class="log-entry">');
			var timestamp = moment().format("DD-MMM YYYY HH:mm:ss");
			var logLevel = String('');
			if (typeof level != 'undefined') {
				switch (level) {
					case 0:
						logLevel = '<span class="label alert">[SEVERE]</span>';
					break;
					case 1:
						logLevel = '<span class="label alert">[ERROR]</span>';
					break;
					case 2:
						logLevel = '<span class="label warning">[WARN]</span>';
					break;
					case 3:
						logLevel = '<span class="label primary">[INFO]</span>';
					break;
					default:
						logLevel = '<span class="label primary">[INFO]</span>';
					break;
				}
			} else {
				logLevel = '<span class="label primary">[INFO]</span>';
			}
			out += timestamp + '&nbsp;' + logLevel + '&nbsp;' + text + '</p>';

			
			
			$(logWindow).html( out + $(logWindow).html() );
		},
		openLogWindow: function () {
			$('#logWindow').foundation('open');
		}
	}
};

// Log Trimmer
setInterval(function () {
	var logEntries = $('#session-log').children('p');
	if (logEntries.length > 100) {
		$('#session-log').html(logEntries.splice(0, 100));
	}
}, 800);

CrudApp.util = {

	determineDotcmsVersion: function () {
		if (dotVersion) {
			if (dotVersion.startsWith("5.")) {
				return 5;
			} else if (dotVersion.startsWith("4.")) {
				return 4;
			} else if (dotVersion.startsWith("3.")) {
				return 3;
			} else {
				return null;
			}
		} else if (arguments && arguments[0]) {
			if (arguments[0].startsWith("5.")) {
				return 5;
			} else if (arguments[0].startsWith("4.")) {
				return 4;
			} else if (arguments[0].startsWith("3.")) {
				return 3;
			} else {
				return null;
			}
		}
	},

	pruneInodes: function (identifier) {
		CrudApp.sessionLog.addEntry("Getting list of inodes for " + identifier, 3);
		var inodeList = [];
		var inodesToDelete = [];
		$.ajax({
			method: 'GET',
			url: '/html/portlet/ext/contentlet/contentlet_versions_inc.jsp?contentletId=' + identifier,
			contentType: 'text/html',
			success: function (data) {
				console.log('Retrieved list success, parsing data...');
				$('#data-dump').html(data);
				$('#data-dump .listingTable tr').each(function () {
					$(this).children('td:last-child').each(function () {
						if ($(this).parent('tr').children("td:nth-child(2)").text().indexOf("Working Version") === -1) {
							inodeList.push($(this).text());
						}
					});
				});

				if (inodeList.length > 0) {
					CrudApp.sessionLog.addEntry("Have inode list for " + identifier, 3);
					CrudApp.util.pruneInodesQueue(inodeList);
				} else {
					CrudApp.sessionLog.addEntry("Unable to find non-working version inodes for " + identifier, 2);
				}
			}
		});
	},

	pruneInodesQueue: function (inodes) {
		CrudApp.sessionLog.addEntry("Starting queue for inode list..." + inodes.toString(), 3);
		for (var i = 0; i < inodes.length; i++) {
			CrudApp.util.deleteInode(inodes[i], (i * 250));
		}
	},

	deleteInode: function (inode, timeout) {
		CrudApp.sessionLog.addEntry("Queueing: " + inode, 3);
		var uri = "";
		if (CrudApp.dotcmsVersion > 3) {
			uri = '/c/portal/layout?p_l_id=b7ab5d3c-5ee0-4195-a17e-8f5579d718dd&p_p_id=site-browser&p_p_action=1&p_p_state=maximized&p_p_mode=view&_site_browser_struts_action=%2Fext%2Fcontentlet%2Fedit_contentlet&cmd=deleteversion&&referer=%2Fc%2Fportal%2Flayout%3Fp_l_id%3Db7ab5d3c-5ee0-4195-a17e-8f5579d718dd&inode=' + inode;
		} else if (CrudApp.dotcmsVersion === 3) {
			uri = '/c/portal/layout?p_l_id=71b8a1ca-37b6-4b6e-a43b-c7482f28db6c&p_p_id=EXT_11&p_p_action=1&p_p_state=maximized&p_p_mode=view&_EXT_11_struts_action=%2Fext%2Fcontentlet%2Fedit_contentlet&cmd=deleteversion&referer=/c/portal/layout?&inode=' + inode;
		}

		setTimeout(function () {
			$.ajax({
				method: 'GET',
				url: uri,
				contentType: 'text/html',
				success: function (data) {
					CrudApp.sessionLog.addEntry("Deleted inode: " + inode, 3);
				},
				error: function (xhr, status, error) {
					CrudApp.sessionLog.addEntry("inode delete failed: " + inode, 1);
				}
			});
		}, timeout);
	},

	addToConsoleHistory: function (string) {
		var out = String('<hr><p class="log-entry">');
		var timestamp = moment().format("DD-MMM YYYY HH:mm:ss");
		out += timestamp + '&nbsp;' + '<code>' + string + '</code>' + '</p>';

		$('#console-history').html( out + $('#console-history').html() );
	}

};


CrudApp.dwr = {

	getWorkflowPayload: function (workflow, item) {

		if (CrudApp.dotcmsVersion === 5) {

			var payloadObject = CrudApp.dwr.payloads.v5.contentlet();

			var workflowIndex = CrudApp.dwr.getPayloadIndex(payloadObject, "c0-param2");
			var inodeIndex = CrudApp.dwr.getPayloadIndex(payloadObject, "c0-param4");
			var batchIdIndex = CrudApp.dwr.getPayloadIndex(payloadObject, "batchId");
			var sessionIdIndex = CrudApp.dwr.getPayloadIndex(payloadObject, "scriptSessionId");

			payloadObject[workflowIndex].value = "string:" + CrudApp.getWorkflowId(workflow);
			payloadObject[inodeIndex].value =  "string:" + item;
			payloadObject[batchIdIndex].value = CrudApp.dwrBatchId;
			payloadObject[sessionIdIndex].value = CrudApp.dwrsessionid;

			return CrudApp.dwr.stringifyPayload(payloadObject);

		} else if (CrudApp.dotcmsVersion === 4) {


			if (workflow == "delete") {
				// Deleting contentlets in dotCMS 4 is a GET request without a payload
				return null;

			} else {

				var payloadObject = CrudApp.dwr.payloads.v4.contentlet(workflow);

				var inodeIndex = CrudApp.dwr.getPayloadIndex(payloadObject, "c0-param0");
				var batchIdIndex = CrudApp.dwr.getPayloadIndex(payloadObject, "batchId");
				var sessionIdIndex = CrudApp.dwr.getPayloadIndex(payloadObject, "scriptSessionId");

				payloadObject[inodeIndex].value =  "string:" + item;
				payloadObject[batchIdIndex].value = CrudApp.dwrBatchId;
				payloadObject[sessionIdIndex].value = CrudApp.dwrsessionid;

				return CrudApp.dwr.stringifyPayload(payloadObject);

			}

		} else if (CrudApp.dotcmsVersion === 3) {
			return null;
		}


		return null;
	},

	getPayloadIndex: function (payload, string) {
		return payload.findIndex(function (element) {
			return element.id == string;
		});
	},

	stringifyPayload: function (payload) {
		var out = String('');
		for (let index = 0; index < payload.length; index++) {
			const element = payload[index];
			out += element.id + "=" + element.value + "\n";
		}

		return out;
	},


	getFile: function (type, operation, action, inode, structureInode) {

		if (CrudApp.dotcmsVersion === 5) {

			if (type = 'contentlet') {
				return CrudApp.dwr.files.v5.contentlet();
			}

		} else if (CrudApp.dotcmsVersion === 4) {

			if (type == 'contentlet') {
				if (operation == 'workflow') {

					var queryParams = "";
					var dwrFile = CrudApp.dwr.files.v4.contentlet(action);

					if (action == "delete") {

						queryParams += "p_l_id=71b8a1ca-37b6-4b6e-a43b-c7482f28db6c" + "&";
						queryParams += "p_p_id=content" + "&";
						queryParams += "p_p_action=1" + "&";
						queryParams += "p_p_state=maximized" + "&";
						queryParams += "p_p_mode=view" + "&";
						queryParams += "_content_struts_action=/ext/contentlet/edit_contentlet" + "&";
						queryParams += "_content_cmd=full_delete" + "&";
						queryParams += "structure_id=" + structureInode + "&";
						queryParams += "contentStructureType=1" + "&";
						queryParams += "inode=" + inode + "&";
						queryParams += "referer=/c/portal/layout?";

					}

					return String(dwrFile + queryParams);
				}
			}

		} else if (CrudApp.dotcmsVersion === 3) {
			
			if (type == 'contentlet') {
				if (operation == 'workflow') {

					var queryParams = "";
					var dwrFile = CrudApp.dwr.files.v3.contentlet(action);

					if (action == "publish") {

						queryParams += "p_l_id=71b8a1ca-37b6-4b6e-a43b-c7482f28db6c" + "&";
						queryParams += "p_p_id=EXT_11" + "&";
						queryParams += "p_p_action=1" + "&";
						queryParams += "p_p_state=maximized" + "&";
						queryParams += "p_p_mode=view" + "&";
						queryParams += "_EXT_11_struts_action=/ext/contentlet/edit_contentlet" + "&";
						queryParams += "_EXT_11_cmd=full_publish_list" + "&";
						queryParams += "structure_id=" + structureInode + "&";
						queryParams += "contentStructureType=1" + "&";
						queryParams += "publishInode=" + inode + "&";
						queryParams += "referer=/c/portal/layout?";

					} else if (action == "unpublish") { 

						queryParams += "p_l_id=71b8a1ca-37b6-4b6e-a43b-c7482f28db6c" + "&";
						queryParams += "p_p_id=EXT_11" + "&";
						queryParams += "p_p_action=1" + "&";
						queryParams += "p_p_state=maximized" + "&";
						queryParams += "p_p_mode=view" + "&";
						queryParams += "_EXT_11_struts_action=/ext/contentlet/edit_contentlet" + "&";
						queryParams += "_EXT_11_cmd=unpublish" + "&";
						queryParams += "structure_id=" + structureInode + "&";
						queryParams += "contentStructureType=1" + "&";
						queryParams += "inode=" + inode + "&";
						queryParams += "referer=/c/portal/layout?";
						
					} else if (action == "archive") { 

						queryParams += "p_l_id=71b8a1ca-37b6-4b6e-a43b-c7482f28db6c" + "&";
						queryParams += "p_p_id=EXT_11" + "&";
						queryParams += "p_p_action=1" + "&";
						queryParams += "p_p_state=maximized" + "&";
						queryParams += "p_p_mode=view" + "&";
						queryParams += "_EXT_11_struts_action=/ext/contentlet/edit_contentlet" + "&";
						queryParams += "structure_id=" + structureInode + "&";
						queryParams += "contentStructureType=1" + "&";
						queryParams += "cmd=delete" + "&";
						queryParams += "inode=" + inode + "&";
						queryParams += "referer=/c/portal/layout?";

					} else if (action == "unarchive") { 

						queryParams += "p_l_id=71b8a1ca-37b6-4b6e-a43b-c7482f28db6c" + "&";
						queryParams += "p_p_id=EXT_11" + "&";
						queryParams += "p_p_action=1" + "&";
						queryParams += "p_p_state=maximized" + "&";
						queryParams += "p_p_mode=view" + "&";
						queryParams += "_EXT_11_struts_action=/ext/contentlet/edit_contentlet" + "&";
						queryParams += "_EXT_11_cmd=undelete" + "&";
						queryParams += "structure_id=" + structureInode + "&";
						queryParams += "contentStructureType=1" + "&";
						queryParams += "inode=" + inode + "&";
						queryParams += "referer=/c/portal/layout?";

					} else if (action == "delete") { 

						queryParams += "p_l_id=71b8a1ca-37b6-4b6e-a43b-c7482f28db6c" + "&";
						queryParams += "p_p_id=EXT_11" + "&";
						queryParams += "p_p_action=1" + "&";
						queryParams += "p_p_state=maximized" + "&";
						queryParams += "p_p_mode=view" + "&";
						queryParams += "_EXT_11_struts_action=/ext/contentlet/edit_contentlet" + "&";
						queryParams += "_EXT_11_cmd=full_delete" + "&";
						queryParams += "structure_id=" + structureInode + "&";
						queryParams += "contentStructureType=1" + "&";
						queryParams += "inode=" + inode + "&";
						queryParams += "referer=/c/portal/layout?";

					}

					return String(dwrFile + queryParams);
				}
			}
		}
	},


	getRequestMethod: function (type, operation, action) {

		if (CrudApp.dotcmsVersion === 4) {
			if (type == 'contentlet') {
				if (operation == 'workflow') {
					if (action == "delete") {
						return "GET";
					}
				}
			}
		}
		if (CrudApp.dotcmsVersion === 3) {
			if (type == 'contentlet') {
				if (operation == 'workflow') {
					if (action) {
						return "GET";
					}
				}
			}
		}

		return "POST";
	},


	payloads: {
		v5: {
			contentlet: function () {
				return [
					{ "id": "callCount",       "value": "1" },
					{ "id": "windowName",      "value": "c0-param2" },
					{ "id": "c0-scriptName",   "value": "BrowserAjax" },
					{ "id": "c0-methodName",   "value": "saveFileAction" },
					{ "id": "c0-id",           "value": "0" },
					{ "id": "c0-param0",       "value": "string:" },
					{ "id": "c0-param1",       "value": "string:" },
					{ "id": "c0-param2",       "value":  null },
					{ "id": "c0-param3",       "value": "string:" },
					{ "id": "c0-param4",       "value":  null },
					{ "id": "c0-param5",       "value": "string:" },
					{ "id": "c0-param6",       "value": "string:" },
					{ "id": "c0-param7",       "value": "string:" },
					{ "id": "c0-param8",       "value": "string:" },
					{ "id": "c0-param9",       "value": "string:" },
					{ "id": "c0-param10",      "value": "string:" },
					{ "id": "batchId",         "value": null },
					{ "id": "instanceId",      "value": "0" },
					{ "id": "page",            "value": "/c/portal/layout?" },
					{ "id": "scriptSessionId", "value": null }
				]
			}
		},
		v4: {
			contentlet: function (workflow) {
				switch (workflow) {
					case "publish":
						return [
							{ "id": "callCount",       "value": "1" },
							{ "id": "windowName",      "value": "c0-param2" },
							{ "id": "c0-scriptName",   "value": "BrowserAjax" },
							{ "id": "c0-methodName",   "value": "publishAsset" },
							{ "id": "c0-id",           "value": "0" },
							{ "id": "c0-param0",       "value": null }, // inode
							{ "id": "batchId",         "value": null },
							{ "id": "instanceId",      "value": "0" },
							{ "id": "page",            "value": "/c/portal/layout?" },
							{ "id": "scriptSessionId", "value": null } // DWRSESSIONID
						];
					case "unpublish":
						return [
							{ "id": "callCount",       "value": "1" },
							{ "id": "windowName",      "value": "c0-param2" },
							{ "id": "c0-scriptName",   "value": "BrowserAjax" },
							{ "id": "c0-methodName",   "value": "unPublishAsset" },
							{ "id": "c0-id",           "value": "0" },
							{ "id": "c0-param0",       "value": null }, // inode
							{ "id": "batchId",         "value": null },
							{ "id": "instanceId",      "value": "0" },
							{ "id": "page",            "value": "/c/portal/layout?" },
							{ "id": "scriptSessionId", "value": null } // DWRSESSIONID
						];
					case "archive":
						return [
							{ "id": "callCount",       "value": "1" },
							{ "id": "windowName",      "value": "c0-param2" },
							{ "id": "c0-scriptName",   "value": "BrowserAjax" },
							{ "id": "c0-methodName",   "value": "archiveAsset" },
							{ "id": "c0-id",           "value": "0" },
							{ "id": "c0-param0",       "value": null }, // inode
							{ "id": "batchId",         "value": null },
							{ "id": "instanceId",      "value": "0" },
							{ "id": "page",            "value": "/c/portal/layout?" },
							{ "id": "scriptSessionId", "value": null } // DWRSESSIONID
						];
					case "unarchive":
						return [
							{ "id": "callCount",       "value": "1" },
							{ "id": "windowName",      "value": "c0-param2" },
							{ "id": "c0-scriptName",   "value": "BrowserAjax" },
							{ "id": "c0-methodName",   "value": "unArchiveAsset" },
							{ "id": "c0-id",           "value": "0" },
							{ "id": "c0-param0",       "value": null }, // inode
							{ "id": "batchId",         "value": null },
							{ "id": "instanceId",      "value": "0" },
							{ "id": "page",            "value": "/c/portal/layout?" },
							{ "id": "scriptSessionId", "value": null } // DWRSESSIONID
						];
					case "delete":
						return null;
				}
			}
		}
	},

	files: {
		v5: {
			contentlet: function () {
				return '/dwr/call/plaincall/BrowserAjax.saveFileAction.dwr';
			}
		},
		v4: {
			contentlet: function (workflow) {
				switch (workflow) {
					case "publish":
						return "/dwr/call/plaincall/BrowserAjax.publishAsset.dwr";

					case "unpublish":
						return "/dwr/call/plaincall/BrowserAjax.unPublishAsset.dwr";

					case "archive":
						return "/dwr/call/plaincall/BrowserAjax.archiveAsset.dwr";

					case "unarchive":
						return "/dwr/call/plaincall/BrowserAjax.unArchiveAsset.dwr";

					case "delete":
						// Contentlet delete doesn't use DWR
						return "/c/portal/layout?";
				}
			}
		},
		v3: {
			contentlet: function (workflow) {
				return "/c/portal/layout?";
			}
		}

	},


	session: {

		getSessionId: function () {

		},

		extractSessionId: function () {

		}

	}


};

dotcmsVersion = CrudApp.util.determineDotcmsVersion();
CrudApp.dotcmsVersion = CrudApp.util.determineDotcmsVersion();

Vue.component('dotcmsInfo', {
	template: '#dotcms-info',
	props: ["dotcms", "dotcmsVersion", "pane", "version"],
	methods: {
		setPane: function (pane) {
			this.$root.pane = pane;
		}
	}
});


Vue.component('velocityConsole', {
	template: "#velocity-console",
	props: ["ct", "user"],
	data: function () {
		return {
			velocityProcessorEndpoint: 'vel-parse.jsp',
			loading: false,
			outputFormat: 'preformatted',
			processVelocity: true,
			liveUpdate: false,
			logging: false,
			benchStart: null,
			benchFinish: null,
			bench: null,
			lastDispatch: 0,
			floodControl: false,
			consoleInput: null,
			consoleOutput: null,
			liveUpdateFunction: null,
			consoleInputQueue: null
		}
	},
	methods: {
		sendQuery: function () {
			if (this.processVelocity) {
				this.sendVelocityQuery();
			} else {
				this.consoleOutput = this.consoleInput;
			}
		},
		sendVelocityQuery: function () {
			if (this.liveUpdate === false) {
				CrudApp.util.addToConsoleHistory(this.consoleInput);
			}

			if (this.lastDispatchDiff() < 350 || this.floodContol) {
				this.floodControl = true;
				this.loading = true
				setTimeout(this.resetFloodControl, 1400);
			}
			this.loading = true;
			this.benchStart = Date.now();

			var vm = this;

			$.ajax({
				url: this.velocityProcessorEndpoint,
				type: 'POST',
				data: {'q': 'vtlConsole', 's': this.consoleInput, 'l': this.logging },
				success: function (data) {
					vm.benchFinish = Date.now();
					vm.lastDispatch = Date.now();
					vm.calcBenchmarks();
					vm.loading = false;
					vm.consoleOutput = data;
					CrudApp.sessionLog.addEntry("Velocity Console: Callback Success", 3);
				},
				error: function (data, status, xhr) {
					vm.loading = false;
					vm.consoleOutput = 'Error:'+"\n"+'status:'+status+"\n"+'xhr:'+xhr+"\n"+'data:'+data+"\n";
					CrudApp.sessionLog.addEntry("Velocity Console: Callback Failed", 1);
				},
			});
		},
		lastDispatchDiff: function () {
			return Number(Date.now() - this.lastDispatch);
		},
		resetFloodControl: function () {
			this.loading = false;
			this.floodControl = false;
		},
		calcBenchmarks: function () {
			this.bench = (this.benchFinish - this.benchStart);
		},
		initLiveUpdate: function () {
			if (this.processVelocity === true) {
				this.liveUpdateFunction = setInterval(this.liveUpdater, 600);
			} else {
				this.liveUpdateFunction = setInterval(this.liveUpdater, 50);
			}
		},
		liveUpdater: function () {
			if (this.consoleInputQueue && this.consoleInput) {
				if (this.consoleInput.length > this.consoleInputQueue.length) {
					this.sendVelocityQuery();
				}
			}
			this.consoleInputQueue = this.consoleInput;
		},
		checkLiveUpdateStatus: function () {
			if (this.liveUpdate === false) {
				if (this.liveUpdateFunction) {
					clearInterval(this.liveUpdateFunction);
					this.liveUpdateFunction = null;
				}
			} else {
				if (!this.liveUpdateFunction) {
					this.initLiveUpdate();
				}
			}
		}
	},
	watch: {
		liveUpdate: function (val) {
			this.checkLiveUpdateStatus();
		},
		outputFormat: function (val) {
			// Clear current interval if changing VTL preprocessor while live update is active
			if (this.liveUpdate) {
				clearInterval(this.liveUpdateFunction);
				this.checkLiveUpdateStatus();
			}
		}
	},
	mounted: function () {
		this.checkLiveUpdateStatus();
		this.lastDispatch = Date.now();
	}
});


Vue.component('contentManager', {
	template: '#content-manager',
	props: ["ct", "users"],
	data: function () {
		return {
			hasResults: false,
			queryErrors: null,
			query: {
				query: CrudApp.host + " -contentType:Host -baseType:3 -contentType:Persona",
				query2: "",
				offset: 0,
				limit: 0,
				sort: 'modDate desc'
			},
			results: null
		}
	},
	methods: {
		sendQuery: function () {
			this.results = null;
			var vm = this;
			$.ajax({
				method: 'GET',
				url: '/api/content/render/false/query/' + encodeURIComponent(vm.query.query) + '%20' + encodeURIComponent(vm.query.query2) + '%20' + '/orderby/' + encodeURIComponent(vm.query.sort) + '/limit/' + vm.query.limit + '/offset/' + vm.query.offset,
				contentType: 'application/json',
				success: function (data) {
					if (data.contentlets) {
						vm.results = data.contentlets;
						vm.hasResults = true;
						CrudApp.sessionLog.addEntry("contentManager sendQuery(): Callback Success", 3);
					} else {
						// dotCMS 4 returns text/plain for some reason
						if (JSON.parse(data)) {
							vm.results = JSON.parse(data).contentlets;
							vm.hasResults = true;
						} else {
							CrudApp.sessionLog.addEntry("contentManager sendQuery(): Return Data Invalid", 2);
						}
					}
				},
				error: function (xhr, status, error) {
					vm.queryErrors = status.status + ': ' + status.responseText;
					CrudApp.sessionLog.addEntry("contentManager sendQuery(): Callback error: " + error, 2);
				}
			})
		},
	},
	watch: {
		'query.limit': function () {
			if (this.query.limit > 1000) {
				this.query.limit = 1000;
			}
		}
	}
});


Vue.component('contentList', {
	template: "#content-list",
	props: ["ct", "results", "users"],
	data: function () {
		return {
			selectedContentlets: [],
			actionSelected: null,
			result: null
		}
	},
	methods: {
		invertSelected: function () {
			for (var i = 0; i < this.results.length; i++) {
				if (this.selectedContentlets.indexOf(this.results[i].inode) === -1) {
					this.selectedContentlets.push(this.results[i].inode);
				} else {
					this.selectedContentlets.splice( this.selectedContentlets.indexOf(this.results[i].inode), 1);
				}
			}
		},
		resultTitle: function (result) {
			if (result.title) {
				return result.title;
			}
			if (result.name) {
				return result.name;
			}

			if (this.ct) {
				var contentletStructure = this.findStructureById(result.stInode);
				if (contentletStructure) {
					var contentletDisplayField = this.findContentletDisplayField(contentletStructure).variable;
					return result[contentletDisplayField];
				}
			} else {
				if (result["__DOTNAME__"]) {
					return result["__DOTNAME__"];
				} else {
					return result.identifier;
				}
			}

		},
		resultType: function (result) {
			var idToFind = result.stInode;
			if (this.ct) {
				var structureIndex = this.ct.findIndex(function (element) {
					return element.id === idToFind
				});
			} else { 
				return result.stInode;
			}
			return this.ct[structureIndex].variable;
		},
		resultModUser: function (result) {
			var idToFind = result.modUser;
			if (this.users) {
				var userIndex = this.users.findIndex(element => element.id === idToFind);
			} else {
				return result.modUser;
			}
			if (userIndex > -1) {
				return this.users[userIndex].name;
			} else {
				return result.modUser;
			}
		},
		setResult: function (result) {
			this.result = result;
		},
		contentActions: function (action, ele) {
			this.actionSelected = action;
		},
		findContentletDisplayField: function (structure) {
			return structure.fields.find(function (element) {
				if (element.listed === true) {
					return element;
				};
			});

		},
		findStructureById: function (id) {
			return this.ct.find(function (element) {
				return element.id === id;
			});
		},
		getIdentifierByInode: function (inode) {
			for (let index = 0; index < this.results.length; index++) {
				const element = this.results[index];
				if (element.inode === inode) {
					return element.identifier;
				}
			}
		},
		getStructureByInode: function (inode) {
			for (let index = 0; index < this.results.length; index++) {
				const element = this.results[index];
				if (element.inode === inode) {
					return element.stInode;
				}
			}
		},
		confirmAction: function () {
			var vm = this;
			// CrudApp.sessionLog.openLogWindow();

			// Pruning inodes is a different process than applying workflow actions
			if (this.actionSelected === 'prune') {
				CrudApp.sessionLog.addEntry("contentManager inode prune: Preparing prune actions", 3);
				var selectedIdentifiers = [];
				for (var i = 0; i < this.selectedContentlets.length; i++) {
					selectedIdentifiers.push(this.getIdentifierByInode(this.selectedContentlets[i]));
				}
				for (var i = 0; i < selectedIdentifiers.length; i++) {
					CrudApp.util.pruneInodes(selectedIdentifiers[i]);
				}

			} else {
				CrudApp.sessionLog.addEntry("contentManager Apply Workflow: Applying workflow actions to " + this.selectedContentlets.length + " contentlets..." , 3);
				for (let index = 0; index < this.selectedContentlets.length; index++) {
					const element = this.selectedContentlets[index];
					$.ajax({
						method: CrudApp.dwr.getRequestMethod('contentlet', 'workflow', this.actionSelected),
						url: CrudApp.dwr.getFile('contentlet', 'workflow', this.actionSelected, element, this.getStructureByInode(element)),
						dataType: "text",
						data: CrudApp.dwr.getWorkflowPayload(this.actionSelected, element),
						success: function(data) {
							vm.handleActionResponse(data, index);
						},
						error: function (xhr, status, error) {
							console.error('Execute workflow action failed: ', xhr, status, error);
							CrudApp.sessionLog.addEntry("contentManager Apply Workflow: Callback Error: " + (index+1) + " " + xhr, 1);
						}
					});
				}
			}
		},
		handleActionResponse: function (data, index) {
			if (CrudApp.dotcmsVersion === 5) {
				if (data.indexOf('Workflow executed') > 0 && data.indexOf('success')) {
					CrudApp.sessionLog.addEntry("contentManager Apply Workflow: Callback Success ("+ Number(index+1) +")", 3);
				} else {
					CrudApp.sessionLog.addEntry("contentManager Apply Workflow: Callback Invalid return data", 2);
				}

			} else if (CrudApp.dotcmsVersion === 4) {
				if (data.length > 100 & data.indexOf('nullPointerException') === -1) {
					CrudApp.sessionLog.addEntry("contentManager Apply Workflow: No nullPointerException (assuming success)", 3);
				} else {
					CrudApp.sessionLog.addEntry("contentManager Apply Workflow: Success conditions not met (assuming failure)", 2);
				}
			}
		}
	}
});


Vue.component("contentletData", {
	template: '#contentlet-data',
	props: ["result"],
	methods: {
		isVisible: function () {
			if (this.$parent.result && this.$parent.result.inode == this.result.inode) {
				return true;
			}
			return false;
		},
		hide: function () {
			this.$parent.result = null;
		}
	}
})


Vue.component('queryBox', {
	template: "#query-box",
	props: ["ct", "version"],
	data: function () {
		return {
			rawData: null,
			selectedCT: "",
			ctName: null,
			fields: null,
			rawFields: null,
			exportData: null,
			exportFormat: 'json',
			importErrors: null,
			exportOptions: {
				query: "",
				limit: 0,
				sort: 'modDate desc',
				fields: [],
				view: 'plain'
			}
		}
	},
	methods: {
		getCTFields: function () {
			var vm = this;
			this.exportOptions.fields = [];
			for (var i = 0; i < this.ct.length; i++) {
				if (this.ct[i].variable == this.ctName) {
					this.rawFields = this.ct[i].fields;
					this.fields = this.rebuildFieldsList(this.ct[i].fields);
					this.preSelectCheckboxes();
				}
			}
		},
		rebuildFieldsList: function (data) {
			var rebuild = [];
			data.forEach(function(element) {
				if (element.clazz === 'com.dotcms.contenttype.model.field.ImmutableHostFolderField') {
					rebuild.push({
						'name': 'Host',
						'variable': 'host',
						'dataType': 'TEXT'
					});
					rebuild.push({
						'name': 'Folder',
						'variable': 'folder',
						'dataType': 'TEXT'
					});
				} else {
					rebuild.push({
						'name': element.name,
						'variable': element.variable,
						'dataType': element.dataType
					});
				}
			});
			return rebuild;
		},
		preSelectCheckboxes: function () {
			var vm = this;
			this.fields.forEach(function (element) {
				vm.exportOptions.fields.push(element.variable);
			});
		},
		getExportData: function () {
			var vm = this;
			var requestContentType = "application/json";
			var apiFormat = "json";
			if (this.exportFormat == "xml") {
				var requestContentType = "application/xml";
				var apiFormat = "xml";
			}
			var apiUrl  = '/api/content/render/false/';
				apiUrl += 'type/' + apiFormat + '/';
				apiUrl += 'query/';
				apiUrl += '+contentType:' + encodeURIComponent(this.ctName) + '%20';
				apiUrl += encodeURIComponent(this.exportOptions.query) + '%20';
				apiUrl += CrudApp.host + '%20';
				apiUrl += '+languageId:1' + '%20' + '+deleted:false' + '%20' + '+working:true' + '%20';
				apiUrl += '/orderby/' + encodeURIComponent(this.exportOptions.sort) + '%20';
				if (this.exportOptions.limit) apiUrl += '/limit/' + this.exportOptions.limit + '%20';

			$.ajax({
				method: 'GET',
				url: apiUrl,
				contentType: requestContentType,
				success: function (data) {
					vm.rawData = data;
					CrudApp.sessionLog.addEntry("queryBox getExportData(): Callback Success", 3);
					vm.setOutput();
				},
				error: function (xhr, status, error) {
					vm.exportData = xhr;
					CrudApp.sessionLog.addEntry("queryBox getExportData(): Callback Failed" + error, 3);
				}
			});
		},
		setOutput: function () {
			// When output format is changed, retrieve new data if needed
			if (this.rawData) {
				var data = this.rawData;
				if (this.exportFormat == "json") {
					this.exportOptions.view = 'plain';
					if (data.hasOwnProperty('contentlets') && data.contentlets) {
						if (Object.prototype.toString.call(data.contentlets) == '[object Array]') {
							this.exportData = this.syncFieldPreferences(data.contentlets);
						} else {
							this.getExportData();
						}
					}
				} else if (this.exportFormat == "xml") {
					this.exportOptions.view = 'plain';
					if (Object.prototype.toString.call(data) === '[object XMLDocument]') {
						this.exportData = (new XMLSerializer()).serializeToString(data);
					} else {
						this.getExportData();
					}
				} else if (this.exportFormat == 'curl') {
					this.exportOptions.view = 'plain';
					if (Object.prototype.toString.call(data) === '[object XMLDocument]') {
						this.getExportData();
					} else {
						this.exportData = this.syncFieldPreferences(data.contentlets);
						this.exportData = CrudApp.textUtils.cURLOutput(this.exportData, this.selectedCT, this.exportOptions.fields);
					}
				} else if (this.exportFormat == 'csv') {
					this.exportOptions.view = 'plain';
					if (Object.prototype.toString.call(data) === '[object XMLDocument]') {
						this.getExportData();
					} else {
						this.exportData = this.syncFieldPreferences(data.contentlets);
						this.exportData = CrudApp.textUtils.csvOutput(this.exportData, this.selectedCT, this.exportOptions.fields);
					}
				} else if (this.exportFormat == 'table') {
					this.exportOptions.view = 'html';
					if (Object.prototype.toString.call(data) === '[object XMLDocument]') {
						this.getExportData();
					} else {
						this.exportData = this.syncFieldPreferences(data.contentlets);
						this.exportData = CrudApp.textUtils.tableOutput(this.exportData, this.selectedCT, this.exportOptions.fields);
					}
				}
			}
		},
		syncFieldPreferences: function (data) {
			var syncedObject = [];
			if (this.version.dotcmsVersion > 3) {
				this.exportOptions.fields.forEach(function (element, index) {
					for (var i = 0; i < data.length; i++) {
						if (typeof syncedObject[i] == 'undefined') syncedObject[i] = {};
						syncedObject[i][element] = data[i][element];
					}
				});
				return syncedObject;
			} else {
				return data;
			}
		},
		getDisabledFields: function () {
			var vm = this;
			var disabledFields = [];
			var inData = this.exportData;
			this.fields.forEach(function (element) {
				if (vm.exportOptions.fields.indexOf(element.variable) === -1) {
					disabledFields.push(element.variable);
				}
			});
			return disabledFields;
		}
	},
	watch: {
		ctName: function (val) {
			if (this.version.dotcmsVersion > 3) {
				this.getCTFields();
			}
		},
		exportFormat: function (val) {
			this.setOutput();
		}
	}
});


Vue.component('queryImportBox', {
	template: "#query-import-box",
	props: ["ct", "version"],
	data: function () {
		return {
			ctName: null,
			selectedCT: null,
			fields: null,
			textData: null,
			importErrors: null,
			isImporting: false,
			itemsToImport: null,
			importState: null,
			showBackButton: false,
			importOptions: {
				saveMode: 'publish',
				workflowName: '',
				workflowComment: '',
				workflowAssignee: '',
				inMode: 'POST',
				format: 'json',
				view: 'plain'
			},
		}
	},
	methods: {
		getCTFields: function () {
			for (var i = 0; i < this.ct.length; i++) {
				if (this.ct[i].variable === this.ctName) {
					this.fields = this.ct[i].fields;
				}
			}
			this.fields.unshift({
				'name': 'Identifier',
				'variable': 'identifier',
				'dataType': 'TEXT'
			});
		},
		importQueue: function () {
			// CrudApp.sessionLog.openLogWindow();
			CrudApp.sessionLog.addEntry("importQueue(): Starting Import Queue", 3);
			var vm = this;
			if (this.textData && typeof this.textData === "string" && this.textData.length > 0) {
				try {
					var inData = JSON.parse(this.textData);
				} catch (error) {
					this.importErrors = "Parse Error: " + error.message;
					CrudApp.sessionLog.addEntry("importQueue(): Error Parsing text: " + error.message , 1);
					return 1;
				}

				// Data appears to be good, lets proceed
				if (Object.prototype.toString.call(inData) === '[object Array]') {

					inData.forEach(function (element) {
						element.stName = vm.ctName;
					});

					this.itemsToImport = inData.length;
					this.isImporting = true;
					this.importErrors = null;
					this.importState = [];

					for (var i = 0; i < inData.length; i++) {
						// Lets stagger the requests to prevent flooding
						this.jsonStaggerImportQueue(inData[i], i);
					}
				}
			}
		},
		jsonStaggerImportQueue: function (data, i) {
			var vm = this;
			setTimeout(function() {
				vm.jsonImport(data, i);
			}, (110 * i));
		},
		jsonImport: function (importData, id) {
			vm = this;
			if (this.isImporting) {
				$.ajax({
					method: vm.importOptions.inMode,
					data: JSON.stringify(importData),
					url: '/api/content/' + vm.importOptions.saveMode + '/1',
					contentType: 'application/json',
					success: function(data, status, xhr) {
						vm.importState.push({'id': id, 'message': xhr.statusText, 'responseCode': xhr.status});
						CrudApp.sessionLog.addEntry("jsonImport(): Import Success " + id, 3);
					},
					error: function (status, xhr, error) {
						vm.importState.push({'id': id, 'message': status.responseText, 'responseCode': status.status});
						CrudApp.sessionLog.addEntry("jsonImport(): Import Error" + status.responseText, 1);
					}
				});
			}
		},
		importDone: function () {
			this.itemsToImport = null;
			this.isImporting = false;
			this.importErrors = null;
			this.importState = null;
		}
	},
	watch: {
		ctName: function (val) {
			for (var i = 0; i < this.ct.length; i++) {
				if (this.ct[i].variable === this.ctName) {
					this.selectedCT = this.ct[i];
				}
			}
			this.getCTFields();
		},
		importState: function (val) {
			if (Object.prototype.toString.call(this.importState) === '[object Array]') {
				if (this.importState.length === this.itemsToImport) {
					this.showBackButton = true;
				}
			}
		}
	}
});


Vue.component('import-form', {
	template: '#import-form',
	props: ["selectedCT", "ct", "importOptions", "ctName"],
	data: function () {
		return {
			importForm: [],
			hostId: dotHostId,
			formData: null,
			formFiles: []
		}
	},
	methods: {
		generateFormMetadata: function () {
			this.importForm = [];
			for (var i = 0; i < this.currentCT.fields.length; i++) {
				var element = this.currentCT.fields[i];

				if (element.variable != 'identifier') {
					if (element.dataType == 'TEXT' || element.dataType == 'INTEGER' || element.dataType == 'FLOAT' ) {
						if (element.clazz == "com.dotcms.contenttype.model.field.ImmutableImageField") {
							this.importForm.push({
								ele: "input",
								type: "file",
								size: "small-4",
								smaller: false,
								id: element.variable,
								label: element.name,
								fieldType: element.clazz.replace(/(com\.dotcms\.contenttype\.model\.field\.)+/g,""),
								value: null
							});
						} else if (element.clazz == "com.dotcms.contenttype.model.field.ImmutableFileField") {
							this.importForm.push({
								ele: "input",
								type: "file",
								size: "small-4",
								smaller: false,
								id: element.variable,
								label: element.name,
								fieldType: element.clazz.replace(/(com\.dotcms\.contenttype\.model\.field\.)+/g,""),
								value: null
							});
						} else if (element.clazz == "com.dotcms.contenttype.model.field.ImmutableDateTimeField") {
							this.importForm.push({
								ele: "input",
								type: "datetime",
								size: "small-4",
								id: element.variable,
								label: element.name,
								fieldType: element.clazz.replace(/(com\.dotcms\.contenttype\.model\.field\.)+/g,""),
								value: null
							});
						} else {
							this.importForm.push({
								ele: "input",
								type: "text",
								size: "small-4",
								id: element.variable,
								label: element.name,
								fieldType: element.clazz.replace(/(com\.dotcms\.contenttype\.model\.field\.)+/g,""),
								value: null
							});
						}
					} else if (element.dataType == 'LONG_TEXT') {
						this.importForm.push({
							ele: "textarea",
							type: "textarea",
							size: "small-9",
							id: element.variable,
							label: element.name,
							fieldType: element.clazz.replace(/(com\.dotcms\.contenttype\.model\.field\.)+/g,""),
							value: null
						});
					} else if (element.dataType == 'SYSTEM') {
						if (element.clazz == "com.dotcms.contenttype.model.field.ImmutableHostFolderField") {
							this.importForm.push({
								ele: "input",
								type: "text",
								size: "small-4",
								id: element.variable,
								label: element.name,
								fieldType: element.clazz.replace(/(com\.dotcms\.contenttype\.model\.field\.)+/g,""),
								value: null
							});
						} else if (element.clazz == "com.dotcms.contenttype.model.field.ImmutableBinaryField") {
							this.importForm.push({
								ele: "input",
								type: "file",
								size: "small-4",
								smaller: false,
								id: element.variable,
								label: element.name,
								fieldType: element.clazz.replace(/(com\.dotcms\.contenttype\.model\.field\.)+/g,""),
								value: null
							});
						}
					}
				}
			}
		},
		inputChange: function (e) {
			if (e.target && e.target.type == "file") {
				if (e.target.files && e.target.files[0]) {
					this.formFiles.push({ "id": e.target.name, "value": e.target.files[0] });
				}
			}
		},
		addHostId: function (element) {
			element.value = this.hostId;
		},
		getFormData: function () {
			this.formData = new FormData();
			this.formData.set("stName", this.ctName);
			for (let index = 0; index < this.importForm.length; index++) {
				const element = this.importForm[index];
				if (element.value) {
					if (element.type != 'file') {
						this.formData.set(element.id, element.value);
					}
				}
			}
			for (let index = 0; index < this.formFiles.length; index++) {
				const element = this.formFiles[index];
				if (element.id && element.value) {
					this.formData.set(element.id, element.value);
				}
			}
			return this.formData;
		},
		submitImportForm: function () {
			this.getFormData();
			var vm = this;
			$.ajax({
				url: '/api/content/' + this.importOptions.saveMode + '/1',
				method: this.importOptions.inMode,
				data: this.formData,
				cache: false,
				contentType: false,
				processData: false,
				success: function (data) {
					CrudApp.sessionLog.addEntry("submitImportForm(): Import Success", 3);
				},
				error: function (status, xhr, error) {
					CrudApp.sessionLog.addEntry("submitImportForm(): Import Error" + status.responseText, 1);
				}
			})
		}
	},
	mounted: function () {
		this.generateFormMetadata();
	},
	computed: {
		currentCT: function () {
			return this.selectedCT;
		}
	},
	watch: {
		currentCT: function (val) {
			this.generateFormMetadata();
		}
	}
});


Vue.component('queryOutput', {
	template: "#query-output",
	props: ["exportData", "exportFormat", "exportOptions"]
});


Vue.component('structureImportBox', {
	template: '#structure-import-box',
	props: ["ct"],
	data: function () {
		return {
			importErrors: null,
			importMode: 'json',
			importText: null,
			importForm: {},
			importedStructure: null
		}
	},
	methods: {
		getImportText: function () {
			try {
				var jsonData = JSON.parse(this.importText);
			} catch (e) {
				this.importErrors = e.message;
				return;
			}
			return jsonData;
		},
		importStructureJson: function () {
			// CrudApp.sessionLog.openLogWindow();
			CrudApp.sessionLog.addEntry("structureImportBox importStructureJson(): Starting CT import", 3);
			var vm = this;
			var importObj = this.getImportText();
			vm.importErrors = null;

			if (importObj.hasOwnProperty('structure')) {
				if (importObj.structure.hasOwnProperty('clazz') && importObj.structure.hasOwnProperty('host') && importObj.structure.hasOwnProperty('name') && importObj.structure.hasOwnProperty('owner')) {
					$.ajax({
						method: 'POST',
						data: JSON.stringify(importObj.structure),
						contentType: 'application/json',
						url: '/api/v1/contenttype',
						success: function (data) {
							if (data.hasOwnProperty('entity') && data.entity[0] && data.entity[0].id) {
								vm.importedStructure = data.entity[0];
								CrudApp.sessionLog.addEntry("structureImportBox importStructureJson(): Structure imported", 3);
								vm.importStructureFieldsJson();
							}
						},
						error: function (status, xhr, error) {
							this.importErrors = status.status + ": " + status.message;
						}
					});
				}
			} else {
				CrudApp.sessionLog.addEntry("Import data missing structure identifier/var", 1);
			}
		},
		importStructureFieldsJson: function () {
			CrudApp.sessionLog.addEntry("structureImportBox importStructureFieldsJson(): Starting CT Fields import", 3);
			var vm = this;
			var importObj = this.getImportText();
			var errors = [];
			var successes = [];
			vm.importErrors = null;

			if (importObj.hasOwnProperty('fields') && Object.prototype.toString.call(importObj.fields) === '[object Array]') {
				for (var i = 0; i < importObj.fields.length; i++) {
					importObj.fields[i].contentTypeId = vm.importedStructure.id;
					$.ajax({
						method: 'POST',
						data: JSON.stringify(importObj.fields[i]),
						contentType: 'application/json',
						url: '/api/v1/contenttype/' + vm.importedStructure.id + '/fields',
						success: function (data) {
							if (data.hasOwnProperty('entity') && data.entity && data.entity.id) {
								successes.push(importObj[i]);
								CrudApp.sessionLog.addEntry("structureImportBox importStructureFieldsJson(): CT Field Imported", 3);
							} else {
								CrudApp.sessionLog.addEntry("structureImportBox importStructureFieldsJson(): Field Import Return Data invalid", 1);
							}
						},
						error: function (status, xhr, error) {
							errors.push(importObj[i]);
							CrudApp.sessionLog.addEntry("structureImportBox importStructureFieldsJson(): error: " + error , 1);
						}
					});
				}
			}
		}
	},
	watch: {
		structureImported: function (val) {
			this.importStructureFieldsJson();
		}
	}
});


Vue.component('structureExportBox', {
	template: '#structure-export-box',
	props: ["ct"],
	data: function () {
		return {
			selectedCT: null,
			fields: null,
			contentType: null,
			structureExportData: null
		}
	},
	methods: {
		getCTFields: function () {
			var vm = this;
			$.ajax({
				method: 'GET',
				url: '/api/v1/contenttype/' + vm.selectedCT + '/fields',
				contentType: 'application/json',
				success: function (data) {
					vm.fields = data.entity;
				}
			});
		},
		getSelectedCTData: function () {
			for (var i = 0; i < this.ct.length; i++) {
				if (this.selectedCT == this.ct[i].variable) {
					return this.ct[i];
				}
			}
		},
		constructOutputData: function () {
			var curStructure = this.getSelectedCTData();
			var out = {
				structure: {
					"clazz": curStructure.clazz,
					"defaultType": curStructure.defaultType,
					"name": curStructure.name,
					"description": curStructure.description,
					"host": curStructure.host,
					"owner": "dotcms.org.1",
					"variable": curStructure.variable,
					"fixed": curStructure.fixed,
					"system": false,
					"folder": curStructure.folder
				},
				fields: []
			};

			for (var i = 0; i < this.fields.length; i++) {
				out.fields.push(
					{
						"clazz" : this.fields[i].clazz,
						"contentTypeId" : curStructure.variable,
						"dataType" : this.fields[i].dataType,
						"name" : this.fields[i].name,
						"defaultValue" : this.fields[i].defaultValue,
						"regexCheck" : this.fields[i].regexCheck,
						"hint" : this.fields[i].hint,
						"sortOrder" : this.fields[i].sortOrder,
						"readOnly" : this.fields[i].readOnly,
						"fixed" : this.fields[i].fixed,
						"required" : this.fields[i].required,
						"searchable" : this.fields[i].searchable,
						"indexed" : this.fields[i].indexed,
						"listed" : this.fields[i].listed,
						"unique" : this.fields[i].unique,
						"variable": this.fields[i].variable
					}
				);
			}
			this.structureExportData = out;
		},
	},
	watch: {
		selectedCT: function (val) {
			this.getCTFields();
		},
		fields: function (val) {
			this.constructOutputData();
		}
	}
});

Vue.component('dotApi', {
	template: '#dot-api',
	props: ["ct"],
	data: function () {
		return {
			query: {
				uri: null,
				params: null,
				method: null,
				dataType: null,
				contentType: null,
				payload: null
			},
			showOutput: false,
			queryResponse: null
		}
	},
	methods: {
		sendRequest: function () {
			CrudApp.sessionLog.addEntry("dotApi sendRequest(): Sending Request", 3);

			this.showOutput = true;
			var vm = this;
			var uriParams = '';
			if (this.query.uri) {
				uriParams = uriParams + this.query.uri;
			}
			if (this.query.params) {
				uriParams = uriParams + "?" + this.query.params;
			}
			$.ajax({
				method: this.query.method,
				url: uriParams,
				contentType: this.query.contentType,
				dataType: this.query.dataType,
				success: function (data) {
					CrudApp.sessionLog.addEntry("dotApi sendRequest(): Request Callback success", 3);
					vm.showOutput = true;
					vm.queryResponse = data;
				},
				error: function (status, xhr, error) {
					CrudApp.sessionLog.addEntry("dotApi sendRequest(): Request Callback Failed", 1);
					vm.showOutput = true;
					vm.queryResponse = status + ' ' + xhr + ' ' + error;
				}
			});
		},
		hideResponse: function () {
			this.showOutput = false;
		}
	}
});


CrudApp.vue = new Vue({
	el: "#crud-app",
	data: function () {
		return {
			pane: 'default',
			ct: null,
			ctFields: null,
			hasMarkdown: false,
			consoleInputListener: false,
			users: null,
			dotcms: null,
			dotcmsVersion: null,
			host: null,
			result: null,
			version: {
				dotVersion: window.dotVersion,
				dotcmsVersion: window.dotcmsVersion
			}
		}
	},
	methods: {
		setPane: function (pane) {
			this.pane = pane;
		},
		getCTList: function () {
			var vm = this;
			$.ajax({
				method: 'GET',
				url: '/api/v1/contenttype?per_page=-1',
				contentType: 'application/json',
				success: function (data) {
					if (CrudApp.hasEntityList(data)) {
						vm.ct = data.entity;
						CrudApp.sessionLog.addEntry("getCTList(): Retrieved CT List", 3);
					} else {
						CrudApp.sessionLog.addEntry("getCTList(): Return data invalid", 1);
					}
				}
			});
		},
		getCTFieldList: function () {
			if (Array.isArray(this.ct)) {
				this.ctFields = [];
				var vm = this;
				for (var i = 0; i < this.ct.length; i++) {
					$.ajax({
						method: 'GET',
						url: '/api/v1/contenttype/' + vm.ct[i].id + '/fields' ,
						contentType: 'application/json',
						success: function (data) {
							if (CrudApp.hasEntityList(data)) {
								CrudApp.sessionLog.addEntry("getCTFieldList(): Retrieved CT Field List", 3);
								vm.ctFields.push(data.entity);
							} else {
								CrudApp.sessionLog.addEntry("getCTFieldList(): Return data invalid", 1);
							}
						}
					});
				}
			}
		},
		mergeStructureData: function () {
			for (var i = 0; i < this.ct.length; i++) {
				for (var n = 0; n < this.ctFields.length; n++) {
					if (this.ctFields[n][0]) { // Avoid Structures without Fields
						if (this.ctFields[n][0].contentTypeId == this.ct[i].id) {
							this.ct[i].fields = this.ctFields[n];
						}
					}
				}
			}
		},
		getUserList: function () {
			var vm = this;
			$.ajax({
				method: 'GET',
				url: '/api/v1/users/filter/start/0/limit/false/includeAnonymous/true/includeDefault/true',
				contentType: 'application/json',
				success: function (data) {
					if (data.errors.length === 0 && data.entity) {
						vm.users = data.entity.data;
						CrudApp.sessionLog.addEntry("getUserList(): Retrieved User List", 3);
					} else {
						CrudApp.sessionLog.addEntry("getUserList(): Return data invalid", 1);
					}
				}
			});
		},
		getHostData: function () {
			var vm = this;
			$.ajax({
				method: 'GET',
				url: '/api/v1/site/currentSite',
				contentType: 'application/json',
				success: function (data) {
					if (CrudApp.hasEntityList(data)) {
						vm.host = data.entity;
						CrudApp.sessionLog.addEntry("getHostData(): Retrieved Host Data", 3);
					} else {
						CrudApp.sessionLog.addEntry("getHostData(): Return data invalid", 1);
					}
				}
			});
		},
		navItemActive: function (navItem) {
			if (this.pane == navItem) {
				return true;
			} else {
				return false;
			}
		},
		setConsoleInputListener: function () {
			this.consoleInputListener = true;
			$("#ConsoleQuery").on('keydown', function(e) {
				vcKeyQueue();
				if(e.keyCode === 9) {
					e.preventDefault();
					var start = this.selectionStart;
					var end = this.selectionEnd;
					var value = $(this).val();
					$(this).val(value.substring(0, start)
								+ "\t"
								+ value.substring(end));
					this.selectionStart = this.selectionEnd = start + 1;
				} else if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
					e.preventDefault();
					vcSendQuery();
				}
			});
		},
		getDwrSessionId: function () {
			var vm = this;
			var dwrPayload = 	'callCount=1' + "\n" +
								'c0-scriptName=__System' + "\n" +
								'c0-methodName=generateId' + "\n" +
								'c0-id=0' + "\n" +
								'batchId=0' + "\n" +
								'instanceId=0' + "\n" +
								'page==%2Fc%2Fportal%2Flayout%3F' + "\n" +
								'scriptSessionId=' + "\n" +
								'windowName=detailFrame';
			$.ajax({
				method: 'POST',
				dataType: "text",
				xhrFields: { withCredentials: true },
				url: '/dwr/call/plaincall/__System.generateId.dwr',
				data: dwrPayload,
				success: function (data) {
					if (data.indexOf('r.handleCallback') > 0) {
						CrudApp.sessionLog.addEntry("getDwrSessionId(): Retrieved DWRSESSIONID Success", 3);
						vm.extractDwrSessionId(data.substring((data.indexOf('r.handleCallback') + 'r.handleCallback'.length + 1)));
					} else {
						CrudApp.sessionLog.addEntry("getDwrSessionId(): DWRSESSIONID Unable to parse data", 1);
					}
				}
			});
		},
		extractDwrSessionId: function (str) {
			var out = "";
			out = str.substr(0, str.indexOf('");'));
			out = out.replace(/\"[0-9]{1}\"/g, '');
			out = out.replace(/\,/g, '');
			out = out.replace(/\"/g, '');
			CrudApp.dwrsessionid = out;
			CrudApp.dwrBatchId++;
			Cookies.set('DWRSESSIONID', out, { expires: 1 });
		},
		getDotcmsInfo: function () {
			if (!CrudApp.dotcms) {
				var vm = this;
				$.ajax({
					url: '/api/v1/appconfiguration',
					method: 'GET',
					success: function (data) {
						if (CrudApp.hasEntityList(data)) {
							CrudApp.dotcms = data.entity;
							vm.dotcms = data.entity;
							vm.getDotcmsVersion();
						}
					}
				});
			}
		},
		getDotcmsVersion: function () {
			if (CrudApp.dotcmsVersion) {
				this.dotcmsVersion = CrudApp.dotcmsVersion;
			} else {
				if (this.dotcmsConfigHasReleaseVersion()) {
					this.dotcmsVersion = CrudApp.util.determineDotcmsVersion(this.dotcms.config.releaseInfo.version);
				} else {
					this.dotcmsVersion = null;
				}
			}
		},
		dotcmsConfigHasReleaseVersion: function () {
			if (this.dotcms && this.dotcms.config) {
				if (this.dotcms.config.releaseInfo && this.dotcms.config.releaseInfo.version) {
					if (typeof this.dotcms.config.releaseInfo.version == 'string') {
						return true;
					}
				}
			}
			return false;
		}
	},
	watch: {
		pane: function (val) {
			if (val === 'console') {
				if (this.consoleInputListener === false) {
					vm = this;
					setTimeout ("vm.setConsoleInputListener()", 1000);
				}
			}
		},
		ct: function (val) {
			this.getCTFieldList();
		},
		ctFields: function (val) {
			if (this.ct.length == this.ctFields.length) {
				this.mergeStructureData();
			}
		}
	},
	mounted: function () {
		this.dotcmsVersion = dotcmsVersion;
		if (this.dotcmsVersion > 3) {
			this.getCTList();
			this.getUserList();
			this.getHostData();
		}
		if (!Cookies.get('DWRSESSIONID')) {
			this.getDwrSessionId();
		} else {
			CrudApp.dwrsessionid = Cookies.get('DWRSESSIONID');
		}
		if (this.dotcmsVersion > 3) {
			this.getDotcmsInfo();
		}
	}
});



// Polys
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}