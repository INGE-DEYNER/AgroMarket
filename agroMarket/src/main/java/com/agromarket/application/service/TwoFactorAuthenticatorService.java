package com.agromarket.application.service;

import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

@Service
public class TwoFactorAuthenticatorService {
    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int OTP_DIGITS = 6;
    private static final int TIME_STEP_SECONDS = 30;
    private static final int ALLOWED_WINDOW_STEPS = 1;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateSecret() {
        byte[] randomBytes = new byte[20];
        SECURE_RANDOM.nextBytes(randomBytes);
        return base32Encode(randomBytes);
    }

    public boolean verifyCode(String base32Secret, String code) {
        if (base32Secret == null || base32Secret.isBlank() || code == null || !code.matches("^[0-9]{6}$")) {
            return false;
        }

        long nowStep = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;
        for (int offset = -ALLOWED_WINDOW_STEPS; offset <= ALLOWED_WINDOW_STEPS; offset++) {
            String expected = generateCodeForStep(base32Secret, nowStep + offset);
            if (code.equals(expected)) {
                return true;
            }
        }
        return false;
    }

    public String buildOtpAuthUrl(String issuer, String accountName, String secret) {
        String safeIssuer = issuer == null || issuer.isBlank() ? "AgroMarket" : issuer;
        String label = safeIssuer + ":" + accountName;
        return "otpauth://totp/"
                + urlEncode(label)
                + "?secret=" + secret
                + "&issuer=" + urlEncode(safeIssuer)
                + "&algorithm=SHA1&digits=6&period=30";
    }

    private String generateCodeForStep(String base32Secret, long step) {
        try {
            byte[] key = base32Decode(base32Secret);
            byte[] data = ByteBuffer.allocate(8).putLong(step).array();

            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            int otp = binary % (int) Math.pow(10, OTP_DIGITS);
            return String.format(Locale.ROOT, "%06d", otp);
        } catch (Exception ex) {
            return "";
        }
    }

    private String base32Encode(byte[] data) {
        StringBuilder result = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1F;
                bitsLeft -= 5;
                result.append(BASE32_ALPHABET.charAt(index));
            }
        }

        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1F;
            result.append(BASE32_ALPHABET.charAt(index));
        }

        return result.toString();
    }

    private byte[] base32Decode(String base32) {
        String normalized = base32.replace("=", "").replaceAll("\\s+", "").toUpperCase(Locale.ROOT);
        ByteBuffer out = ByteBuffer.allocate(normalized.length() * 5 / 8 + 1);

        int buffer = 0;
        int bitsLeft = 0;

        for (char c : normalized.toCharArray()) {
            int value = BASE32_ALPHABET.indexOf(c);
            if (value < 0) {
                throw new IllegalArgumentException("Invalid base32 character");
            }
            buffer = (buffer << 5) | value;
            bitsLeft += 5;

            if (bitsLeft >= 8) {
                out.put((byte) ((buffer >> (bitsLeft - 8)) & 0xFF));
                bitsLeft -= 8;
            }
        }

        out.flip();
        byte[] decoded = new byte[out.remaining()];
        out.get(decoded);
        return decoded;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
