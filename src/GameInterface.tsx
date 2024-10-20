import React from 'react';
import { MapPin } from 'lucide-react';
import { TEST_IDS } from './testIds'; // Import the test IDs

interface GameInterfaceProps {
  score: number;
  inputValue: string;
  isLoading: boolean;
  message: string;
  countries: string[];
  inputRef: React.RefObject<HTMLInputElement>;
  handleSubmit: (e: React.FormEvent) => void;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  score,
  inputValue,
  isLoading,
  message,
  countries,
  inputRef,
  handleSubmit,
  setInputValue,
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md" data-testid={TEST_IDS.GAME_INTERFACE}>
      <h1 className="text-2xl font-bold mb-2" data-testid={TEST_IDS.GAME_TITLE}>Country Game</h1>
      <p className="mb-2" data-testid={TEST_IDS.SCORE_DISPLAY}>Score: {score}</p>
      <form onSubmit={handleSubmit} className="flex items-center" data-testid={TEST_IDS.COUNTRY_FORM}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a country name"
          className="border border-gray-300 rounded-l px-4 py-2 w-full"
          disabled={isLoading}
          data-testid={TEST_IDS.COUNTRY_INPUT}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600" disabled={isLoading} data-testid={TEST_IDS.SUBMIT_BUTTON}>
          {isLoading ? 'Loading...' : <MapPin size={24} />}
        </button>
      </form>
      {message && <p className="mt-2 text-sm" data-testid={TEST_IDS.FEEDBACK_MESSAGE}>{message}</p>}
      <div className="mt-4 max-h-40 overflow-y-auto" data-testid={TEST_IDS.COUNTRY_LIST}>
        <ul className="list-disc pl-5">
          {countries.map((country, index) => (
            <li key={index} className="text-sm" data-testid={TEST_IDS.COUNTRY_ITEM(index)}>{country}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameInterface;
