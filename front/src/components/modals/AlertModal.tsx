import { Toast, ToastContainer } from 'react-bootstrap';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertToastProps {
  show: boolean;
  title: string;
  message: string;
  type: AlertType;
  onClose: () => void;
}

const AlertToast = ({ show, title, message, type, onClose }: AlertToastProps) => {
  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const variant = getVariant();
  const isDarkBg = variant === 'success' || variant === 'danger';
  const textClass = isDarkBg ? 'text-white' : '';

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast show={show} onClose={onClose} bg={variant} delay={3000} autohide>
        <Toast.Header closeButtonVariant={isDarkBg ? 'white' : undefined} className="bg-transparent border-0">
          <strong className={`me-auto ${textClass}`}>{title}</strong>
        </Toast.Header>
        <Toast.Body className={textClass}>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export { AlertToast as AlertModal };
