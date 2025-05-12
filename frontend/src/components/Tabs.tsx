import React, { useState, useRef, useEffect } from 'react';

interface TabProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <div className="tab-panel">{children}</div>;
};

interface TabsProps {
  children: React.ReactNode;
  defaultTab?: number;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ children, defaultTab = 0, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: '0px', width: '0px' });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  // Extract tab labels from children
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Tab
  );
  
  // Update indicator position when active tab changes or on resize
  const updateIndicator = () => {
    const currentTab = tabsRef.current[activeTab];
    if (currentTab) {
      setIndicatorStyle({
        left: `${currentTab.offsetLeft}px`,
        width: `${currentTab.offsetWidth}px`
      });
    }
  };
  
  // Update indicator on tab change
  useEffect(() => {
    updateIndicator();
  }, [activeTab]);
  
  // Update indicator on resize
  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update indicator once tabs are rendered
  useEffect(() => {
    updateIndicator();
  }, [tabs.length]);
  
  return (
    <div className={`tabs-container ${className}`}>
      <div className="tabs-header">
        {tabs.map((tab, index) => {
          const tabElement = tab as React.ReactElement<TabProps>;
          return (
            <button
              key={index}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
              aria-selected={activeTab === index}
              role="tab"
            >
              {tabElement.props.icon && <span className="tab-icon">{tabElement.props.icon}</span>}
              <span className="tab-label">{tabElement.props.label}</span>
            </button>
          );
        })}
        <div 
          className="tab-indicator" 
          style={indicatorStyle}
        />
      </div>
      <div className="tab-content">
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default Tabs; 