function WrapperTableTourGuide({ children }) {
  return (
    <div className="wrapperTableContainerTourguide">
      <div
        className="wrapperTableTourguide"
        style={{ borderRadius: "5px 5px 5px 5px" }}
      >
        {children}
      </div>
    </div>
  );
}

export default WrapperTableTourGuide;
