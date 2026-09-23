
package com.agromarket.infrastructure.validation;

import java.util.Hashtable;
import java.util.regex.Pattern;

import javax.naming.NamingException;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;

import org.springframework.stereotype.Service;

@Service
public class DeepEmailValidatorService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
                    + "[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$");

    public boolean isValid(
            String email) {

        if (email == null
                || email.isBlank()) {

            return false;
        }

        String normalized = email.trim();

        if (!EMAIL_PATTERN
                .matcher(normalized)
                .matches()) {

            return false;
        }

        String domain = normalized.substring(
                normalized.lastIndexOf('@') + 1);

        return hasMxRecord(domain);
    }

    private boolean hasMxRecord(
            String domain) {

        Hashtable<String, String> environment = new Hashtable<>();

        environment.put(
                "java.naming.factory.initial",
                "com.sun.jndi.dns.DnsContextFactory");

        environment.put(
                "java.naming.provider.url",
                "dns:");

        try {

            DirContext context = new InitialDirContext(
                    environment);

            javax.naming.directory.Attributes attributes = context.getAttributes(
                    domain,
                    new String[] { "MX" });

            return attributes.get("MX") != null
                    && attributes.get("MX").size() > 0;

        } catch (NamingException ex) {

            return false;
        }
    }
}