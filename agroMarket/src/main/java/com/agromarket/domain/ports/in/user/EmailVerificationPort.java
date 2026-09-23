
package com.agromarket.domain.ports.in.user;

public interface EmailVerificationPort {

  void sendVerificationEmail(String email);

  void verifyEmail(String token);

  void resendVerificationEmail(String email);
}