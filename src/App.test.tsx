import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

// Mock the Google Maps API loader
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true, loadError: null }),
  GoogleMap: () => <div data-testid="google-map" />,
  Polygon: () => null,
}))

describe('App component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })
})
