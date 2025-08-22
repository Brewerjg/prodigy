import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../utils/connectwise';
import axios from 'axios';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const { baseUrl, headers } = getConnectWiseConfig();

    console.log('Fetching invoices for customer:', customerId);

    const response = await axios.get(`${baseUrl}/finance/invoices`, {
      headers,
      params: {
        pageSize: 1000,
        conditions: customerId ? `company/id = ${customerId}` : undefined
      }
    });

    console.log('ConnectWise API response:', response.data);

    // Ensure we're returning an array
    const invoices = Array.isArray(response.data) ? response.data : [];
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch invoices',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
} 