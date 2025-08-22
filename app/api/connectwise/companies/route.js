import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../utils/connectwise';
import axios from 'axios';

export async function GET() {
  try {
    const { baseUrl, headers } = getConnectWiseConfig();

    const response = await axios.get(`${baseUrl}/company/companies`, {
      headers,
      params: {
        pageSize: 1000
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching companies:', error?.response?.data || error.message);
    const status = error.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch companies',
        details: error.message,
        response: error.response?.data
      },
      { status }
    );
  }
}
