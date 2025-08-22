import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../../../utils/connectwise';
import axios from 'axios';

export async function GET(request, { params }) {
  try {
    const { baseUrl, headers } = getConnectWiseConfig();
    const { id } = params;

    // Fetch ticket documents/attachments from ConnectWise API
    const response = await axios.get(`${baseUrl}/system/documents?recordType=Ticket&recordId=${id}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching ticket documents:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch ticket documents',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}