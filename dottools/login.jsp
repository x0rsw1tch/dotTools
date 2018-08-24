<%@page import="com.dotmarketing.util.PortletID"%>
<%@page import="com.dotmarketing.util.UtilMethods"%>
<%@page import="com.dotmarketing.business.web.WebAPILocator"%>
<% if (!WebAPILocator.getUserWebAPI().isLoggedToBackend(request)) { %>
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
			<input type="button" name="login" id="login" value="Login">
		</fieldset>
    </form>


<script src="js/jquery.js"></script>
<script src="js/foundation.min.js"></script>
<script src="js/vue.js"></script>
<script>
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
		}
	}
</script>
</body>
</html>
<% } else {

	response.sendRedirect("./index.jsp");

} %>