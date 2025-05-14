import React from "react";

const TabTransform = ({
  tabTransformTitleLeft,
  tabTransformTitleRight,
  activeTab,
  onTabSwitch,
}) => (
  <div className="tabTransformAdmin">
    <div className={`tabTransformLeft ${activeTab === "left" ? "active" : ""}`}>
      <button
        className="ffGTMedium clrDarkBlue fs-18"
        onClick={() => onTabSwitch("left")}
      >
        {tabTransformTitleLeft}
      </button>
    </div>
    <div
      className={`tabTransformRight ${activeTab === "right" ? "active" : ""}`}
    >
      <button
        className="ffGTMedium clrDarkBlue fs-18"
        onClick={() => onTabSwitch("right")}
      >
        {tabTransformTitleRight}
      </button>
    </div>
  </div>
);

const SelectDateTab = ({ onClick }) => (
  <div className="tabTransformAdmin selectDateContainerAdmin" onClick={onClick}>
    <div className="selectDateLeftAdmin">
      <span className="ffGTMedium clrWhite fs-16">Calendar</span>
    </div>
    <div className="selectDateRightAdmin">
      <i className="bx bx-calendar-event clrWhite"></i>
    </div>
  </div>
);

const FeedbackTab = ({ backLink, feedbackTitle }) => (
  <div className="tabTransformAdmin feedbackTabContainerAdmin">
    {backLink && (
      <div className="feedbackTabLeftAdmin">
        <a onClick={backLink}>
          <i className="bx bx-arrow-back clrWhite"></i>
        </a>
      </div>
    )}

    <div className="feedbackTabRightAdmin">
      <span className="ffGTMedium clrWhite fs-16">{feedbackTitle}</span>
    </div>
  </div>
);

function WrapperTable({
  children,
  hasTabTransform,
  tabTransformTitleLeft,
  tabTransformTitleRight,
  hasSelectDateTab,
  backLinkFeedback,
  hasFeedbackTab,
  feedbackTitle,
  onSelectDateClick,
  activeTab,
  onTabSwitch,
}) {
  return (
    <div className="wrapperTableContainerAdmin">
      {hasTabTransform && (
        <TabTransform
          tabTransformTitleLeft={tabTransformTitleLeft}
          tabTransformTitleRight={tabTransformTitleRight}
          activeTab={activeTab}
          onTabSwitch={onTabSwitch}
        />
      )}
      {hasSelectDateTab && <SelectDateTab onClick={onSelectDateClick} />}
      {hasFeedbackTab && (
        <FeedbackTab
          backLink={backLinkFeedback}
          feedbackTitle={feedbackTitle}
        />
      )}
      <div
        className="wrapperTableAdmin"
        style={{ borderRadius: hasTabTransform ? 5 : "0 5px 5px 5px" }}
      >
        {children}
      </div>
    </div>
  );
}

export default WrapperTable;
