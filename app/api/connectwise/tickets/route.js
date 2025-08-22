import { NextResponse } from 'next/server';
import { getConnectWiseConfig } from '../../../utils/connectwise';
import axios from 'axios';

export async function GET(request) {
  try {
    const { baseUrl, headers } = getConnectWiseConfig();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const pageSize = searchParams.get('pageSize') || '1000'; // Default to 1000 for dashboard stats
    const includeAll = searchParams.get('includeAll') === 'true';
    const companyId = searchParams.get('companyId');
    
    // Build API parameters
    const params = {
      pageSize: parseInt(pageSize),
      orderBy: 'dateEntered desc'
    };
    
    // Add conditions based on parameters
    const conditions = [];
    
    // If not includeAll, exclude closed tickets (for live ticker)
    if (!includeAll) {
      conditions.push('status/name != "Closed"');
    }
    
    // Filter by company if specified
    if (companyId) {
      conditions.push(`company/id = ${companyId}`);
    }
    
    // Add conditions to params if any exist
    if (conditions.length > 0) {
      params.conditions = conditions.join(' AND ');
    }

    // Fetch tickets from ConnectWise API
    const response = await axios.get(`${baseUrl}/service/tickets`, {
      headers,
      params
    });

    // Ensure we're returning an array
    const tickets = Array.isArray(response.data) ? response.data : [];
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch tickets',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
} 