import React from 'react';
import { Mail } from 'lucide-react';
import { MailBuilder } from '../components/builder/MailBuilder';

export const TemplatesPage: React.FC = () => {
  return (
    <section id="templates" className="page active">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="breadcrumb">
            <Mail style={{ width: 12, height: 12 }} /> Mail Builder
          </p>
          <h1 className="page-title">Mail Builder</h1>
          <p className="page-description">Design responsive HTML emails with live block component state.</p>
        </div>
      </div>

      <MailBuilder />
    </section>
  );
};
