import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ForecastList } from './ForecastList';

describe('ForecastList', () => {
  it('renders list of days with min/max', () => {
    render(
      <ForecastList
        title="Previsão"
        days={[
          { date: '2025-09-10', min: 18, max: 28, code: 1 },
          { date: '2025-09-11', min: 19, max: 29, code: 2 },
        ]}
      />
    );

    expect(screen.getByText('Previsão')).toBeInTheDocument();
    expect(screen.getAllByText(/Min .*°C · Max .*°C/).length).toBe(2);
  });
});


