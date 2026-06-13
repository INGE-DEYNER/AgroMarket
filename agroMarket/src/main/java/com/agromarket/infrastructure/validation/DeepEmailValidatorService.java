package com.agromarket.infrastructure.validation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

@Service
public class DeepEmailValidatorService {

    private static final Logger log = LoggerFactory.getLogger(DeepEmailValidatorService.class);

    public boolean isEmailValid(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }
        
        // General regex check
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        if (!email.matches(emailRegex)) {
            return false;
        }
        
        String[] parts = email.split("@");
        String domain = parts[1];

        List<String> mxRecords = getMxRecords(domain);
        if (mxRecords.isEmpty()) {
            log.warn("No MX records found for domain: {} (Assuming true to allow local/offline dev)", domain);
            return true; // Optimistic bypass for DNS/offline environments
        }

        // Try the first MX record (simplification)
        for (String mx : mxRecords) {
            Boolean isValid = checkSmtp(mx, email);
            if (isValid != null) {
                return isValid; // Strict result obtained
            }
        }
        
        // If all SMTP connections failed, return true (Optimistic approach)
        log.warn("Optimistic validation applied for email: {} (SMTP servers rejected connections)", email);
        return true;
    }

    private List<String> getMxRecords(String domain) {
        List<String> records = new ArrayList<>();
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            InitialDirContext idc = new InitialDirContext(env);
            Attributes attrs = idc.getAttributes(domain, new String[]{"MX"});
            Attribute attr = attrs.get("MX");
            
            if (attr != null) {
                NamingEnumeration<?> en = attr.getAll();
                while (en.hasMore()) {
                    String[] parts = en.next().toString().split(" ");
                    if (parts.length > 1) {
                        records.add(parts[1].endsWith(".") ? parts[1].substring(0, parts[1].length() - 1) : parts[1]);
                    }
                }
            }
        } catch (NamingException e) {
            log.debug("Error fetching MX records for domain: {}", domain, e);
        }
        return records;
    }

    private Boolean checkSmtp(String mx, String email) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(mx, 25), 3000); // 3 sec timeout
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));

            // 1. Read greeting
            if (!readResponse(reader, 220)) return null; // Connection refused / Grey listed

            // 2. Send HELO
            writer.write("HELO agromarket.com\r\n");
            writer.flush();
            if (!readResponse(reader, 250)) return null;

            // 3. Send MAIL FROM
            writer.write("MAIL FROM:<no-reply@agromarket.com>\r\n");
            writer.flush();
            if (!readResponse(reader, 250)) return null;

            // 4. Send RCPT TO
            writer.write("RCPT TO:<" + email + ">\r\n");
            writer.flush();
            
            String response = reader.readLine();
            if (response == null) return null;
            
            if (response.startsWith("250")) {
                return true; // Exists
            } else if (response.startsWith("550")) {
                return false; // User Not Found
            }
            
            // Greylisted or other unknown state (return null to try next MX or fall back to optimistic)
            return null;
        } catch (Exception e) {
            return null; // Connection failed, try next
        }
    }

    private boolean readResponse(BufferedReader reader, int expectedCode) throws IOException {
        String line = reader.readLine();
        while (line != null && line.charAt(3) == '-') {
            line = reader.readLine(); // read multi-line
        }
        return line != null && line.startsWith(String.valueOf(expectedCode));
    }
}
