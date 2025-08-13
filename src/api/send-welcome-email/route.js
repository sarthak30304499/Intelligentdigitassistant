async function handler({ email, name }) {
  if (!email) {
    return { error: "Email is required" };
  }

  const userName = name || "there";

  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to IDA</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; background-color: #121212; color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1E1E1E; border-radius: 16px; overflow: hidden;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #2563eb, #7c3aed);">
          <img src="https://ucarecdn.com/7856e229-e2b0-4c8b-823d-98400c6e9e38/-/format/auto/" alt="IDA Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">Welcome to IDA!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #e5e7eb;">Your Intelligent Digital Assistant</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">Hello ${userName}! 👋</h2>
          
          <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Welcome to IDA (Intelligent Digital Assistant), created by Sarthak Palgotra. I'm here to make your digital interactions more efficient and enjoyable!
          </p>
          
          <div style="background-color: #2A2A2A; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #60a5fa; font-size: 20px; margin: 0 0 15px 0;">🚀 What I can do for you:</h3>
            <ul style="color: #d1d5db; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Answer questions and provide intelligent responses</li>
              <li>Generate images from text descriptions</li>
              <li>Translate text into 100+ languages</li>
              <li>Convert text to speech for audio playback</li>
              <li>Quick access to popular websites and social media</li>
              <li>Deep thinking mode for complex problems</li>
            </ul>
          </div>
          
          <div style="background-color: #2A2A2A; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #34d399; font-size: 20px; margin: 0 0 15px 0;">💡 Quick Tips:</h3>
            <ul style="color: #d1d5db; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Type "generate image [description]" to create custom images</li>
              <li>Use the language selector to get responses in your preferred language</li>
              <li>Enable "Think Deeper" mode for complex reasoning tasks</li>
              <li>Simply type website names like "youtube" or "google" for quick access</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="/" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Start Chatting with IDA
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            Ready to explore? I'm here 24/7 to assist you with anything you need!
          </p>
        </div>
        
        <div style="background-color: #111827; padding: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Created by <a href="https://www.linkedin.com/in/sarthakpalgotra/" style="color: #60a5fa; text-decoration: none;">Sarthak Palgotra</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch("/api/resend-api-function", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: email,
      from: "IDA <noreply@ida-assistant.com>",
      subject: "Welcome to IDA - Your Intelligent Digital Assistant! 🤖",
      html: welcomeHtml,
    }),
  });

  const result = await response.json();

  if (result.error) {
    return { error: result.error };
  }

  return {
    success: true,
    emailId: result.id,
    message: `Welcome email sent to ${email}`,
  };
}
export async function POST(request) {
  return handler(await request.json());
}