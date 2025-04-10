import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="p-4 flex-grow-1">
        <h2>Dashboard</h2>
        <p>Welcome to the tech management dashboard.</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/create-currency')}
        >
          Create Currency
        </button>
        {/* Later: render <CurrencyList /> here */}
      </div>
    </div>
  );
};

export default Dashboard;
