import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CouncilDashboardPage } from '../pages/CouncilDashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Mock councilsApi
vi.mock('../api/councils', () => ({
  councilsApi: {
    getMyCouncil: vi.fn().mockResolvedValue({
      id: 'council-1',
      name: 'Buckinghamshire Council',
      council_type: 'unitary',
      region: 'South East',
      contact_name: 'Rachel Vance',
      contact_email: 'council@example.com',
      postcode: 'HP5 1AA',
      total_budget_allocated: 100000.0,
      total_budget_spent: 1728.0,
      deprivation_focus_areas: ['HP5 1', 'HP5 2'],
      created_at: '2026-08-31T00:00:00Z',
      updated_at: '2026-08-31T00:00:00Z',
    }),
    getMapData: vi.fn().mockResolvedValue({
      council: {
        id: 'council-1',
        name: 'Buckinghamshire Council',
        total_budget_allocated: 100000.0,
        total_budget_spent: 1728.0,
      },
      markers: [
        {
          id: 'biz-1',
          business_id: 'biz-1',
          name: 'Chesham Community Bike Works',
          organisation_type: 'Retail & Trade',
          address: '3 Waterside, Chesham',
          postcode: 'HP5 1PE',
          latitude: 51.706,
          longitude: -0.612,
          company_size: 'micro',
          employee_count: 3,
          wage_subsidy_status: 'pledged',
          hourly_wage_gap: 4.44,
          current_wage_offered: 7.00,
          target_wage: 11.44,
          low_income_catchment_score: 92.0,
          open_opportunities_count: 1,
          youth_mentorship_commitment: true,
          contact_name: 'Marcus Vance',
          contact_email: 'marcus@cheshambikes.org.uk',
        },
      ],
      deprivation_areas: [
        {
          ward_name: 'Chesham Waterside & Vale',
          postcode_prefix: 'HP5 1',
          deprivation_decile: 2,
          youth_population_estimate: 1240,
          low_income_family_percentage: 38.5,
          center_lat: 51.702,
          center_lng: -0.608,
          radius_meters: 1800.0,
        },
      ],
      summary: {
        total_businesses_in_area: 5,
        eligible_for_subsidy: 4,
        active_subsidised: 1,
        average_wage_gap: 4.44,
        estimated_youth_reach: 5500,
      },
    }),
    listSchemes: vi.fn().mockResolvedValue([
      {
        id: 'scheme-1',
        council_id: 'council-1',
        title: 'Buckinghamshire Youth Wage Fund 2026',
        description: 'Co-funding hourly wages for micro businesses',
        total_budget: 75000.0,
        remaining_budget: 73272.0,
        subsidy_rate_per_hour: 4.50,
        max_hours_per_week_per_youth: 16,
        max_duration_months: 6,
        target_postcodes: ['HP5', 'HP6'],
        target_sectors: ['Technology', 'Retail'],
        is_active: true,
        eligibility_criteria: {},
        allocations_count: 1,
        created_at: '2026-08-31T00:00:00Z',
        updated_at: '2026-08-31T00:00:00Z',
      },
    ]),
    listAllocations: vi.fn().mockResolvedValue([
      {
        id: 'alloc-1',
        scheme_id: 'scheme-1',
        council_id: 'council-1',
        business_id: 'biz-1',
        allocated_amount: 1728.0,
        hourly_subsidy: 4.50,
        max_hours_per_week: 16,
        duration_weeks: 24,
        status: 'active',
        business_name: 'Apex Tech Innovations',
        scheme_title: 'Buckinghamshire Youth Wage Fund 2026',
        created_at: '2026-08-31T00:00:00Z',
        updated_at: '2026-08-31T00:00:00Z',
      },
    ]),
  },
}));

// Mock apiClient for conversations
vi.mock('../api/client', () => ({
  apiClient: vi.fn().mockImplementation((endpoint: string) => {
    if (endpoint === '/conversations') {
      return Promise.resolve({
        id: 'conv-council-1',
        mode: 'council',
        messages: [
          {
            id: 'msg-1',
            role: 'assistant',
            content: 'Council AI Director ready to model wage subsidies.',
            created_at: '2026-08-31T00:00:00Z',
          },
        ],
        pending_actions: [],
      });
    }
    return Promise.resolve({});
  }),
}));

describe('CouncilDashboardPage', () => {
  it('renders council executive dashboard with budget KPIs and schemes', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CouncilDashboardPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify loading state finishes and title displays
    await waitFor(() => {
      expect(screen.getByText(/Wage Fund Allocated/i)).toBeInTheDocument();
    });

    const fundElements = screen.getAllByText(/Buckinghamshire Youth Wage Fund 2026/i);
    expect(fundElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Apex Tech Innovations/i)).toBeInTheDocument();
  });
});
