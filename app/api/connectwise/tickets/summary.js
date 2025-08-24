import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../../utils/connectwise';
import axios from 'axios';

export const GET = withTenantAuth(handleGetCompanies);
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }
    const { baseUrl, headers } = getConnectWiseConfig();

    // Fetch all tickets for the company (excluding closed)
    const response = await axios.get(`${baseUrl}/service/tickets`, {
      headers,
      params: {
        pageSize: 1000,
        orderBy: 'dateEntered desc',
        conditions: `status/name != "Closed" AND company/id = ${companyId}`
      }
    });
    const tickets = Array.isArray(response.data) ? response.data : [];

    // Count tickets per status
    const summary = {};
    for (const ticket of tickets) {
      let status = typeof ticket.status === 'object' ? ticket.status?.name : ticket.status || 'Unknown';
      // Normalize status (e.g., "New*" -> "New", "Closed (Merged)" -> "Closed")
      status = status.replace(/\*|\(.*\)/g, '').trim();
      summary[status] = (summary[status] || 0) + 1;
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching ticket summary:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch ticket summary',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
} 