import { useEffect, useRef } from 'react';

const ResultsDisplay = ({ results, user }) => {
  const resultsRef = useRef(null);

  useEffect(() => {
    if (results && resultsRef.current) {
      // Animate bar fills and score boxes after component mounts
      setTimeout(() => {
        const barFills = resultsRef.current.querySelectorAll('.bar-fill');
        const scoreBoxes = resultsRef.current.querySelectorAll('.score-box');
        
        barFills.forEach(el => {
          const width = el.dataset.w;
          if (width) el.style.width = width + '%';
        });
        
        scoreBoxes.forEach(el => {
          el.classList.add('anim');
        });
      }, 150);
    }
  }, [results]);

  if (!results) return null;

  const now = new Date();
  const dateStr = now.toDateString() + ' ' + now.toLocaleTimeString();

  // Map backend response to the expected format
  const rawScores = {
    SA: Math.round(results.self_awareness * 10) / 10, // Convert to 0-10 scale
    SM: Math.round(results.self_management * 10) / 10,
    OA: Math.round(results.social_awareness * 10) / 10,
    RM: Math.round(results.relationship_management * 10) / 10,
  };

  // Cap scores at 10 for display, but keep actual values for calculation
  const displayScores = {
    SA: rawScores.SA >= 10 ? 10 : rawScores.SA,
    SM: rawScores.SM >= 10 ? 10 : rawScores.SM,
    OA: rawScores.OA >= 10 ? 10 : rawScores.OA,
    RM: rawScores.RM >= 10 ? 10 : rawScores.RM,
  };

  return (
    <div id="results" ref={resultsRef} style={{ display: 'block' }}>
      <div className="res-header">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: '14px' }}>
          <div className="brand-dot"></div>
          <span className="brand-name">Elif Healthcare</span>
        </div>
        <h2>Discover Your Level of <em>EI</em></h2>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontWeight: '300', marginBottom: '8px' }}>
          Emotional Intelligence Test Results
        </div>
        <div className="res-date">Version 1.0 &nbsp;·&nbsp; Test Date: {dateStr}</div>
        <p className="res-intro">
          The following numerical scores are calculated from your answers to the EI test.
          If you have answered honestly and accurately, your scores,
          <strong>out of 10 for each quadrant</strong>, will reflect your capability level
          within each of the EI quadrants.
          <br /><em style={{ fontSize: '12px' }}>(You may want to note these results - they are not saved anywhere.)</em>
        </p>
      </div>

      <div className="terrific-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        You have answered all the questions - terrific!
      </div>

      {/* 4 score boxes (main result, same as original) */}
      <div className="score-boxes">
        <div className="score-box c1" id="bx1">
          <div className="box-num">{displayScores.SA}</div>
          <div className="box-name">Self-Awareness</div>
          <div className="box-max">out of 10</div>
        </div>
        <div className="score-box c2" id="bx2">
          <div className="box-num">{displayScores.SM}</div>
          <div className="box-name">Self-Management</div>
          <div className="box-max">out of 10</div>
        </div>
        <div className="score-box c3" id="bx3">
          <div className="box-num">{displayScores.OA}</div>
          <div className="box-name">Social Awareness</div>
          <div className="box-max">out of 10</div>
        </div>
        <div className="score-box c4" id="bx4">
          <div className="box-num">{displayScores.RM}</div>
          <div className="box-name">Relationship Management</div>
          <div className="box-max">out of 10</div>
        </div>
      </div>

      {/* Visual bar chart */}
      <div className="bars" style={{ marginTop: '24px' }}>
        {[
          { k: 'SA', l: 'Self-Awareness', c: 'c1', v: displayScores.SA },
          { k: 'SM', l: 'Self-Management', c: 'c2', v: displayScores.SM },
          { k: 'OA', l: 'Social Awareness', c: 'c3', v: displayScores.OA },
          { k: 'RM', l: 'Relationship Management', c: 'c4', v: displayScores.RM },
        ].map((row, index) => (
          <div className="bar-row" key={index}>
            <div className="bar-lbl">{row.l}</div>
            <div className="bar-track">
              <div className={`bar-fill ${row.c}`} data-w={row.v * 10}></div>
            </div>
            <div className="bar-val">{row.v} / 10</div>
          </div>
        ))}
      </div>

      <div className="disclaimer">
        <em>Please remember that this Sampler is NOT scientifically validated. We cannot guarantee the accuracy of the results of this EI analysis - only that it can help you begin your journey of self-development.</em>
        <br /><br />
        For more information about Emotional Intelligence and how to use it for your personal growth, please contact <strong>Elif Healthcare</strong>.
      </div>

      <div className="retake-wrap">
        <button className="retake-btn" onClick={() => window.location.reload()}>
          <span>Retake Test</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
