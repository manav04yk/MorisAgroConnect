const getSalesforceAccessToken = async () => {
  const {
    SALESFORCE_LOGIN_URL,
    SALESFORCE_USERNAME,
    SALESFORCE_PASSWORD,
    SALESFORCE_SECURITY_TOKEN,
    SALESFORCE_CONSUMER_KEY,
    SALESFORCE_CONSUMER_SECRET
  } = process.env;

  if (
    !SALESFORCE_LOGIN_URL ||
    !SALESFORCE_USERNAME ||
    !SALESFORCE_PASSWORD ||
    !SALESFORCE_SECURITY_TOKEN ||
    !SALESFORCE_CONSUMER_KEY ||
    !SALESFORCE_CONSUMER_SECRET
  ) {
    console.warn('Salesforce auth skipped: missing Salesforce environment variables');
    return null;
  }

  const params = new URLSearchParams();

  params.append('grant_type', 'password');
  params.append('client_id', SALESFORCE_CONSUMER_KEY);
  params.append('client_secret', SALESFORCE_CONSUMER_SECRET);
  params.append('username', SALESFORCE_USERNAME);
  params.append('password', `${SALESFORCE_PASSWORD}${SALESFORCE_SECURITY_TOKEN}`);

  const response = await fetch(SALESFORCE_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Salesforce login failed:', data);
    return null;
  }

  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url
  };
};

const formatDateForSalesforce = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === 'string') {
    return dateValue.split('T')[0];
  }

  return new Date(dateValue).toISOString().split('T')[0];
};

const forwardDemandRequestToSalesforce = async (request) => {
  try {
    const auth = await getSalesforceAccessToken();

    if (!auth) {
      console.warn('Salesforce forward skipped: could not get access token');
      return;
    }

    const restPath =
      process.env.SALESFORCE_REST_URL ||
      '/services/apexrest/agroconnect/v1/demandrequest';

    const url = `${auth.instanceUrl}${restPath}`;

    const payload = {
      request_id: request.id,
      buyer_id: request.buyer_id,
      product_name: request.product_name,
      quantity_kg: Number(request.quantity_kg),
      required_date: formatDateForSalesforce(request.required_date)
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('Salesforce forward failed:', {
        status: response.status,
        response: text
      });
      return;
    }

    console.log('Demand request forwarded to Salesforce:', {
      request_id: request.id,
      response: text
    });
  } catch (error) {
    console.error('Salesforce forward failed non-blocking:', error.message);
  }
};

module.exports = {
  forwardDemandRequestToSalesforce
};