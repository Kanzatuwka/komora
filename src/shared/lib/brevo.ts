/**
 * Brevo REST API Client
 */

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const BREVO_LIST_ID = Number(import.meta.env.VITE_BREVO_LIST_ID);

/**
 * Brevo Template IDs mapped by language
 */
const TEMPLATES: Record<string, any> = {
  uk: {
    DOI_CONFIRM: Number(import.meta.env.VITE_BREVO_DOI_CONFIRM_UK),
    DOI_WELCOME: Number(import.meta.env.VITE_BREVO_DOI_WELCOME_UK),
    ORDER_PLACED: Number(import.meta.env.VITE_BREVO_ORDER_PLACED_UK),
    ORDER_CONFIRMED: Number(import.meta.env.VITE_BREVO_ORDER_CONFIRMED_UK),
    ORDER_IN_TRANSIT: Number(import.meta.env.VITE_BREVO_ORDER_IN_TRANSIT_UK),
    ORDER_DELIVERED: Number(import.meta.env.VITE_BREVO_ORDER_DELIVERED_UK),
    ORDER_CANCELLED: Number(import.meta.env.VITE_BREVO_ORDER_CANCELLED_UK),
  },
  en: {
    DOI_CONFIRM: Number(import.meta.env.VITE_BREVO_DOI_CONFIRM_EN),
    DOI_WELCOME: Number(import.meta.env.VITE_BREVO_DOI_WELCOME_EN),
    ORDER_PLACED: Number(import.meta.env.VITE_BREVO_ORDER_PLACED_EN),
    ORDER_CONFIRMED: Number(import.meta.env.VITE_BREVO_ORDER_CONFIRMED_EN),
    ORDER_IN_TRANSIT: Number(import.meta.env.VITE_BREVO_ORDER_IN_TRANSIT_EN),
    ORDER_DELIVERED: Number(import.meta.env.VITE_BREVO_ORDER_DELIVERED_EN),
    ORDER_CANCELLED: Number(import.meta.env.VITE_BREVO_ORDER_CANCELLED_EN),
  },
  de: {
    DOI_CONFIRM: Number(import.meta.env.VITE_BREVO_DOI_CONFIRM_DE),
    DOI_WELCOME: Number(import.meta.env.VITE_BREVO_DOI_WELCOME_DE),
    ORDER_PLACED: Number(import.meta.env.VITE_BREVO_ORDER_PLACED_DE),
    ORDER_CONFIRMED: Number(import.meta.env.VITE_BREVO_ORDER_CONFIRMED_DE),
    ORDER_IN_TRANSIT: Number(import.meta.env.VITE_BREVO_ORDER_IN_TRANSIT_DE),
    ORDER_DELIVERED: Number(import.meta.env.VITE_BREVO_ORDER_DELIVERED_DE),
    ORDER_CANCELLED: Number(import.meta.env.VITE_BREVO_ORDER_CANCELLED_DE),
  }
};

const BREVO_API_URL = 'https://api.brevo.com/v3';

const BREVO_SENDER = { 
  name: import.meta.env.VITE_BREVO_SENDER_NAME || 'Komora', 
  email: import.meta.env.VITE_BREVO_SENDER_EMAIL || 'olexandr.prykhodko@gmail.com' 
};

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

export async function subscribe(email: string, language: 'uk' | 'en' | 'de' = 'uk') {
  const templates = TEMPLATES[language] || TEMPLATES.uk;
  if (!templates.DOI_CONFIRM) {
    throw new Error(`DOI_CONFIRM template ID for ${language} is missing`);
  }
  return sendTransactional({
    to: email,
    templateId: templates.DOI_CONFIRM,
    params: { 
      confirmUrl: `${window.location.origin}/subscription-confirmed?email=${encodeURIComponent(email)}&lang=${language}`
    }
  });
}

export async function confirmSubscription(email: string, language: 'uk' | 'en' | 'de' = 'uk') {
  if (!BREVO_LIST_ID) {
    console.warn('VITE_BREVO_LIST_ID is missing, skipping list assignment');
  } else {
    // Add to contact list
    await brevoRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
        attributes: {
          USER_LANGUAGE: language.toUpperCase()
        }
      })
    }).catch(err => console.warn('Failed to add to contacts list:', err));
  }

  // Send welcome email
  const templates = TEMPLATES[language] || TEMPLATES.uk;
  if (templates.DOI_WELCOME) {
    return sendTransactional({
      to: email,
      templateId: templates.DOI_WELCOME
    });
  }
}

export async function sendTransactional({ to, templateId, params }: { to: string, templateId: number, params?: any }) {
  const body: any = {
    sender: BREVO_SENDER,
    to: [{ email: to }],
    templateId
  };

  if (params && Object.keys(params).length > 0) {
    body.params = params;
  }

  return brevoRequest('/smtp/email', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

/**
 * Bulk transactional send (useful for localized newsletters)
 */
export async function sendBulkTransactional({ 
  to, 
  templateId, 
  params,
  subject,
  htmlContent
}: { 
  to: string[], 
  templateId?: number, 
  params?: any,
  subject?: string,
  htmlContent?: string
}) {
  const body: any = {
    sender: BREVO_SENDER,
    to: to.map(email => ({ email }))
  };

  if (templateId) body.templateId = templateId;
  if (htmlContent) body.htmlContent = htmlContent;
  if (subject) body.subject = subject;
  if (params && Object.keys(params).length > 0) {
    body.params = params;
  }

  return brevoRequest('/smtp/email', {
    method: 'POST',
    body: JSON.stringify(body)
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
      sender: BREVO_SENDER
    })
  });

  if (res && res.id) {
    console.log(`Campaign created (ID: ${res.id}), sending now...`);
    await brevoRequest(`/emailCampaigns/${res.id}/sendNow`, { method: 'POST' });
    return { ...res, sent: true };
  }

  return res;
}

export function getTemplateId(type: keyof typeof TEMPLATES.uk, language: string): number {
  const lang = (TEMPLATES[language] ? language : 'uk') as string;
  return TEMPLATES[lang][type];
}
