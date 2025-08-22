import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../../utils/connectwise';
import axios from 'axios';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { baseUrl, headers } = getConnectWiseConfig();

    const response = await axios.get(`${baseUrl}/finance/invoices/${id}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching invoice:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch invoice',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
} 