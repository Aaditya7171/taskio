import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_4mvqabv',
  templateId: 'template_j9g197h',
  publicKey: 'B31Bkg_vlgVd6Z6Ie',
  privateKey: 'AEkJ3BjqYXgo5vzLBPokN'
};

// Initialize EmailJS
export const initializeEmailJS = () => {
  try {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('EmailJS initialized successfully');
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
  }
};

// Send feedback email
export const sendFeedbackEmail = async (
  rating: number,
  userName: string,
  userEmail: string,
  message: string
) => {
  try {
    const templateParams = {
      rating: rating,
      user_name: userName,
      user_email: userEmail,
      message: message || 'No additional message provided'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Feedback email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send feedback email:', error);
    throw error;
  }
};

export default {
  initialize: initializeEmailJS,
  sendFeedback: sendFeedbackEmail
};
