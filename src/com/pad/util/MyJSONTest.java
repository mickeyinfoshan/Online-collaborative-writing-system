package com.pad.util;

import java.io.ByteArrayInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

import com.itextpdf.text.Document;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.tool.xml.XMLWorkerHelper;

public class MyJSONTest {
	public static void main(String[] args) throws Exception {
		String file = "pdf_demo.pdf";
		Document document = new Document();
		PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(file));
		document.open();
		String exampleString = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"><html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" /></head><body>1.中文的话会怎么样<br/><br/><ul class=\"indent\"><li>adfadfasdfasdfasdfsadf</li></ul><br/>2.bbb<br/><br/><ul class=\"indent\"><li>adfadfadsfasdfasdfzcvzcvcvsdagftge</li></ul><br/>3.ccc<br/><br/><ul class=\"indent\"><li><strong><u>adfadfcsdaf</u></strong></li><li>v<fs20>fhgfghfhfg</fs20></li><li><br/></li></ul><br/></body></html>";
		InputStream stream = new ByteArrayInputStream(exampleString.getBytes(StandardCharsets.UTF_8));
		XMLWorkerHelper.getInstance().parseXHtml(writer, document, stream, Charset.forName("UTF-8"));
		document.close();
	}
}
