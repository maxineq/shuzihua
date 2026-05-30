import React from 'react';
import { Link } from 'react-router-dom';
import { cases } from './cases/registry';

export default function Home() {
  return (
    <div className="home">
      <header className="home__header">
        <h1>腾讯公益机构平台 - 设计预览</h1>
        <p>所有设计案例的实时预览入口</p>
      </header>
      <main className="home__grid">
        {cases.length === 0 ? (
          <div className="home__empty">
            <p>暂无设计案例</p>
            <p className="home__hint">AI 生成新界面后，案例会自动出现在这里</p>
          </div>
        ) : (
          cases.map((c) => (
            <Link key={c.caseId} to={`/case/${c.caseId}`} className="case-card">
              <h3>{c.displayName}</h3>
              <p>{c.description}</p>
              <span className="case-card__type">{c.type}</span>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
