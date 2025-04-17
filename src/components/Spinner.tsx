interface SpinnerProps {
    type: string;
  }


  const Spinner: React.FC<SpinnerProps> = ({ type }) => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading {type}...</p>
        </div>
    );
  };
  
  export default Spinner;