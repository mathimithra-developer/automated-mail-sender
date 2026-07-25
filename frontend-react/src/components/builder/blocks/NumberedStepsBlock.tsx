import React from 'react';
import { NumberedStepsBlockData } from '../types';

export const NumberedStepsBlock: React.FC<{ block: NumberedStepsBlockData }> = ({ block }) => {
  const {
    steps = [
      { stepNumber: 1, title: 'Connect CSV Audience', description: 'Upload your recipient list file' },
      { stepNumber: 2, title: 'Customize Content', description: 'Use rich drag-and-drop elements' },
      { stepNumber: 3, title: 'Launch Campaign', description: 'Schedule or send instantly' },
    ],
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '8px 0', width: '100%', boxSizing: 'border-box' }}>
      {steps.map((st, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: accentColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {st.stepNumber || idx + 1}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{st.title}</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{st.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
