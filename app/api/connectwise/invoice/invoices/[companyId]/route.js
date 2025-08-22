// app/api/connectwise/invoices/[companyId]/route.js
import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../../../utils/connectwise';
import axios from 'axios';

export async function GET(req, { params }) {
  const { Id } = params;
  if (!Id) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
  }

  const { baseUrl, headers } = getConnectWiseConfig();
  try {
    const url = `${baseUrl}/finance/invoices?conditions=company/id=${Id}&orderBy=id%20desc&pageSize=2`;
    const { data } = await axios.get(url, { headers });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching last two invoices:', err);
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: err.message },
      { status: err.response?.status || 500 }
    );
  }
}
