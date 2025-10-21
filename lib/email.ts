import nodemailer from 'nodemailer'

// Configuration du transporteur email
// En développement, vous pouvez utiliser un service comme Mailtrap ou Ethereal Email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"ListKdo" <noreply@listkdo.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

  const mailOptions = {
    from: process.env.SMTP_FROM || '"ListKdo" <noreply@listkdo.com>',
    to: email,
    subject: 'Réinitialisation de votre mot de passe - ListKdo',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { 
              display: inline-block; 
              background: #4f46e5; 
              color: #ffffff !important; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
              font-weight: bold;
              font-size: 16px;
            }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 ListKdo</h1>
              <p>Réinitialisation de mot de passe</p>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button" style="color: #ffffff !important; text-decoration: none;">Réinitialiser mon mot de passe</a>
              </div>
              <p><strong>Ce lien est valide pendant 1 heure.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
              <p>Pour des raisons de sécurité, ne partagez jamais ce lien avec personne.</p>
            </div>
            <div class="footer">
              <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all;">${resetUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Réinitialisation de mot de passe - ListKdo
      
      Bonjour,
      
      Vous avez demandé à réinitialiser votre mot de passe.
      
      Cliquez sur ce lien pour créer un nouveau mot de passe :
      ${resetUrl}
      
      Ce lien est valide pendant 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return { success: false, error }
  }
}
