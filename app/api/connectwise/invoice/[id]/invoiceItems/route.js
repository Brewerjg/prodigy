import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../../../utils/connectwise';
import axios from 'axios';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const { baseUrl, headers } = getConnectWiseConfig();

    const response = await axios.get(`${baseUrl}/procurement/products?conditions=invoice/id=${id}`, { headers });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching invoice items:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch invoice items',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}
