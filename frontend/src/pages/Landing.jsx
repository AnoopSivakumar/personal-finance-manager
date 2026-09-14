import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const highlights = [
  { number: '01', title: 'See the whole picture', text: 'Bring income, spending, and balance into one calm view.' },
  { number: '02', title: 'Make every rupee count', text: 'Categorize transactions quickly and spot patterns as they happen.' },
  { number: '03', title: 'Stay in control', text: 'Your private account keeps your financial history close at hand.' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen overflow-hidden text-slate-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#173c35] text-lg text-[#d9f36b]">₹</span>
          <span>Finance Manager</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <Link to="/dashboard" className="rounded-full bg-[#173c35] px-5 py-2.5 font-medium text-white transition hover:bg-[#24584e]">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 font-medium text-slate-600 transition hover:text-[#173c35]">Sign in</Link>
              <Link to="/register" className="rounded-full bg-[#173c35] px-5 py-2.5 font-medium text-white transition hover:bg-[#24584e]">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div className="max-w-xl">
          <p className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b56a35]">
            <span className="h-2 w-2 rounded-full bg-[#d9f36b]" /> A clearer way to manage money
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[#173c35] sm:text-6xl lg:text-7xl">
            Make room for what matters.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">
            Finance Manager gives your everyday money a simple home, so you can spend with intention and plan with confidence.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to={user ? '/dashboard' : '/register'} className="rounded-full bg-[#d9f36b] px-6 py-3.5 font-semibold text-[#173c35] shadow-sm transition hover:bg-[#c8e45b]">
              {user ? 'Go to dashboard' : 'Create your account'}
            </Link>
            <a href="#how-it-works" className="font-medium text-[#173c35] underline decoration-[#b56a35] decoration-2 underline-offset-4">How it works</a>
          </div>
          <div className="mt-12 flex items-center gap-5 border-t border-[#d9d7cf] pt-5 text-sm text-slate-500">
            <span className="font-medium text-[#173c35]">Private by design</span>
            <span className="h-1 w-1 rounded-full bg-[#b56a35]" />
            <span>Built for everyday decisions</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#d9f36b] sm:h-44 sm:w-44" />
          <div className="relative rounded-[2rem] bg-[#173c35] p-5 shadow-2xl shadow-[#173c35]/20 sm:p-7">
            <div className="flex items-start justify-between text-white">
              <div>
                <p className="text-sm text-[#b5c9c0]">Your balance</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">₹24,680</p>
              </div>
              <span className="rounded-full bg-[#d9f36b] px-3 py-1 text-xs font-bold text-[#173c35]">+12.4%</span>
            </div>
            <div className="mt-8 flex h-36 items-end gap-2 border-b border-white/15 pb-0">
              {[38, 56, 46, 72, 61, 84, 76, 100, 91, 112, 104, 126].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-md bg-[#d9f36b] opacity-80" style={{ height: `${height}px` }} />
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {[
                ['Salary', '+₹42,000', 'Today'],
                ['Groceries', '-₹1,280', 'Yesterday'],
                ['Transport', '-₹460', 'Mon, 12 May'],
              ].map(([name, amount, date]) => (
                <div key={name} className="flex items-center justify-between border-b border-white/10 pb-3 text-sm last:border-0 last:pb-0">
                  <div><p className="font-medium text-white">{name}</p><p className="text-xs text-[#91aaa1]">{date}</p></div>
                  <span className={amount.startsWith('+') ? 'font-semibold text-[#d9f36b]' : 'font-medium text-[#f5c5a2]'}>{amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-2xl bg-[#f2a56e] px-4 py-3 text-sm font-semibold text-[#173c35] shadow-lg sm:-left-8">
            Spend smarter,
            <br />feel lighter.
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#dedbd2] bg-[#eeece4]">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b56a35]">A better money habit</p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-[#173c35] sm:text-4xl">Simple enough to use every day.</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-500">Less time wrestling with spreadsheets. More time making decisions that feel good.</p>
          </div>
          <div className="grid gap-8 border-t border-[#d3d0c7] pt-8 md:grid-cols-3">
            {highlights.map((highlight) => (
              <article key={highlight.number}>
                <p className="text-sm font-bold text-[#b56a35]">{highlight.number}</p>
                <h3 className="mt-5 text-xl font-semibold text-[#173c35]">{highlight.title}</h3>
                <p className="mt-3 max-w-xs leading-7 text-slate-600">{highlight.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span className="font-medium text-[#173c35]">Finance Manager</span>
        <span>Small steps. Clearer days.</span>
      </footer>
    </main>
  );
}
