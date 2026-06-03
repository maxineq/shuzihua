import React from 'react';
import '../../browser-shell.css';

export default function Page() {
  return (
    <div className="browser-frame">
      <div className="browser-toolbar">
        <div className="browser-dots">
          <span className="dot-red"></span>
          <span className="dot-yellow"></span>
          <span className="dot-green"></span>
        </div>
        <div className="browser-address">charity-admin.tencent.com/audit/detail</div>
      </div>
      <div className="browser-screen">
        <iframe
          src="/src/cases/audit-detail/index.html"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="审核详情"
        />
      </div>
    </div>
  );
}
