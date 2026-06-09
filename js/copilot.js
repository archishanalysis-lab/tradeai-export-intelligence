const API_BASE_URL = window.TRADEAI_API_URL
  || 'https://tradeai-backend.onrender.com';

const btn = document.getElementById('ask-copilot-btn')
         || document.querySelector('button');
const input = document.getElementById('copilot-input')
           || document.querySelector('textarea, input[type=text]');
const loading = document.getElementById('copilot-loading');
const response = document.getElementById('copilot-response');
const errorDiv = document.getElementById('copilot-error');

btn.addEventListener('click', async () => {
  const question = input.value.trim();
  if (!question) return;

  // Reset state
  loading.style.display = 'block';
  response.style.display = 'none';
  errorDiv.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Analyzing...';

  try {
    const token = localStorage.getItem('tradeai_token');
    const res = await fetch(API_BASE_URL + '/api/copilot/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': 'Bearer ' + token })
      },
      body: JSON.stringify({ question })
    });

    if (!res.ok) throw new Error('Backend returned ' + res.status);
    const data = await res.json();

    // Populate response card
    document.getElementById('copilot-provider-label')
      .textContent = data.provider || data.providerLabel || 'TradeAI Rule Engine';
    document.getElementById('copilot-market-opportunity')
      .textContent = data.marketOpportunity || '';
    document.getElementById('copilot-buyer-type')
      .textContent = data.buyerType || '';
    document.getElementById('copilot-risk-level')
      .textContent = data.riskLevel || '';

    const docsList = document.getElementById('copilot-documents');
    docsList.innerHTML = '';
    (data.documentsNeeded || []).forEach(d => {
      const li = document.createElement('li');
      li.textContent = d;
      docsList.appendChild(li);
    });

    const actionsList = document.getElementById('copilot-next-actions');
    actionsList.innerHTML = '';
    (data.nextActions || []).forEach(a => {
      const li = document.createElement('li');
      li.textContent = a;
      actionsList.appendChild(li);
    });

    document.getElementById('copilot-disclaimer')
      .textContent = data.disclaimer || '';

    loading.style.display = 'none';
    response.style.display = 'block';

  } catch (err) {
    // Show fallback rule-based response if backend fails
    const fallback = getRuleBasedFallback(input.value);
    document.getElementById('copilot-provider-label')
      .textContent = 'TradeAI Rule Engine (offline preview)';
    document.getElementById('copilot-market-opportunity')
      .textContent = fallback.marketOpportunity;
    document.getElementById('copilot-buyer-type')
      .textContent = fallback.buyerType;
    document.getElementById('copilot-risk-level')
      .textContent = fallback.riskLevel;

    const docsList = document.getElementById('copilot-documents');
    docsList.innerHTML = '';
    fallback.documentsNeeded.forEach(d => {
      const li = document.createElement('li');
      li.textContent = d;
      docsList.appendChild(li);
    });

    const actionsList = document.getElementById('copilot-next-actions');
    actionsList.innerHTML = '';
    fallback.nextActions.forEach(a => {
      const li = document.createElement('li');
      li.textContent = a;
      actionsList.appendChild(li);
    });

    document.getElementById('copilot-disclaimer')
      .textContent = fallback.disclaimer;

    loading.style.display = 'none';
    response.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ask Copilot';
  }
});

function getRuleBasedFallback(question) {
  const q = question.toLowerCase();
  const isGulf = /uae|dubai|saudi|oman|qatar|gulf/.test(q);
  const isAfrica = /kenya|tanzania|uganda|rwanda|africa/.test(q);
  const isChina = /china|sourcing|supplier/.test(q);
  const isPharma = /pharma|medicine|drug|chemical/.test(q);

  if (isGulf) return {
    marketOpportunity: 'Gulf markets (UAE, Saudi Arabia, Oman, Qatar) show strong demand for Indian food products, textiles, and engineering goods. UAE is a major re-export hub reaching 50+ countries.',
    buyerType: 'Distributors, wholesale importers, retail chains, re-exporters',
    riskLevel: 'Medium - payment terms generally reliable via LC or TT. Regulatory compliance required.',
    documentsNeeded: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Bill of Lading', isPharma ? 'Gulf Health Authority approval' : 'SASO/ESMA certification where applicable'],
    nextActions: ['Validate HS code for Gulf tariff schedule', 'Check SASO requirements for Saudi Arabia', 'Register on TradeAI to access buyer directory', 'Generate full corridor report'],
    disclaimer: 'Rule-based preview. Upgrade to AI plan for live buyer data and verified compliance guidance.'
  };

  if (isAfrica) return {
    marketOpportunity: 'East Africa is a growing market for Indian pharmaceuticals, food products, and consumer goods. Kenya is the primary entry point with access to the EAC bloc.',
    buyerType: 'Distributors, institutional buyers (hospitals, government), retail importers',
    riskLevel: 'Medium-High - verify buyer creditworthiness. LC recommended for first shipments.',
    documentsNeeded: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Bill of Lading', isPharma ? 'Pharmacy Board approval (Kenya PPB)' : 'PVoC Pre-export Verification of Conformity'],
    nextActions: ['Check Kenya Bureau of Standards (KEBS) requirements', 'Validate HS code against EAC tariff', 'Request buyer discovery report', 'Generate Kenya corridor report'],
    disclaimer: 'Rule-based preview. Upgrade to AI plan for live buyer data and verified compliance guidance.'
  };

  if (isChina) return {
    marketOpportunity: 'China is primarily a sourcing market for Indian importers. Strong for machinery, electronics components, raw materials and consumer goods.',
    buyerType: 'Chinese manufacturers, trading companies, OEM suppliers',
    riskLevel: 'Medium - supplier verification critical. Quality inspection recommended before shipment.',
    documentsNeeded: ['Proforma Invoice', 'Packing List', 'Bill of Lading', 'Import Declaration', 'Quality Inspection Certificate'],
    nextActions: ['Identify product category and Chinese HS code equivalent', 'Request supplier verification workflow', 'Compare 3 suppliers before committing', 'Review import duty on Indian side'],
    disclaimer: 'Rule-based preview. Upgrade to AI plan for live supplier data and sourcing intelligence.'
  };

  return {
    marketOpportunity: 'TradeAI covers 9 markets across East Africa (Kenya, Tanzania, Uganda, Rwanda), Gulf (UAE, Saudi Arabia, Oman, Qatar) and China sourcing.',
    buyerType: 'Distributors, importers, institutional buyers depending on corridor',
    riskLevel: 'Varies by corridor and product category',
    documentsNeeded: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Bill of Lading'],
    nextActions: ['Specify your target country for tailored guidance', 'Generate an export opportunity report', 'Check HS code for your product', 'Review corridor comparison'],
    disclaimer: 'Rule-based preview. Type a country name (Kenya, UAE, China) for specific guidance.'
  };
}
