<%@page import="com.liferay.portal.util.ReleaseInfo"%>
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
if (hostId == null) { 
	com.dotmarketing.business.web.HostWebAPI hostApi = com.dotmarketing.business.web.WebAPILocator.getHostWebAPI();
	Host host = WebAPILocator.getHostWebAPI().getCurrentHost(request);
	hostId = host.getMap().get("identifier").toString();
}
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

		<div class="cell shrink header medium-cell-block-container" style="margin-bottom:0.5rem;">
			<nav class="hover-underline-menu" data-menu-underline-from-center="data-menu-underline-from-center">
				<ul class="menu">
					<li><a v-bind:class="{'nav-active': navItemActive('default')}" v-on:click="setPane('default')">dotTools</a></li>
				</ul>
				<ul class="menu">
					<li>
						<a v-bind:class="{'nav-active': navItemActive('console')}" v-on:click="setPane('console')">Console</a>
					</li>
					<li>
						<a v-bind:class="{'nav-active': navItemActive('content-manager')}" v-on:click="setPane('content-manager')">Manager</a>
					</li>
					<li>
						<a v-bind:class="{'nav-active': navItemActive('content-import')}" v-on:click="setPane('content-import')">Content Import</a>
					</li>
					<li>
						<a v-bind:class="{'nav-active': navItemActive('content-export')}" v-on:click="setPane('content-export')">Content Export</a>
					</li>
					<li v-if="dotcmsVersion > 3">
						<a v-bind:class="{'nav-active': navItemActive('structure-import')}" v-on:click="setPane('structure-import')">CT Import</a>
					</li>
					<li v-if="dotcmsVersion > 3">
						<a v-bind:class="{'nav-active': navItemActive('structure-export')}" v-on:click="setPane('structure-export')">CT Export</a>
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
			<div v-show="pane == 'default'">
				<dotcms-info :dotcms="dotcms" :dotcms-version="dotcmsVersion" :version="version" :pane="pane"></dotcms-info>
			</div>
			<div v-show="pane == 'console'">
				<velocity-console :ct="ct" :users="users"></velocity-console>
			</div>
			<div v-show="pane == 'content-manager'">
				<content-manager :ct="ct" :users="users"></content-manager>
			</div>
			<div v-show="pane == 'content-import'">
				<query-import-box :ct="ct" :version="version"></query-import-box>
			</div>
			<div v-show="pane == 'content-export'">
				<query-box :ct="ct" :version="version"></query-box>
			</div>
			<div v-show="pane == 'structure-import'">
				<structure-import-box></structure-import-box>
			</div>
			<div v-show="pane == 'structure-export'">
				<structure-export-box :ct="ct"></structure-export-box>
			</div>
			<div v-show="pane == 'api'">
				<dot-api :ct="ct"></dot-api>
			</div>
		</div>

		<div class="cell small-2 footer medium-cell-block-y flex-child-auto" style="margin-top:1rem;">
			<div id="session-log"></div>
		</div>

	</div>


</div>

<script type="text/x-template" id="dotcms-info">
	<div>
		<div class="grid-x grid-padding-x grid-container">
			<div class="cell auto">
				<div v-if="version" style="margin-bottom:1.5rem;">
					<h3>dotTools Utilities</h3>

					<dt>dotCMS Version</dt>
					<dd>{{ version.dotVersion }}</dd>
				</div>
				<div v-if="version && version.dotcmsVersion == 4">
					<div class="callout warning">
						<h5>You are running an old version of dotCMS ({{ version.dotVersion }}). Some functionality may not work properly.</h5>
					</div>
				</div>
				<div v-if="version && version.dotcmsVersion == 3">
					<div class="callout warning">
						<h5>You are running a really old version of dotCMS ({{ version.dotVersion }}). Some functionality may not work properly.</h5>
					</div>
				</div>
				<div v-if="!version">
					<div class="callout alert">
						<h5>Unable to determine version of dotCMS. Some functionality may not work properly.</h5>
					</div>
				</div>

				<ul class="no-bullet pane-nav-list">
					<li><a v-on:click="setPane('console')">Console</a>Velocity Console. Run Velocity scripts in real-time<div class="clearfix"></div></li>
					<li><a v-on:click="setPane('content-manager')">Manager</a>Lucene search content, apply batch workflow operations, and prune inodes<div class="clearfix"></div></li>
					<li><a v-on:click="setPane('content-import')">Content Import</a>Import contentlets with JSON payloads, or forms<div class="clearfix"></div></li>
					<li><a v-on:click="setPane('content-export')">Content Export</a>Export contentlets in various formats<div class="clearfix"></div></li>
					<li><a v-on:click="setPane('structure-import')">CT Import</a>Import Content Types with JSON payloads<div class="clearfix"></div></li>
					<li><a v-on:click="setPane('structure-export')">CT Export</a>Export Content Types for use with CT Import<div class="clearfix"></div></li>
					<li><a v-on:click="setPane('dot-api')">API</a>Interact with any host REST API's<div class="clearfix"></div></li>
				</ul>
			</div>
		</div>
	</div>
</script>


<script type="text/x-template" id="velocity-console">
	<div>

		<div class="grid-x">
			<div class="cell shrink">
				<label title="Use preformatted output"><input type="radio" name="outFormat" value="preformatted" v-model="outputFormat">Pre</label>
				<label title="Use HTML format"><input type="radio" name="outFormat" v-model="outputFormat" value="html" />HTML</label>
				<label title="Process Velocity"><input type="checkbox" v-model="processVelocity">Vel</label>
				<label title="Live update"><input type="checkbox" v-model="liveUpdate">Live</label>
				<label title="Enable Logging"><input type="checkbox" v-model="logging">Log</label>
				<p>
					<a class="button primary expanded" v-bind="{ disabled: floodControl }" v-on:click="sendQuery()" style="user-select: none;">Run</a>
					<a class="button primary expanded" data-open="console-history-modal">history</a>
				</p>

				<span v-if="bench">Last Run: {{bench}}ms</span>
			</div>

			<div class="cell auto">
				<textarea class="velocity-console" rows="10" cols="60" spellcheck="false" v-model="consoleInput"></textarea>
				<div v-if="loading" class="loader"></div>
				<span v-if="floodControl" style="color:#FF3333;">Flood control triggered... Delaying XHR by 1sec</span>
			</div>

		</div>

		<div class="grid-x">
			<div class="cell small-12">
				<div v-if="consoleOutput && outputFormat == 'preformatted'" class="velocity-output-pre" contentEditable="true"><pre>{{ consoleOutput }}</pre></div>
				<div v-if="consoleOutput && outputFormat == 'html'" class="velocity-output" v-html="consoleOutput"></div>
			</div>
		</div>

	</div>
</script>


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
			<div class="cell small-1">
				<input type="text" v-model="query.limit" title="Limit" placeholder="Limit" value="0">
			</div>
			<div class="cell small-1">
				<input type="text" v-model="query.offset" title="Offset" placeholder="Offset" value="0">
			</div>
			<div class="cell small-2">
				<input type="text" v-model="query.sort" title="sort" placeholder="Sort" value="modDate desc">
			</div>
			<div class="cell small-1">
				<a class="button" v-on:click="sendQuery()">Go</a>
			</div>
			<div class="cell small-1 align-self-middle" v-if="results">
				<p>Results: {{ results.length }}</p>
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
							<td style="position:relative;">
								<a v-on:click="setResult(result)">{{ resultTitle(result) }}</a>
								<contentlet-data :result="result"></contentlet-data>
							</td>
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


<script type="text/x-template" id="contentlet-data">
	<div>
		<div v-if="isVisible()">
			<div style="position:absolute;padding:0.75rem;border:2px solid #2C3840;top:16px;left:50px;width:60vw;height:400px;background-color:#101010;z-index:2;">
				<h3>Contentlet Data</h3>
				<textarea style="height:100%;">{{ result }}</textarea>
				<button class="close-button" v-on:click="hide()" aria-label="Close modal" type="button">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
		</div>
	</div>
</script>


<script type="text/x-template" id="query-box">
	<div>
		<p v-if="importErrors"><span class="label alert">{{ importErrors }}</span></p>
		<div class="grid-container full">
			<div class="grid-x">

				<div class="cell small-8 align-self-middle">


					<div class="grid-x grid-padding-x">
						<div class="cell small-6 align-self-middle">
							<label>CT
							<select v-if="ct && version.dotcmsVersion > 3" v-model="ctName">
								<option default value="">Select Content Type</option>
								<option v-for="structure in ct" :value="structure.variable">{{ structure.name }}</option>
							</select>
							</label>
							<input v-if="version.dotcmsVersion === 3" type="text" v-model="ctName" placeholder="Content Type stName">
						</div>
						<div class="cell small-3 align-self-middle">
							<label>Limit
								<input type="text" v-model="exportOptions.limit" placeholder="Limit" value="0">
							</label>
						</div>
						<div class="cell small-3 align-self-middle">
							<label>Query
								<input type="text" v-model="exportOptions.sort" placeholder="Sort" value="modDate desc">
							</label>
						</div>
						<div class="cell small-12 align-self-middle">
							<input type="text" v-model="exportOptions.query" placeholder="Query">
						</div>
					</div>
				</div>


				<div class="cell small-4 align-self-middle">
					<div id="out-format" v-if="ctName">
						<label>Output Format</label>
						<input type="radio" v-model="exportFormat" id="out_json" name="out-format" value="json" checked><label for="out_json">JSON</label>
						<input type="radio" v-model="exportFormat" id="out_curl" name="out-format" value="curl"><label for="out_curl">cURL</label>
						<input type="radio" v-model="exportFormat" id="out_xml" name="out-format" value="xml"><label for="out_xml">XML</label>
						<input type="radio" v-model="exportFormat" id="out_csv" name="out-format" value="csv"><label for="out_csv">CSV</label>
						<input type="radio" v-model="exportFormat" id="out_table" name="out-format" value="table"><label for="out_table">Table</label>
						<a class="button tiny" v-on:click="getExportData()">Go</a>
					</div>
				</div>

				<div class="cell small-12">
					<div id="out-fields" v-if="ctName">
						<div class="grid-x grid-padding-x">
							<div class="cell large-3 medium-4 small-6" v-if="fields" v-for="field in fields">
								<label class="field-item" :for="field.variable">
									<input type="checkbox" v-model="exportOptions.fields" :value="field.variable" :id="field.variable">{{ field.name }}
								</label>
							</div>
						</div>
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
						<select v-if="ct && version.dotcmsVersion > 3" v-model="ctName">
							<option default value="">Select Content Type</option>
							<option v-for="structure in ct" :value="structure.variable">{{ structure.name }}</option>
						</select>
						<input v-if="version.dotcmsVersion === 3" type="text" v-model="ctName" placeholder="Content Type stName">
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
					<a class="button small" v-if="importOptions.format != 'form'" v-on:click="importQueue()">Begin Import</a>
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
			<import-form :ct="ct" :importOptions="importOptions" :selectedCT="selectedCT" :ctName="ctName"></import-form>
		</div>

	</div>
</script>


<script type="text/x-template" id="import-form">
	<div v-if="importForm">

		<form enctype="multipart/form-data">

			<div class="grid-container full">
				<div class="grid-x grid-padding-x">
					<input type="button" class="button primary" v-on:click="submitImportForm" value="Submit">
				</div>
			</div>

			<div class="grid-container full">
				<div class="grid-x grid-padding-x">


					<div v-for="(element, index) in importForm" class="cell align-self-middle" v-if="(importOptions.inMode === 'POST')" :class="element.size">


						<div v-if="element.ele == 'input'">
							<label>{{ element.label }} ({{ element.fieldType }}) [{{ element.id }}]
								<input :type="element.type" v-model="element.value" :name="element.id" v-on:change="inputChange" :placeholder="element.label">
								<a v-if="element.fieldType == 'ImmutableHostFolderField'" class="button small primary" v-on:click="addHostId(element)">Add Host Id</a>
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

			<div class="grid-container full">
				<div class="grid-x grid-padding-x">
					<input type="button" class="button primary" v-on:click="submitImportForm" value="Submit">
				</div>
			</div>

		</form>

	</div>
</script>


<script type="text/x-template" id="query-output">
	<div class="grid-y medium-grid-frame">
		<div class="cell small-12">
			<div v-if="exportOptions.view == 'html'" class="export-data-html" v-html="exportData"></div>
			<textarea v-if="exportOptions.view == 'plain'" class="textarea-data" wrap="off">{{exportData}}</textarea>
		</div>
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
			<div class="cell small-2">
				<label>Method: <input type="text" v-model="query.method" placeholder="Method"></label>
			</div>
			<div class="cell small-2">
				<label>Send Type: <input type="text" v-model="query.contentType" placeholder="Data Type"></label>
			</div>
			<div class="cell small-2">
				<label>Receive Type: <input type="text" v-model="query.dataType" placeholder="Data Type"></label>
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

<div class="reveal large" id="console-history-modal" data-reveal>
	<h4>Console History</h4>
	<div id="console-history"></div>
	<button class="close-button" data-close aria-label="Close modal" type="button">
		<span aria-hidden="true">&times;</span>
	</button>
</div>

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
	var dotVersion = "<%=ReleaseInfo.getVersion()%>";
	var dotcmsVersion = null;

</script>
<script src="js/dot-tools.js"></script>
</body>

</html>
<% } else {
	response.sendRedirect("login.jsp");
} %>