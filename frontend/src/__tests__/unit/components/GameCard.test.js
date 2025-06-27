/**
 * Unit tests for GameCard component
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockGame } from '../../utils/testUtils';
import GameCard from '../../../components/GameCard';

describe('GameCard Component', () => {
  const defaultProps = {
    game: mockGame,
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders game information correctly', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      expect(screen.getByText('Test Game')).toBeInTheDocument();
      expect(screen.getByText('Test Owner')).toBeInTheDocument();
      expect(screen.getByText('Test Shelf')).toBeInTheDocument();
      expect(screen.getByText('2-4 players')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
      expect(screen.getByText('2.5')).toBeInTheDocument(); // Complexity
      expect(screen.getByText('8.0')).toBeInTheDocument(); // Rating
    });

    test('renders game image when image_url is provided', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      const image = screen.getByAltText('Test Game');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    test('does not render image when image_url is not provided', () => {
      const gameWithoutImage = { ...mockGame, image_url: null };
      renderWithProviders(
        <GameCard {...defaultProps} game={gameWithoutImage} />
      );

      expect(screen.queryByAltText('Test Game')).not.toBeInTheDocument();
    });

    test('handles single player count correctly', () => {
      const singlePlayerGame = { 
        ...mockGame, 
        min_players: 1, 
        max_players: 1 
      };
      renderWithProviders(
        <GameCard {...defaultProps} game={singlePlayerGame} />
      );

      expect(screen.getByText('1 players')).toBeInTheDocument();
    });

    test('renders BGG rank when available', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      expect(screen.getByText('#150')).toBeInTheDocument(); // BGG rank
    });

    test('renders acquisition price when available', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      expect(screen.getByText('$49.99')).toBeInTheDocument();
    });

    test('renders purchase date when available', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      expect(screen.getByText('Jan 15, 2023')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('calls onEdit when edit button is clicked', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockGame);
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    test('calls onDelete when delete button is clicked', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockGame.id);
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    test('shows hover effects on card', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      const card = screen.getByRole('article'); // Assuming the card has article role
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('hover:scale-105');
    });
  });

  describe('Optional Props Handling', () => {
    test('works without onEdit callback', () => {
      const propsWithoutEdit = { ...defaultProps, onEdit: undefined };
      renderWithProviders(<GameCard {...propsWithoutEdit} />);

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    test('works without onDelete callback', () => {
      const propsWithoutDelete = { ...defaultProps, onDelete: undefined };
      renderWithProviders(<GameCard {...propsWithoutDelete} />);

      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    test('handles missing optional game fields gracefully', () => {
      const minimalGame = {
        id: 1,
        name: 'Minimal Game',
        owner: 'Owner',
        // All optional fields missing
      };

      renderWithProviders(
        <GameCard {...defaultProps} game={minimalGame} />
      );

      expect(screen.getByText('Minimal Game')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      // Should not crash when optional fields are missing
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes correctly', () => {
      renderWithProviders(<GameCard {...defaultProps} />, { theme: 'dark' });

      const card = screen.getByText('Test Game').closest('div');
      expect(card).toHaveClass('dark:bg-gray-800');
      expect(card).toHaveClass('dark:text-white');
    });
  });

  describe('Responsive Design', () => {
    test('has responsive grid classes', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      const card = screen.getByText('Test Game').closest('div');
      // Check for responsive classes (this depends on your actual implementation)
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('shadow-md');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(editButton).toHaveAttribute('aria-label', 'Edit Test Game');
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete Test Game');
    });

    test('supports keyboard navigation', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(editButton).toHaveAttribute('tabIndex', '0');
      expect(deleteButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Data Formatting', () => {
    test('formats playing time correctly', () => {
      const gameWithLongTime = { ...mockGame, playing_time: 150 };
      renderWithProviders(
        <GameCard {...defaultProps} game={gameWithLongTime} />
      );

      expect(screen.getByText('150 min')).toBeInTheDocument();
    });

    test('formats complexity with one decimal place', () => {
      const gameWithComplexity = { ...mockGame, complexity: 3.76543 };
      renderWithProviders(
        <GameCard {...defaultProps} game={gameWithComplexity} />
      );

      expect(screen.getByText('3.8')).toBeInTheDocument();
    });

    test('formats rating with one decimal place', () => {
      const gameWithRating = { ...mockGame, personal_rating: 7.666 };
      renderWithProviders(
        <GameCard {...defaultProps} game={gameWithRating} />
      );

      expect(screen.getByText('7.7')).toBeInTheDocument();
    });

    test('formats price correctly', () => {
      const gameWithPrice = { ...mockGame, acquisition_price: 123.456 };
      renderWithProviders(
        <GameCard {...defaultProps} game={gameWithPrice} />
      );

      expect(screen.getByText('$123.46')).toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    test('renders game tags when present', () => {
      const gameWithTags = {
        ...mockGame,
        tags: [
          { id: 1, name: 'Strategy', color: '#FF5733' },
          { id: 2, name: 'Euro', color: '#33C3FF' }
        ]
      };

      renderWithProviders(
        <GameCard {...defaultProps} game={gameWithTags} />
      );

      expect(screen.getByText('Strategy')).toBeInTheDocument();
      expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    test('does not show tags section when no tags', () => {
      renderWithProviders(<GameCard {...defaultProps} />);

      // Assuming tags are in a specific container
      expect(screen.queryByTestId('game-tags')).not.toBeInTheDocument();
    });
  });
});