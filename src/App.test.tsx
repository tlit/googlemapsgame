import { describe, it, expect, vi, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

// Mock the Google Maps API loader
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true, loadError: null }),
  GoogleMap: () => <div data-testid="google-map" />,
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
    const mapElement = screen.getByTestId('google-map')
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

    const input = screen.getByPlaceholderText('Enter a country name')
    const submitButton = screen.getByRole('button')

    // First submission
    fireEvent.change(input, { target: { value: 'France' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Correct! France added.')).toBeInTheDocument()
    })

    // Second submission (duplicate)
    fireEvent.change(input, { target: { value: 'France' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('You already entered this country!')).toBeInTheDocument()
    })
  })

  it('handles invalid country name', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });

    render(<App />);

    const input = screen.getByPlaceholderText('Enter a country name');
    const submitButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid country name. Try again!')).toBeInTheDocument();
    });
  });
})
