import { useEffect, useState } from 'react';
import { Quote, Brain, Sparkles } from 'lucide-react';
import './App.css';

interface PhantomContext {
  role: string;
  source: string;
  text: string;
  timestamp: number;
}

interface QuoteData {
  text: string;
  author: string;
  topic?: string;
  insight?: string;
}

const DEFAULT_QUOTES: QuoteData[] = [
  { text: "The unexamined life is not worth living.", author: "Socrates", topic: "Wisdom" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", topic: "Purpose" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", topic: "Action" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", topic: "Humility" }
];

function App() {
  const [context, setContext] = useState<PhantomContext | null>(null);
  const [quote, setQuote] = useState<QuoteData>(DEFAULT_QUOTES[0]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    // Load context and quote from storage
    if (chrome?.storage?.local) {
      chrome.storage.local.get(['lastContext', 'lastQuote'], (result) => {
        if (result.lastContext) {
          setContext(result.lastContext as PhantomContext);
        }
        if (result.lastQuote) {
          setQuote(result.lastQuote as QuoteData);
        }
        setLoading(false);
      });
    } else {
      // Dev mode fallback
      setLoading(false);
    }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.lastQuote) {
        setQuote(changes.lastQuote.newValue as QuoteData);
      }
      if (changes.lastContext) {
        setContext(changes.lastContext.newValue as PhantomContext);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return (
    <div className="phantom-newtab">
      <div className="content-wrapper">
        <div className="icon-wrapper">
          <Brain className="phantom-logo" size={48} />
        </div>

        <div className="quote-container">
          <Quote className="quote-icon" size={24} />
          <h1 className="quote-text">"{quote.text}"</h1>
          <p className="quote-author">— {quote.author}</p>
          {quote.topic && <span className="quote-topic">{quote.topic}</span>}
          {quote.insight && <p className="calibration-insight">{quote.insight}</p>}
        </div>

        {context && (
          <div className="context-indicator">
            <Sparkles size={16} />
            <span>Inspired by your conversation on {context.source}</span>
          </div>
        )}

        {!context && (
          <div className="context-missing">
            <span>Chat with an AI to reveal new insights...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
