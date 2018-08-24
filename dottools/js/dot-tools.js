/* dotCRUD */
CrudApp.hasEntityList = function (data) {
	if (data.hasOwnProperty('entity') && data.entity) {
		if (Object.prototype.toString.call(data.entity) === '[object Array]') {
			return true;
		}
	}
	return false;
}

CrudApp.jsonFields = function (data, stName, enabledFields) {
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
}

CrudApp.cURLOutput = function (data, stName, enabledFields) {
	var out = '';
	data.forEach(function (element) {
		out += 'curl -i -v -n -XPUT -H "Content-Type:application/json" -d "{';
		out += CrudApp.jsonFields(element, stName, enabledFields);
		out += '};" ';
		out += 'https://' + location.host + '/api/content/publish/1';
		out += "\n";
	});
	return out;
}

CrudApp.csvFields = function (data, stName, enabledFields) {
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
}

CrudApp.csvOutput = function (data, stName, enabledFields) {
	var out = 'stName';
	enabledFields.forEach (function (element) {
		out += ',' + element;
	});
	out += "\n";
	data.forEach(function (element) {
		out += CrudApp.csvFields(element, stName, enabledFields);
		out += "\n";
	});
	return out;
}

CrudApp.tableFields = function (data, stName, enabledFields) {
	var out = '';
	out +=  '<td>' + stName + '</td>';
	for (var i = 0; i < enabledFields.length; i++) {
		out += '<td>' + data[enabledFields[i]] + '</td>';
	}
	return out;
}

CrudApp.tableOutput = function (data, stName, enabledFields) {
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
		out += CrudApp.tableFields(element, stName, enabledFields);
		out += '</tr>' + "\n";
	});
	out += '</tbody>' + "\n";
	out += '</table>' + "\n";
	return out;
}


CrudApp.util = {};

CrudApp.util.pruneInodes = function (contentlet) {
	console.log('Getting List of Inodes...');
	var inodeList = [];
	var inodesToDelete = [];
	$.ajax({
		method: 'GET',
		url: '/html/portlet/ext/contentlet/contentlet_versions_inc.jsp?contentletId=' + contentlet,
		contentType: 'text/html',
		success: function (data) {
			console.log('Retrieved list success, parsing data...');
			$('#data-dump').html(data);
			$('#data-dump .listingTable tr').each(function () {
				$(this).children('td:last-child').each(function () {
					inodeList.push($(this).text());
				});
			});
			console.log('Have list, sending to queue...');
			if (inodeList.length > 2) {
				CrudApp.util.pruneInodesQueue(inodeList.slice(2));
			}
		}
	});
}

CrudApp.util.pruneInodesQueue = function (inodes) {
	console.log('Starting Queue...');
	console.log(inodes);
	for (var i = 0; i < inodes.length; i++) {
		CrudApp.util.deleteInode(inodes[i], (i * 250));
	}
}

CrudApp.util.deleteInode = function (inode, timeout) {
	console.log('Queuing  ', inode);
	setTimeout(function () {
		$.ajax({
			method: 'GET',
			url: '/c/portal/layout?p_l_id=b7ab5d3c-5ee0-4195-a17e-8f5579d718dd&p_p_id=site-browser&p_p_action=1&p_p_state=maximized&p_p_mode=view&_site_browser_struts_action=%2Fext%2Fcontentlet%2Fedit_contentlet&cmd=deleteversion&&referer=%2Fc%2Fportal%2Flayout%3Fp_l_id%3Db7ab5d3c-5ee0-4195-a17e-8f5579d718dd&inode=' + inode,
			contentType: 'text/html',
			success: function (data) {
				console.log('Deleted Inode: ', inode);
			}
		});
	}, timeout);
}


Vue.component('queryBox', {
	template: "#query-box",
	props: ["ct"],
	data: function () {
		return {
			rawData: null,
			selectedCT: "",
			fields: null,
			rawFields: null,
			exportData: null,
			exportFormat: 'json',
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
			$.ajax({
				method: 'GET',
				url: '/api/v1/contenttype/' + vm.selectedCT + '/fields',
				contentType: 'application/json',
				success: function (data) {
					if (CrudApp.hasEntityList(data)) {
						data.entity.unshift({
							'name': 'Identifier',
							'variable': 'identifier',
							'dataType': 'TEXT'
						});
						vm.rawfields = data.entity;
						vm.fields = vm.rebuildFieldsList(data.entity);
						vm.preSelectCheckboxes();
					}
				}
			});
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
				apiUrl += '+contentType:' + encodeURIComponent(this.selectedCT) + '%20';
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
					vm.setOutput();
				},
				error: function (xhr, status, error) {
					vm.exportData = xhr;
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
						this.exportData = CrudApp.cURLOutput(this.exportData, this.selectedCT, this.exportOptions.fields);
					}
				} else if (this.exportFormat == 'csv') {
					this.exportOptions.view = 'plain';
					if (Object.prototype.toString.call(data) === '[object XMLDocument]') {
						this.getExportData();
					} else {
						this.exportData = this.syncFieldPreferences(data.contentlets);
						this.exportData = CrudApp.csvOutput(this.exportData, this.selectedCT, this.exportOptions.fields);
					}
				} else if (this.exportFormat == 'table') {
					this.exportOptions.view = 'html';
					if (Object.prototype.toString.call(data) === '[object XMLDocument]') {
						this.getExportData();
					} else {
						this.exportData = this.syncFieldPreferences(data.contentlets);
						this.exportData = CrudApp.tableOutput(this.exportData, this.selectedCT, this.exportOptions.fields);
					}
				}
			}
		},
		syncFieldPreferences: function (data) {
			var syncedObject = [];
			this.exportOptions.fields.forEach(function (element, index) {
				for (var i = 0; i < data.length; i++) {
					if (typeof syncedObject[i] == 'undefined') syncedObject[i] = {};
					syncedObject[i][element] = data[i][element];
				}
			});
			return syncedObject;
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
		selectedCT: function (val) {
			this.getCTFields();
		},
		exportFormat: function (val) {
			this.setOutput();
		}
	}
});


Vue.component('queryImportBox', {
	template: "#query-import-box",
	props: ["ct"],
	data: function () {
		return {
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
			var vm = this;
			$.ajax({
				method: 'GET',
				url: '/api/v1/contenttype/' + vm.selectedCT + '/fields',
				contentType: 'application/json',
				success: function (data) {
					if (CrudApp.hasEntityList(data)) {
						data.entity.unshift({
							'name': 'Identifier',
							'variable': 'identifier',
							'dataType': 'TEXT'
						});
						vm.fields = data.entity;
					}
				}
			});
		},
		importQueue: function () {
			var vm = this;
			if (this.textData && typeof this.textData === "string" && this.textData.length > 0) {
				try {
					var inData = JSON.parse(this.textData);	
				} catch (error) {
					this.importErrors = "Parse Error: " + error.message;
					return 1;
				}
				
				// Data appears to be good, lets proceed
				if (Object.prototype.toString.call(inData) === '[object Array]') {
					
					inData.forEach(function (element) {
						element.stName = vm.selectedCT;
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
			}, (200 * i));
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
					},
					error: function (status, xhr, error) {
						vm.importState.push({'id': id, 'message': status.responseText, 'responseCode': status.status});
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
		selectedCT: function (val) {
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
	props: ['selectedCT', 'fields', 'importOptions'],
	data: function () {
		return {
			importForm: []
		}
	},
	mounted: function () {
		var vm = this;
		this.fields.forEach(function (element) {
			vm.importForm.push({
				'name': element.name,
				'variable': element.variable,
				'dataType': element.dataType,
				'value': null
			});
		});
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
								vm.importStructureFieldsJson();
							}
						},
						error: function (status, xhr, error) {
							this.importErrors = status.status + ": " + status.message;
						}
					});
				}
			}
		},
		importStructureFieldsJson: function () {
			var vm = this;
			var importObj = this.getImportText();
			var errors = [];
			var successes = [];
			vm.importErrors = null;

			if (importObj.hasOwnProperty('fields') && Object.prototype.toString.call(importObj.fields) === '[object Array]') {
				for (var i = 0; i < importObj.fields.length; i++) {
					importObj.fields[i].contentTypeId = vm.importedStructure.id;
					console.log('Sending: ', importObj.fields[i]);
					$.ajax({
						method: 'POST',
						data: JSON.stringify(importObj.fields[i]),
						contentType: 'application/json',
						url: '/api/v1/contenttype/' + vm.importedStructure.id + '/fields',
						success: function (data) {
							if (data.hasOwnProperty('entity') && data.entity[0] && data.entity[0].id) {
								successes.push(importObj[i]);
							}
						},
						error: function (status, xhr, error) {
							errors.push(importObj[i]);
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


CrudApp.vue = new Vue({
	el: "#crud-app",
	data: function () {
		return {
			pane: 'default',
			ct: null,
			hasMarkdown: false,
			consoleInputListener: false
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
				url: '/api/v1/contenttype',
				contentType: 'application/json',
				success: function (data) {
					if (CrudApp.hasEntityList(data)) {
						vm.ct = data.entity;
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
					console.log('here');
				} else if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
					e.preventDefault();
					vcSendQuery();
				}
			});
			
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
		}
	},
	mounted: function () {
		this.getCTList();
	}
});

/* Velocity Console */

function addToConsole (id) {
    var out  = '#' + '#' + $('#'+'wm-name-'+id).val() + "\n";
        out += $('#'+'wm-vtl-'+id).val().replace(/\\/g,'') + "\n";
        out += $('#'+'wm-var-'+id).val() + "\n";
    $("#better-console-query").text(out);
}
function insertPreset(presetName) {
    $("#better-console-query").text(unescape(document.getElementById(presetName).innerHTML));
}
/* IMPORTANT: Velocity is processed via an XHR request to another page, this page eval's
 *            the code and return output.
*/
var VelocityProcessorEndpoint = './vel-parse.jsp';
var benchStart, benchFinish, liveUpdate;
var lastDispatch = 0;
var keyQueue = String("");

function vcHideEle(el) { $(el).addClass('hide'); }
function vcShowEle(el) { $(el).removeClass('hide'); }
function updateHistory(lastInput) {
	$('#history').prepend('<pre style="white-space: pre-wrap;">' + lastInput + '</pre><hr>');
}
function vcGetOutputHeight(data) {
	if (data) {
		var dataSplit = data.split(/\n/g);
		if (dataSplit.length && dataSplit.length > 0) {
			lineHeight = 30 + (dataSplit.length * 18);
		} else {
			lineHeight = 30 + (data.length * 18);
		}
		//lineHeight = lineHeight + ((data.length * 2) + 30);
		return String(lineHeight + "px");
	} else {
		return "60px";
	}

}
function vcLastDispatchDiff() {
	return Number(Date.now() - lastDispatch);
}
function vcOutputBenchmarks() {
	if (benchStart && benchFinish) {
		$('#bench').html('Last Request:' + (benchFinish - benchStart) + 'ms');
	}
}
function vcSendOutput(data) {
	if ($("input:radio[name ='outFormat']:checked").val() == 'preformatted') {
		vcHideEle('div.velocity-output');
		vcShowEle('div.velocity-output-pre');
		$('div.velocity-output-pre').html("<pre style=\"white-space: pre-wrap;\">"+data.replace(/(^\s+\b)+/m, '')+"</pre>");
		//$('div.velocity-output-pre').css('height', vcGetOutputHeight(data));
	} else {
		vcHideEle('div.velocity-output-pre');
		vcShowEle('div.velocity-output');
		$('div.velocity-output').html(data);
	}
}
function vcKeyQueue(e) {
	keyQueue = keyQueue + 'a';
}
function vcLiveUpdater() {
	if ($('#liveUpdate').prop('checked')) {
		if (!liveUpdate) {
			liveUpdate = setInterval(function () {
				if (keyQueue.length > 0) {
					vcSendQuery(); keyQueue = String("");
				}
			}, 400);
		}
	} else {
		if (liveUpdate) {
			clearInterval(liveUpdate);
			liveUpdate = null;
		}
	}
}
function vcIsLiveUpdateEnabled() {
	if (liveUpdate && $('#liveUpdate').prop('checked')) {
		return true;
	} else {
		return false;
	}
}
function vcIsVtlProcessEnabled() {
	return $('#vtlProcess').prop('checked');
}
function vcIsLoggingEnabled() {
	return $('#enableLogging').prop('checked');
}
function vcSendQuery() {
	if (!vcIsLiveUpdateEnabled()) {
		vcHideEle('textarea.velocity-output-pre');
		vcHideEle('div.velocity-output');
		vcShowEle('#spinnerConsole');
		$('textarea.velocity-output').val('');
		$('#enableLogging').prop('disabled', false);
		updateHistory($("#ConsoleQuery").val());
	} else {
		$('#enableLogging').prop('checked', false);
		$('#enableLogging').prop('disabled', true);
	}
	benchStart = Date.now();
	if (vcIsVtlProcessEnabled()) {
		if (vcLastDispatchDiff() > 500) {
			$.ajax({
				url: VelocityProcessorEndpoint,
				type: 'POST',
				withCredentials: false,
				data: {'q': 'vtlConsole', 's': $("#ConsoleQuery").val(), 'l': vcIsLoggingEnabled() },
				success: function (data) {
					console.log('callback success');
					benchFinish = Date.now(); vcOutputBenchmarks();
					lastDispatch = Date.now();
					vcHideEle('#spinnerConsole');
					vcSendOutput(data);
				},
				error: function (data, status, xhr) {
					vcHideEle('#spinnerConsole');
					vcSendOutput('Error:'+"\n"+'status:'+status+"\n"+'xhr:'+xhr+"\n"+'data:'+data+"\n");
				},
			});
			vcHideEle($('#flood-alert'));
			vcShowEle($('.console-send'));
		} else {
			vcShowEle($('#flood-alert'));
			vcHideEle($('.console-send'));
			setTimeout(function() { vcSendQuery() }, 1000);
		}
	} else {
		vcHideEle('#spinnerConsole');
		vcHideEle('textarea.velocity-output');
		vcShowEle('div.velocity-output');
		vcSendOutput($("#ConsoleQuery").val());
	}
}
