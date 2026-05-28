package com.agromarket.application.service;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
    void sendHtmlMessage(String to, String subject, String html);
    void sendTemplateMessage(String to, String subject, String templateName, java.util.Map<String, String> model);
}
