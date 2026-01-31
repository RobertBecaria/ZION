"""
Email service for ZION.CITY
Handles sending emails for verification, password reset, notifications, etc.
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

logger = logging.getLogger(__name__)

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "25"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "false").lower() == "true"
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@zioncity.app")
FROM_NAME = os.getenv("FROM_NAME", "ZION.CITY")

# Base URL for links in emails
BASE_URL = os.getenv("FRONTEND_URL", "https://zioncity.app")


async def send_email(to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
    """
    Send an email using the configured SMTP server.

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML body of the email
        text_content: Plain text body (optional, will be derived from HTML if not provided)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject

        # Add plain text version
        if text_content:
            message.attach(MIMEText(text_content, "plain", "utf-8"))

        # Add HTML version
        message.attach(MIMEText(html_content, "html", "utf-8"))

        # Send email
        if SMTP_USER and SMTP_PASSWORD:
            # Authenticated SMTP
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USER,
                password=SMTP_PASSWORD,
                use_tls=SMTP_USE_TLS,
            )
        else:
            # Local Postfix (no auth needed, no TLS for internal connection)
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                start_tls=False,
            )

        logger.info(f"Email sent successfully to {to_email}: {subject}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_verification_email(to_email: str, user_name: str, verification_token: str) -> bool:
    """Send email verification email to new user."""
    verification_link = f"{BASE_URL}/verify-email?token={verification_token}"

    subject = "Подтвердите вашу электронную почту - ZION.CITY"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ZION.CITY</h1>
                <p>Добро пожаловать в нашу платформу!</p>
            </div>
            <div class="content">
                <h2>Здравствуйте, {user_name}!</h2>
                <p>Спасибо за регистрацию на платформе ZION.CITY. Для завершения регистрации, пожалуйста, подтвердите вашу электронную почту.</p>
                <p style="text-align: center;">
                    <a href="{verification_link}" class="button">Подтвердить Email</a>
                </p>
                <p>Или скопируйте эту ссылку в браузер:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{verification_link}</p>
                <p>Ссылка действительна в течение 24 часов.</p>
                <p>Если вы не регистрировались на нашей платформе, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
                <p>© 2026 ZION.CITY. Все права защищены.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Здравствуйте, {user_name}!

    Спасибо за регистрацию на платформе ZION.CITY.

    Для подтверждения электронной почты перейдите по ссылке:
    {verification_link}

    Ссылка действительна в течение 24 часов.

    Если вы не регистрировались на нашей платформе, просто проигнорируйте это письмо.

    © 2026 ZION.CITY
    """

    return await send_email(to_email, subject, html_content, text_content)


async def send_password_reset_email(to_email: str, user_name: str, reset_token: str) -> bool:
    """Send password reset email."""
    reset_link = f"{BASE_URL}/reset-password?token={reset_token}"

    subject = "Сброс пароля - ZION.CITY"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .warning {{ background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ZION.CITY</h1>
                <p>Сброс пароля</p>
            </div>
            <div class="content">
                <h2>Здравствуйте, {user_name}!</h2>
                <p>Мы получили запрос на сброс пароля для вашей учетной записи.</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Сбросить пароль</a>
                </p>
                <p>Или скопируйте эту ссылку в браузер:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{reset_link}</p>
                <p>Ссылка действительна в течение 1 часа.</p>
                <div class="warning">
                    <strong>⚠️ Внимание:</strong> Если вы не запрашивали сброс пароля, проигнорируйте это письмо. Ваш пароль останется без изменений.
                </div>
            </div>
            <div class="footer">
                <p>© 2026 ZION.CITY. Все права защищены.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Здравствуйте, {user_name}!

    Мы получили запрос на сброс пароля для вашей учетной записи.

    Для сброса пароля перейдите по ссылке:
    {reset_link}

    Ссылка действительна в течение 1 часа.

    Если вы не запрашивали сброс пароля, проигнорируйте это письмо.

    © 2026 ZION.CITY
    """

    return await send_email(to_email, subject, html_content, text_content)


async def send_invitation_email(to_email: str, inviter_name: str, organization_name: str, invitation_link: str) -> bool:
    """Send organization/family invitation email."""
    subject = f"Приглашение присоединиться к {organization_name} - ZION.CITY"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ZION.CITY</h1>
                <p>Приглашение</p>
            </div>
            <div class="content">
                <h2>Вас приглашают присоединиться!</h2>
                <p><strong>{inviter_name}</strong> приглашает вас присоединиться к <strong>{organization_name}</strong> на платформе ZION.CITY.</p>
                <p style="text-align: center;">
                    <a href="{invitation_link}" class="button">Принять приглашение</a>
                </p>
                <p>Или скопируйте эту ссылку в браузер:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{invitation_link}</p>
            </div>
            <div class="footer">
                <p>© 2026 ZION.CITY. Все права защищены.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Вас приглашают присоединиться!

    {inviter_name} приглашает вас присоединиться к {organization_name} на платформе ZION.CITY.

    Для принятия приглашения перейдите по ссылке:
    {invitation_link}

    © 2026 ZION.CITY
    """

    return await send_email(to_email, subject, html_content, text_content)
