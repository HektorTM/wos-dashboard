import { useNavigate } from 'react-router-dom';

interface ModalProps {
  onClose: () => void;
  type: string;
  id: string;
}

const ForwardPopup = ({ onClose, type, id }: ModalProps) => {
    const navigate = useNavigate();

  return (
    <div className="modal-overlay" >
      <div className="modal-container" style={{marginTop: '20rem'}}>
        <div className="modal-header">
          <h3>Forward to {id}?</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <button onClick={() => onClose()} className='btn btn-secondary'>Close</button>
          <button onClick={() => navigate(`/view/${type}/${id}`)} className='btn btn-outline-success'>Forward</button>
        </div>
      </div>
    </div>
  );
};

export default ForwardPopup;