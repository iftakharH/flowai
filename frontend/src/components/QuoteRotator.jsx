import React, { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import api from '../services/api';

const fallback = [
  { text: 'Small choices become a quiet kind of freedom.', author: 'FlowAI' },
  { text: 'A budget is a plan for what matters.', author: 'FlowAI' },
  { text: 'Clarity is a better goal than perfection.', author: 'FlowAI' },
  { text: 'Your future self deserves a little room today.', author: 'FlowAI' },
];

const QuoteRotator = () => {
  const [quotes, setQuotes] = useState(fallback);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    api.get('/quotes').then(({ data }) => { if (active && data?.length) setQuotes(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % quotes.length), 7000);
    return () => window.clearInterval(timer);
  }, [quotes.length]);

  const quote = quotes[index % quotes.length];
  return <section className="quote-rotator" aria-live="polite"><Quote size={17} /><div><p>“{quote.text}”</p><span>{quote.author}</span></div><div className="quote-dots">{quotes.slice(0, Math.min(5, quotes.length)).map((_, dot) => <button type="button" key={dot} className={dot === index % Math.min(5, quotes.length) ? 'active' : ''} onClick={() => setIndex(dot)} aria-label={`Show quote ${dot + 1}`} />)}</div></section>;
};

export default QuoteRotator;
