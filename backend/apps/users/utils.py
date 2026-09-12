import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerificationOTP

logger = logging.getLogger(__name__)

def generate_and_send_otp(user, purpose='registration'):
    """
    Generates a cryptographically secure 6-digit verification code,
    persists it with a 10-minute expiration, and dispatches a clinical HTML email.
    """
    # 1. Invalidate any existing unused OTPs for this user and purpose
    EmailVerificationOTP.objects.filter(
        user=user,
        purpose=purpose,
        is_used=False
    ).update(is_used=True)

    # 2. Generate secure 6-digit numerical code
    otp_code = f"{random.SystemRandom().randint(100000, 999999)}"
    expires_at = timezone.now() + timedelta(minutes=10)

    # 3. Create fresh OTP record
    otp_obj = EmailVerificationOTP.objects.create(
        user=user,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False
    )

    # 4. Prepare clinical branded email
    subject = f"Your MediAI Verification Code: {otp_code}"
    
    purpose_title = "Account Verification" if purpose == 'registration' else "Password Reset Request"
    action_text = (
        "Thank you for registering with MediAI Telehealth. Please use the following 6-digit clinical verification code to confirm your email address and activate your account."
        if purpose == 'registration' else
        "We received a request to reset the password for your MediAI Telehealth account. Please enter the following 6-digit authorization code to proceed."
    )

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #ede9fe; padding: 36px; box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.05); }}
        .badge {{ display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f5f3ff; color: #7c3aed; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }}
        .header {{ margin-top: 16px; margin-bottom: 24px; }}
        .title {{ font-size: 22px; font-weight: 800; color: #0f172a; margin: 8px 0 4px; }}
        .subtitle {{ font-size: 14px; color: #64748b; line-height: 1.5; }}
        .code-container {{ background: #faf5ff; border: 2px dashed #c084fc; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }}
        .otp-digits {{ font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #6b21a8; display: inline-block; }}
        .expiry-notice {{ font-size: 12px; font-weight: 600; color: #9333ea; margin-top: 8px; }}
        .info-box {{ background: #f1f5f9; border-radius: 12px; padding: 14px 18px; font-size: 13px; color: #334155; line-height: 1.5; margin-bottom: 24px; }}
        .footer {{ border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 11px; color: #94a3b8; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">
          <span>🛡️</span> MediAI Clinical Security
        </div>
        <div class="header">
          <h1 class="title">{purpose_title}</h1>
          <p class="subtitle">Hello {user.first_name or 'there'},</p>
          <p class="subtitle">{action_text}</p>
        </div>

        <div class="code-container">
          <div class="otp-digits">{otp_code}</div>
          <div class="expiry-notice">⏱️ Valid for 10 minutes only</div>
        </div>

        <div class="info-box">
          <strong>Security Notice:</strong> MediAI clinical staff will never ask for this verification code. If you did not initiate this request, please disregard this email or notify security.
        </div>

        <div class="footer">
          &copy; {timezone.now().year} MediAI Healthcare & Telemedicine Systems.<br/>
          HIPAA Compliant &bull; 256-Bit SSL/TLS Clinical Encryption
        </div>
      </div>
    </body>
    </html>
    """

    plain_message = f"""
    MediAI Clinical Security - {purpose_title}

    Hello {user.first_name or 'there'},

    {action_text}

    Your 6-Digit Verification Code: {otp_code}
    (Valid for 10 minutes)

    Security Notice: MediAI will never ask you for this code. If you did not request this, please ignore this email.

    MediAI Telehealth Platform
    """

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'MediAI Health <noreply@mediai-health.com>')

    import threading

    def _async_email_worker():
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=from_email,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False
            )
            logger.info(f"Successfully dispatched OTP {otp_code} to {user.email} ({purpose})")
        except Exception as e:
            logger.warning(f"Could not send email via SMTP ({e}). Fallback logged OTP: {otp_code} for {user.email}")

    # Fire email in background thread to guarantee zero HTTP blocking/delay
    email_thread = threading.Thread(target=_async_email_worker, daemon=True)
    email_thread.start()

    return otp_obj, otp_code

