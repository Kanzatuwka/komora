/**
 * Brevo REST API Client
 */

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const BREVO_LIST_ID = Number(import.meta.env.VITE_BREVO_LIST_ID);

/**
 * Brevo Template IDs
 */
const TEMPLATES = {
  DOI_CONFIRM: Number(import.meta.env.VITE_BREVO_DOI_CONFIRM_TEMPLATE_ID),
  DOI_WELCOME: Number(import.meta.env.VITE_BREVO_DOI_WELCOME_TEMPLATE_ID),
  ORDER_PLACED: Number(import.meta.env.VITE_BREVO_ORDER_PLACED_TEMPLATE_ID),
  ORDER_CONFIRMED: Number(import.meta.env.VITE_BREVO_ORDER_CONFIRMED_TEMPLATE_ID),
  ORDER_IN_TRANSIT: Number(import.meta.env.VITE_BREVO_ORDER_IN_TRANSIT_TEMPLATE_ID),
  ORDER_DELIVERED: Number(import.meta.env.VITE_BREVO_ORDER_DELIVERED_TEMPLATE_ID),
  ORDER_CANCELLED: Number(import.meta.env.VITE_BREVO_ORDER_CANCELLED_TEMPLATE_ID),
};

const BREVO_API_URL = 'https://api.brevo.com/v3';

async function brevoRequest(endpoint: string, options: RequestInit = {}) {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY is missing. Check your environment variables.');
    return null;
  }

  try {
    const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Brevo API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Brevo API Detailed Error:', errorData);
      } catch (e) {
        console.error('Could not parse Brevo error response');
      }
      throw new Error(errorMessage);
    }

    return response.status !== 204 ? await response.json() : { success: true };
  } catch (err) {
    console.error(`Brevo fetch error for ${endpoint}:`, err);
    throw err;
  }
}

export async function subscribe(email: string) {
  if (!TEMPLATES.DOI_CONFIRM) {
    throw new Error('VITE_BREVO_DOI_CONFIRM_TEMPLATE_ID is missing');
  }
  return sendTransactional({
    to: email,
    templateId: TEMPLATES.DOI_CONFIRM,
    params: { 
      confirmUrl: `${window.location.origin}/subscription-confirmed?email=${encodeURIComponent(email)}`
    }
  });
}

export async function confirmSubscription(email: string) {
  if (!BREVO_LIST_ID) {
    console.warn('VITE_BREVO_LIST_ID is missing, skipping list assignment');
  } else {
    // Add to contact list
    await brevoRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true
      })
    }).catch(err => console.warn('Failed to add to contacts list:', err));
  }

  // Send welcome email
  if (TEMPLATES.DOI_WELCOME) {
    return sendTransactional({
      to: email,
      templateId: TEMPLATES.DOI_WELCOME
    });
  }
}

export async function sendTransactional({ to, templateId, params = {} }: { to: string, templateId: number, params?: any }) {
  return brevoRequest('/smtp/email', {
    method: 'POST',
    body: JSON.stringify({
      to: [{ email: to }],
      templateId,
      params
    })
  });
}

export async function sendCampaign({ subject, htmlContent, listId }: { subject: string, htmlContent: string, listId: number }) {
  if (!listId || isNaN(listId)) {
    throw new Error('Invalid Brevo List ID. Check VITE_BREVO_LIST_ID.');
  }

  console.log('Creating Brevo campaign...');
  const res = await brevoRequest('/emailCampaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: `Newsletter_${new Date().toISOString()}`,
      subject,
      htmlContent,
      recipients: { listIds: [listId] },
      // IMPORTANT: The sender email must be verified in Brevo
      sender: { name: 'Комора', email: 'olexandr.prykhodko@gmail.com' } 
    })
  });

  if (res && res.id) {
    console.log(`Campaign created (ID: ${res.id}), sending now...`);
    await brevoRequest(`/emailCampaigns/${res.id}/sendNow`, { method: 'POST' });
    return { ...res, sent: true };
  }

  return res;
}
