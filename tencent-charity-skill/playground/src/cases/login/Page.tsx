import React, { useState } from 'react';
import '../../browser-shell.css';
import './style.css';

export default function Page() {
  const [activeTab, setActiveTab] = useState('sms');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);

  const tabs = [
    { id: 'sms', label: '短信登录' },
    { id: 'wechat', label: '微信登录' },
    { id: 'qq', label: 'QQ登录' },
    { id: 'wxwork', label: '企业微信登录' },
  ];

  const handleLogin = () => {
    if (!agreed) {
      alert('请先阅读并同意服务协议');
      return;
    }
    alert('登录成功！');
  };

  return (
    <div className="browser-frame">
      <div className="browser-toolbar">
        <div className="browser-dots">
          <span className="dot-red"></span>
          <span className="dot-yellow"></span>
          <span className="dot-green"></span>
        </div>
        <div className="browser-address">charity-admin.tencent.com/login</div>
      </div>
      <div className="browser-screen">
        <div className="login-bg">
          <img src="https://ssv-design.ssv.tencent.com/tencent-charity/assets/login-bg.png" alt="" />
        </div>
        <div className="login-header">
          <span className="platform-name">公益补贴管理系统</span>
        </div>
        <div className="login-card"></div>
        <div className="login-form">
          <h1 className="login-title">欢迎登录</h1>
          <div className="login-tabs">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`login-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <div className="tab-line"></div>
              </div>
            ))}
          </div>
          <div className="form-fields">
            <div className="input-field">
              <div className="icon">
                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="1" width="10" height="16" rx="2" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2"/>
                  <line x1="7" y1="15" x2="11" y2="15" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="请输入手机号"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="code-row">
              <div className="input-field">
                <input
                  type="text"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
              <button className="code-btn">发送验证码</button>
            </div>
          </div>
        </div>
        <div className="login-bottom">
          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span>阅读并同意<a href="#">《公益补贴管理系统服务协议》</a></span>
          </div>
          <button className="login-btn" onClick={handleLogin}>登录</button>
          <div className="footer-links">
            <span className="gray">忘记密码了?</span>
            <span className="dark">找回帐号</span>
          </div>
        </div>
        <div className="copyright">Copyright @ 2021-2024 Tencent. All Rights Reserved</div>
      </div>
    </div>
  );
}
