<%@page import="com.dotmarketing.portlets.structure.model.Field"%><%@page import="com.dotmarketing.util.UtilMethods"%><%@page import="com.dotmarketing.business.APILocator"%><%@page import="java.util.GregorianCalendar"%><%@page import="java.util.Date"%><%@page import="java.util.Arrays"%><%@page import="java.text.SimpleDateFormat"%><%@page import="com.dotmarketing.util.Parameter"%><%@page import="com.dotmarketing.portlets.categories.model.Category"%><%@page import="com.dotmarketing.portlets.categories.business.CategoryAPI"%><%@page import="com.dotmarketing.business.APILocator"%><%@page import="com.dotmarketing.util.UtilMethods"%><%@page import="com.dotmarketing.util.InodeUtils"%><%@page import="com.dotmarketing.exception.DotSecurityException"%><%@page import="com.dotmarketing.util.Logger"%><%@page import="com.dotmarketing.portlets.structure.business.FieldAPI"%><%@page import="com.dotmarketing.util.VelocityUtil"%><%@page import="com.github.rjeschke.txtmark.Configuration"%><%@page import="com.github.rjeschke.txtmark.Processor"%>
<%@ page trimDirectiveWhitespaces="true" %><% 
String requestType = request.getParameter("q");
String velocityXHR = request.getParameter("s");
Boolean logEntry = Boolean.parseBoolean(request.getParameter("l"));
String velocityOut = ""; VelocityUtil vtlUtil = new VelocityUtil();

if (UtilMethods.isSet(requestType) && UtilMethods.isSet(velocityXHR)) { 
	if (requestType.equals("vtlConsole")) { 
		org.apache.velocity.context.Context velocityContext = com.dotmarketing.util.web.VelocityWebUtil.getVelocityContext(request,response);
		velocityOut=new VelocityUtil().parseVelocity(velocityXHR,velocityContext);
		if (logEntry) {
			Logger.info(vtlUtil, "\n\n*************** Velocity Console Logger ***************\n\n"+velocityXHR+"\n\n*******************************************************\n");
		}
	} else if (requestType.equals("markdown")) {
		velocityOut=Processor.process(velocityXHR,Configuration.builder().forceExtentedProfile().build());
	}
	out.println(velocityOut);
} %>