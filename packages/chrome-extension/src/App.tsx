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
    // Load context from storage
    if (chrome?.storage?.local) {
      chrome.storage.local.get(['lastContext'], (result) => {
        if (result.lastContext) {
          setContext(result.lastContext as PhantomContext);
          // TODO: In the future, fetch a real dynamic quote based on this context
          // For now, simple random selection or deterministic mapping
          const randomQuote = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
          setQuote(randomQuote);
        }
        setLoading(false);
      });
    } else {
      // Dev mode fallback
      setLoading(false);
    }
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
