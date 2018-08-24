<%@page import="com.dotmarketing.util.PortletID"%><%@page import="com.dotmarketing.portlets.structure.model.Field"%><%@page import="com.dotmarketing.util.UtilMethods"%><%@page import="com.dotmarketing.business.APILocator"%><%@page import="java.util.GregorianCalendar"%><%@page import="java.util.Date"%><%@page import="java.util.Arrays"%><%@page import="java.text.SimpleDateFormat"%><%@page import="com.dotmarketing.util.Parameter"%><%@page import="com.dotmarketing.portlets.categories.model.Category"%><%@page import="com.dotmarketing.portlets.categories.business.CategoryAPI"%><%@page import="com.dotmarketing.business.APILocator"%><%@page import="com.dotmarketing.util.UtilMethods"%><%@page import="com.dotmarketing.util.InodeUtils"%><%@page import="com.dotmarketing.exception.DotSecurityException"%><%@page import="com.dotmarketing.util.Logger"%><%@page import="com.dotmarketing.portlets.structure.business.FieldAPI"%><%@page import="com.dotmarketing.util.VelocityUtil"%><%@page import="com.github.rjeschke.txtmark.Configuration"%><%@page import="com.github.rjeschke.txtmark.Processor"%>
<% String requestType=request.getParameter("q");
String velocityXHR=request.getParameter("s");
String velocityOut=""; 
if (UtilMethods.isSet(requestType) && UtilMethods.isSet(velocityXHR)) { 
	if (requestType.equals("vtlConsole")) {
		org.apache.velocity.context.Context velocityContext = com.dotmarketing.util.web.VelocityWebUtil.getVelocityContext(request,response);
		velocityOut = new VelocityUtil().parseVelocity(velocityXHR,velocityContext);
	} else if (requestType.equals("markdown")) {
		velocityOut = Processor.process(velocityXHR, Configuration.builder().forceExtentedProfile().build());
	} %>
	<%=velocityOut%>
<% } %>
