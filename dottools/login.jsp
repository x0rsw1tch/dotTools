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
if (!WebAPILocator.getUserWebAPI().isLoggedToBackend(request)) { %>
<html class="no-js" lang="en_US">
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
<head>
<title>dotTools</title>
<link rel="stylesheet" href="css/fontawesome-all.css"/>
<link rel="stylesheet" href="css/foundation.min.css"/>
<link rel="stylesheet" href="css/dot-tools.css"/>
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
    <h1>Login</h1>
	<h5 class="warning">NOTE: Wait for dotCMS backend to load, page will redirect automatically</h5>
    <form id="login-form" method="GET" action="#">
        <fieldset>
			<input type="text" name="user" id="user" placeholder="Username" autofocus autocomplete="username">
			<input type="password" name="password" id="password" placeholder="Password" autocomplete="password">
			<input type="button" class="button primary" name="login" id="login" value="Login">
		</fieldset>
    </form>


<script src="js/jquery.js"></script>
<script src="js/foundation.min.js"></script>
<script src="js/vue.js"></script>
<script>
	var dotHostId = "<%=hostId%>";
	var dotVersion = "<%=ReleaseInfo.getVersion()%>";
	var dotcmsVersion = null;

	function determineDotcmsVersion () {
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
	}
	
	$(document).foundation();
	document.addEventListener("DOMContentLoaded", function (e) {
		$('#login-form').keydown(function (e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				loginUser();
			}
		});

		$('#login-form').submit(function (e) {
			e.preventDefault();
			loginUser();
		});

		$('#login').click(function (e) {
			e.preventDefault();
			loginUser();
		});

		dotcmsVersion = determineDotcmsVersion();
	});

	function isDataValid () {
		var regUser = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
		var hasUser = false;
		var hasPass = false;
		if ($('#user').val() && $('#user').val().length > 0) hasUser = true;
		if ($('#password').val() && $('#password').val().length > 0) hasPass = true;
		if (hasUser && hasPass && regUser.test($('#user').val())) {
			return true;
		} else {
			return false;
		}
		return false;
	}

	function loginUser () {
		if (isDataValid()) {
			var inData = {
				'user': $('#user').val(),
				'password': $('#password').val(),
				'expirationDays': 10
			};
			if (dotcmsVersion > 3) {
				$.ajax({
					url: '/api/v1/authentication/api-token',
					method: 'POST',
					data: JSON.stringify(inData),
					contentType: "application/json",
					success: function (data) {
						if (data.hasOwnProperty('entity') && data.entity) {
							if (data.entity.hasOwnProperty('token') && data.entity.token) {
								if (data.entity.token.length > 0) {
									localStorage.setItem('crudToken', data.entity.token);
									window.location.href = './';
								}
							}
						}
					}
				});
			} else if (dotcmsVersion === 3) {
				var inData = {
					"my_account_cmd"           : "auth",
					"referer"                  : "/dottools",
					"my_account_r_m"           : "false",
					"password"                 : $('#password').val(),
					"my_account_login"         : $('#user').val(),
					"my_account_email_address" : "",
					"native"                   : "true"
				};

				$.ajax({
					url: '/c/portal_public/login',
					method: 'POST',
					data: $.param(inData),
					contentType: "application/x-www-form-urlencoded",
					success: function (data) {
						window.location.href = './';
					}
				});
			}
		}
	}
</script>
</body>
</html>
<% } else {

	response.sendRedirect("./index.jsp");

} %>