import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../../utils/connectwise';
import axios from 'axios';

export async function GET(request, { params }) {
  try {
    const { baseUrl, headers } = getConnectWiseConfig();
    const { id } = params;

    // Fetch individual ticket details from ConnectWise API
    const response = await axios.get(`${baseUrl}/service/tickets/${id}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching ticket details:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch ticket details',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}