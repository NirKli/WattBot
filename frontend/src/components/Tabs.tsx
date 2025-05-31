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
  const tabStorageKey = 'wattbot-active-tab';
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(tabStorageKey);
    return saved !== null ? parseInt(saved, 10) : defaultTab;
  });
  const [indicatorStyle, setIndicatorStyle] = useState({ left: '0px', width: '0px' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Update indicator on tab change and persist active tab
  useEffect(() => {
    updateIndicator();
    localStorage.setItem(tabStorageKey, String(activeTab));
    // Scroll active tab into view on mobile
    if (isMobile && tabsContainerRef.current && tabsRef.current[activeTab]) {
      const container = tabsContainerRef.current;
      const activeTabElement = tabsRef.current[activeTab];
      if (activeTabElement) {
        const tabLeft = activeTabElement.offsetLeft;
        const tabWidth = activeTabElement.offsetWidth;
        const containerWidth = container.offsetWidth;
        // Center the tab in the container
        const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
        // Smooth scroll to the tab
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab, isMobile]);
  
  // Update indicator on resize and check if mobile
  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update indicator once tabs are rendered
  useEffect(() => {
    updateIndicator();
  }, [tabs.length]);
  
  // Update indicator on tab bar scroll (fixes mobile marker bug)
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      updateIndicator();
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeTab, isMobile]);
  
  return (
    <div className={`tabs-container ${className}`}>
      <div 
        ref={tabsContainerRef}
        className="tabs-header-container"
      >
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
                {tabElement.props.icon && (
                  <span className="tab-icon">
                    {tabElement.props.icon}
                  </span>
                )}
                <span className="tab-label">
                  {tabElement.props.label}
                </span>
              </button>
            );
          })}
          <div 
            className="tab-indicator" 
            style={indicatorStyle}
          />
        </div>
      </div>
      <div className="tab-content">
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default Tabs; 