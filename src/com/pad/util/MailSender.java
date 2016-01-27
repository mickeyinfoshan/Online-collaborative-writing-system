package com.pad.util;

import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import com.pad.util.MailAuthenticator;

public class MailSender {
	public static void simpleSend(String host, String port, String from, String password, String to, String subjectText, String messageText) {
		Properties properties = System.getProperties();

	      // Setup mail server
	      properties.put("mail.smtp.host", host);
	      properties.put("mail.smtp.port", port);
	      properties.put("mail.smtp.auth", "true");
	      
	      Authenticator authenticator = new MailAuthenticator(from, password);
	      
	      // Get the default Session object.
	      Session session = Session.getDefaultInstance(properties, authenticator);

	      try{
	         // Create a default MimeMessage object.
	         MimeMessage message = new MimeMessage(session);

	         // Set From: header field of the header.
	         message.setFrom(new InternetAddress(from));

	         // Set To: header field of the header.
	         message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));

	         // Set Subject: header field
	         message.setSubject(subjectText);

	         // Now set the actual message
	         message.setText(messageText);

	         // Send message
	         Transport.send(message);
	         System.out.println("Sent message successfully....");
	      }catch (MessagingException mex) {
	         mex.printStackTrace();
	      }
	}
}
