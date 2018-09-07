<%@page import="com.liferay.portal.model.*"%>
<%@page import="com.dotmarketing.util.PortletID"%>
<%@page import="com.dotmarketing.portlets.structure.model.Field"%>
<%@page import="com.dotmarketing.util.UtilMethods"%>
<%@page import="com.dotmarketing.business.APILocator"%>
<%@page import="java.util.GregorianCalendar"%>
<%@page import="java.util.Date"%>
<%@page import="java.util.Arrays"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="com.dotmarketing.util.Parameter"%>
<%@page import="com.dotmarketing.portlets.categories.model.Category"%>
<%@page import="com.dotmarketing.portlets.categories.business.CategoryAPI"%>
<%@page import="com.dotmarketing.business.APILocator"%>
<%@page import="com.dotmarketing.util.InodeUtils"%>
<%@page import="com.dotmarketing.exception.DotSecurityException"%>
<%@page import="com.dotmarketing.util.Logger"%>
<%@page import="com.dotmarketing.portlets.structure.business.FieldAPI"%>
<%@page import="com.dotmarketing.util.VelocityUtil"%>
<%@page import="com.dotmarketing.business.web.WebAPILocator"%>
<%@page import="com.dotmarketing.business.RoleAPI"%>
<%@page import="com.dotmarketing.portlets.contentlet.business.HostAPI"%>
<%@page import="com.dotmarketing.business.PermissionAPI"%>
<%@page import="com.dotmarketing.beans.Host"%>
<% 
String hostId = (String) session.getAttribute(com.dotmarketing.util.WebKeys.CMS_SELECTED_HOST_ID);
if (WebAPILocator.getUserWebAPI().isLoggedToBackend(request)) { 
%>
<!doctype html>
<html class="no-js" lang="en_US">
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js">
<!--<![endif]-->

<head>
	<title>dotTools</title>
	<link rel="stylesheet" href="css/fontawesome-all.css" />
	<link rel="stylesheet" href="css/foundation.css" />
	<link rel="stylesheet" href="css/dot-tools.css" />
	<style type="text/css">
		body {
			background-color: #222;
			color: #bbb;
			margin: 0;
			padding: 0;
			font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
			font-size: 14px;
		}
	</style>
</head>

<body>

	<div id="crud-app">
		<div class="grid-y medium-grid-frame">

			<div class="cell small-1 header medium-cell-block-container">
				<nav class="hover-underline-menu" data-menu-underline-from-center="data-menu-underline-from-center">
					<ul class="menu">
						<li><a v-bind:class="{'nav-active': navItemActive('default')}" v-on:click="setPane('default')">dotTools</a></li>
					</ul>
					<ul class="menu">
						<li>
							<a v-bind:class="{'nav-active': navItemActive('content-manager')}" v-on:click="setPane('content-manager')">Content Manager</a>
						</li>
						<li>
							<a v-bind:class="{'nav-active': navItemActive('console')}" v-on:click="setPane('console')">Console</a>
						</li>
						<li>
							<a v-bind:class="{'nav-active': navItemActive('content-import')}" v-on:click="setPane('content-import')">Content Import</a>
						</li>
						<li>
							<a v-bind:class="{'nav-active': navItemActive('content-export')}" v-on:click="setPane('content-export')">Content Export</a>
						</li>
						<li>
							<a v-bind:class="{'nav-active': navItemActive('structure-export')}" v-on:click="setPane('structure-export')">CT Export</a>
						</li>
						<li>
							<a v-bind:class="{'nav-active': navItemActive('structure-import')}" v-on:click="setPane('structure-import')">CT Import</a>
						</li>
						<li>
							<a v-bind:class="{'nav-active': navItemActive('api')}" v-on:click="setPane('api')">API</a>
						</li>
						<%-- <li>
							<a v-bind:class="{'nav-active': navItemActive('export')}" data-open="logWindow">Log</a>
						</li> --%>
					</ul>
					<ul class="menu">
						<li><a href="#" onclick="CrudApp.logout();">Logout</a></li>
					</ul>
				</nav>
			</div>

			<div class="cell small-9 medium-cell-block-y">


				<div v-if="pane == 'default'">
					
				</div>

				<div v-if="pane == 'content-manager'">
					<content-manager :ct="ct" :users="users"></content-manager>
				</div>

				<div v-if="pane == 'console'">
					<div class="console-wrapper">
						<form>
							<div class="grid-x grid-padding-x">
								<div class="cell shrink">
									<div>
										<h5>Options</h5>
										<input type="radio" name="outFormat" id="outFormat1" value="preformatted" checked="checked"><label for="outFormat1" title="Use preformatted output">Pre</label><br>
										<input type="radio" name="outFormat" id="outFormat2" value="html" /><label for="outFormat2" title="Outputs as HTML">HTML</label><br>
										<input type="checkbox" name="vtlProcess" id="vtlProcess" checked="checked" value="1"><label for="vtlProcess" code="Prcoess Velocity">Vel</label><br>
										<input type="checkbox" name="liveUpdate" id="liveUpdate" onclick="vcLiveUpdater()" value="1"><label for="liveUpdate" onclick="vcLiveUpdater()" title="Live update">Live</label><br>
										<input type="checkbox" name="enableLogging" id="enableLogging" value="1"><label for="enableLogging" title="Enable Logging">Log</label><br>
										<p><a class="button console-send" onclick="vcSendQuery()">Run</a></p>
										<span id="bench"></span>
									</div>
								</div>
								<div class="cell auto small-grid-collapse-x">
									<textarea class="velocity-console" name="ConsoleQuery" id="ConsoleQuery" rows="10" cols="60" spellcheck="false"></textarea>
									<div id="spinnerConsole" class="loader hide"></div>
									<span id="flood-alert" class="hide" style="color:#FF3333;">Flood control triggered... Delaying XHR by 1sec</span>
								</div>
							</div>
						</form>
						<div class="velocity-output-pre hide" contentEditable="true"></div>
						<div class="velocity-output hide"></div>
						<div class="helpful-area">
							<div class="console-history">
								<h2>History</h2>
								<div id="history"></div>
							</div>
							<div class="console-snippets">
								<div id="snippet-markdown"></div>
							</div>
						</div>
					</div>

					<div style="display:none;" id="markdown">

					</div>

				</div>
				<div v-if="pane == 'content-import'">
					<query-import-box :ct="ct"></query-import-box>
				</div>
				<div v-if="pane == 'content-export'">
					<query-box :ct="ct"></query-box>
				</div>
				<div v-if="pane == 'structure-import'">
					<structure-import-box></structure-import-box>
				</div>
				<div v-if="pane == 'structure-export'">
					<structure-export-box :ct="ct"></structure-export-box>
				</div>
				<div v-if="pane == 'api'">
					<dot-api :ct="ct"></dot-api>
				</div>
			</div>

			<div class="cell small-2 footer medium-cell-block-y" style="margin-top:1rem;">
				<div id="session-log"></div>
			</div>

		</div>
	
	</div>

<%-- <div class="reveal large" id="logWindow" data-reveal>
	<h3>Session Log</h3>

	<button class="close-button" data-close aria-label="Close modal" type="button">
		<span aria-hidden="true">&times;</span>
	</button>
</div> --%>


<script type="text/x-template" id="content-manager">
		<div>
		<h5 class="text-center">Content Manager</h5>

		<div class="grid-x grid-padding-x">
			<div class="cell small-12">
				<input type="text" v-model="query.query" placeholder="Lucene Query" spellcheck="false">
			</div>
			<div class="cell small-12">
				<input type="text" v-model="query.query2" placeholder="Lucene Query" spellcheck="false">
			</div>
		</div>
		<div class="grid-x grid-padding-x">
			<div class="cell small-3">
				<input type="text" v-model="query.limit" placeholder="Limit" value="0">
			</div>
			<div class="cell small-3">
				<input type="text" v-model="query.offset" placeholder="Offset" value="0">
			</div>
			<div class="cell small-3">
				<input type="text" v-model="query.sort" placeholder="Sort" value="modDate desc">
			</div>
			<div class="cell small-3">
				<a class="button" v-on:click="sendQuery()">Go</a>
			</div>
		</div>
		

		<div v-if="results">
			<content-list :ct="ct" :results="results" :users="users"></content-list>
		</div>
	</div>
</script>

<script type="text/x-template" id="content-list">
	<div>
		<div v-if="results">
			
			<div class="grid-x grid-padding-x">
				<div class="cell small-6">
					<div style="height: 57px;">
						<div v-if="selectedContentlets.length > 0" style="display:flex; align-items: baseline;">
							<span style="margin-right:1rem;">Actions: </span>
							<a class="button primary small button-margin-right" v-on:click="contentActions('publish', this)">Publish</a>
							<a class="button primary small button-margin-right" v-on:click="contentActions('unpublish', this)">Unpublish</a>
							<a class="button primary small button-margin-right" v-on:click="contentActions('archive', this)">Archive</a>
							<a class="button primary small button-margin-right" v-on:click="contentActions('unarchive', this)">Unarchive</a>
							<a class="button primary small button-margin-right" v-on:click="contentActions('delete', this)">Delete</a>
							<a class="button primary small button-margin-right" v-on:click="contentActions('prune', this)">Prune Inodes</a>
						</div>
					</div>
				</div>
				<div class="cell small-6" v-if="actionSelected && selectedContentlets.length > 0">
					<a class="button success button-margin-right" v-on:click="confirmAction()">Confirm {{ actionSelected }} on {{ selectedContentlets.length }} contentlet(s)?</a>
					<a class="button alert" v-on:click="contentActions(null, this)">Cancel</a>
				</div>
			</div>

			<div class="export-data-html">
				<table>
					<thead>
						<tr>
							<th>
								<input type="checkbox" title="Invert Selection" v-on:click="invertSelected()" style="margin-bottom:0;vertical-align:middle;">
							</th>
							<th>Title</th>
							<th>Type</th>
							<th>Lang ID</th>
							<th>Last Editor</th>
							<th>Last Edit Date</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="result in results">
							<td><input type="checkbox" v-model="selectedContentlets" :value="result.inode"></td>
							<td>{{ resultTitle(result) }}</td>
							<td>{{ resultType(result) }}</td>
							<td>{{ result.languageId }}</td>
							<td>{{ resultModUser(result) }}</td>
							<td>{{ result.modDate }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</script>



<script type="text/x-template" id="query-box">
	<div>
		<p v-if="importErrors"><span class="label alert">{{ importErrors }}</span></p>
		<div class="grid-container full">
			<div class="grid-x grid-padding-x">
					
				<div class="cell small-5 align-self-middle">
					<label>CT</label>
					<select v-if="ct" v-model="selectedCT">
						<option default value="">Select Content Type</option>
						<option v-for="structure in ct" :value="structure.variable">{{ structure.name }}</option>
					</select>
					
					<input type="text" v-model="exportOptions.query" placeholder="Query">
					<input type="text" v-model="exportOptions.limit" placeholder="Limit" value="0">

					<input type="text" v-model="exportOptions.sort" placeholder="Sort" value="modDate desc">
					
					<div id="out-format" v-if="selectedCT">
						<label>Output Format</label>
						<input type="radio" v-model="exportFormat" id="out_json" name="out-format" value="json" checked><label for="out_json">JSON</label>
						<input type="radio" v-model="exportFormat" id="out_curl" name="out-format" value="curl"><label for="out_curl">cURL</label>
						<input type="radio" v-model="exportFormat" id="out_xml" name="out-format" value="xml"><label for="out_xml">XML</label>
						<input type="radio" v-model="exportFormat" id="out_csv" name="out-format" value="csv"><label for="out_csv">CSV</label>
						<input type="radio" v-model="exportFormat" id="out_table" name="out-format" value="table"><label for="out_table">Table</label>
						<a class="button tiny" v-on:click="getExportData()">Go</a>
					</div>
				</div>

				<div class="cell small-7">
					<div id="out-fields" v-if="selectedCT">
						<label class="field-item" v-if="fields" v-for="field in fields" :for="field.variable">
							<input type="checkbox" v-model="exportOptions.fields"  :value="field.variable" :id="field.variable">{{ field.name }}
						</label>
					</div>
				</div>

			</div>
		</div>

		<hr>
		<div v-if="exportData && exportOptions">
			<query-output :exportData="exportData" :exportFormat="exportFormat" :exportOptions="exportOptions"></query-output>
		</div>
					
	</div>
</script>

<script type="text/x-template" id="query-import-box">
	<div>
		<div class="grid-container full">
			<div class="grid-x grid-padding-x">
				<div class="cell small-3 align-self-middle">
					<label>CT
						<select v-if="ct" v-model="ctName">
							<option default value="">Select Content Type</option>
							<option v-for="structure in ct" :value="structure.variable">{{ structure.name }}</option>
						</select>
					</label>
				</div>

				<div class="cell auto align-self-middle" v-if="ctName">
					<label>Import Mode</label>
					<input type="radio" v-model="importOptions.inMode" id="in_put" name="in-mode" value="PUT" checked><label for="in_put">PUT</label>
					<input type="radio" v-model="importOptions.inMode" id="in_post" name="in-mode" value="POST"><label for="in_post">POST</label>
				</div>

				<div class="cell small-3 align-self-middle" v-if="ctName">
					<label>Save Mode</label>
					<input type="radio" v-model="importOptions.saveMode" id="in_save" name="in-savemode" value="save" checked><label for="in_save">Save</label>
					<input type="radio" v-model="importOptions.saveMode" id="in_publish" name="in-savemode" value="publish"><label for="in_publish">Publish</label>
					<input type="radio" v-model="importOptions.saveMode" id="in_workflow" name="in-savemode" value="workflow"><label for="in_workflow">Workflow</label>
				</div>

				<div class="cell auto align-self-middle" v-if="ctName">
					<label>Import Format</label>
					<input type="radio" v-model="importOptions.format" id="in_json" name="in-format" value="json" checked><label for="in_json">JSON</label>
					<input type="radio" v-model="importOptions.format" id="in_forms" name="in-format" value="form"><label for="in_forms">Forms</label>
				</div>

				<div class="cell auto align-self-middle" v-if="ctName">
					<a class="button small" v-on:click="importQueue()">Begin Import</a>	
				</div>
			</div>
		</div>

		<div class="grid-container full" v-if="importOptions.saveMode === 'workflow'">
			<div class="grid-x grid-padding-x">
				<div class="cell auto align-self-middle">
					<p>Workflow Options (Not Working Yet)</p>
				</div>
			</div>
		</div>

		<hr>
		<p v-if="importErrors"><span class="label alert">{{ importErrors }}</span></p>
		
		<div v-if="importOptions.format == 'json'">
			<h5>Import Data</h5>
			<textarea class="textarea-data" v-model="textData"></textarea>
			<h6>Field Reference</h6>
			<div class="grid-container full">
				<div class="grid-x grid-padding-x">
					<div class="cell medium-3 align-self-middle" v-for="field in fields">
						<input type="text" :value="field.variable">
					</div>
				</div>
			</div>
		</div>

		<div v-if="importOptions.format == 'form'">
			<h4>Form Input</h4>
			<import-form :CT="ct" :importOptions="importOptions" :selectedCT="selectedCT" :ctName="ctName"></import-form>
		</div>

	</div>
</script>

<script type="text/x-template" id="import-form">
	<div v-if="importForm">

		<form>
			<div class="grid-container full">
				<div class="grid-x grid-padding-x">
					<div v-for="(element, index) in importForm" class="cell align-self-middle" v-if="(importOptions.inMode === 'POST')" :class="element.size">
						
						
						<div v-if="element.ele == 'input'">
							<label>{{ element.label }} ({{ element.fieldType }}) [{{ element.id }}]
								<input :type="element.type" v-model="element.value" :name="element.id" :placeholder="element.label">
							</label>
						</div>
						<div v-if="element.ele == 'textarea'">
							<label>{{ element.label }}
								<textarea class="textarea-form" :name="element.id" v-model="element.value"></textarea>
							</label>
						</div>

						
					</div>
				</div>
			</div>
		</form>
	</div>
</script>

<script type="text/x-template" id="query-output">
		<div>
		<div v-if="exportOptions.view == 'html'" class="export-data-html" v-html="exportData"></div>
		<textarea v-if="exportOptions.view == 'plain'" class="textarea-data" wrap="off">{{exportData}}</textarea>
	</div>
</script>

<script type="text/x-template" id="structure-import-box">
	<div>
		<p v-if="importErrors"><span class="label alert">{{ importErrors }}</span></p>
		<div class="cell auto align-self-middle">
			<label>Import Mode</label>
			<input type="radio" v-model="importMode" id="in_json" name="in-mode" value="json" checked><label for="in_json">JSON</label>
			<input type="radio" v-model="importMode" id="in_form" name="in-mode" value="form"><label for="in_form">Form</label>
		</div>
		<div v-if="importMode == 'json'">
			<textarea class="textarea-data" wrap="off" placeholder="Place JSON data here." v-model="importText"></textarea>
			<a class="button" v-on:click="importStructureJson()">Import</a>
		</div>
		<div v-if="importMode == 'form'">
			<h3>Form (WIP)</h3>
		</div>
	</div>
</script>

<script type="text/x-template" id="structure-export-box">
	<div>
		<h5	class="text-center">Export Content Type</h5>
		<div class="grid-container full">
			<div class="grid-x grid-padding-x">
					
				<div class="cell small-5 align-self-middle">
					<label>CT</label>
					<select v-if="ct" v-model="selectedCT">
						<option default value="">Select Content Type</option>
						<option v-for="structure in ct" :value="structure.variable">{{ structure.name }}</option>
					</select>
				</div>
			</div>
		</div>

		<div v-if="structureExportData">
			<textarea class="textarea-data" wrap="off">{{structureExportData}}</textarea>
		</div>
	</div>
</script>


<script type="text/x-template" id="dot-api">
	<div>
		<h5 class="text-center">API</h5>
		<div v-if="!showOutput" class="grid-x grid-padding-x">
			<div class="cell small-12">
				<label>URI: <input type="text" v-model="query.uri" placeholder="URI"></label>
			</div>
			<div class="cell small-12">
				<label>Params: <input type="text" v-model="query.params" placeholder="Params"></label>
			</div>
			<div class="cell small-3">
				<label>Method: <input type="text" v-model="query.method" placeholder="Method"></label>
			</div>
			<div class="cell small-3">
				<label>Data Type: <input type="text" v-model="query.dataType" placeholder="Data Type"></label>
			</div>
			<div class="cell small-12">
				<label>Payload: <textarea v-model="query.payload" placeholder="Payload" style="height:10rem;"></textarea></label>
			</div>
			<div class="cell small-3">
				<a class="button" v-on:click="sendRequest()">Go</a>
			</div>
		</div>
		<div v-if="showOutput" class="grid-x grid-padding-x">
			<h3>Output</h3>
			<div v-if="queryResponse" class="cell small-12">
				<textarea style="height:75vh;">{{ queryResponse }}</textarea>
			</div>
			<div class="cell small-12">
				<a class="button" v-on:click="hideResponse()">Done</a>
			</div>
		</div>
	</div>
</script>


<div id="data-dump" style="display:none;"></div>


<script src="js/jquery.js"></script>
<script src="js/moment.js"></script>
<script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>
<script src="js/foundation.js"></script>
<script src="js/vue.js"></script>
<script>
	$(document).foundation();
	document.addEventListener("DOMContentLoaded", function (e) {
		$("[data-menu-underline-from-center] a").addClass("underline-from-center");
	});
	var dotHostId = "<%=hostId%>";
	
</script>
<script src="js/dot-tools.js"></script>
</body>

</html>
<% } else {
	response.sendRedirect("login.jsp");
} %>