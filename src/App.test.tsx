import { describe, it, expect, vi, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'
import { TEST_IDS } from './testIds'

// Mock the Google Maps API loader
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true, loadError: null }),
  GoogleMap: () => <div data-testid={TEST_IDS.GOOGLE_MAP} />,
  Polygon: () => null,
}))

// Mock fetch function
global.fetch = vi.fn() as unknown as typeof fetch;

describe('App component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('renders the Google Map component', () => {
    render(<App />)
    const mapElement = screen.getByTestId(TEST_IDS.GOOGLE_MAP)
    expect(mapElement).toBeInTheDocument()
  })

  it('handles duplicate country name entries', async () => {
    // Mock successful API responses
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ name: { common: 'France' } }])
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ geojson: { type: 'Polygon', coordinates: [[]] } }])
    })

    render(<App />)

    const input = screen.getByTestId(TEST_IDS.COUNTRY_INPUT)
    const submitButton = screen.getByTestId(TEST_IDS.SUBMIT_BUTTON)

    // First submission
    fireEvent.change(input, { target: { value: 'France' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.FEEDBACK_MESSAGE)).toHaveTextContent('Correct! France added.')
    })

    // Second submission (duplicate)
    fireEvent.change(input, { target: { value: 'France' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.FEEDBACK_MESSAGE)).toHaveTextContent('You already entered this country!')
    })
  })

  it('handles invalid country name', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    });

    render(<App />);

    const input = screen.getByTestId(TEST_IDS.COUNTRY_INPUT);
    const submitButton = screen.getByTestId(TEST_IDS.SUBMIT_BUTTON);

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.FEEDBACK_MESSAGE)).toHaveTextContent('Invalid country name: "abc". Try again!')
    });
  });
})
