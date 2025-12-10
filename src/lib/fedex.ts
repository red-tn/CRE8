interface FedExAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface FedExShipmentRequest {
  recipientName: string
  recipientCompany?: string
  recipientStreet: string
  recipientStreet2?: string
  recipientCity: string
  recipientState: string
  recipientZip: string
  recipientCountry: string
  recipientPhone?: string
  weight: number // in lbs
  length?: number // in inches
  width?: number // in inches
  height?: number // in inches
  serviceType?: 'FEDEX_GROUND' | 'FEDEX_EXPRESS_SAVER' | 'FEDEX_2_DAY' | 'PRIORITY_OVERNIGHT' | 'STANDARD_OVERNIGHT'
  packageType?: 'YOUR_PACKAGING' | 'FEDEX_BOX' | 'FEDEX_PAK' | 'FEDEX_TUBE' | 'FEDEX_ENVELOPE'
  reference?: string
}

interface FedExShipmentResponse {
  trackingNumber: string
  labelBase64: string
  labelUrl?: string
}

// Cache for auth token
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const clientId = process.env.FEDEX_CLIENT_ID
  const clientSecret = process.env.FEDEX_CLIENT_SECRET
  const apiUrl = process.env.FEDEX_API_URL || 'https://apis-sandbox.fedex.com'

  if (!clientId || !clientSecret) {
    throw new Error('FedEx API credentials not configured')
  }

  const response = await fetch(`${apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('FedEx auth error:', error)
    throw new Error(`FedEx authentication failed: ${response.status}`)
  }

  const data: FedExAuthResponse = await response.json()

  // Cache the token (expire 5 minutes early to be safe)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }

  return data.access_token
}

export async function createShipment(request: FedExShipmentRequest): Promise<FedExShipmentResponse> {
  const token = await getAuthToken()
  const apiUrl = process.env.FEDEX_API_URL || 'https://apis-sandbox.fedex.com'
  const accountNumber = process.env.FEDEX_ACCOUNT_NUMBER

  if (!accountNumber) {
    throw new Error('FedEx account number not configured')
  }

  const shipmentPayload = {
    labelResponseOptions: 'LABEL',
    requestedShipment: {
      shipper: {
        contact: {
          personName: process.env.SHIP_FROM_COMPANY || 'CRE8 Truck Club',
          phoneNumber: process.env.SHIP_FROM_PHONE || '0000000000',
        },
        address: {
          streetLines: [process.env.SHIP_FROM_STREET || ''],
          city: process.env.SHIP_FROM_CITY || '',
          stateOrProvinceCode: process.env.SHIP_FROM_STATE || '',
          postalCode: process.env.SHIP_FROM_ZIP || '',
          countryCode: process.env.SHIP_FROM_COUNTRY || 'US',
        },
      },
      recipients: [
        {
          contact: {
            personName: request.recipientName,
            companyName: request.recipientCompany,
            phoneNumber: request.recipientPhone || '0000000000',
          },
          address: {
            streetLines: [
              request.recipientStreet,
              request.recipientStreet2,
            ].filter(Boolean),
            city: request.recipientCity,
            stateOrProvinceCode: request.recipientState,
            postalCode: request.recipientZip,
            countryCode: request.recipientCountry || 'US',
          },
        },
      ],
      shipDatestamp: new Date().toISOString().split('T')[0],
      serviceType: request.serviceType || 'FEDEX_GROUND',
      packagingType: request.packageType || 'YOUR_PACKAGING',
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      blockInsightVisibility: false,
      shippingChargesPayment: {
        paymentType: 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: {
              value: accountNumber,
            },
          },
        },
      },
      labelSpecification: {
        imageType: 'PDF',
        labelStockType: 'PAPER_4X6',
      },
      requestedPackageLineItems: [
        {
          weight: {
            units: 'LB',
            value: request.weight || 1,
          },
          dimensions: request.length && request.width && request.height ? {
            length: request.length,
            width: request.width,
            height: request.height,
            units: 'IN',
          } : undefined,
          customerReferences: request.reference ? [
            {
              customerReferenceType: 'CUSTOMER_REFERENCE',
              value: request.reference,
            },
          ] : undefined,
        },
      ],
    },
    accountNumber: {
      value: accountNumber,
    },
  }

  const response = await fetch(`${apiUrl}/ship/v1/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-locale': 'en_US',
    },
    body: JSON.stringify(shipmentPayload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('FedEx shipment error:', error)
    throw new Error(`FedEx shipment creation failed: ${response.status} - ${error}`)
  }

  const data = await response.json()

  // Extract tracking number and label from response
  const trackingNumber = data.output?.transactionShipments?.[0]?.pieceResponses?.[0]?.trackingNumber
  const labelBase64 = data.output?.transactionShipments?.[0]?.pieceResponses?.[0]?.packageDocuments?.[0]?.encodedLabel

  if (!trackingNumber) {
    console.error('FedEx response:', JSON.stringify(data, null, 2))
    throw new Error('No tracking number in FedEx response')
  }

  return {
    trackingNumber,
    labelBase64: labelBase64 || '',
  }
}

export async function validateAddress(address: {
  street: string
  street2?: string
  city: string
  state: string
  zip: string
  country?: string
}): Promise<{ valid: boolean; suggestions?: string[] }> {
  const token = await getAuthToken()
  const apiUrl = process.env.FEDEX_API_URL || 'https://apis-sandbox.fedex.com'

  const payload = {
    addressesToValidate: [
      {
        address: {
          streetLines: [address.street, address.street2].filter(Boolean),
          city: address.city,
          stateOrProvinceCode: address.state,
          postalCode: address.zip,
          countryCode: address.country || 'US',
        },
      },
    ],
  }

  const response = await fetch(`${apiUrl}/address/v1/addresses/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-locale': 'en_US',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    console.error('FedEx address validation error')
    return { valid: true } // Default to valid if service fails
  }

  const data = await response.json()
  const result = data.output?.resolvedAddresses?.[0]

  return {
    valid: result?.classification === 'RESOLVED',
    suggestions: result?.streetLinesToken,
  }
}

export function getServiceTypes() {
  return [
    { value: 'FEDEX_GROUND', label: 'FedEx Ground (3-5 days)' },
    { value: 'FEDEX_EXPRESS_SAVER', label: 'FedEx Express Saver (3 days)' },
    { value: 'FEDEX_2_DAY', label: 'FedEx 2Day' },
    { value: 'STANDARD_OVERNIGHT', label: 'FedEx Standard Overnight' },
    { value: 'PRIORITY_OVERNIGHT', label: 'FedEx Priority Overnight' },
  ]
}
