import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cases } from './cases/registry';

export default function CaseViewer() {
  const { caseId } = useParams<{ caseId: string }>();
  const caseItem = cases.find((c) => c.caseId === caseId);

  if (!caseItem) {
    return (
      <div className="viewer__error">
        <h2>案例未找到: {caseId}</h2>
        <Link to="/">← 返回首页</Link>
      </div>
    );
  }

  const CaseComponent = caseItem.component;

  return (
    <div className="viewer">
      <nav className="viewer__nav">
        <Link to="/">← 返回列表</Link>
        <span className="viewer__title">{caseItem.displayName}</span>
        <span className="viewer__type">{caseItem.type}</span>
      </nav>
      <main className="viewer__content">
        <Suspense fallback={<div className="viewer__loading">加载中...</div>}>
          <CaseComponent />
        </Suspense>
      </main>
    </div>
  );
}
