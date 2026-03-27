export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, payload, product_id } = req.body;
  if (!token || !payload) return res.status(400).json({ error: 'Missing token or payload' });

  // Маппинг полей нашей формы → поля rko-partner.com
  let orderPayload;

  if (product_id === 519) {
    // РКО Альфа-Банк
    orderPayload = {
      products: [519],
      naimenovanie_organizacii: payload.company_name || '',
      inn: payload.inn || '',
      iuridiceskii_adres: payload.legal_address || '',
      gorod_obsluzhivaniia: payload.city || '',
      kontaktnoe_lico: payload.contact_person || '',
      elektronnaia_pochta: payload.email || '',
      telefon: payload.phone || '',
    };
  } else {
    // Регистрация бизнеса
    orderPayload = {
      products: [520],
      fio_rukovoditelia: payload.full_name || '',
      inn: payload.inn || '',
      elektronnaia_pochta: payload.email || '',
      telefon: payload.phone || '',
      gorod_obsluzhivaniia: payload.city || '',
    };
  }

  try {
    const response = await fetch('https://rko-partner.com/api/app/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
