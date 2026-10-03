import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, Check, ChevronDown, CircleDollarSign, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { plans } from '../config/plans';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    document.title = 'FlowAI - A clearer view of your money';
    return () => { document.title = 'FlowAI - A clearer view of your money'; };
  }, []);

  const faqs = [
    ['Is FlowAI a bank?', 'No. FlowAI is a private planning layer for the accounts and transactions you choose to track.'],
    ['Can I start without a subscription?', 'Yes. The Free plan covers manual transactions, budgets, an affordability check, and the core money view.'],
    ['What makes Pro different?', 'Pro watches for recurring commitments, unusual spending, forecasts, goals, and monthly reports.'],
  ];

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <a href="#top" className="brand-lockup"><span className="brand-mark"><CircleDollarSign size={18} /></span><span><span className="brand-name">FlowAI</span><span className="brand-note">personal finance</span></span></a>
        <div className="landing-links"><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
        <div className="landing-actions"><Link to="/login" className="button-quiet">Sign in</Link><Link to="/register" className="button-primary">Start free <ArrowRight size={16} /></Link></div>
      </nav>

      <section id="top" className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">A calmer money habit</p>
          <h1>Make your next money decision with a clearer head.</h1>
          <p className="landing-lead">FlowAI turns everyday entries into a simple read on what is available, what is changing, and what deserves your attention.</p>
          <div className="landing-cta"><Link to="/register" className="button-primary">Build your first view <ArrowRight size={16} /></Link><a href="#how" className="button-quiet">See how it works</a></div>
          <div className="landing-trust"><ShieldCheck size={16} /> Firebase-secured. Built for your decisions, not your data.</div>
        </div>
        <div className="product-preview" aria-label="FlowAI product preview">
          <div className="preview-top"><span>Available balance</span><span className="preview-live"><i /> live view</span></div>
          <strong>$4,280</strong>
          <p>+12.4% from last month</p>
          <div className="preview-line"><span /></div>
          <div className="preview-grid"><div><span>In this month</span><b>$5,100</b></div><div><span>Spent this month</span><b>$820</b></div><div><span>Safe today</span><b>$143</b></div></div>
          <div className="preview-signal"><span className="preview-signal-icon"><Sparkles size={15} /></span><div><b>Your pace is steady</b><p>Food is your top category this month.</p></div></div>
        </div>
      </section>

      <section id="how" className="landing-section">
        <div className="landing-section-head"><p className="eyebrow">The useful part</p><h2>Less noise between you and the number.</h2></div>
        <div className="landing-steps"><article><span>01</span><BarChart3 size={22} /><h3>Bring it together</h3><p>Add entries manually or import a CSV. Your ledger becomes the source of truth.</p></article><article><span>02</span><TrendingUp size={22} /><h3>See the pattern</h3><p>Flow, budgets, pace, and signals turn a list of transactions into context.</p></article><article><span>03</span><CircleDollarSign size={22} /><h3>Choose with confidence</h3><p>Check a purchase, protect a goal, or simply know what is safe today.</p></article></div>
      </section>

      <section className="landing-section landing-feature-section"><div className="landing-section-head"><p className="eyebrow">Built for the moment before the decision</p><h2>Practical intelligence, without the financial theatre.</h2></div><div className="landing-feature-grid"><article><Sparkles size={21} /><h3>Signals that explain themselves</h3><p>Recurring costs, unusual activity, and forecasts arrive as plain-language notes, not charts you need to decode.</p></article><article><ShieldCheck size={21} /><h3>Private by default</h3><p>Your Firebase identity secures the app. FlowAI only sees the entries you choose to keep in your ledger.</p></article><article><CircleDollarSign size={21} /><h3>A plan you can afford</h3><p>Start free with the core tools. Upgrade when recurring costs, goals, and forecasts become worth the extra clarity.</p></article></div></section>

      <section id="pricing" className="landing-section pricing-section"><div className="landing-section-head"><p className="eyebrow">Simple pricing</p><h2>Start free. Pay for better decisions.</h2></div><div className="pricing-grid">{Object.entries(plans).map(([key, plan]) => <article key={key} className={`pricing-card ${key === 'pro' ? 'pricing-featured' : ''}`}><div className="pricing-card-head"><h3>{plan.name}</h3>{key === 'pro' && <span>For serious clarity</span>}</div><p>{plan.description}</p><strong>{key === 'free' ? 'Free' : `$${plan.price}`}<small>{key === 'pro' ? '/month' : ''}</small></strong><Link to="/register" className={key === 'pro' ? 'button-primary' : 'button-secondary'}>{key === 'pro' ? 'Try Pro when ready' : 'Start free'} <ArrowRight size={15} /></Link><ul>{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul></article>)}</div></section>

      <section id="faq" className="landing-section faq-section"><div className="landing-section-head"><p className="eyebrow">Questions, answered</p><h2>A little clarity before you begin.</h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <div key={question} className="faq-item"><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>{question}</span><ChevronDown size={17} className={openFaq === index ? 'rotate-180' : ''} /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></section>

      <section className="landing-final"><p className="eyebrow">Your money, in plain view</p><h2>Make room for the month ahead.</h2><Link to="/register" className="button-primary">Create your free view <ArrowRight size={16} /></Link></section>
      <footer className="landing-footer"><span>FlowAI</span><span>Private financial clarity for everyday decisions.</span><span>© 2026 FlowAI</span></footer>
    </main>
  );
};

export default Landing;
