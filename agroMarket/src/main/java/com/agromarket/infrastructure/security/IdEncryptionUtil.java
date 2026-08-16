package com.agromarket.infrastructure.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class IdEncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";

    private static final int IV_LENGTH = 12;

    private static final int TAG_LENGTH = 128;

    private final SecretKeySpec secretKey;

    private final SecureRandom secureRandom = new SecureRandom();

    public IdEncryptionUtil(
            @Value("${app.security.id-encryption-key}") String key) {

        byte[] decoded = Base64.getDecoder()
                .decode(key);

        if (decoded.length != 16
                && decoded.length != 24
                && decoded.length != 32) {

            throw new IllegalStateException(
                    "app.security.id-encryption-key debe "
                            + "ser Base64 de 16, 24 o 32 bytes");
        }

        this.secretKey = new SecretKeySpec(
                decoded,
                "AES");
    }

    public String encrypt(
            Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "El id no puede ser null");
        }

        try {
            byte[] iv = new byte[IV_LENGTH];

            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(
                    ALGORITHM);

            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    secretKey,
                    new GCMParameterSpec(
                            TAG_LENGTH,
                            iv));

            byte[] encrypted = cipher.doFinal(
                    String.valueOf(id)
                            .getBytes(
                                    StandardCharsets.UTF_8));

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(
                            ByteBuffer.allocate(
                                    iv.length
                                            + encrypted.length)
                                    .put(iv)
                                    .put(encrypted)
                                    .array());

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "No fue posible cifrar el id",
                    ex);
        }
    }

    public Long decrypt(
            String value) {

        try {
            byte[] data = Base64.getUrlDecoder()
                    .decode(value);

            ByteBuffer buffer = ByteBuffer.wrap(data);

            byte[] iv = new byte[IV_LENGTH];

            buffer.get(iv);

            byte[] encrypted = new byte[buffer.remaining()];

            buffer.get(encrypted);

            Cipher cipher = Cipher.getInstance(
                    ALGORITHM);

            cipher.init(
                    Cipher.DECRYPT_MODE,
                    secretKey,
                    new GCMParameterSpec(
                            TAG_LENGTH,
                            iv));

            String plain = new String(
                    cipher.doFinal(
                            encrypted),
                    StandardCharsets.UTF_8);

            return Long.valueOf(plain);

        } catch (Exception ex) {

            throw new IllegalArgumentException(
                    "Identificador inválido",
                    ex);
        }
    }
}